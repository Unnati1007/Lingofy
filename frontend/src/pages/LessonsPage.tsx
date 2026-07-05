import { API_BASE } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, BookOpen, Music, BarChart2, Settings, LogOut, ChevronRight, X, Check, XCircle, Menu, ChevronLeft,
  Zap, Lock, Flame, Target, Award, Mic, HelpCircle
} from 'lucide-react';
import PronunciationSettingsModal from '../components/learning/PronunciationSettingsModal';

type ViewState = 'setup' | 'loading' | 'quiz' | 'hci_form' | 'results';
type Language = 'hindi' | 'spanish' | 'korean';

interface Question {
  id: number;
  type: 'multiple_choice' | 'fill_blank' | 'translate_word' | 'match_meaning' | 'listen_translate';
  questionText: string;
  targetWord: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sentence?: string;
}

const BADGES = [
  { id: 'easy', icon: '🎖️', name: 'Easy Explorer', desc: 'Completed Easy Basics', color: '#12d15e', bg: 'rgba(18,209,94,0.15)', level: 'easy' },
  { id: 'intermediate', icon: '🏆', name: 'Inter Scholar', desc: 'Completed Intermediate', color: '#a855f7', bg: 'rgba(168,85,247,0.15)', level: 'intermediate' },
  { id: 'star', icon: '⭐', name: 'Language Star', desc: 'Mastered all 3 Hard Quizzes', color: '#facc15', bg: 'rgba(250,204,21,0.15)', level: 'hard' },
  { id: 'focus', icon: '🎯', name: 'Focus Master', desc: 'Completed a Focus Area Quiz', color: '#ec4899', bg: 'rgba(236,72,153,0.15)', level: 'focus' },
];

const LessonsPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewState>('setup');
  const [language, setLanguage] = useState<Language | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [quizLevel, setQuizLevel] = useState<string>('easy');
  const [roadmapProgress, setRoadmapProgress] = useState<any>(null);
  const [lessonResults, setLessonResults] = useState<any>(null);
  const [selectedNodeIdx, setSelectedNodeIdx] = useState<number>(0);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [newBadgeEarned, setNewBadgeEarned] = useState<string | null>(null);
  const [confettiPieces, setConfettiPieces] = useState<any[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [totalStartTime, setTotalStartTime] = useState<number>(0);
  
  // Focus Area State
  const [activeTab, setActiveTab] = useState<'roadmap' | 'focus' | 'pronunciation'>('roadmap');
  const [focusArea, setFocusArea] = useState<string>('Vocabulary');
  const [showPronunciationModal, setShowPronunciationModal] = useState(false);
  
  // Pronunciation Speech State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  
  // HCI Research state
  const [cognitiveLoad, setCognitiveLoad] = useState<number>(3);
  const [reflectionText, setReflectionText] = useState<string>('');
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  // Ref to always hold latest answers (avoids stale closure in submit)
  const latestAnswersRef = useRef<any[]>([]);

  const startFocusLesson = async () => {
    if (!language) return;
    setView('loading');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/lessons/generate-focus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ language, focusArea })
      });
      if (!res.ok) throw new Error('Failed to generate focus lesson');
      const data = await res.json();
      setQuestions(data.questions);
      setAttemptId(data.attemptId);
      const now = Date.now();
      setQuestionStartTime(now);
      setTotalStartTime(now);
      setCurrentQuestionIdx(0);
      setUserAnswers([]);
      latestAnswersRef.current = [];
      setSelectedAnswer('');
      setIsAnswerChecked(false);
      setView('quiz');
    } catch (error) {
      console.error(error);
      alert("Couldn't generate focus lesson. Please try again.");
      setView('setup');
    }
  };

  const getRoadmapNodes = (progress: any) => {
    if (!progress) return [];
    const easyPassed = progress.easyCompleted >= 1;
    const interPassed = progress.intermediateCompleted >= 2;
    const hardCount = progress.hardCompleted;
    return [
      { id: 1, level: 'easy', title: 'Easy Basics', emoji: '🌱', description: 'Master basic vocabulary, common nouns, and greeting structures.', badge: { ...BADGES[0], earned: easyPassed }, isUnlocked: true, isCompleted: easyPassed, isActive: progress.currentStage === 'easy', stars: 1 },
      { id: 2, level: 'intermediate', title: 'Intermediate Grammar', emoji: '📚', description: 'Dynamic sentence framing, verb conjugations, and conversational phrases.', badge: { ...BADGES[1], earned: interPassed }, isUnlocked: easyPassed, isCompleted: interPassed, isActive: progress.currentStage === 'intermediate', stars: 2 },
      { id: 3, level: 'hard', title: 'Advanced Quiz 1', emoji: '🔥', description: 'First milestone of advanced lessons. Complex expressions and idioms.', badge: { ...BADGES[2], earned: hardCount >= 1 }, isUnlocked: interPassed, isCompleted: hardCount >= 1, isActive: progress.currentStage === 'hard' && hardCount === 0, stars: 3 },
      { id: 4, level: 'hard', title: 'Advanced Quiz 2', emoji: '⚡', description: 'Second milestone. Fluent sentence structuring and quick translations.', badge: { ...BADGES[2], earned: hardCount >= 2 }, isUnlocked: interPassed && hardCount >= 1, isCompleted: hardCount >= 2, isActive: progress.currentStage === 'hard' && hardCount === 1, stars: 3 },
      { id: 5, level: 'hard', title: 'Advanced Quiz 3', emoji: '👑', description: 'Final advanced milestone. Prove your skills and unlock Language Star!', badge: { ...BADGES[2], earned: hardCount >= 3 }, isUnlocked: interPassed && hardCount >= 2, isCompleted: hardCount >= 3, isActive: progress.currentStage === 'hard' && hardCount === 2, stars: 3 },
    ];
  };

  useEffect(() => {
    if (language && roadmapProgress) {
      const progress = roadmapProgress[language];
      if (progress) {
        const nodes = getRoadmapNodes(progress);
        const activeIdx = nodes.findIndex(n => n.isActive);
        if (activeIdx !== -1) { setSelectedNodeIdx(activeIdx); setQuizLevel(nodes[activeIdx].level); }
        else if (progress.currentStage === 'completed') { setSelectedNodeIdx(4); setQuizLevel('hard'); }
        else { setSelectedNodeIdx(0); setQuizLevel('easy'); }
      }
    }
  }, [language, roadmapProgress]);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/lessons/progress`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setRoadmapProgress(data); }
      
      const userRes = await fetch(`${API_BASE}/api/users/me`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (userRes.ok) {
        const user = await userRes.json();
        setCurrentUser(user);
      }
    } catch (err) { console.error(err); }
  };

  const calculateLevenshteinDistance = (a: string, b: string) => {
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) == a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
        }
      }
    }
    return matrix[b.length][a.length];
  };

  const checkPronunciationScore = (spokenText: string, targetText: string) => {
    const normalize = (t: string) => {
      // Remove text inside parentheses (e.g., "(peena)")
      let cleaned = t.replace(/\([^)]*\)/g, '');
      // Remove punctuation and lowercase
      return cleaned.toLowerCase().replace(/[.,!?¿¡"']/g, '').trim();
    };
    const spoken = normalize(spokenText);
    const target = normalize(targetText);
    
    const maxLen = Math.max(spoken.length, target.length);
    if (maxLen === 0) return 0;
    const distance = calculateLevenshteinDistance(spoken, target);
    const score = Math.max(0, 100 - (distance / maxLen) * 100);
    return Math.round(score);
  };

  const startListening = (targetWord: string) => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      alert('Speech Recognition is not supported in your browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'spanish' ? 'es-ES' : language === 'korean' ? 'ko-KR' : 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setPronunciationScore(null);
    };
    
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      const score = checkPronunciationScore(text, targetWord);
      setPronunciationScore(score);
      setSelectedAnswer(text); // Auto-fills the 'answer' for the generic Check handler
    };
    
    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  useEffect(() => {
    fetchProgress();
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get('language') as Language;
    const levelParam = params.get('level');
    if (langParam) {
      setLanguage(langParam);
      if (levelParam) { setQuizLevel(levelParam); startLesson(langParam, undefined, levelParam); }
    }
  }, []);

  const startLesson = async (overrideLang?: any, songIdParam?: string, levelParam?: string) => {
    const activeLang = (typeof overrideLang === 'string' ? overrideLang : null) || language;
    if (!activeLang) return;
    setView('loading');
    const activeLevel = levelParam || quizLevel || 'easy';
    setQuizLevel(activeLevel);
    try {
      const token = localStorage.getItem('token');
      const hasSong = songIdParam || new URLSearchParams(window.location.search).get('songId');
      const endpoint = hasSong ? `${API_BASE}/api/lessons/generate-from-song` : `${API_BASE}/api/lessons/generate`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ language: activeLang, level: activeLevel, songId: hasSong || undefined })
      });
      if (!res.ok) throw new Error('Failed to generate lesson');
      const data = await res.json();
      setQuestions(data.questions);
      setAttemptId(data.attemptId);
      const now = Date.now();
      setQuestionStartTime(now);
      setTotalStartTime(now);
      setCurrentQuestionIdx(0);
      setUserAnswers([]);
      latestAnswersRef.current = []; // reset ref on new lesson
      setSelectedAnswer('');
      setIsAnswerChecked(false);
      setView('quiz');
    } catch (error) {
      console.error(error);
      alert("Couldn't generate lesson. Please try again.");
      setView('setup');
    }
  };

  const handleCheck = () => {
    if (isAnswerChecked) {
      if (currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
        setSelectedAnswer('');
        setIsAnswerChecked(false);
        setQuestionStartTime(Date.now());
      } else {
        // Show HCI Form before final submit
        setView('hci_form');
      }
    } else {
      if (!selectedAnswer) return;
      const question = questions[currentQuestionIdx];
      const cleanUser = selectedAnswer.trim().toLowerCase();
      const cleanCorrect = question.correctAnswer.trim().toLowerCase();
      const timeSpentSeconds = Math.round((Date.now() - questionStartTime) / 1000);

      let isCorrect = cleanUser === cleanCorrect;
      if (!isCorrect && language === 'hindi' && question.type === 'translate_word') {
        const matches = [...question.explanation.matchAll(/'([^']+)'/g)].map(m => m[1].toLowerCase().trim());
        if (matches.includes(cleanUser)) isCorrect = true;
      }
      const newAnswer = { questionId: question.id, answer: selectedAnswer, isCorrect, timeSpentSeconds };
      const updatedAnswers = [...userAnswers, newAnswer];
      latestAnswersRef.current = updatedAnswers; // sync ref immediately
      setUserAnswers(updatedAnswers);
      setIsAnswerChecked(true);
    }
  };

  const toggleLearningMode = async () => {
    if (!currentUser) return;
    const newMode = currentUser.learningMode === 'music' ? 'traditional' : 'music';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/users/me/mode`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode })
      });
      if (res.ok) {
        const data = await res.json();
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 300);
        setCurrentUser({ ...currentUser, learningMode: data.mode });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitLesson = async (answersToSubmit?: any[]) => {
    const finalAnswers = answersToSubmit ?? userAnswers;
    const activeLang = language;

    if (!activeLang) {
      alert('Language not set. Please restart the lesson.');
      setView('setup');
      return;
    }

    setView('loading');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/lessons/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          attemptId,
          language: activeLang, 
          level: quizLevel, 
          questions, 
          userAnswers: finalAnswers,
          totalTimeSpentSeconds: Math.round((Date.now() - totalStartTime) / 1000),
          cognitiveLoad,
          reflectionText
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Server error ${res.status}`);
      }
      const data = await res.json();
      setLessonResults(data);
      await fetchProgress();

      const passed = data.score >= 6;
      if (passed) {
        // Show celebration popup before results
        if (data.badgeEarned) setNewBadgeEarned(data.badgeEarned);
        setCelebrationData(data);
        setShowCelebration(true);
        launchConfetti();
      } else {
        setView('results');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      alert(`Couldn't submit lesson: ${error.message}`);
      setView('setup');
    }
  };

  const launchConfetti = () => {
    const pieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ['#12d15e', '#facc15', '#a855f7', '#ef4444', '#3b82f6', '#f97316'][Math.floor(Math.random() * 6)],
      delay: Math.random() * 1.5,
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
    }));
    setConfettiPieces(pieces);
    setTimeout(() => setConfettiPieces([]), 4000);
  };

  const exitLesson = () => {
    if (view === 'quiz') { if (window.confirm("Leave lesson? Your progress will be lost.")) setView('setup'); }
    else setView('setup');
  };

  const playAudio = (text: string, lang: Language) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hindi' ? 'hi-IN' : lang === 'spanish' ? 'es-ES' : 'ko-KR';
    utterance.rate = 0.85; // slightly slower for learners
    window.speechSynthesis.speak(utterance);
  };

  const renderCelebration = () => {
    if (!showCelebration || !celebrationData) return null;
    const score = celebrationData.score;
    const total = celebrationData.total || 10;
    const xp = celebrationData.xpEarned;
    const pct = score / total;
    const stars = pct >= 0.8 ? 3 : pct >= 0.6 ? 2 : 1;
    const levelColors: Record<string, string> = { easy: '#12d15e', intermediate: '#a855f7', hard: '#ef4444' };
    const levelColor = levelColors[quizLevel] || '#12d15e';
    const levelEmojis: Record<string, string> = { easy: '🌱', intermediate: '📚', hard: '🔥' };
    const levelEmoji = levelEmojis[quizLevel] || '🏆';
    const badgeInfo = newBadgeEarned
      ? BADGES.find(b => b.level === quizLevel) || null
      : null;

    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fade-in 0.3s ease'
      }}>
        {/* Confetti layer */}
        {confettiPieces.map(p => (
          <div key={p.id} style={{
            position: 'fixed', top: '-20px', left: `${p.x}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            background: p.color, borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti-fall 3s ${p.delay}s ease-in forwards`,
            transform: `rotate(${p.rotation}deg)`, pointerEvents: 'none'
          }} />
        ))}

        {/* Modal card */}
        <div style={{
          background: 'linear-gradient(145deg, #0d0d0d 0%, #1a1a1a 100%)',
          border: `1px solid ${levelColor}30`,
          borderRadius: '32px',
          padding: '48px 40px',
          maxWidth: '460px',
          width: '90%',
          textAlign: 'center',
          boxShadow: `0 0 80px ${levelColor}25, 0 32px 80px rgba(0,0,0,0.6)`,
          position: 'relative',
          overflow: 'hidden',
          animation: 'pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1)'
        }}>
          {/* Glowing top ring */}
          <div style={{
            position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
            width: '200px', height: '200px', borderRadius: '50%',
            background: `radial-gradient(circle, ${levelColor}20 0%, transparent 70%)`,
            pointerEvents: 'none'
          }} />

          {/* Bouncing trophy + emoji */}
          <div style={{ fontSize: '72px', marginBottom: '8px', animation: 'bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}>
            🏆
          </div>
          <div style={{ fontSize: '28px', marginBottom: '20px', animation: 'bounce-in 0.5s ease 0.3s both' }}>
            {levelEmoji}
          </div>

          <h2 style={{
            fontSize: '30px', fontWeight: '900', margin: '0 0 6px 0',
            background: `linear-gradient(135deg, #fff 0%, ${levelColor} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'fade-in 0.4s ease 0.2s both'
          }}>
            Stage Passed! 🎉
          </h2>
          <p style={{ opacity: 0.5, fontSize: '14px', margin: '0 0 28px 0', animation: 'fade-in 0.4s ease 0.3s both' }}>
            {pct >= 0.9 ? 'Absolutely brilliant! Perfect near-score!' : pct >= 0.8 ? 'Excellent work, keep it up!' : 'Well done! You cleared the threshold!'}
          </p>

          {/* Score circle */}
          <div style={{
            width: '110px', height: '110px', borderRadius: '50%', margin: '0 auto 24px',
            background: `conic-gradient(${levelColor} ${pct * 360}deg, rgba(255,255,255,0.06) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 32px ${levelColor}40`,
            animation: 'fade-in 0.5s ease 0.4s both', position: 'relative'
          }}>
            <div style={{
              width: '86px', height: '86px', borderRadius: '50%',
              background: '#111', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#fff' }}>{score}/{total}</div>
              <div style={{ fontSize: '11px', color: levelColor, fontWeight: '700' }}>+{xp} XP</div>
            </div>
          </div>

          {/* Stars */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
            {[1,2,3].map(i => (
              <span key={i} style={{
                fontSize: '36px',
                opacity: i <= stars ? 1 : 0.12,
                filter: i <= stars ? 'drop-shadow(0 0 8px #facc15)' : 'grayscale(1)',
                animation: i <= stars ? `star-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${0.5 + i * 0.15}s both` : 'none'
              }}>⭐</span>
            ))}
          </div>

          {/* Badge earned reveal */}
          {badgeInfo && (
            <div style={{
              background: `${badgeInfo.bg}`, border: `1px solid ${badgeInfo.color}40`,
              borderRadius: '16px', padding: '14px 20px', marginBottom: '24px',
              display: 'flex', alignItems: 'center', gap: '14px',
              animation: 'pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.8s both'
            }}>
              <span style={{ fontSize: '36px', filter: `drop-shadow(0 0 12px ${badgeInfo.color})` }}>{badgeInfo.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '11px', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>🏅 New Badge Unlocked!</div>
                <div style={{ fontWeight: '800', fontSize: '16px', color: badgeInfo.color }}>{badgeInfo.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.55, marginTop: '2px' }}>{badgeInfo.desc}</div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => { setShowCelebration(false); setView('setup'); }}
              style={{
                flex: 1, padding: '14px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
              }}
              className="btn-hover"
            >
              Back to Map
            </button>
            <button
              onClick={() => { setShowCelebration(false); setView('results'); }}
              style={{
                flex: 1, padding: '14px', borderRadius: '14px',
                background: levelColor, border: 'none',
                color: '#000', fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: `0 8px 24px ${levelColor}40`
              }}
              className="btn-hover"
            >
              View Results →
            </button>
          </div>
        </div>

        <style>{`
          @keyframes pop-in { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
          @keyframes bounce-in { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
          @keyframes star-pop { 0% { transform: scale(0) rotate(-30deg); opacity: 0; } 70% { transform: scale(1.3) rotate(5deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
          @keyframes confetti-fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
          @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    );
  };

  // ─── RENDER HELPERS ───────────────────────────────────────────────

  const renderSetup = () => {
    if (!language) {
      return (
        <div style={{ 
          height: 'calc(100vh - 80px)', 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          position: 'relative',
          padding: '20px 10px',
          overflow: 'hidden'
        }}>
          {/* Add some ambient background glows */}
          <div style={{ position: 'absolute', top: '20%', left: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,153,51,0.05) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(198,11,30,0.05) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

          <div style={{ textAlign: 'center', marginBottom: '24px', zIndex: 1 }}>
            <div style={{ fontSize: '40px', marginBottom: '8px', animation: 'float 3s ease-in-out infinite' }}>🌎</div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 8px 0', background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
              Choose Your Journey
            </h1>
            <p style={{ opacity: 0.6, fontSize: '14px', maxWidth: '500px', margin: '0 auto', lineHeight: '1.4' }}>
              Select a language to unlock your interactive roadmap, practice specific focus areas, and earn exclusive badges.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', zIndex: 1, flexWrap: 'wrap' }}>
            {[
              { lang: 'hindi' as Language, img: 'https://flagcdn.com/w160/in.png', name: 'Hindi', sub: 'हिन्दी', level: 'N3 Level', color: '#ff9933', glow: 'rgba(255,153,51,0.2)' },
              { lang: 'spanish' as Language, img: 'https://flagcdn.com/w160/es.png', name: 'Spanish', sub: 'Español', level: 'A2 Level', color: '#c60b1e', glow: 'rgba(198,11,30,0.2)' },
              { lang: 'korean' as Language, img: 'https://flagcdn.com/w160/kr.png', name: 'Korean', sub: '한국어', level: 'TOPIK 2', color: '#3b82f6', glow: 'rgba(59,130,246,0.2)' },
            ].map(({ lang, img, name, sub, level, color, glow }) => {
              const prog = roadmapProgress?.[lang];
              const completedCount = prog ? Math.min(prog.easyCompleted, 1) + Math.min(prog.intermediateCompleted, 2) + Math.min(prog.hardCompleted, 3) + Math.min(prog.focusCompleted, 1) : 0;
              const totalNodes = 7; // 1 easy + 2 int + 3 hard + 1 focus

              return (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: lang === 'hindi' ? 0.1 : 0.2, ease: "easeOut" }}
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className="premium-lang-card"
                  style={{
                    width: '280px', 
                    padding: '24px 20px', 
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                    border: '1px solid rgba(255,255,255,0.08)', 
                    borderRadius: '24px',
                    cursor: 'pointer', 
                    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div className="card-glow" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: `radial-gradient(circle at 50% 0%, ${glow} 0%, transparent 70%)`, opacity: 0, transition: 'opacity 0.4s ease' }} />
                  
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: `3px solid rgba(255,255,255,0.1)`, boxShadow: `0 8px 24px ${glow}`, flexShrink: 0, zIndex: 1 }}>
                    <img src={img} alt={`${name} flag`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  
                  <div style={{ textAlign: 'center', zIndex: 1 }}>
                    <div style={{ fontWeight: '900', fontSize: '20px', color: '#fff', letterSpacing: '0.5px' }}>{name}</div>
                    <div style={{ fontSize: '12px', color, fontWeight: '700', marginTop: '2px', letterSpacing: '1px', textTransform: 'uppercase' }}>{sub}</div>
                  </div>

                  {prog ? (
                    <div style={{ width: '100%', zIndex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '20px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>
                        <span>Progress</span><span>{Math.round((completedCount/totalNodes)*100)}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(completedCount / totalNodes) * 100}%`, background: color, borderRadius: '100px', transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
                        {BADGES.map((b, i) => {
                          const earned = i === 0 ? prog.easyCompleted >= 1 
                                     : i === 1 ? prog.intermediateCompleted >= 2 
                                     : i === 2 ? prog.hardCompleted >= 3 
                                     : prog.focusCompleted >= 1;
                          return (
                            <span key={b.id} title={b.name} style={{ 
                              fontSize: '14px', 
                              opacity: earned ? 1 : 0.2, 
                              filter: earned ? `drop-shadow(0 2px 4px ${b.color}80)` : 'grayscale(1)', 
                              transition: 'all 0.3s' 
                            }}>
                              {b.icon}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div style={{ zIndex: 1, padding: '12px', opacity: 0.5, fontSize: '12px', textAlign: 'center' }}>
                      Ready to begin your {name} learning journey?
                    </div>
                  )}

                  <div className="start-btn" style={{ 
                    marginTop: 'auto', zIndex: 1, width: '100%',
                    background: prog ? 'rgba(255,255,255,0.1)' : color, 
                    color: '#fff', padding: '10px 16px', borderRadius: '12px', 
                    fontWeight: '800', fontSize: '13px', textAlign: 'center',
                    border: prog ? '1px solid rgba(255,255,255,0.2)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {prog ? 'Continue Journey →' : 'Start Journey →'}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <style>{`
            @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
            .premium-lang-card:hover { 
              transform: translateY(-12px) scale(1.02); 
              border-color: rgba(255,255,255,0.2) !important; 
              box-shadow: 0 32px 64px rgba(0,0,0,0.4) !important; 
            }
            .premium-lang-card:hover .card-glow { opacity: 1 !important; }
            .premium-lang-card:hover .start-btn { background: #fff !important; color: #000 !important; }
          `}</style>
        </div>
      );
    }

    const progress = roadmapProgress?.[language];
    const nodes = getRoadmapNodes(progress);
    const selectedNode = nodes[selectedNodeIdx];
    const totalXP = progress ? (progress.easyCompleted * 100) + (progress.intermediateCompleted * 150) + (progress.hardCompleted * 200) : 0;
    const totalCompleted = progress ? Math.min(progress.easyCompleted, 1) + Math.min(progress.intermediateCompleted, 2) + Math.min(progress.hardCompleted || 0, 3) : 0;
    const streak = Math.floor(Math.random() * 7) + 1; // TODO: pull from API

    return (
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
        {/* ── Top Header ─────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setLanguage(null)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              className="btn-hover"
            >
              ← Languages
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '36px' }}>{language === 'hindi' ? '🇮🇳' : language === 'spanish' ? '🇪🇸' : '🇰🇷'}</span>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, textTransform: 'capitalize' }}>{language} Journey</h1>
                <p style={{ margin: 0, fontSize: '13px', opacity: 0.5 }}>
                  {progress?.currentStage === 'completed' ? '🏆 All stages mastered!' : `Current: ${(progress?.currentStage || 'easy').charAt(0).toUpperCase() + (progress?.currentStage || 'easy').slice(1)} Stage`}
                </p>
              </div>
            </div>
          </div>

          {/* XP & Streak pills */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.2)', padding: '8px 16px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} color="#facc15" fill="#facc15" />
              <span style={{ color: '#facc15', fontWeight: '800', fontSize: '14px' }}>{totalXP} XP</span>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 16px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={14} color="#ef4444" />
              <span style={{ color: '#ef4444', fontWeight: '800', fontSize: '14px' }}>{streak} day streak</span>
            </div>
            <div style={{ background: 'rgba(18,209,94,0.1)', border: '1px solid rgba(18,209,94,0.2)', padding: '8px 16px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={14} color="#12d15e" />
              <span style={{ color: '#12d15e', fontWeight: '800', fontSize: '14px' }}>{totalCompleted}/6 Done</span>
            </div>
          </div>
        </div>

        {/* ── Tabs ──────────────────────── */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
          <button
            onClick={() => setActiveTab('roadmap')}
            style={{ background: 'transparent', border: 'none', color: activeTab === 'roadmap' ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', padding: '8px 16px', borderBottom: activeTab === 'roadmap' ? '2px solid #12d15e' : '2px solid transparent', transition: 'all 0.2s' }}
          >
            Learning Roadmap
          </button>
          <button
            onClick={() => setActiveTab('focus')}
            style={{ background: 'transparent', border: 'none', color: activeTab === 'focus' ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', padding: '8px 16px', borderBottom: activeTab === 'focus' ? '2px solid #a855f7' : '2px solid transparent', transition: 'all 0.2s' }}
          >
            Focus Area
          </button>
          <button
            onClick={() => setActiveTab('pronunciation')}
            style={{ background: 'transparent', border: 'none', color: activeTab === 'pronunciation' ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', padding: '8px 16px', borderBottom: activeTab === 'pronunciation' ? '2px solid #eab308' : '2px solid transparent', transition: 'all 0.2s' }}
          >
            Pronunciation
          </button>
        </div>

        {/* Pronunciation Settings Modal */}
        {showPronunciationModal && (
          <PronunciationSettingsModal
            onClose={() => setShowPronunciationModal(false)}
            onSave={(settings: any) => {
              setShowPronunciationModal(false);
              setQuizLevel('pronunciation');
              startLesson(language, undefined, 'pronunciation');
            }}
          />
        )}

        {/* ── Main content (Flex to take remaining height) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'roadmap' ? '1fr 380px' : '1fr', gap: '24px', flex: 1, minHeight: 0 }} className="lessons-main-grid">
          
          {/* Left: Content Area */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            
            {activeTab === 'roadmap' ? (
              <>
                {/* Horizontal Roadmap Nodes */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, gap: '20px', position: 'relative' }}>
                  {/* Horizontal Connector Line */}
                  <div style={{ position: 'absolute', top: '50%', left: '40px', right: '40px', height: '3px', background: 'rgba(255,255,255,0.06)', zIndex: 1, transform: 'translateY(-50%)' }}>
                    {progress && (() => {
                      const completedPct = nodes.filter(n => n.isCompleted).length;
                      return <div style={{ height: '100%', width: `${(completedPct / 4) * 100}%`, background: 'linear-gradient(90deg, #12d15e, #a855f7)', boxShadow: '0 0 12px rgba(18,209,94,0.4)', transition: 'width 0.8s ease', borderRadius: '4px' }} />;
                    })()}
                  </div>

                  {/* Nodes */}
                  {nodes.map((node, index) => {
                    const isSelected = selectedNodeIdx === index;
                    const isHovered = hoveredNode === index;
                    
                    let nodeColor = 'rgba(255,255,255,0.04)';
                    let nodeBorder = '2px solid rgba(255,255,255,0.08)';
                    let textColor = 'rgba(255,255,255,0.25)';
                    let glow = 'none';
                    let levelColor = '#12d15e';
                    if (node.level === 'intermediate') levelColor = '#a855f7';
                    if (node.level === 'hard') levelColor = '#ef4444';

                    if (node.isCompleted) { nodeColor = levelColor; nodeBorder = `2px solid ${levelColor}`; textColor = '#000'; glow = `0 0 24px ${levelColor}50`; }
                    else if (node.isActive) { nodeColor = '#111'; nodeBorder = `3px solid ${levelColor}`; textColor = levelColor; glow = `0 0 28px ${levelColor}60`; }
                    else if (!node.isUnlocked) { nodeColor = 'rgba(255,255,255,0.01)'; nodeBorder = '2px dashed rgba(255,255,255,0.06)'; }
                    if (isSelected || isHovered) { glow = `0 0 32px ${levelColor}80`; nodeBorder = `3px solid ${levelColor}`; }

                    return (
                      <div
                        key={node.id}
                        onClick={() => { if (node.isUnlocked) { setSelectedNodeIdx(index); setQuizLevel(node.level); } }}
                        onMouseEnter={() => setHoveredNode(index)}
                        onMouseLeave={() => setHoveredNode(null)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2, cursor: node.isUnlocked ? 'pointer' : 'not-allowed', width: '80px' }}
                      >
                        {/* Node Circle */}
                        <div style={{
                          width: '56px', height: '56px', borderRadius: '50%', background: nodeColor, border: nodeBorder,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                          boxShadow: glow, transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                          transform: (isSelected || isHovered) && node.isUnlocked ? 'scale(1.15)' : 'scale(1)',
                          marginBottom: '12px'
                        }}>
                          {node.isCompleted ? <Check size={24} color={textColor} strokeWidth={3} /> : !node.isUnlocked ? <Lock size={16} color="rgba(255,255,255,0.15)" /> : node.emoji}
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: node.isUnlocked ? '#fff' : 'rgba(255,255,255,0.2)', transition: 'color 0.3s', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {node.title.replace('Advanced', 'Adv.')}
                        </div>
                        {node.isActive && (
                          <div style={{ position: 'absolute', top: '0', width: '56px', height: '56px', borderRadius: '50%', border: `2px solid ${levelColor}`, animation: 'pulse-ring 2s infinite', opacity: 0.4, pointerEvents: 'none' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Stats Row Compact */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: 'auto' }}>
                  {[
                    { label: 'Easy Quizzes', value: progress.easyCompleted, max: 1, color: '#12d15e', icon: '🌱', passed: progress.easyCompleted >= 1 },
                    { label: 'Intermediate', value: progress.intermediateCompleted, max: 2, color: '#a855f7', icon: '📚', passed: progress.intermediateCompleted >= 2 },
                    { label: 'Hard Quizzes', value: progress.hardCompleted, max: 3, color: '#ef4444', icon: '🔥', passed: progress.hardCompleted >= 3 },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${stat.passed ? stat.color + '40' : 'rgba(255,255,255,0.05)'}`, borderRadius: '16px', padding: '12px', position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, height: '2px', width: `${(stat.value / stat.max) * 100}%`, background: stat.color, transition: 'width 0.8s ease' }} />
                      <div>
                        <div style={{ fontSize: '10px', opacity: 0.4, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{stat.label}</div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: stat.passed ? stat.color : '#fff' }}>{stat.value}<span style={{ fontSize: '12px', opacity: 0.4 }}>/{stat.max}</span></div>
                      </div>
                      <div style={{ fontSize: '20px', opacity: stat.passed ? 1 : 0.2 }}>{stat.icon}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : activeTab === 'focus' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 8px 0' }}>Targeted Practice</h2>
                <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '32px' }}>Hone specific skills with specialized exercises using our advanced AI tutor.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                  {[
                    { id: 'Vocabulary', icon: '📝', desc: 'Expand your word knowledge' },
                    { id: 'Listening', icon: '🎧', desc: 'Improve audio comprehension' },
                    { id: 'Grammar', icon: '📐', desc: 'Master sentence structure' },
                    { id: 'Culture (idioms, slangs)', icon: '🎭', desc: 'Learn idioms and slangs' },
                  ].map(fa => (
                    <div 
                      key={fa.id}
                      onClick={() => setFocusArea(fa.id)}
                      style={{ 
                        background: focusArea === fa.id ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)', 
                        border: `2px solid ${focusArea === fa.id ? '#a855f7' : 'rgba(255,255,255,0.08)'}`, 
                        borderRadius: '16px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '24px' }}>{fa.icon}</span>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${focusArea === fa.id ? '#a855f7' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {focusArea === fa.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#a855f7' }} />}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '15px', color: focusArea === fa.id ? '#fff' : 'rgba(255,255,255,0.8)' }}>{fa.id}</div>
                        <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '2px' }}>{fa.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={startFocusLesson}
                  style={{
                    width: '100%', background: '#a855f7', color: '#fff', border: 'none', padding: '16px', borderRadius: '16px',
                    fontWeight: '800', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 8px 24px rgba(168,85,247,0.3)', transition: 'all 0.3s'
                  }}
                  className="btn-hover"
                >
                  <Target size={20} /> Start {focusArea} Practice
                </button>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Pronunciation Mode 🎙️</h2>
                <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '32px' }}>Perfect your accent and spoken language skills.</p>
                
                <div style={{ display: 'flex', gap: '24px', flexDirection: 'column', maxWidth: '600px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(234, 179, 8, 0.2)', border: '2px solid #eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                      🗣️
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Start Pronunciation Practice</h3>
                      <p style={{ fontSize: '14px', opacity: 0.6, margin: 0 }}>Engage in audio-first lessons that focus purely on speaking and listening.</p>
                    </div>
                    <button 
                      onClick={() => setShowPronunciationModal(true)}
                      className="btn-hover"
                      style={{ background: '#eab308', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Practice Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Detail + Badges Panel */}
          {activeTab === 'roadmap' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
              
              {/* Selected Node Card */}
              {selectedNode && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', boxShadow: '0 8px 40px rgba(0,0,0,0.4)', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{
                    background: selectedNode.level === 'easy' ? 'rgba(18,209,94,0.12)' : selectedNode.level === 'intermediate' ? 'rgba(168,85,247,0.12)' : 'rgba(239,68,68,0.12)',
                    color: selectedNode.level === 'easy' ? '#12d15e' : selectedNode.level === 'intermediate' ? '#a855f7' : '#ef4444',
                    padding: '4px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>
                    {selectedNode.level} Stage
                  </span>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[1,2,3].map(s => <span key={s} style={{ fontSize: '12px', color: s <= selectedNode.stars ? '#facc15' : 'rgba(255,255,255,0.1)' }}>★</span>)}
                  </div>
                </div>

                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{selectedNode.emoji}</div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0' }}>{selectedNode.title}</h2>
                <p style={{ opacity: 0.6, fontSize: '12px', lineHeight: '1.5', margin: '0 0 16px 0' }}>{selectedNode.description}</p>

                <button
                  onClick={() => startLesson(language, undefined, selectedNode.level)}
                  disabled={!selectedNode.isUnlocked}
                  style={{
                    width: '100%', background: selectedNode.isUnlocked ? (selectedNode.level === 'easy' ? '#12d15e' : selectedNode.level === 'intermediate' ? '#a855f7' : '#ef4444') : 'rgba(255,255,255,0.05)',
                    color: selectedNode.isUnlocked ? '#000' : 'rgba(255,255,255,0.2)', border: 'none', padding: '14px', borderRadius: '14px',
                    fontWeight: '800', fontSize: '14px', cursor: selectedNode.isUnlocked ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: selectedNode.isUnlocked ? '0 8px 24px rgba(0,0,0,0.3)' : 'none', transition: 'all 0.3s'
                  }}
                  className={selectedNode.isUnlocked ? 'btn-hover' : ''}
                >
                  {selectedNode.isUnlocked ? (
                    <><BookOpen size={16} /> {selectedNode.isCompleted ? 'Practice Again' : `Start ${selectedNode.title}`} <ChevronRight size={16} /></>
                  ) : (
                    <><Lock size={14} /> Complete previous stage</>
                  )}
                </button>
              </div>
            )}

            </div>
          )}
        </div>

        <style>{`
          @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.5; } 70% { transform: scale(1.3); opacity: 0; } 100% { transform: scale(1.3); opacity: 0; } }
          .lessons-main-grid { @media (max-width: 900px) { grid-template-columns: 1fr !important; } }
          .btn-hover:hover { filter: brightness(1.12); transform: translateY(-2px); }
          /* Custom scrollbar for inner areas if they overflow */
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        `}</style>
      </div>
    );
  };

  const renderLoading = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: '24px' }}>
      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
        <img src="/Logo-1.png" alt="Loading" style={{ width: '80px', position: 'absolute', top: '10px', left: '10px', animation: 'float 2s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#12d15e', animation: 'spin 1s linear infinite' }} />
      </div>
      <div style={{ fontSize: '18px', color: '#9ca3af', fontWeight: '600' }}>Preparing your lesson...</div>
      <div style={{ fontSize: '13px', opacity: 0.4 }}>Generating AI-powered questions</div>
      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  const renderQuiz = () => {
    const question = questions[currentQuestionIdx];
    if (!question) return null;
    const progressPct = (currentQuestionIdx / (questions.length || 10)) * 100;
    const typeColor = question.type === 'fill_blank' ? '#22c55e' : question.type === 'listen_translate' ? '#a855f7' : '#1a73e8';
    const typeLabel = question.type === 'multiple_choice' ? 'Choose the correct answer' : question.type === 'fill_blank' ? 'Complete the sentence' : question.type === 'translate_word' ? 'Translate this word' : question.type === 'listen_translate' ? 'Listen and Translate' : 'Match the meaning';

    const renderPronunciationQuiz = () => {
      // The target word for pronunciation practice
      const targetPhrase = question.targetWord || question.questionText || '';
      
      // Determine if they passed based on pronunciationScore
      // Since it's automated, we assume the user checks the answer by clicking a button after speaking
      const handleVoiceCheck = () => {
        if (!transcript) return;
        // In checkPronunciationScore, we get 0-100.
        // We'll consider > 70 as correct.
        const isCorrect = (pronunciationScore || 0) > 60;
        
        const answerData = {
          questionId: question.id,
          answer: transcript,
          isCorrect,
          timeTaken: Math.round((Date.now() - questionStartTime) / 1000)
        };
        const newAnswers = [...userAnswers, answerData];
        setUserAnswers(newAnswers);
        latestAnswersRef.current = newAnswers;
        setIsAnswerChecked(true);
      };

      const handleNextVoice = () => {
        if (currentQuestionIdx < questions.length - 1) {
          setCurrentQuestionIdx(prev => prev + 1);
          setIsAnswerChecked(false);
          setTranscript('');
          setPronunciationScore(null);
          setSelectedAnswer('');
          setQuestionStartTime(Date.now());
        } else {
          submitLesson(latestAnswersRef.current);
        }
      };

      return (
        <div style={{ maxWidth: '620px', width: '100%', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <X size={22} color="#6b7280" cursor="pointer" onClick={exitLesson} />
            <div style={{ flex: 1, height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #eab308, #ca8a04)', borderRadius: '100px', transition: 'width 0.4s ease', boxShadow: '0 0 8px rgba(234,179,8,0.4)' }} />
            </div>
            <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: '700', minWidth: '45px', textAlign: 'right' }}>{currentQuestionIdx + 1}/{questions.length}</span>
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', color: '#eab308', fontWeight: '800', marginBottom: '8px' }}>🗣️ Pronounce this phrase</h2>
            <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '40px' }}>Read the phrase aloud clearly.</p>
            
            {/* Target Phrase */}
            <div style={{ fontSize: '42px', fontWeight: '900', color: '#fff', marginBottom: '16px', lineHeight: '1.3' }}>
              {targetPhrase}
            </div>
            {language && (
              <button 
                onClick={() => playAudio(targetPhrase, language)}
                style={{
                  background: 'rgba(234,179,8,0.1)', border: '1px solid #eab308',
                  borderRadius: '50%', width: '56px', height: '56px', display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  marginBottom: '16px', transition: 'transform 0.2s', fontSize: '24px'
                }}
                className="btn-hover"
                title="Listen to pronunciation"
              >
                🔊
              </button>
            )}
            
            {question.explanation && (
              <div style={{ fontSize: '16px', color: '#9ca3af', fontStyle: 'italic', marginBottom: '40px' }}>
                Meaning: {question.explanation}
              </div>
            )}

            {/* Voice UI Component */}
            <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto', marginBottom: '40px' }}>
              {/* Mic Button */}
              <button 
                onPointerDown={() => !isAnswerChecked && startListening(targetPhrase)}
                onPointerUp={() => {}} // Could stop listening, but continuous=false handles it
                disabled={isAnswerChecked || !isSpeechSupported}
                style={{
                  width: '120px', height: '120px', borderRadius: '50%', border: 'none',
                  background: isListening ? '#ef4444' : 'rgba(234,179,8,0.15)',
                  boxShadow: isListening ? '0 0 40px rgba(239,68,68,0.6)' : '0 0 0 transparent',
                  cursor: isAnswerChecked ? 'default' : 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: isListening ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                <Mic size={48} color={isListening ? '#fff' : '#eab308'} />
              </button>
              <div style={{ marginTop: '24px', fontSize: '14px', fontWeight: '600', color: isListening ? '#ef4444' : '#9ca3af' }}>
                {isListening ? 'Listening...' : 'Tap to speak'}
              </div>

              {/* Transcript & Feedback */}
              <AnimatePresence>
                {transcript && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: '24px', background: 'rgba(255,255,255,0.05)', padding: '16px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: '8px', textTransform: 'uppercase' }}>You said:</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>"{transcript}"</div>
                    {pronunciationScore !== null && (
                      <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: '800', color: pronunciationScore > 60 ? '#22c55e' : '#ef4444' }}>
                        Accuracy: {pronunciationScore}%
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action Button */}
          <div style={{ paddingTop: '24px' }}>
            <button
              onClick={isAnswerChecked ? handleNextVoice : handleVoiceCheck}
              disabled={!isAnswerChecked && !transcript}
              style={{
                width: '100%', height: '54px', borderRadius: '14px', border: 'none',
                background: (!isAnswerChecked && !transcript) ? 'rgba(255,255,255,0.05)' : isAnswerChecked ? '#22c55e' : '#eab308',
                color: (!isAnswerChecked && !transcript) ? 'rgba(255,255,255,0.2)' : '#000',
                fontWeight: '800', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.5px'
              }}
            >
              {isAnswerChecked ? 'CONTINUE →' : 'CHECK PRONUNCIATION'}
            </button>
          </div>
        </div>
      );
    };

    if (quizLevel === 'pronunciation') {
      return renderPronunciationQuiz();
    }

    return (
      <div style={{ maxWidth: '620px', width: '100%', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <X size={22} color="#6b7280" cursor="pointer" onClick={exitLesson} />
          <div style={{ flex: 1, height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #12d15e, #22c55e)', borderRadius: '100px', transition: 'width 0.4s ease', boxShadow: '0 0 8px rgba(18,209,94,0.4)' }} />
          </div>
          <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: '700', minWidth: '45px', textAlign: 'right' }}>{currentQuestionIdx + 1}/{questions.length}</span>
        </div>

        {/* Pass threshold info bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px', padding: '10px 16px', marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>🎯</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
              Pass requirement: <span style={{ color: '#facc15' }}>6 or more correct</span> out of {questions.length}
            </span>
          </div>
          {/* Live correct count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', opacity: 0.4 }}>Correct so far:</span>
            <span style={{
              fontWeight: '800', fontSize: '14px',
              color: userAnswers.filter((a: any) => a.isCorrect).length >= 6 ? '#22c55e' : 'rgba(255,255,255,0.6)'
            }}>
              {userAnswers.filter((a: any) => a.isCorrect).length}
            </span>
          </div>
        </div>

        {/* Question type badge */}
        <div style={{ fontSize: '11px', fontWeight: '800', color: typeColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: typeColor }} />
          {typeLabel}
        </div>

        {/* Question bubble */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', marginBottom: '32px' }}>
          <img src="/Logo-1.png" alt="Bot" style={{ width: '48px', height: '48px', flexShrink: 0 }} />
          <div style={{ background: typeColor, color: '#fff', padding: '20px 24px', borderRadius: '20px', borderBottomLeftRadius: '4px', fontSize: '16px', fontWeight: '500', lineHeight: '1.5', position: 'relative', flex: 1 }}>
            {question.questionText}
            <div style={{ position: 'absolute', bottom: '12px', left: '-10px', width: 0, height: 0, borderTop: '10px solid transparent', borderRight: `10px solid ${typeColor}`, borderBottom: '10px solid transparent' }} />
          </div>
        </div>

        {/* Target word display */}
        {(question.type === 'translate_word' || question.type === 'match_meaning') && (
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '36px', fontWeight: '800', padding: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', display: 'inline-block', color: '#fff' }}>
              {question.targetWord}
            </div>
          </div>
        )}

        {/* Listen and Translate display */}
        {question.type === 'listen_translate' && language && (
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <button 
              onClick={() => playAudio(question.targetWord, language)}
              style={{
                background: 'rgba(168,85,247,0.1)', border: '1px solid #a855f7',
                borderRadius: '50%', width: '80px', height: '80px', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                boxShadow: '0 0 20px rgba(168,85,247,0.4)', transition: 'transform 0.2s', fontSize: '36px',
                color: '#fff'
              }}
              className="btn-hover"
            >
              🔊
            </button>
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#a855f7', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Play Audio</div>
          </div>
        )}

        {/* Fill-blank sentence */}
        {question.type === 'fill_blank' && question.sentence && (() => {
          const match = question.sentence.match(/^(.*?)\s*\((.*?)\)\s*$/);
          const foreignSentence = match ? match[1] : question.sentence;
          const translation = match ? match[2] : '';
          const parts = foreignSentence.split('___');
          return (
            <div style={{ textAlign: 'center', marginBottom: '28px', padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#fff', lineHeight: '1.8' }}>
                {parts.map((p, idx) => (
                  <span key={idx}>{p}{idx < parts.length - 1 && <span style={{ borderBottom: '3px solid #22c55e', color: '#22c55e', padding: '0 8px', fontWeight: '800' }}>___</span>}</span>
                ))}
              </div>
              {translation && <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '14px', marginTop: '8px' }}>({translation})</div>}
            </div>
          );
        })()}

        {/* Answer area */}
        <div style={{ flex: 1 }}>
          {question.type === 'translate_word' || !question.options || question.options.filter(o => o?.trim()).length === 0 ? (
            <div>
              <input
                type="text" value={selectedAnswer}
                onChange={e => !isAnswerChecked && setSelectedAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
                disabled={isAnswerChecked}
                placeholder="Type your answer here..."
                style={{ width: '100%', padding: '16px 20px', background: '#1a1a1a', border: `1px solid ${isAnswerChecked ? (userAnswers[userAnswers.length - 1]?.isCorrect ? '#22c55e' : '#ef4444') : '#2a2a2a'}`, borderRadius: '14px', color: '#fff', fontSize: '16px', marginBottom: '16px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              />
              {question.options?.filter(o => o?.trim()).length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {question.options.filter(o => o?.trim()).map((opt, i) => (
                    <button key={i} onClick={() => !isAnswerChecked && setSelectedAnswer(opt)} disabled={isAnswerChecked}
                      style={{ padding: '10px 14px', background: selectedAnswer === opt ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selectedAnswer === opt ? '#22c55e' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', color: selectedAnswer === opt ? '#22c55e' : '#9ca3af', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {question.options?.filter(o => o?.trim()).map((opt, i) => {
                const isSelected = selectedAnswer === opt;
                let bg = 'rgba(255,255,255,0.03)'; let border = 'rgba(255,255,255,0.08)'; let color = '#fff';
                if (isSelected && !isAnswerChecked) { bg = 'rgba(34,197,94,0.1)'; border = '#22c55e'; color = '#fff'; }
                else if (isAnswerChecked) {
                  if (opt === question.correctAnswer) { bg = 'rgba(34,197,94,0.12)'; border = '#22c55e'; color = '#22c55e'; }
                  else if (isSelected) { bg = 'rgba(239,68,68,0.1)'; border = '#ef4444'; color = '#ef4444'; }
                }
                return (
                  <button key={i} onClick={() => !isAnswerChecked && setSelectedAnswer(opt)} disabled={isAnswerChecked}
                    style={{ width: '100%', padding: '15px 20px', background: bg, border: `2px solid ${border}`, borderRadius: '14px', color, fontSize: '15px', cursor: isAnswerChecked ? 'default' : 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', fontWeight: isSelected ? '700' : '500', textAlign: 'left' }}>
                    <span>{opt}</span>
                    {isAnswerChecked && opt === question.correctAnswer && <Check size={18} color="#22c55e" strokeWidth={3} />}
                    {isAnswerChecked && isSelected && opt !== question.correctAnswer && <XCircle size={18} color="#ef4444" />}
                  </button>
                );
              })}
            </div>
          )}

          {isAnswerChecked && (
            <div style={{ marginTop: '20px', padding: '14px 18px', background: userAnswers[userAnswers.length-1]?.isCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${userAnswers[userAnswers.length-1]?.isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: '12px', fontSize: '13px', color: '#9ca3af', fontStyle: 'italic', lineHeight: '1.5' }}>
              💡 {question.explanation}
            </div>
          )}
        </div>

        {/* Check / Next button */}
        <div style={{ paddingTop: '24px' }}>
          <button
            onClick={handleCheck}
            disabled={!isAnswerChecked && ((question.type === 'translate_word' || !question.options || question.options.filter(o => o?.trim()).length === 0) ? !selectedAnswer.trim() : !selectedAnswer)}
            style={{
              width: '100%', height: '54px', borderRadius: '14px', border: 'none',
              background: (!isAnswerChecked && ((question.type === 'translate_word' || !question.options || question.options.filter(o => o?.trim()).length === 0) ? !selectedAnswer.trim() : !selectedAnswer)) ? 'rgba(255,255,255,0.05)' : isAnswerChecked ? '#22c55e' : '#1a73e8',
              color: (!isAnswerChecked && ((question.type === 'translate_word' || !question.options || question.options.filter(o => o?.trim()).length === 0) ? !selectedAnswer.trim() : !selectedAnswer)) ? 'rgba(255,255,255,0.2)' : '#000',
              fontWeight: '800', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.5px'
            }}
          >
            {isAnswerChecked ? 'CONTINUE →' : 'CHECK ANSWER'}
          </button>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!lessonResults) return null;
    const pct = lessonResults.score / (lessonResults.total || 10);
    const stars = pct >= 0.8 ? 3 : pct >= 0.5 ? 2 : 1;
    const passed = pct >= 0.5;

    return (
      <div style={{ maxWidth: '640px', width: '100%', margin: '0 auto', padding: '40px 0', position: 'relative' }}>
        {/* Confetti */}
        {confettiPieces.map(p => (
          <div key={p.id} style={{ position: 'fixed', top: '-20px', left: `${p.x}%`, width: `${p.size}px`, height: `${p.size}px`, background: p.color, borderRadius: '2px', animation: `confetti-fall 2.5s ${p.delay}s ease-in forwards`, transform: `rotate(${p.rotation}deg)`, pointerEvents: 'none', zIndex: 999 }} />
        ))}

        {/* Score circle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `3px solid ${passed ? '#22c55e' : '#ef4444'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px ${passed ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff' }}>{lessonResults.score}/{lessonResults.total || 10}</div>
              <div style={{ fontSize: '13px', color: passed ? '#22c55e' : '#ef4444', fontWeight: '700' }}>+{lessonResults.xpEarned} XP</div>
            </div>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0' }}>{passed ? 'Stage Passed! 🎉' : 'Not Passed This Time'}</h2>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {[1,2,3].map(i => <span key={i} style={{ fontSize: '32px', filter: i <= stars ? 'none' : 'grayscale(1)', opacity: i <= stars ? 1 : 0.15, transition: 'all 0.5s', transitionDelay: `${i * 0.2}s` }}>⭐</span>)}
          </div>

          {/* Pass / Fail result banner */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${passed ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.25)'}`,
            borderRadius: '14px', padding: '14px 20px', width: '100%', boxSizing: 'border-box',
            animation: 'fade-in 0.4s ease'
          }}>
            <span style={{ fontSize: '28px' }}>{passed ? '✅' : '❌'}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '800', fontSize: '15px', color: passed ? '#22c55e' : '#ef4444' }}>
                {passed
                  ? `You scored ${lessonResults.score}/${lessonResults.total || 10} — Stage unlocked!`
                  : `You scored ${lessonResults.score}/${lessonResults.total || 10} — Need 6+ to pass`
                }
              </div>
              <div style={{ fontSize: '12px', opacity: 0.55, marginTop: '3px' }}>
                {passed
                  ? 'Great work! Your progress has been saved and the next stage is now unlocked.'
                  : 'You need at least 6 correct answers to pass this stage. Give it another shot!'}
              </div>
            </div>
          </div>
        </div>

        {/* New badge earned celebration */}
        {newBadgeEarned && (
          <div style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.3)', borderRadius: '20px', padding: '24px', textAlign: 'center', marginBottom: '32px', animation: 'fade-in 0.5s ease' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
            <div style={{ color: '#facc15', fontWeight: '800', fontSize: '18px', marginBottom: '4px' }}>New Badge Unlocked!</div>
            <div style={{ opacity: 0.6, fontSize: '14px' }}>{newBadgeEarned}</div>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#22c55e' }}>{lessonResults.score}</div>
            <div style={{ fontSize: '12px', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>Correct</div>
          </div>
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#ef4444' }}>{(lessonResults.total || 10) - lessonResults.score}</div>
            <div style={{ fontSize: '12px', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>Incorrect</div>
          </div>
        </div>

        {/* Results breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
          {lessonResults.results?.map((r: any, idx: number) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '14px 18px', borderRadius: '14px', borderLeft: `4px solid ${r.isCorrect ? '#22c55e' : '#ef4444'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: '700' }}>Q{idx + 1}</span>
                  {r.isCorrect ? <Check size={14} color="#22c55e" /> : <XCircle size={14} color="#ef4444" />}
                </div>
                <div style={{ color: '#fff', fontSize: '13px', marginBottom: '4px' }}>Correct: <strong style={{ color: r.isCorrect ? '#22c55e' : '#fff' }}>{r.correctAnswer}</strong></div>
                <div style={{ color: '#6b7280', fontSize: '12px', fontStyle: 'italic' }}>{r.explanation}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '14px' }}>
          <button onClick={() => startLesson()} style={{ flex: 1, padding: '16px', borderRadius: '14px', background: 'transparent', border: '2px solid rgba(255,255,255,0.15)', color: '#fff', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' }} className="btn-hover">
            Try Again
          </button>
          <button onClick={() => { setNewBadgeEarned(null); setView('setup'); }} style={{ flex: 1, padding: '16px', borderRadius: '14px', background: '#22c55e', border: 'none', color: '#000', fontWeight: '800', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' }} className="btn-hover">
            Back to Map →
          </button>
        </div>

        <style>{`
          @keyframes confetti-fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
          @keyframes fade-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        `}</style>
      </div>
    );
  };

  // ─── MAIN RENDER ────────────────────────────────────────────────

  return (
    <div style={{ background: '#000000', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex' }}>
      <button onClick={() => setIsMobileOpen(true)} className="mobile-toggle" style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 90, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px', cursor: 'pointer', display: 'none', color: '#fff', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
        <Menu size={20} />
      </button>

      {isMobileOpen && <div onClick={() => setIsMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', zIndex: 95 }} />}

      <aside className={`desktop-sidebar ${isMobileOpen ? 'sidebar-open' : ''}`} style={{ width: isSidebarCollapsed ? '88px' : '280px', background: '#000', borderRight: '1px solid rgba(255,255,255,0.05)', padding: isSidebarCollapsed ? '40px 12px' : '40px 24px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', marginBottom: '48px' }}>
          {!isSidebarCollapsed && <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><img src="/Logo-1.png" alt="Logo" style={{ width: '40px' }} /><span style={{ fontSize: '24px', fontWeight: '800' }}>Lingofy</span></div>}
          {isSidebarCollapsed && <img src="/Logo-1.png" alt="Logo" style={{ width: '40px' }} />}
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="desktop-toggle-btn" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '8px' }}>
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <button onClick={() => setIsMobileOpen(false)} className="mobile-close-btn" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'none', alignItems: 'center', padding: '6px', borderRadius: '8px' }}>
            <X size={20} />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {currentUser?.learningMode !== 'traditional' && (
            <NavItem icon={<Home size={20} />} label="Home" onClick={() => navigate('/dashboard?tab=home')} collapsed={isSidebarCollapsed} />
          )}
          <NavItem icon={<BookOpen size={20} />} label="Lessons" active collapsed={isSidebarCollapsed} />
          {currentUser?.learningMode !== 'traditional' && (
            <NavItem icon={<Music size={20} />} label="Library" onClick={() => navigate('/dashboard?tab=library')} collapsed={isSidebarCollapsed} />
          )}
          <NavItem icon={<BarChart2 size={20} />} label="Statistics" onClick={() => navigate('/dashboard?tab=statistics')} collapsed={isSidebarCollapsed} />
          <NavItem icon={<Award size={20} />} label="Achievements" onClick={() => navigate('/dashboard?tab=achievements')} collapsed={isSidebarCollapsed} />
          <NavItem icon={<HelpCircle size={20} />} label="Documentation" onClick={() => navigate('/dashboard?tab=docs')} collapsed={isSidebarCollapsed} />
        </nav>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
          <NavItem icon={<Settings size={20} />} label="Profile" onClick={() => navigate('/dashboard?tab=profile')} collapsed={isSidebarCollapsed} />
          <NavItem icon={<LogOut size={20} />} label="Logout" onClick={() => { localStorage.clear(); navigate('/login'); }} collapsed={isSidebarCollapsed} />
        </div>
      </aside>

      <main className="main-content" style={{ flex: 1, marginLeft: 'var(--sidebar-width, 0px)', padding: '40px', display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)', position: 'relative' }}>
        
        {/* Toggle Mode Button (Top Right) */}
        {view === 'setup' && !language && (
          <div style={{ position: 'absolute', top: '40px', right: '40px', zIndex: 50 }}>
            <button 
              onClick={toggleLearningMode}
              className="btn-hover"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {currentUser?.learningMode === 'traditional' ? 'Switch to Music Mode' : 'Switch to Traditional Mode'}
            </button>
          </div>
        )}

        {view === 'hci_form' && (
          <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto', background: '#222', borderRadius: '24px', padding: '40px', marginTop: '40px', border: '1px solid #333' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#fff' }}>Research Reflection</h2>
            <p style={{ color: '#aaa', marginBottom: '32px' }}>Please answer these two quick questions to help our HCI study.</p>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', marginBottom: '16px', fontWeight: 'bold', color: '#fff' }}>1. How mentally demanding was this task?</label>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#aaa', fontSize: '12px' }}>
                <span>Very Easy</span>
                <span>Very Demanding</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={cognitiveLoad}
                onChange={(e) => setCognitiveLoad(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#12d15e', cursor: 'pointer' }}
              />
              <div style={{ textAlign: 'center', marginTop: '8px', color: '#12d15e', fontWeight: 'bold' }}>Rating: {cognitiveLoad} / 5</div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', color: '#fff' }}>2. What helped you remember? Did the music help or distract you?</label>
              <textarea 
                rows={4}
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Your qualitative feedback..."
                style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid #444', color: '#fff', fontSize: '14px', resize: 'vertical' }}
              />
            </div>

            <button 
              onClick={() => submitLesson(latestAnswersRef.current)}
              style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#12d15e', color: '#000', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: 'pointer' }}
            >
              Submit & See Results
            </button>
          </div>
        )}

        {view === 'setup' && renderSetup()}
        {view === 'loading' && renderLoading()}
        {view === 'quiz' && renderQuiz()}
        {view === 'results' && renderResults()}
      </main>

      {/* Celebration overlay — renders above everything on pass */}
      {renderCelebration()}

      {/* Mode Switch Flash Overlay */}
      {isFlashing && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.15)', zIndex: 9999,
          pointerEvents: 'none', animation: 'flash-anim 0.3s ease-out'
        }} />
      )}

      <style>{`
        @keyframes flash-anim {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }

        :root { --sidebar-width: ${isSidebarCollapsed ? '88px' : '280px'}; }
        .desktop-sidebar { transition: width 0.3s cubic-bezier(0.4,0,0.2,1), padding 0.3s ease; }
        .main-content { transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1); }
        .btn-hover { transition: all 0.2s; }
        .btn-hover:hover { filter: brightness(1.1); transform: translateY(-1px); }
        @media (max-width: 1024px) {
          :root { --sidebar-width: 0px; }
          .desktop-sidebar { transform: translateX(${isMobileOpen ? '0' : '-100%'}); display: flex !important; width: 280px !important; padding: 40px 24px !important; transition: transform 0.3s cubic-bezier(0.4,0,0.2,1) !important; }
          .mobile-toggle { display: flex !important; }
          .desktop-toggle-btn { display: none !important; }
          .mobile-close-btn { display: flex !important; }
          main { padding: 24px !important; padding-bottom: 100px !important; padding-top: 80px !important; margin-left: 0 !important; }
        }
        @media (max-width: 900px) {
          .lessons-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick, collapsed = false }: any) => (
  <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: collapsed ? '0' : '16px', padding: '12px 16px', borderRadius: '12px', background: active ? 'rgba(34,197,94,0.1)' : 'transparent', color: active ? '#22c55e' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: active ? '700' : '500', justifyContent: collapsed ? 'center' : 'flex-start' }}>
    {icon}{!collapsed && <span>{label}</span>}
    {active && !collapsed && <div style={{ marginLeft: 'auto', width: '4px', height: '20px', background: '#22c55e', borderRadius: '2px' }} />}
  </div>
);

export default LessonsPage;
