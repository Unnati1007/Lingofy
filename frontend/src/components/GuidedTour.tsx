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

const STEP_TAB_MAPPING: Record<string, string> = {
  'tour-sidebar-home': 'home',
  'tour-language-card': 'home',
  'tour-song-player': 'home',
  'tour-song-library': 'home',
  'tour-sidebar-library': 'library',
  'tour-sidebar-notes': 'notes',
  'tour-notes-hub': 'notes',
  'tour-sidebar-statistics': 'statistics',
  'tour-statistics-content': 'statistics',
  'tour-sidebar-achievements': 'achievements',
  'tour-achievements-content': 'achievements',
  'tour-sidebar-mindful': 'mindful',
  'tour-mindful-content': 'mindful',
  'tour-mode-toggle': 'profile'
};

const DEFAULT_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-sidebar',
    title: 'Navigation Control Hub & Sidebar',
    description: 'Welcome to Lingofy! This collapsible sidebar is your central command hub. Use it to seamlessly switch between Home, Music Library, Personal Notes, Statistics, Achievements, Mindful Listening, Documentation, and Profile Settings.',
    position: 'right'
  },
  // --- SECTION 1: HOME DASHBOARD ---
  {
    targetId: 'tour-sidebar-home',
    title: '1. Home Dashboard Overview',
    description: 'The Home Dashboard serves as your primary hub for active learning. Here you control live audio playback, track language progress, view level roadmaps, and launch instant song quizzes.',
    position: 'right'
  },
  {
    targetId: 'tour-language-card',
    title: 'Home: Language Roadmap & Tier Progression',
    description: 'Switch between target languages (Spanish, Hindi, Korean, English) and track completed lessons across Easy, Intermediate, and Advanced tiers to advance your fluency rank.',
    position: 'bottom'
  },
  {
    targetId: 'tour-song-player',
    title: 'Home: Synchronized Music Player & Song Quiz',
    description: 'Play high-definition audio tracks, toggle synchronized bilingual karaoke lyrics, adjust playback speed (0.75x–1.25x), and click Practice Song to trigger a 15-question AI-generated lyric quiz.',
    position: 'left'
  },
  {
    targetId: 'tour-song-library',
    title: 'Home: Recommended Songs & Custom Playlists',
    description: 'Explore personalized song recommendations matched to your target language, organize your favorite study tracks into custom playlists, and start interactive song sessions.',
    position: 'top'
  },
  // --- SECTION 2: MUSIC LIBRARY ---
  {
    targetId: 'tour-sidebar-library',
    title: '2. Music Library Section',
    description: 'Now let\'s explore the Music Library! This section holds your full catalog of curated tracks, multi-language filter options, playlists, and custom YouTube song imports.',
    position: 'right'
  },
  // --- SECTION 3: PERSONAL NOTES HUB ---
  {
    targetId: 'tour-sidebar-notes',
    title: '3. Personal Notes Hub & Flashcards Section',
    description: 'Next up is the Personal Notes Hub! This section stores all your saved vocabulary flashcards and custom markdown study notes.',
    position: 'right'
  },
  {
    targetId: 'tour-notes-hub',
    title: 'Notes Hub: Saved Flashcards & Web Speech Audio TTS',
    description: 'Review saved vocabulary cards bookmarked during song playback, listen to native Web Speech API audio pronunciations, and manage your personal language study notes.',
    position: 'bottom'
  },
  // --- SECTION 4: STATISTICS & HCI RESEARCH ANALYTICS ---
  {
    targetId: 'tour-sidebar-statistics',
    title: '4. Statistics & Research Analytics Section',
    description: 'Now let\'s inspect Statistics! This tab houses your daily activity streak heatmaps, detailed score history, and empirical HCI comparative analytics.',
    position: 'right'
  },
  {
    targetId: 'tour-statistics-content',
    title: 'Statistics: Activity Heatmaps & Empirical HCI Analytics',
    description: 'Track your daily study streak with GitHub-style heatmaps, review past quiz score trends, and evaluate empirical performance metrics comparing Traditional Mode vs Music Mode with 1-Click APA export.',
    position: 'top'
  },
  // --- SECTION 5: ACHIEVEMENTS & MILESTONE BADGES ---
  {
    targetId: 'tour-sidebar-achievements',
    title: '5. Achievements & Social Sharing Section',
    description: 'Let\'s visit Achievements! Track your learning milestones and share unlocked badges with your friends.',
    position: 'right'
  },
  {
    targetId: 'tour-achievements-content',
    title: 'Achievements: Milestone Badges & Social Sharing',
    description: 'Unlock milestone badges like Quiz Master, Streak Sentinel, and Language Star as you study. Click any unlocked badge to trigger celebration confetti and share directly on WhatsApp or Instagram.',
    position: 'bottom'
  },
  // --- SECTION 6: MINDFUL LISTENING SUBSYSTEM ---
  {
    targetId: 'tour-sidebar-mindful',
    title: '6. Mindful Listening Subsystem Section',
    description: 'Next, explore Mindful Listening! Designed for passive learning during study sessions or relaxed focus time.',
    position: 'right'
  },
  {
    targetId: 'tour-mindful-content',
    title: 'Mindful Listening: Ambient Soundscapes & Soft TTS Loops',
    description: 'Pair calming natural ambient soundscapes (Ocean Waves, Soft Rain, Forest Ambiance) with repetitive Text-to-Speech phrase pronunciations for stress-free vocabulary reinforcement.',
    position: 'bottom'
  },
  // --- SECTION 7: PROFILE & DUAL LEARNING MODE SWITCHER ---
  {
    targetId: 'tour-mode-toggle',
    title: 'Profile: Dual Learning Mode Switcher',
    description: 'In your Profile Settings, switch anytime between Music-Enhanced Mode (songs & interactive quizzes) and Traditional Learning Mode (quiet text-focused grammar drills).',
    position: 'top'
  },
  // --- SECTION 8: AI HELP ASSISTANT ---
  {
    targetId: 'tour-faq-chatbot',
    title: 'AI Assistant & Interactive Tour Guide',
    description: 'Need help anytime? Click this floating AI Assistant icon to ask questions about Lingofy, get instant navigation guidance, or re-run this interactive tour whenever you need a refresher!',
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

  // Update highlighted element bounding rect sequentially & switch tabs automatically per step
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    // Switch activeTab automatically based on target ID mapping
    const targetTab = STEP_TAB_MAPPING[currentStep.targetId];
    if (targetTab) {
      window.dispatchEvent(new CustomEvent('lingofy-tab-change', { detail: targetTab }));
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
    const timer2 = setTimeout(updateRect, 400);

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
