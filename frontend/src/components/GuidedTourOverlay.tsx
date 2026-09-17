import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Music, 
  BookOpen, 
  BarChart2, 
  Compass, 
  CheckCircle2,
  HelpCircle,
  Play
} from 'lucide-react';

interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  targetId?: string;
  badge: string;
  tips: string[];
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Lingofy! 🎵",
    subtitle: "Learn Languages Effortlessly Through Music & Songs",
    description: "Lingofy combines music playback, real-time synchronized bilingual lyrics, interactive song practice quizzes, and spaced memory retention to make language learning natural and fun.",
    icon: Sparkles,
    badge: "Step 1 of 5 • Overview",
    tips: [
      "Select target languages (Spanish, Hindi, Korean, etc.)",
      "Switch between Music Mode and Traditional Mode anytime",
      "Set daily learning targets to build your streak"
    ]
  },
  {
    title: "Sidebar Navigation & Library 🧭",
    subtitle: "Your Hub for Music, Stats, Notes & Achievements",
    description: "Use the resizable left sidebar to toggle between Home, Statistics & Streak Analytics, Playlist Library, Achievements, and your Personal Notes Hub.",
    icon: Compass,
    targetId: "desktop-sidebar",
    badge: "Step 2 of 5 • Navigation",
    tips: [
      "Click icons on the left to switch tabs",
      "Collapse or resize the sidebar to save screen space",
      "Access Notes Hub to write vocabulary reminders"
    ]
  },
  {
    title: "Music Player & Synchronized Lyrics 🎧",
    subtitle: "Real-Time Bilingual Subtitles & Audio Controls",
    description: "Listen to tracks with side-by-side synchronized original and translated lyrics. Adjust playback volume modes (Full Audio, Low Volume, Muted) or fine-tune audio sync timing.",
    icon: Music,
    targetId: "music-player-section",
    badge: "Step 3 of 5 • Player & Lyrics",
    tips: [
      "Click any lyric line to jump to that timestamp in the audio",
      "Toggle parallel English, Hindi, Spanish, or Korean translations",
      "Import up to 5 of your own YouTube audio tracks"
    ]
  },
  {
    title: "Interactive Song Practice Quiz 📖",
    subtitle: "15-Question Custom Quiz Right From the Track",
    description: "Click the 'Practice Song' button on any song to generate a 15-question mix quiz covering pronunciation, full lyric translation, fill-in-the-blanks, and key vocabulary.",
    icon: BookOpen,
    targetId: "practice-song-btn",
    badge: "Step 4 of 5 • Song Practice",
    tips: [
      "Select your preferred practice language first",
      "Listen to native TTS pronunciation for song phrases",
      "Practice Mode is for self-assessment (no XP loss or stress!)"
    ]
  },
  {
    title: "Stats, Streaks & FAQ Assistant 📈",
    subtitle: "Track Your Memory Retention & Get Instant Help",
    description: "Monitor your daily practice streak, active goal minutes, and spaced retention recall. If you ever have questions, click the bottom-right FAQ assistant anytime!",
    icon: BarChart2,
    badge: "Step 5 of 5 • Retention & FAQ",
    tips: [
      "Build your daily active streak 🔥",
      "Review memory retention flashback tests",
      "Click the chatbot icon at bottom-right for instant answers"
    ]
  }
];

interface GuidedTourOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
}

export const GuidedTourOverlay: React.FC<GuidedTourOverlayProps> = ({
  isOpen,
  onClose,
  onFinish
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const IconComponent = currentStep.icon;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      localStorage.setItem('hasSeenGuidedTour', 'true');
      if (onFinish) onFinish();
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100000,
      padding: '20px'
    }}>
      <motion.div
        className="guided-tour-modal-card"
        key={currentStepIndex}
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -15 }}
        transition={{ duration: 0.25 }}
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'linear-gradient(180deg, #1c1c24 0%, #0d0d12 100%)',
          border: '1px solid rgba(32, 190, 255, 0.3)',
          borderRadius: '28px',
          boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.8), 0 0 40px rgba(32, 190, 255, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Step Badge & Close */}
        <div style={{
          padding: '20px 24px 12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            padding: '4px 12px',
            borderRadius: '20px',
            background: 'rgba(32, 190, 255, 0.15)',
            color: '#20BEFF',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={12} /> {currentStep.badge}
          </span>

          <button
            onClick={() => {
              localStorage.setItem('hasSeenGuidedTour', 'true');
              onClose();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '0 28px 24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              flexShrink: 0,
              boxShadow: '0 8px 20px rgba(32, 190, 255, 0.3)'
            }}>
              <IconComponent size={26} />
            </div>

            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 4px 0' }}>
                {currentStep.title}
              </h2>
              <p style={{ fontSize: '13px', color: '#20BEFF', margin: 0, fontWeight: '600' }}>
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          <p style={{ 
            fontSize: '14px', 
            color: 'rgba(255, 255, 255, 0.8)', 
            lineHeight: '1.5',
            marginBottom: '20px'
          }}>
            {currentStep.description}
          </p>

          {/* Quick Feature Tips */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              KEY HIGHLIGHTS
            </span>
            {currentStep.tips.map((tip, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#e4e4e7' }}>
                <CheckCircle2 size={16} color="#20BEFF" style={{ flexShrink: 0 }} />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Controls & Dots */}
        <div style={{
          padding: '18px 28px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Step Dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                style={{
                  width: currentStepIndex === idx ? '20px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: currentStepIndex === idx ? '#20BEFF' : 'rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}

            <button
              onClick={handleNext}
              style={{
                padding: '10px 22px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)',
                color: '#000',
                fontWeight: '800',
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 15px rgba(32, 190, 255, 0.3)'
              }}
            >
              {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish Tour 🚀' : 'Next Step'}
              {currentStepIndex < TOUR_STEPS.length - 1 && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
