import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="auth-container">
      <div className="auth-card" style={{ background: 'rgba(20, 20, 28, 0.5)', padding: '50px 32px' }}>
        <div className="logo-container">
          <img src="/Logo-1.png" alt="Lingofy Logo" />
          <div className="logo-text">Lingofy</div>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '30px' }}>
          <Link to="/signup" className="btn btn-outline" style={{ display: 'block', textAlign: 'center', borderColor: '#12793d', color: '#fff', textDecoration: 'none' }}>
            <span style={{ fontWeight: 'bold' }}>Sign up for free</span>
          </Link>
          <Link to="/login" className="btn btn-outline" style={{ display: 'block', textAlign: 'center', color: '#12793d', textDecoration: 'none' }}>
            <span style={{ fontWeight: 'bold' }}>Log In</span>
          </Link>
        </div>

        <div style={{ marginTop: '24px' }}>
          <button style={{ background: 'none', border: 'none', color: '#fff', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px', letterSpacing: '1px' }}>
            SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
