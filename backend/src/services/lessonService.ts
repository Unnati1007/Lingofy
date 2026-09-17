import Groq from "groq-sdk";

async function callGroq(prompt: string): Promise<string> {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: "You are a language quiz generator for a music app.\nCRITICAL RULE: Every single generation must be completely different from previous ones. Never repeat the same words, phrases, or questions. Always pick different vocabulary.\nAlways respond with valid JSON only. No markdown, no backticks, no preamble. Just raw JSON."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 1.0,
    top_p: 0.9,
    frequency_penalty: 0.8,
    presence_penalty: 0.6,
    max_tokens: 2000,
  });
  return completion.choices[0].message.content ?? "";
}

async function generateWithRetry(prompt: string) {
  const sanitizeData = (data: any) => {
    if (data.questions && Array.isArray(data.questions)) {
      data.questions.forEach((q: any) => {
        if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
          q.options = ["Option A", "Option B", "Option C", "Option D"];
        }
        if (!q.correctAnswer || typeof q.correctAnswer !== 'string' || q.correctAnswer.trim() === '') {
          q.correctAnswer = q.options[0];
        }
      });
    }
    return data;
  };

  try {
    const raw = await callGroq(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return sanitizeData(JSON.parse(cleaned));
  } catch (err) {
    // retry once on failure
    try {
      const raw = await callGroq(prompt);
      const cleaned = raw.replace(/```json|```/g, "").trim();
      return sanitizeData(JSON.parse(cleaned));
    } catch {
      throw new Error("Quiz generation failed. Please try again.");
    }
  }
}

function getRandomTopics(language: "hindi" | "spanish" | "korean"): string {
  const categories = [
    "Greetings and basic conversation phrases",
    "Family members and relationships", 
    "Food, drinks, and restaurant vocabulary",
    "Colors, sizes, and describing things",
    "Daily action verbs (eat, sleep, walk, talk)",
    "Emotions and feelings",
    "Places in a city and directions",
    "Shopping and asking for prices",
    "Numbers, days, and time expressions",
    "Common phrases used in songs and music lyrics"
  ];
  const shuffled = categories.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).join(" + ");
}

function getRandomDifficulty(): string {
  const extras = [
    "Focus on informal everyday speech.",
    "Focus on formal polite expressions.",
    "Focus on slang and colloquial phrases.",
    "Focus on action verbs and their usage.",
    "Focus on describing people and places.",
    "Focus on asking and answering questions.",
    "Focus on numbers, dates, and time.",
    "Focus on common idioms and expressions.",
  ];
  return extras[Math.floor(Math.random() * extras.length)];
}

