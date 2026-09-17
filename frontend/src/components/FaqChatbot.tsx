import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  HelpCircle, 
  Music, 
  BookOpen, 
  Brain, 
  ListMusic, 
  Flame, 
  ChevronRight,
  Bot,
  Compass
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GuidedTourOverlay } from './GuidedTourOverlay';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: { label: string; actionKey: string }[];
  link?: { label: string; url: string };
  time: string;
}

const FAQ_DATABASE: Record<string, { answer: string; link?: { label: string; url: string }; followUps?: { label: string; actionKey: string }[] }> = {
  flow: {
    answer: "🚀 **Lingofy Step-by-Step User Flow:**\n\n1. **Choose Languages**: Pick your native & target languages (Spanish, Hindi, Korean, etc.).\n2. **Set Daily Goal**: Pick your daily practice target (e.g. 15 mins).\n3. **Listen to Songs**: Play tracks with real-time synchronized bilingual lyrics.\n4. **Song Practice Quiz**: Click 'Practice Song' to play a 15-question mix quiz on pronunciation, lyrics & vocabulary.\n5. **Personal Notes & Stats**: Review notes in Notes Hub and track your daily active streak!",
    link: { label: "Explore Dashboard", url: "/dashboard" },
    followUps: [
      { label: "🎯 Start Guided Tour", actionKey: "tour" },
      { label: "📖 Practice Song Quiz", actionKey: "practice_song" },
      { label: "🎵 Custom Songs & Limits", actionKey: "song_limit" }
    ]
  },
  practice_song: {
    answer: "📖 **15-Question Song Practice Quiz:**\n\n- Click **'Practice Song'** on any playing track.\n- Choose your target language.\n- Play a **15-question quiz** covering:\n  • Pronunciation (with native TTS audio)\n  • Full lyric translations\n  • Fill-in-the-blank missing words\n  • Key vocabulary & song context\n- *Self-assessment mode: Scores do NOT affect XP or leaderboards!*",
    link: { label: "Go to Music Player", url: "/dashboard" },
    followUps: [
      { label: "🎯 Start Guided Tour", actionKey: "tour" },
      { label: "🚀 Overall Flow", actionKey: "flow" }
    ]
  },
  song_limit: {
    answer: "🎵 **Importing Custom Songs & Quota:**\n\n- **Personal Imports**: You can import up to **5 custom YouTube / Audio tracks** with automated transcript & 4-language AI translation sync!\n- **Community Catalog**: You can listen to and add **unlimited existing songs** to your playlists without consuming quota!",
    link: { label: "Import Custom Track", url: "/dashboard" },
    followUps: [
      { label: "📖 Practice Song Quiz", actionKey: "practice_song" },
      { label: "🎯 Start Guided Tour", actionKey: "tour" }
    ]
  },
  modes: {
    answer: "🎧 **Learning Modes:**\n\n- 🎵 **Music Mode**: Teaches vocabulary, pronunciation, and colloquial phrases straight from song lyrics and rhythm.\n- 📚 **Traditional Mode**: Focuses on structured foundational grammar, tense building, and sentence drills.\n\n*Switch modes anytime in Profile Settings!*",
    link: { label: "View Lessons", url: "/lessons" },
    followUps: [
      { label: "📈 Quiz Levels", actionKey: "levels" },
      { label: "🧠 Memory Retention", actionKey: "retention" }
    ]
  },
  levels: {
    answer: "📈 **Quiz Levels & Drills:**\n\n1. **Easy (Level 1)**: Basic words & greetings.\n2. **Intermediate (Level 2)**: Sentences & daily verbs.\n3. **Hard (Level 3)**: Complex idioms & tenses.\n4. **Pronunciation**: Voice speaking drills with real-time speech evaluation.\n5. **Song Practice**: 15-question song quiz directly from the track you're listening to!",
    link: { label: "View All Levels", url: "/lessons" },
    followUps: [
      { label: "📖 Practice Song Quiz", actionKey: "practice_song" },
      { label: "🧠 Memory Retention", actionKey: "retention" }
    ]
  },
  retention: {
    answer: "🧠 **Spaced Memory Retention Testing:**\n\n- When returning to Lingofy, the app checks your **Session Gap**.\n- Generates a **Memory Retention Quiz** to test previously learned vocabulary.\n- Displays your retention strength % so you never forget words!",
    link: { label: "Check Analytics", url: "/dashboard" },
    followUps: [
      { label: "🎯 Start Guided Tour", actionKey: "tour" },
      { label: "🚀 User Flow", actionKey: "flow" }
    ]
  },
  goals: {
    answer: "🎯 **Daily Goals & Streaks:**\n\n- Set a daily target (15–30 mins/day) in your Profile.\n- Complete lessons and song practice quizzes to grow your daily streak 🔥.\n- Earn badges like *Easy Explorer*, *Scholar*, and *Language Star*!",
    link: { label: "Profile Settings", url: "/profile" },
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
      text: "👋 Hi! Welcome to **Lingofy**! I am your quick FAQ guide. Would you like to start an interactive screen tour or ask a question?",
      options: [
        { label: "🎯 Start Interactive Screen Tour", actionKey: "tour" },
        { label: "📖 How Song Practice Quiz Works", actionKey: "practice_song" },
        { label: "🚀 How Lingofy Works (Flow)", actionKey: "flow" },
        { label: "🎵 Custom Songs & 5 Song Limit", actionKey: "song_limit" },
        { label: "🎧 Music vs Traditional Mode", actionKey: "modes" },
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
      } else if (qLower.includes('level') || qLower.includes('easy') || qLower.includes('hard') || qLower.includes('pronunciation')) {
        matchedKey = 'levels';
      } else if (qLower.includes('retention') || qLower.includes('memory') || qLower.includes('recall')) {
        matchedKey = 'retention';
      } else if (qLower.includes('goal') || qLower.includes('streak') || qLower.includes('badge')) {
        matchedKey = 'goals';
      } else {
        const botFallbackMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `Here are the main features on Lingofy:\n\n- **Interactive Screen Tour**: Learn how to use all panels step-by-step.\n- **Song Practice Quiz**: 15-question quiz generated directly from songs.\n- **Custom Tracks**: Add up to 5 YouTube tracks with AI lyrics.\n\nSelect an option below to learn more!`,
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
    }, 400);
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
            actionKey === 'levels' ? "What are the quiz levels?" :
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
    }, 300);
  };

  return (
    <>
      {/* Interactive Screen Tour Overlay */}
      <GuidedTourOverlay 
        isOpen={showTour} 
        onClose={() => setShowTour(false)} 
      />

      {/* Floating Toggle Button */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setHasNewPrompt(false);
          }}
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #20BEFF 0%, #a855f7 100%)',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 30px rgba(32, 190, 255, 0.45), 0 0 20px rgba(168, 85, 247, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            position: 'relative'
          }}
          title="Lingofy Tour & FAQs"
        >
          {isOpen ? <X size={26} /> : <Bot size={28} />}

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
              boxShadow: '0 0 8px #22c55e'
            }} />
          )}
        </motion.button>
      </div>

      {/* Chat Window */}
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
              bottom: '92px',
              right: '24px',
              width: '390px',
              maxWidth: 'calc(100vw - 32px)',
              height: '560px',
              maxHeight: 'calc(100vh - 120px)',
              background: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(32, 190, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 9999,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(90deg, rgba(32, 190, 255, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #20BEFF, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <Bot size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>Lingofy Guide</span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
                    FAQs & Interactive Tour Guide
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
              padding: '10px 16px',
              background: 'rgba(32, 190, 255, 0.08)',
              borderBottom: '1px solid rgba(32, 190, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#20BEFF', fontWeight: '600' }}>
                <Compass size={16} /> New to Lingofy?
              </div>
              <button
                onClick={triggerTour}
                style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  background: '#20BEFF',
                  color: '#000',
                  fontWeight: '800',
                  fontSize: '11px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Start Guided Tour 🚀
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
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
                    padding: '12px 16px',
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.sender === 'user' 
                      ? 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: msg.sender === 'user' ? '#000' : '#e4e4e7',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    maxWidth: '92%',
                    boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(32, 190, 255, 0.2)' : 'none',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.text}

                    {/* Link button */}
                    {msg.link && (
                      <div style={{ marginTop: '10px' }}>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate(msg.link!.url);
                          }}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            background: 'rgba(32, 190, 255, 0.15)',
                            border: '1px solid #20BEFF',
                            color: '#20BEFF',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {msg.link.label} <ChevronRight size={12} />
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
              padding: '12px 16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <input
                type="text"
                placeholder="Ask a question or type 'tour'..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSendQuery();
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
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
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: inputValue.trim() ? '#20BEFF' : 'rgba(255, 255, 255, 0.1)',
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
