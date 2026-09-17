import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Sparkles, ArrowRight, LogIn } from 'lucide-react';

const LandingPage = () => {
 return (
 <div className="auth-container">
 {/* Subtle Background Ambient Sound Waves */}
 <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse at center, rgba(32, 190, 255, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

 <motion.div 
 className="auth-card" 
 initial={{ opacity: 0, y: 24, scale: 0.98 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
 style={{ padding: '44px 36px', maxWidth: '440px' }}
 >
 {/* Brand Logo & Animated Equalizer */}
 <div className="logo-container" style={{ marginBottom: '20px' }}>
 <div>
 <img src="/Logo-1.png" alt="Lingofy Logo" style={{ width: '84px', height: '84px', objectFit: 'contain' }} />
 </div>
 
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
 <span className="logo-text" style={{ fontSize: '32px' }}>Lingofy</span>
 <div className="equalizer-container">
 <span className="equalizer-bar" />
 <span className="equalizer-bar" />
 <span className="equalizer-bar" />
 <span className="equalizer-bar" />
 <span className="equalizer-bar" />
 <span className="equalizer-bar" />
 </div>
 </div>
 </div>

 <p style={{ textAlign: 'center', fontSize: '15px', color: 'rgba(255,255,255,0.7)', margin: '0 0 24px 0', lineHeight: '1.5' }}>
 Learn languages naturally through the rhythm and lyrics of your favorite music.
 </p>

 {/* Feature Highlights Pills */}
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '32px' }}>
 <span style={{ fontSize: '11px', background: 'rgba(32, 190, 255, 0.1)', color: '#20BEFF', border: '1px solid rgba(32, 190, 255, 0.25)', padding: '5px 12px', borderRadius: '100px', fontWeight: '600' }}>
 Interactive Lyrics
 </span>
 <span style={{ fontSize: '11px', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.25)', padding: '5px 12px', borderRadius: '100px', fontWeight: '600' }}>
 Dynamic Quizzes
 </span>
 <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '5px 12px', borderRadius: '100px', fontWeight: '600' }}>
 Smart Notes & SRS
 </span>
 </div>

 {/* Action Buttons */}
 <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
 <Link 
 to="/signup" 
 className="btn btn-primary" 
 style={{ 
 display: 'flex', 
 alignItems: 'center', 
 justifyContent: 'center', 
 padding: '14px 20px', 
 borderRadius: '14px', 
 textDecoration: 'none', 
 fontSize: '15px', 
 fontWeight: '700',
 gap: '8px'
 }}
 >
 <Sparkles size={18} />
 <span>Sign up for free</span>
 <ArrowRight size={18} />
 </Link>

 <Link 
 to="/login" 
 className="btn btn-outline" 
 style={{ 
 display: 'flex', 
 alignItems: 'center', 
 justifyContent: 'center', 
 padding: '14px 20px', 
 borderRadius: '14px', 
 textDecoration: 'none', 
 fontSize: '15px', 
 fontWeight: '600',
 color: '#fff',
 background: 'rgba(255,255,255,0.03)',
 borderColor: 'rgba(255,255,255,0.12)',
 gap: '8px'
 }}
 >
 <LogIn size={18} color="#20BEFF" />
 <span>Log In to Lingofy</span>
 </Link>
 </div>

 <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', opacity: 0.4 }}>
 Supports Spanish • Hindi • Korean • French 
 </div>
 </motion.div>
 </div>
 );
};

export default LandingPage;
