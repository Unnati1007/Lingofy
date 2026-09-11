import { API_BASE } from '../config';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
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
      }
    },
    onError: () => console.error('Google Login Failed')
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <motion.div 
      className="auth-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="logo-container" 
        style={{ position: 'absolute', top: '20px' }}
      >
        <img src="/Logo-1.png" alt="Lingofy Logo" style={{ width: '40px', height: '40px' }} />
        <div className="logo-text" style={{ fontSize: '20px' }}>Lingofy</div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        className="auth-card" 
        style={{ marginTop: '20px' }}
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <button type="button" onClick={() => loginWithGoogle()} className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            <span>Login with Google</span>
          </button>
        </div>

        <div style={{ width: '100%', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px' }}></div>

        <form style={{ width: '100%' }} onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email or Username</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Email or Username" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '12px' }}>
            <input type="checkbox" id="remember" style={{ accentColor: '#20BEFF' }} />
            <label htmlFor="remember" style={{ color: '#ccc' }}>Remember Me</label>
          </div>

          <button type="submit" className="btn btn-primary">
            Log In
          </button>
        </form>

        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowForgotModal(true); setForgotStep(1); setForgotError(''); setForgotMessage(''); }} style={{ fontSize: '13px', color: '#ccc', textDecoration: 'underline' }}>Forgot your Password?</a>
          <div style={{ fontSize: '13px', color: '#ccc' }}>
            Don't have an account? <span onClick={() => navigate('/signup')} style={{ color: '#20BEFF', cursor: 'pointer', fontWeight: 'bold' }}>Register</span>
          </div>
        </div>
      </motion.div>

      {showForgotModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1a1a1a', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #333' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 'bold' }}>Reset Password</h2>
            
            {forgotError && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{forgotError}</div>}
            {forgotMessage && <div style={{ color: '#20BEFF', marginBottom: '16px', fontSize: '14px' }}>{forgotMessage}</div>}
            
            {forgotStep === 1 && (
              <form onSubmit={handleForgotEmail}>
                <div className="input-group">
                  <label>Enter your email address</label>
                  <input type="email" className="input-field" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowForgotModal(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Send Code</button>
                </div>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyCode}>
                <div className="input-group">
                  <label>Enter the 6-digit code</label>
                  <input type="text" className="input-field" value={forgotCode} onChange={e => setForgotCode(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setForgotStep(1)} style={{ flex: 1 }}>Back</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Verify</button>
                </div>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword}>
                <div className="input-group">
                  <label>Enter new password</label>
                  <input type="password" className="input-field" value={forgotNewPassword} onChange={e => setForgotNewPassword(e.target.value)} required minLength={6} />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Reset Password</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LoginPage;
