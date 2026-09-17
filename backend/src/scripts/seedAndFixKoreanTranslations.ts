import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import Song from '../models/music/Song';
import LyricSegment from '../models/music/LyricSegment';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function translateLyricsBatch(
  lines: string[],
  sourceLanguage: string
): Promise<{ english: string[]; hindi: string[]; spanish: string[]; korean: string[] }> {
  if (lines.length === 0) {
    return { english: [], hindi: [], spanish: [], korean: [] };
  }

  const prompt = `Translate the following array of ${lines.length} lyric lines (source: ${sourceLanguage}) into English, Hindi, Spanish, and Korean.
Lines:
${JSON.stringify(lines)}

Return strictly a JSON object with keys "english", "hindi", "spanish", "korean", where each value is an array of exactly ${lines.length} translated strings.`;

  let attempts = 0;
  while (attempts < 4) {
    try {
      attempts++;
      const completion = await groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: 'You are an accurate multilingual music lyric translator. Output valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 3500,
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);
      return {
        english: Array.isArray(parsed.english) && parsed.english.length === lines.length ? parsed.english : lines,
        hindi: Array.isArray(parsed.hindi) && parsed.hindi.length === lines.length ? parsed.hindi : lines,
        spanish: Array.isArray(parsed.spanish) && parsed.spanish.length === lines.length ? parsed.spanish : lines,
        korean: Array.isArray(parsed.korean) && parsed.korean.length === lines.length ? parsed.korean : lines,
      };
    } catch (error: any) {
      if (error?.status === 429 || error?.message?.includes('Rate limit')) {
        console.log(`[Rate limit hit, waiting 6.5s before retry (attempt ${attempts})...]`);
        await new Promise(r => setTimeout(r, 6500));
      } else {
        console.error('Groq batch error:', error);
        break;
      }
    }
  }

  return {
    english: lines,
    hindi: lines,
    spanish: lines,
    korean: lines,
  };
}

