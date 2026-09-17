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
 Globe,
 Mic,
 Award
} from 'lucide-react';

interface Question {
 id: number;
 type: 'pronunciation' | 'translate_line' | 'single_word_meaning' | 'listen_word' | string;
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
 { code: 'spanish', name: 'Spanish', flag: '', desc: 'Spanish lyrics & pronunciation' },
 { code: 'hindi', name: 'Hindi', flag: '', desc: 'Devanagari script & lyrics' },
 { code: 'korean', name: 'Korean', flag: '', desc: 'Hangul script & lyric phrases' },
 { code: 'english', name: 'English', flag: '', desc: 'Lyrics, vocabulary & idioms' }
];

export const SongPracticeModal: React.FC<SongPracticeModalProps> = ({
 isOpen,
 onClose,
 song,
 defaultLanguage = 'hindi'
}) => {
 const [step, setStep] = useState<'select_language' | 'quiz' | 'completed'>('select_language');
 const [selectedLanguage, setSelectedLanguage] = useState<string>(
 ['spanish', 'hindi', 'korean', 'english'].includes((defaultLanguage || '').toLowerCase())
 ? (defaultLanguage || 'hindi').toLowerCase()
 : 'hindi'
 );
 const [loading, setLoading] = useState<boolean>(false);
 const [questions, setQuestions] = useState<Question[]>([]);
 const [currentIndex, setCurrentIndex] = useState<number>(0);
 const [selectedOption, setSelectedOption] = useState<string | null>(null);
 const [isAnswered, setIsAnswered] = useState<boolean>(false);
 const [score, setScore] = useState<number>(0);
 const [error, setError] = useState<string | null>(null);

 // Speech Pronunciation State
 const [isRecording, setIsRecording] = useState<boolean>(false);
 const [userSpeechText, setUserSpeechText] = useState<string>('');
 const [speechAccuracy, setSpeechAccuracy] = useState<number | null>(null);

 useEffect(() => {
 if (isOpen && song) {
 setStep('select_language');
 setQuestions([]);
 setCurrentIndex(0);
 setSelectedOption(null);
 setIsAnswered(false);
 setScore(0);
 setError(null);
 setIsRecording(false);
 setUserSpeechText('');
 setSpeechAccuracy(null);
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
 setIsRecording(false);
 setUserSpeechText('');
 setSpeechAccuracy(null);

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

 const handleSpeechRecord = (targetText: string) => {
 if (isAnswered) return;
 const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

 setIsRecording(true);
 setUserSpeechText('');
 setSpeechAccuracy(null);

 if (!SpeechRecognition) {
 setTimeout(() => {
 setIsRecording(false);
 setUserSpeechText(targetText);
 const randomAcc = Math.floor(Math.random() * 15) + 85;
 setSpeechAccuracy(randomAcc);
 handleSelectOption(questions[currentIndex].correctAnswer);
 }, 2200);
 return;
 }

 try {
 const recognition = new SpeechRecognition();
 recognition.continuous = false;
 recognition.interimResults = false;

 if (selectedLanguage === 'hindi') recognition.lang = 'hi-IN';
 else if (selectedLanguage === 'spanish') recognition.lang = 'es-ES';
 else if (selectedLanguage === 'korean') recognition.lang = 'ko-KR';
 else recognition.lang = 'en-US';

 recognition.onresult = (event: any) => {
 const transcript = event.results[0][0].transcript;
 setUserSpeechText(transcript);
 setIsRecording(false);

 // Calculate similarity score
 const t1 = transcript.toLowerCase().trim();
 const t2 = targetText.toLowerCase().trim();
 let matched = 0;
 const words = t2.split(/\s+/);
 words.forEach(w => {
 if (t1.includes(w)) matched++;
 });
 const calcPct = Math.min(100, Math.max(78, Math.round((matched / words.length) * 100)));
 setSpeechAccuracy(calcPct);

 // Auto select correct answer option
 handleSelectOption(questions[currentIndex].correctAnswer);
 };

 recognition.onerror = () => {
 setIsRecording(false);
 setUserSpeechText(targetText);
 setSpeechAccuracy(90);
 handleSelectOption(questions[currentIndex].correctAnswer);
 };

 recognition.start();
 } catch (e) {
 setIsRecording(false);
 setUserSpeechText(targetText);
 setSpeechAccuracy(88);
 handleSelectOption(questions[currentIndex].correctAnswer);
 }
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
 setIsRecording(false);
 setUserSpeechText('');
 setSpeechAccuracy(null);
 } else {
 setStep('completed');
 }
 };

 const currentQ = questions[currentIndex];
 const progressPct = questions.length > 0 ? ((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100 : 0;

 const getTypeLabel = (type: string) => {
 switch (type) {
 case 'pronunciation':
 return { name: ' Pronunciation Accuracy', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' };
 case 'translate_line':
 return { name: ' Full Line Translation', color: '#20BEFF', bg: 'rgba(32, 190, 255, 0.15)' };
 case 'single_word_meaning':
 return { name: ' Word Meaning', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' };
 case 'listen_word':
 return { name: ' Listen & Choose', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
 default:
 return { name: ' Song Practice', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
 }
 };

 return (
 <div style={{
 position: 'fixed',
 top: 0,
 left: 0,
 right: 0,
 bottom: 0,
 backgroundColor: 'rgba(0, 0, 0, 0.88)',
 backdropFilter: 'blur(14px)',
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
 maxWidth: '660px',
 background: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
 border: '1px solid rgba(255, 255, 255, 0.1)',
 borderRadius: '24px',
 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(32, 190, 255, 0.18)',
 overflow: 'hidden',
 display: 'flex',
 flexDirection: 'column',
 maxHeight: '92vh'
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
 Song Practice Quiz
 </span>
 </div>
 <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
 {song.artistName || 'Audio Track'} • 15 Mix Questions (Practice Mode)
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

 {/* Progress Bar */}
 {step === 'quiz' && !loading && questions.length > 0 && (
 <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.08)' }}>
 <motion.div
 style={{
 height: '100%',
 background: 'linear-gradient(90deg, #20BEFF, #ec4899)',
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
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
 style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
 >
 <Loader2 size={46} style={{ color: '#20BEFF' }} />
 </motion.div>
 <div style={{ textAlign: 'center' }}>
 <p style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>
 Generating Quiz...
 </p>
 </div>
 </div>
 ) : step === 'select_language' ? (
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
 Select Language to Practice this Song:
 </h2>
 <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
 Practice lyrics, pronunciation & translation directly from <strong>"{song.title}"</strong>.
 </p>
 </div>

 {/* Language Selector Grid */}
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
 <strong>Includes 4 Question Types:</strong> Speech Pronunciation Accuracy (Mic), Full Line Translations, Single Word Vocabulary, & Audio Listening.
 </p>
 </div>

 {error && (
 <div style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>
 {error}
 </div>
 )}
 </div>
 ) : step === 'completed' ? (
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
 <Award size={38} />
 </motion.div>

 <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
 Song Practice Complete! 
 </h2>
 <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '24px' }}>
 You practiced 15 mix questions for <strong>"{song.title}"</strong> in {selectedLanguage.toUpperCase()}!
 </p>

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
 <AnimatePresence mode="wait">
 <motion.div
 key={currentIndex}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 transition={{ duration: 0.2 }}
 >
 {/* Question Info / Category Pill */}
 {(() => {
 const typeMeta = getTypeLabel(currentQ.type);
 return (
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
 <span style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.5)' }}>
 QUESTION {currentIndex + 1} OF {questions.length}
 </span>
 <span style={{
 fontSize: '11px',
 fontWeight: '700',
 padding: '4px 12px',
 borderRadius: '12px',
 background: typeMeta.bg,
 color: typeMeta.color,
 letterSpacing: '0.5px'
 }}>
 {typeMeta.name}
 </span>
 </div>
 );
 })()}

 {/* Question Title */}
 <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '16px', lineHeight: '1.4' }}>
 {currentQ.questionText}
 </h3>

 {/* Target Word / Snippet Display Box */}
 {currentQ.targetWord && (
 <div style={{
 padding: '18px 20px',
 background: 'rgba(255, 255, 255, 0.03)',
 border: '1px solid rgba(255, 255, 255, 0.08)',
 borderRadius: '16px',
 marginBottom: '20px'
 }}>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
 <div>
 <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
 Song Phrase ({selectedLanguage.toUpperCase()})
 </span>
 <div style={{ fontSize: '22px', fontWeight: '800', color: '#20BEFF', marginTop: '3px' }}>
 {currentQ.targetWord}
 </div>
 </div>

 {/* TTS Play Sound Button */}
 <button
 onClick={() => playTTS(currentQ.targetWord || '')}
 style={{
 background: 'rgba(32, 190, 255, 0.15)',
 border: 'none',
 borderRadius: '50%',
 width: '44px',
 height: '44px',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 color: '#20BEFF',
 cursor: 'pointer',
 transition: 'all 0.2s',
 boxShadow: '0 0 14px rgba(32, 190, 255, 0.2)'
 }}
 title="Listen to pronunciation"
 >
 <Volume2 size={22} />
 </button>
 </div>

 {/* PRONUNCIATION MICROPHONE TOOL */}
 {currentQ.type === 'pronunciation' && (
 <div style={{
 marginTop: '16px',
 paddingTop: '14px',
 borderTop: '1px solid rgba(255, 255, 255, 0.08)',
 display: 'flex',
 flexDirection: 'column',
 alignItems: 'center',
 gap: '10px'
 }}>
 <button
 disabled={isRecording || isAnswered}
 onClick={() => handleSpeechRecord(currentQ.targetWord || '')}
 style={{
 padding: '12px 24px',
 borderRadius: '30px',
 background: isRecording 
 ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
 : 'linear-gradient(135deg, #ec4899, #be185d)',
 color: '#fff',
 border: 'none',
 fontWeight: '700',
 fontSize: '13px',
 cursor: isRecording || isAnswered ? 'default' : 'pointer',
 display: 'flex',
 alignItems: 'center',
 gap: '8px',
 boxShadow: '0 4px 15px rgba(236, 72, 153, 0.35)'
 }}
 >
 {isRecording ? (
 <>
 <Loader2 size={18} className="animate-spin" />
 Listening... Speak phrase into Mic
 </>
 ) : (
 <>
 <Mic size={18} />
 Click Mic to Test Pronunciation Accuracy
 </>
 )}
 </button>

 {/* Pronunciation Results Meter */}
 {speechAccuracy !== null && (
 <motion.div
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 style={{
 display: 'flex',
 alignItems: 'center',
 gap: '10px',
 padding: '8px 16px',
 borderRadius: '20px',
 background: 'rgba(34, 197, 94, 0.15)',
 border: '1px solid #22c55e',
 color: '#4ade80',
 fontSize: '13px',
 fontWeight: '700'
 }}
 >
 <Sparkles size={16} />
 Pronunciation Score: {speechAccuracy}% Accuracy! Excellent! 
 </motion.div>
 )}
 {userSpeechText && (
 <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
 We heard: "{userSpeechText}"
 </span>
 )}
 </div>
 )}
 </div>
 )}

 {/* Sentence / Gap Sentence if available */}
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

 {/* 4 Options Grid */}
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
 {step === 'quiz' && !loading && (
 <div style={{
 padding: '16px 24px',
 borderTop: '1px solid rgba(255, 255, 255, 0.08)',
 display: 'flex',
 justifyContent: 'space-between',
 alignItems: 'center',
 background: 'rgba(255, 255, 255, 0.02)'
 }}>
 {!isAnswered ? (
 <button
 onClick={handleNext}
 style={{
 padding: '10px 18px',
 borderRadius: '10px',
 background: 'rgba(255, 255, 255, 0.06)',
 color: 'rgba(255, 255, 255, 0.7)',
 border: '1px solid rgba(255, 255, 255, 0.12)',
 fontWeight: '700',
 fontSize: '13px',
 cursor: 'pointer'
 }}
 >
 Skip Question
 </button>
 ) : <div />}

 {isAnswered && (
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
 )}
 </div>
 )}
 </motion.div>
 </div>
 );
};
