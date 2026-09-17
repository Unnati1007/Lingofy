import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Sparkles, 
  ChevronRight,
  Bot,
  Compass,
  Upload,
  BookOpen,
  BarChart2,
  User,
  Music
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GuidedTour } from './GuidedTour';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: { label: string; actionKey: string }[];
  link?: { label: string; actionKey: string; url?: string };
  time: string;
}

const FAQ_DATABASE: Record<string, { answer: string; link?: { label: string; actionKey: string; url?: string }; followUps?: { label: string; actionKey: string }[] }> = {
  flow: {
    answer: "🚀 **Lingofy User Journey & Flow:**\n\n- **1. Target Languages**: Learn Spanish 🇪🇸, Hindi 🇮🇳, Korean 🇰🇷, or English 🇬🇧.\n- **2. Music Player**: Listen to tracks with side-by-side synchronized bilingual lyrics.\n- **3. Practice Song Quiz**: Take a 15-question quiz generated straight from the track.\n- **4. Custom Imports**: Add up to 5 YouTube tracks into your collection.\n- **5. Retention & Stats**: Review daily streak & spaced memory recall.",
    link: { label: "🎯 Start Guided Tour", actionKey: "tour" },
    followUps: [
      { label: "📖 Practice Song Quiz", actionKey: "practice_song" },
      { label: "🎵 Custom Songs & 5 Limit", actionKey: "song_limit" },
      { label: "📈 Learning Stats", actionKey: "statistics" }
    ]
  },
  practice_song: {
    answer: "📖 **15-Question Song Practice Quiz:**\n\n- Click **'Practice Song'** on any playing track.\n- Select your target language (Spanish, Hindi, Korean, English).\n- Play a 15-question mix covering pronunciation, full lyric translation, fill-in-the-blanks, and key vocabulary.\n- *Self-assessment mode: No XP loss or leaderboard stress!*",
    link: { label: "🎵 Go to Music Player", actionKey: "player" },
    followUps: [
      { label: "🎯 Start Guided Tour", actionKey: "tour" },
      { label: "🚀 Overall Flow", actionKey: "flow" }
    ]
  },
  song_limit: {
    answer: "🎵 **Importing Custom Songs & Quotas:**\n\n- **Personal Imports**: You can import up to **5 custom YouTube / Audio tracks** with automated subtitles & 4-language AI translation sync!\n- **Community Catalog**: You can listen to and add **unlimited existing songs** to your playlists without consuming quota!",
    link: { label: "⬆️ Import Custom Track Now", actionKey: "import_modal" },
    followUps: [
      { label: "📖 Practice Song Quiz", actionKey: "practice_song" },
      { label: "🎯 Start Guided Tour", actionKey: "tour" }
    ]
  },
  modes: {
    answer: "🎧 **Learning Modes:**\n\n- 🎵 **Music Mode**: Teaches vocabulary, pronunciation, and colloquial phrases straight from song lyrics.\n- 📚 **Traditional Mode**: Focuses on structured foundational grammar and sentence drills.\n\n*Switch modes anytime in Profile Settings!*",
    link: { label: "📚 Open Lessons Page", actionKey: "lessons_page" },
    followUps: [
      { label: "📈 Learning Stats", actionKey: "statistics" },
      { label: "🧠 Memory Retention", actionKey: "retention" }
    ]
  },
  statistics: {
    answer: "📈 **Learning Stats & Memory Retention:**\n\n- Track your daily study goal minutes & active daily streak 🔥.\n- Review memory retention flashback recall scores to lock in long-term memory.",
    link: { label: "📊 View Statistics Dashboard", actionKey: "statistics" },
    followUps: [
      { label: "🎯 Daily Streak & Profile", actionKey: "profile" },
      { label: "🎯 Start Guided Tour", actionKey: "tour" }
    ]
  },
  retention: {
    answer: "🧠 **Spaced Memory Retention Testing:**\n\n- When returning after a session gap, Lingofy generates a **Retention Flashback Quiz** testing previously learned words.\n- Keeps track of your recall strength % so you never forget vocabulary!",
    link: { label: "📊 Open Analytics", actionKey: "statistics" },
    followUps: [
      { label: "🎯 Start Guided Tour", actionKey: "tour" },
      { label: "🚀 User Flow", actionKey: "flow" }
    ]
  },
  goals: {
    answer: "🎯 **Daily Goals & Streaks:**\n\n- Set a daily target (15–30 mins/day) in your Profile.\n- Complete lessons and song practice quizzes to grow your daily streak 🔥.\n- Earn badges like *Easy Explorer*, *Scholar*, and *Language Star*!",
    link: { label: "👤 Open Profile Settings", actionKey: "profile" },
    followUps: [
      { label: "🚀 User Flow", actionKey: "flow" },
      { label: "🎯 Start Guided Tour", actionKey: "tour" }
    ]
  }
};

