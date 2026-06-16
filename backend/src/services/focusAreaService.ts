import Groq from "groq-sdk";

async function callGroq(prompt: string): Promise<string> {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are a language tutor generator for a specialized focus area practice. Always respond with valid JSON only. No markdown, no backticks, no preamble. Just raw JSON."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.9,
    max_tokens: 2500,
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
    try {
      const raw = await callGroq(prompt);
      const cleaned = raw.replace(/```json|```/g, "").trim();
      return sanitizeData(JSON.parse(cleaned));
    } catch {
      throw new Error("Focus practice generation failed. Please try again.");
    }
  }
}

export const generateFocusLesson = async (
  language: 'hindi' | 'spanish' | 'korean',
  focusArea: string
) => {
  const randomSeed = Math.floor(Math.random() * 100000);

  let focusInstructions = "";
  if (focusArea === "Vocabulary") {
    focusInstructions = "Focus strictly on expanding vocabulary. Provide words related to common nouns, verbs, and adjectives. Use translate_word and multiple_choice.";
  } else if (focusArea === "Listening") {
    focusInstructions = "Focus strictly on listening skills. Provide short conversational phrases or words. Generate EXACTLY 6 questions of type 'listen_translate' where the user listens to TTS and chooses the meaning. And 4 questions of 'translate_word'.";
  } else if (focusArea === "Grammar") {
    focusInstructions = "Focus strictly on grammar rules, verb conjugations, and sentence structuring. Generate questions of type 'fill_blank' mostly.";
  } else if (focusArea === "Culture (idioms, slangs)") {
    focusInstructions = "Focus strictly on cultural nuances, idioms, and common slangs. Teach them phrases native speakers use. Use 'match_meaning' and 'translate_word'.";
  } else {
    focusInstructions = "Focus on general practice.";
  }

  const prompt = `
You are a language tutor for Lingofy. Your job is to generate a specialized practice session focusing on: ${focusArea}.
Session ID: ${randomSeed}
Language being taught: ${language}

ABSOLUTE RULES — READ CAREFULLY:
1. ALL questionText must be written in ENGLISH ONLY.
2. Structure depending on type:
   translate_word:
   - questionText: "What is the ${language} word/phrase for '[English word]'?"
   - targetWord: the English word
   - options: 4 ${language} words/phrases
   - correctAnswer: the correct ${language} translation

   multiple_choice:
   - questionText: "What does '[${language} word]' mean in English?"
   - options: 4 English meanings
   - correctAnswer: correct English meaning

   fill_blank:
   - questionText: "Fill in the blank to complete the ${language} sentence:"
   - sentence shown: the ${language} sentence with ___ gap (include English translation in parentheses)
   - options: 4 ${language} words
   - correctAnswer: the correct ${language} word

   match_meaning:
   - questionText: "What does this ${language} idiom/slang mean?"
   - targetWord: the ${language} phrase
   - options: 4 English meanings
   - correctAnswer: correct English meaning

   listen_translate:
   - questionText: "Listen to the audio and select the correct translation:"
   - targetWord: a short ${language} phrase (this will be read aloud)
   - options: 4 English meanings
   - correctAnswer: correct English meaning

3. For Hindi questions:
   - Use Devanagari script for Hindi words in options/answers
   - Add romanized pronunciation in explanation. Example option: "भूखा (bhookha)"
4. For Korean questions:
   - Use Hangul script for Korean words in options/answers
   - Add romanized pronunciation in explanation.
5. For Spanish questions:
   - Use proper Spanish with accents (á é í ó ú ñ ¿ ¡)
6. correctAnswer must EXACTLY match one of the 4 options.
7. SHUFFLE the options. Do NOT always place the correct answer as the first option.
8. Make the incorrect options (distractors) highly confusing, plausible, and challenging. Do NOT make the correct answer obvious.

${focusInstructions}

Generate EXACTLY 10 questions.
Respond with ONLY raw JSON.

JSON Schema:
{
  "lessonTitle": "${focusArea} Practice",
  "language": "${language}",
  "questions": [
    {
      "id": 1,
      "type": "translate_word | multiple_choice | fill_blank | match_meaning | listen_translate",
      "questionText": "ALWAYS IN ENGLISH",
      "targetWord": "word shown large on screen",
      "sentence": "full sentence with ___ for fill_blank type only",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "must exactly match one option",
      "explanation": "1 sentence in English explaining the answer"
    }
  ]
}
`;

    const result = await generateWithRetry(prompt);
    
    // Shuffle options for each question
    if (result.questions && Array.isArray(result.questions)) {
      result.questions.forEach((q: any) => {
        if (Array.isArray(q.options)) {
          // Fisher-Yates shuffle
          for (let i = q.options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
          }
        }
      });
    }
    
    return result;
};
