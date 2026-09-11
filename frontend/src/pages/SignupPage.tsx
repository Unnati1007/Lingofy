import { API_BASE } from '../config';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        if (data.role === 'admin') {
          navigate('/admin');
        } else if (data.hasPreferences) {
          navigate('/dashboard');
        } else {
          navigate('/preferences');
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
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
        <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>Sign Up</h2>

        <button type="button" onClick={() => loginWithGoogle()} className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center', gap: '10px', width: '100%', marginBottom: '20px' }}>
          <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          <span>Sign up with Google</span>
        </button>

        <div style={{ width: '100%', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px', position: 'relative', textAlign: 'center' }}>
          <span style={{ position: 'absolute', top: '-10px', background: '#09090b', padding: '0 10px', fontSize: '12px', color: '#ccc', left: '50%', transform: 'translateX(-50%)' }}>or</span>
        </div>

        <form style={{ width: '100%' }} onSubmit={handleSignup}>
          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="Enter your Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Enter your Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: '32px' }}>
            <label>Re-enter your Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Re-enter your Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Sign Up
          </button>
        </form>

        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', color: '#ccc' }}>
            Already have an account? <span onClick={() => navigate('/login')} style={{ color: '#20BEFF', cursor: 'pointer', fontWeight: 'bold' }}>Log In</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SignupPage;
