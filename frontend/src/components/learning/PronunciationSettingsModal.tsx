import React, { useState } from 'react';
import { Mic, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PronunciationSettingsModalProps {
  onClose: () => void;
  onSave: (settings: any) => void;
}

const PronunciationSettingsModal: React.FC<PronunciationSettingsModalProps> = ({ onClose, onSave }) => {
  const [sensitivity, setSensitivity] = useState('Medium (Standard)');
  const [micBoost, setMicBoost] = useState('On');

  const handleSave = () => {
    onSave({ sensitivity, micBoost });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 9999, padding: '20px', animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '24px', padding: '32px', maxWidth: '420px', width: '100%',
        position: 'relative', overflow: 'hidden', color: '#fff'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', opacity: 0.7 }}>
            <X size={16} /> Back
          </button>
        </div>
        
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '32px', lineHeight: '1.2' }}>
          Pronunciation Mode<br/>Customization
        </h2>

        {/* Sensitivity Level */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Sensitivity Level</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Low (Beginner)', 'Medium (Standard)', 'High (Near-native accuracy)'].map(level => (
              <label key={level} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <span style={{ color: sensitivity === level ? '#eab308' : '#fff', fontWeight: sensitivity === level ? '600' : '400', fontSize: '15px' }}>{level}</span>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${sensitivity === level ? '#eab308' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sensitivity === level && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }}></div>}
                </div>
                <input type="radio" checked={sensitivity === level} onChange={() => setSensitivity(level)} style={{ display: 'none' }} />
              </label>
            ))}
          </div>
        </div>

        {/* Mic Boost */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Mic Boost</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['On', 'Off'].map(val => (
              <label key={val} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <span style={{ color: micBoost === val ? '#eab308' : '#fff', fontWeight: micBoost === val ? '600' : '400', fontSize: '15px' }}>{val}</span>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${micBoost === val ? '#eab308' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {micBoost === val && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }}></div>}
                </div>
                <input type="radio" checked={micBoost === val} onChange={() => setMicBoost(val)} style={{ display: 'none' }} />
              </label>
            ))}
          </div>
        </div>

        {/* Real-time Waveform Feedback */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Real-time Waveform Feedback</h3>
          <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '16px' }}>Shows your pitch and tone visually</p>
          
          <div style={{ height: '60px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 300 60" preserveAspectRatio="none">
              <path d="M0,30 Q30,10 60,30 T120,30 T180,30 T240,30 T300,30" fill="none" stroke="#eab308" strokeWidth="2" strokeOpacity="0.3" />
              <path d="M0,30 Q45,50 90,30 T180,30 T270,30 T300,30" fill="none" stroke="#eab308" strokeWidth="1" strokeOpacity="0.5" />
              <path d="M100,30 Q130,10 160,30 T220,30" fill="none" stroke="#eab308" strokeWidth="2" strokeOpacity="0.8">
                <animate attributeName="d" values="M100,30 Q130,10 160,30 T220,30; M100,30 Q130,50 160,30 T220,30; M100,30 Q130,10 160,30 T220,30" dur="2s" repeatCount="indefinite" />
              </path>
            </svg>
          </div>
        </div>

        {/* Save Button */}
        <button 
          onClick={handleSave}
          className="btn-hover"
          style={{
            width: '100%', padding: '16px', background: 'linear-gradient(90deg, #eab308 0%, #a1a1aa 100%)',
            border: 'none', borderRadius: '100px', color: '#000', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default PronunciationSettingsModal;
