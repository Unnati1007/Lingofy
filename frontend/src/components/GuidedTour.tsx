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
  tabToOpen?: 'home' | 'statistics' | 'library' | 'profile' | 'docs' | 'achievements' | 'notes' | 'mindful';
}

const DEFAULT_TOUR_STEPS: TourStep[] = [
  // SECTION 1: HOME DASHBOARD (Complete Home Walkthrough)
  {
    targetId: 'tour-sidebar-home',
    title: 'Home Dashboard Overview',
    description: 'Welcome to Lingofy! We start here on the Home Dashboard, your primary command center for active language learning, song playback, and level progress.',
    position: 'right',
    tabToOpen: 'home'
  },
  {
    targetId: 'tour-language-card',
    title: 'Language Selection & Level Roadmap',
    description: 'On your Home Dashboard, select your target language (Spanish, Hindi, Korean, English), monitor roadmap completion across Easy, Intermediate, and Advanced tiers, and take unlock quizzes.',
    position: 'bottom',
    tabToOpen: 'home'
  },
  {
    targetId: 'tour-song-player',
    title: 'Music Player & Song Practice Quiz',
    description: 'Control active track playback, view synchronized bilingual karaoke lyrics in real time, and click Practice Song to launch an interactive 15-question quiz generated from the song text.',
    position: 'left',
    tabToOpen: 'home'
  },

  // SECTION 2: TRADITIONAL MODE & LESSONS
  {
    targetId: 'tour-sidebar-lessons',
    title: 'Traditional Mode & Structured Lessons',
    description: 'Access structured text-based language modules. In Traditional Mode, you focus directly on grammar rules, vocabulary flashcards, reading comprehension, and level progression lessons without audio background music.',
    position: 'right',
    tabToOpen: 'home'
  },

  // SECTION 3: MUSIC LIBRARY & PLAYLISTS
  {
    targetId: 'tour-song-library',
    title: 'Music Library & Custom YouTube Imports',
    description: 'Here in the Music Library section, explore curated multi-genre tracks, organize custom playlists, and import up to 5 YouTube songs to automatically extract AI-translated lyrics.',
    position: 'top',
    tabToOpen: 'library'
  },

  // SECTION 4: PERSONAL NOTES HUB
  {
    targetId: 'tour-notes-hub',
    title: 'Personal Notes Hub & Study Bookmarks',
    description: 'Your digital notebook section. Review saved vocabulary cards, synchronized lyric highlights, custom study notes, and bookmarks saved during interactive song sessions for revision.',
    position: 'top',
    tabToOpen: 'notes'
  },

  // SECTION 5: STATISTICS & RESEARCH ANALYTICS
  {
    targetId: 'tour-statistics-content',
    title: 'Statistics & Research Analytics',
    description: 'Explore your learning metrics section, including active streak heatmaps, score trends, and research-grade HCI evaluation cards comparing your performance between Traditional Mode and Music Mode.',
    position: 'top',
    tabToOpen: 'statistics'
  },

  // SECTION 6: ACHIEVEMENTS & BADGES
  {
    targetId: 'tour-achievements-content',
    title: 'Achievements & Milestone Badges',
    description: 'View your achievements section to track learning milestones, unlock proficiency badges for completed language roadmaps, reward streak records, and share your progress with friends.',
    position: 'top',
    tabToOpen: 'achievements'
  },

  // SECTION 7: MINDFUL LISTENING
  {
    targetId: 'tour-mindful-content',
    title: 'Mindful Listening & Ambient Immersion',
    description: 'Step into the Mindful Listening section to relax with calming natural soundscapes like ocean waves, rain, and forest ambiance paired with soft text-to-speech phrases for passive learning.',
    position: 'top',
    tabToOpen: 'mindful'
  },

  // SECTION 8: PROFILE & MODE SWITCHER
  {
    targetId: 'tour-mode-toggle',
    title: 'Profile Settings & Learning Mode Switcher',
    description: 'In Profile Settings, manage your demographics, set daily study targets, and switch seamlessly between Music-Enhanced Mode and Traditional Mode anytime.',
    position: 'top',
    tabToOpen: 'profile'
  },

  // SECTION 9: AI ASSISTANT CHATBOT
  {
    targetId: 'tour-faq-chatbot',
    title: 'AI Assistant & Help Center',
    description: 'Click this floating AI Assistant icon anytime to ask Lingofy questions, get instant app navigation assistance, or restart this guided tour whenever you need a refresher.',
    position: 'left',
    tabToOpen: 'home'
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

  // Update highlighted element bounding rect and open tab if specified
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    // Trigger tab switch to open target section in app
    if (currentStep.tabToOpen) {
      window.dispatchEvent(new CustomEvent('lingofy-tab-change', { detail: currentStep.tabToOpen }));
    }

    const updateRect = () => {
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const timer1 = setTimeout(updateRect, 150);
    const timer2 = setTimeout(updateRect, 450);

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
      clearTimeout(timer1);
      clearTimeout(timer2);
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
    const popoverWidth = 430;

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
    let top = 0;
    let left = 0;

    const pos = currentStep.position || 'bottom';

    if (pos === 'right') {
      left = targetRect.right + margin;
      top = Math.max(20, targetRect.top + targetRect.height / 2 - 120);
      if (left + popoverWidth > window.innerWidth) {
        left = targetRect.left - popoverWidth - margin;
      }
    } else if (pos === 'left') {
      left = targetRect.left - popoverWidth - margin;
      top = Math.max(20, targetRect.top + targetRect.height / 2 - 120);
      if (left < 10) {
        left = targetRect.right + margin;
      }
    } else if (pos === 'top') {
      top = targetRect.top - 240 - margin;
      left = Math.max(20, Math.min(window.innerWidth - popoverWidth - 20, targetRect.left + targetRect.width / 2 - popoverWidth / 2));
      if (top < 10) {
        top = targetRect.bottom + margin;
      }
    } else {
      // Bottom default
      top = targetRect.bottom + margin;
      left = Math.max(20, Math.min(window.innerWidth - popoverWidth - 20, targetRect.left + targetRect.width / 2 - popoverWidth / 2));
      if (top + 260 > window.innerHeight) {
        top = Math.max(20, targetRect.top - 260);
      }
    }

    // Clamp within screen boundaries so popover and buttons are never cut off
    const popoverHeight = 280;
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
            width: '430px',
            background: 'linear-gradient(180deg, #1e1e24 0%, #0f0f12 100%)',
            border: '1px solid rgba(32, 190, 255, 0.35)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -10px rgba(0, 0, 0, 0.95), 0 0 30px rgba(32, 190, 255, 0.25)',
            padding: '24px',
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            boxSizing: 'border-box'
          }}
        >
          {/* Tooltip Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '800',
                padding: '4px 12px',
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
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Skip Tour"
            >
              <X size={16} />
            </button>
          </div>

          {/* Title */}
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '10px', lineHeight: 1.3 }}>
            {currentStep.title}
          </h3>

          {/* Description */}
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', margin: '0 0 20px 0', lineHeight: 1.55 }}>
            {currentStep.description}
          </p>

          {/* Dedicated Step Progress Dots Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '5px',
            marginBottom: '20px',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '8px 12px',
            borderRadius: '100px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            {steps.map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: idx === currentStepIndex ? '16px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: idx === currentStepIndex ? '#20BEFF' : 'rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </div>

          {/* Action Buttons Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <button
              onClick={handleComplete}
              style={{
                padding: '9px 16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Skip Tour
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {currentStepIndex > 0 && (
                <button
                  onClick={handleBack}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
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
                  padding: '9px 20px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)',
                  color: '#000',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 4px 14px rgba(32, 190, 255, 0.4)'
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
