import Groq from "groq-sdk";
import axios from "axios";

const getLanguageCode = (lang: string): string => {
  const mapping: { [key: string]: string } = {
    english: "en",
    korean: "ko",
    spanish: "es",
    french: "fr",
    hindi: "hi",
    japanese: "ja",
    german: "de",
    italian: "it"
  };
  return mapping[lang.toLowerCase()] || "auto";
};

// Fallback single line translation via Google Translate single API
async function fallbackTranslate(text: string, sourceLang: string, targetLangCode: string): Promise<string> {
  try {
    const srcCode = getLanguageCode(sourceLang);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${srcCode}&tl=${targetLangCode}&dt=t&q=${encodeURI(text)}`;
    const res = await axios.get(url, { timeout: 4000 });
    if (res.data && res.data[0] && res.data[0][0] && res.data[0][0][0]) {
      return res.data[0][0][0];
    }
  } catch (err: any) {
    // Return original text if fallback fails
  }
  return text;
}

export function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim();
}

export async function generateLyricsForSong(
  title: string,
  artist: string,
  language: string
): Promise<string[]> {
  if (!process.env.GROQ_API_KEY) return [];
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const prompt = `Provide the sequential lyric lines for the song "${title}" by "${artist}" in its original language (${language}).
Return between 12 to 24 sequential lyric lines.
Return strictly a JSON object with a single key "lines" which is an array of strings. Each string must be a single lyric line.
Example:
{
  "lines": ["Line 1", "Line 2", "Line 3"]
}`;

    const models = [
      process.env.GROQ_MODEL,
      "llama-3.1-8b-instant",
      "llama-3.3-70b-versatile",
      "llama3-70b-8192",
      "mixtral-8x7b-32768"
    ].filter(Boolean) as string[];

    for (const modelToUse of models) {
      try {
        const completion = await groq.chat.completions.create({
          model: modelToUse,
          messages: [
            { role: 'system', content: 'You are an accurate music lyric database. Output valid JSON only with exact lyrics.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 2500,
          temperature: 0.2
        });

        const content = completion.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.lines) && parsed.lines.length > 0) {
          return parsed.lines.map((l: any) => decodeHtmlEntities(String(l).trim())).filter(Boolean);
        }
      } catch (err: any) {
        // Try next model silently
      }
    }
  } catch (err: any) {
    console.warn("AI lyric generation fallback warning:", err.message);
  }
  return [];
}

export async function translateLyricsWithAI(
  segments: { segmentOrder: number; text: string }[],
  sourceLanguage: string
): Promise<{
  english: { order: number; text: string }[];
  hindi: { order: number; text: string }[];
  spanish: { order: number; text: string }[];
  korean: { order: number; text: string }[];
}> {
  const isSourceEnglish = sourceLanguage.toLowerCase() === 'english';
  const isSourceHindi = sourceLanguage.toLowerCase() === 'hindi';
  const isSourceSpanish = sourceLanguage.toLowerCase() === 'spanish';
  const isSourceKorean = sourceLanguage.toLowerCase() === 'korean';

  const english: { order: number; text: string }[] = [];
  const hindi: { order: number; text: string }[] = [];
  const spanish: { order: number; text: string }[] = [];
  const korean: { order: number; text: string }[] = [];

  const lines = segments.map(s => s.text);
  const BATCH_SIZE = 10;

  let groq: Groq | null = null;
  if (process.env.GROQ_API_KEY) {
    try {
      groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    } catch (e) {
      console.warn("Could not initialize Groq client:", e);
    }
  }

  for (let i = 0; i < lines.length; i += BATCH_SIZE) {
    const chunk = lines.slice(i, i + BATCH_SIZE);
    const chunkSegments = segments.slice(i, i + BATCH_SIZE);
    let batchEnglish = chunk;
    let batchHindi = chunk;
    let batchSpanish = chunk;
    let batchKorean = chunk;

    if (groq) {
      let attempts = 0;
      let success = false;
      while (attempts < 3 && !success) {
        try {
          attempts++;
          const prompt = `Translate the following ${chunk.length} lyric lines (source: ${sourceLanguage}) into English, Hindi, Spanish, and Korean.
Lines:
${JSON.stringify(chunk)}

Return strictly a JSON object with keys "english", "hindi", "spanish", "korean", where each value is an array of exactly ${chunk.length} translated strings.`;

          const models = [
            process.env.GROQ_MODEL,
            "llama-3.1-8b-instant",
            "llama-3.3-70b-versatile",
            "llama3-70b-8192",
            "mixtral-8x7b-32768"
          ].filter(Boolean) as string[];

          for (const modelToUse of models) {
            try {
              const completion = await groq.chat.completions.create({
                model: modelToUse,
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

              if (Array.isArray(parsed.english) && parsed.english.length === chunk.length) batchEnglish = parsed.english;
              if (Array.isArray(parsed.hindi) && parsed.hindi.length === chunk.length) batchHindi = parsed.hindi;
              if (Array.isArray(parsed.spanish) && parsed.spanish.length === chunk.length) batchSpanish = parsed.spanish;
              if (Array.isArray(parsed.korean) && parsed.korean.length === chunk.length) batchKorean = parsed.korean;
              success = true;
              break;
            } catch (err: any) {
              if (err?.status === 429 || err?.message?.includes('Rate limit')) {
                console.log('Rate limited on Groq, waiting 6 seconds before retry...');
                await new Promise(r => setTimeout(r, 6500));
              }
            }
          }
      }
    } else {
      // Parallel fallback translation if groq is missing
      const enP = chunk.map(t => isSourceEnglish ? Promise.resolve(t) : fallbackTranslate(t, sourceLanguage, 'en'));
      const hiP = chunk.map(t => isSourceHindi ? Promise.resolve(t) : fallbackTranslate(t, sourceLanguage, 'hi'));
      const esP = chunk.map(t => isSourceSpanish ? Promise.resolve(t) : fallbackTranslate(t, sourceLanguage, 'es'));
      const koP = chunk.map(t => isSourceKorean ? Promise.resolve(t) : fallbackTranslate(t, sourceLanguage, 'ko'));

      batchEnglish = await Promise.all(enP);
      batchHindi = await Promise.all(hiP);
      batchSpanish = await Promise.all(esP);
      batchKorean = await Promise.all(koP);
    }

    chunkSegments.forEach((seg, idx) => {
      const order = seg.segmentOrder;
      english.push({ order, text: isSourceEnglish ? seg.text : (batchEnglish[idx] || seg.text) });
      hindi.push({ order, text: isSourceHindi ? seg.text : (batchHindi[idx] || seg.text) });
      spanish.push({ order, text: isSourceSpanish ? seg.text : (batchSpanish[idx] || seg.text) });
      korean.push({ order, text: isSourceKorean ? seg.text : (batchKorean[idx] || seg.text) });
    });

    if (groq) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  return { english, hindi, spanish, korean };
}
