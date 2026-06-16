
import express, { Response } from "express";
import { protect, AuthRequest } from "../middleware/authMiddleware";
import LessonAttempt from "../models/LessonAttempt";
import { generateLesson, generateSongLesson } from "../services/lessonService";
import { generateFocusLesson } from "../services/focusAreaService";
import Song from "../models/music/Song";
import LyricSegment from "../models/music/LyricSegment";
import { adminOnly } from "../middleware/roleMiddleware";
import Notification from "../models/user/Notification";

const router = express.Router();

// POST /api/lessons/generate
router.post("/generate", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { language, level } = req.body;

    if (!['hindi', 'spanish', 'korean'].includes(language)) {
      return res.status(400).json({ message: "Invalid language" });
    }

    const activeLevel = ['easy', 'intermediate', 'hard'].includes(level) ? level : 'easy';

    // Fetch user's past attempts for this language+level to extract seen words & attempt count
    const pastAttempts = await LessonAttempt.find({
      userId: req.user._id,
      language,
      level: activeLevel
    }).sort({ completedAt: -1 }).limit(20).select('questions');

    // Extract all targetWords and correctAnswers the user has already seen
    const previousWords: string[] = [];
    for (const attempt of pastAttempts) {
      for (const q of attempt.questions as any[]) {
        if (q.targetWord) previousWords.push(q.targetWord);
        if (q.correctAnswer) previousWords.push(q.correctAnswer);
      }
    }
    // Deduplicate
    const uniquePreviousWords = [...new Set(previousWords)];

    // Count total quiz attempts at this level (for progressive difficulty)
    const totalAttempts = await LessonAttempt.countDocuments({
      userId: req.user._id,
      language,
      level: activeLevel
    });

    const isMusicMode = req.user.learningMode === 'music';
    let musicPhrases: string[] = [];

    if (isMusicMode) {
      // Pick random songs to get lyrics
      const songs = await Song.aggregate([{ $match: { language: new RegExp(`^${language}$`, 'i') } }, { $sample: { size: 2 } }]);
      if (songs.length > 0) {
        const songIds = songs.map(s => s._id);
        const segments = await LyricSegment.aggregate([
          { $match: { songId: { $in: songIds } } },
          { $sample: { size: 10 } }
        ]);
        musicPhrases = segments.map(seg => seg.text).filter(t => t && t.trim().length > 0);
      }
    }

    const lessonData = await generateLesson(language, activeLevel, uniquePreviousWords, totalAttempts, isMusicMode, musicPhrases);
    
    // Ensure all questions have a correctAnswer to satisfy Mongoose validation
    const sanitizedQuestions = lessonData.questions.map((q: any) => ({
      ...q,
      correctAnswer: q.correctAnswer || "N/A"
    }));

    // Create in_progress attempt
    const attempt = await LessonAttempt.create({
      userId: req.user._id,
      language,
      level: activeLevel,
      questions: sanitizedQuestions,
      status: 'in_progress',
      startedAt: new Date()
    });

    res.status(200).json({ ...lessonData, attemptId: attempt._id });
  } catch (error) {
    console.error("Error generating lesson:", error);
    res.status(500).json({ message: "Failed to generate lesson. Please try again.", error: (error as Error).message, stack: (error as Error).stack });
  }
});

// POST /api/lessons/generate-from-song
router.post("/generate-from-song", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { songId, language } = req.body;

    if (!songId) {
      return res.status(400).json({ message: "Song ID is required" });
    }

    if (!['hindi', 'spanish', 'korean'].includes(language)) {
      return res.status(400).json({ message: "Invalid or missing language" });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    const segments = await LyricSegment.find({ songId }).sort({ segmentOrder: 1 });
    
    // Map lyrics with translations
    const targetTranslations = language === 'hindi' ? song.translations?.hindi : language === 'spanish' ? song.translations?.spanish : song.translations?.korean;
    const lyricsWithTranslations = segments.map(seg => {
      const translationObj = targetTranslations?.find((t: any) => t.order === seg.segmentOrder);
      return {
        english: seg.text,
        translation: translationObj ? translationObj.text : ""
      };
    }).filter(item => item.english);

    const lessonData = await generateSongLesson(language, song.title, song.artistName || '', lyricsWithTranslations);
    
    // Ensure all questions have a correctAnswer to satisfy Mongoose validation
    const sanitizedQuestions = lessonData.questions.map((q: any) => ({
      ...q,
      correctAnswer: q.correctAnswer || "N/A"
    }));

    // Create in_progress attempt
    const attempt = await LessonAttempt.create({
      userId: req.user._id,
      language,
      level: 'dynamic',
      questions: sanitizedQuestions,
      status: 'in_progress',
      startedAt: new Date()
    });

    res.status(200).json({ ...lessonData, attemptId: attempt._id });
  } catch (error) {
    console.error("Error generating song lesson:", error);
    res.status(500).json({ message: "Failed to generate lesson from song. Please try again.", error: (error as Error).message });
  }
});

