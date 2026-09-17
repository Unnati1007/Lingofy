import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2
} from 'lucide-react';

export interface TourStep {
  targetId: string; // DOM element ID e.g. "tour-sidebar"
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const DEFAULT_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-sidebar',
    title: 'Navigation Control Hub',
    description: 'Welcome to Lingofy! Use this sidebar menu to switch between all core features, learning modules, and analytics.',
    position: 'right'
  },
  {
    targetId: 'tour-sidebar-home',
    title: 'Home Dashboard',
    description: 'Your main dashboard overview displaying active songs, language roadmap progress, and quick practice controls.',
    position: 'right'
  },
  {
    targetId: 'tour-sidebar-lessons',
    title: 'Interactive Lessons',
    description: 'Structured language learning modules categorized by proficiency levels from Easy to Advanced.',
    position: 'right'
  },
  {
    targetId: 'tour-sidebar-library',
    title: 'Music Library',
    description: 'Browse curated songs, manage custom playlists, or import up to 5 YouTube tracks with AI synchronized lyrics.',
    position: 'right'
  },
  {
    targetId: 'tour-sidebar-notes',
    title: 'Personal Notes Hub',
    description: 'Review saved vocabulary notes, lyric highlights, and custom study bookmarks created during song sessions.',
    position: 'right'
  },
  {
    targetId: 'tour-sidebar-statistics',
    title: 'Statistics & Analytics',
    description: 'Track daily study minutes, active streaks, learning heatmaps, and spaced memory retention scores.',
    position: 'right'
  },
  {
    targetId: 'tour-sidebar-achievements',
    title: 'Achievements & Badges',
    description: 'Unlock milestone badges, track streak rewards, and view your learning progress achievements.',
    position: 'right'
  },
  {
    targetId: 'tour-sidebar-mindful',
    title: 'Mindful Listening',
    description: 'Relax with soothing background ambient sounds (birds, rain, waves) paired with soft language phrases for passive learning.',
    position: 'right'
  },
  {
    targetId: 'tour-language-card',
    title: 'Language Selection & Roadmap',
    description: 'Select your target language (Spanish, Hindi, Korean, English), monitor roadmap proficiency, and take level quizzes.',
    position: 'bottom'
  },
  {
    targetId: 'tour-song-player',
    title: 'Music Player & Song Practice Quiz',
    description: 'Play HQ tracks, toggle synchronized bilingual lyrics, and click Practice Song to start an interactive 15-question quiz.',
    position: 'left'
  },
  {
    targetId: 'tour-song-library',
    title: 'Playlists & Custom Track Imports',
    description: 'Explore community playlists and import up to 5 custom YouTube tracks into your personal music collection.',
    position: 'top'
  },
  {
    targetId: 'tour-faq-chatbot',
    title: 'AI Assistant & Help Center',
    description: 'Click here anytime to ask Lingofy AI assistant questions, get instant app navigation, or restart this guided tour.',
    position: 'left'
  }
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  steps?: TourStep[];
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  isOpen,
  onClose,
  steps = DEFAULT_TOUR_STEPS
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = steps[currentStepIndex];

  // Update highlighted element bounding rect
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    const updateRect = () => {
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        // Scroll element into view if needed
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    // Timeout check in case element renders slightly delayed
    const timer = setTimeout(updateRect, 300);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
      clearTimeout(timer);
    };
  }, [isOpen, currentStepIndex, currentStep]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('lingofy_tour_completed', 'true');
    onClose();
  };

  // Calculate tooltip popover positioning relative to target element
  const getPopoverStyle = () => {
    if (!targetRect) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10002
      };
    }

    const margin = 18;
    const popoverWidth = 360;

    let top = 0;
    let left = 0;

    const pos = currentStep.position || 'bottom';

    if (pos === 'right') {
      left = targetRect.right + margin;
      top = Math.max(20, targetRect.top + targetRect.height / 2 - 100);
      if (left + popoverWidth > window.innerWidth) {
        left = targetRect.left - popoverWidth - margin;
      }
    } else if (pos === 'left') {
      left = targetRect.left - popoverWidth - margin;
      top = Math.max(20, targetRect.top + targetRect.height / 2 - 100);
      if (left < 10) {
        left = targetRect.right + margin;
      }
    } else if (pos === 'top') {
      top = targetRect.top - 200 - margin;
      left = Math.max(20, Math.min(window.innerWidth - popoverWidth - 20, targetRect.left + targetRect.width / 2 - popoverWidth / 2));
      if (top < 10) {
        top = targetRect.bottom + margin;
      }
    } else {
      // Bottom default
      top = targetRect.bottom + margin;
      left = Math.max(20, Math.min(window.innerWidth - popoverWidth - 20, targetRect.left + targetRect.width / 2 - popoverWidth / 2));
      if (top + 220 > window.innerHeight) {
        top = Math.max(20, targetRect.top - 220);
      }
    }

    // Clamp within screen boundaries so popover and buttons are never cut off
    const popoverHeight = 250;
    const maxTop = Math.max(20, window.innerHeight - popoverHeight - 20);
    const maxLeft = Math.max(20, window.innerWidth - popoverWidth - 20);

    top = Math.min(maxTop, Math.max(20, top));
    left = Math.min(maxLeft, Math.max(20, left));

    return {
      position: 'fixed' as const,
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 10002
    };
  };

  return (
    <AnimatePresence>
      <div className="guided-tour-overlay" style={{ position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: 'auto' }}>
        
        {/* Dark Screen Mask Backdrop with Spotlight Hole */}
        <svg 
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 10000,
            pointerEvents: 'auto'
          }}
        >
          <defs>
            <mask id="tour-spotlight-mask">
              {/* White fills entire screen */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Black cutout for target element */}
              {targetRect && (
                <rect
                  x={targetRect.left - 8}
                  y={targetRect.top - 8}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx="14"
                  fill="black"
                />
              )}
            </mask>
          </defs>

          {/* Dark Overlay with Mask Hole */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.78)"
            mask="url(#tour-spotlight-mask)"
            onClick={(e) => e.stopPropagation()}
          />
        </svg>

        {/* Glowing Spotlight Outline Box around target element */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              top: `${targetRect.top - 8}px`,
              left: `${targetRect.left - 8}px`,
              width: `${targetRect.width + 16}px`,
              height: `${targetRect.height + 16}px`,
              borderRadius: '16px',
              border: '2px solid #20BEFF',
              boxShadow: '0 0 25px rgba(32, 190, 255, 0.6), inset 0 0 15px rgba(32, 190, 255, 0.2)',
              zIndex: 10001,
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Floating Tooltip Card */}
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ duration: 0.25 }}
          style={{
            ...getPopoverStyle(),
            width: '360px',
            background: 'linear-gradient(180deg, #1e1e24 0%, #0f0f12 100%)',
            border: '1px solid rgba(32, 190, 255, 0.3)',
            borderRadius: '20px',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.9), 0 0 25px rgba(32, 190, 255, 0.25)',
            padding: '20px',
            color: '#fff',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {/* Tooltip Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                padding: '3px 10px',
                borderRadius: '12px',
                background: 'rgba(32, 190, 255, 0.18)',
                color: '#20BEFF',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                STEP {currentStepIndex + 1} OF {steps.length}
              </span>
            </div>

            <button
              onClick={handleComplete}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer'
              }}
              title="Skip Tour"
            >
              <X size={16} />
            </button>
          </div>

          {/* Title */}
          <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
            {currentStep.title}
          </h3>

          {/* Description */}
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.75)', margin: '0 0 20px 0', lineHeight: '1.5' }}>
            {currentStep.description}
          </p>

          {/* Step Dots Progress */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    width: idx === currentStepIndex ? '14px' : '5px',
                    height: '5px',
                    borderRadius: '3px',
                    background: idx === currentStepIndex ? '#20BEFF' : 'rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s'
                  }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleComplete}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.5)',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Skip
              </button>

              {currentStepIndex > 0 && (
                <button
                  onClick={handleBack}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    fontWeight: '600',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ChevronLeft size={14} /> Back
                </button>
              )}

              <button
                onClick={handleNext}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #20BEFF, #0099e6)',
                  color: '#000',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 4px 12px rgba(32, 190, 255, 0.35)'
                }}
              >
                {currentStepIndex === steps.length - 1 ? (
                  <>
                    Finish Tour <CheckCircle2 size={14} />
                  </>
                ) : (
                  <>
                    Next <ChevronRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
