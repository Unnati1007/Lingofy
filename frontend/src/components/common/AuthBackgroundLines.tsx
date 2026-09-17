import React from 'react';
import { motion } from 'framer-motion';

export const AuthBackgroundLines: React.FC = () => {
  return (
    <div 
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* 1. Subtle Animated Ambient Glows */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.5, 0.35],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '15%',
          left: '15%',
          width: '500px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(32, 190, 255, 0.12) 0%, rgba(32, 190, 255, 0.02) 50%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.45, 0.25],
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: '550px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(138, 43, 226, 0.1) 0%, rgba(32, 190, 255, 0.03) 50%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* 2. Delicate Grid Matrix with Radial Fade */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 80%)',
          opacity: 0.7,
        }}
      />

      {/* 3. Flowing Sound Wave & Frequency Lines */}
      <svg
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
        }}
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#20BEFF" stopOpacity="0" />
            <stop offset="30%" stopColor="#20BEFF" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#8A2BE2" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8A2BE2" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8A2BE2" stopOpacity="0" />
            <stop offset="40%" stopColor="#20BEFF" stopOpacity="0.3" />
            <stop offset="80%" stopColor="#00F0FF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#20BEFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#20BEFF" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="waveGrad4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="25%" stopColor="#8A2BE2" stopOpacity="0.2" />
            <stop offset="75%" stopColor="#20BEFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8A2BE2" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Wave Line 1 (Upper primary wave) */}
        <motion.path
          d="M -100,280 C 200,160 400,420 720,280 C 1040,140 1240,380 1540,240"
          fill="none"
          stroke="url(#waveGrad1)"
          strokeWidth="2.5"
          strokeLinecap="round"
          animate={{
            d: [
              "M -100,280 C 200,160 400,420 720,280 C 1040,140 1240,380 1540,240",
              "M -100,240 C 220,380 440,180 720,320 C 1000,440 1260,180 1540,290",
              "M -100,280 C 200,160 400,420 720,280 C 1040,140 1240,380 1540,240",
            ],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Wave Line 1 Glow duplicate */}
        <motion.path
          d="M -100,280 C 200,160 400,420 720,280 C 1040,140 1240,380 1540,240"
          fill="none"
          stroke="url(#waveGrad1)"
          strokeWidth="6"
          strokeLinecap="round"
          filter="blur(5px)"
          opacity={0.6}
          animate={{
            d: [
              "M -100,280 C 200,160 400,420 720,280 C 1040,140 1240,380 1540,240",
              "M -100,240 C 220,380 440,180 720,320 C 1000,440 1260,180 1540,290",
              "M -100,280 C 200,160 400,420 720,280 C 1040,140 1240,380 1540,240",
            ],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Wave Line 2 (Mid-lower harmonic wave) */}
        <motion.path
          d="M -100,480 C 180,590 460,340 760,500 C 1060,640 1280,390 1540,520"
          fill="none"
          stroke="url(#waveGrad2)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="6 6"
          animate={{
            d: [
              "M -100,480 C 180,590 460,340 760,500 C 1060,640 1280,390 1540,520",
              "M -100,520 C 200,360 480,610 760,430 C 1040,280 1260,560 1540,460",
              "M -100,480 C 180,590 460,340 760,500 C 1060,640 1280,390 1540,520",
            ],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Wave Line 3 (Fast fine frequency wave) */}
        <motion.path
          d="M -100,380 C 150,460 350,300 600,410 C 850,510 1100,270 1540,390"
          fill="none"
          stroke="url(#waveGrad3)"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{
            d: [
              "M -100,380 C 150,460 350,300 600,410 C 850,510 1100,270 1540,390",
              "M -100,410 C 170,280 370,480 620,350 C 870,230 1120,490 1540,350",
              "M -100,380 C 150,460 350,300 600,410 C 850,510 1100,270 1540,390",
            ],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Wave Line 4 (Subtle bottom wave) */}
        <motion.path
          d="M -100,620 C 300,540 600,680 900,590 C 1200,500 1350,650 1540,580"
          fill="none"
          stroke="url(#waveGrad4)"
          strokeWidth="1.8"
          strokeLinecap="round"
          animate={{
            d: [
              "M -100,620 C 300,540 600,680 900,590 C 1200,500 1350,650 1540,580",
              "M -100,570 C 280,670 620,520 900,640 C 1180,720 1380,530 1540,630",
              "M -100,620 C 300,540 600,680 900,590 C 1200,500 1350,650 1540,580",
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>

      {/* 4. Drifting Light Particles / Sound Nodes */}
      <motion.div
        animate={{
          x: ['0vw', '100vw'],
          y: [300, 240, 360, 280, 320],
          opacity: [0, 0.7, 0.9, 0.6, 0],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#20BEFF',
          boxShadow: '0 0 12px 3px rgba(32, 190, 255, 0.8)',
        }}
      />

      <motion.div
        animate={{
          x: ['100vw', '-10vw'],
          y: [460, 520, 420, 500, 470],
          opacity: [0, 0.6, 0.8, 0.5, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'linear',
          delay: 3,
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: '#8A2BE2',
          boxShadow: '0 0 10px 3px rgba(138, 43, 226, 0.8)',
        }}
      />
    </div>
  );
};

export default AuthBackgroundLines;
