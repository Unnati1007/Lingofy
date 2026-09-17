import { API_BASE } from '../config';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Music, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const navigate = useNavigate();

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: tokenResponse.access_token })
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role);
          if (data.role === 'admin') navigate('/admin');
          else if (data.hasPreferences) navigate('/dashboard');
          else navigate('/preferences');
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    onError: () => console.error('Google Login Failed')
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        if (data.role === 'admin') {
          navigate('/admin');
        } else {
          if (data.hasPreferences) {
            navigate('/dashboard');
          } else {
            navigate('/preferences');
          }
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(''); setForgotMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMessage(data.message);
        setForgotStep(2);
      } else {
        setForgotError(data.message);
      }
    } catch (err) { setForgotError('An error occurred'); }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(''); setForgotMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-code`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: forgotCode })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMessage(data.message);
        setForgotStep(3);
      } else {
        setForgotError(data.message);
      }
    } catch (err) { setForgotError('An error occurred'); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(''); setForgotMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: forgotCode, newPassword: forgotNewPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Password reset successfully! Please log in with your new password.');
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotEmail('');
        setForgotCode('');
        setForgotNewPassword('');
      } else {
        setForgotError(data.message);
      }
    } catch (err) { setForgotError('An error occurred'); }
  };

  return (
    <div className="auth-container">
      <div className="auth-split-wrapper">
        {/* Left: Brand Hero Section */}
        <motion.div 
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="auth-hero-section"
        >
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', width: 'fit-content' }} 
            onClick={() => navigate('/')}
          >
            <img src="/Logo-1.png" alt="Lingofy Logo" style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
            <span style={{ fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #ffffff 0%, #20BEFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>Lingofy</span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <h1 style={{ fontSize: '38px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.15 }}>
                Welcome Back
              </h1>
              <div className="equalizer-container" style={{ height: '22px' }}>
                <span className="equalizer-bar" />
                <span className="equalizer-bar" />
                <span className="equalizer-bar" />
                <span className="equalizer-bar" />
              </div>
            </div>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.6, maxWidth: '440px' }}>
              Tune in and continue your learning rhythm. Your musical language dashboard and playlists are ready.
            </p>
          </div>

          <div className="auth-hero-features">
            <div className="auth-feature-card">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(32, 190, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#20BEFF', flexShrink: 0 }}>
                <Music size={20} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Continue Your Songs</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Pick up right where you left off in your song lessons</div>
              </div>
            </div>

            <div className="auth-feature-card">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(32, 190, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#20BEFF', flexShrink: 0 }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Streaks & Mastery Tiers</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Keep your daily streak alive and unlock new levels</div>
              </div>
            </div>

            <div className="auth-feature-card">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(32, 190, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#20BEFF', flexShrink: 0 }}>
                <ArrowRight size={20} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Mindful Listening & Quizzes</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Practice ambient audio sessions and smart vocabulary review</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Auth Card */}
        <motion.div 
          initial={{ opacity: 0, x: 25, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="auth-card" 
        >
          <div style={{ width: '100%', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>Sign In</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 0' }}>Access your Lingofy learning dashboard</p>
          </div>

          {/* Google Sign In */}
          <div style={{ width: '100%', marginBottom: '18px' }}>
            <button 
              type="button" 
              onClick={() => loginWithGoogle()} 
              className="btn btn-outline" 
              style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '12px', 
                padding: '12px', 
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>or with email</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <form style={{ width: '100%' }} onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="input-group">
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Email or Username</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: '12px', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} />
                </div>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="name@example.com" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  style={{ paddingLeft: '38px', height: '44px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}
                  required
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: '12px', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="input-field" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '38px', paddingRight: '38px', height: '44px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', fontSize: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                <input type="checkbox" id="remember" style={{ accentColor: '#20BEFF', width: '14px', height: '14px' }} />
                Remember Me
              </label>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setShowForgotModal(true); setForgotStep(1); setForgotError(''); setForgotMessage(''); }} 
                style={{ color: '#20BEFF', textDecoration: 'none', fontWeight: '500' }}
              >
                Forgot Password?
              </a>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
              style={{ 
                height: '46px', 
                borderRadius: '12px', 
                fontSize: '15px', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: loading ? 0.7 : 1
              }}
            >
              <span>{loading ? 'Logging In...' : 'Log In'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
            Don't have an account?{' '}
            <span 
              onClick={() => navigate('/signup')} 
              style={{ color: '#20BEFF', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none' }}
            >
              Sign Up Free
            </span>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #161824 0%, #0c0d14 100%)', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '420px', border: '1px solid rgba(32, 190, 255, 0.25)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ background: 'rgba(32, 190, 255, 0.1)', padding: '8px', borderRadius: '10px', color: '#20BEFF' }}>
                <KeyRound size={20} />
              </div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Reset Password</h2>
            </div>
            <p style={{ opacity: 0.6, fontSize: '13px', marginBottom: '20px' }}>We'll help you securely recover access to your account.</p>
            
            {forgotError && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '13px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>{forgotError}</div>}
            {forgotMessage && <div style={{ color: '#20BEFF', marginBottom: '16px', fontSize: '13px', background: 'rgba(32, 190, 255, 0.1)', padding: '10px', borderRadius: '8px' }}>{forgotMessage}</div>}
            
            {forgotStep === 1 && (
              <form onSubmit={handleForgotEmail}>
                <div className="input-group">
                  <label style={{ fontSize: '13px' }}>Your Registered Email</label>
                  <input type="email" className="input-field" placeholder="name@example.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required style={{ height: '42px', borderRadius: '10px' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowForgotModal(false)} style={{ flex: 1, borderRadius: '10px' }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, borderRadius: '10px' }}>Send Code</button>
                </div>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyCode}>
                <div className="input-group">
                  <label style={{ fontSize: '13px' }}>Enter the 6-digit verification code</label>
                  <input type="text" className="input-field" placeholder="123456" value={forgotCode} onChange={e => setForgotCode(e.target.value)} required style={{ height: '42px', borderRadius: '10px', textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setForgotStep(1)} style={{ flex: 1, borderRadius: '10px' }}>Back</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, borderRadius: '10px' }}>Verify Code</button>
                </div>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword}>
                <div className="input-group">
                  <label style={{ fontSize: '13px' }}>Enter New Password</label>
                  <input type="password" className="input-field" placeholder="••••••••" value={forgotNewPassword} onChange={e => setForgotNewPassword(e.target.value)} required minLength={6} style={{ height: '42px', borderRadius: '10px' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: '10px' }}>Save New Password</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
