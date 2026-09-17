import { API_BASE } from '../config';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
 Music, 
 Check, 
 Languages, 
 User, 
 ChevronRight, 
 Target, 
 Zap, 
 Flame,
 Award,
 Sparkles
} from 'lucide-react';

const supportedLearningLanguages = [
 { id: 'Spanish', name: 'Spanish', flag: '', native: 'Español', genres: 'Latin Pop, Reggaeton, Flamenco' },
 { id: 'Hindi', name: 'Hindi', flag: '', native: 'हिन्दी', genres: 'Bollywood, Melodic, Indie' },
 { id: 'Korean', name: 'Korean', flag: '', native: '한국어', genres: 'K-Pop, Ballads, Drama OSTs' },
 { id: 'English', name: 'English', flag: '', native: 'English', genres: 'Global Pop, Rock, R&B' }
];

const knownLanguageOptions = [
 { id: 'English', name: 'English', flag: '' },
 { id: 'Hindi', name: 'Hindi', flag: '' },
 { id: 'Spanish', name: 'Spanish', flag: '' },
 { id: 'Korean', name: 'Korean', flag: '' },
 { id: 'French', name: 'French', flag: '' },
 { id: 'German', name: 'German', flag: '' }
];

const learningGoals = [
 { id: 'lyrics', label: 'Understand Song Lyrics', icon: '', desc: 'Decode song meanings, poetic metaphors, and rhythm lines.' },
 { id: 'conversation', label: 'Daily Conversation & Slang', icon: '️', desc: 'Pick up authentic colloquial phrases used in popular songs.' },
 { id: 'vocabulary', label: 'Rapid Vocabulary & Memory', icon: '', desc: 'Lock in words faster through melodic hooks and repetition.' }
];

const proficiencyLevels = [
 { id: 'beginner', label: 'Beginner', level: 'Level 1', desc: 'Starting from scratch or learning basic greeting words.' },
 { id: 'intermediate', label: 'Intermediate', level: 'Level 2', desc: 'Can catch some phrases and understand simple lyrics.' },
 { id: 'advanced', label: 'Advanced', level: 'Level 3', desc: 'Aiming for fast-paced lyrics, idioms, and nuanced accents.' }
];

const dailyCommitments = [
 { minutes: 10, label: '10 Mins / Day', title: 'Casual Beats', badge: '1 Song + Quiz', icon: Zap },
 { minutes: 15, label: '15 Mins / Day', title: 'Steady Groove', badge: 'Recommended', icon: Sparkles },
 { minutes: 30, label: '30 Mins / Day', title: 'Deep Immersion', badge: 'Fast Track', icon: Flame }
];

const curatedGenres = [
 { name: 'Pop & Chartbusters', icon: '' },
 { name: 'Bollywood & Melodies', icon: '' },
 { name: 'Latin & Reggaeton', icon: '' },
 { name: 'K-Pop & OSTs', icon: '' },
 { name: 'Acoustic & Indie', icon: '' }
];

const curatedArtists = [
 // Spanish / Latin
 { name: 'Luis Fonsi', lang: 'Spanish', flag: '' },
 { name: 'Shakira', lang: 'Spanish', flag: '' },
 { name: 'Bad Bunny', lang: 'Spanish', flag: '' },

 // Hindi / Bollywood
 { name: 'Arijit Singh', lang: 'Hindi', flag: '' },
 { name: 'Shreya Ghoshal', lang: 'Hindi', flag: '' },
 { name: 'Prateek Kuhad', lang: 'Hindi', flag: '' },

 // Korean / K-Pop
 { name: 'BTS', lang: 'Korean', flag: '' },
 { name: 'BLACKPINK', lang: 'Korean', flag: '' },
 { name: 'IU', lang: 'Korean', flag: '' },

 // English / Global Pop
 { name: 'Ed Sheeran', lang: 'English', flag: '' },
 { name: 'Taylor Swift', lang: 'English', flag: '' },
 { name: 'Dua Lipa', lang: 'English', flag: '' }
];