export const FaqChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 Hi! Welcome to **Lingofy**! I am your interactive FAQ & tour assistant. How can I help you today?",
      options: [
        { label: "🎯 Start Interactive Screen Tour", actionKey: "tour" },
        { label: "📖 Practice Song Quiz Guide", actionKey: "practice_song" },
        { label: "🎵 Custom Songs & 5 Import Limit", actionKey: "song_limit" },
        { label: "🚀 How Lingofy Works (Flow)", actionKey: "flow" },
        { label: "📈 Learning Stats & Retention", actionKey: "statistics" },
        { label: "🎯 Daily Goals & Streaks", actionKey: "goals" }
      ],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [hasNewPrompt, setHasNewPrompt] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const triggerTour = () => {
    setIsOpen(false);
    setShowTour(true);
  };

  const handleActionNavigation = (actionKey: string, url?: string) => {
    setIsOpen(false);
    if (actionKey === 'tour') {
      setShowTour(true);
      return;
    }

    if (actionKey === 'import_modal') {
      window.dispatchEvent(new CustomEvent('lingofy-open-import'));
      navigate('/dashboard');
      return;
    }

    if (actionKey === 'practice_song' || actionKey === 'player') {
      window.dispatchEvent(new CustomEvent('lingofy-open-practice'));
      navigate('/dashboard');
      return;
    }

    if (actionKey === 'lessons_page') {
      navigate('/lessons');
      return;
    }

    if (actionKey === 'statistics') {
      window.dispatchEvent(new CustomEvent('lingofy-tab-change', { detail: 'statistics' }));
      navigate('/dashboard?tab=statistics');
      return;
    }

    if (actionKey === 'profile') {
      window.dispatchEvent(new CustomEvent('lingofy-tab-change', { detail: 'profile' }));
      navigate('/dashboard?tab=profile');
      return;
    }

    if (url) {
      navigate(url);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSendQuery = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    if (query.toLowerCase().includes('tour') || query.toLowerCase().includes('guide') || query.toLowerCase().includes('walkthrough')) {
      triggerTour();
      setInputValue('');
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    setTimeout(() => {
      const qLower = query.toLowerCase();
      let matchedKey = 'flow';

      if (qLower.includes('practice') || qLower.includes('quiz') || qLower.includes('song quiz') || qLower.includes('15')) {
        matchedKey = 'practice_song';
      } else if (qLower.includes('song') || qLower.includes('limit') || qLower.includes('upload') || qLower.includes('import') || qLower.includes('youtube')) {
        matchedKey = 'song_limit';
      } else if (qLower.includes('mode') || qLower.includes('traditional') || qLower.includes('music mode')) {
        matchedKey = 'modes';
      } else if (qLower.includes('stat') || qLower.includes('analytics') || qLower.includes('progress')) {
        matchedKey = 'statistics';
      } else if (qLower.includes('retention') || qLower.includes('memory') || qLower.includes('recall')) {
        matchedKey = 'retention';
      } else if (qLower.includes('goal') || qLower.includes('streak') || qLower.includes('badge')) {
        matchedKey = 'goals';
      } else {
        const botFallbackMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: "Here are the main features on Lingofy:\n\n- **Interactive Screen Tour**: Learn how to use all panels step-by-step.\n- **Song Practice Quiz**: 15-question quiz generated directly from songs.\n- **Custom Tracks**: Add up to 5 YouTube tracks with AI lyrics.\n\nSelect an option below to learn more!",
          options: [
            { label: "🎯 Start Interactive Screen Tour", actionKey: "tour" },
            { label: "📖 Practice Song Quiz", actionKey: "practice_song" },
            { label: "🚀 Step-by-Step Flow", actionKey: "flow" },
            { label: "🎵 Custom Songs Limit", actionKey: "song_limit" }
          ],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botFallbackMsg]);
        return;
      }

      const info = FAQ_DATABASE[matchedKey];
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: info.answer,
        link: info.link,
        options: info.followUps,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    }, 350);
  };

  const handleOptionClick = (actionKey: string) => {
    if (actionKey === 'tour') {
      triggerTour();
      return;
    }

    const info = FAQ_DATABASE[actionKey];
    if (!info) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: actionKey === 'flow' ? "How does Lingofy work?" :
            actionKey === 'practice_song' ? "How does 15-question Song Practice Quiz work?" :
            actionKey === 'song_limit' ? "How many custom songs can I add?" :
            actionKey === 'modes' ? "What is the difference between learning modes?" :
            actionKey === 'statistics' ? "How do I view learning statistics?" :
            actionKey === 'retention' ? "How does memory retention work?" :
            "How do daily goals and streaks work?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: info.answer,
        link: info.link,
        options: info.followUps,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    }, 250);
  };

  // Rich formatted text renderer (resolves raw markdown bold/list issues)
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} style={{ height: '4px' }} />;

          // Process bold tokens **text**
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const renderedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} style={{ color: '#20BEFF', fontWeight: '800' }}>
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          // Bullet point lines starting with -
          if (line.trim().startsWith('-')) {
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', paddingLeft: '4px' }}>
                <span style={{ color: '#20BEFF', fontWeight: 'bold' }}>•</span>
                <span style={{ flex: 1 }}>{renderedLine}</span>
              </div>
            );
          }

          return <div key={idx}>{renderedLine}</div>;
        })}
      </div>
    );
  };

  return (
    <>
      {/* Interactive Screen Tour Overlay */}
      <GuidedTour 
        isOpen={showTour} 
        onClose={() => setShowTour(false)} 
      />

      {/* Floating Toggle Button */}
      <div id="tour-faq-chatbot" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
        <motion.button
          data-tour="chatbot"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setHasNewPrompt(false);
          }}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #20BEFF 0%, #a855f7 100%)',
            border: 'none',
            boxShadow: '0 8px 30px rgba(32, 190, 255, 0.45), 0 0 20px rgba(168, 85, 247, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            position: 'relative',
            padding: '3px',
            boxSizing: 'border-box'
          }}
          title="Lingofy Guide & FAQs"
        >
          {isOpen ? (
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#121214', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={26} color="#fff" />
            </div>
          ) : (
            <img 
              src="/Logo-1.png" 
              alt="Lingofy Logo" 
              style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: '50%', 
                objectFit: 'cover',
                display: 'block'
              }} 
            />
          )}

          {/* Pulse notification dot */}
          {!isOpen && hasNewPrompt && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#22c55e',
              border: '2px solid #000',
              boxShadow: '0 0 8px #22c55e',
              zIndex: 10
            }} />
          )}
        </motion.button>
      </div>

      {/* Chat Window (Wider 450px Container) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="faq-chatbot-window"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              bottom: '94px',
              right: '24px',
              width: '560px',
              maxWidth: 'calc(100vw - 32px)',
              height: '620px',
              maxHeight: 'calc(100vh - 110px)',
              background: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
              border: '1px solid rgba(32, 190, 255, 0.3)',
              borderRadius: '26px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(32, 190, 255, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 9999,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(90deg, rgba(32, 190, 255, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #20BEFF, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(32, 190, 255, 0.3)'
                }}>
                  <img src="/Logo-1.png" alt="Lingofy Logo" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>Lingofy Guide</span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
                    Instant FAQs & Interactive Website Tour
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Tour Banner */}
            <div style={{
              padding: '10px 18px',
              background: 'rgba(32, 190, 255, 0.08)',
              borderBottom: '1px solid rgba(32, 190, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#20BEFF', fontWeight: '700' }}>
                <Compass size={16} /> New to Lingofy? Take a 1-min Tour
              </div>
              <button
                onClick={triggerTour}
                style={{
                  padding: '5px 14px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)',
                  color: '#000',
                  fontWeight: '800',
                  fontSize: '11px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(32, 190, 255, 0.3)'
                }}
              >
                Start Tour 🚀
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '100%'
                  }}
                >
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    background: msg.sender === 'user' 
                      ? 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)' 
                      : 'rgba(255, 255, 255, 0.04)',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: msg.sender === 'user' ? '#000' : '#e4e4e7',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    maxWidth: '95%',
                    boxShadow: msg.sender === 'user' ? '0 4px 14px rgba(32, 190, 255, 0.25)' : 'none'
                  }}>
                    {/* Rendered Rich Text */}
                    {msg.sender === 'user' ? msg.text : renderFormattedText(msg.text)}

                    {/* Direct Action Navigation Link */}
                    {msg.link && (
                      <div style={{ marginTop: '12px' }}>
                        <button
                          onClick={() => handleActionNavigation(msg.link!.actionKey, msg.link!.url)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, rgba(32, 190, 255, 0.2) 0%, rgba(0, 153, 230, 0.1) 100%)',
                            border: '1.5px solid #20BEFF',
                            color: '#20BEFF',
                            fontSize: '12px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 12px rgba(32, 190, 255, 0.2)'
                          }}
                        >
                          {msg.link.label} <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Options Chips */}
                  {msg.options && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginTop: '8px',
                      maxWidth: '100%'
                    }}>
                      {msg.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleOptionClick(opt.actionKey)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            background: opt.actionKey === 'tour' ? 'rgba(32, 190, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                            border: opt.actionKey === 'tour' ? '1px solid #20BEFF' : '1px solid rgba(255, 255, 255, 0.12)',
                            color: opt.actionKey === 'tour' ? '#20BEFF' : '#fff',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.3)', marginTop: '4px', padding: '0 4px' }}>
                    {msg.time}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div style={{
              padding: '14px 18px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <input
                type="text"
                placeholder="Ask about song practice, import limits, stats..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSendQuery();
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => handleSendQuery()}
                disabled={!inputValue.trim()}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: inputValue.trim() ? 'linear-gradient(135deg, #20BEFF, #0099e6)' : 'rgba(255, 255, 255, 0.1)',
                  color: inputValue.trim() ? '#000' : 'rgba(255, 255, 255, 0.3)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputValue.trim() ? 'pointer' : 'default',
                  transition: 'all 0.2s'
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
