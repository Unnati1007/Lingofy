import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '../config';
import { 
  X, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RotateCcw, 
  ChevronRight, 
  Loader2,
  BookOpen
} from 'lucide-react';

interface Question {
  id: number;
  type: string;
  questionText: string;
  targetWord?: string;
  sentence?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface SongPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: {
    _id: string;
    title: string;
    artistName?: string;
    albumArtUrl?: string;
    language?: string;
  } | null;
  defaultLanguage?: string;
  onQuizCompleted?: (score: number, total: number) => void;
}

export const SongPracticeModal: React.FC<SongPracticeModalProps> = ({
  isOpen,
  onClose,
  song,
  defaultLanguage = 'hindi',
  onQuizCompleted
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    ['hindi', 'spanish', 'korean'].includes((defaultLanguage || '').toLowerCase())
      ? (defaultLanguage || 'hindi').toLowerCase()
      : 'hindi'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && song) {
      loadSongQuiz(selectedLanguage);
    } else {
      resetState();
    }
  }, [isOpen, song]);

  const resetState = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
    setAttemptId(null);
    setUserAnswers([]);
    setError(null);
  };

  const loadSongQuiz = async (lang: string) => {
    if (!song) return;
    setLoading(true);
    setError(null);
    resetState();
    setSelectedLanguage(lang);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE}/api/lessons/generate-from-song`,
        {
          songId: song._id,
          language: lang
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data && res.data.questions && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
        setAttemptId(res.data.attemptId);
        setStartTime(Date.now());
      } else {
        setError("Could not generate questions for this song yet. Please try another language or song.");
      }
    } catch (err: any) {
      console.error("Error generating song quiz:", err);
      setError(err?.response?.data?.message || "Failed to generate song practice quiz.");
    } finally {
      setLoading(false);
    }
  };

  const playTTS = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedLanguage === 'hindi') utterance.lang = 'hi-IN';
    else if (selectedLanguage === 'spanish') utterance.lang = 'es-ES';
    else if (selectedLanguage === 'korean') utterance.lang = 'ko-KR';
    else utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = option.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    const newAnswer = {
      questionId: currentQ.id,
      answer: option,
      isCorrect,
      timeSpentSeconds: Math.max(1, Math.round((Date.now() - startTime) / 1000))
    };

    setUserAnswers(prev => [...prev, newAnswer]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setStartTime(Date.now());
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsCompleted(true);
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (attemptId) {
        await axios.post(
          `${API_BASE}/api/lessons/submit`,
          {
            attemptId,
            language: selectedLanguage,
            level: 'dynamic',
            questions,
            userAnswers,
            totalTimeSpentSeconds: Math.round((Date.now() - startTime) / 1000)
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
      if (onQuizCompleted) {
        onQuizCompleted(score + (selectedOption === questions[currentIndex]?.correctAnswer ? 1 : 0), questions.length);
      }
    } catch (err) {
      console.error("Failed to submit practice attempt:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !song) return null;

  const currentQ = questions[currentIndex];
  const progressPct = questions.length > 0 ? ((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100 : 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '16px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        style={{
          width: '100%',
          maxWidth: '620px',
          background: 'linear-gradient(180deg, #18181b 0%, #0c0c0e 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(32, 190, 255, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {song.albumArtUrl ? (
              <img 
                src={song.albumArtUrl} 
                alt={song.title} 
                style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(32, 190, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#20BEFF' }}>
                <BookOpen size={20} />
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{song.title}</span>
                <span style={{ 
                  fontSize: '10px', 
                  fontWeight: '700', 
                  padding: '2px 6px', 
                  borderRadius: '6px', 
                  background: 'rgba(32, 190, 255, 0.15)', 
                  color: '#20BEFF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Song Practice
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
                {song.artistName || 'Audio Track'} • 10 Questions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Language Tabs */}
        {!isCompleted && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '600' }}>LANGUAGE:</span>
            {(['hindi', 'spanish', 'korean'] as const).map(lang => (
              <button
                key={lang}
                disabled={loading}
                onClick={() => loadSongQuiz(lang)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '600',
                  border: selectedLanguage === lang ? '1px solid #20BEFF' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: selectedLanguage === lang ? 'rgba(32, 190, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: selectedLanguage === lang ? '#20BEFF' : 'rgba(255, 255, 255, 0.6)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {lang === 'hindi' ? '🇮🇳 Hindi' : lang === 'spanish' ? '🇪🇸 Spanish' : '🇰🇷 Korean'}
              </button>
            ))}
          </div>
        )}

        {/* Progress Bar */}
        {!loading && !error && !isCompleted && questions.length > 0 && (
          <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.08)' }}>
            <motion.div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #20BEFF, #a855f7)',
                boxShadow: '0 0 10px rgba(32, 190, 255, 0.5)'
              }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Body Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '16px' }}>
              <Loader2 size={36} className="animate-spin" style={{ color: '#20BEFF' }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                  Creating 10-Question Song Practice Quiz...
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  Extracting lyrics, vocabulary & pronunciation from "{song.title}"
                </p>
              </div>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px 10px' }}>
              <XCircle size={44} style={{ color: '#ef4444', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>Practice Quiz Notice</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', maxWidth: '380px', margin: '0 auto 20px auto' }}>{error}</p>
              <button
                onClick={() => loadSongQuiz(selectedLanguage)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  background: '#20BEFF',
                  color: '#000',
                  fontWeight: '700',
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Retry Practice
              </button>
            </div>
          ) : isCompleted ? (
            /* Completed Screen */
            <div style={{ textAlign: 'center', padding: '24px 8px' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: score >= 7 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                  border: score >= 7 ? '2px solid #22c55e' : '2px solid #eab308',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  color: score >= 7 ? '#22c55e' : '#eab308'
                }}
              >
                <Sparkles size={36} />
              </motion.div>

              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
                Song Practice Complete! 🎵
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '24px' }}>
                You practiced {questions.length} vocabulary & lyric questions from <strong>{song.title}</strong>
              </p>

              {/* Score card */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                maxWidth: '360px',
                margin: '0 auto 28px auto'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Score</span>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#20BEFF' }}>
                    {score} / {questions.length}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Accuracy</span>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: score >= 7 ? '#22c55e' : '#eab308' }}>
                    {Math.round((score / (questions.length || 1)) * 100)}%
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => loadSongQuiz(selectedLanguage)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <RotateCcw size={16} /> Practice Again
                </button>
                <button
                  onClick={onClose}
                  style={{
                    padding: '12px 28px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #20BEFF, #0099e6)',
                    color: '#000',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(32, 190, 255, 0.3)'
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : currentQ ? (
            /* Active Question Screen */
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Question Info / Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.5)' }}>
                    QUESTION {currentIndex + 1} OF {questions.length}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'rgba(168, 85, 247, 0.15)',
                    color: '#c084fc'
                  }}>
                    {currentQ.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Question Text */}
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '16px', lineHeight: '1.4' }}>
                  {currentQ.questionText}
                </h3>

                {/* Target Word / Sentence / Audio Preview */}
                {currentQ.targetWord && (
                  <div style={{
                    padding: '16px 20px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Lyric Snippet
                      </span>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#20BEFF', marginTop: '2px' }}>
                        {currentQ.targetWord}
                      </div>
                    </div>
                    <button
                      onClick={() => playTTS(currentQ.targetWord || '')}
                      style={{
                        background: 'rgba(32, 190, 255, 0.15)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '38px',
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#20BEFF',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      title="Listen pronunciation"
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>
                )}

                {currentQ.sentence && (
                  <div style={{
                    padding: '14px 18px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    fontSize: '15px',
                    color: '#e4e4e7',
                    marginBottom: '20px',
                    lineHeight: '1.5'
                  }}>
                    {currentQ.sentence}
                  </div>
                )}

                {/* Options Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {currentQ.options.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    const isCorrectAnswer = option.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
                    
                    let bg = 'rgba(255, 255, 255, 0.03)';
                    let border = '1px solid rgba(255, 255, 255, 0.1)';
                    let textColor = '#fff';

                    if (isAnswered) {
                      if (isCorrectAnswer) {
                        bg = 'rgba(34, 197, 94, 0.15)';
                        border = '1px solid #22c55e';
                        textColor = '#4ade80';
                      } else if (isSelected && !isCorrectAnswer) {
                        bg = 'rgba(239, 68, 68, 0.15)';
                        border = '1px solid #ef4444';
                        textColor = '#f87171';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(option)}
                        style={{
                          padding: '14px 18px',
                          borderRadius: '14px',
                          background: bg,
                          border: border,
                          color: textColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: isAnswered ? 'default' : 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{option}</span>
                        {isAnswered && isCorrectAnswer && <CheckCircle2 size={18} color="#22c55e" />}
                        {isAnswered && isSelected && !isCorrectAnswer && <XCircle size={18} color="#ef4444" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '14px 18px',
                      borderRadius: '14px',
                      background: 'rgba(32, 190, 255, 0.08)',
                      border: '1px solid rgba(32, 190, 255, 0.2)',
                      marginBottom: '20px'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#20BEFF', textTransform: 'uppercase', marginBottom: '4px' }}>
                      LYRIC EXPLANATION
                    </div>
                    <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', margin: 0, lineHeight: '1.4' }}>
                      {currentQ.explanation}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>

        {/* Footer */}
        {!loading && !error && !isCompleted && isAnswered && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(255, 255, 255, 0.02)'
          }}>
            <button
              onClick={handleNext}
              disabled={submitting}
              style={{
                padding: '12px 26px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #20BEFF, #0099e6)',
                color: '#000',
                border: 'none',
                fontWeight: '700',
                fontSize: '14px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 15px rgba(32, 190, 255, 0.3)'
              }}
            >
              {currentIndex === questions.length - 1 ? 'Finish Practice' : 'Next Question'}
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
