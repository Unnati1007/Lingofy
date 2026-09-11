import { API_BASE } from '../config';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Check, Languages, User, ChevronRight } from 'lucide-react';

const genres = ['Pop', 'Latin', 'Folk', 'Rock', 'Bollywood', 'Lo-fi', 'Jazz', 'EDM', 'Classical', 'Rap', 'Indie', 'K-Pop', 'Soul'];
const artists = ['Badshah', 'Lady Gaga', 'RADWIMPS', 'Drake', 'Shakira', 'Shreya Ghoshal', 'Arijit Singh', 'Neha Kakkar', 'ColdPlay', 'Prateek Kuhad', 'Dua Lipa', 'BTS', 'EXO', 'BlackPink', 'Shawn Mendes'];
const availableLanguages = ['Spanish', 'French', 'Korean', 'Japanese', 'Hindi', 'German', 'Italian', 'Mandarin', 'Portuguese', 'Russian', 'Arabic', 'Turkish', 'Dutch', 'Swedish', 'Polish', 'English'];

const PreferencesPage = () => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedKnownLanguages, setSelectedKnownLanguages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const toggleSelection = (item: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const toggleGenre = (genre: string) => toggleSelection(genre, setSelectedGenres);
  const toggleArtist = (artist: string) => toggleSelection(artist, setSelectedArtists);
  const toggleLanguage = (lang: string) => toggleSelection(lang, setSelectedLanguages);
  const toggleKnownLanguage = (lang: string) => toggleSelection(lang, setSelectedKnownLanguages);


  const handleSavePreferences = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      // Update Preferences
      const prefsRes = await fetch(`${API_BASE}/api/preferences`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          languagesToLearn: selectedLanguages,
          favoriteGenres: selectedGenres,
          favoriteArtists: selectedArtists,
          vocabularyLevel: 'beginner',
          sessionGoalMinutes: 15
        })
      });

      // Update User Profile (Known Languages)
      const profileRes = await fetch(`${API_BASE}/api/users/me/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          knownLanguages: selectedKnownLanguages
        })
      });

      const prefsData = await prefsRes.json();
      if (prefsRes.ok && profileRes.ok) {
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
      background: 'radial-gradient(circle at 50% 0%, #1a1a2e 0%, #0f0f13 100%)', 
      padding: '60px 5%', 
      width: '100%',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Background Orbs for Premium Feel */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(138, 43, 226, 0.1)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }}></div>
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'rgba(32, 190, 255, 0.1)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }}></div>

      <div style={{ width: '100%', maxWidth: '900px', position: 'relative', zIndex: 1 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="logo-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '15px' }}>
            <img src="/Logo-1.png" alt="Lingofy Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
            <div className="logo-text" style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', background: 'linear-gradient(135deg, #fff 0%, #20BEFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Lingofy</div>
          </div>
          <p style={{ opacity: 0.6, fontSize: '18px' }}>Personalize your musical language journey</p>
        </div>

        {/* Section 1: Languages */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          backdropFilter: 'blur(10px)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '24px', 
          padding: '32px',
          marginBottom: '32px',
          transition: 'transform 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(138, 43, 226, 0.2)', padding: '10px', borderRadius: '12px' }}>
              <Languages size={20} color="#a855f7" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Which languages are we learning today?</h3>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '32px' }}>
            {availableLanguages.map(lang => {
              const isSelected = selectedLanguages.includes(lang);
              return (
                <div 
                  key={`learn-${lang}`}
                  onClick={() => toggleLanguage(lang)}
                  style={{
                    padding: '10px 20px', borderRadius: '100px',
                    background: isSelected ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid', borderColor: isSelected ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isSelected ? '0 10px 15px -3px rgba(59, 130, 246, 0.3)' : 'none'
                  }}
                >
                  {isSelected && <Check size={14} strokeWidth={3} />}
                  <span style={{ fontSize: '14px', fontWeight: isSelected ? '600' : '400' }}>{lang}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '500', opacity: 0.9 }}>And what languages do you already know?</h3>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {availableLanguages.map(lang => {
              const isSelected = selectedKnownLanguages.includes(lang);
              return (
                <div 
                  key={`know-${lang}`}
                  onClick={() => toggleKnownLanguage(lang)}
                  style={{
                    padding: '8px 16px', borderRadius: '100px',
                    background: isSelected ? 'rgba(255,255,255,0.15)' : 'transparent',
                    border: '1px solid', borderColor: isSelected ? '#fff' : 'rgba(255,255,255,0.1)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.2s', opacity: isSelected ? 1 : 0.6
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: isSelected ? '600' : '400' }}>{lang}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Genres */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          backdropFilter: 'blur(10px)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '24px', 
          padding: '32px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(32, 190, 255, 0.2)', padding: '10px', borderRadius: '12px' }}>
              <Music size={20} color="#20BEFF" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Pick your favorite vibes</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {genres.map(genre => {
              const isSelected = selectedGenres.includes(genre);
              return (
                <div 
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '100px',
                    background: isSelected ? 'linear-gradient(135deg, #8a2be2 0%, #4c1d95 100%)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid',
                    borderColor: isSelected ? '#8a2be2' : 'rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isSelected ? '0 10px 15px -3px rgba(138, 43, 226, 0.3)' : 'none'
                  }}
                >
                  {isSelected && <Check size={14} strokeWidth={3} />}
                  <span style={{ fontSize: '14px', fontWeight: isSelected ? '600' : '400' }}>{genre}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Artists */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          backdropFilter: 'blur(10px)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '24px', 
          padding: '32px',
          marginBottom: '50px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px', borderRadius: '12px' }}>
              <User size={20} color="#fff" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Who's on your playlist?</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {artists.map(artist => {
              const isSelected = selectedArtists.includes(artist);
              return (
                <button 
                  key={artist}
                  onClick={() => toggleArtist(artist)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '16px',
                    background: isSelected ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    border: isSelected ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: isSelected ? '700' : '400',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s',
                    transform: isSelected ? 'translateY(-2px)' : 'translateY(0)'
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isSelected ? '#20BEFF' : 'rgba(255,255,255,0.3)', transition: 'all 0.2s' }}></div>
                  {artist}
                </button>
              );
            })}
          </div>
        </div>

        {/* Final Button */}
        <div style={{ position: 'sticky', bottom: '30px' }}>
          <button 
            className="btn" 
            onClick={handleSavePreferences}
            disabled={isSaving}
            style={{ 
              background: '#fff', 
              color: '#000', 
              fontSize: '18px', 
              fontWeight: '800', 
              padding: '20px',
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.2)',
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
            {isSaving ? 'Synchronizing...' : (
              <>
                Let's tune in! <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .input-field:focus {
          border-color: #8a2be2 !important;
          box-shadow: 0 0 15px rgba(138, 43, 226, 0.2);
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
};

export default PreferencesPage;
