import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  FileText,
  Plus,
  Search,
  Volume2,
  Trash2,
  Edit2,
  CheckCircle2,
  Flame,
  Sparkles,
  BookOpen,
  Filter,
  Layers,
  RotateCcw,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { API_BASE } from '../../config';
import ToughWordModal from './ToughWordModal';
import FlashcardModal from './FlashcardModal';

interface NotesHubProps {
  currentUser?: any;
}

export const NotesHub: React.FC<NotesHubProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'notes'>('vocabulary');
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'tough' | 'mastered'>('all');
  const [stats, setStats] = useState<any>({ totalNotes: 0, totalToughWords: 0, masteredWords: 0 });

  // Modal States
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [showNoteEditorModal, setShowNoteEditorModal] = useState(false);
  const [editingNote, setEditingNote] = useState<any | null>(null);

  // Note Form State (for general study notes)
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    language: 'spanish',
    tags: ''
  });
  const [savingNote, setSavingNote] = useState(false);

  // Speech TTS function
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

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const [notesRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/notes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/notes/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (notesRes.ok) {
        const data = await notesRes.json();
        setNotes(data);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Filtered Tough Words (Vocabulary)
  const filteredWords = useMemo(() => {
    return notes.filter((item) => {
      if (item.type !== 'vocabulary') return false;
      if (selectedLanguage !== 'all' && item.language?.toLowerCase() !== selectedLanguage.toLowerCase()) return false;
      if (selectedStatus === 'tough' && item.mastered) return false;
      if (selectedStatus === 'mastered' && !item.mastered) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inWord = item.word?.toLowerCase().includes(q);
        const inMeaning = item.meaning?.toLowerCase().includes(q);
        const inContext = item.contextSentence?.toLowerCase().includes(q);
        const inNote = item.notes?.toLowerCase().includes(q);
        return inWord || inMeaning || inContext || inNote;
      }
      return true;
    });
  }, [notes, selectedLanguage, selectedStatus, searchQuery]);

  // Filtered Study Notes
  const filteredNotes = useMemo(() => {
    return notes.filter((item) => {
      if (item.type !== 'note') return false;
      if (selectedLanguage !== 'all' && item.language?.toLowerCase() !== selectedLanguage.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title?.toLowerCase().includes(q);
        const inContent = item.content?.toLowerCase().includes(q);
        const inTags = item.tags?.some((t: string) => t.toLowerCase().includes(q));
        return inTitle || inContent || inTags;
      }
      return true;
    });
  }, [notes, selectedLanguage, searchQuery]);

  // Toggle Word Mastery Status
  const handleToggleMastery = async (word: any) => {
    try {
      const token = localStorage.getItem('token');
      const updatedMastered = !word.mastered;

      const res = await fetch(`${API_BASE}/api/notes/${word._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mastered: updatedMastered })
      });

      if (res.ok) {
        if (updatedMastered) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          });
        }
        setNotes((prev) =>
          prev.map((n) => (n._id === word._id ? { ...n, mastered: updatedMastered } : n))
        );
        fetchNotes(); // Refresh stats
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Note / Word
  const handleDeleteNote = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n._id !== id));
        fetchNotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save General Study Note
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title.trim() && !noteForm.content.trim()) return;

    setSavingNote(true);
    try {
      const token = localStorage.getItem('token');
      const tagsArray = noteForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const url = editingNote ? `${API_BASE}/api/notes/${editingNote._id}` : `${API_BASE}/api/notes`;
      const method = editingNote ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'note',
          title: noteForm.title.trim(),
          content: noteForm.content.trim(),
          language: noteForm.language.toLowerCase(),
          tags: tagsArray
        })
      });

      if (res.ok) {
        setShowNoteEditorModal(false);
        setEditingNote(null);
        setNoteForm({ title: '', content: '', language: 'spanish', tags: '' });
        fetchNotes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  const openNoteEditor = (noteToEdit?: any) => {
    if (noteToEdit) {
      setEditingNote(noteToEdit);
      setNoteForm({
        title: noteToEdit.title || '',
        content: noteToEdit.content || '',
        language: noteToEdit.language || 'spanish',
        tags: noteToEdit.tags?.join(', ') || ''
      });
    } else {
      setEditingNote(null);
      setNoteForm({
        title: '',
        content: '',
        language: selectedLanguage !== 'all' ? selectedLanguage : 'spanish',
        tags: ''
      });
    }
    setShowNoteEditorModal(true);
  };

  const masteryPercent = stats.totalToughWords > 0
    ? Math.round((stats.masteredWords / stats.totalToughWords) * 100)
    : 0;

  return (
    <div id="tour-notes-hub" style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Main Navigation Tabs & Action Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '20px'
      }}>
        {/* Left Sub-tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveTab('vocabulary')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'vocabulary' ? '#20BEFF' : 'transparent',
              color: activeTab === 'vocabulary' ? '#000' : 'rgba(255,255,255,0.7)',
              fontWeight: '800',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Bookmark size={16} />
            Tough Words Bank ({filteredWords.length})
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'notes' ? '#20BEFF' : 'transparent',
              color: activeTab === 'notes' ? '#000' : 'rgba(255,255,255,0.7)',
              fontWeight: '800',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <FileText size={16} />
            Study Notes & Journal ({filteredNotes.length})
          </button>
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {activeTab === 'vocabulary' && filteredWords.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowFlashcardModal(true)}
              style={{
                padding: '10px 18px',
                background: 'rgba(234, 179, 8, 0.15)',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                borderRadius: '12px',
                color: '#facc15',
                fontWeight: '700',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <span>🃏</span> Practice Flashcards
            </motion.button>
          )}

          {activeTab === 'vocabulary' ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddWordModal(true)}
              style={{
                padding: '10px 18px',
                background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#000',
                fontWeight: '800',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(32, 190, 255, 0.35)'
              }}
            >
              <Plus size={16} strokeWidth={3} /> Add Tough Word
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openNoteEditor()}
              style={{
                padding: '10px 18px',
                background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#000',
                fontWeight: '800',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(32, 190, 255, 0.35)'
              }}
            >
              <Plus size={16} strokeWidth={3} /> New Study Note
            </motion.button>
          )}
        </div>
      </div>

      {/* Filter & Search Controls Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px',
        justifyContent: 'space-between'
      }}>
        {/* Search input */}
        <div style={{
          position: 'relative',
          flex: '1',
          minWidth: '240px',
          maxWidth: '400px'
        }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'rgba(255,255,255,0.4)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'vocabulary' ? "Search tough words, meanings..." : "Search study notes, tags..."}
            style={{
              width: '100%',
              padding: '11px 16px 11px 42px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Language filter */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{
              padding: '11px 16px',
              background: '#27272a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Languages</option>
            <option value="spanish">Spanish</option>
            <option value="hindi">Hindi</option>
            <option value="korean">Korean</option>
          </select>

          {/* Status filter (for vocabulary) */}
          {activeTab === 'vocabulary' && (
            <select
              value={selectedStatus}
              onChange={(e: any) => setSelectedStatus(e.target.value)}
              style={{
                padding: '11px 16px',
                background: '#27272a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="tough">Needs Practice</option>
              <option value="mastered">Mastered</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
          Loading your notes & vocabulary...
        </div>
      ) : activeTab === 'vocabulary' ? (
        /* TOUGH WORDS BANK */
        <div>
          {filteredWords.length === 0 ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(234, 179, 8, 0.1)',
                color: '#eab308',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bookmark size={28} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                No Tough Words Saved Yet
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', maxWidth: '440px', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                When taking quizzes or learning lessons, click the <strong>"Mark Tough Word"</strong> button to bookmark any challenging word right here.
              </p>
              <button
                onClick={() => setShowAddWordModal(true)}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(32, 190, 255, 0.15)',
                  border: '1px solid #20BEFF',
                  color: '#20BEFF',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                + Add Your First Tough Word
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {filteredWords.map((item) => {
                const isMastered = item.mastered;
                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: isMastered ? 'rgba(32, 190, 255, 0.04)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isMastered ? 'rgba(32, 190, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: '20px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '16px',
                      position: 'relative',
                      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                    }}
                  >
                    <div>
                      {/* Card Header: Badges & Source */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: 'rgba(255, 255, 255, 0.7)'
                          }}>
                            {item.language}
                          </span>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: item.source === 'quiz' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                            color: item.source === 'quiz' ? '#c084fc' : '#60a5fa'
                          }}>
                            {item.source}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => handleDeleteNote(item._id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'rgba(255, 255, 255, 0.4)',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '6px'
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Foreign Word + TTS Audio */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '0.3px' }}>
                          {item.word}
                        </h3>
                        <button
                          onClick={() => playAudio(item.word, item.language)}
                          style={{
                            background: 'rgba(234, 179, 8, 0.15)',
                            border: '1px solid rgba(234, 179, 8, 0.3)',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#eab308',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                          title="Listen pronunciation"
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>

                      {/* Meaning */}
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#20BEFF', marginBottom: '12px' }}>
                        {item.meaning || 'No meaning added'}
                      </div>

                      {/* Context / Origin */}
                      {item.contextSentence && (
                        <div style={{
                          fontSize: '12px',
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontStyle: 'italic',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px',
                          padding: '8px 12px',
                          marginBottom: '10px'
                        }}>
                          "{item.contextSentence}"
                        </div>
                      )}

                      {/* Personal Mnemonic / Note */}
                      {item.notes && (
                        <div style={{
                          fontSize: '12px',
                          color: 'rgba(234, 179, 8, 0.9)',
                          background: 'rgba(234, 179, 8, 0.08)',
                          borderRadius: '8px',
                          padding: '6px 10px'
                        }}>
                          {item.notes}
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Mastery Toggle */}
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <button
                        onClick={() => handleToggleMastery(item)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '10px',
                          border: isMastered ? '1px solid #20BEFF' : '1px solid rgba(255,255,255,0.1)',
                          background: isMastered ? 'rgba(32, 190, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                          color: isMastered ? '#20BEFF' : 'rgba(255, 255, 255, 0.6)',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {isMastered ? (
                          <>
                            <CheckCircle2 size={14} /> Mastered
                          </>
                        ) : (
                          <>
                            <Flame size={14} /> Mark Mastered
                          </>
                        )}
                      </button>

                      <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.3)' }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* STUDY NOTES & JOURNAL */
        <div>
          {filteredNotes.length === 0 ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(32, 190, 255, 0.1)',
                color: '#20BEFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText size={28} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                No Study Notes Yet
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', maxWidth: '440px', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                Capture grammar rules, tricky phrases, cultural tips, or learning reflections here.
              </p>
              <button
                onClick={() => openNoteEditor()}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)',
                  border: 'none',
                  color: '#000',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                + Write Your First Note
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '20px'
            }}>
              {filteredNotes.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(32, 190, 255, 0.15)',
                        color: '#20BEFF'
                      }}>
                        {item.language}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => openNoteEditor(item)}
                          style={{ background: 'transparent', border: 'none', color: 'rgba(255, 255, 255, 0.5)', cursor: 'pointer', padding: '4px' }}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(item._id)}
                          style={{ background: 'transparent', border: 'none', color: 'rgba(255, 255, 255, 0.5)', cursor: 'pointer', padding: '4px' }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    {item.title && (
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>
                        {item.title}
                      </h3>
                    )}

                    {/* Content */}
                    <p style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      margin: 0
                    }}>
                      {item.content}
                    </p>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
                        {item.tags.map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '11px',
                              color: 'rgba(255, 255, 255, 0.5)',
                              background: 'rgba(255, 255, 255, 0.05)',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.3)' }}>
                    Saved on {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Note Editor Modal */}
      {showNoteEditorModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNoteEditorModal(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: '#18181b',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '540px',
              padding: '28px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>
                {editingNote ? 'Edit Study Note' : 'New Study Note'}
              </h3>
              <button
                onClick={() => setShowNoteEditorModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNote} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                  Note Title
                </label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  placeholder="e.g. Subjunctive Mood Rules, Verb Conjugation Tips..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                    Language
                  </label>
                  <select
                    value={noteForm.language}
                    onChange={(e) => setNoteForm({ ...noteForm, language: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: '#27272a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="spanish">Spanish</option>
                    <option value="hindi">Hindi</option>
                    <option value="korean">Korean</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={noteForm.tags}
                    onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
                    placeholder="grammar, verbs, tips"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                  Content / Notes *
                </label>
                <textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  placeholder="Write your study notes, rules, explanations, or reflections..."
                  rows={5}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowNoteEditorModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNote}
                  style={{
                    flex: 2,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#000',
                    fontWeight: '800',
                    cursor: savingNote ? 'not-allowed' : 'pointer'
                  }}
                >
                  {savingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Manual Tough Word Modal */}
      <ToughWordModal
        isOpen={showAddWordModal}
        onClose={() => setShowAddWordModal(false)}
        language={selectedLanguage !== 'all' ? selectedLanguage : 'spanish'}
        source="manual"
        onSaved={() => fetchNotes()}
      />

      {/* Flashcard Practice Modal */}
      <FlashcardModal
        isOpen={showFlashcardModal}
        onClose={() => setShowFlashcardModal(false)}
        words={filteredWords}
        onWordUpdated={() => fetchNotes()}
      />
    </div>
  );
};
export default NotesHub;