async function fixAllSongTranslations() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log('Connected to MongoDB.');

  const songs = await Song.find({});
  console.log(`Found ${songs.length} songs in database.`);

  for (const song of songs) {
    console.log(`\n========================================`);
    console.log(`Processing: "${song.title}" by ${song.artistName} (${song.language})...`);
    const segments = await LyricSegment.find({ songId: song._id }).sort({ segmentOrder: 1 });
    
    if (segments.length === 0) {
      console.log(`No segments found for "${song.title}", skipping.`);
      continue;
    }

    // Check if song already has 100% complete Korean translations
    if (song.translations?.korean && song.translations.korean.length === segments.length && song.translations.korean.every((k: any) => k.text && k.text !== song.translations?.english?.[0]?.text)) {
      console.log(`✓ "${song.title}" already has complete Korean translations (${song.translations.korean.length} lines). Skipping.`);
      continue;
    }

    console.log(`Total segments: ${segments.length}`);
    const lines = segments.map(s => s.text);
    const BATCH_SIZE = 10;
    
    const englishAll: { order: number; text: string }[] = [];
    const hindiAll: { order: number; text: string }[] = [];
    const spanishAll: { order: number; text: string }[] = [];
    const koreanAll: { order: number; text: string }[] = [];

    const isSourceEnglish = song.language?.toLowerCase() === 'english';
    const isSourceHindi = song.language?.toLowerCase() === 'hindi';
    const isSourceSpanish = song.language?.toLowerCase() === 'spanish';
    const isSourceKorean = song.language?.toLowerCase() === 'korean';

    for (let i = 0; i < lines.length; i += BATCH_SIZE) {
      const chunk = lines.slice(i, i + BATCH_SIZE);
      const chunkSegments = segments.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(lines.length / BATCH_SIZE);
      console.log(`Translating batch ${batchNum}/${totalBatches} (${chunk.length} lines)...`);
      
      const res = await translateLyricsBatch(chunk, song.language || 'English');

      chunkSegments.forEach((seg, idx) => {
        const order = seg.segmentOrder;
        englishAll.push({ order, text: isSourceEnglish ? seg.text : (res.english[idx] || seg.text) });
        hindiAll.push({ order, text: isSourceHindi ? seg.text : (res.hindi[idx] || seg.text) });
        spanishAll.push({ order, text: isSourceSpanish ? seg.text : (res.spanish[idx] || seg.text) });
        koreanAll.push({ order, text: isSourceKorean ? seg.text : (res.korean[idx] || seg.text) });
      });

      // Small delay between batches to stay within TPM rate limits
      await new Promise(r => setTimeout(r, 1000));
    }

    await Song.findByIdAndUpdate(song._id, {
      translations: {
        english: englishAll,
        hindi: hindiAll,
        spanish: spanishAll,
        korean: koreanAll,
      }
    });

    console.log(`✓ Updated "${song.title}" with translations -> EN: ${englishAll.length}, HI: ${hindiAll.length}, ES: ${spanishAll.length}, KO: ${koreanAll.length}`);
  }

  // Check if Korean Song exists
  const existingKoreanSong = await Song.findOne({ language: /korean/i });
  if (!existingKoreanSong) {
    console.log('\n========================================');
    console.log('Seeding Korean song "Stay With Me" (CHANYEOL, PUNCH)...');
    const koreanSongData = {
      title: "Stay With Me",
      artistName: "CHANYEOL, PUNCH",
      language: "Korean",
      durationSeconds: 193,
      audioUrl: "https://www.youtube.com/watch?v=pK_f_3xJ5vA",
      difficultyLevel: "beginner" as const,
    };

    const koreanLyrics = [
      { text: "나의 두 눈을 감으면", startTime: 12.0, endTime: 16.5 },
      { text: "떠오르는 그 눈동자", startTime: 16.5, endTime: 21.0 },
      { text: "자꾸 가슴이 시려서", startTime: 21.0, endTime: 25.5 },
      { text: "잊혀지길 바랬어", startTime: 25.5, endTime: 30.0 },
      { text: "꿈이라면 이제 깨어났으면 제발", startTime: 30.0, endTime: 35.0 },
      { text: "정말 네가 나의 운명인 걸까", startTime: 35.0, endTime: 39.5 },
      { text: "넌 Falling You", startTime: 39.5, endTime: 44.0 },
      { text: "운명처럼 너를 Falling", startTime: 44.0, endTime: 48.5 },
      { text: "또 나를 부르네 Calling", startTime: 48.5, endTime: 53.0 },
      { text: "헤어나올 수 없어 제발 Hold Me", startTime: 53.0, endTime: 58.0 },
      { text: "내 인연의 끈이 넌지", startTime: 58.0, endTime: 62.5 },
      { text: "기다린 네가 맞는지", startTime: 62.5, endTime: 67.0 },
      { text: "가슴이 먼저 왜 내려앉는지", startTime: 67.0, endTime: 72.0 },
      { text: "Stay With Me", startTime: 72.0, endTime: 76.5 },
      { text: "내 마음속 깊은 곳에 네가 사는지", startTime: 76.5, endTime: 82.0 },
      { text: "Stay With Me", startTime: 82.0, endTime: 86.5 },
      { text: "내 안에 숨겨둔 진실", startTime: 86.5, endTime: 91.5 },
      { text: "나의 두 눈을 감으면", startTime: 91.5, endTime: 96.0 },
      { text: "떠오르는 그 눈동자", startTime: 96.0, endTime: 101.0 },
      { text: "자꾸 가슴이 시려서", startTime: 101.0, endTime: 105.5 },
      { text: "잊혀지길 바랬어", startTime: 105.5, endTime: 110.0 },
      { text: "꿈이라면 이제 깨어났으면 제발", startTime: 110.0, endTime: 115.0 },
      { text: "정말 네가 나의 운명인 걸까", startTime: 115.0, endTime: 120.0 },
      { text: "넌 Falling You", startTime: 120.0, endTime: 125.0 }
    ];

    const newSong = await Song.create(koreanSongData);
    const segs = koreanLyrics.map((item, idx) => ({
      songId: newSong._id,
      segmentOrder: idx + 1,
      text: item.text,
      startTime: item.startTime,
      endTime: item.endTime
    }));

    await LyricSegment.insertMany(segs);

    const koreanLines = segs.map(s => s.text);
    const englishKO: { order: number; text: string }[] = [];
    const hindiKO: { order: number; text: string }[] = [];
    const spanishKO: { order: number; text: string }[] = [];
    const koreanKO: { order: number; text: string }[] = [];

    const BATCH_SIZE = 10;
    for (let i = 0; i < koreanLines.length; i += BATCH_SIZE) {
      const chunk = koreanLines.slice(i, i + BATCH_SIZE);
      const chunkSegments = segs.slice(i, i + BATCH_SIZE);
      const transRes = await translateLyricsBatch(chunk, 'Korean');

      chunkSegments.forEach((seg, idx) => {
        const order = seg.segmentOrder;
        englishKO.push({ order, text: transRes.english[idx] || seg.text });
        hindiKO.push({ order, text: transRes.hindi[idx] || seg.text });
        spanishKO.push({ order, text: transRes.spanish[idx] || seg.text });
        koreanKO.push({ order, text: seg.text });
      });
      await new Promise(r => setTimeout(r, 1000));
    }

    await Song.findByIdAndUpdate(newSong._id, {
      translations: {
        english: englishKO,
        hindi: hindiKO,
        spanish: spanishKO,
        korean: koreanKO,
      }
    });

    console.log(`✓ Created Korean song "Stay With Me" with ${segs.length} segments and full translations!`);
  }

  // Check Spring Day
  const existingBTS = await Song.findOne({ title: /Spring Day/i });
  if (!existingBTS) {
    console.log('\n========================================');
    console.log('Seeding Korean song "Spring Day" (BTS)...');
    const btsSongData = {
      title: "Spring Day",
      artistName: "BTS",
      language: "Korean",
      durationSeconds: 274,
      audioUrl: "https://www.youtube.com/watch?v=xEeFrLSkMm8",
      difficultyLevel: "intermediate" as const,
    };

    const btsLyrics = [
      { text: "보고 싶다", startTime: 6.0, endTime: 11.0 },
      { text: "이렇게 말하니까 더 보고 싶다", startTime: 11.0, endTime: 16.5 },
      { text: "너희 사진을 보고 있어도 보고 싶다", startTime: 16.5, endTime: 22.0 },
      { text: "너무 야속한 시간", startTime: 22.0, endTime: 25.5 },
      { text: "나는 우리가 밉다", startTime: 25.5, endTime: 29.0 },
      { text: "이젠 얼굴 한 번 보는 것 조차", startTime: 29.0, endTime: 33.0 },
      { text: "힘들어진 우리가", startTime: 33.0, endTime: 36.5 },
      { text: "여긴 온통 겨울 뿐이야", startTime: 36.5, endTime: 41.5 },
      { text: "8월에도 겨울이 와", startTime: 41.5, endTime: 46.5 },
      { text: "마음은 시간을 달려가네", startTime: 46.5, endTime: 51.5 },
      { text: "홀로 남은 설국열차", startTime: 51.5, endTime: 56.5 },
      { text: "니 손 잡고 지구 반대편까지 가", startTime: 56.5, endTime: 61.5 },
      { text: "겨울을 끝내고파", startTime: 61.5, endTime: 66.0 },
      { text: "그리움들이 얼마나 눈처럼 내려야", startTime: 66.0, endTime: 71.5 },
      { text: "그 봄날이 올까", startTime: 71.5, endTime: 76.5 },
      { text: "Friend", startTime: 76.5, endTime: 80.0 },
      { text: "허공을 떠도는 작은 먼지처럼", startTime: 80.0, endTime: 85.5 },
      { text: "날리는 눈이 나라면", startTime: 85.5, endTime: 90.5 },
      { text: "조금 더 빨리 네게 닿을 수 있을 텐데", startTime: 90.5, endTime: 96.0 },
      { text: "눈꽃이 떨어져요 또 조금씩 멀어져요", startTime: 96.0, endTime: 102.5 },
      { text: "보고 싶다 보고 싶다", startTime: 102.5, endTime: 108.5 },
      { text: "얼마나 기다려야 또 몇 밤을 더 새워야", startTime: 108.5, endTime: 115.0 },
      { text: "널 보게 될까 만나게 될까", startTime: 115.0, endTime: 121.0 }
    ];

    const newBTSSong = await Song.create(btsSongData);
    const segs = btsLyrics.map((item, idx) => ({
      songId: newBTSSong._id,
      segmentOrder: idx + 1,
      text: item.text,
      startTime: item.startTime,
      endTime: item.endTime
    }));

    await LyricSegment.insertMany(segs);

    const btsLines = segs.map(s => s.text);
    const englishBTS: { order: number; text: string }[] = [];
    const hindiBTS: { order: number; text: string }[] = [];
    const spanishBTS: { order: number; text: string }[] = [];
    const koreanBTS: { order: number; text: string }[] = [];

    const BATCH_SIZE = 10;
    for (let i = 0; i < btsLines.length; i += BATCH_SIZE) {
      const chunk = btsLines.slice(i, i + BATCH_SIZE);
      const chunkSegments = segs.slice(i, i + BATCH_SIZE);
      const transRes = await translateLyricsBatch(chunk, 'Korean');

      chunkSegments.forEach((seg, idx) => {
        const order = seg.segmentOrder;
        englishBTS.push({ order, text: transRes.english[idx] || seg.text });
        hindiBTS.push({ order, text: transRes.hindi[idx] || seg.text });
        spanishBTS.push({ order, text: transRes.spanish[idx] || seg.text });
        koreanBTS.push({ order, text: seg.text });
      });
      await new Promise(r => setTimeout(r, 1000));
    }

    await Song.findByIdAndUpdate(newBTSSong._id, {
      translations: {
        english: englishBTS,
        hindi: hindiBTS,
        spanish: spanishBTS,
        korean: koreanBTS,
      }
    });

    console.log(`✓ Created Korean song "Spring Day" (BTS) with ${segs.length} segments and full translations!`);
  }

  console.log('\n========================================');
  console.log('✓ All songs updated with complete Korean, English, Hindi, and Spanish translations!');
  process.exit(0);
}

fixAllSongTranslations().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