export const generateLesson = async (
  language: 'hindi' | 'spanish' | 'korean',
  levelOrCount: 'easy' | 'intermediate' | 'hard' | number = 'easy',
  previousWords: string[] = [],
  quizAttemptCount: number = 0,
  isMusicMode: boolean = false,
  musicPhrases: string[] = []
) => {
  const randomSeed = Math.floor(Math.random() * 100000);
  const randomTopics = getRandomTopics(language);

  let levelStr = "easy";
  if (typeof levelOrCount === 'number') {
    if (levelOrCount >= 10) levelStr = "hard";
    else if (levelOrCount >= 5) levelStr = "intermediate";
    else levelStr = "easy";
  } else {
    levelStr = levelOrCount;
  }

  // Progressive difficulty description based on how many quizzes user has done at this level
  let levelDescription = "";
  if (levelStr === 'easy') {
    if (quizAttemptCount === 0) {
      levelDescription = "Super easy level — QUIZ 1 of 2 (Absolute Beginner A1: ONLY the 50 most common words, single words only, basic greetings like Hello/Goodbye, numbers 1-5. NO sentences. Extremely easy.)";
    } else {
      levelDescription = "Easy level — QUIZ 2 of 2 (A1: Very basic 2-3 word phrases, simple common nouns, colors, and basic verbs. Keep it very easy and beginner friendly.)";
    }
  } else if (levelStr === 'intermediate') {
    if (quizAttemptCount === 0) {
      levelDescription = "Intermediate level — QUIZ 1 of 2 (B1/B2: High difficulty spike. Complex sentence structures, past and future tenses, challenging vocabulary, long conversational phrases.)";
    } else {
      levelDescription = "Intermediate level — QUIZ 2 of 2 (B2: Very challenging intermediate. Nuanced meanings, idiomatic expressions, fill-in-the-blank with long complex sentences. Make it noticeably harder.)";
    }
  } else if (levelStr === 'pronunciation') {
    levelDescription = "Pronunciation & Audio level. Focus purely on spoken phrases, phonetics, and listening comprehension. Questions must rely heavily on audio if possible.";
  } else {
    if (quizAttemptCount === 0) {
      levelDescription = "Hard level — QUIZ 1 of 3 (C1: advanced idiomatic expressions, complex emotions, native-level phrases from music/literature, subtle word choice differences.)";
    } else if (quizAttemptCount === 1) {
      levelDescription = "Hard level — QUIZ 2 of 3 (C1/C2: more challenging idioms, compound complex sentence fills, advanced verb forms, culturally rich expressions.)";
    } else {
      levelDescription = "Hard level — QUIZ 3 of 3 — FINAL (C2/Native: the hardest vocabulary and phrases, advanced nuance, proverbs, and expressions. This is the mastery test.)";
    }
  }

  // Build the exclusion block
  const exclusionBlock = previousWords.length > 0
    ? `\nCRITICAL — BANNED WORDS (user has already seen these — NEVER use them as targetWord or in options):\n${previousWords.slice(-60).join(', ')}\n`
    : '';

  const isPronunciationMode = levelStr === 'pronunciation';

  const musicModeInstructions = isPronunciationMode ? `
3. Generate exactly 20 questions.
   - ALL 20 questions MUST be of type 'translate_word'.
   - The 'targetWord' MUST be the foreign language phrase or sentence the user needs to pronounce.
   - USE A MIX of song phrases, commonly used conversational phrases (e.g. greetings, common questions), and random conversational ${language} words.
   ${musicPhrases.length > 0 ? `   - MUST INCLUDE these song phrases as targetWords: ${musicPhrases.slice(0, 10).map(p => `"${p}"`).join(', ')}` : ''}
   - The 'explanation' MUST contain the exact English meaning of the phrase, and any tips on pronunciation.
   - Leave 'options' empty as this is a speaking exercise.` : isMusicMode ? `
3. Generate exactly 10 questions. 
   - EXACTLY 4 of these questions MUST be of type 'listen_translate'.
   - EXACTLY 2 of these questions MUST be of type 'translate_word', where the 'targetWord' is a FULL LINE or PHRASE (5-8 words long) directly from the song lyrics, and the user must choose the correct translation.
   - The remaining 4 should be randomly distributed among 'translate_word' (single word), 'multiple_choice', 'fill_blank', and 'match_meaning'.` : `
3. Generate exactly 10 questions randomly distributed among the 4 question types: translate_word, multiple_choice, fill_blank, match_meaning.`;

  const musicModeStructure = isMusicMode ? `
   listen_translate:
   - questionText: "Listen to the audio and select the correct translation:"
   - targetWord: ${musicPhrases.length > 0 ? `MUST be one of these exact phrases from our song library: ${musicPhrases.map(p => `"${p}"`).join(', ')}` : `a 3-4 word phrase in ${language}`} (this will be read aloud by TTS)
   - options: 4 English meanings
   - correctAnswer: correct English meaning

   translate_word (when used for a FULL PHRASE):
   - questionText: "What is the English translation for this phrase?"
   - targetWord: ${musicPhrases.length > 0 ? `MUST be one of these exact phrases from our song library: ${musicPhrases.map(p => `"${p}"`).join(', ')}` : `a 5-8 word phrase in ${language}`}
   - options: 4 English phrases
   - correctAnswer: correct English meaning
` : '';

  const prompt = `
You are a language tutor for Lingofy, a music-based language 
learning app. Your job is to teach English speakers basic 
${language} vocabulary and phrases.

Session ID (guarantees unique questions): ${randomSeed}
Language being taught: ${language}
Student level: ${levelDescription}
Focus categories for this session: ${randomTopics}
${exclusionBlock}
ABSOLUTE RULES — READ CAREFULLY:

1. ALL questionText must be written in ENGLISH ONLY
   Never write the question itself in Hindi or Spanish
   ${musicModeInstructions}
2. Question structure depends on type:
${musicModeStructure}
   translate_word:
${isPronunciationMode ? `   - questionText: "Pronounce this phrase:"
   - targetWord: ONLY the ${language} phrase/word in its NATIVE SCRIPT (e.g. Hindi script if language is Hindi). Do NOT use English characters here.
   - options: []
   - correctAnswer: same as targetWord` : `   - questionText: "What is the ${language} word/phrase for '[English word]'?"
   - targetWord: the English word (shown large on screen)
   - options: 4 ${language} words/phrases
   - correctAnswer: the correct ${language} translation`}
   
   multiple_choice:
   - questionText: "What does '[${language} word]' mean in English?"
   - options: 4 English meanings
   - correctAnswer: correct English meaning
   
   fill_blank:
   - questionText: "Fill in the blank to complete the ${language} sentence:"
   - sentence shown: the ${language} sentence with ___ gap
   - always include English translation in parentheses after
   - options: 4 ${language} words that could fill the blank
   - correctAnswer: the correct ${language} word
   
   match_meaning:
   - questionText: "What does this ${language} word/phrase mean?"
   - targetWord: the ${language} word (shown large)
   - options: 4 English meanings
   - correctAnswer: correct English meaning

3. BANNED TOPICS — NEVER generate questions about:
   - Smartphones, technology, gadgets
   - Movies, TV shows, celebrities  
   - Sports teams or scores
   - History or geography facts
   - Science or math
   - General knowledge trivia
   - Schedules or timetables
   - Anything not in the 10 categories listed

4. Questions must come from ONLY these categories:
   Greetings, Numbers & Time, Family, Food & Drink,
   Colors & Descriptions, Places & Directions,
   Daily Verbs, Shopping, Emotions, Music & Feelings

5. Each question must test a DIFFERENT word — no repeats within this quiz

6. For Hindi questions:
   - Use Devanagari script for Hindi words in options/answers
   - Add romanized pronunciation in explanation
   - Example option: "भूखा (bhookha)"

7. For Korean questions:
   - Use Hangul script for Korean words in options/answers
   - Add romanized pronunciation in explanation

8. For Spanish questions:
   - Use proper Spanish with accents (á é í ó ú ñ ¿ ¡)
   - Keep vocabulary conversational and natural

9. Make questions EDUCATIONAL and PROGRESSIVE:
   - Match the difficulty level description above exactly
   - Each question should genuinely teach something useful
   - Think: "Would a Duolingo lesson include this?" 
     If yes → include. If no → reject.

10. Vary question types — minimum 2 of each type across 10 Qs

11. correctAnswer must EXACTLY match one of the 4 options
    (same spelling, same script, same capitalization)

${isPronunciationMode ? 'Generate exactly 20 questions following ALL rules above.' : 'Generate exactly 10 questions following ALL rules above.'}

Respond with ONLY raw JSON — zero markdown, zero backticks,
zero text outside the JSON object.

JSON Schema:
{
  "lessonTitle": "describe the focus e.g. 'Hindi Basics: Food & Emotions'",
  "language": "${language}",
  "questions": [
    {
      "id": 1,
      "type": "${isMusicMode ? 'translate_word | multiple_choice | fill_blank | match_meaning | listen_translate' : 'translate_word | multiple_choice | fill_blank | match_meaning'}",
      "questionText": "ALWAYS IN ENGLISH",
      "targetWord": "word shown large on screen (English for translate_word, ${language} for match_meaning)",
      "sentence": "full sentence with ___ for fill_blank type only",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "must exactly match one option",
      "explanation": "1 sentence in English explaining the answer + pronunciation tip for Hindi/Korean"
    }
  ]
}
`;

  const result = await generateWithRetry(prompt);
  return result;
};