// POST /api/lessons/generate-focus
router.post("/generate-focus", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { language, focusArea } = req.body;

    if (!['hindi', 'spanish', 'korean'].includes(language)) {
      return res.status(400).json({ message: "Invalid language" });
    }
    if (!focusArea) {
      return res.status(400).json({ message: "Focus area is required" });
    }

    const lessonData = await generateFocusLesson(language, focusArea);
    
    // Ensure all questions have a correctAnswer to satisfy Mongoose validation
    const sanitizedQuestions = lessonData.questions.map((q: any) => ({
      ...q,
      correctAnswer: q.correctAnswer || "N/A"
    }));

    // Create in_progress attempt
    const attempt = await LessonAttempt.create({
      userId: req.user._id,
      language,
      level: 'focus', // Changed from dynamic to distinguish from song lessons
      questions: sanitizedQuestions,
      status: 'in_progress',
      startedAt: new Date()
    });

    res.status(200).json({ ...lessonData, attemptId: attempt._id });
  } catch (error) {
    console.error("Error generating focus lesson:", error);
    res.status(500).json({ message: "Failed to generate focus lesson. Please try again.", error: (error as Error).message });
  }
});

// POST /api/lessons/submit
router.post("/submit", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { attemptId, language, level, questions, userAnswers, totalTimeSpentSeconds, cognitiveLoad, reflectionText } = req.body;

    if (!attemptId || !language || !questions || !userAnswers) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const attempt = await LessonAttempt.findById(attemptId);
    if (!attempt || attempt.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Attempt not found or unauthorized" });
    }

    let score = 0;
    const results = userAnswers.map((ua: any) => {
      const question = questions.find((q: any) => q.id === ua.questionId);
      if (!question) return { ...ua, isCorrect: false, timeSpentSeconds: ua.timeSpentSeconds || 0 };

      const cleanUser = ua.answer.trim().toLowerCase();
      const cleanCorrect = question.correctAnswer.trim().toLowerCase();
      let isCorrect = cleanUser === cleanCorrect;

      if (!isCorrect && language === 'hindi' && question.type === 'translate_word') {
        const matches = [...question.explanation.matchAll(/'([^']+)'/g)].map((m: any) => m[1].toLowerCase().trim());
        if (matches.includes(cleanUser)) {
          isCorrect = true;
        }
      }
      if (isCorrect) score++;

      return {
        questionId: ua.questionId,
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        timeSpentSeconds: ua.timeSpentSeconds || 0
      };
    });

    const xpEarned = score * 10;
    
    let textOnlyTimeSpentSeconds = 0;
    let textOnlyQuestionCount = 0;

    // Update the existing attempt
    attempt.userAnswers = results.map((r: any) => {
      const q = questions.find((q: any) => q.id === r.questionId);
      if (q && q.type !== 'listen_translate') {
        textOnlyTimeSpentSeconds += (r.timeSpentSeconds || 0);
        textOnlyQuestionCount++;
      }
      return {
        questionId: r.questionId,
        answer: userAnswers.find((ua: any) => ua.questionId === r.questionId)?.answer || '',
        isCorrect: r.isCorrect,
        timeSpentSeconds: r.timeSpentSeconds
      };
    });
    
    attempt.score = score;
    attempt.xpEarned = xpEarned;
    attempt.status = 'completed';
    attempt.completedAt = new Date();
    attempt.totalTimeSpentSeconds = totalTimeSpentSeconds || 0;
    attempt.avgTimePerTextQuestionSeconds = textOnlyQuestionCount > 0 ? (textOnlyTimeSpentSeconds / textOnlyQuestionCount) : 0;
    
    if (cognitiveLoad !== undefined) attempt.cognitiveLoad = cognitiveLoad;
    if (reflectionText !== undefined) attempt.reflectionText = reflectionText;

    await attempt.save();

    // Check if a badge was unlocked
    if (score >= 5) {
      const prevAttempts = await LessonAttempt.find({ 
        userId: req.user._id, 
        language: attempt.language,
        score: { $gte: 5 },
        status: 'completed',
        _id: { $ne: attempt._id }
      });
      
      const prevEasyCount = prevAttempts.filter(a => a.level === 'easy' || a.level === 'beginner').length;
      const prevInterCount = prevAttempts.filter(a => a.level === 'intermediate').length;
      const prevHardCount = prevAttempts.filter(a => a.level === 'hard').length;
      const prevFocusCount = prevAttempts.filter(a => a.level === 'focus').length;

      let newBadgeName = null;

      if ((attempt.level === 'easy' || attempt.level === 'beginner') && prevEasyCount === 0) {
        newBadgeName = 'Easy Explorer';
      } else if (attempt.level === 'intermediate' && prevInterCount === 1) {
        newBadgeName = 'Intermediate Scholar';
      } else if (attempt.level === 'hard' && prevHardCount === 2) {
        newBadgeName = 'Language Star';
      } else if (attempt.level === 'focus' && prevFocusCount === 0) {
        newBadgeName = 'Focus Scholar';
      }

      if (newBadgeName) {
        await Notification.create({
          userId: req.user._id,
          title: 'Badge Unlocked! 🎉',
          message: `Congratulations! You've unlocked the ${newBadgeName} badge in ${attempt.language}. Keep up the great work!`,
        });
      }
    }

    res.status(200).json({
      score,
      total: questions.length,
      xpEarned,
      results
    });
  } catch (error) {
    console.error("Error submitting lesson:", error);
    res.status(500).json({ message: "Failed to submit lesson." });
  }
});

