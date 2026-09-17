import Groq from "groq-sdk";

async function callGroq(prompt: string): Promise<string> {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const models = [
    process.env.GROQ_MODEL,
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
    "llama3-70b-8192",
    "mixtral-8x7b-32768"
  ].filter(Boolean) as string[];

  let lastError: any = null;
  for (const model of models) {
    try {
      const completion = await groq.chat.completions.create({
        model,
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
        temperature: 0.9,
        top_p: 0.9,
        max_tokens: 2000,
      });
      const content = completion.choices[0]?.message?.content;
      if (content) return content;
    } catch (err) {
      console.warn(`Groq model '${model}' failed:`, (err as Error).message);
      lastError = err;
    }
  }

  throw lastError || new Error("All Groq models failed.");
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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
        if (q.options && Array.isArray(q.options) && q.options.length > 1) {
          q.options = shuffleArray(q.options);
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
    console.warn("Quiz generation API failed, using smart fallback quiz:", (err as Error).message);
    return null;
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

  try {
    const result = await generateWithRetry(prompt);
    if (result && Array.isArray(result.questions) && result.questions.length > 0) {
      return result;
    }
  } catch (err) {
    console.warn("generateLesson failed, returning fallback:", (err as Error).message);
  }

  return createFallbackGeneralLesson(language, levelStr);
};

export function createFallbackGeneralLesson(language: string, levelStr: string = 'easy') {
  const langKey = (language || 'spanish').toLowerCase();
  
  const fallbackBank: Record<string, { targetWord: string; options: string[]; correctAnswer: string; explanation: string; type?: string; questionText?: string }[]> = {
    spanish: [
      { targetWord: 'Hola', options: ['Hello', 'Goodbye', 'Thank you', 'Please'], correctAnswer: 'Hello', explanation: 'Hola means Hello in Spanish.', type: 'translate_word', questionText: "What is the Spanish word for 'Hello'?" },
      { targetWord: 'Gracias', options: ['Thank you', 'Sorry', 'Welcome', 'Yes'], correctAnswer: 'Thank you', explanation: 'Gracias means Thank you in Spanish.', type: 'translate_word', questionText: "What is the Spanish word for 'Thank you'?" },
      { targetWord: 'Buenos días', options: ['Good morning', 'Good night', 'See you later', 'How are you'], correctAnswer: 'Good morning', explanation: 'Buenos días translates to Good morning.', type: 'translate_word', questionText: "What does 'Buenos días' mean?" },
      { targetWord: 'Amigo', options: ['Friend', 'Enemy', 'Teacher', 'Brother'], correctAnswer: 'Friend', explanation: 'Amigo means Friend in Spanish.', type: 'translate_word', questionText: "What is the English translation of 'Amigo'?" },
      { targetWord: 'Por favor', options: ['Please', 'Excuse me', 'You are welcome', 'Good luck'], correctAnswer: 'Please', explanation: 'Por favor means Please in Spanish.', type: 'translate_word', questionText: "What does 'Por favor' mean?" },
      { targetWord: '¿Cómo estás?', options: ['How are you?', 'What is your name?', 'Where are you from?', 'How old are you?'], correctAnswer: 'How are you?', explanation: '¿Cómo estás? is a common greeting meaning How are you?.', type: 'multiple_choice', questionText: "What does '¿Cómo estás?' mean?" },
      { targetWord: 'Hasta luego', options: ['See you later', 'Good morning', 'Nice to meet you', 'Have a nice day'], correctAnswer: 'See you later', explanation: 'Hasta luego means See you later.', type: 'multiple_choice', questionText: "What is the meaning of 'Hasta luego'?" },
      { targetWord: 'Música', options: ['Music', 'Song', 'Dance', 'Rhythm'], correctAnswer: 'Music', explanation: 'Música means Music in Spanish.', type: 'translate_word', questionText: "What is the Spanish word for 'Music'?" },
      { targetWord: 'Cantar', options: ['To sing', 'To dance', 'To listen', 'To play'], correctAnswer: 'To sing', explanation: 'Cantar means To sing.', type: 'translate_word', questionText: "What does 'Cantar' mean?" },
      { targetWord: 'Corazón', options: ['Heart', 'Soul', 'Mind', 'Life'], correctAnswer: 'Heart', explanation: 'Corazón means Heart in Spanish.', type: 'translate_word', questionText: "What is the English translation of 'Corazón'?" }
    ],
    hindi: [
      { targetWord: 'नमस्ते (Namaste)', options: ['Hello / Greetings', 'Goodbye', 'Thank you', 'Welcome'], correctAnswer: 'Hello / Greetings', explanation: 'Namaste is the standard Hindi greeting.', type: 'translate_word', questionText: "What is the Hindi word for 'Hello'?" },
      { targetWord: 'धन्यवाद (Dhanyavaad)', options: ['Thank you', 'Please', 'Sorry', 'Yes'], correctAnswer: 'Thank you', explanation: 'Dhanyavaad means Thank you in Hindi.', type: 'translate_word', questionText: "What is the Hindi word for 'Thank you'?" },
      { targetWord: 'प्यार (Pyaar)', options: ['Love', 'Peace', 'Friendship', 'Joy'], correctAnswer: 'Love', explanation: 'Pyaar means Love in Hindi.', type: 'translate_word', questionText: "What does 'प्यार (Pyaar)' mean?" },
      { targetWord: 'संगीत (Sangeet)', options: ['Music', 'Dance', 'Poetry', 'Instrument'], correctAnswer: 'Music', explanation: 'Sangeet means Music in Hindi.', type: 'translate_word', questionText: "What does 'संगीत (Sangeet)' mean?" },
      { targetWord: 'दोस्त (Dost)', options: ['Friend', 'Brother', 'Companion', 'Teacher'], correctAnswer: 'Friend', explanation: 'Dost means Friend in Hindi.', type: 'translate_word', questionText: "What is the English meaning of 'दोस्त (Dost)'?" },
      { targetWord: 'शुभ प्रभात (Shubh Prabhat)', options: ['Good morning', 'Good night', 'Good evening', 'Have a nice day'], correctAnswer: 'Good morning', explanation: 'Shubh Prabhat means Good morning in Hindi.', type: 'multiple_choice', questionText: "What does 'शुभ प्रभात (Shubh Prabhat)' mean?" },
      { targetWord: 'आप कैसे हैं? (Aap kaise hain?)', options: ['How are you?', 'Where are you going?', 'What is your name?', 'Who are you?'], correctAnswer: 'How are you?', explanation: 'Aap kaise hain? means How are you?.', type: 'multiple_choice', questionText: "What is the meaning of 'आप कैसे हैं?'?" },
      { targetWord: 'गाना (Gaana)', options: ['Song', 'Dance', 'Voice', 'Stage'], correctAnswer: 'Song', explanation: 'Gaana means Song in Hindi.', type: 'translate_word', questionText: "What does 'गाना (Gaana)' mean?" },
      { targetWord: 'दिल (Dil)', options: ['Heart', 'Mind', 'Soul', 'Life'], correctAnswer: 'Heart', explanation: 'Dil means Heart in Hindi.', type: 'translate_word', questionText: "What does 'दिल (Dil)' mean?" },
      { targetWord: 'फिर मिलेंगे (Phir milenge)', options: ['See you again', 'Welcome', 'Congratulations', 'Good job'], correctAnswer: 'See you again', explanation: 'Phir milenge means See you again.', type: 'multiple_choice', questionText: "What does 'फिर मिलेंगे' mean?" }
    ],
    korean: [
      { targetWord: '안녕하세요 (Annyeonghaseyo)', options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'], correctAnswer: 'Hello', explanation: 'Annyeonghaseyo is the polite Korean greeting for Hello.', type: 'translate_word', questionText: "What is the Korean word for 'Hello'?" },
      { targetWord: '감사합니다 (Gamsahamnida)', options: ['Thank you', 'Please', 'Excuse me', 'You are welcome'], correctAnswer: 'Thank you', explanation: 'Gamsahamnida means Thank you in Korean.', type: 'translate_word', questionText: "What is the Korean word for 'Thank you'?" },
      { targetWord: '사랑 (Sarang)', options: ['Love', 'Hope', 'Dream', 'Peace'], correctAnswer: 'Love', explanation: 'Sarang means Love in Korean.', type: 'translate_word', questionText: "What does '사랑 (Sarang)' mean?" },
      { targetWord: '음악 (Eum-ak)', options: ['Music', 'Song', 'Sound', 'Art'], correctAnswer: 'Music', explanation: 'Eum-ak means Music in Korean.', type: 'translate_word', questionText: "What is the English meaning of '음악 (Eum-ak)'?" },
      { targetWord: '친구 (Chingu)', options: ['Friend', 'Family', 'Student', 'Partner'], correctAnswer: 'Friend', explanation: 'Chingu means Friend in Korean.', type: 'translate_word', questionText: "What does '친구 (Chingu)' mean?" },
      { targetWord: '좋은 아침 (Joeun achim)', options: ['Good morning', 'Good night', 'Welcome', 'See you later'], correctAnswer: 'Good morning', explanation: 'Joeun achim translates to Good morning.', type: 'multiple_choice', questionText: "What does '좋은 아침 (Joeun achim)' mean?" },
      { targetWord: '노래 (Norae)', options: ['Song', 'Dance', 'Stage', 'Voice'], correctAnswer: 'Song', explanation: 'Norae means Song in Korean.', type: 'translate_word', questionText: "What does '노래 (Norae)' mean?" },
      { targetWord: '마음 (Maeum)', options: ['Heart / Mind', 'Body', 'Dream', 'Memory'], correctAnswer: 'Heart / Mind', explanation: 'Maeum means Heart or Mind in Korean.', type: 'translate_word', questionText: "What does '마음 (Maeum)' mean?" },
      { targetWord: '잘 가요 (Jal gayo)', options: ['Goodbye', 'Hello', 'Thank you', 'Nice to meet you'], correctAnswer: 'Goodbye', explanation: 'Jal gayo means Goodbye in Korean.', type: 'multiple_choice', questionText: "What does '잘 가요 (Jal gayo)' mean?" },
      { targetWord: '반갑습니다 (Bangapseumnida)', options: ['Nice to meet you', 'See you tomorrow', 'Take care', 'Congratulations'], correctAnswer: 'Nice to meet you', explanation: 'Bangapseumnida means Nice to meet you.', type: 'multiple_choice', questionText: "What does '반갑습니다' mean?" }
    ]
  };

  const bank = fallbackBank[langKey] || fallbackBank.spanish;
  const questions = bank.map((q, i) => ({
    id: i + 1,
    type: q.type || 'translate_word',
    questionText: q.questionText || `What is the meaning of ${q.targetWord}?`,
    targetWord: q.targetWord,
    options: shuffleArray(q.options),
    correctAnswer: q.correctAnswer,
    explanation: q.explanation
  }));

  return {
    lessonTitle: `${language.charAt(0).toUpperCase() + language.slice(1)} Practice Lesson`,
    language: langKey,
    questions
  };
}

export const generateSongLesson = async (
  language: string,
  songTitle: string,
  songArtist: string,
  lyricsWithTranslations: { english: string; translation: string }[]
) => {
  const randomSeed = Math.floor(Math.random() * 100000);
  const langKey = (language || 'hindi').toLowerCase();
  const cleanTitle = (songTitle || '').trim();

  // Known song database for accurate lyric translations if DB segments are missing
  const KNOWN_SONGS_DATA: Record<string, { lines: { target: string; english: string }[]; words: { word: string; meaning: string }[] }> = {
    'tum hi ho': {
      lines: [
        { target: 'Hum tere bin ab reh nahi sakte', english: 'I cannot live without you now' },
        { target: 'Tere bina kya wajood mera', english: 'What is my existence without you' },
        { target: 'Tujhse juda agar ho jayenge', english: 'If I get separated from you' },
        { target: 'Toh khud se hi ho jayenge judaa', english: 'Then I will be separated from my own self' },
        { target: 'Kyunki tum hi ho, ab tum hi ho', english: 'Because you alone are my everything' },
        { target: 'Zindagi ab tum hi ho', english: 'You are my life now' },
        { target: 'Chain bhi, mera dard bhi', english: 'My solace, and my pain too' },
        { target: 'Meri aashiqui ab tum hi ho', english: 'You alone are my love now' }
      ],
      words: [
        { word: 'Wajood', meaning: 'Existence / Identity' },
        { word: 'Zindagi', meaning: 'Life' },
        { word: 'Aashiqui', meaning: 'Love / Devotion' },
        { word: 'Judaa', meaning: 'Separated / Apart' },
        { word: 'Chain', meaning: 'Peace / Solace' },
        { word: 'Dard', meaning: 'Pain / Heartache' }
      ]
    },
    've haaniya': {
      lines: [
        { target: 'Ve haaniya dil jaaniya', english: 'O my soulmate, my heart\'s beloved' },
        { target: 'Tere bin jeena nahi ve haaniya', english: 'I cannot live without you, my soulmate' },
        { target: 'Akhiyaan ch tu vasda mere', english: 'You reside in my eyes' },
        { target: 'Tu hi meri shaam, tu hi mera chain', english: 'You are my evening, you are my peace' },
        { target: 'Dil diyaan gallan karange naal', english: 'We will talk about the matters of heart together' },
        { target: 'Teri zulfon ki chhaon mein', english: 'Under the shadow of your hair' },
        { target: 'Har pal tera intezaar hai', english: 'Every moment I wait for you' },
        { target: 'Sohniya ve mera dil tu le gaya', english: 'O beautiful one, you stole my heart' }
      ],
      words: [
        { word: 'Haaniya', meaning: 'Soulmate / Life partner' },
        { word: 'Dil', meaning: 'Heart' },
        { word: 'Jaan', meaning: 'Life / Soul' },
        { word: 'Akhiyaan', meaning: 'Eyes' },
        { word: 'Sohniya', meaning: 'Beautiful one' },
        { word: 'Intezaar', meaning: 'Waiting / Expectation' },
        { word: 'Chain', meaning: 'Peace / Solace' }
      ]
    },
    'morning calm': {
      lines: [
        { target: 'सुप्रभात, आज का दिन सुंदर है', english: 'Good morning, today is a beautiful day' },
        { target: 'एक गहरी सांस लें', english: 'Take a deep breath' },
        { target: 'अपने विचारों को शांत होने दें', english: 'Let your thoughts become calm' },
        { target: 'Buenos días, hoy es un hermoso día', english: 'Good morning, today is a beautiful day' },
        { target: 'Respira profundamente', english: 'Take a deep breath' }
      ],
      words: [
        { word: 'सुप्रभात (Suprabhat)', meaning: 'Good morning' },
        { word: 'सुंदर (Sundar)', meaning: 'Beautiful' },
        { word: 'सांस (Saans)', meaning: 'Breath' },
        { word: 'Buenos días', meaning: 'Good morning' },
        { word: 'Hermoso', meaning: 'Beautiful' }
      ]
    }
  };

  const songKey = cleanTitle.toLowerCase();
  const knownSong = KNOWN_SONGS_DATA[songKey];

  // Prepare lyrics context
  let lyricsContext = "";
  if (lyricsWithTranslations.length > 0) {
    lyricsContext = lyricsWithTranslations
      .filter(l => l.english && l.translation && l.english.toLowerCase() !== l.translation.toLowerCase())
      .map((l, i) => `Line ${i + 1}: ${langKey.toUpperCase()}: "${l.translation}" | ENGLISH TRANSLATION: "${l.english}"`)
      .join("\n");
  }

  if (!lyricsContext && knownSong) {
    lyricsContext = knownSong.lines
      .map((l, i) => `Line ${i + 1}: ${langKey.toUpperCase()}: "${l.target}" | ENGLISH TRANSLATION: "${l.english}"`)
      .join("\n");
  }

  if (!lyricsContext) {
    lyricsContext = `Song: "${cleanTitle}" by "${songArtist}".`;
  }

  const prompt = `
You are an expert language teacher creating an interactive 15-QUESTION SONG PRACTICE QUIZ for Lingofy.
The user is practicing ${langKey.toUpperCase()} while listening to the song "${cleanTitle}" by "${songArtist}".

Session Seed: ${randomSeed}
Target Language: ${langKey}
Song Title: "${cleanTitle}"
Song Artist: "${songArtist}"

Lyrics & Accurate Translations Context:
${lyricsContext}

GENERATE EXACTLY 15 HIGH-QUALITY, DIVERSE PRACTICE QUESTIONS matching these 4 DISTINCT TYPES:

1. 'pronunciation' (4 Questions):
   - questionText: "Pronounce this song line into your microphone:" or "Speak this phrase from '${cleanTitle}':"
   - targetWord: A 2-4 word phrase from the song in ${langKey}
   - options: 4 distinct English translations/meanings (e.g. correct translation vs 3 incorrect translations)
   - correctAnswer: The correct English translation
   - explanation: Pronunciation guide and meaning breakdown.

2. 'translate_line' (4 Questions):
   - questionText: "What is the full English translation of this lyric line from '${cleanTitle}'?"
   - targetWord: Full lyric line in ${langKey}
   - options: 4 DISTINCT, PLAUSIBLE English sentences. NEVER repeat the target text as an option!
   - correctAnswer: Exact correct English translation of the line
   - explanation: Line breakdown and grammar tips.

3. 'single_word_meaning' (4 Questions):
   - questionText: "What does the single word '[WORD]' mean in this song line?"
   - targetWord: A single key vocabulary word in ${langKey} from the song
   - sentence: Full line containing the word
   - options: 4 single-word or short-phrase English definitions
   - correctAnswer: Exact correct definition
   - explanation: Word origin and usage in lyrics.

4. 'listen_word' (3 Questions):
   - questionText: "Listen to the audio snippet from '${cleanTitle}' and select the correct word/phrase spoken:"
   - targetWord: The target word/phrase in ${langKey}
   - options: 4 distinct choices in ${langKey} or English
   - correctAnswer: The correct matching option
   - explanation: Listening comprehension tip.

STRICT VALIDATION RULES:
- EVERY question MUST have genuine semantic sense.
- NEVER include the original target phrase as an English translation option!
- Options MUST be 4 clearly distinct choices.
- correctAnswer MUST be an exact match to one of the 4 items in options.
- Return raw JSON ONLY without markdown wrappers.

JSON Structure:
{
  "lessonTitle": "Song Practice: ${cleanTitle}",
  "language": "${langKey}",
  "questions": [
    {
      "id": 1,
      "type": "pronunciation | translate_line | single_word_meaning | listen_word",
      "questionText": "Question text in English",
      "targetWord": "target phrase or word in ${langKey}",
      "sentence": "full sentence context if needed",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Helpful explanation"
    }
  ]
}
`;

  const createSmartFallbackQuestions = (): any[] => {
    const fallbackQs: any[] = [];
    
    // Pick lines and words
    const lines = knownSong?.lines || [
      { target: `${cleanTitle} lyric phrase 1`, english: `Meaning of phrase 1 from ${cleanTitle}` },
      { target: `${cleanTitle} lyric phrase 2`, english: `Translation of phrase 2 from ${cleanTitle}` },
      { target: `${cleanTitle} lyric phrase 3`, english: `English translation of phrase 3` },
      { target: `${cleanTitle} lyric phrase 4`, english: `Deep emotional line translation` }
    ];

    const words = knownSong?.words || [
      { word: 'Love / Pyaar / Amor', meaning: 'Love and affection' },
      { word: 'Heart / Dil / Corazón', meaning: 'Heart / Inner feelings' },
      { word: 'Night / Raat / Noche', meaning: 'Night time' },
      { word: 'Soul / Jaan / Alma', meaning: 'Soul / Life partner' }
    ];

    // Build 15 balanced questions across the 4 types
    const types = ['pronunciation', 'translate_line', 'single_word_meaning', 'listen_word'];

    for (let i = 1; i <= 15; i++) {
      const qType = types[(i - 1) % 4];
      const lineItem = lines[(i - 1) % lines.length];
      const wordItem = words[(i - 1) % words.length];

      if (qType === 'pronunciation') {
        fallbackQs.push({
          id: i,
          type: 'pronunciation',
          questionText: `Pronounce this phrase from "${cleanTitle}" into your mic:`,
          targetWord: lineItem.target,
          options: shuffleArray([lineItem.english, "Dancing in the rain", "Waiting for sunrise", "Singing sweet melodies"]),
          correctAnswer: lineItem.english,
          explanation: `Practice pronouncing "${lineItem.target}" (${lineItem.english}).`
        });
      } else if (qType === 'translate_line') {
        fallbackQs.push({
          id: i,
          type: 'translate_line',
          questionText: `What is the full English translation of this line from "${cleanTitle}"?`,
          targetWord: lineItem.target,
          options: shuffleArray([
            lineItem.english,
            "The stars are shining bright in the sky",
            "Together we can dance all night long",
            "Time flies away like gentle wind"
          ]),
          correctAnswer: lineItem.english,
          explanation: `In "${cleanTitle}", "${lineItem.target}" translates to "${lineItem.english}".`
        });
      } else if (qType === 'single_word_meaning') {
        fallbackQs.push({
          id: i,
          type: 'single_word_meaning',
          questionText: `What does the single word "${wordItem.word}" mean in this song context?`,
          targetWord: wordItem.word,
          sentence: lineItem.target,
          options: shuffleArray([wordItem.meaning, "Sadness and grief", "Fast rhythm tempo", "High mountain peak"]),
          correctAnswer: wordItem.meaning,
          explanation: `"${wordItem.word}" means "${wordItem.meaning}" in "${cleanTitle}".`
        });
      } else {
        fallbackQs.push({
          id: i,
          type: 'listen_word',
          questionText: `Listen to the audio snippet from "${cleanTitle}" and select what you hear:`,
          targetWord: lineItem.target,
          options: shuffleArray([lineItem.english, "A fast drum rhythm", "Whispering breeze", "Endless journey"]),
          correctAnswer: lineItem.english,
          explanation: `Listen closely to how "${lineItem.target}" is sung by ${songArtist}.`
        });
      }
    }
    return fallbackQs;
  };

  try {
    // Ultra-fast generation: race LLM API against 1.2s timeout
    const fetchWithTimeout = async () => {
      return Promise.race([
        generateWithRetry(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1200))
      ]);
    };

    const resData: any = await fetchWithTimeout();
    if (resData && Array.isArray(resData.questions) && resData.questions.length >= 10) {
      let qList = resData.questions.map((q: any, idx: number) => {
        let validOpts = q.options || [];
        if (!validOpts.includes(q.correctAnswer)) {
          validOpts[0] = q.correctAnswer;
        }
        return {
          ...q,
          id: idx + 1,
          options: shuffleArray(validOpts)
        };
      });

      if (qList.length < 15) {
        const fallbacks = createSmartFallbackQuestions();
        while (qList.length < 15) {
          const nextIndex = qList.length;
          const fb = fallbacks[nextIndex];
          fb.id = nextIndex + 1;
          qList.push(fb);
        }
      }

      return {
        lessonTitle: resData.lessonTitle || `Song Practice: ${cleanTitle}`,
        language: langKey,
        questions: qList.slice(0, 15).map((q: any) => ({ ...q, options: shuffleArray(q.options || []) }))
      };
    } else {
      return {
        lessonTitle: `Song Practice: ${cleanTitle}`,
        language: langKey,
        questions: createSmartFallbackQuestions()
      };
    }
  } catch (err) {
    // Ultra-fast instant response fallback
    return {
      lessonTitle: `Song Practice: ${cleanTitle}`,
      language: langKey,
      questions: createSmartFallbackQuestions()
    };
  }
};


