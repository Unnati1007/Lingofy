import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, RotateCcw, CheckCircle2, Flame, ArrowRight, ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { API_BASE } from '../../config';

interface FlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: any[];
  onWordUpdated?: (updatedWord: any) => void;
}

export const FlashcardModal: React.FC<FlashcardModalProps> = ({
  isOpen,
  onClose,
  words = [],
  onWordUpdated
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (!isOpen || words.length === 0) return null;

  const currentWord = words[currentIndex];

  const playAudio = (textToPlay: string, lang: string) => {
    if (!('speechSynthesis' in window) || !textToPlay?.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToPlay);
    const langCode = lang?.toLowerCase() === 'spanish' 
      ? 'es-ES' 
      : lang?.toLowerCase() === 'korean' 
      ? 'ko-KR' 
      : 'hi-IN';
    utterance.lang = langCode;
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleMarkMastered = async (wordId: string) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/notes/${wordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mastered: true })
      });

      if (response.ok) {
        const data = await response.json();
        setMasteredCount(prev => prev + 1);
        if (onWordUpdated) onWordUpdated(data.note);
      }
    } catch (err) {
      console.error('Error updating mastery:', err);
    } finally {
      setUpdating(false);
      handleNext();
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setMasteredCount(0);
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{
            background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(18, 209, 94, 0.15)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🃏</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#fff' }}>
                  Flashcard Practice Mode
                </h3>
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  Active recall for your saved tough words
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '28px' }}>
            {isCompleted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(234, 179, 8, 0.15)',
                    color: '#eab308',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}
                >
                  <Trophy size={42} />
                </motion.div>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
                  Practice Complete! 🎉
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '15px', marginBottom: '24px' }}>
                  You reviewed all {words.length} tough words in this set!
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px',
                  marginBottom: '32px'
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '16px 24px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#fff' }}>{words.length}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase' }}>Reviewed</div>
                  </div>
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.08)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    borderRadius: '16px',
                    padding: '16px 24px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#22c55e' }}>{masteredCount}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(34, 197, 94, 0.7)', textTransform: 'uppercase' }}>Marked Mastered</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={resetSession}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '14px',
                      color: '#fff',
                      fontWeight: '700',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={16} /> Practice Again
                  </button>
                  <button
                    onClick={onClose}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: 'linear-gradient(135deg, #12d15e 0%, #059669 100%)',
                      border: 'none',
                      borderRadius: '14px',
                      color: '#000',
                      fontWeight: '800',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Progress Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${((currentIndex + 1) / words.length) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #12d15e, #22c55e)',
                        borderRadius: '100px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.6)', minWidth: '45px', textAlign: 'right' }}>
                    {currentIndex + 1}/{words.length}
                  </span>
                </div>

                {/* 3D Flip Card Container */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{
                    minHeight: '260px',
                    perspective: '1000px',
                    cursor: 'pointer',
                    marginBottom: '24px'
                  }}
                >
                  <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    style={{
                      width: '100%',
                      minHeight: '260px',
                      position: 'relative',
                      transformStyle: 'preserve-3d',
                      borderRadius: '24px',
                      background: isFlipped ? 'rgba(34, 197, 94, 0.06)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isFlipped ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`,
                      padding: '28px',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    {!isFlipped ? (
                      /* FRONT of Card: Target Word */
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            padding: '4px 10px',
                            borderRadius: '100px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: 'rgba(255, 255, 255, 0.7)'
                          }}>
                            {currentWord?.language?.toUpperCase()} • {currentWord?.source?.toUpperCase()}
                          </span>
                          {currentWord?.mastered && (
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '100px',
                              background: 'rgba(34, 197, 94, 0.15)',
                              color: '#22c55e'
                            }}>
                              🎯 Mastered
                            </span>
                          )}
                        </div>

                        <div style={{
                          fontSize: '38px',
                          fontWeight: '900',
                          color: '#fff',
                          letterSpacing: '0.5px',
                          textShadow: '0 0 25px rgba(255, 255, 255, 0.2)'
                        }}>
                          {currentWord?.word}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playAudio(currentWord?.word, currentWord?.language);
                          }}
                          style={{
                            background: 'rgba(234, 179, 8, 0.15)',
                            border: '1px solid rgba(234, 179, 8, 0.3)',
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#eab308',
                            cursor: 'pointer',
                            fontSize: '18px',
                            marginTop: '6px'
                          }}
                          title="Listen pronunciation"
                        >
                          <Volume2 size={20} />
                        </button>

                        <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '8px' }}>
                          👆 Tap card to flip & reveal meaning
                        </span>
                      </div>
                    ) : (
                      /* BACK of Card: Meaning & Context */
                      <div style={{
                        transform: 'rotateY(180deg)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%'
                      }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          color: '#22c55e'
                        }}>
                          Meaning / Translation
                        </span>

                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', lineHeight: '1.4' }}>
                          {currentWord?.meaning || 'No meaning recorded'}
                        </div>

                        {currentWord?.contextSentence && (
                          <div style={{
                            marginTop: '8px',
                            padding: '10px 16px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            fontSize: '13px',
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontStyle: 'italic',
                            maxWidth: '90%'
                          }}>
                            "{currentWord.contextSentence}"
                          </div>
                        )}

                        {currentWord?.notes && (
                          <div style={{
                            fontSize: '12px',
                            color: 'rgba(234, 179, 8, 0.9)',
                            background: 'rgba(234, 179, 8, 0.1)',
                            padding: '6px 12px',
                            borderRadius: '8px'
                          }}>
                            💡 Note: {currentWord.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Control Actions */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: currentIndex === 0 ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.8)',
                      cursor: currentIndex === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <button
                    onClick={handleNext}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '14px',
                      color: '#f87171',
                      fontWeight: '700',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Flame size={16} /> Still Tough (Next)
                  </button>

                  <button
                    onClick={() => handleMarkMastered(currentWord?._id)}
                    disabled={updating}
                    style={{
                      flex: 1.2,
                      padding: '14px',
                      background: 'linear-gradient(135deg, #12d15e 0%, #059669 100%)',
                      border: 'none',
                      borderRadius: '14px',
                      color: '#000',
                      fontWeight: '800',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: updating ? 'not-allowed' : 'pointer',
                      boxShadow: '0 0 15px rgba(18, 209, 94, 0.3)'
                    }}
                  >
                    <CheckCircle2 size={16} /> Mastered! 🎯
                  </button>

                  <button
                    onClick={handleNext}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default FlashcardModal;