// GET /api/lessons/history
router.get("/history", protect, async (req: AuthRequest, res: Response) => {
  try {
    const history = await LessonAttempt.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(20)
      .select('language level score xpEarned completedAt');

    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching lesson history:", error);
    res.status(500).json({ message: "Failed to fetch history." });
  }
});

// GET /api/lessons/attempt/:attemptId
router.get("/attempt/:attemptId", protect, async (req: AuthRequest, res: Response) => {
  try {
    const attempt = await LessonAttempt.findOne({ _id: req.params.attemptId, userId: req.user._id });
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    res.status(200).json(attempt);
  } catch (error) {
    console.error("Error fetching attempt details:", error);
    res.status(500).json({ message: "Failed to fetch attempt details." });
  }
});

// GET /api/lessons/progress - Get user's roadmap progress and badges
router.get("/progress", protect, async (req: AuthRequest, res: Response) => {
  try {
    const attempts = await LessonAttempt.find({ userId: req.user._id, score: { $gte: 5 } });

    const getProgressForLang = (lang: string) => {
      const langAttempts = attempts.filter(a => a.language === lang);

      const easyCount = langAttempts.filter(a => a.level === 'easy' || a.level === 'beginner').length;
      const intermediateCount = langAttempts.filter(a => a.level === 'intermediate').length;
      const hardCount = langAttempts.filter(a => a.level === 'hard').length;
      const focusCount = langAttempts.filter(a => a.level === 'focus').length;

      let currentStage = 'easy';
      const badges: string[] = [];

      if (easyCount >= 1) {
        badges.push('easy_explorer');
        currentStage = 'intermediate';
      }
      if (intermediateCount >= 2 && easyCount >= 1) {
        badges.push('intermediate_scholar');
        currentStage = 'hard';
      }
      if (hardCount >= 3 && intermediateCount >= 2 && easyCount >= 1) {
        badges.push('language_star');
        currentStage = 'completed';
      }
      if (focusCount >= 1) {
        badges.push('focus_scholar');
      }

      return {
        easyCompleted: Math.min(easyCount, 1),
        intermediateCompleted: Math.min(intermediateCount, 2),
        hardCompleted: Math.min(hardCount, 3),
        focusCompleted: focusCount,
        currentStage,
        badges
      };
    };

    res.status(200).json({
      hindi: getProgressForLang('hindi'),
      spanish: getProgressForLang('spanish'),
      korean: getProgressForLang('korean')
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/lessons/admin/progress/:userId - Get target user's progress (Admin only)
router.get("/admin/progress/:userId", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const attempts = await LessonAttempt.find({ userId: req.params.userId, score: { $gte: 5 } });

    const getProgressForLang = (lang: string) => {
      const langAttempts = attempts.filter(a => a.language === lang);

      const easyCount = langAttempts.filter(a => a.level === 'easy' || a.level === 'beginner').length;
      const intermediateCount = langAttempts.filter(a => a.level === 'intermediate').length;
      const hardCount = langAttempts.filter(a => a.level === 'hard').length;

      let currentStage = 'easy';
      const badges: string[] = [];

      if (easyCount >= 1) {
        badges.push('easy_explorer');
        currentStage = 'intermediate';
      }
      if (intermediateCount >= 2 && easyCount >= 1) {
        badges.push('intermediate_scholar');
        currentStage = 'hard';
      }
      if (hardCount >= 3 && intermediateCount >= 2 && easyCount >= 1) {
        badges.push('language_star');
        currentStage = 'completed';
      }

      return {
        easyCompleted: Math.min(easyCount, 1),
        intermediateCompleted: Math.min(intermediateCount, 2),
        hardCompleted: Math.min(hardCount, 3),
        currentStage,
        badges
      };
    };

    res.status(200).json({
      hindi: getProgressForLang('hindi'),
      spanish: getProgressForLang('spanish'),
      korean: getProgressForLang('korean')
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