const PreferencesPage = () => {
 const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
 const [selectedKnownLanguages, setSelectedKnownLanguages] = useState<string[]>([]);
 const [selectedGoal, setSelectedGoal] = useState<string>('');
 const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced' | ''>('');
 const [selectedDailyGoal, setSelectedDailyGoal] = useState<number>(0);
 const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
 const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
 const [artistFilter, setArtistFilter] = useState<string>('All');
 const [isSaving, setIsSaving] = useState(false);
 const navigate = useNavigate();

 const toggleSelection = (item: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
 setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
 };

 const toggleLanguage = (lang: string) => {
 setSelectedLanguages(prev => 
 prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
 );
 };

 const toggleKnownLanguage = (lang: string) => toggleSelection(lang, setSelectedKnownLanguages);
 const toggleGenre = (genre: string) => toggleSelection(genre, setSelectedGenres);
 const toggleArtist = (artist: string) => toggleSelection(artist, setSelectedArtists);

 const filteredArtists = artistFilter === 'All' 
 ? curatedArtists 
 : curatedArtists.filter(a => a.lang === artistFilter);

 const handleSavePreferences = async () => {
 if (isSaving) return;
 setIsSaving(true);

 try {
 const token = localStorage.getItem('token');
 
 // 1. Update Preferences
 const prefsRes = await fetch(`${API_BASE}/api/preferences`, {
 method: 'POST',
 headers: { 
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify({
 languagesToLearn: selectedLanguages.length > 0 ? selectedLanguages : ['Spanish'],
 favoriteGenres: selectedGenres,
 favoriteArtists: selectedArtists,
 vocabularyLevel: selectedLevel || 'beginner',
 sessionGoalMinutes: selectedDailyGoal || 15
 })
 });

 // 2. Update User Profile with primary target language & goals
 const profileRes = await fetch(`${API_BASE}/api/users/me/profile`, {
 method: 'PUT',
 headers: { 
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify({
 learningLanguage: selectedLanguages[0] || 'Spanish',
 nativeLanguage: selectedKnownLanguages[0] || 'English',
 knownLanguages: selectedKnownLanguages.length > 0 ? selectedKnownLanguages : ['English'],
 proficiency: selectedLevel || 'beginner',
 dailyGoal: selectedDailyGoal || 15
 })
 });

 const prefsData = await prefsRes.json();
 if (prefsRes.ok) {
 // Prevent profile completion prompt from showing again immediately
 sessionStorage.setItem('profilePromptDismissed_user', 'true');
 navigate('/dashboard');
 } else {
 alert(prefsData.message || 'Error saving preferences');
 }
 } catch (err) {
 console.error(err);
 alert('Failed to connect to the server');
 } finally {
 setIsSaving(false);
 }
 };

 return (
 <div style={{ 
 display: 'flex', 
 flexDirection: 'column', 
 alignItems: 'center', 
 minHeight: '100vh', 
 background: 'radial-gradient(circle at 50% 0%, #171728 0%, #0c0c14 100%)', 
 padding: '50px 5% 100px 5%', 
 width: '100%',
 color: '#fff',
 fontFamily: 'Inter, system-ui, sans-serif'
 }}>
 {/* Background Orbs */}
 <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '45%', height: '45%', background: 'rgba(32, 190, 255, 0.08)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }}></div>
 <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '45%', height: '45%', background: 'rgba(138, 43, 226, 0.08)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }}></div>

 <div style={{ width: '100%', maxWidth: '860px', position: 'relative', zIndex: 1 }}>
 
 {/* Header */}
 <div style={{ textAlign: 'center', marginBottom: '48px' }}>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '12px' }}>
 <img src="/Logo-1.png" alt="Lingofy Logo" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
 <div style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #fff 0%, #20BEFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Lingofy</div>
 </div>
 <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
 Personalize Your Musical Journey
 </h1>
 <p style={{ opacity: 0.65, fontSize: '15px', margin: 0 }}>
 Tailor your songs, translations, and interactive quizzes to your exact goals.
 </p>
 </div>

 {/* Step 1: Languages to Learn */}
 <div style={{ 
 background: 'rgba(255, 255, 255, 0.03)', 
 backdropFilter: 'blur(12px)', 
 border: '1px solid rgba(255, 255, 255, 0.08)', 
 borderRadius: '24px', 
 padding: '28px',
 marginBottom: '28px',
 boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
 <div style={{ background: 'rgba(32, 190, 255, 0.15)', padding: '10px', borderRadius: '12px' }}>
 <Languages size={22} color="#20BEFF" />
 </div>
 <div>
 <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Which language are you learning with music?</h3>
 <p style={{ fontSize: '13px', opacity: 0.5, margin: '3px 0 0 0' }}>Select your target languages supported with synced lyrics & lessons</p>
 </div>
 </div>
 
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
 {supportedLearningLanguages.map(lang => {
 const isSelected = selectedLanguages.includes(lang.id);
 return (
 <div 
 key={`learn-${lang.id}`}
 onClick={() => toggleLanguage(lang.id)}
 style={{
 padding: '16px 18px',
 borderRadius: '16px',
 background: isSelected 
 ? 'linear-gradient(135deg, rgba(32, 190, 255, 0.22) 0%, rgba(0, 153, 230, 0.12) 100%)' 
 : 'rgba(255, 255, 255, 0.04)',
 border: isSelected ? '1.5px solid #20BEFF' : '1px solid rgba(255, 255, 255, 0.08)',
 cursor: 'pointer',
 display: 'flex',
 flexDirection: 'column',
 gap: '6px',
 transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
 boxShadow: isSelected ? '0 8px 20px rgba(32, 190, 255, 0.2)' : 'none',
 transform: isSelected ? 'translateY(-2px)' : 'none'
 }}
 >
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <span style={{ fontSize: '24px' }}>{lang.flag}</span>
 {isSelected && (
 <div style={{ background: '#20BEFF', color: '#000', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 <Check size={12} strokeWidth={3} />
 </div>
 )}
 </div>
 <div style={{ fontSize: '16px', fontWeight: '700' }}>{lang.name}</div>
 <div style={{ fontSize: '11px', opacity: 0.5 }}>{lang.genres}</div>
 </div>
 );
 })}
 </div>

 <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
 <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', opacity: 0.85 }}>What languages do you already know?</h4>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
 {knownLanguageOptions.map(lang => {
 const isSelected = selectedKnownLanguages.includes(lang.id);
 return (
 <div 
 key={`know-${lang.id}`}
 onClick={() => toggleKnownLanguage(lang.id)}
 style={{
 padding: '7px 14px',
 borderRadius: '100px',
 background: isSelected ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.03)',
 border: isSelected ? '1px solid #fff' : '1px solid rgba(255, 255, 255, 0.08)',
 cursor: 'pointer',
 display: 'flex',
 alignItems: 'center',
 gap: '6px',
 fontSize: '13px',
 fontWeight: isSelected ? '600' : '400',
 transition: 'all 0.2s',
 opacity: isSelected ? 1 : 0.6
 }}
 >
 <span>{lang.flag}</span>
 <span>{lang.name}</span>
 {isSelected && <Check size={12} strokeWidth={2.5} />}
 </div>
 );
 })}
 </div>
 </div>
 </div>

 {/* Step 2: Genuine Personalization Goal */}
 <div style={{ 
 background: 'rgba(255, 255, 255, 0.03)', 
 backdropFilter: 'blur(12px)', 
 border: '1px solid rgba(255, 255, 255, 0.08)', 
 borderRadius: '24px', 
 padding: '28px',
 marginBottom: '28px',
 boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
 <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '10px', borderRadius: '12px' }}>
 <Target size={22} color="#a855f7" />
 </div>
 <div>
 <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>What is your primary learning goal?</h3>
 <p style={{ fontSize: '13px', opacity: 0.5, margin: '3px 0 0 0' }}>Lingofy customizes your lyric focus and song challenges based on this</p>
 </div>
 </div>

 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
 {learningGoals.map(goal => {
 const isSelected = selectedGoal === goal.id;
 return (
 <div
 key={goal.id}
 onClick={() => setSelectedGoal(goal.id)}
 style={{
 padding: '16px 18px',
 borderRadius: '16px',
 background: isSelected 
 ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(138, 43, 226, 0.08) 100%)' 
 : 'rgba(255, 255, 255, 0.04)',
 border: isSelected ? '1.5px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
 cursor: 'pointer',
 display: 'flex',
 flexDirection: 'column',
 gap: '6px',
 transition: 'all 0.25s ease',
 boxShadow: isSelected ? '0 8px 20px rgba(168, 85, 247, 0.2)' : 'none',
 transform: isSelected ? 'translateY(-2px)' : 'none'
 }}
 >
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <span style={{ fontSize: '22px' }}>{goal.icon}</span>
 {isSelected && (
 <div style={{ background: '#a855f7', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 <Check size={12} strokeWidth={3} />
 </div>
 )}
 </div>
 <div style={{ fontSize: '15px', fontWeight: '700' }}>{goal.label}</div>
 <div style={{ fontSize: '12px', opacity: 0.55, lineHeight: '1.4' }}>{goal.desc}</div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Step 3: Proficiency & Daily Rhythm */}
 <div style={{ 
 background: 'rgba(255, 255, 255, 0.03)', 
 backdropFilter: 'blur(12px)', 
 border: '1px solid rgba(255, 255, 255, 0.08)', 
 borderRadius: '24px', 
 padding: '28px',
 marginBottom: '28px',
 boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
 <div style={{ background: 'rgba(250, 204, 21, 0.15)', padding: '10px', borderRadius: '12px' }}>
 <Award size={22} color="#facc15" />
 </div>
 <div>
 <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Your Proficiency & Daily Rhythm</h3>
 <p style={{ fontSize: '13px', opacity: 0.5, margin: '3px 0 0 0' }}>Calibrate question difficulty and daily listening target</p>
 </div>
 </div>

 <div style={{ marginBottom: '24px' }}>
 <label style={{ fontSize: '13px', fontWeight: '600', opacity: 0.8, display: 'block', marginBottom: '10px' }}>Current Proficiency Level</label>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
 {proficiencyLevels.map(lvl => {
 const isSelected = selectedLevel === lvl.id;
 return (
 <div
 key={lvl.id}
 onClick={() => setSelectedLevel(lvl.id as any)}
 style={{
 padding: '14px',
 borderRadius: '14px',
 background: isSelected ? 'rgba(250, 204, 21, 0.15)' : 'rgba(255, 255, 255, 0.04)',
 border: isSelected ? '1.5px solid #facc15' : '1px solid rgba(255, 255, 255, 0.08)',
 cursor: 'pointer',
 transition: 'all 0.2s ease'
 }}
 >
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
 <span style={{ fontSize: '14px', fontWeight: '700', color: isSelected ? '#facc15' : '#fff' }}>{lvl.label}</span>
 <span style={{ fontSize: '11px', opacity: 0.5 }}>{lvl.level}</span>
 </div>
 <div style={{ fontSize: '11px', opacity: 0.6, lineHeight: '1.4' }}>{lvl.desc}</div>
 </div>
 );
 })}
 </div>
 </div>

 <div>
 <label style={{ fontSize: '13px', fontWeight: '600', opacity: 0.8, display: 'block', marginBottom: '10px' }}>Daily Practice Goal</label>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
 {dailyCommitments.map(goal => {
 const isSelected = selectedDailyGoal === goal.minutes;
 const IconComp = goal.icon;
 return (
 <div
 key={goal.minutes}
 onClick={() => setSelectedDailyGoal(goal.minutes)}
 style={{
 padding: '14px',
 borderRadius: '14px',
 background: isSelected ? 'rgba(32, 190, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
 border: isSelected ? '1.5px solid #20BEFF' : '1px solid rgba(255, 255, 255, 0.08)',
 cursor: 'pointer',
 transition: 'all 0.2s ease',
 display: 'flex',
 alignItems: 'center',
 gap: '12px'
 }}
 >
 <div style={{ background: isSelected ? '#20BEFF' : 'rgba(255,255,255,0.08)', color: isSelected ? '#000' : '#fff', padding: '8px', borderRadius: '10px' }}>
 <IconComp size={16} />
 </div>
 <div>
 <div style={{ fontSize: '14px', fontWeight: '700' }}>{goal.label}</div>
 <div style={{ fontSize: '11px', opacity: 0.6 }}>{goal.title} ({goal.badge})</div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>

 {/* Step 4: Music Genres */}
 <div style={{ 
 background: 'rgba(255, 255, 255, 0.03)', 
 backdropFilter: 'blur(12px)', 
 border: '1px solid rgba(255, 255, 255, 0.08)', 
 borderRadius: '24px', 
 padding: '28px',
 marginBottom: '28px',
 boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
 <div style={{ background: 'rgba(34, 197, 94, 0.15)', padding: '10px', borderRadius: '12px' }}>
 <Music size={22} color="#22c55e" />
 </div>
 <div>
 <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Preferred Music Styles</h3>
 <p style={{ fontSize: '13px', opacity: 0.5, margin: '3px 0 0 0' }}>Pick the genres you enjoy listening to</p>
 </div>
 </div>

 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
 {curatedGenres.map(genre => {
 const isSelected = selectedGenres.includes(genre.name);
 return (
 <div 
 key={genre.name}
 onClick={() => toggleGenre(genre.name)}
 style={{
 padding: '10px 18px',
 borderRadius: '100px',
 background: isSelected ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'rgba(255,255,255,0.04)',
 border: isSelected ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.08)',
 cursor: 'pointer',
 display: 'flex',
 alignItems: 'center',
 gap: '8px',
 fontSize: '14px',
 fontWeight: isSelected ? '700' : '400',
 transition: 'all 0.2s ease',
 boxShadow: isSelected ? '0 6px 16px rgba(34, 197, 94, 0.3)' : 'none',
 transform: isSelected ? 'scale(1.03)' : 'scale(1)'
 }}
 >
 <span>{genre.icon}</span>
 <span>{genre.name}</span>
 {isSelected && <Check size={14} strokeWidth={3} />}
 </div>
 );
 })}
 </div>
 </div>

 {/* Step 5: Curated Artists */}
 <div style={{ 
 background: 'rgba(255, 255, 255, 0.03)', 
 backdropFilter: 'blur(12px)', 
 border: '1px solid rgba(255, 255, 255, 0.08)', 
 borderRadius: '24px', 
 padding: '28px',
 marginBottom: '40px',
 boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
 }}>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
 <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px', borderRadius: '12px' }}>
 <User size={22} color="#fff" />
 </div>
 <div>
 <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Who's on your playlist?</h3>
 <p style={{ fontSize: '13px', opacity: 0.5, margin: '3px 0 0 0' }}>Singers & bands across your learning languages</p>
 </div>
 </div>

 {/* Language filter pills */}
 <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
 {['All', 'Spanish', 'Hindi', 'Korean', 'English'].map(tab => (
 <button
 key={tab}
 onClick={() => setArtistFilter(tab)}
 style={{
 padding: '4px 10px',
 borderRadius: '8px',
 border: 'none',
 background: artistFilter === tab ? '#fff' : 'transparent',
 color: artistFilter === tab ? '#000' : '#fff',
 fontWeight: 'bold',
 fontSize: '11px',
 cursor: 'pointer',
 transition: 'all 0.2s'
 }}
 >
 {tab === 'Spanish' ? ' Spanish' : tab === 'Hindi' ? ' Hindi' : tab === 'Korean' ? ' Korean' : tab === 'English' ? ' English' : 'All'}
 </button>
 ))}
 </div>
 </div>

 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
 {filteredArtists.map(artist => {
 const isSelected = selectedArtists.includes(artist.name);
 return (
 <button 
 key={artist.name}
 onClick={() => toggleArtist(artist.name)}
 style={{
 padding: '12px 16px',
 borderRadius: '14px',
 background: isSelected ? 'rgba(32, 190, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
 border: isSelected ? '1.5px solid #20BEFF' : '1px solid rgba(255,255,255,0.08)',
 color: '#fff',
 fontSize: '13px',
 fontWeight: isSelected ? '700' : '500',
 cursor: 'pointer',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 gap: '8px',
 transition: 'all 0.2s',
 transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
 textAlign: 'left'
 }}
 >
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
 <span style={{ fontSize: '14px' }}>{artist.flag}</span>
 <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{artist.name}</span>
 </div>
 <div style={{ 
 width: '16px', 
 height: '16px', 
 borderRadius: '50%', 
 background: isSelected ? '#20BEFF' : 'rgba(255,255,255,0.1)', 
 display: 'flex', 
 alignItems: 'center', 
 justifyContent: 'center',
 flexShrink: 0
 }}>
 {isSelected && <Check size={10} color="#000" strokeWidth={3} />}
 </div>
 </button>
 );
 })}
 </div>
 </div>

 {/* Action Button */}
 <div style={{ position: 'sticky', bottom: '24px', zIndex: 10 }}>
 <button 
 className="btn-hover" 
 onClick={handleSavePreferences}
 disabled={isSaving}
 style={{ 
 background: 'linear-gradient(135deg, #ffffff 0%, #20BEFF 100%)', 
 color: '#000', 
 fontSize: '17px', 
 fontWeight: '800', 
 padding: '18px 28px',
 borderRadius: '20px',
 border: 'none',
 boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(32, 190, 255, 0.3)',
 width: '100%',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 gap: '10px',
 cursor: isSaving ? 'not-allowed' : 'pointer',
 transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
 opacity: isSaving ? 0.7 : 1,
 transform: isSaving ? 'scale(0.98)' : 'scale(1)'
 }}
 >
 {isSaving ? 'Synchronizing Your Journey...' : (
 <>
 Let's tune in! <ChevronRight size={20} />
 </>
 )}
 </button>
 </div>
 </div>
 </div>
 );
};

export default PreferencesPage;
