import { useState } from 'react';

const genres = ['Pop', 'Latin', 'Folk', 'Rock', 'Bollywood', 'Lo-fi', 'Jazz', 'EDM', 'Classical', 'Rap', 'Indie', 'K-Pop', 'Soul'];
const artists = ['Badshah', 'Lady Gaga', 'RADWIMPS', 'Drake', 'Shakira', 'Shreya Ghoshal', 'Arijit Singh', 'Neha Kakkar', 'ColdPlay', 'Prateek Kuhad', 'Dua Lipa', 'BTS', 'EXO', 'BlackPink', 'Shawn Mendes'];

const PreferencesPage = () => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const toggleArtist = (artist: string) => {
    setSelectedArtists(prev => 
      prev.includes(artist) ? prev.filter(a => a !== artist) : [...prev, artist]
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: '#0f0f13', padding: '40px 5%', width: '100%' }}>
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        <div className="logo-container" style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: '50px' }}>
          <img src="/Logo-1.png" alt="Lingofy Logo" style={{ width: '56px', height: '56px' }} />
          <div className="logo-text" style={{ fontSize: '28px' }}>Lingofy</div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Choose language(s) to learn</h3>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Type the languages(s) you want to learn" 
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '20px' }}>Pick genres: Pop, Rock, K-pop, etc.</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px', width: '100%' }}>
            {genres.map(genre => (
              <label key={genre} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedGenres.includes(genre)}
                  onChange={() => toggleGenre(genre)}
                  style={{ 
                    appearance: 'none', 
                    width: '20px', 
                    height: '20px', 
                    border: '1px solid rgba(255,255,255,0.4)', 
                    borderRadius: '4px',
                    background: selectedGenres.includes(genre) ? '#12793d' : 'transparent',
                    cursor: 'pointer'
                  }} 
                />
                {genre}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '50px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '20px' }}>Choose your favorite artist(s):</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
            {artists.map(artist => (
              <button 
                key={artist}
                onClick={() => toggleArtist(artist)}
                style={{
                  background: selectedArtists.includes(artist) ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {artist}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            className="btn" 
            style={{ 
              background: 'white', 
              color: 'black', 
              fontSize: '18px', 
              fontWeight: 'bold', 
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 0 0 2px #8a2be2',
              marginTop: '10px',
              width: '100%'
            }}
          >
            Let's tune in!
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;
