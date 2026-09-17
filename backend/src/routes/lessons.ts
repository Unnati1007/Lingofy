
import express, { Response } from "express";
import { protect, AuthRequest } from "../middleware/authMiddleware";
import LessonAttempt from "../models/LessonAttempt";
import { generateLesson, generateSongLesson } from "../services/lessonService";
import { generateFocusLesson } from "../services/focusAreaService";
import Song from "../models/music/Song";
import LyricSegment from "../models/music/LyricSegment";
import { adminOnly } from "../middleware/roleMiddleware";
import Notification from "../models/user/Notification";
import nodemailer from "nodemailer";
import User from "../models/user/User";

const router = express.Router();

// POST /api/lessons/generate
router.post("/generate", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { language, level } = req.body;

    if (!['hindi', 'spanish', 'korean'].includes(language)) {
      return res.status(400).json({ message: "Invalid language" });
    }

    const activeLevel = ['easy', 'intermediate', 'hard', 'pronunciation'].includes(level) ? level : 'easy';

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
    const isPronunciationMode = activeLevel === 'pronunciation';
    let musicPhrases: string[] = [];

    if (isMusicMode || isPronunciationMode) {
      // Pick random songs to get lyrics
      const songs = await Song.aggregate([{ $match: { language: new RegExp(`^${language}$`, 'i') } }, { $sample: { size: 2 } }]);
      if (songs.length > 0) {
        const songIds = songs.map(s => s._id);
        const segments = await LyricSegment.aggregate([
          { $match: { songId: { $in: songIds } } },
          { $sample: { size: 20 } }
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

    const langKey = (language || 'spanish').toLowerCase();

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    const segments = await LyricSegment.find({ songId }).sort({ segmentOrder: 1 });
    
    // Map lyrics with translations dynamically
    const targetTranslations = song.translations?.[langKey as keyof typeof song.translations] || song.translations?.spanish || song.translations?.hindi || song.translations?.korean;
    const lyricsWithTranslations = segments.map(seg => {
      const translationObj = Array.isArray(targetTranslations) 
        ? targetTranslations.find((t: any) => t.order === seg.segmentOrder)
        : null;
      return {
        english: seg.text,
        translation: translationObj ? translationObj.text : seg.text
      };
    }).filter(item => item.english);

    const lessonData = await generateSongLesson(langKey, song.title, song.artistName || '', lyricsWithTranslations);
    
    // Ensure all questions have a correctAnswer to satisfy Mongoose validation
    const sanitizedQuestions = lessonData.questions.map((q: any) => ({
      ...q,
      correctAnswer: q.correctAnswer || "N/A"
    }));

    // Create in_progress attempt
    const attempt = await LessonAttempt.create({
      userId: req.user._id,
      language: langKey,
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

    let musicPhrases: string[] = [];
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

    const lessonData = await generateFocusLesson(language, focusArea, musicPhrases);
    
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
      focusArea,
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
    let newBadgeName = null;
    let badgeEarned = null;
    
    const currentPct = questions.length > 0 ? score / questions.length : 0;

    const prevAttempts = await LessonAttempt.find({ 
      userId: req.user._id, 
      language: attempt.language,
      status: 'completed',
      _id: { $ne: attempt._id }
    });
    
    const prevEasyCount = prevAttempts.filter(a => (a.level === 'easy' || a.level === 'beginner') && a.score >= 5).length;
    const prevInterCount = prevAttempts.filter(a => a.level === 'intermediate' && a.score >= 5).length;
    const prevHardCount = prevAttempts.filter(a => a.level === 'hard' && a.score >= 5).length;
    const prevFocusCount = prevAttempts.filter(a => a.level === 'focus' && (a.questions && a.questions.length > 0 ? a.score / a.questions.length >= 0.6 : false)).length;
    const prevPronunciationCount = prevAttempts.filter(a => a.level === 'pronunciation' && (a.questions && a.questions.length > 0 ? a.score / a.questions.length >= 0.8 : false)).length;

    if (score >= 5 && (attempt.level === 'easy' || attempt.level === 'beginner') && prevEasyCount === 0) {
      newBadgeName = 'Easy Explorer';
      badgeEarned = 'easy_explorer';
    } else if (score >= 5 && attempt.level === 'intermediate' && prevInterCount === 1) {
      newBadgeName = 'Intermediate Scholar';
      badgeEarned = 'intermediate_scholar';
    } else if (score >= 5 && attempt.level === 'hard' && prevHardCount === 2) {
      newBadgeName = 'Language Star';
      badgeEarned = 'language_star';
    } else if (currentPct >= 0.6 && attempt.level === 'focus' && prevFocusCount === 3) {
      newBadgeName = 'Focus Scholar';
      badgeEarned = 'focus_scholar';
    } else if (currentPct >= 0.8 && attempt.level === 'pronunciation' && prevPronunciationCount === 0) {
      newBadgeName = 'Pronunciation Master';
      badgeEarned = 'Pronunciation Master';
    }

    if (newBadgeName) {
      await Notification.create({
        userId: req.user._id,
        title: 'Badge Unlocked! 🎉',
        message: `Congratulations! You've unlocked the ${newBadgeName} badge in ${attempt.language}. Keep up the great work!`,
      });

      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          const userObj = await User.findById(req.user._id);
          if (userObj && userObj.email) {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });
            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: userObj.email,
              subject: 'Badge Unlocked! 🎉',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <h2 style="color: #a855f7;">Badge Unlocked! 🎉</h2>
                  <p style="font-size: 16px; color: #333; line-height: 1.5;">Hello ${userObj.name},</p>
                  <p style="font-size: 16px; color: #333; line-height: 1.5;">Congratulations! You've unlocked the ${newBadgeName} badge in ${attempt.language}. Keep up the great work!</p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                  <p style="font-size: 12px; color: #999;">This is an automated message from Lingofy.</p>
                </div>
              `,
            };
            transporter.sendMail(mailOptions).catch(err => console.error('Error sending email:', err));
          }
        } catch (emailErr) {
          console.error("Email error:", emailErr);
        }
      }
    }

    res.status(200).json({
      score,
      total: questions.length,
      xpEarned,
      results,
      ...(badgeEarned && { badgeEarned })
    });
  } catch (error) {
    console.error("Error submitting lesson:", error);
    res.status(500).json({ message: "Failed to submit lesson." });
  }
});

// GET /api/lessons/history
router.get("/history", protect, async (req: AuthRequest, res: Response) => {
  try {
    const history = await LessonAttempt.find({ userId: req.user._id, $or: [{ status: 'completed' }, { score: { $gt: 0 } }] })
      .sort({ completedAt: -1 })
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
    const allAttempts = await LessonAttempt.find({ userId: req.user._id, $or: [{ status: 'completed' }, { score: { $gt: 0 } }] }).sort({ completedAt: -1 });
    const attempts = allAttempts.filter(a => a.score >= 5);

    // Calculate streak
    let streak = 0;
    if (allAttempts.length > 0) {
      const uniqueDays = Array.from(new Set(allAttempts.map(a => {
        const d = new Date(a.completedAt || a.startedAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })));

      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      if (uniqueDays.includes(todayStr) || uniqueDays.includes(yesterdayStr)) {
        let checkDate = new Date(today);
        if (!uniqueDays.includes(todayStr)) checkDate = new Date(yesterday);
        
        while (true) {
          const checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
          if (uniqueDays.includes(checkStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    const getProgressForLang = (lang: string) => {
      const langAttempts = allAttempts.filter(a => a.language === lang);

      const easyCount = langAttempts.filter(a => (a.level === 'easy' || a.level === 'beginner') && a.score >= 5).length;
      const intermediateCount = langAttempts.filter(a => a.level === 'intermediate' && a.score >= 5).length;
      const hardCount = langAttempts.filter(a => a.level === 'hard' && a.score >= 5).length;
      const focusCount = langAttempts.filter(a => a.level === 'focus' && (a.questions && a.questions.length > 0 ? a.score / a.questions.length >= 0.6 : false)).length;
      const pronunciationCount = langAttempts.filter(a => a.level === 'pronunciation' && (a.questions && a.questions.length > 0 ? a.score / a.questions.length >= 0.8 : false)).length;

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
      if (focusCount >= 4) {
        badges.push('focus_scholar');
      }
      if (pronunciationCount >= 1) {
        badges.push('Pronunciation Master');
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
      korean: getProgressForLang('korean'),
      streak
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/lessons/admin/progress/:userId - Get target user's progress (Admin only)
router.get("/admin/progress/:userId", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const allAttempts = await LessonAttempt.find({ userId: req.params.userId, $or: [{ status: 'completed' }, { score: { $gt: 0 } }] }).sort({ completedAt: -1 });

    const getProgressForLang = (lang: string) => {
      const langAttempts = allAttempts.filter(a => a.language === lang);

      const easyCount = langAttempts.filter(a => (a.level === 'easy' || a.level === 'beginner') && a.score >= 5).length;
      const intermediateCount = langAttempts.filter(a => a.level === 'intermediate' && a.score >= 5).length;
      const hardCount = langAttempts.filter(a => a.level === 'hard' && a.score >= 5).length;
      const focusCount = langAttempts.filter(a => a.level === 'focus' && (a.questions && a.questions.length > 0 ? a.score / a.questions.length >= 0.6 : false)).length;
      const pronunciationCount = langAttempts.filter(a => a.level === 'pronunciation' && (a.questions && a.questions.length > 0 ? a.score / a.questions.length >= 0.8 : false)).length;

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
      if (focusCount >= 4) {
        badges.push('focus_scholar');
      }
      if (pronunciationCount >= 1) {
        badges.push('Pronunciation Master');
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


// GET /api/lessons/retention/status - Check if user has past learning history for retention check
router.get("/retention/status", protect, async (req: AuthRequest, res: Response) => {
  try {
    const pastAttempts = await LessonAttempt.find({
      userId: req.user._id,
      status: 'completed'
    }).sort({ completedAt: -1 });

    if (!pastAttempts || pastAttempts.length === 0) {
      return res.status(200).json({
        hasHistory: false,
        totalQuizzesCompleted: 0
      });
    }

    const lastAttempt = pastAttempts[0];
    const lastCompletedAt = lastAttempt.completedAt || lastAttempt.startedAt;
    const now = new Date();
    const diffMs = now.getTime() - new Date(lastCompletedAt).getTime();
    const gapHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const gapDays = Math.floor(gapHours / 24);

    let gapFormatted = 'Just recently';
    if (gapDays >= 1) {
      gapFormatted = gapDays === 1 ? '1 day ago' : `${gapDays} days ago`;
    } else if (gapHours >= 1) {
      gapFormatted = gapHours === 1 ? '1 hour ago' : `${gapHours} hours ago`;
    } else {
      const gapMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      gapFormatted = `${gapMins} mins ago`;
    }

    // Collect all seen words
    const seenWords = new Set<string>();
    pastAttempts.forEach(att => {
      att.questions?.forEach((q: any) => {
        if (q.targetWord) seenWords.add(q.targetWord);
      });
    });

    res.status(200).json({
      hasHistory: true,
      totalQuizzesCompleted: pastAttempts.length,
      lastCompletedAt,
      gapHours,
      gapDays,
      gapFormatted,
      candidateWordCount: seenWords.size,
      mostPracticedLanguage: lastAttempt.language || req.user.learningLanguage || 'hindi'
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/lessons/retention/generate - Generate a Retention Flashback Quiz from previous sessions
router.post("/retention/generate", protect, async (req: AuthRequest, res: Response) => {
  try {
    const targetLang = req.body.language || req.user.learningLanguage || 'hindi';

    // Fetch past completed attempts for this user
    let pastAttempts = await LessonAttempt.find({
      userId: req.user._id,
      language: targetLang,
      status: 'completed'
    }).sort({ completedAt: -1 }).limit(30);

    // If no past attempts in this language, fetch across all languages
    if (pastAttempts.length === 0) {
      pastAttempts = await LessonAttempt.find({
        userId: req.user._id,
        status: 'completed'
      }).sort({ completedAt: -1 }).limit(30);
    }

    if (pastAttempts.length === 0) {
      return res.status(400).json({ message: "No previous quiz history found. Complete at least one regular quiz first!" });
    }

    const lastAttempt = pastAttempts[0];
    const diffMs = Date.now() - new Date(lastAttempt.completedAt || lastAttempt.startedAt).getTime();
    const gapHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const gapDays = Math.floor(gapHours / 24);
    let gapFormatted = gapDays >= 1 ? `${gapDays} day${gapDays > 1 ? 's' : ''} ago` : `${Math.max(1, gapHours)} hour${gapHours !== 1 ? 's' : ''} ago`;

    // Extract past questions
    const questionPool: any[] = [];
    const seenQuestionTexts = new Set<string>();

    // Prioritize questions from previous sessions
    pastAttempts.forEach((attempt) => {
      attempt.questions?.forEach((q: any) => {
        if (q && q.questionText && !seenQuestionTexts.has(q.questionText.trim())) {
          seenQuestionTexts.add(q.questionText.trim());
          questionPool.push({
            type: q.type || 'multiple_choice',
            questionText: q.questionText,
            targetWord: q.targetWord || '',
            options: q.options || [],
            correctAnswer: q.correctAnswer || '',
            explanation: q.explanation || 'Recall check from your previous session.'
          });
        }
      });
    });

    // Shuffle pool
    const shuffled = questionPool.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(10, shuffled.length)).map((q, idx) => ({
      id: idx + 1,
      ...q
    }));

    // If pool has fewer than 5 questions, supplement with fresh generated lesson
    let finalQuestions = selected;
    if (finalQuestions.length < 5) {
      const freshLesson = await generateLesson(targetLang as any, 'easy', [], 1, false, []);
      const additional = freshLesson.questions.slice(0, 10 - finalQuestions.length).map((q: any, i: number) => ({
        ...q,
        id: finalQuestions.length + i + 1
      }));
      finalQuestions = [...finalQuestions, ...additional];
    }

    const sanitizedQuestions = finalQuestions.map((q: any, idx: number) => ({
      id: idx + 1,
      type: q.type || 'multiple_choice',
      questionText: q.questionText,
      targetWord: q.targetWord || '',
      options: q.options && q.options.length > 0 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: q.correctAnswer || (q.options ? q.options[0] : 'N/A'),
      explanation: q.explanation || 'Recall review.'
    }));

    // Create in_progress retention attempt
    const attempt = await LessonAttempt.create({
      userId: req.user._id,
      language: targetLang,
      level: 'retention',
      retentionGapHours: gapHours,
      questions: sanitizedQuestions,
      status: 'in_progress',
      startedAt: new Date()
    });

    res.status(200).json({
      lessonTitle: `🧠 Memory Retention Flashback Quiz (${targetLang.toUpperCase()})`,
      language: targetLang,
      gapHours,
      gapDays,
      gapFormatted,
      questions: sanitizedQuestions,
      attemptId: attempt._id,
      totalQuestions: sanitizedQuestions.length
    });
  } catch (error: any) {
    console.error("Error generating retention lesson:", error);
    res.status(500).json({ message: "Failed to generate retention quiz.", error: error.message });
  }
});

// GET /api/lessons/retention/analytics - Retention analytics & memory curve
router.get("/retention/analytics", protect, async (req: AuthRequest, res: Response) => {
  try {
    const retentionAttempts = await LessonAttempt.find({
      userId: req.user._id,
      level: 'retention',
      status: 'completed'
    }).sort({ completedAt: -1 });

    const totalRetentionQuizzes = retentionAttempts.length;
    let totalScorePctSum = 0;

    const history = retentionAttempts.map(att => {
      const totalQ = att.questions?.length || 10;
      const score = att.score || 0;
      const pct = Math.round((score / totalQ) * 100);
      totalScorePctSum += pct;

      const gapHours = att.retentionGapHours || 0;
      const gapDays = Math.floor(gapHours / 24);
      const gapFormatted = gapDays >= 1 ? `${gapDays}d gap` : `${gapHours}h gap`;

      return {
        attemptId: att._id,
        language: att.language,
        date: att.completedAt || att.startedAt,
        score,
        totalQuestions: totalQ,
        retentionRate: pct,
        gapHours,
        gapDays,
        gapFormatted
      };
    });

    const averageRetentionRate = totalRetentionQuizzes > 0 ? Math.round(totalScorePctSum / totalRetentionQuizzes) : 0;

    // Memory Strength Level
    let memoryStrength = 'Needs Practice';
    if (averageRetentionRate >= 85) memoryStrength = 'Exceptional Recall 🧠✨';
    else if (averageRetentionRate >= 70) memoryStrength = 'Strong Retention 🚀';
    else if (averageRetentionRate >= 50) memoryStrength = 'Moderate Recall 📈';

    res.status(200).json({
      totalRetentionQuizzes,
      averageRetentionRate,
      memoryStrength,
      history
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