export const generateSongLesson = async (
  language: string,
  songTitle: string,
  songArtist: string,
  lyricsWithTranslations: { english: string; translation: string }[]
) => {
  const randomSeed = Math.floor(Math.random() * 100000);
  const langKey = (language || 'spanish').toLowerCase();
  
  // Format the lyrics context for the prompt
  const lyricsContext = lyricsWithTranslations.length > 0
    ? lyricsWithTranslations
        .map((l, i) => `Line ${i + 1}: Original/English: "${l.english}" | Target Translation: "${l.translation || l.english}"`)
        .join("\n")
    : `Song: "${songTitle}" by "${songArtist}"`;

  const prompt = `
You are a language tutor for Lingofy, a music-based language learning app.
A user is listening to the song "${songTitle}" by "${songArtist}".
Your job is to generate an interactive 15-QUESTION PRACTICE QUIZ for the user to practice ${langKey} using the words, phrases, and lyrics from this song.

Session ID (guarantees unique questions): ${randomSeed}
Target Language being practiced: ${langKey}
Song Title: "${songTitle}"
Song Artist: "${songArtist}"

Lyrics and Translations:
${lyricsContext}

CRITICAL REQUIREMENT — GENERATE EXACTLY 15 QUESTIONS WITH THIS MIX:
1. 4 'listen_translate' or 'pronunciation' questions:
   - questionText: "Listen to the pronunciation and select the correct translation:" or "How is this phrase from '${songTitle}' pronounced/translated?"
   - targetWord: a 3-5 word phrase or line from the song in ${langKey} (for TTS pronunciation)
   - options: 4 English meanings
   - correctAnswer: correct English meaning

2. 4 'translate_word' (Full Phrase) questions:
   - questionText: "What is the English translation for this lyric line from '${songTitle}'?"
   - targetWord: a line from the song in ${langKey}
   - options: 4 English translations
   - correctAnswer: correct English translation

3. 4 'fill_blank' questions:
   - questionText: "Fill in the missing word from this song line:"
   - sentence: "${langKey} line with ___ replacement (English translation in parentheses)"
   - options: 4 ${langKey} words from the song context
   - correctAnswer: the correct ${langKey} word

4. 3 'match_meaning' / 'multiple_choice' questions:
   - questionText: "What does this key vocabulary word from '${songTitle}' mean?"
   - targetWord: key word in ${langKey}
   - options: 4 English meanings
   - correctAnswer: correct English meaning

ABSOLUTE RULES:
- ALL questionText must be in ENGLISH ONLY.
- Each question must test a DIFFERENT word/phrase from the song.
- For Hindi: use Devanagari script for options with romanized pronunciation in explanation e.g. "भूखा (bhookha)".
- For Korean: use Hangul script with romanized pronunciation in explanation.
- For Spanish/French/German: use proper accents.
- For English target: test vocabulary/idioms from the song lyrics with clear English definitions.
- correctAnswer must EXACTLY match one of the 4 options.

Respond ONLY with raw JSON — zero markdown code block wrappers, zero extra text.

JSON Schema:
{
  "lessonTitle": "Song Practice: ${songTitle}",
  "language": "${langKey}",
  "questions": [
    {
      "id": 1,
      "type": "listen_translate | translate_word | fill_blank | match_meaning | pronunciation",
      "questionText": "Question text in English",
      "targetWord": "target word or line from song",
      "sentence": "line with gap for fill_blank only",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correctAnswer": "exact match of one option",
      "explanation": "Brief explanation of the answer and pronunciation tips"
    }
  ]
}
`;

  // Fallback builder if Groq returns < 15 questions or fails
  const createFallbackQuestions = (): any[] => {
    const fallbackQs: any[] = [];
    const validLyrics = lyricsWithTranslations.filter(l => l.english && l.english.trim());

    // Generate 15 distinct questions based on song details & available lyrics
    for (let i = 1; i <= 15; i++) {
      const lyricItem = validLyrics[(i - 1) % (validLyrics.length || 1)] || { english: songTitle, translation: songTitle };
      const qType = i % 4 === 1 ? 'listen_translate' : i % 4 === 2 ? 'translate_word' : i % 4 === 3 ? 'fill_blank' : 'match_meaning';
      
      const targetText = lyricItem.translation || lyricItem.english;
      const engText = lyricItem.english || lyricItem.translation;

      if (qType === 'listen_translate') {
        fallbackQs.push({
          id: i,
          type: 'listen_translate',
          questionText: `Listen to this phrase from "${songTitle}" and select its translation:`,
          targetWord: targetText,
          options: [engText, "Singing with rhythm", "Forever in harmony", "Dance to the beats"],
          correctAnswer: engText,
          explanation: `This phrase is heard in "${songTitle}" by ${songArtist}.`
        });
      } else if (qType === 'translate_word') {
        fallbackQs.push({
          id: i,
          type: 'translate_word',
          questionText: `What is the correct translation for this line from "${songTitle}"?`,
          targetWord: targetText,
          options: [engText, "Heartbeat in motion", "Night under the stars", "A quiet melody"],
          correctAnswer: engText,
          explanation: `In the song "${songTitle}", "${targetText}" translates to "${engText}".`
        });
      } else if (qType === 'fill_blank') {
        const words = targetText.split(' ');
        const missingWord = words[Math.floor(words.length / 2)] || words[0] || 'music';
        const maskedSentence = targetText.replace(missingWord, '___');
        fallbackQs.push({
          id: i,
          type: 'fill_blank',
          questionText: `Fill in the missing word from this line in "${songTitle}":`,
          sentence: `${maskedSentence} (${engText})`,
          options: [missingWord, "harmony", "rhythm", "tempo"],
          correctAnswer: missingWord,
          explanation: `The complete lyric is: "${targetText}".`
        });
      } else {
        fallbackQs.push({
          id: i,
          type: 'match_meaning',
          questionText: `What is the meaning of this key song phrase?`,
          targetWord: targetText,
          options: [engText, "Silent echo", "Bright light", "Flowing stream"],
          correctAnswer: engText,
          explanation: `This phrase is key to understanding the lyrics of "${songTitle}".`
        });
      }
    }
    return fallbackQs;
  };

  try {
    const resData = await generateWithRetry(prompt);
    if (resData && Array.isArray(resData.questions) && resData.questions.length >= 10) {
      // Ensure IDs are 1..N and question count reaches 15 if needed
      let qList = resData.questions.map((q: any, idx: number) => ({
        ...q,
        id: idx + 1
      }));

      // Top up to 15 questions if needed
      if (qList.length < 15) {
        const fallbacks = createFallbackQuestions();
        while (qList.length < 15) {
          const nextIndex = qList.length;
          const fb = fallbacks[nextIndex];
          fb.id = nextIndex + 1;
          qList.push(fb);
        }
      }

      return {
        lessonTitle: resData.lessonTitle || `Song Practice: ${songTitle}`,
        language: langKey,
        questions: qList.slice(0, 15)
      };
    } else {
      return {
        lessonTitle: `Song Practice: ${songTitle}`,
        language: langKey,
        questions: createFallbackQuestions()
      };
    }
  } catch (err) {
    console.warn("Song quiz generation fallback triggered:", err);
    return {
      lessonTitle: `Song Practice: ${songTitle}`,
      language: langKey,
      questions: createFallbackQuestions()
    };
  }
};

