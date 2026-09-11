import { API_BASE } from '../config';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Music, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
          setError(data.message || 'Google signup failed');
        }
      } catch (err) {
        console.error(err);
        setError('Network error during Google sign up');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google sign up was cancelled or failed')
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
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
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Subtle Background Glow */}
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '520px', height: '320px', background: 'radial-gradient(circle, rgba(32, 190, 255, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="auth-card" 
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '22px' }}>
          <div style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src="/Logo-1.png" alt="Lingofy Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#fff' }}>Start Your Journey</h1>
            <div className="equalizer-container" style={{ height: '14px' }}>
              <span className="equalizer-bar" />
              <span className="equalizer-bar" />
              <span className="equalizer-bar" />
              <span className="equalizer-bar" />
            </div>
          </div>
          <p style={{ fontSize: '13px', opacity: 0.6, margin: '4px 0 0 0' }}>Master languages through songs you love</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{ width: '100%', marginBottom: '16px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Google Sign Up */}
        <div style={{ width: '100%', marginBottom: '16px' }}>
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
              borderColor: 'rgba(255, 255, 255, 0.12)',
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
            <span>Sign up with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>or with email</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <form style={{ width: '100%' }} onSubmit={handleSignup}>
          {/* Email Input */}
          <div className="input-group">
            <label style={{ fontSize: '13px', fontWeight: '600' }}>Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: '12px', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} />
              </div>
              <input 
                type="email" 
                className="input-field" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px', height: '44px', borderRadius: '12px' }}
                required
              />
            </div>
          </div>
          
          {/* Password Input */}
          <div className="input-group">
            <label style={{ fontSize: '13px', fontWeight: '600' }}>Create Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: '12px', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-field" 
                placeholder="At least 6 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px', paddingRight: '38px', height: '44px', borderRadius: '12px' }}
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

          {/* Confirm Password Input */}
          <div className="input-group" style={{ marginBottom: '22px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600' }}>Confirm Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: '12px', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} />
              </div>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                className="input-field" 
                placeholder="Re-enter your password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingLeft: '38px', paddingRight: '38px', height: '44px', borderRadius: '12px' }}
                required
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
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
            <Sparkles size={16} />
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
          Already have an account?{' '}
          <span 
            onClick={() => navigate('/login')} 
            style={{ color: '#20BEFF', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none' }}
          >
            Log In
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;

