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
  Bot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    answer: "🚀 **Lingofy Step-by-Step User Flow:**\n\n1. **Create Account & Personalize**: Choose your native & target languages (Hindi, Spanish, Korean) + music tastes.\n2. **Complete Profile**: Set your daily goal (15–30 mins) and learning pace.\n3. **Listen to Songs**: Play songs in the Music Library with real-time synchronized bilingual lyrics.\n4. **Create Playlists**: Group your favorite tracks to study together.\n5. **Add Custom Songs**: Import up to 5 of your favorite YouTube/Audio tracks with automated AI lyrics & translation sync!\n6. **Practice Quizzes**: Take 10-question Song Practice quizzes, Level progression tests, and Spaced Retention Flashbacks!",
    link: { label: "Explore Music Library", url: "/dashboard" },
    followUps: [
      { label: "🎵 Custom Song Limits", actionKey: "song_limit" },
      { label: "🎧 Music vs Traditional Mode", actionKey: "modes" }
    ]
  },
  song_limit: {
    answer: "🎵 **Importing Custom Songs & Quota:**\n\n- **Limit**: Each user can import up to **5 custom songs** into their private library.\n- **Existing Songs**: You can listen to and add **unlimited existing songs** from the catalog to your playlists.\n- **Auto Lyrics & Sync**: When you add a YouTube song link, Lingofy automatically retrieves the transcript and generates AI translations in Hindi, Spanish, and Korean!",
    link: { label: "Import a Song", url: "/dashboard" },
    followUps: [
      { label: "🚀 Overall App Flow", actionKey: "flow" },
      { label: "🎧 Learning Modes", actionKey: "modes" }
    ]
  },
  modes: {
    answer: "🎧 **Music Mode vs Traditional Mode:**\n\n- 🎵 **Music Mode (Immersion)**: Teaches vocabulary, pronunciation, and colloquial phrases straight from song lyrics and rhythm. Ideal for natural retention and enjoyment!\n- 📚 **Traditional Mode (Grammar & Structure)**: Focuses on structured foundational vocabulary, grammar rules, tense building, and formal speaking drills.\n\n*You can switch your mode anytime in your Profile Settings!*",
    link: { label: "Open Lessons", url: "/lessons" },
    followUps: [
      { label: "📈 Quiz Levels", actionKey: "levels" },
      { label: "🧠 Retention Test", actionKey: "retention" }
    ]
  },
  levels: {
    answer: "📈 **Quiz Levels & Practice Types:**\n\n1. **Easy (Level 1)**: Basic words, numbers, greetings, and common items.\n2. **Intermediate (Level 2)**: Conversational sentences, verbs, and daily phrases.\n3. **Hard (Level 3)**: Complex idioms, compound tenses, and advanced comprehension.\n4. **Pronunciation**: Voice speaking drills with real-time speech evaluation.\n5. **Focus Areas**: Targeted vocabulary like Food, Family, Travel, Emotions.\n6. **Song Practice**: 10-question mixed quiz generated straight from the song you're listening to!",
    link: { label: "View All Levels", url: "/lessons" },
    followUps: [
      { label: "🧠 How Retention Works", actionKey: "retention" },
      { label: "🎯 Daily Goals", actionKey: "goals" }
    ]
  },
  retention: {
    answer: "🧠 **Memory Retention Testing (Flashback Quizzes):**\n\n- When you return to Lingofy after hours or days, Lingofy automatically calculates your **Session Gap**.\n- It generates a **Memory Retention Quiz** containing words and phrases you previously learned to test your spaced repetition recall.\n- Your **Retention Score %** and memory strength curve are tracked in your Analytics to make sure you never forget vocabulary!",
    link: { label: "Check Analytics", url: "/dashboard" },
    followUps: [
      { label: "🚀 Getting Started Flow", actionKey: "flow" },
      { label: "📈 Quiz Levels", actionKey: "levels" }
    ]
  },
  goals: {
    answer: "🎯 **Daily Goals & Streaks:**\n\n- Set a daily study target (e.g. 15 mins or 3 quizzes per day) in your profile.\n- Complete lessons and song practices to increase your active daily streak 🔥.\n- Earn special badges like *Easy Explorer*, *Intermediate Scholar*, and *Language Star* as you progress!",
    link: { label: "Go to Profile Settings", url: "/profile" },
    followUps: [
      { label: "🚀 User Flow", actionKey: "flow" },
      { label: "🎵 Custom Songs", actionKey: "song_limit" }
    ]
  }
};

