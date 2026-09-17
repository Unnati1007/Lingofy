import React, { useState, useEffect, useRef } from 'react';
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
 Upload,
 Bot
} from 'lucide-react';

interface TourStep {
 title: string;
 subtitle: string;
 description: string;
 icon: any;
 targetSelector?: string;
 badge: string;
 instruction: string;
}

const TOUR_STEPS: TourStep[] = [
 {
 title: "Welcome to Lingofy",
 subtitle: "Learn Languages Effortlessly Through Music",
 description: "Welcome! Lingofy is designed to teach you languages (Spanish, Hindi, Korean, English) naturally through the songs and lyrics you love.",
 icon: Sparkles,
 badge: "Step 1 of 5 - Overview",
 instruction: "Let's take a quick 1-minute guided tour of your dashboard panels!"
 },
 {
 title: "1. Navigation Sidebar",
 subtitle: "Access Home, Analytics, Library & Personal Notes",
 description: "Use the resizable left sidebar to switch between your Home feed, Learning Statistics, Playlist Library, Achievements, and Notes Hub.",
 icon: Compass,
 targetSelector: '[data-tour="sidebar"]',
 badge: "Step 2 of 5 - Sidebar",
 instruction: "Click any icon on the sidebar to switch views anytime."
 },
 {
 title: "2. Music Player & Synced Lyrics",
 subtitle: "Real-Time Bilingual Subtitles & Time Sync",
 description: "Here you can play tracks with side-by-side synchronized lyrics. Click any lyric line to jump to that timestamp in the audio!",
 icon: Music,
 targetSelector: '[data-tour="player"]',
 badge: "Step 3 of 5 - Music Player",
 instruction: "Toggle parallel English, Hindi, Spanish, or Korean translations."
 },
 {
 title: "3. Practice Song Quiz",
 subtitle: "15-Question Quiz Generated Right From The Song",
 description: "Click the 'Practice Song' button on any track to launch a 15-question mix quiz on pronunciation, lyrics, fill-in-the-blanks and vocabulary.",
 icon: BookOpen,
 targetSelector: '[data-tour="practice-song"]',
 badge: "Step 4 of 5 - Song Practice",
 instruction: "Practice Mode is 100% stress-free for self-assessment!"
 },
 {
 title: "4. Custom Song Imports & Quota",
 subtitle: "Import up to 5 YouTube tracks with AI Lyrics",
 description: "Click 'Import Song' to add custom YouTube audio tracks into your library. AI will automatically extract subtitles and parallel translations.",
 icon: Upload,
 targetSelector: '[data-tour="import-song"]',
 badge: "Step 5 of 5 - Custom Import",
 instruction: "You get 5 custom YouTube upload slots for your private collection."
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
 const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

 const currentStep = TOUR_STEPS[currentStepIndex];
 const IconComponent = currentStep.icon;

 // Measure targeted element position on step change or resize
 useEffect(() => {
 if (!isOpen) return;

 const updateTargetPosition = () => {
 if (currentStep.targetSelector) {
 const el = document.querySelector(currentStep.targetSelector);
 if (el) {
 el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
 setTimeout(() => {
 const rect = el.getBoundingClientRect();
 setTargetRect(rect);
 }, 300);
 return;
 }
 }
 setTargetRect(null);
 };

 updateTargetPosition();
 window.addEventListener('resize', updateTargetPosition);
 return () => window.removeEventListener('resize', updateTargetPosition);
 }, [isOpen, currentStepIndex]);

 if (!isOpen) return null;

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
 zIndex: 100000,
 pointerEvents: 'auto'
 }}>
 {/* Dark Spotlight Backdrop */}
 <div style={{
 position: 'fixed',
 top: 0,
 left: 0,
 width: '100vw',
 height: '100vh',
 background: targetRect ? 'transparent' : 'rgba(0, 0, 0, 0.85)',
 backdropFilter: targetRect ? 'none' : 'blur(8px)',
 transition: 'background 0.3s ease'
 }} />

 {/* Target Element Spotlight Highlight Box */}
 {targetRect && (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.3 }}
 style={{
 position: 'fixed',
 top: `${Math.max(10, targetRect.top - 8)}px`,
 left: `${Math.max(10, targetRect.left - 8)}px`,
 width: `${targetRect.width + 16}px`,
 height: `${targetRect.height + 16}px`,
 borderRadius: '16px',
 border: '2px solid #20BEFF',
 boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.8), 0 0 30px rgba(32, 190, 255, 0.6)',
 pointerEvents: 'none',
 zIndex: 100001,
 transition: 'all 0.3s ease'
 }}
 />
 )}

 {/* Tooltip Instruction Card */}
 <div style={{
 position: 'fixed',
 top: targetRect 
 ? (targetRect.top + targetRect.height + 220 < window.innerHeight 
 ? `${Math.min(window.innerHeight - 340, targetRect.top + targetRect.height + 16)}px`
 : `${Math.max(20, targetRect.top - 280)}px`)
 : '50%',
 left: targetRect
 ? `${Math.min(window.innerWidth - 480, Math.max(20, targetRect.left))}px`
 : '50%',
 transform: targetRect ? 'none' : 'translate(-50%, -50%)',
 zIndex: 100002,
 width: '100%',
 maxWidth: '440px',
 padding: '0 16px'
 }}>
 <motion.div
 key={currentStepIndex}
 initial={{ opacity: 0, y: 15, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -15, scale: 0.95 }}
 transition={{ duration: 0.25 }}
 style={{
 background: 'linear-gradient(180deg, #1c1c24 0%, #0d0d12 100%)',
 border: '1.5px solid #20BEFF',
 borderRadius: '24px',
 padding: '22px 24px',
 boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 35px rgba(32, 190, 255, 0.25)',
 color: '#fff',
 position: 'relative'
 }}
 >
 {/* Header */}
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
 <span style={{
 fontSize: '11px',
 fontWeight: '800',
 padding: '4px 10px',
 borderRadius: '20px',
 background: 'rgba(32, 190, 255, 0.15)',
 color: '#20BEFF',
 textTransform: 'uppercase',
 letterSpacing: '0.5px',
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
 background: 'rgba(255, 255, 255, 0.08)',
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
 >
 <X size={14} />
 </button>
 </div>

 {/* Title & Description */}
 <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
 <div style={{
 width: '42px',
 height: '42px',
 borderRadius: '12px',
 background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 color: '#000',
 flexShrink: 0,
 boxShadow: '0 4px 12px rgba(32, 190, 255, 0.3)'
 }}>
 <IconComponent size={22} />
 </div>

 <div>
 <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', margin: '0 0 2px 0' }}>
 {currentStep.title}
 </h3>
 <p style={{ fontSize: '12px', color: '#20BEFF', margin: 0, fontWeight: '600' }}>
 {currentStep.subtitle}
 </p>
 </div>
 </div>

 <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.5', margin: '0 0 14px 0' }}>
 {currentStep.description}
 </p>

 {/* Tip Box */}
 <div style={{
 background: 'rgba(32, 190, 255, 0.08)',
 border: '1px solid rgba(32, 190, 255, 0.2)',
 borderRadius: '12px',
 padding: '10px 14px',
 fontSize: '12px',
 color: '#20BEFF',
 display: 'flex',
 alignItems: 'center',
 gap: '8px',
 marginBottom: '18px'
 }}>
 <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
 <span>{currentStep.instruction}</span>
 </div>

 {/* Footer Controls */}
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
 {/* Dots */}
 <div style={{ display: 'flex', gap: '4px' }}>
 {TOUR_STEPS.map((_, idx) => (
 <div
 key={idx}
 onClick={() => setCurrentStepIndex(idx)}
 style={{
 width: currentStepIndex === idx ? '16px' : '6px',
 height: '6px',
 borderRadius: '3px',
 background: currentStepIndex === idx ? '#20BEFF' : 'rgba(255, 255, 255, 0.2)',
 cursor: 'pointer',
 transition: 'all 0.25s ease'
 }}
 />
 ))}
 </div>

 <div style={{ display: 'flex', gap: '8px' }}>
 {currentStepIndex > 0 && (
 <button
 onClick={handlePrev}
 style={{
 padding: '8px 14px',
 borderRadius: '10px',
 background: 'rgba(255, 255, 255, 0.08)',
 color: '#fff',
 border: 'none',
 fontWeight: '600',
 fontSize: '12px',
 cursor: 'pointer'
 }}
 >
 Back
 </button>
 )}

 <button
 onClick={handleNext}
 style={{
 padding: '8px 18px',
 borderRadius: '10px',
 background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)',
 color: '#000',
 fontWeight: '800',
 fontSize: '12px',
 border: 'none',
 cursor: 'pointer',
 display: 'flex',
 alignItems: 'center',
 gap: '4px',
 boxShadow: '0 4px 12px rgba(32, 190, 255, 0.3)'
 }}
 >
 {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish Tour ' : 'Next Step'}
 {currentStepIndex < TOUR_STEPS.length - 1 && <ChevronRight size={14} />}
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 </div>
 );
};
