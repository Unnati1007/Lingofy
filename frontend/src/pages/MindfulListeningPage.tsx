import React, { useState, useEffect, useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Headphones, ArrowLeft, BookOpen } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { SongPracticeModal } from '../components/SongPracticeModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface IMindfulPhrase {
  _id: string;
  text: string;
  translation: string;
  startTime: number;
  endTime: number;
}

interface ITrack {
  _id: string;
  language: string;
  title: string;
  theme: string;
  audioUrl: string;
  ambientType: string;
  durationSeconds: number;
  phrases: IMindfulPhrase[];
}

export function MindfulListeningPage() {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<ITrack[]>([]);
  const [activeTrack, setActiveTrack] = useState<ITrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [scrubTime, setScrubTime] = useState<number | null>(null);

  const [language, setLanguage] = useState<string>('');

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const token = localStorage.getItem('token');
        const url = language 
          ? `${API_BASE}/api/mindful-listening?language=${language}`
          : `${API_BASE}/api/mindful-listening`;

        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTracks(data);
          if (data.length > 0) {
            setActiveTrack(data[0]);
            if (!language) setLanguage(data[0].language);
          } else {
            setActiveTrack(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch mindful tracks', err);
      }
    };
    fetchTracks();
  }, [language]);

  // Handle audio time updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      // Only sync standard playback time if we are not actively scrubbing
      setCurrentTime(audio.currentTime);
    };
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', onEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, [activeTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTrackChange = (track: ITrack) => {
    if (activeTrack?._id === track._id) return;
    setActiveTrack(track);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeTrack) return;
    setScrubTime(Number(e.target.value));
  };

  const handleScrubEnd = () => {
    if (audioRef.current && scrubTime !== null) {
      if (audioRef.current.readyState >= 1) { // HAVE_METADATA or higher
        audioRef.current.currentTime = scrubTime;
        setCurrentTime(scrubTime);
      } else {
        console.warn('Audio not ready to seek yet.');
      }
    }
    setScrubTime(null);
  };

  // Find active phrase
  const activePhrase = activeTrack?.phrases.find(p => currentTime >= p.startTime && currentTime <= p.endTime);

  // Soft TTS Reading for the active phrase
  useEffect(() => {
    if (activePhrase && isPlaying) {
      window.speechSynthesis.cancel(); // Clear any ongoing speech
      const utterance = new SpeechSynthesisUtterance(activePhrase.text);
      
      let langCode = 'en-US';
      if (activeTrack?.language === 'hindi') langCode = 'hi-IN';
      else if (activeTrack?.language === 'spanish') langCode = 'es-ES';
      else if (activeTrack?.language === 'korean') langCode = 'ko-KR';
      
      utterance.lang = langCode;
      
      // Try to find a sweeter/softer voice (often female default OS voices)
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]) && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google')));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.volume = 0.35; // Even softer volume
      utterance.rate = 0.8;    // Very slow, gentle pace
      utterance.pitch = 1.1;   // Slightly higher pitch for a sweeter tone
      
      window.speechSynthesis.speak(utterance);
    } else if (!isPlaying) {
      window.speechSynthesis.cancel();
    }
  }, [activePhrase?._id, isPlaying, activeTrack?.language]);

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.2 } }
  };

  const [showPracticeModal, setShowPracticeModal] = useState(false);

  return (
    <div style={{ padding: '24px 40px', height: '100vh', boxSizing: 'border-box', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#000000', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header with Back Button and Practice Song */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', maxWidth: '1200px', width: '100%', margin: '0 auto 16px auto' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            color: '#fff', 
            borderRadius: '12px', 
            padding: '10px 16px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {activeTrack && (
          <button
            onClick={() => setShowPracticeModal(true)}
            style={{
              background: 'rgba(32, 190, 255, 0.15)',
              border: '1px solid rgba(32, 190, 255, 0.3)',
              color: '#20BEFF',
              borderRadius: '12px',
              padding: '10px 18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '700',
              transition: 'all 0.2s',
              boxShadow: '0 0 15px rgba(32, 190, 255, 0.15)'
            }}
          >
            <BookOpen size={18} />
            Practice Song Quiz
          </button>
        )}
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px', flexShrink: 0 }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '56px', 
              height: '56px', 
              borderRadius: '50%', 
              background: 'rgba(32, 190, 255, 0.1)', 
              color: '#20BEFF',
              marginBottom: '16px' 
            }}
          >
            <Headphones size={28} />
          </motion.div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '1px', color: '#fff', marginBottom: '12px' }}>
            Mindful Listening
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.5', marginBottom: '20px' }}>
            Immerse yourself in gentle language practice. No scoring, no pressure. Just relax, listen, and let the language flow naturally.
          </p>

          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: '8px',
              outline: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <option value="hindi" style={{ color: '#000' }}>Hindi</option>
            <option value="spanish" style={{ color: '#000' }}>Spanish</option>
            <option value="korean" style={{ color: '#000' }}>Korean</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '32px', flex: 1, overflow: 'hidden' }}>
          
          {/* Tracks Sidebar */}
          <motion.div variants={containerVariants} className="custom-scrollbar" style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '12px' }}>
            <h2 style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontWeight: 'bold' }}>Available Tracks</h2>
            {tracks.map(track => (
              <div 
                key={track._id}
                onClick={() => handleTrackChange(track)}
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: activeTrack?._id === track._id ? 'rgba(32, 190, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                  border: activeTrack?._id === track._id ? '1px solid rgba(32, 190, 255, 0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                <div style={{ fontSize: '15px', fontWeight: activeTrack?._id === track._id ? 'bold' : 'normal', color: '#fff', marginBottom: '4px' }}>{track.title}</div>
                <div style={{ fontSize: '12px', color: activeTrack?._id === track._id ? '#20BEFF' : 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>{track.theme}</div>
              </div>
            ))}
          </motion.div>

          {/* Player Main Area */}
          <motion.div variants={containerVariants} style={{ flex: '2', minWidth: '400px', display: 'flex', flexDirection: 'column' }}>
            <Card style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent style={{ padding: '32px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                
                {activeTrack ? (
                  <>
                    <audio 
                      ref={audioRef} 
                      src={activeTrack.audioUrl} 
                      preload="metadata"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />

                    {/* Transcript Area */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', marginBottom: '40px' }}>
                      <motion.div 
                        key={activePhrase?._id || 'empty'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.8 }}
                        style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                      >
                        <div style={{ fontSize: '28px', color: '#fff', fontWeight: '300', marginBottom: '16px', lineHeight: '1.4' }}>
                          {activePhrase?.text || '...'}
                        </div>
                        <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                          {activePhrase?.translation || ''}
                        </div>
                      </motion.div>
                    </div>

                    {/* Player Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      
                      {/* Scrubber */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', width: '40px' }}>
                          {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
                        </span>
                        <input 
                          type="range" 
                          min="0" 
                          max={activeTrack.durationSeconds || 100} 
                          step="0.1"
                          value={scrubTime !== null ? scrubTime : currentTime} 
                          onChange={handleScrub}
                          onMouseUp={handleScrubEnd}
                          onTouchEnd={handleScrubEnd}
                          style={{
                            flex: 1,
                            accentColor: '#20BEFF',
                            height: '4px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        />
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', width: '40px' }}>
                          {Math.floor(activeTrack.durationSeconds / 60)}:{(Math.floor(activeTrack.durationSeconds % 60)).toString().padStart(2, '0')}
                        </span>
                      </div>

                      {/* Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: 0.6 }}>
                          {isMuted ? (
                            <VolumeX size={20} cursor="pointer" onClick={() => setIsMuted(false)} />
                          ) : (
                            <Volume2 size={20} cursor="pointer" onClick={() => setIsMuted(true)} />
                          )}
                          <input 
                            type="range" 
                            min="0" max="1" step="0.05" 
                            value={volume} 
                            onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                            style={{ width: '80px', accentColor: '#20BEFF', height: '4px' }}
                          />
                        </div>

                        <button 
                          onClick={togglePlay}
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: '#20BEFF',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#000',
                            transition: 'transform 0.2s',
                            boxShadow: '0 0 20px rgba(32, 190, 255, 0.4)'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          {isPlaying ? <Pause size={24} fill="#000" /> : <Play size={24} fill="#000" style={{ marginLeft: '4px' }} />}
                        </button>
                        
                        <div style={{ width: '116px' }}></div> {/* Spacer for symmetry */}
                      </div>

                    </div>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                    Select a track to begin your mindful practice.
                  </div>
                )}

              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Song Practice Modal */}
      {activeTrack && (
        <SongPracticeModal
          isOpen={showPracticeModal}
          onClose={() => setShowPracticeModal(false)}
          song={{
            _id: activeTrack._id,
            title: activeTrack.title,
            artistName: activeTrack.theme || 'Mindful Listening Track',
            language: activeTrack.language
          }}
          defaultLanguage={activeTrack.language}
        />
      )}
    </div>
  );
}