export const FaqChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 Hi! Welcome to **Lingofy**! I am your quick FAQ guide. How can I assist you today? Select a topic below or type your question!",
      options: [
        { label: "🚀 How Lingofy Works (Flow)", actionKey: "flow" },
        { label: "🎵 Add Songs & 5 Song Limit", actionKey: "song_limit" },
        { label: "🎧 Music vs Traditional Mode", actionKey: "modes" },
        { label: "📈 Quiz Levels & Badges", actionKey: "levels" },
        { label: "🧠 Retention Memory Tests", actionKey: "retention" },
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

  const handleSendQuery = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    // Answer logic
    setTimeout(() => {
      const qLower = query.toLowerCase();
      let matchedKey = 'flow';

      if (qLower.includes('song') || qLower.includes('limit') || qLower.includes('add') || qLower.includes('upload') || qLower.includes('youtube') || qLower.includes('import') || qLower.includes('5')) {
        matchedKey = 'song_limit';
      } else if (qLower.includes('mode') || qLower.includes('traditional') || qLower.includes('music mode') || qLower.includes('difference')) {
        matchedKey = 'modes';
      } else if (qLower.includes('level') || qLower.includes('easy') || qLower.includes('medium') || qLower.includes('hard') || qLower.includes('quiz') || qLower.includes('practice') || qLower.includes('pronunciation')) {
        matchedKey = 'levels';
      } else if (qLower.includes('retention') || qLower.includes('memory') || qLower.includes('gap') || qLower.includes('recall') || qLower.includes('score')) {
        matchedKey = 'retention';
      } else if (qLower.includes('goal') || qLower.includes('streak') || qLower.includes('badge') || qLower.includes('profile') || qLower.includes('point')) {
        matchedKey = 'goals';
      } else if (qLower.includes('flow') || qLower.includes('start') || qLower.includes('how') || qLower.includes('guide') || qLower.includes('work') || qLower.includes('account')) {
        matchedKey = 'flow';
      } else {
        // Fallback response with navigation options
        const botFallbackMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `Here is what you can do on Lingofy:\n\n- **Listen & Learn**: Play songs with interactive lyrics.\n- **Import Tracks**: Add up to 5 custom songs.\n- **Quizzes**: Practice with 10-question Song drills, Level tests, and Spaced Retention checks.\n\nChoose any category below to learn more!`,
          options: [
            { label: "🚀 Step-by-Step Flow", actionKey: "flow" },
            { label: "🎵 Song Quota & Imports", actionKey: "song_limit" },
            { label: "🎧 Music vs Traditional", actionKey: "modes" },
            { label: "🧠 Retention Flashbacks", actionKey: "retention" }
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
    const info = FAQ_DATABASE[actionKey];
    if (!info) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: actionKey === 'flow' ? "How does Lingofy work?" :
            actionKey === 'song_limit' ? "How many custom songs can I add?" :
            actionKey === 'modes' ? "What is the difference between learning modes?" :
            actionKey === 'levels' ? "What are the quiz levels and difficulty?" :
            actionKey === 'retention' ? "How does memory retention testing work?" :
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
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #20BEFF 0%, #a855f7 100%)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 30px rgba(32, 190, 255, 0.4), 0 0 15px rgba(168, 85, 247, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            position: 'relative'
          }}
          title="Lingofy Assistant & FAQs"
        >
          {isOpen ? <X size={24} /> : <Bot size={26} />}

          {/* Pulse notification indicator */}
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
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              bottom: '90px',
              right: '24px',
              width: '380px',
              maxWidth: 'calc(100vw - 32px)',
              height: '540px',
              maxHeight: 'calc(100vh - 120px)',
              background: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(32, 190, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 9999,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(90deg, rgba(32, 190, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #20BEFF, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <Bot size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Lingofy Guide</span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
                    Instant Help & User Flow Guide
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
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

                    {/* Direct link in response */}
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
                            background: '#20BEFF20',
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
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#20BEFF';
                            e.currentTarget.style.background = 'rgba(32, 190, 255, 0.1)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
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
                placeholder="Ask about songs, limits, levels..."
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
