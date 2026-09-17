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
  BookOpen,
  Globe
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
    image?: string;
    language?: string;
  } | null;
  defaultLanguage?: string;
}

const AVAILABLE_LANGUAGES = [
  { code: 'spanish', name: 'Spanish', flag: '🇪🇸', desc: 'Spanish lyrics & pronunciation' },
  { code: 'hindi', name: 'Hindi', flag: '🇮🇳', desc: 'Devanagari script & pronunciation' },
  { code: 'korean', name: 'Korean', flag: '🇰🇷', desc: 'Hangul script & lyric phrases' },
  { code: 'english', name: 'English', flag: '🇬🇧', desc: 'Lyrics, vocabulary & idioms' }
];

export const SongPracticeModal: React.FC<SongPracticeModalProps> = ({
  isOpen,
  onClose,
  song,
  defaultLanguage = 'spanish'
}) => {
  const [step, setStep] = useState<'select_language' | 'quiz' | 'completed'>('select_language');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    ['spanish', 'hindi', 'korean', 'english'].includes((defaultLanguage || '').toLowerCase())
      ? (defaultLanguage || 'spanish').toLowerCase()
      : 'spanish'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && song) {
      setStep('select_language');
      setQuestions([]);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setError(null);
    }
  }, [isOpen, song]);

  if (!isOpen || !song) return null;

  const coverArt = song.albumArtUrl || song.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop';

  const startPracticeQuiz = async (lang: string) => {
    setSelectedLanguage(lang);
    setLoading(true);
    setError(null);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE}/api/lessons/generate-from-song`,
        {
          songId: song._id,
          language: lang,
          songTitle: song.title,
          artistName: song.artistName
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data && res.data.questions && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
        setStep('quiz');
      } else {
        setError("Could not generate questions for this song. Please try another language.");
      }
    } catch (err: any) {
      console.error("Error generating song practice quiz:", err);
      setError(err?.response?.data?.message || "Failed to generate 15-question song practice quiz.");
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
    utterance.rate = 0.85;
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
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setStep('completed');
    }
  };

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
        className="song-practice-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        style={{
          width: '100%',
          maxWidth: '640px',
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
            <img 
              src={coverArt} 
              alt={song.title} 
              style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} 
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{song.title}</span>
                <span style={{ 
                  fontSize: '10px', 
                  fontWeight: '700', 
                  padding: '2px 8px', 
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
                {song.artistName || 'Audio Track'} • 15 Questions Practice Quiz
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

        {/* Progress Bar (During Quiz) */}
        {step === 'quiz' && !loading && questions.length > 0 && (
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
            /* Loading State */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '16px' }}>
              <Loader2 size={40} className="animate-spin" style={{ color: '#20BEFF' }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                  Generating 15-Question Practice Quiz...
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', maxWidth: '360px' }}>
                  Creating a mix of pronunciation, lyric phrases, fill-in-the-blanks, and vocabulary for <strong>"{song.title}"</strong> in {selectedLanguage.toUpperCase()}.
                </p>
              </div>
            </div>
          ) : step === 'select_language' ? (
            /* STEP 1: Language Selection Screen (Strictly 4 Core Languages) */
            <div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  background: 'rgba(32, 190, 255, 0.1)', 
                  color: '#20BEFF', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  marginBottom: '10px'
                }}>
                  <Globe size={14} /> Practice Song Quiz
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 6px 0' }}>
                  In which language do you want to practice this song?
                </h2>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
                  Click a language to generate your 15-question mix quiz based on <strong>"{song.title}"</strong>.
                </p>
              </div>

              {/* Language Cards Grid (2x2 Grid for 4 Core Languages) */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '14px', 
                marginBottom: '20px' 
              }}>
                {AVAILABLE_LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguage === lang.code;
                  return (
                    <div
                      key={lang.code}
                      onClick={() => startPracticeQuiz(lang.code)}
                      style={{
                        padding: '18px 16px',
                        borderRadius: '16px',
                        background: isSelected 
                          ? 'linear-gradient(135deg, rgba(32, 190, 255, 0.18) 0%, rgba(0, 153, 230, 0.08) 100%)' 
                          : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected 
                          ? '2px solid #20BEFF' 
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(32, 190, 255, 0.4)';
                          e.currentTarget.style.background = 'rgba(32, 190, 255, 0.06)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '24px' }}>{lang.flag}</span>
                          <span style={{ fontSize: '15px', fontWeight: '700', color: isSelected ? '#20BEFF' : '#fff' }}>
                            {lang.name}
                          </span>
                        </div>
                        <ChevronRight size={16} color={isSelected ? '#20BEFF' : 'rgba(255,255,255,0.4)'} />
                      </div>
                      <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', lineHeight: '1.3' }}>
                        {lang.desc}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Notice Banner: Pure Practice Mode */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Sparkles size={20} color="#20BEFF" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', margin: 0, lineHeight: '1.4' }}>
                  <strong>Practice Mode:</strong> Scores are purely for self-assessment. No XP, badges, or profile leaderboards are modified.
                </p>
              </div>

              {error && (
                <div style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>
                  {error}
                </div>
              )}
            </div>
          ) : step === 'completed' ? (
            /* STEP 3: Completed Screen */
            <div style={{ textAlign: 'center', padding: '20px 8px' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  background: score >= 10 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                  border: score >= 10 ? '2px solid #22c55e' : '2px solid #eab308',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  color: score >= 10 ? '#22c55e' : '#eab308'
                }}
              >
                <Sparkles size={38} />
              </motion.div>

              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
                Song Practice Completed! 🎵
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '24px' }}>
                You completed 15 mix questions from <strong>"{song.title}"</strong> in {selectedLanguage.toUpperCase()}!
              </p>

              {/* Score breakdown */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                maxWidth: '380px',
                margin: '0 auto 24px auto'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Score</span>
                  <div style={{ fontSize: '30px', fontWeight: '800', color: '#20BEFF' }}>
                    {score} / {questions.length}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Accuracy</span>
                  <div style={{ fontSize: '30px', fontWeight: '800', color: score >= 10 ? '#22c55e' : '#eab308' }}>
                    {Math.round((score / (questions.length || 1)) * 100)}%
                  </div>
                </div>
              </div>

              {/* Practice Only Disclaimer */}
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '24px' }}>
                💡 <em>Self-assessment practice mode. Scores & badges are not added to profile.</em>
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => startPracticeQuiz(selectedLanguage)}
                  style={{
                    padding: '12px 20px',
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
                  <RotateCcw size={16} /> Re-play Quiz
                </button>
                <button
                  onClick={() => setStep('select_language')}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    background: 'rgba(32, 190, 255, 0.15)',
                    color: '#20BEFF',
                    border: '1px solid rgba(32, 190, 255, 0.3)',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Globe size={16} /> Other Language
                </button>
                <button
                  onClick={onClose}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #20BEFF, #0099e6)',
                    color: '#000',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : currentQ ? (
            /* STEP 2: Active 15 Question Screen */
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Question Info / Tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.5)' }}>
                    QUESTION {currentIndex + 1} OF {questions.length}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: 'rgba(168, 85, 247, 0.15)',
                    color: '#c084fc',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {currentQ.type ? currentQ.type.replace('_', ' ') : 'MIX QUESTION'}
                  </span>
                </div>

                {/* Question Text */}
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '16px', lineHeight: '1.4' }}>
                  {currentQ.questionText}
                </h3>

                {/* Target Snippet / Audio Button */}
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
                        Song Lyric Snippet ({selectedLanguage.toUpperCase()})
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
                        width: '42px',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#20BEFF',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 0 12px rgba(32, 190, 255, 0.2)'
                      }}
                      title="Listen to pronunciation"
                    >
                      <Volume2 size={20} />
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

        {/* Footer Navigation */}
        {step === 'quiz' && !loading && isAnswered && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(255, 255, 255, 0.02)'
          }}>
            <button
              onClick={handleNext}
              style={{
                padding: '12px 26px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #20BEFF, #0099e6)',
                color: '#000',
                border: 'none',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
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
