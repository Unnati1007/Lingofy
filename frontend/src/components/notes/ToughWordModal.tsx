import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bookmark, Volume2, Check, Sparkles, AlertCircle } from 'lucide-react';
import { API_BASE } from '../../config';

interface ToughWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWord?: string;
  initialMeaning?: string;
  initialContext?: string;
  language: string;
  source?: 'quiz' | 'lesson' | 'song' | 'manual';
  onSaved?: (savedNote: any) => void;
}

export const ToughWordModal: React.FC<ToughWordModalProps> = ({
  isOpen,
  onClose,
  initialWord = '',
  initialMeaning = '',
  initialContext = '',
  language = 'spanish',
  source = 'quiz',
  onSaved
}) => {
  const [word, setWord] = useState(initialWord);
  const [meaning, setMeaning] = useState(initialMeaning);
  const [contextSentence, setContextSentence] = useState(initialContext);
  const [userNote, setUserNote] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('hard');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setWord(initialWord);
      setMeaning(initialMeaning);
      setContextSentence(initialContext);
      setSelectedLanguage(language || 'spanish');
      setUserNote('');
      setSavedSuccess(false);
      setErrorMessage('');
    }
  }, [isOpen, initialWord, initialMeaning, initialContext, language]);

  if (!isOpen) return null;

  const playAudio = (textToPlay: string) => {
    if (!('speechSynthesis' in window) || !textToPlay.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToPlay);
    const langCode = selectedLanguage?.toLowerCase() === 'spanish' 
      ? 'es-ES' 
      : selectedLanguage?.toLowerCase() === 'korean' 
      ? 'ko-KR' 
      : 'hi-IN';
    utterance.lang = langCode;
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!word.trim()) {
      setErrorMessage('Please enter the target word.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'vocabulary',
          word: word.trim(),
          meaning: meaning.trim(),
          language: selectedLanguage.toLowerCase(),
          contextSentence: contextSentence.trim(),
          source,
          difficulty,
          notes: userNote.trim(),
          tags: ['Tough Word', source.toUpperCase()]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save tough word');
      }

      setSavedSuccess(true);
      if (onSaved) onSaved(data.note);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
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
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(18, 209, 94, 0.15)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(234, 179, 8, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#eab308'
              }}>
                <Bookmark size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#fff' }}>
                  Mark as Tough Word
                </h3>
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  Save to your personal vocabulary vault & notes
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
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)')}
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {errorMessage && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                {errorMessage}
              </div>
            )}

            {savedSuccess ? (
              <div style={{
                padding: '36px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Check size={36} strokeWidth={3} />
                </motion.div>
                <h4 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>
                  Saved to Notes & Vocab!
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  You can review and practice this word anytime in your Notes tab.
                </p>
              </div>
            ) : (
              <>
                {/* Target Word with Audio Pronunciation */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.6)', letterSpacing: '0.5px' }}>
                      Target Tough Word *
                    </label>
                    {word.trim() && (
                      <button
                        type="button"
                        onClick={() => playAudio(word)}
                        style={{
                          background: 'rgba(234, 179, 8, 0.12)',
                          border: '1px solid rgba(234, 179, 8, 0.3)',
                          color: '#eab308',
                          borderRadius: '8px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        <Volume2 size={13} /> Listen Pronunciation
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="e.g. Desafío, पुस्तकालय, 사랑"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: '700',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Meaning / Translation */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    Meaning / Translation in Native Language
                  </label>
                  <input
                    type="text"
                    value={meaning}
                    onChange={(e) => setMeaning(e.target.value)}
                    placeholder="e.g. Challenge / Difficulty"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Language & Difficulty Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                      Language
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: '#27272a',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="spanish">🇪🇸 Spanish</option>
                      <option value="hindi">🇮🇳 Hindi</option>
                      <option value="korean">🇰🇷 Korean</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                      Difficulty
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {(['medium', 'hard'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setDifficulty(lvl)}
                          style={{
                            flex: 1,
                            padding: '11px 8px',
                            background: difficulty === lvl ? (lvl === 'hard' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)') : 'rgba(255, 255, 255, 0.04)',
                            border: `1px solid ${difficulty === lvl ? (lvl === 'hard' ? '#ef4444' : '#eab308') : 'rgba(255, 255, 255, 0.1)'}`,
                            borderRadius: '10px',
                            color: difficulty === lvl ? (lvl === 'hard' ? '#f87171' : '#facc15') : 'rgba(255, 255, 255, 0.6)',
                            fontSize: '12px',
                            fontWeight: '700',
                            textTransform: 'capitalize',
                            cursor: 'pointer'
                          }}
                        >
                          {lvl === 'hard' ? '🔥 Hard' : '⚡ Medium'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Context Sentence */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    Context Sentence / Origin (Optional)
                  </label>
                  <input
                    type="text"
                    value={contextSentence}
                    onChange={(e) => setContextSentence(e.target.value)}
                    placeholder="e.g. Quiz question or example usage sentence"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Personal Note */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    Personal Memory Note / Mnemonic (Optional)
                  </label>
                  <textarea
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="e.g. Remember: starts with 'Des', sounds like challenge..."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'none'
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={saving || !word.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      flex: 2,
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #12d15e 0%, #059669 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#000',
                      fontWeight: '800',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: saving || !word.trim() ? 'not-allowed' : 'pointer',
                      boxShadow: '0 0 20px rgba(18, 209, 94, 0.3)'
                    }}
                  >
                    <Sparkles size={16} />
                    {saving ? 'Saving...' : 'Save to Tough Words'}
                  </motion.button>
                </div>
              </>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default ToughWordModal;
