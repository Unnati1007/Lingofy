import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Activity, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PronunciationSettingsModalProps {
  onClose: () => void;
  onSave: (settings: any) => void;
}

const TooltipIcon = ({ text }: { text: string }) => {
  const [show, setShow] = useState(false);
  return (
    <div
      style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <motion.div whileHover={{ scale: 1.1, opacity: 1 }} style={{ opacity: 0.6, cursor: 'help' }}>
        <HelpCircle size={16} color="#eab308" />
      </motion.div>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '10px',
              background: '#18181b',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.8), 0 0 12px rgba(234, 179, 8, 0.1)',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              width: '240px',
              textAlign: 'center',
              pointerEvents: 'none',
              zIndex: 10,
              lineHeight: '1.5',
              fontWeight: 'normal'
            }}
          >
            {text}
            <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', border: '6px solid transparent', borderTopColor: 'rgba(234, 179, 8, 0.3)' }}>
              <div style={{ position: 'absolute', top: '-7px', left: '-5px', border: '5px solid transparent', borderTopColor: '#18181b' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PronunciationSettingsModal: React.FC<PronunciationSettingsModalProps> = ({ onClose, onSave }) => {
  const [sensitivity, setSensitivity] = useState('Medium (Standard)');
  const [micBoost, setMicBoost] = useState('On');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const gainNode = ctx.createGain();
        gainNode.gain.value = micBoost === 'On' ? 2.5 : 1.0;
        gainNodeRef.current = gainNode;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        source.connect(gainNode);
        gainNode.connect(analyser);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          if (!canvasCtx || !canvas) return;
          animationRef.current = requestAnimationFrame(draw);

          analyser.getByteTimeDomainData(dataArray);

          // Idle animation when quiet
          let maxAmp = 0;
          for (let i = 0; i < bufferLength; i++) {
            maxAmp = Math.max(maxAmp, Math.abs(128 - dataArray[i]));
          }
          if (maxAmp < 2) {
            const time = Date.now() / 300;
            for (let i = 0; i < bufferLength; i++) {
              dataArray[i] = 128 + Math.sin(time + (i / bufferLength) * Math.PI * 4) * 4;
            }
          }

          canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

          canvasCtx.lineWidth = 3;
          canvasCtx.strokeStyle = '#eab308';
          canvasCtx.beginPath();

          const sliceWidth = canvas.width * 1.0 / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * (canvas.height / 2);

            if (i === 0) canvasCtx.moveTo(x, y);
            else canvasCtx.lineTo(x, y);

            x += sliceWidth;
          }

          canvasCtx.lineTo(canvas.width, canvas.height / 2);
          canvasCtx.stroke();
        };

        draw();
      } catch (err) {
        console.error('Microphone access denied or error', err);
      }
    };

    startAudio();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = micBoost === 'On' ? 2.5 : 1.0;
    }
  }, [micBoost]);

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
        background: 'linear-gradient(145deg, #18181b 0%, #09090b 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px', padding: '28px', maxWidth: '500px', width: '100%',
        position: 'relative', overflowY: 'auto', maxHeight: '90vh', color: '#fff',
        boxShadow: '0 24px 50px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05) inset'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <motion.button
            onClick={onClose}
            whileHover={{ opacity: 1, x: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', cursor: 'pointer', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', opacity: 0.8 }}
          >
            <X size={14} strokeWidth={3} /> Close
          </motion.button>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', lineHeight: '1.2' }}>
          Pronunciation Mode<br />Customization
        </h2>

        {/* Sensitivity Level */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Sensitivity Level
            <TooltipIcon text="Controls how strictly your pronunciation is graded. 'Low' is forgiving, while 'High' requires near-native accuracy to pass." />
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Low (Beginner)', 'Medium (Standard)', 'High (Near-native accuracy)'].map(level => (
              <motion.label
                key={level}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                  padding: '14px 16px', borderRadius: '12px',
                  background: sensitivity === level ? 'rgba(234, 179, 8, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${sensitivity === level ? 'rgba(234, 179, 8, 0.3)' : 'transparent'}`,
                  transition: 'background 0.2s, border 0.2s'
                }}
              >
                <span style={{ color: sensitivity === level ? '#eab308' : '#fff', fontWeight: sensitivity === level ? '600' : '400', fontSize: '15px' }}>{level}</span>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${sensitivity === level ? '#eab308' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sensitivity === level && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }}></div>}
                </div>
                <input type="radio" checked={sensitivity === level} onChange={() => setSensitivity(level)} style={{ display: 'none' }} />
              </motion.label>
            ))}
          </div>
        </div>

        {/* Mic Boost */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Mic Boost
            <TooltipIcon text="Amplifies your microphone input volume before processing. Useful if your microphone is quiet or you are in a low-volume environment." />
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['On', 'Off'].map(val => (
              <motion.label
                key={val}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                  padding: '14px 16px', borderRadius: '12px',
                  background: micBoost === val ? 'rgba(234, 179, 8, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${micBoost === val ? 'rgba(234, 179, 8, 0.3)' : 'transparent'}`,
                  transition: 'background 0.2s, border 0.2s'
                }}
              >
                <span style={{ color: micBoost === val ? '#eab308' : '#fff', fontWeight: micBoost === val ? '600' : '400', fontSize: '15px' }}>{val}</span>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${micBoost === val ? '#eab308' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {micBoost === val && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }}></div>}
                </div>
                <input type="radio" checked={micBoost === val} onChange={() => setMicBoost(val)} style={{ display: 'none' }} />
              </motion.label>
            ))}
          </div>
        </div>

        {/* Real-time Waveform Feedback */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Real-time Waveform Feedback
            <TooltipIcon text="Shows a live visual representation of your voice as you speak, helping you gauge your pitch and volume." />
          </h3>
          <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '16px' }}>Shows your pitch and tone visually</p>

          <div style={{ height: '64px', background: 'rgba(0,0,0,0.5)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.5)' }}>
            <canvas ref={canvasRef} width="300" height="64" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 6px rgba(234, 179, 8, 0.6))' }} />
          </div>
        </div>

        {/* Save Button */}
        <motion.button
          onClick={handleSave}
          whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(234, 179, 8, 0.4)' }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%', padding: '16px', background: 'linear-gradient(135deg, #eab308 0%, #d97706 100%)',
            border: 'none', borderRadius: '16px', color: '#000', fontSize: '16px', fontWeight: '800', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            marginTop: '10px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          Save
        </motion.button>
      </div>
    </div>
  );
};

export default PronunciationSettingsModal;
