import { API_BASE } from '../config';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Search, 
  Home, 
  BookOpen, 
  MoreHorizontal, 
  Settings, 
  ChevronRight,
  Globe,
  Music,
  BarChart2,
  LogOut,
  Volume2,
  Menu,
  X,
  ChevronLeft,
  ListMusic,
  Plus,
  Trash2,
  HelpCircle,
  Award,
  Share2,
  Copy,
  Check,
  Bell,
  Headphones,
  Bookmark,
  ChevronDown,
  Sparkles,
  Upload,
  Filter,
  User,
  Target,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Send,
  Languages,
  RefreshCw,
  PlusCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LearningFocusDistribution } from '../components/LearningFocusDistribution';
import NotesHub from '../components/notes/NotesHub';
import { useResizableSidebar } from '../hooks/useResizableSidebar';
import { SongPracticeModal } from '../components/SongPracticeModal';
import { FaqChatbot } from '../components/FaqChatbot';

const SONGS_DATA = [
  { id: 1, title: 'STRUCT', artist: 'UdieNnx', duration: 234, image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop' },
  { id: 2, title: 'En Nuit', artist: 'Videoclub', duration: 221, image: 'https://picsum.photos/seed/1/200' },
  { id: 3, title: 'Black Swan', artist: 'BTS', duration: 198, image: 'https://picsum.photos/seed/2/200' },
  { id: 4, title: 'Parano (ft. DDB)', artist: 'Lomepal', duration: 202, image: 'https://picsum.photos/seed/3/200' },
  { id: 5, title: 'Kokoronashi', artist: 'Chouchou-P', duration: 276, image: 'https://picsum.photos/seed/4/200' },
];

const DashboardPage = () => {
  const {
    sidebarWidth,
    effectiveWidth,
    isSidebarCollapsed,
    isCompact,
    isResizing,
    startResizing,
    toggleSidebar,
    setIsSidebarCollapsed,
  } = useResizableSidebar();

  const [isPlaying, setIsPlaying] = useState(false);
  const [songs, setSongs] = useState<any[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [preferences, setPreferences] = useState<any>(null);
  const [syncOffset, setSyncOffset] = useState<number>(0);
  const [translationLang, setTranslationLang] = useState<'none'|'en'|'hi'|'es'|'ko'>('none');
  const [showInteractiveLyrics, setShowInteractiveLyrics] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<string>('100');
  const [loading, setLoading] = useState(true);
  const [roadmapProgress, setRoadmapProgress] = useState<any>(null);
  const [activeCardLanguage, setActiveCardLanguage] = useState<'hindi' | 'spanish' | 'korean'>('spanish');
  const [segments, setSegments] = useState<any[]>([]);
  const [ytReady, setYtReady] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [modalMode, setModalMode] = useState<'completed' | 'practice'>('practice');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'statistics' | 'library' | 'profile' | 'docs' | 'achievements' | 'notes'>('home');
  const [history, setHistory] = useState<any[]>([]);

  // Notification States
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<any>(null);
  const [hideVideo, setHideVideo] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [heatmapMonthOffset, setHeatmapMonthOffset] = useState(0);

  // Achievements & Session
  const [sessionTime, setSessionTime] = useState(0);
  const [showGoalMetPopup, setShowGoalMetPopup] = useState(false);
  const [showGoalIncompleteToast, setShowGoalIncompleteToast] = useState(false);
  const [hasNotifiedIncomplete, setHasNotifiedIncomplete] = useState(false);
  const [goalAlreadyMet, setGoalAlreadyMet] = useState(false);
  const [shareBadgeModal, setShareBadgeModal] = useState<any>(null);
  const [showCompleteProfilePopup, setShowCompleteProfilePopup] = useState(false);

  // Profile Edit States
  const [profileForm, setProfileForm] = useState({
    name: '',
    nativeLanguage: '',
    learningLanguage: '',
    age: '',
    dailyGoal: '15',
    proficiency: 'beginner',
    mobile: '',
    profession: '',
    about: '',
    knownLanguages: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');

  const learningLanguageKey = useMemo(() => {
    const lang = preferences?.languagesToLearn?.[0]?.toLowerCase() || 'spanish';
    return lang.includes('hindi') ? 'hindi' : lang.includes('spanish') ? 'spanish' : 'korean';
  }, [preferences]);

  // Playlists & Queue States
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [selectedPlaylistLoading, setSelectedPlaylistLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState('');
  const [currentQueue, setCurrentQueue] = useState<any[]>([]);
  const [queueName, setQueueName] = useState('Song Library');

  // Personalized Library & Song Import States
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<any[]>([]);
  const [uploadQuota, setUploadQuota] = useState<{ uploadedCount: number; maxLimit: number; remaining: number; isUnlimited: boolean }>({
    uploadedCount: 0,
    maxLimit: 5,
    remaining: 5,
    isUnlimited: false
  });
  const [librarySubTab, setLibrarySubTab] = useState<'recommended' | 'playlists' | 'explore' | 'uploads'>('recommended');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importForm, setImportForm] = useState({
    title: '',
    artist: '',
    language: 'Spanish',
    url: '',
    lyrics: ''
  });
  const [songSuggestions, setSongSuggestions] = useState<any[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [previewLines, setPreviewLines] = useState<string[]>([]);
  const [savedSongId, setSavedSongId] = useState<string | null>(null);
  const [savedSongObj, setSavedSongObj] = useState<any | null>(null);
  const [translations, setTranslations] = useState<{ hindi?: any[]; spanish?: any[]; korean?: any[]; english?: any[] } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatusText, setImportStatusText] = useState('');
  const [addToPlaylistModalSong, setAddToPlaylistModalSong] = useState<any>(null);
  const [communityLanguageFilter, setCommunityLanguageFilter] = useState<'all' | 'spanish' | 'hindi' | 'korean' | 'english'>('all');

  const navigate = useNavigate();
  const location = useLocation();

  const currentSong = currentQueue[currentSongIndex] || { title: 'No Songs', artist: 'Add some songs in admin', durationSeconds: 0, audioUrl: '', image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop' };

  // Get YouTube ID from URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = useMemo(() => getYouTubeId(currentSong.audioUrl), [currentSong.audioUrl]);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        
        // Fetch User
        const userRes = await fetch(`${API_BASE}/api/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData);
          setProfileForm({
            name: userData.name || '',
            nativeLanguage: userData.nativeLanguage || '',
            learningLanguage: userData.learningLanguage || '',
            age: userData.age ? userData.age.toString() : '',
            dailyGoal: userData.dailyGoal ? userData.dailyGoal.toString() : '15',
            proficiency: userData.proficiency || 'beginner',
            mobile: userData.mobile || '',
            profession: userData.profession || '',
            about: userData.about || '',
            knownLanguages: userData.knownLanguages ? userData.knownLanguages.join(', ') : ''
          });
          
          // Check if profile is incomplete (only show once per login session / first time signup)
          const profilePromptKey = `profilePromptDismissed_${userData._id || userData.email || 'user'}`;
          const alreadyPrompted = sessionStorage.getItem(profilePromptKey);
          if (!userData.learningLanguage && !alreadyPrompted) {
            setShowCompleteProfilePopup(true);
            sessionStorage.setItem(profilePromptKey, 'true');
          }

          // If they are in traditional mode and currently on 'home' or 'library', redirect to statistics (as dashboard doesn't have lessons inside it)
          if (userData.learningMode === 'traditional') {
            setActiveTab('statistics'); // Or we just don't show the dashboard at all? Actually statistics is fine.
          }
        }

        // Fetch Preferences
        const prefRes = await fetch(`${API_BASE}/api/preferences`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (prefRes.ok) {
          const data = await prefRes.json();
          setPreferences(data);
        } else if (prefRes.status === 401) { navigate('/login'); }

        // Fetch Songs
        const songRes = await fetch(`${API_BASE}/api/admin`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (songRes.ok) {
          const data = await songRes.json();
          setSongs(data);
          setCurrentQueue(data);
        }

        // Fetch Roadmap Progress
        const progRes = await fetch(`${API_BASE}/api/lessons/progress`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (progRes.ok) {
          const data = await progRes.json();
          setRoadmapProgress(data);
        }
        // Fetch Notifications
        const notifRes = await fetch(`${API_BASE}/api/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (notifRes.ok) {
          const data = await notifRes.json();
          setNotifications(data);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    // Session Timer logic & Goal notifications
    const timer = setInterval(() => {
      setSessionTime(prev => {
        const newTime = prev + 1;
        const goalMinutes = parseInt(profileForm.dailyGoal || '15');
        const goalSeconds = goalMinutes * 60;

        // 1. Goal Completed Trigger
        if (profileForm.dailyGoal && !goalAlreadyMet && newTime >= goalSeconds) {
          setShowGoalMetPopup(true);
          setGoalAlreadyMet(true);
          setShowGoalIncompleteToast(false);
          setTimeout(() => setShowGoalMetPopup(false), 5000);

          // Save goal completed notification to backend
          const token = localStorage.getItem('token');
          if (token) {
            fetch(`${API_BASE}/api/notifications/goal-status`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({
                title: 'Daily Goal Completed',
                message: `Congratulations! You achieved your ${goalMinutes} minutes daily learning goal today. Keep up the streak!`,
                type: 'goal_completed'
              })
            }).then(res => res.json()).then(data => {
              if (data.notification) {
                setNotifications(nPrev => [data.notification, ...nPrev.filter((n: any) => n._id !== data.notification._id)]);
              }
            }).catch(console.error);
          }
        }

        // 2. Goal Incomplete Reminder Trigger (after 45s of active session if goal is pending)
        if (newTime === 45 && !goalAlreadyMet && !hasNotifiedIncomplete) {
          setHasNotifiedIncomplete(true);
          setShowGoalIncompleteToast(true);
          setTimeout(() => setShowGoalIncompleteToast(false), 6000);

          // Save goal incomplete notification reminder to backend
          const token = localStorage.getItem('token');
          if (token) {
            fetch(`${API_BASE}/api/notifications/goal-status`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({
                title: 'Daily Goal Incomplete',
                message: `You haven't completed your ${goalMinutes} minutes learning goal today. ${Math.max(1, goalMinutes - Math.floor(newTime / 60))}m remaining!`,
                type: 'goal_pending'
              })
            }).then(res => res.json()).then(data => {
              if (data.notification) {
                setNotifications(nPrev => [data.notification, ...nPrev.filter((n: any) => n._id !== data.notification._id)]);
              }
            }).catch(console.error);
          }
        }

        return newTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [profileForm.dailyGoal, goalAlreadyMet, hasNotifiedIncomplete]);

  useEffect(() => {
    if (learningLanguageKey) {
      setActiveCardLanguage(learningLanguageKey);
    }
  }, [learningLanguageKey]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab') as 'home' | 'statistics' | 'library' | 'profile' | 'docs' | 'achievements' | 'notes';
    if (currentUser?.learningMode === 'traditional' && (!tabParam || tabParam === 'home' || tabParam === 'library')) {
      setActiveTab('statistics');
    } else if (tabParam && ['home', 'statistics', 'library', 'profile', 'docs', 'achievements', 'notes'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search, currentUser]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/lessons/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleMarkNotificationAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'statistics') {
      fetchHistory();
    }
    if (activeTab === 'library' || activeTab === 'home') {
      fetchPlaylists();
    }
  }, [activeTab]);

  const handleReviewAttempt = async (attemptId: string) => {
    setReviewLoading(true);
    setShowReviewModal(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/lessons/history/${attemptId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedAttempt(data);
      }
    } catch (err) {
      console.error("Error fetching attempt details:", err);
    } finally {
      setReviewLoading(false);
    }
  };

  const toggleLearningMode = async () => {
    if (!currentUser) return;
    const newMode = currentUser.learningMode === 'music' ? 'traditional' : 'music';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/users/me/mode`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser({ ...currentUser, learningMode: data.mode });
        if (data.mode === 'traditional' && (activeTab === 'home' || activeTab === 'library')) {
          setActiveTab('statistics');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/users/me/profile`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name,
          nativeLanguage: profileForm.nativeLanguage,
          learningLanguage: profileForm.learningLanguage,
          age: profileForm.age ? parseInt(profileForm.age) : undefined,
          dailyGoal: profileForm.dailyGoal ? parseInt(profileForm.dailyGoal) : undefined,
          proficiency: profileForm.proficiency,
          mobile: profileForm.mobile,
          profession: profileForm.profession,
          about: profileForm.about,
          knownLanguages: profileForm.knownLanguages.split(',').map((l: string) => l.trim()).filter((l: string) => l !== '')
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        if (data.user) {
          sessionStorage.setItem(`profilePromptDismissed_${data.user._id || data.user.email || 'user'}`, 'true');
        }
        setShowCompleteProfilePopup(false);
        setProfileSuccessMessage('Profile updated successfully!');
        setTimeout(() => setProfileSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };


  // Chart data calculations
  const chartData = useMemo(() => {
    return [...history].slice(0, 7).reverse().map((attempt, index) => ({
      index,
      label: new Date(attempt.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: attempt.score,
      xp: attempt.xpEarned,
    }));
  }, [history]);

  const width = 500;
  const height = 250;
  const xPadding = 50;
  const yPadding = 40;
  const plotWidth = width - 2 * xPadding;
  const plotHeight = height - 2 * yPadding;

  const validScores = chartData.map(d => Number(d.score) || 0);
  const maxAxisScore = chartData.length > 0 && Math.max(...validScores) > 12 ? 20 : 12;
  const gridSteps = maxAxisScore === 20 ? [0, 5, 10, 15, 20] : [0, 3, 6, 9, 12];

  const points = chartData.map((d, i) => {
    const x = xPadding + (chartData.length > 1 ? (i * plotWidth / (chartData.length - 1)) : plotWidth / 2);
    const y = height - yPadding - ((Number(d.score) || 0) * plotHeight / maxAxisScore); // Dynamic max with fallback
    return { x, y, score: Number(d.score) || 0, label: d.label, xp: d.xp };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPath = points.length > 0 
    ? `M ${points[0].x} ${height - yPadding} ` + points.map(p => `L ${p.x} ${p.y}`).join(' ') + ` L ${points[points.length - 1].x} ${height - yPadding} Z`
    : '';

  useEffect(() => {
    if (currentSong?._id) {
      setSyncOffset(0); // Reset sync for new song
      
      const songLang = currentSong.language?.toLowerCase() || '';
      const userLearnLang = (currentUser?.learningLanguage || preferences?.languagesToLearn?.[0] || '').toLowerCase();
      
      if (songLang === 'korean') {
        setTranslationLang(userLearnLang.includes('hindi') ? 'hi' : userLearnLang.includes('spanish') ? 'es' : 'en');
      } else if (userLearnLang.includes('korean')) {
        setTranslationLang('ko');
      } else if (userLearnLang.includes('spanish')) {
        setTranslationLang('es');
      } else if (userLearnLang.includes('hindi')) {
        setTranslationLang('hi');
      } else if (songLang !== 'english' && songLang !== '') {
        setTranslationLang('en');
      } else {
        setTranslationLang('ko');
      }

      const fetchSegments = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/api/admin/segments/${currentSong._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setSegments(data);
          }

          // If currentSong translations are missing or empty, fetch latest song data
          if (!currentSong.translations || !currentSong.translations.english || !currentSong.translations.hindi) {
            const songsRes = await fetch(`${API_BASE}/api/admin`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (songsRes.ok) {
              const allSongsData = await songsRes.json();
              const found = allSongsData.find((s: any) => s._id === currentSong._id);
              if (found && found.translations) {
                setCurrentQueue(prev => prev.map((item, idx) => idx === currentSongIndex ? { ...item, translations: found.translations } : item));
              }
            }
          }
        } catch (err) { console.error(err); }
      };
      fetchSegments();
    }
  }, [currentSong, currentUser, preferences]);

  // Adjusted timing calculation to keep lyrics highlighted during instrumental gaps
  let activeIndex = -1;
  const time = currentTime + syncOffset;
  for (let i = 0; i < segments.length; i++) {
    if (time >= segments[i].startTime) {
      activeIndex = i;
    } else {
      break;
    }
  }

  useEffect(() => {
    if (activeIndex !== -1) {
      const el = document.getElementById(`line-${activeIndex}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex]);



  // Load YouTube API
  useEffect(() => {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } else {
      setYtReady(true);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      console.log("YT API Ready");
      setYtReady(true);
    };
  }, []);

  // Initialize/Update Player
  useEffect(() => {
    // DO NOT initialize the player if the page is still loading, 
    // because the <div id="youtube-player"> does not exist in the DOM yet!
    if (loading) return;

    if (videoId && ytReady && (window as any).YT && (window as any).YT.Player) {
      const container = document.getElementById('youtube-player');
      if (!container) return; // Guard: ensure DOM element actually exists

      const isIframe = container.tagName === 'IFRAME';
      
      if (playerRef.current && isIframe) {
        if (playerRef.current._isReady) {
          if (isPlaying && typeof playerRef.current.loadVideoById === 'function') {
            playerRef.current.loadVideoById(videoId);
          } else if (typeof playerRef.current.cueVideoById === 'function') {
            playerRef.current.cueVideoById(videoId);
          }
        }
      } else {
        // Cleanup orphaned player instance (e.g. from StrictMode remount or phantom creation)
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          try { playerRef.current.destroy(); } catch (e) {}
        }
        
        playerRef.current = new (window as any).YT.Player('youtube-player', {
          height: '100%',
          width: '100%',
          videoId: videoId || '',
          playerVars: { 'autoplay': 0, 'controls': 0, 'mute': 0, 'enablejsapi': 1 },
          events: {
            'onStateChange': (event: any) => {
              if (event.data === (window as any).YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (event.data === (window as any).YT.PlayerState.ENDED || event.data === 0) {
                setIsPlaying(false);
                setModalMode('completed');
                setShowQuizModal(true);
              }
            },
            'onReady': (event: any) => {
              console.log("Player Ready");
              playerRef.current._isReady = true;
              if (videoId && event.target) {
                if (isPlaying && typeof event.target.loadVideoById === 'function') {
                  event.target.loadVideoById(videoId);
                } else if (typeof event.target.cueVideoById === 'function') {
                  event.target.cueVideoById(videoId);
                }
              }
            }
          }
        });
      }
    }
  }, [videoId, ytReady, loading]);

  // Sync currentTime with actual YouTube player
  useEffect(() => {
    let interval: any;
    if (isPlaying && playerRef.current && playerRef.current.getCurrentTime) {
      interval = setInterval(() => {
        try {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
        } catch (e) { console.error("Sync error", e); }
      }, 50); // 50ms for ultra-smooth sync like Spotify
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayPause = () => {
    console.log("handlePlayPause clicked, playerRef.current:", playerRef.current);
    if (!playerRef.current || typeof playerRef.current.playVideo !== 'function') {
      console.log("Player not ready yet...");
      return;
    }
    
    const state = playerRef.current.getPlayerState();
    console.log("Current player state:", state);
    if (isPlaying) {
      console.log("Pausing video...");
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      console.log("Playing video...");
      // FIX: If the player is stuck in UNSTARTED (-1) or CUED (5) on initial load, playVideo() often fails silently. 
      // Forcefully loading the video by ID guarantees playback starts, satisfying the initial-click requirement.
      if ((state === -1 || state === 5) && videoId) {
        console.log("Player was unstarted/cued. Explicitly loading video:", videoId);
        playerRef.current.loadVideoById(videoId);
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(true);
    }
  };
  
  const handleNext = () => {
    setCurrentSongIndex((prev) => (prev + 1) % (currentQueue.length || 1));
    setCurrentTime(0);
    setHideVideo(false);
    if (playerRef.current?.stopVideo) playerRef.current.stopVideo();
  };

  const handlePrev = () => {
    setCurrentSongIndex((prev) => (prev - 1 + (currentQueue.length || 1)) % (currentQueue.length || 1));
    setCurrentTime(0);
    setHideVideo(false);
    if (playerRef.current?.stopVideo) playerRef.current.stopVideo();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };



  const renderStatistics = () => {
    // Calculate overview stats
    const totalQuizzes = history.length;
    const totalXp = history.reduce((acc, curr) => acc + (curr.xpEarned || 0), 0);
    const avgScore = totalQuizzes > 0 
      ? (history.reduce((acc, curr) => acc + curr.score, 0) / totalQuizzes).toFixed(1) 
      : '0.0';

    return (
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Your Learning Analytics</h1>
          <p style={{ opacity: 0.6, margin: 0 }}>Review your performance, track your score trends, and inspect your past quiz attempts.</p>
        </div>

        {/* Overview Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '24px', textAlign: 'center' }}>
            <div style={{ opacity: 0.5, fontSize: '13px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px' }}>Quizzes Attempted</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#20BEFF' }}>{totalQuizzes}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '24px', textAlign: 'center' }}>
            <div style={{ opacity: 0.5, fontSize: '13px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px' }}>Average Score</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#a855f7' }}>{avgScore}<span style={{ fontSize: '16px', opacity: 0.5 }}>/12</span></div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '24px', textAlign: 'center' }}>
            <div style={{ opacity: 0.5, fontSize: '13px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px' }}>Total XP Earned</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#eab308' }}>{totalXp} XP</div>
          </div>
        </div>

        {/* Streak Heatmap */}
        {(() => {
          const targetDate = new Date();
          targetDate.setMonth(targetDate.getMonth() - heatmapMonthOffset);
          
          const year = targetDate.getFullYear();
          const month = targetDate.getMonth();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          
          const heatmapDays = [];
          for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            
            const dayAttempts = history.filter(a => {
              const attemptDate = new Date(a.completedAt);
              const aStr = attemptDate.getFullYear() + '-' + String(attemptDate.getMonth() + 1).padStart(2, '0') + '-' + String(attemptDate.getDate()).padStart(2, '0');
              return aStr === dateStr;
            });
            const count = dayAttempts.length;
            const intensity = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3;
            heatmapDays.push({ date: d, intensity, count, dateStr });
          }

          const getColor = (intensity: number) => {
            if (intensity === 0) return 'rgba(255,255,255,0.05)';
            if (intensity === 1) return 'rgba(32, 190, 255, 0.4)';
            if (intensity === 2) return 'rgba(32, 190, 255, 0.7)';
            return 'rgba(32, 190, 255, 1)';
          };
          
          const monthName = targetDate.toLocaleString('default', { month: 'long', year: 'numeric' });

          return (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Activity Streak</h3>
                  <p style={{ opacity: 0.5, fontSize: '13px', margin: 0 }}>Your activity for {monthName}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  {/* Month filter controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
                    <button 
                      onClick={() => setHeatmapMonthOffset(prev => prev + 1)}
                      style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px' }}
                      className="btn-hover"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '100px', textAlign: 'center' }}>{monthName}</span>
                    <button 
                      onClick={() => setHeatmapMonthOffset(prev => Math.max(0, prev - 1))}
                      disabled={heatmapMonthOffset === 0}
                      style={{ background: 'transparent', border: 'none', color: heatmapMonthOffset === 0 ? 'rgba(255,255,255,0.2)' : '#fff', cursor: heatmapMonthOffset === 0 ? 'not-allowed' : 'pointer', padding: '4px 8px', borderRadius: '8px' }}
                      className="btn-hover"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', opacity: 0.6 }}>
                    <span>Less</span>
                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: getColor(0) }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: getColor(1) }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: getColor(2) }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: getColor(3) }} />
                    <span>More</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {heatmapDays.map((day, i) => (
                  <div 
                    key={i} 
                    title={`${day.dateStr}: ${day.count} activities`}
                    style={{ 
                      width: '28px', height: '28px', borderRadius: '6px', 
                      background: getColor(day.intensity),
                      border: day.intensity === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      transition: 'transform 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ))}
              </div>
            </div>
          );
        })()}
        <LearningFocusDistribution history={history} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px' }} className="content-grid-desktop">
          {/* Performance Chart Card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', position: 'relative' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Score Trends (Last 7 Quizzes)</h3>
            
            {points.length === 0 ? (
              <div style={{ height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                <BarChart2 size={40} style={{ marginBottom: '12px' }} />
                <p>Complete a lesson or quiz to see your progress chart!</p>
              </div>
            ) : (
              <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
                <svg width="100%" height="250" viewBox="0 0 500 250" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#20BEFF" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#20BEFF" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  {gridSteps.map(scoreVal => {
                    const yVal = height - yPadding - (scoreVal * plotHeight / maxAxisScore);
                    return (
                      <g key={scoreVal}>
                        <line x1={xPadding} y1={yVal} x2={width - xPadding} y2={yVal} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                        <text x={xPadding - 10} y={yVal + 4} fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="end">{scoreVal}</text>
                      </g>
                    );
                  })}

                  {/* X Axis Date Labels */}
                  {points.map((p, i) => (
                    <text key={i} x={p.x} y={height - yPadding + 20} fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="middle">{p.label}</text>
                  ))}

                  {/* Shaded Area Below Line */}
                  <path d={areaPath} fill="url(#chart-glow)" />

                  {/* Line Chart */}
                  <polyline points={polylinePoints} fill="none" stroke="#20BEFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px rgba(32, 190, 255, 0.4))' }} />

                  {/* Circular Markers */}
                  {points.map((p, i) => (
                    <circle 
                      key={i} 
                      cx={p.x} 
                      cy={p.y} 
                      r="6" 
                      fill="#000" 
                      stroke="#20BEFF" 
                      strokeWidth="3" 
                      cursor="pointer"
                      style={{ transition: 'r 0.2s' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.setAttribute('r', '8');
                        setActiveTooltip(p);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.setAttribute('r', '6');
                        setActiveTooltip(null);
                      }}
                    />
                  ))}
                </svg>

                {/* Floating Tooltip */}
                {activeTooltip && (
                  <div style={{
                    position: 'absolute',
                    left: `${(activeTooltip.x / 500) * 100}%`,
                    top: `${(activeTooltip.y / 250) * 100 - 25}%`,
                    transform: 'translate(-50%, -100%)',
                    background: '#20BEFF',
                    color: '#000',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                    zIndex: 100
                  }}>
                    Score: {activeTooltip.score} | {activeTooltip.xp} XP
                  </div>
                )}
              </div>
            )}
          </div>

          {/* History List Card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Quiz History</h3>
              <span style={{ fontSize: '13px', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '100px', color: '#fff' }}>Total: {history.length}</span>
            </div>
            
            {historyLoading ? (
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div>Loading history...</div>
              </div>
            ) : history.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                <BookOpen size={40} style={{ marginBottom: '12px' }} />
                <p>No quiz history found yet.</p>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '250px', paddingRight: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {history.map((attempt) => (
                    <div key={attempt._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', padding: '12px 16px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                          {attempt.level === 'focus' ? 'Focus: Grammar/Vocab' : attempt.level === 'pronunciation' ? 'Pronunciation Practice' : attempt.level === 'dynamic' ? 'Song Practice' : 'Lesson'} • {attempt.language}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '2px' }}>
                          {new Date(attempt.completedAt).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#20BEFF' }}>{attempt.score} Correct</div>
                          <div style={{ fontSize: '11px', color: '#eab308', fontWeight: 'bold' }}>+{attempt.xpEarned} XP</div>
                        </div>
                        <button 
                          onClick={() => handleReviewAttempt(attempt._id)}
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          className="btn-hover"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const fetchPlaylists = async () => {
    setPlaylistsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      const res = await fetch(`${API_BASE}/api/playlists`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) { navigate('/login'); return; }
      if (res.ok) {
        const data = await res.json();
        console.log('[Playlists] fetched:', data.length, 'playlists');
        setPlaylists(data);
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('[Playlists] fetch failed:', res.status, err.message);
      }
    } catch (err) {
      console.error('[Playlists] network error:', err);
    } finally {
      setPlaylistsLoading(false);
    }
  };

  const fetchPlaylistDetails = async (playlistId: string) => {
    setSelectedPlaylistLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/playlists/${playlistId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedPlaylist(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSelectedPlaylistLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/playlists`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newPlaylistTitle })
      });
      if (res.ok) {
        const data = await res.json();
        setPlaylists(prev => [data, ...prev]);
        setNewPlaylistTitle('');
        setShowCreateModal(false);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to create playlist');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPlaylists(prev => prev.filter(p => p._id !== playlistId));
        setSelectedPlaylist(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSongToPlaylist = async (songId: string) => {
    if (!selectedPlaylist) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/playlists/${selectedPlaylist.playlist._id}/songs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ songId })
      });
      if (res.ok) {
        fetchPlaylistDetails(selectedPlaylist.playlist._id);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to add song to playlist');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveSongFromPlaylist = async (songId: string) => {
    if (!selectedPlaylist) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/playlists/${selectedPlaylist.playlist._id}/songs/${songId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPlaylistDetails(selectedPlaylist.playlist._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecommendationsAndQuota = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/admin/recommendations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPersonalizedRecommendations(data.recommendations || []);
        if (data.quota) setUploadQuota(data.quota);
        if (data.allSongs && data.allSongs.length > 0) {
          setSongs(data.allSongs);
        }
      }
    } catch (err) {
      console.error("Error fetching recommendations & quota:", err);
    }
  };

  const handlePlaySingleSong = (song: any) => {
    setCurrentQueue([song]);
    setQueueName(song.title);
    setCurrentSongIndex(0);
    setCurrentTime(0);
    setIsPlaying(true);
    setHideVideo(false);
    setShowInteractiveLyrics(true);
  };

  const handleQuickAddSongToPlaylist = async (songId: string, playlistId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ songId })
      });
      if (res.ok) {
        alert("✓ Song added to your playlist!");
        setAddToPlaylistModalSong(null);
        fetchPlaylists();
        if (selectedPlaylist?.playlist?._id === playlistId) {
          fetchPlaylistDetails(playlistId);
        }
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to add song to playlist');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenImportModal = () => {
    setShowImportModal(true);
    fetchSongSuggestions();
  };

  const fetchSongSuggestions = async () => {
    setSuggestionsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/song-suggestions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSongSuggestions(data);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleSaveImportSong = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!importForm.title.trim() || !importForm.artist.trim() || !importForm.url.trim()) {
      alert("Please fill in the song title, artist name, and audio/YouTube URL.");
      return;
    }
    setIsImporting(true);
    setImportStatusText("Fetching YouTube transcript & processing lyrics...");
    try {
      const token = localStorage.getItem('token');
      const lines = previewLines.length > 0 
        ? previewLines 
        : (importForm.lyrics.trim() ? importForm.lyrics.split('\n').map(l => l.trim()).filter(l => l.length > 0) : []);

      const res = await fetch(`${API_BASE}/api/admin/song`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: importForm.title.trim(),
          artistName: importForm.artist.trim(),
          language: importForm.language,
          audioUrl: importForm.url.trim(),
          youtubeUrl: importForm.url.trim(),
          lyrics: lines
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSavedSongId(data.song?._id || null);
        setSavedSongObj(data.song || null);
        if (data.song?.translations) {
          setTranslations(data.song.translations);
        }

        if (data.fetchedSegments > 0 && data.segments) {
          const segLines = data.segments.map((s: any) => s.text);
          setPreviewLines(segLines);
          setImportForm(prev => ({ ...prev, lyrics: segLines.join('\n') }));
        }

        fetchRecommendationsAndQuota();
        fetchPlaylists();

        if (data.isExisting) {
          alert(`✨ ${data.message}`);
        } else {
          setImportStatusText(`✓ Song saved! Auto-extracted ${data.fetchedSegments || 0} lyric segments.`);
        }
      } else {
        alert(data.message || "Failed to save song");
      }
    } catch (err: any) {
      console.error(err);
      alert("Network error while saving song.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleTranslateSong = async () => {
    if (!savedSongId) return;
    setIsTranslating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/translate/${savedSongId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && (data.hindi?.length > 0 || data.spanish?.length > 0 || data.korean?.length > 0 || data.english?.length > 0)) {
        setTranslations(data);
        const lines = importForm.lyrics.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 0) setPreviewLines(lines);
        alert("✨ 4-Language AI translation complete! Preview updated below.");
      } else {
        alert(data.message || "Translation completed with empty results.");
      }
    } catch (err: any) {
      console.error("Translation Error:", err);
      alert("Translation failed: " + (err.message || 'Error'));
    } finally {
      setIsTranslating(false);
    }
  };

  const handleResetImportModal = () => {
    setImportForm({
      title: '',
      artist: '',
      language: 'Spanish',
      url: '',
      lyrics: ''
    });
    setPreviewLines([]);
    setSavedSongId(null);
    setSavedSongObj(null);
    setTranslations(null);
    setImportStatusText('');
  };

  const handlePlayPlaylist = (playlistSongs: any[], playlistTitle: string) => {
    if (playlistSongs.length === 0) {
      alert("This playlist has no songs yet. Add some songs first!");
      return;
    }
    setCurrentQueue(playlistSongs);
    setQueueName(playlistTitle);
    setCurrentSongIndex(0);
    setCurrentTime(0);
    setIsPlaying(true);
    setHideVideo(false);
  };

  const handlePlaySongFromPlaylist = (playlistSongs: any[], playlistTitle: string, index: number) => {
    setCurrentQueue(playlistSongs);
    setQueueName(playlistTitle);
    setCurrentSongIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
    setHideVideo(false);
  };

  useEffect(() => {
    if (activeTab === 'library') {
      fetchPlaylists();
      fetchRecommendationsAndQuota();
      setSelectedPlaylist(null);
    }
  }, [activeTab]);

  const renderLibrary = () => {
    // Filter community songs by search and language
    const filteredSongs = songs.filter(s => {
      const matchesSearch = playlistSearchQuery.trim() === "" || 
        s.title.toLowerCase().includes(playlistSearchQuery.toLowerCase()) || 
        s.artistName.toLowerCase().includes(playlistSearchQuery.toLowerCase());
      
      const matchesLang = communityLanguageFilter === 'all' || 
        (s.language && s.language.toLowerCase() === communityLanguageFilter);

      return matchesSearch && matchesLang;
    });

    const userUploadedSongs = songs.filter(s => s.uploadedBy === currentUser?._id || s.isUserUploaded);

    return (
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        
        {/* Top Header */}
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>Music Library</h1>
            <p style={{ opacity: 0.65, fontSize: '14px', margin: 0 }}>
              Discover personalized recommendations, manage playlists, and import custom tracks.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Quota Badge */}
            <div 
              title="You can add unlimited community songs to your playlists. Custom song imports are capped at 5 slots to preserve storage."
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '14px',
                background: 'rgba(32, 190, 255, 0.08)',
                border: '1px solid rgba(32, 190, 255, 0.25)',
                color: '#20BEFF',
                fontSize: '12px',
                fontWeight: '700'
              }}
            >
              <Upload size={14} />
              <span>Custom Imports: {uploadQuota.uploadedCount} / {uploadQuota.isUnlimited ? '∞' : uploadQuota.maxLimit}</span>
            </div>

            {/* Import Song Button */}
            <button 
              onClick={handleOpenImportModal}
              className="btn-hover"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '14px',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(168, 85, 247, 0.3)'
              }}
            >
              <Sparkles size={15} /> Import New Song
            </button>

            {/* Create Playlist Button */}
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-hover"
              style={{
                background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)',
                color: '#000',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '14px',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(32, 190, 255, 0.3)'
              }}
            >
              <Plus size={15} /> Create Playlist
            </button>
          </div>
        </div>

        {/* Sub-Tabs Bar */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          background: 'rgba(255,255,255,0.03)', 
          padding: '6px', 
          borderRadius: '16px', 
          border: '1px solid rgba(255,255,255,0.05)',
          marginBottom: '32px',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setLibrarySubTab('recommended')}
            style={{
              flex: 1,
              minWidth: '170px',
              padding: '10px 16px',
              borderRadius: '12px',
              border: 'none',
              background: librarySubTab === 'recommended' ? '#20BEFF' : 'transparent',
              color: librarySubTab === 'recommended' ? '#000' : '#fff',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Sparkles size={15} /> Recommended For You
            {personalizedRecommendations.length > 0 && (
              <span style={{ 
                background: librarySubTab === 'recommended' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)', 
                padding: '2px 8px', borderRadius: '10px', fontSize: '11px' 
              }}>
                {personalizedRecommendations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setLibrarySubTab('playlists')}
            style={{
              flex: 1,
              minWidth: '150px',
              padding: '10px 16px',
              borderRadius: '12px',
              border: 'none',
              background: librarySubTab === 'playlists' ? '#20BEFF' : 'transparent',
              color: librarySubTab === 'playlists' ? '#000' : '#fff',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <ListMusic size={15} /> My Playlists
            <span style={{ 
              background: librarySubTab === 'playlists' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)', 
              padding: '2px 8px', borderRadius: '10px', fontSize: '11px' 
            }}>
              {playlists.length}
            </span>
          </button>

          <button
            onClick={() => setLibrarySubTab('explore')}
            style={{
              flex: 1,
              minWidth: '160px',
              padding: '10px 16px',
              borderRadius: '12px',
              border: 'none',
              background: librarySubTab === 'explore' ? '#20BEFF' : 'transparent',
              color: librarySubTab === 'explore' ? '#000' : '#fff',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Globe size={15} /> Community Songs
            <span style={{ 
              background: librarySubTab === 'explore' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)', 
              padding: '2px 8px', borderRadius: '10px', fontSize: '11px' 
            }}>
              {songs.length}
            </span>
          </button>

          <button
            onClick={() => setLibrarySubTab('uploads')}
            style={{
              flex: 1,
              minWidth: '160px',
              padding: '10px 16px',
              borderRadius: '12px',
              border: 'none',
              background: librarySubTab === 'uploads' ? '#20BEFF' : 'transparent',
              color: librarySubTab === 'uploads' ? '#000' : '#fff',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Upload size={15} /> My Custom Imports
            <span style={{ 
              background: librarySubTab === 'uploads' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)', 
              padding: '2px 8px', borderRadius: '10px', fontSize: '11px' 
            }}>
              {uploadQuota.uploadedCount}/5
            </span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* SUBTAB 1: RECOMMENDED FOR YOU                             */}
        {/* ========================================================= */}
        {librarySubTab === 'recommended' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Tailored to Your Onboarding Preferences</h3>
                <p style={{ fontSize: '13px', opacity: 0.6, margin: 0 }}>
                  Curated songs matching your target language ({currentUser?.learningLanguage || 'Spanish'}) and favorite artists.
                </p>
              </div>
              <button
                onClick={fetchRecommendationsAndQuota}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', cursor: 'pointer' }}
                className="btn-hover"
              >
                ↻ Refresh Suggestions
              </button>
            </div>

            {personalizedRecommendations.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
                <Music size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
                <p style={{ opacity: 0.6 }}>No personalized recommendations yet. Explore community songs below or import your favorite song!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {personalizedRecommendations.map((song) => {
                  const isCurrentPlaying = currentSong._id === song._id;
                  const langFlag = song.language?.toLowerCase() === 'spanish' ? '🇪🇸' : song.language?.toLowerCase() === 'hindi' ? '🇮🇳' : song.language?.toLowerCase() === 'korean' ? '🇰🇷' : '🇬🇧';

                  return (
                    <div
                      key={`rec-${song._id}`}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: isCurrentPlaying ? '1px solid #20BEFF' : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '20px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '16px',
                        transition: 'all 0.25s',
                        boxShadow: isCurrentPlaying ? '0 0 25px rgba(32, 190, 255, 0.2)' : 'none'
                      }}
                      className="btn-hover"
                    >
                      <div style={{ display: 'flex', gap: '14px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: '#333', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                          <img src={song.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop'} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', borderRadius: '4px', fontSize: '10px', padding: '1px 4px' }}>
                            {langFlag}
                          </div>
                        </div>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isCurrentPlaying ? '#20BEFF' : '#fff' }}>
                            {song.title}
                          </div>
                          <div style={{ fontSize: '13px', opacity: 0.6, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {song.artistName}
                          </div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(32, 190, 255, 0.1)', color: '#20BEFF', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', marginTop: '6px' }}>
                            <Sparkles size={10} /> {song.language} Match
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px' }}>
                        <button
                          onClick={() => handlePlaySingleSong(song)}
                          style={{
                            flex: 1,
                            padding: '9px 12px',
                            borderRadius: '10px',
                            border: 'none',
                            background: isCurrentPlaying && isPlaying ? '#20BEFF' : 'rgba(255,255,255,0.08)',
                            color: isCurrentPlaying && isPlaying ? '#000' : '#fff',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                          className="btn-hover"
                        >
                          <Play size={13} fill={isCurrentPlaying && isPlaying ? '#000' : '#fff'} />
                          {isCurrentPlaying && isPlaying ? 'Playing' : 'Play Now'}
                        </button>

                        <button
                          onClick={() => setAddToPlaylistModalSong(song)}
                          style={{
                            padding: '9px 12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'transparent',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          className="btn-hover"
                          title="Add to custom playlist"
                        >
                          <Plus size={14} /> Playlist
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBTAB 2: MY PLAYLISTS                                    */}
        {/* ========================================================= */}
        {librarySubTab === 'playlists' && (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '32px', alignItems: 'start' }} className="content-grid-desktop">
            {/* Playlists Sidebar */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ListMusic size={18} color="#20BEFF" /> Playlists ({playlists.length})
                </h3>
              </div>

              {playlistsLoading ? (
                <div style={{ padding: '40px 0', textAlign: 'center', opacity: 0.5 }}>Loading playlists...</div>
              ) : playlists.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', opacity: 0.4 }}>
                  <p style={{ fontSize: '14px', marginBottom: '16px' }}>No playlists created yet.</p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Create Your First
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
                  {playlists.map((playlist) => {
                    const isSelected = selectedPlaylist?.playlist?._id === playlist._id;
                    const isCurrentlyPlaying = queueName === playlist.title;

                    return (
                      <div 
                        key={playlist._id} 
                        onClick={() => fetchPlaylistDetails(playlist._id)}
                        className="btn-hover"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px',
                          borderRadius: '16px',
                          background: isSelected ? 'rgba(32, 190, 255, 0.08)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isSelected ? '#20BEFF' : 'rgba(255,255,255,0.04)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '10px', 
                            background: isSelected ? 'rgba(32, 190, 255, 0.15)' : 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isSelected ? '#20BEFF' : '#fff'
                          }}>
                            <Music size={18} />
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: isSelected ? '#20BEFF' : '#fff' }}>
                              {playlist.title}
                            </div>
                            <div style={{ fontSize: '11px', opacity: 0.4, marginTop: '2px' }}>
                              {isCurrentlyPlaying ? 'Currently Playing' : `${playlist.songsCount || 0} songs`}
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} opacity={isSelected ? 1 : 0.4} color={isSelected ? '#20BEFF' : '#fff'} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Playlist Detail Panel */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', minHeight: '400px' }}>
              {selectedPlaylistLoading ? (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                  Loading playlist details...
                </div>
              ) : selectedPlaylist ? (
                <div>
                  {/* Playlist Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px', marginBottom: '24px' }}>
                    <div>
                      <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{selectedPlaylist.playlist.title}</h2>
                      <p style={{ opacity: 0.5, fontSize: '13px', margin: '4px 0 0 0' }}>
                        {selectedPlaylist.songs.length} {selectedPlaylist.songs.length === 1 ? 'song' : 'songs'} in this playlist
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        onClick={() => handlePlayPlaylist(selectedPlaylist.songs, selectedPlaylist.playlist.title)}
                        className="btn-hover"
                        style={{
                          background: '#20BEFF',
                          color: '#000',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '12px',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Play size={14} fill="#000" /> Play Playlist
                      </button>
                      <button 
                        onClick={() => handleDeletePlaylist(selectedPlaylist.playlist._id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          padding: '10px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        className="btn-hover"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Playlist Songs list */}
                  <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Playlist Songs</h3>
                    {selectedPlaylist.songs.length === 0 ? (
                      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', textAlign: 'center', opacity: 0.5 }}>
                        No songs in this playlist yet. Add songs from below or explore the community songs!
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {selectedPlaylist.songs.map((song: any, index: number) => {
                          const isCurrentPlayingSong = currentSong._id === song._id && queueName === selectedPlaylist.playlist.title;
                          return (
                            <div 
                              key={song._id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'rgba(255,255,255,0.01)',
                                border: '1px solid rgba(255,255,255,0.03)',
                                borderRadius: '14px',
                                padding: '12px 16px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#333', overflow: 'hidden' }}>
                                  <img src={song.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop'} alt="Song" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div>
                                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: isCurrentPlayingSong ? '#20BEFF' : '#fff' }}>
                                    {song.title}
                                  </div>
                                  <div style={{ fontSize: '12px', opacity: 0.5 }}>{song.artistName}</div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button 
                                  onClick={() => handlePlaySongFromPlaylist(selectedPlaylist.songs, selectedPlaylist.playlist.title, index)}
                                  style={{
                                    background: isCurrentPlayingSong ? 'rgba(32, 190, 255, 0.1)' : 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    color: isCurrentPlayingSong ? '#20BEFF' : '#fff',
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                  }}
                                  className="btn-hover"
                                >
                                  {isCurrentPlayingSong && isPlaying ? 'Playing' : 'Play'}
                                </button>
                                <button 
                                  onClick={() => handleRemoveSongFromPlaylist(song._id)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Add Songs Search */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '28px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '14px' }}>Quick Add Songs to this Playlist</h3>
                    
                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                      <Search size={16} style={{ position: 'absolute', left: '16px', top: '16px', opacity: 0.4 }} />
                      <input 
                        type="text" 
                        placeholder="Search existing community songs..." 
                        value={playlistSearchQuery}
                        onChange={(e) => setPlaylistSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 44px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.02)',
                          color: '#fff',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                      {songs.filter(s => s.title.toLowerCase().includes(playlistSearchQuery.toLowerCase()) || s.artistName.toLowerCase().includes(playlistSearchQuery.toLowerCase())).slice(0, 6).map((song) => {
                        const isAlreadyIn = selectedPlaylist.songs.some((s: any) => s._id === song._id);
                        return (
                          <div 
                            key={`search-add-${song._id}`} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              background: 'rgba(255,255,255,0.01)', 
                              border: '1px solid rgba(255,255,255,0.03)', 
                              borderRadius: '10px', 
                              padding: '8px 12px' 
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#333', overflow: 'hidden' }}>
                                <img src={song.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop'} alt="Song" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{song.title}</div>
                                <div style={{ fontSize: '11px', opacity: 0.5 }}>{song.artistName}</div>
                              </div>
                            </div>

                            <button 
                              disabled={isAlreadyIn}
                              onClick={() => handleAddSongToPlaylist(song._id)}
                              style={{
                                background: isAlreadyIn ? 'rgba(255,255,255,0.05)' : 'rgba(32, 190, 255, 0.1)',
                                border: 'none',
                                color: isAlreadyIn ? 'rgba(255,255,255,0.3)' : '#20BEFF',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: isAlreadyIn ? 'not-allowed' : 'pointer'
                              }}
                              className="btn-hover"
                            >
                              {isAlreadyIn ? 'Added' : '+ Add'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4, textAlign: 'center' }}>
                  <ListMusic size={40} style={{ marginBottom: '16px' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 6px 0' }}>No Playlist Selected</h4>
                  <p style={{ fontSize: '13px', maxWidth: '280px' }}>Select a playlist from the left panel to manage its songs and play them, or create a new playlist.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBTAB 3: COMMUNITY SONGS (UNLIMITED ADDING)              */}
        {/* ========================================================= */}
        {librarySubTab === 'explore' && (
          <div>
            <div style={{ background: 'rgba(32, 190, 255, 0.05)', border: '1px solid rgba(32, 190, 255, 0.2)', borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Globe size={20} color="#20BEFF" />
              <div style={{ fontSize: '13px', color: '#fff' }}>
                <span style={{ fontWeight: 'bold', color: '#20BEFF' }}>Unlimited Community Access:</span> You can add any song from the global library to your custom playlists without using any storage quota slots!
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
              {/* Language Filters */}
              <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '12px' }}>
                {[
                  { id: 'all', label: 'All Languages' },
                  { id: 'spanish', label: '🇪🇸 Spanish' },
                  { id: 'hindi', label: '🇮🇳 Hindi' },
                  { id: 'korean', label: '🇰🇷 Korean' },
                  { id: 'english', label: '🇬🇧 English' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCommunityLanguageFilter(tab.id as any)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: communityLanguageFilter === tab.id ? '#20BEFF' : 'transparent',
                      color: communityLanguageFilter === tab.id ? '#000' : '#fff',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '12px', opacity: 0.4 }} />
                <input
                  type="text"
                  placeholder="Search community songs..."
                  value={playlistSearchQuery}
                  onChange={(e) => setPlaylistSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 34px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.03)',
                    color: '#fff',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Songs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
              {filteredSongs.map(song => {
                const isCurrentPlaying = currentSong._id === song._id;
                const langFlag = song.language?.toLowerCase() === 'spanish' ? '🇪🇸' : song.language?.toLowerCase() === 'hindi' ? '🇮🇳' : song.language?.toLowerCase() === 'korean' ? '🇰🇷' : '🇬🇧';

                return (
                  <div
                    key={`explore-${song._id}`}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: isCurrentPlaying ? '1px solid #20BEFF' : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '18px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px',
                      transition: 'all 0.2s'
                    }}
                    className="btn-hover"
                  >
                    <div style={{ display: 'flex', gap: '14px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: '#333', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                        <img src={song.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop'} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', borderRadius: '4px', fontSize: '10px', padding: '1px 3px' }}>
                          {langFlag}
                        </div>
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isCurrentPlaying ? '#20BEFF' : '#fff' }}>
                          {song.title}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {song.artistName}
                        </div>
                        <span style={{ fontSize: '10px', opacity: 0.4, marginTop: '4px', display: 'inline-block' }}>
                          {song.language}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                      <button
                        onClick={() => handlePlaySingleSong(song)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: isCurrentPlaying && isPlaying ? '#20BEFF' : 'rgba(255,255,255,0.08)',
                          color: isCurrentPlaying && isPlaying ? '#000' : '#fff',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                        className="btn-hover"
                      >
                        <Play size={12} fill={isCurrentPlaying && isPlaying ? '#000' : '#fff'} />
                        {isCurrentPlaying && isPlaying ? 'Playing' : 'Play'}
                      </button>

                      <button
                        onClick={() => setAddToPlaylistModalSong(song)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'transparent',
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        className="btn-hover"
                      >
                        <Plus size={13} /> Playlist
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBTAB 4: MY CUSTOM IMPORTS (5-SONG QUOTA)                */}
        {/* ========================================================= */}
        {librarySubTab === 'uploads' && (
          <div>
            {/* Quota Progress Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(32, 190, 255, 0.05) 100%)', 
              border: '1px solid rgba(168, 85, 247, 0.25)', 
              borderRadius: '20px', 
              padding: '24px', 
              marginBottom: '32px' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Custom Song Upload Quota</h3>
                  <p style={{ fontSize: '13px', opacity: 0.6, margin: 0 }}>
                    You have used {uploadQuota.uploadedCount} of {uploadQuota.isUnlimited ? 'Unlimited' : `${uploadQuota.maxLimit} available custom upload slots`}.
                  </p>
                </div>

                <button
                  onClick={handleOpenImportModal}
                  disabled={uploadQuota.remaining <= 0 && !uploadQuota.isUnlimited}
                  className="btn-hover"
                  style={{
                    background: uploadQuota.remaining <= 0 && !uploadQuota.isUnlimited ? 'rgba(255,255,255,0.1)' : '#a855f7',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: uploadQuota.remaining <= 0 && !uploadQuota.isUnlimited ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Sparkles size={15} /> Import New Track
                </button>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${Math.min(100, (uploadQuota.uploadedCount / uploadQuota.maxLimit) * 100)}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #a855f7 0%, #20BEFF 100%)',
                    borderRadius: '6px',
                    transition: 'width 0.3s ease'
                  }} 
                />
              </div>
            </div>

            {/* Uploaded Songs Grid */}
            {userUploadedSongs.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px', padding: '48px', textAlign: 'center' }}>
                <Upload size={40} style={{ opacity: 0.4, marginBottom: '16px' }} />
                <h4 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 6px 0' }}>No custom tracks uploaded yet</h4>
                <p style={{ fontSize: '13px', opacity: 0.5, maxWidth: '400px', margin: '0 auto 20px auto' }}>
                  Import your favorite songs from YouTube! Lingofy AI will automatically extract timed lyrics and translate them into 4 parallel languages.
                </p>
                <button
                  onClick={handleOpenImportModal}
                  className="btn-hover"
                  style={{ background: '#a855f7', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Import Your First Song
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
                {userUploadedSongs.map(song => (
                  <div
                    key={`upload-${song._id}`}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '18px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px'
                    }}
                    className="btn-hover"
                  >
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#333', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={song.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop'} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</div>
                        <div style={{ fontSize: '12px', opacity: 0.5 }}>{song.artistName}</div>
                        <span style={{ fontSize: '10px', color: '#a855f7', fontWeight: 'bold', marginTop: '2px', display: 'inline-block' }}>✓ Custom Import</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handlePlaySingleSong(song)}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#20BEFF', color: '#000', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
                        className="btn-hover"
                      >
                        ▶ Play
                      </button>
                      <button
                        onClick={() => setAddToPlaylistModalSong(song)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', fontSize: '11px', cursor: 'pointer' }}
                        className="btn-hover"
                      >
                        + Playlist
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    );
  };

  const renderDocs = () => {
    return (
      <div style={{ padding: '32px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px', marginTop: '24px' }}>
          <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '16px', background: 'linear-gradient(135deg, #fff 0%, #20BEFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>Welcome to Lingofy</h2>
          <p style={{ opacity: 0.8, fontSize: '18px', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
            Lingofy is a revolutionary music-integrated language learning platform. 
            We combine the emotional engagement of music with structured learning to help you master languages naturally and intuitively!
          </p>
        </div>

        {/* Benefits Section */}
        <div style={{ marginBottom: '56px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>✨</span> Why Lingofy Works
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div className="doc-card" style={{ background: 'linear-gradient(135deg, rgba(32, 190, 255, 0.08) 0%, rgba(0,0,0,0) 100%)', border: '1px solid rgba(32, 190, 255, 0.2)', borderRadius: '24px', padding: '32px', transition: 'all 0.3s ease', cursor: 'default' }}>
              <div style={{ background: '#20BEFF', color: '#000', width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 8px 16px rgba(32, 190, 255, 0.3)' }}><Music size={24} /></div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Music-Driven Immersion</h4>
              <p style={{ opacity: 0.7, fontSize: '14px', lineHeight: '1.6' }}>Learn through rhythm and melody. Music engages multiple areas of the brain, making vocabulary retention significantly faster and more enjoyable than traditional flashcards.</p>
            </div>
            <div className="doc-card" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(0,0,0,0) 100%)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '24px', padding: '32px', transition: 'all 0.3s ease', cursor: 'default' }}>
              <div style={{ background: '#a855f7', color: '#fff', width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 8px 16px rgba(168, 85, 247, 0.3)' }}><Settings size={24} /></div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Adaptive Personalization</h4>
              <p style={{ opacity: 0.7, fontSize: '14px', lineHeight: '1.6' }}>Your learning journey is tailored specifically to your proficiency level, daily goals, and favorite music genres, ensuring you stay motivated.</p>
            </div>
          </div>
        </div>

        {/* Features & Roadmap */}
        <div style={{ marginBottom: '56px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen size={28} color="#3b82f6" /> The Learning Roadmap
          </h3>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }}></div>
            <p style={{ opacity: 0.8, marginBottom: '32px', fontSize: '15px' }}>Lingofy tracks your progress across three distinct tiers. You must complete quizzes in your current tier to unlock the next level!</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '23px', top: '24px', bottom: '24px', width: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }}></div>
              
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div style={{ background: 'rgba(32, 190, 255, 0.15)', color: '#20BEFF', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', flexShrink: 0, border: '4px solid #14141c' }}>1</div>
                <div style={{ paddingTop: '8px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#20BEFF', marginBottom: '8px' }}>Easy Tier (Vocabulary)</h4>
                  <p style={{ opacity: 0.6, fontSize: '14px', lineHeight: '1.6' }}>Focuses on extracting single target words from a song. You will learn basic nouns, verbs, and adjectives by hearing them directly in the lyrics.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', flexShrink: 0, border: '4px solid #14141c' }}>2</div>
                <div style={{ paddingTop: '8px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#a855f7', marginBottom: '8px' }}>Intermediate Tier (Sentences)</h4>
                  <p style={{ opacity: 0.6, fontSize: '14px', lineHeight: '1.6' }}>Moves beyond single words. You will translate full sentences, understand basic grammar structures, and learn how words connect in context.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', flexShrink: 0, border: '4px solid #14141c' }}>3</div>
                <div style={{ paddingTop: '8px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#eab308', marginBottom: '8px' }}>Hard Tier (Comprehension)</h4>
                  <p style={{ opacity: 0.6, fontSize: '14px', lineHeight: '1.6' }}>Tests your deep understanding. You will listen to fast-paced lyrics, understand idioms, and complete advanced listening comprehension challenges.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges & Rewards */}
        <div style={{ marginBottom: '56px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🏆</span> Badges & Rewards
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="doc-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', textAlign: 'center', transition: 'all 0.3s ease' }}>
              <div style={{ fontSize: '56px', marginBottom: '20px' }}>🎖️</div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Easy Explorer</h4>
              <p style={{ opacity: 0.5, fontSize: '13px', lineHeight: '1.5' }}>Awarded when you pass your first Easy quiz and prove your basic vocabulary skills.</p>
            </div>
            <div className="doc-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', textAlign: 'center', transition: 'all 0.3s ease' }}>
              <div style={{ fontSize: '56px', marginBottom: '20px' }}>🏆</div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Inter Scholar</h4>
              <p style={{ opacity: 0.5, fontSize: '13px', lineHeight: '1.5' }}>Unlocked by completing Intermediate sentences and mastering contextual grammar.</p>
            </div>
            <div className="doc-card" style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(0,0,0,0) 100%)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '24px', padding: '32px', textAlign: 'center', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #facc15, #f59e0b)' }}></div>
              <div style={{ fontSize: '56px', marginBottom: '20px', filter: 'drop-shadow(0 0 15px rgba(234, 179, 8, 0.6))' }}>⭐</div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#facc15', marginBottom: '8px' }}>Language Star</h4>
              <p style={{ opacity: 0.8, fontSize: '13px', lineHeight: '1.5' }}>The ultimate achievement! You have mastered the Hard tier and achieved fluency.</p>
            </div>
          </div>
        </div>

        {/* Deep Dive: Analytics */}
        <div style={{ marginBottom: '48px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BarChart2 size={28} color="#ec4899" /> Deep Dive: Analytics
          </h3>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px' }}>
            <p style={{ opacity: 0.8, marginBottom: '24px', fontSize: '15px', lineHeight: '1.6' }}>
              We don't just track your scores; we analyze your learning behavior. Head over to the <strong>Statistics</strong> tab to explore:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #20BEFF' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#20BEFF' }}>Activity Streak Heatmap</h4>
                <p style={{ opacity: 0.7, fontSize: '14px', margin: 0, lineHeight: '1.5' }}>Similar to GitHub contributions, this visual grid shows your daily activity. The brighter the blue, the more quizzes you've completed that day! Keep your streak alive to build strong habits.</p>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #3b82f6' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#3b82f6' }}>Interactive Score Trends</h4>
                <p style={{ opacity: 0.7, fontSize: '14px', margin: 0, lineHeight: '1.5' }}>A dynamic line chart mapping your performance over the last 7 quizzes. Hover over the data points to see exactly how much XP you earned on specific dates and track your improvement trajectory.</p>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #a855f7' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#a855f7' }}>Comprehensive Quiz Review</h4>
                <p style={{ opacity: 0.7, fontSize: '14px', margin: 0, lineHeight: '1.5' }}>Don't just see your score. Click "Review" on any past quiz attempt to pull up a detailed report of the exact questions you faced, your submitted answers vs the correct answers, and learn from your mistakes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Global CSS for doc hover effects */}
        <style>{`
          .doc-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            border-color: rgba(255,255,255,0.2) !important;
          }
        `}</style>

      </div>
    );
  };

  const handleShareBadge = async (type: 'whatsapp' | 'instagram' | 'copy', badge: any) => {
    const text = `I just unlocked the "${badge.title}" badge on Lingofy! 🚀 Start learning with music today.`;
    const url = "http://localhost:5173/dashboard";

    if (type === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else if (type === 'copy') {
      await navigator.clipboard.writeText(text + ' ' + url);
      alert('Link copied to clipboard!');
    } else if (type === 'instagram') {
      if (navigator.share) {
        try {
          await navigator.share({ title: 'Lingofy Achievement', text, url });
        } catch (err) {
          console.error('Error sharing:', err);
        }
      } else {
        await navigator.clipboard.writeText(text + ' ' + url);
        alert('Text copied! Open Instagram to paste and share your achievement on your Story or Feed.');
      }
    }
  };

  const renderAchievements = () => {
    // Generate badge data dynamically based on languages and progress
    const badges = [];
    const langs = ['spanish', 'hindi', 'korean'];
    
    // 1. Language Badges
    langs.forEach(lang => {
      const prog = roadmapProgress?.[lang] || { easyCompleted: 0, intermediateCompleted: 0, hardCompleted: 0 };
      badges.push({
        id: `easy_${lang}`, title: `Explorer (${lang.charAt(0).toUpperCase()+lang.slice(1)})`, desc: 'Completed your first vocabulary lesson.', icon: '🎖️', color: '#3b82f6',
        unlocked: prog.easyCompleted >= 1
      });
      badges.push({
        id: `inter_${lang}`, title: `Scholar (${lang.charAt(0).toUpperCase()+lang.slice(1)})`, desc: 'Mastered intermediate sentence structures.', icon: '🏆', color: '#20BEFF',
        unlocked: prog.intermediateCompleted >= 2
      });
      badges.push({
        id: `hard_${lang}`, title: `Master (${lang.charAt(0).toUpperCase()+lang.slice(1)})`, desc: 'Completed advanced comprehension challenges.', icon: '👑', color: '#eab308',
        unlocked: prog.hardCompleted >= 3
      });
      badges.push({
        id: `focus_${lang}`, title: `Focus Scholar (${lang.charAt(0).toUpperCase()+lang.slice(1)})`, desc: 'Passed 4 Focus Area Quizzes.', icon: '🎯', color: '#ec4899',
        unlocked: prog.focusCompleted >= 4
      });
      badges.push({
        id: `pronunciation_${lang}`, title: `Pronunciation Master (${lang.charAt(0).toUpperCase()+lang.slice(1)})`, desc: '80% accuracy in Pronunciation.', icon: '🎙️', color: '#8b5cf6',
        unlocked: prog.badges?.includes('Pronunciation Master') || false
      });
    });

    // 2. Goal/Streak Badges (mocked logic based on session/history)
    badges.push({
      id: 'daily_goal', title: 'Goal Crusher', desc: 'Hit your daily session time goal.', icon: '🎯', color: '#ef4444',
      unlocked: goalAlreadyMet
    });
    badges.push({
      id: 'quiz_master', title: 'Quiz Master', desc: 'Completed over 10 quizzes.', icon: '🔥', color: '#f97316',
      unlocked: history.length > 10
    });

    return (
      <div style={{ padding: '32px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Achievements</h2>
        <p style={{ opacity: 0.6, fontSize: '15px', marginBottom: '32px' }}>Track your language milestones and share your progress with friends.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {badges.map(b => (
            <div 
              key={b.id}
              onClick={(e) => {
                if (b.unlocked) {
                  setShareBadgeModal(b);
                  confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    zIndex: 20000,
                    colors: [b.color, '#ffffff', '#facc15']
                  });
                }
              }}
              style={{
                background: b.unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.01)',
                border: `1px solid ${b.unlocked ? b.color + '40' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: '20px', padding: '24px',
                display: 'flex', alignItems: 'center', gap: '16px',
                cursor: b.unlocked ? 'pointer' : 'default',
                opacity: b.unlocked ? 1 : 0.4,
                transition: 'all 0.3s ease',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => b.unlocked && (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={(e) => b.unlocked && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{
                width: '60px', height: '60px', borderRadius: '16px',
                background: b.unlocked ? `${b.color}20` : 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', filter: b.unlocked ? `drop-shadow(0 0 10px ${b.color}80)` : 'grayscale(1)'
              }}>
                {b.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px', color: b.unlocked ? '#fff' : 'rgba(255,255,255,0.5)' }}>{b.title}</h4>
                <p style={{ fontSize: '12px', opacity: 0.6, margin: 0 }}>{b.desc}</p>
                {b.unlocked && <span style={{ fontSize: '10px', color: b.color, fontWeight: 'bold', marginTop: '8px', display: 'inline-block' }}>Click to Share <Share2 size={10} style={{display:'inline', marginLeft:'2px'}}/></span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    return (
      <div style={{ padding: '0 24px 24px 24px', width: '100%', maxWidth: '1100px' }}>
        {/* Header with Save button on top right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>Profile Settings</h2>
            <p style={{ opacity: 0.6, fontSize: '13px', margin: '4px 0 0 0' }}>Update your personal details, demographics, and learning goals.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {profileSuccessMessage && (
              <span style={{ color: '#20BEFF', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ✓ {profileSuccessMessage}
              </span>
            )}
            <button 
              type="button" 
              onClick={handleSaveProfile}
              disabled={savingProfile} 
              className="btn-hover" 
              style={{ 
                background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)', 
                color: '#000', 
                border: 'none', 
                padding: '10px 24px', 
                borderRadius: '12px', 
                fontWeight: '800', 
                fontSize: '13px',
                cursor: savingProfile ? 'not-allowed' : 'pointer', 
                opacity: savingProfile ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(32, 190, 255, 0.25)'
              }}
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%' }}>
          
          {/* Card 1: Personal Details */}
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.06)', 
            borderRadius: '20px', 
            padding: '22px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '14px' 
          }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#20BEFF', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={15} color="#20BEFF" /> Personal Information
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', opacity: 0.8 }}>Full Name</label>
                <input 
                  type="text" 
                  value={profileForm.name} 
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '13px', outline: 'none' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', opacity: 0.8 }}>Email <span style={{opacity:0.5}}>(Read Only)</span></label>
                <input 
                  type="email" 
                  value={currentUser?.email || ''} 
                  readOnly 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.25)', color: 'rgba(255,255,255,0.5)', fontSize: '13px', outline: 'none', cursor: 'not-allowed' }} 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', opacity: 0.8 }}>Age</label>
                <input 
                  type="number" 
                  min="1" 
                  max="120" 
                  value={profileForm.age} 
                  onChange={(e) => setProfileForm({...profileForm, age: e.target.value})} 
                  placeholder="e.g. 25" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '13px', outline: 'none' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', opacity: 0.8 }}>Mobile</label>
                <input 
                  type="text" 
                  value={profileForm.mobile} 
                  onChange={(e) => setProfileForm({...profileForm, mobile: e.target.value})} 
                  placeholder="e.g. +1 234 567 8900" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '13px', outline: 'none' }} 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', opacity: 0.8 }}>Profession (Optional)</label>
                <input 
                  type="text" 
                  value={profileForm.profession} 
                  onChange={(e) => setProfileForm({...profileForm, profession: e.target.value})} 
                  placeholder="e.g. Software Engineer" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '13px', outline: 'none' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', opacity: 0.8 }}>Known Languages</label>
                <input 
                  type="text" 
                  value={profileForm.knownLanguages} 
                  onChange={(e) => setProfileForm({...profileForm, knownLanguages: e.target.value})} 
                  placeholder="e.g. English, Hindi" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '13px', outline: 'none' }} 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', opacity: 0.8 }}>About Me</label>
              <textarea 
                value={profileForm.about} 
                onChange={(e) => setProfileForm({...profileForm, about: e.target.value})} 
                placeholder="Tell us a little about yourself..." 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '13px', outline: 'none', height: '62px', resize: 'none' }} 
              />
            </div>
          </div>

          {/* Card 2: Language & Learning Goals */}
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.06)', 
            borderRadius: '20px', 
            padding: '22px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '14px',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#20BEFF', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={15} color="#20BEFF" /> Language & Learning Goals
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', opacity: 0.8 }}>Native Language</label>
                  <select 
                    value={profileForm.nativeLanguage} 
                    onChange={(e) => setProfileForm({...profileForm, nativeLanguage: e.target.value})} 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: '#121214', color: '#fff', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="">Select Native Language</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Korean">Korean</option>
                    <option value="French">French</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', opacity: 0.8 }}>Target Language</label>
                  <select 
                    value={profileForm.learningLanguage} 
                    onChange={(e) => setProfileForm({...profileForm, learningLanguage: e.target.value})} 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: '#121214', color: '#fff', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="">Select Target Language</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Korean">Korean</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', opacity: 0.8 }}>Daily Learning Goal</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[
                    { val: '10', label: '10m', desc: 'Casual' },
                    { val: '15', label: '15m', desc: 'Regular' },
                    { val: '30', label: '30m', desc: 'Serious' },
                    { val: '60', label: '60m', desc: 'Intense' },
                  ].map((goal) => {
                    const isSelected = profileForm.dailyGoal === goal.val;
                    return (
                      <div
                        key={goal.val}
                        onClick={() => setProfileForm({ ...profileForm, dailyGoal: goal.val })}
                        style={{
                          padding: '8px 4px',
                          borderRadius: '10px',
                          border: `1px solid ${isSelected ? '#20BEFF' : 'rgba(255,255,255,0.08)'}`,
                          background: isSelected ? 'rgba(32, 190, 255, 0.12)' : 'rgba(255,255,255,0.02)',
                          color: isSelected ? '#20BEFF' : 'rgba(255,255,255,0.7)',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: '800' }}>{goal.label}</div>
                        <div style={{ fontSize: '10px', opacity: 0.6 }}>{goal.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', opacity: 0.8 }}>Current Proficiency <span style={{opacity:0.5}}>(Read Only)</span></label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                    <div
                      key={lvl}
                      style={{
                        flex: 1, 
                        padding: '8px', 
                        borderRadius: '10px', 
                        border: `1px solid ${profileForm.proficiency === lvl ? '#20BEFF' : 'rgba(255,255,255,0.08)'}`,
                        background: profileForm.proficiency === lvl ? 'rgba(32, 190, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                        color: profileForm.proficiency === lvl ? '#20BEFF' : 'rgba(255,255,255,0.45)', 
                        fontWeight: '700', 
                        fontSize: '12px',
                        textAlign: 'center', 
                        textTransform: 'capitalize',
                        cursor: 'not-allowed'
                      }}
                    >
                      {lvl}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Summary / Submit Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
                Target: <strong style={{ color: '#fff' }}>{profileForm.learningLanguage || 'None'}</strong> • Goal: <strong style={{ color: '#fff' }}>{profileForm.dailyGoal || '15'} mins/day</strong>
              </div>
              <button 
                type="submit" 
                disabled={savingProfile} 
                className="btn-hover" 
                style={{ 
                  background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)', 
                  color: '#000', 
                  border: 'none', 
                  padding: '10px 24px', 
                  borderRadius: '10px', 
                  fontWeight: '800', 
                  fontSize: '13px',
                  cursor: savingProfile ? 'not-allowed' : 'pointer', 
                  opacity: savingProfile ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f0f0f', color: '#fff' }}>
        <div className="loader">Tuning in...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#0f0f0f', 
      height: '100vh', 
      overflow: 'hidden',
      color: '#fff', 
      fontFamily: 'Inter, sans-serif',
      display: 'flex'
    }}>
      {/* Mini YouTube Player Container */}
      <div 
        className="mini-video-player"
        style={{ 
          position: 'fixed', 
          bottom: '24px', 
          right: '24px', 
          width: '280px', 
          height: '158px', 
          borderRadius: '20px',
          overflow: 'hidden', 
          zIndex: 1000,
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(32, 190, 255, 0.15)',
          border: '1px solid rgba(255,255,255,0.12)',
          background: '#000',
          opacity: isPlaying && !hideVideo ? 1 : 0,
          pointerEvents: isPlaying && !hideVideo ? 'auto' : 'none',
          visibility: isPlaying && !hideVideo ? 'visible' : 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Close Button overlay */}
        <button 
          onClick={(e) => { e.stopPropagation(); setHideVideo(true); }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: 1010,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease'
          }}
          className="video-close-btn"
        >
          <X size={14} />
        </button>

        <div id="youtube-player" style={{ width: '100%', height: '100%' }}></div>
      </div>
      {/* Mobile Sidebar Hamburger Toggle */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="mobile-toggle"
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 90,
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '10px',
          cursor: 'pointer',
          display: 'none',
          color: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
        }}
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 95
          }}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`desktop-sidebar ${isMobileOpen ? 'sidebar-open' : ''} ${isResizing ? 'resizing' : ''}`} 
        style={{ 
          width: `${effectiveWidth}px`, 
          background: '#000', 
          borderRight: '1px solid rgba(255,255,255,0.05)',
          padding: isCompact ? '40px 12px' : '40px 24px', 
          display: 'flex', 
          flexDirection: 'column', 
          position: 'fixed', 
          height: '100vh', 
          zIndex: 100 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCompact ? 'center' : 'space-between', marginBottom: '48px', position: 'relative' }}>
          {!isCompact && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
              <img src="/Logo-1.png" alt="Logo" style={{ width: '40px', flexShrink: 0 }} />
              <span style={{ fontSize: '24px', fontWeight: '800', whiteSpace: 'nowrap' }}>Lingofy</span>
            </div>
          )}
          {isCompact && (
            <img src="/Logo-1.png" alt="Logo" style={{ width: '40px', flexShrink: 0 }} />
          )}
          
          <button 
            onClick={toggleSidebar}
            className="desktop-toggle-btn"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '8px',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="mobile-close-btn"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
          {currentUser?.learningMode !== 'traditional' && (
            <NavItem icon={<Home size={20} />} label="Home" active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setIsMobileOpen(false); }} collapsed={isCompact} />
          )}
          <NavItem icon={<BookOpen size={20} />} label="Lessons" onClick={() => navigate('/lessons')} collapsed={isCompact} />
          {currentUser?.learningMode !== 'traditional' && (
            <NavItem icon={<Music size={20} />} label="Library" active={activeTab === 'library'} onClick={() => { setActiveTab('library'); setIsMobileOpen(false); }} collapsed={isCompact} />
          )}
          <NavItem icon={<Bookmark size={20} />} label="Notes" active={activeTab === 'notes'} onClick={() => { setActiveTab('notes'); setIsMobileOpen(false); }} collapsed={isCompact} />
          <NavItem icon={<BarChart2 size={20} />} label="Statistics" active={activeTab === 'statistics'} onClick={() => { setActiveTab('statistics'); setIsMobileOpen(false); }} collapsed={isCompact} />
          <NavItem icon={<Award size={20} />} label="Achievements" active={activeTab === 'achievements'} onClick={() => { setActiveTab('achievements'); setIsMobileOpen(false); }} collapsed={isCompact} />
          <NavItem icon={<Headphones size={20} />} label="Mindful Listening" onClick={() => navigate('/mindful-listening')} collapsed={isCompact} />
          <NavItem icon={<HelpCircle size={20} />} label="Documentation" active={activeTab === 'docs'} onClick={() => { setActiveTab('docs'); setIsMobileOpen(false); }} collapsed={isCompact} />
        </nav>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
          <NavItem icon={<Settings size={20} />} label="Profile" active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setIsMobileOpen(false); }} collapsed={isCompact} />
          <NavItem icon={<LogOut size={20} />} label="Logout" onClick={() => { localStorage.clear(); sessionStorage.clear(); navigate('/login'); }} collapsed={isCompact} />
        </div>

        {/* Drag Resizer Handle on Right Edge */}
        <div 
          onMouseDown={startResizing}
          className={`sidebar-resize-handle ${isResizing ? 'active' : ''}`}
          title="Drag to resize sidebar"
        >
          <div className="resize-handle-line" />
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content custom-scrollbar ${isResizing ? 'resizing' : ''}`} style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden', flex: 1, marginLeft: `var(--sidebar-width, ${effectiveWidth}px)`, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', transition: isResizing ? 'none' : 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative' }}>
        
        {/* Top Header Bar */}
        <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'flex-end', marginBottom: '32px', alignItems: 'center', position: 'relative', zIndex: 10 }}>
          
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                position: 'relative'
              }}
              className="btn-hover"
            >
              <Bell size={20} />
              {notifications.filter((n: any) => !n.isRead).length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '10px',
                  width: '8px',
                  height: '8px',
                  background: '#ef4444',
                  borderRadius: '50%',
                  border: '2px solid #000'
                }}></div>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotificationsDropdown && (
              <div style={{
                position: 'absolute',
                top: '54px',
                right: '0',
                width: '340px',
                background: '#121214',
                border: '1px solid #27272a',
                borderRadius: '20px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.85)',
                overflow: 'hidden',
                zIndex: 100
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', borderBottom: '1px solid #27272a' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={16} color="#20BEFF" /> Notifications
                  </h4>
                  {notifications.filter((n: any) => !n.isRead).length > 0 && (
                    <button 
                      onClick={handleMarkAllNotificationsAsRead}
                      style={{ background: 'none', border: 'none', color: '#20BEFF', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Live Daily Goal Status Banner */}
                <div style={{
                  margin: '12px 14px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: goalAlreadyMet 
                    ? 'rgba(16, 185, 129, 0.08)' 
                    : 'rgba(245, 158, 11, 0.08)',
                  border: `1px solid ${goalAlreadyMet ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {goalAlreadyMet ? (
                        <Check size={16} color="#10b981" />
                      ) : (
                        <Clock size={16} color="#f59e0b" />
                      )}
                      <span style={{ 
                        fontSize: '13px', 
                        fontWeight: 'bold', 
                        color: goalAlreadyMet ? '#10b981' : '#f59e0b' 
                      }}>
                        {goalAlreadyMet ? 'Daily Goal Completed' : 'Daily Goal Incomplete'}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', opacity: 0.6, fontWeight: 'bold' }}>
                      {Math.floor(sessionTime / 60)} / {profileForm.dailyGoal || '15'}m
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, (sessionTime / (parseInt(profileForm.dailyGoal || '15') * 60)) * 100)}%`,
                      height: '100%',
                      background: goalAlreadyMet ? '#10b981' : 'linear-gradient(90deg, #f59e0b 0%, #20BEFF 100%)',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>

                  <p style={{ fontSize: '11px', margin: 0, opacity: 0.75, lineHeight: '1.4' }}>
                    {goalAlreadyMet 
                      ? `You achieved your ${profileForm.dailyGoal || '15'}m target today! Streak maintained.` 
                      : `${Math.max(1, parseInt(profileForm.dailyGoal || '15') - Math.floor(sessionTime / 60))}m remaining today. Complete a lesson or song to hit your goal!`}
                  </p>
                </div>
                
                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '28px 16px', textAlign: 'center', opacity: 0.5, fontSize: '13px' }}>
                      No other notifications
                    </div>
                  ) : (
                    notifications.map((notif: any) => {
                      const isGoalCompleted = notif.title?.includes('Completed') || notif.type === 'goal_completed';
                      const isGoalPending = notif.title?.includes('Incomplete') || notif.title?.includes('Pending') || notif.type === 'goal_pending';

                      return (
                        <div 
                          key={notif._id}
                          onClick={() => {
                            if (!notif.isRead) handleMarkNotificationAsRead(notif._id);
                            if (notif.title?.includes('Badge')) {
                              setActiveTab('achievements');
                              setShowNotificationsDropdown(false);
                            }
                          }}
                          style={{
                            padding: '14px 16px',
                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                            background: notif.isRead ? 'transparent' : 'rgba(32, 190, 255, 0.04)',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                          }}
                        >
                          <div style={{ marginTop: '2px', flexShrink: 0 }}>
                            {isGoalCompleted ? (
                              <Check size={16} color="#10b981" />
                            ) : isGoalPending ? (
                              <Clock size={16} color="#f59e0b" />
                            ) : notif.title?.includes('Badge') ? (
                              <Award size={16} color="#facc15" />
                            ) : (
                              <Sparkles size={16} color="#20BEFF" />
                            )}
                          </div>
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <h5 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: notif.isRead ? '600' : '800', color: notif.isRead ? '#fff' : '#20BEFF' }}>
                                {notif.title}
                              </h5>
                              {!notif.isRead && (
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#20BEFF', flexShrink: 0 }} />
                              )}
                            </div>
                            <p style={{ margin: 0, fontSize: '12px', opacity: 0.65, lineHeight: '1.4' }}>{notif.message}</p>
                            <span style={{ display: 'block', marginTop: '6px', fontSize: '10px', opacity: 0.35 }}>
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            {activeTab === 'docs' ? renderDocs() : activeTab === 'achievements' ? renderAchievements() : activeTab === 'profile' ? renderProfile() : activeTab === 'statistics' ? renderStatistics() : activeTab === 'library' && currentUser?.learningMode !== 'traditional' ? renderLibrary() : activeTab === 'notes' ? (
              <NotesHub currentUser={currentUser} />
            ) : currentUser?.learningMode !== 'traditional' ? (
              <div style={{ width: '100%', maxWidth: '1200px' }}>
          
          <div className="dashboard-layout-custom" style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            width: '100%',
            marginBottom: '48px'
          }}>
            {/* Top Row: Language Card & Music Player Card side-by-side */}
            <div className="top-dashboard-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '32px',
              alignItems: 'stretch'
            }}>
              {/* Language Card */}
              {(() => {
                const progressObj = roadmapProgress?.[activeCardLanguage] || { easyCompleted: 0, intermediateCompleted: 0, hardCompleted: 0, currentStage: 'easy', badges: [] };
                const totalCompleted = progressObj.easyCompleted + progressObj.intermediateCompleted + progressObj.hardCompleted;
                const progressPercent = Math.round((totalCompleted / 6) * 100);
                
                const isEasyPassed = progressObj.easyCompleted >= 1;
                const isInterPassed = progressObj.intermediateCompleted >= 2;
                const isHardPassed = progressObj.hardCompleted >= 3;

                return (
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '28px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Language Selector Dropdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', opacity: 0.4, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Learning Language</label>
                      <div style={{ position: 'relative' }}>
                        <select 
                          value={activeCardLanguage}
                          onChange={(e: any) => setActiveCardLanguage(e.target.value as 'hindi' | 'spanish' | 'korean')}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            outline: 'none',
                            cursor: 'pointer',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none'
                          }}
                        >
                          <option value="spanish" style={{ background: '#1a1a1a', color: '#fff' }}>🇪🇸 Spanish</option>
                          <option value="hindi" style={{ background: '#1a1a1a', color: '#fff' }}>🇮🇳 Hindi</option>
                          <option value="korean" style={{ background: '#1a1a1a', color: '#fff' }}>🇰🇷 Korean</option>
                        </select>
                        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.6, fontSize: '10px' }}>
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* Flag & Title Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #fff', overflow: 'hidden', boxShadow: '0 0 10px rgba(255,255,255,0.1)' }}>
                          <img src={`https://flagcdn.com/w160/${activeCardLanguage === 'hindi' ? 'in' : activeCardLanguage === 'spanish' ? 'es' : 'kr'}.png`} alt="Lang Flag" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, textTransform: 'capitalize' }}>{activeCardLanguage}</h2>
                          <p style={{ opacity: 0.5, margin: '2px 0 0 0', fontSize: '12px' }}>
                            {progressObj.currentStage === 'completed' ? 'Language Star 👑' : `${progressObj.currentStage.charAt(0).toUpperCase() + progressObj.currentStage.slice(1)} Level`}
                          </p>
                        </div>
                      </div>
                      <div style={{ background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)', color: '#000', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 'bold' }}>
                        {activeCardLanguage === 'hindi' ? 'N3' : activeCardLanguage === 'spanish' ? 'A2' : 'TOPIK 2'}
                      </div>
                    </div>

                    {/* Visual Roadmap Steps */}
                    <div style={{ padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ fontSize: '11px', opacity: 0.4, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>Roadmap Stages</div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', padding: '0 10px' }}>
                        
                        {/* Steps Container */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', flex: 1 }}>
                          {/* Connector Line behind steps */}
                          <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', height: '2px', background: 'rgba(255,255,255,0.08)', zIndex: 1 }}>
                            <div style={{ width: `${(totalCompleted / 5) * 100}%`, height: '100%', background: '#20BEFF', transition: 'width 0.5s ease' }}></div>
                          </div>

                          {/* Step 1: Easy */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: '4px' }}>
                            <div style={{ 
                              width: '30px', height: '30px', borderRadius: '50%', 
                              background: isEasyPassed ? '#20BEFF' : (progressObj.currentStage === 'easy' ? '#1e1e1e' : 'rgba(255,255,255,0.05)'), 
                              border: `2px solid ${isEasyPassed || progressObj.currentStage === 'easy' ? '#20BEFF' : 'rgba(255,255,255,0.1)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold',
                              color: isEasyPassed ? '#000' : '#fff', boxShadow: progressObj.currentStage === 'easy' ? '0 0 10px rgba(32,190,255,0.4)' : 'none'
                            }}>
                              {isEasyPassed ? '✓' : 'E'}
                            </div>
                            <span style={{ fontSize: '10px', opacity: progressObj.currentStage === 'easy' ? 1 : 0.5, fontWeight: progressObj.currentStage === 'easy' ? 'bold' : 'normal' }}>Easy</span>
                          </div>

                          {/* Step 2: Intermediate */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: '4px' }}>
                            <div style={{ 
                              width: '30px', height: '30px', borderRadius: '50%', 
                              background: isInterPassed ? '#20BEFF' : (progressObj.currentStage === 'intermediate' ? '#1e1e1e' : 'rgba(255,255,255,0.05)'), 
                              border: `2px solid ${isInterPassed || progressObj.currentStage === 'intermediate' ? '#20BEFF' : 'rgba(255,255,255,0.1)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold',
                              color: isInterPassed ? '#000' : '#fff', boxShadow: progressObj.currentStage === 'intermediate' ? '0 0 10px rgba(32,190,255,0.4)' : 'none'
                            }}>
                              {isInterPassed ? '✓' : 'I'}
                            </div>
                            <span style={{ fontSize: '10px', opacity: progressObj.currentStage === 'intermediate' ? 1 : 0.5, fontWeight: progressObj.currentStage === 'intermediate' ? 'bold' : 'normal' }}>Inter</span>
                          </div>

                          {/* Step 3: Hard */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: '4px' }}>
                            <div style={{ 
                              width: '30px', height: '30px', borderRadius: '50%', 
                              background: isHardPassed ? '#20BEFF' : (progressObj.currentStage === 'hard' ? '#1e1e1e' : 'rgba(255,255,255,0.05)'), 
                              border: `2px solid ${isHardPassed || progressObj.currentStage === 'hard' ? '#20BEFF' : 'rgba(255,255,255,0.1)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold',
                              color: isHardPassed ? '#000' : '#fff', boxShadow: progressObj.currentStage === 'hard' ? '0 0 10px rgba(32,190,255,0.4)' : 'none'
                            }}>
                              {isHardPassed ? '✓' : `${progressObj.hardCompleted}/3`}
                            </div>
                            <span style={{ fontSize: '10px', opacity: progressObj.currentStage === 'hard' ? 1 : 0.5, fontWeight: progressObj.currentStage === 'hard' ? 'bold' : 'normal' }}>Hard</span>
                          </div>
                        </div>

                        {/* Achievements Link Section */}
                        <div style={{ flexShrink: 0, paddingBottom: '16px' }}>
                          <button 
                            onClick={() => setActiveTab('achievements')}
                            style={{ 
                              background: 'rgba(255,255,255,0.02)', 
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                              color: '#fff', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            className="btn-hover"
                          >
                            <Award size={16} color="#a855f7" /> View All Achievements
                          </button>
                        </div>                      </div>
                    </div>

                    {/* Progress Bar & CTA Button */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', opacity: 0.7 }}>
                        <span>Roadmap Progress</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
                        <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #20BEFF, #0099e6)', transition: 'width 0.5s ease' }}></div>
                      </div>

                      <button 
                        onClick={() => {
                          const levelToUse = progressObj.currentStage === 'completed' ? 'hard' : progressObj.currentStage;
                          const songParam = currentSong?._id ? `&songId=${currentSong._id}` : '';
                          navigate(`/lessons?language=${activeCardLanguage}&level=${levelToUse}${songParam}`);
                        }}
                        className="btn-hover"
                        style={{ 
                          width: '100%', background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)', color: '#000', border: 'none', padding: '14px', borderRadius: '14px', 
                          fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer',
                          fontSize: '14px', boxShadow: '0 4px 12px rgba(32,190,255,0.25)'
                        }}
                      >
                        {progressObj.currentStage === 'completed' 
                          ? 'Practice Advanced Lessons'
                          : `Take ${progressObj.currentStage.charAt(0).toUpperCase() + progressObj.currentStage.slice(1)} Quiz`
                        } <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Dynamic Music Player Card */}
              <div style={{ 
                background: 'linear-gradient(135deg, #1e1e1e 0%, #000 100%)', borderRadius: '24px', padding: '32px',
                border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '16px', background: '#333', overflow: 'hidden', boxShadow: isPlaying ? '0 0 20px rgba(32, 190, 255, 0.3)' : 'none', transition: 'all 0.5s', flexShrink: 0 }}>
                    <img src={currentSong.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop'} alt="Album" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: isPlaying ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.5s' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentSong.title}</h3>
                    <p style={{ opacity: 0.6, margin: '0 0 12px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentSong.artistName || currentSong.artist}</p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                       <div style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px' }}>HQ AUDIO</div>
                       <div 
                         onClick={() => setShowInteractiveLyrics(prev => !prev)}
                         className="btn-hover"
                         title="Toggle Interactive Lyrics"
                         style={{ 
                           background: showInteractiveLyrics ? 'rgba(32, 190, 255, 0.25)' : 'rgba(32, 190, 255, 0.15)', 
                           color: '#20BEFF', 
                           padding: '4px 8px', 
                           borderRadius: '4px', 
                           fontSize: '10px', 
                           fontWeight: 'bold',
                           cursor: 'pointer',
                           border: showInteractiveLyrics ? '1px solid rgba(32, 190, 255, 0.4)' : '1px solid transparent',
                           transition: 'all 0.2s'
                         }}
                       >
                         LYRICS
                       </div>
                       {currentSong?._id && (
                         <button 
                           onClick={() => {
                             setModalMode('practice');
                             setShowQuizModal(true);
                           }}
                           className="btn-hover"
                           style={{ 
                             background: 'rgba(32, 190, 255, 0.1)', 
                             color: '#20BEFF', 
                             border: '1px solid rgba(32, 190, 255, 0.3)', 
                             padding: '4px 10px', 
                             borderRadius: '6px', 
                             fontSize: '11px', 
                             fontWeight: 'bold', 
                             cursor: 'pointer', 
                             display: 'flex', 
                             alignItems: 'center', 
                             gap: '4px',
                             transition: 'all 0.2s',
                             marginLeft: 'auto'
                           }}
                         >
                           <BookOpen size={12} /> Practice Song
                         </button>
                       )}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ position: 'relative', width: '100%', height: '6px', marginBottom: '12px' }}>
                      {/* Visual Bar */}
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', pointerEvents: 'none' }}>
                        <div style={{ width: `${(currentTime / (currentSong.durationSeconds || 180)) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #20BEFF, #0099e6)', borderRadius: '4px', position: 'relative' }}>
                          {/* Circle Handle */}
                          <div style={{ position: 'absolute', right: '-6px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 6px rgba(0,0,0,0.8)' }}></div>
                        </div>
                      </div>
                      {/* Native Range Input (Invisible) */}
                      <input 
                        type="range" 
                        min="0" 
                        max={currentSong.durationSeconds || 180} 
                        step="0.1"
                        value={currentTime}
                        onChange={(e) => {
                          const newTime = parseFloat(e.target.value);
                          setCurrentTime(newTime);
                          if (playerRef.current && playerRef.current.seekTo) {
                            playerRef.current.seekTo(newTime, true);
                          }
                        }}
                        style={{ position: 'absolute', top: '-5px', left: 0, width: '100%', height: '16px', opacity: 0, cursor: 'pointer', margin: 0 }} 
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', opacity: 0.5 }}>
                      <span>{formatTime(currentTime)}</span>
                      <span>-{formatTime((currentSong.durationSeconds || 180) - currentTime)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px', marginBottom: '16px' }}>
                    <SkipBack size={24} onClick={handlePrev} style={{ cursor: 'pointer' }} className="control-icon" />
                    <button 
                      onClick={handlePlayPause}
                      style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s', flexShrink: 0 }}
                      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {isPlaying ? <Pause size={24} fill="#000" color="#000" /> : <Play size={24} fill="#000" color="#000" style={{ marginLeft: '3px' }} />}
                    </button>
                    <SkipForward size={24} onClick={handleNext} style={{ cursor: 'pointer' }} className="control-icon" />
                  </div>

                  {/* Manual Sync Adjustment */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '16px', opacity: 0.8 }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', opacity: 0.5 }}>SYNC:</span>
                    <button onClick={() => setSyncOffset(prev => prev - 1)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '10px' }}>-1s</button>
                    <span style={{ color: '#20BEFF', fontWeight: 'bold', fontSize: '11px', minWidth: '25px', textAlign: 'center' }}>{syncOffset > 0 ? `+${syncOffset}` : syncOffset}s</span>
                    <button onClick={() => setSyncOffset(prev => prev + 1)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '10px' }}>+1s</button>
                  </div>

                  {/* Playback Mode Selector (HCI Feature) */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', opacity: 0.5 }}>MODE:</span>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '8px', gap: '2px' }}>
                      <button 
                        onClick={() => {
                          setPlaybackMode('100');
                          if (playerRef.current && playerRef.current.setVolume) {
                            playerRef.current.unMute();
                            playerRef.current.setVolume(100);
                          }
                        }}
                        style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: playbackMode === '100' ? '#fff' : 'transparent', color: playbackMode === '100' ? '#000' : '#fff', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer', transition: '0.2s' }}
                      >Full Audio</button>
                      <button 
                        onClick={() => {
                          setPlaybackMode('20');
                          if (playerRef.current && playerRef.current.setVolume) {
                            playerRef.current.unMute();
                            playerRef.current.setVolume(20);
                          }
                        }}
                        style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: playbackMode === '20' ? '#fff' : 'transparent', color: playbackMode === '20' ? '#000' : '#fff', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer', transition: '0.2s' }}
                      >Low Vol</button>
                      <button 
                        onClick={() => {
                          setPlaybackMode('0');
                          if (playerRef.current && playerRef.current.mute) {
                            playerRef.current.mute();
                          }
                        }}
                        style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: playbackMode === '0' ? '#fff' : 'transparent', color: playbackMode === '0' ? '#000' : '#fff', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer', transition: '0.2s' }}
                      >Muted</button>
                    </div>
                  </div>

                  {/* Lyrics Language Toggle */}
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                    <button 
                      onClick={() => setTranslationLang('none')}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: translationLang === 'none' ? '#fff' : 'transparent', color: translationLang === 'none' ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', transition: '0.2s' }}
                    >Original</button>
                    
                    {currentSong.language?.toLowerCase() !== 'english' && (
                      <button 
                        onClick={() => setTranslationLang('en')}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: translationLang === 'en' ? '#fff' : 'transparent', color: translationLang === 'en' ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', transition: '0.2s' }}
                      >English 🇬🇧</button>
                    )}

                    <button 
                      onClick={() => setTranslationLang('hi')}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: translationLang === 'hi' ? '#fff' : 'transparent', color: translationLang === 'hi' ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', transition: '0.2s' }}
                    >Hindi 🇮🇳</button>
                    <button 
                      onClick={() => setTranslationLang('es')}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: translationLang === 'es' ? '#fff' : 'transparent', color: translationLang === 'es' ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', transition: '0.2s' }}
                    >Spanish 🇪🇸</button>
                    <button 
                      onClick={() => setTranslationLang('ko')}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: translationLang === 'ko' ? '#fff' : 'transparent', color: translationLang === 'ko' ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', transition: '0.2s' }}
                    >Korean 🇰🇷</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Toggle Button for Interactive Lyrics */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 8px 0' }}>
              <button
                onClick={() => setShowInteractiveLyrics(prev => !prev)}
                className="btn-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 26px',
                  borderRadius: '16px',
                  border: showInteractiveLyrics ? '1px solid rgba(32, 190, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.12)',
                  background: showInteractiveLyrics 
                    ? 'linear-gradient(135deg, rgba(32, 190, 255, 0.18) 0%, rgba(0, 153, 230, 0.08) 100%)' 
                    : 'rgba(255, 255, 255, 0.04)',
                  color: showInteractiveLyrics ? '#20BEFF' : '#ffffff',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: showInteractiveLyrics ? '0 0 20px rgba(32, 190, 255, 0.2)' : '0 4px 12px rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Globe size={18} color={showInteractiveLyrics ? '#20BEFF' : '#ffffff'} />
                <span>{showInteractiveLyrics ? 'Hide Interactive Lyrics' : 'Show Interactive Lyrics'}</span>
                <ChevronDown size={16} style={{ transform: showInteractiveLyrics ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
              </button>
            </div>

            {/* Bottom Row: Immersive Interactive Lyrics (Hidden by default) */}
            <AnimatePresence>
              {showInteractiveLyrics && (
                <motion.div
                  key="interactive-lyrics-card"
                  initial={{ opacity: 0, height: 0, y: -16 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -16 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div 
                    className="lyrics-card-custom"
                    style={{ 
                      background: 'rgba(255,255,255,0.03)', 
                      borderRadius: '24px', 
                      padding: '32px', 
                      border: '1px solid rgba(255,255,255,0.05)', 
                      display: 'flex', 
                      flexDirection: 'column',
                      height: '620px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Globe size={20} color="#20BEFF" />
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Interactive Lyrics</h3>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '12px', opacity: 0.5 }}>
                          {translationLang === 'none' ? 'Original Only' : `Parallel: ${translationLang === 'en' ? 'English' : translationLang === 'hi' ? 'Hindi' : translationLang === 'ko' ? 'Korean' : 'Spanish'}`}
                        </span>
                        <button
                          onClick={() => setShowInteractiveLyrics(false)}
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <X size={14} /> Close
                        </button>
                      </div>
                    </div>
                    
                    {/* Header labels for parallel columns */}
                    {translationLang !== 'none' && (
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '40px', 
                        paddingBottom: '12px', 
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        marginBottom: '20px',
                        opacity: 0.6,
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        <div>Original Lyrics</div>
                        <div>Translation ({translationLang === 'en' ? 'English' : translationLang === 'hi' ? 'Hindi' : translationLang === 'ko' ? 'Korean' : 'Spanish'})</div>
                      </div>
                    )}

                    <div style={{ 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '24px', 
                      overflowY: 'auto', 
                      paddingRight: '12px'
                    }}>
                      {segments.length > 0 ? (
                        segments.map((line: any, idx: number) => {
                          let translationText = "";
                          if (translationLang === 'en') {
                            if (currentSong?.language?.toLowerCase() === 'english') {
                              translationText = line.text;
                            } else {
                              const obj = currentSong?.translations?.english?.find((t: any) => t.order === (line.segmentOrder || idx + 1)) || currentSong?.translations?.english?.[idx];
                              translationText = obj?.text || "";
                            }
                          } else if (translationLang === 'hi') {
                            if (currentSong?.language?.toLowerCase() === 'hindi') {
                              translationText = line.text;
                            } else {
                              const obj = currentSong?.translations?.hindi?.find((t: any) => t.order === (line.segmentOrder || idx + 1)) || currentSong?.translations?.hindi?.[idx];
                              translationText = obj?.text || "";
                            }
                          } else if (translationLang === 'es') {
                            if (currentSong?.language?.toLowerCase() === 'spanish') {
                              translationText = line.text;
                            } else {
                              const obj = currentSong?.translations?.spanish?.find((t: any) => t.order === (line.segmentOrder || idx + 1)) || currentSong?.translations?.spanish?.[idx];
                              translationText = obj?.text || "";
                            }
                          } else if (translationLang === 'ko') {
                            if (currentSong?.language?.toLowerCase() === 'korean') {
                              translationText = line.text;
                            } else {
                              const obj = currentSong?.translations?.korean?.find((t: any) => t.order === (line.segmentOrder || idx + 1)) || currentSong?.translations?.korean?.[idx];
                              translationText = obj?.text || "";
                            }
                          }
                          const isActive = idx === activeIndex;

                          return (
                            <div 
                              id={`line-${idx}`}
                              key={idx} 
                              onClick={() => {
                                if (playerRef.current && playerRef.current.seekTo) {
                                  playerRef.current.seekTo(line.startTime, true);
                                  setCurrentTime(line.startTime);
                                }
                              }}
                              style={{ 
                                display: 'grid',
                                gridTemplateColumns: translationLang === 'none' ? '1fr' : '1fr 1fr',
                                gap: '40px',
                                opacity: isActive ? 1 : 0.35, 
                                transition: 'all 0.3s ease',
                                transform: isActive ? 'scale(1.015)' : 'scale(1)',
                                transformOrigin: 'left',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                background: isActive ? 'rgba(255,255,255,0.03)' : 'transparent'
                              }}
                              onMouseOver={(e) => {
                                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                              }}
                              onMouseOut={(e) => {
                                if (!isActive) e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              {/* Original Lyric Column */}
                              <p style={{ 
                                fontSize: '19px', 
                                fontWeight: '600', 
                                lineHeight: '1.6',
                                color: isActive ? '#20BEFF' : '#ffffff',
                                margin: 0,
                                transition: 'color 0.3s'
                              }}>
                                {line.text}
                              </p>

                              {/* Translation Lyric Column */}
                              {translationLang !== 'none' && (
                                <p style={{ 
                                  fontSize: '19px', 
                                  fontWeight: '600', 
                                  lineHeight: '1.6',
                                  color: isActive ? '#facc15' : 'rgba(255,255,255,0.45)',
                                  margin: 0,
                                  transition: 'color 0.3s'
                                }}>
                                  {translationText || '...'}
                                </p>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ opacity: 0.85, textAlign: 'center', margin: '40px auto', padding: '24px', maxWidth: '440px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                          <Music size={36} color="#20BEFF" style={{ marginBottom: '12px', margin: '0 auto' }} />
                          <h4 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#fff' }}>No synchronized lyrics found for this track yet</h4>
                          <p style={{ fontSize: '12px', opacity: 0.6, margin: '0 0 16px 0' }}>
                            Lingofy AI can automatically extract or generate timed lyrics and 4-language translations for this track.
                          </p>
                          {currentSong?._id && (
                            <button
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('token');
                                  const res = await fetch(`${API_BASE}/api/admin/segments/${currentSong._id}`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  if (res.ok) {
                                    const data = await res.json();
                                    if (data && data.length > 0) {
                                      setSegments(data);
                                      alert("✨ Lyrics and translations synchronized successfully!");
                                    } else {
                                      alert("Could not extract subtitles for this URL. You can paste manual lyrics when importing!");
                                    }
                                  }
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className="btn-hover"
                              style={{
                                background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)',
                                color: '#000',
                                border: 'none',
                                padding: '8px 18px',
                                borderRadius: '10px',
                                fontWeight: 'bold',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Sparkles size={14} /> Auto-Sync AI Lyrics Now
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Immersive Responsive styling tag */}
            <style>{`
              @media (max-width: 1024px) {
                .top-dashboard-grid {
                  grid-template-columns: 1fr !important;
                }
                .lyrics-card-custom {
                  height: 500px !important;
                }
              }
            `}</style>
          </div>

            {/* Bottom Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '48px' }} className="content-grid-desktop">
            <section>
              {playlists.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: 'bold' }}>Your Playlists</h3>
                    <span style={{ fontSize: '14px', color: '#20BEFF', cursor: 'pointer' }} onClick={() => setActiveTab('library')}>View Library</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px', maxHeight: '320px', overflowY: 'auto', paddingRight: '12px' }} className="custom-scrollbar">
                    {playlists.map((playlist: any, i: number) => (
                      <PlaylistCard 
                        key={playlist._id} 
                        title={playlist.title || playlist.name} 
                        color={i % 2 === 0 ? '#3b82f6' : '#20BEFF'} 
                        songsCount={playlist.songsCount !== undefined ? playlist.songsCount : (playlist.songs ? playlist.songs.length : 0)}
                        onClick={() => { 
                          if (selectedPlaylist?.playlist?._id === playlist._id) {
                            setSelectedPlaylist(null); // Toggle off
                          } else {
                            setSelectedPlaylist({ playlist, songs: [] }); 
                            fetchPlaylistDetails(playlist._id); 
                          }
                        }} 
                      />
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 'bold' }}>Suggested for You</h3>
                <span style={{ fontSize: '14px', color: '#20BEFF', cursor: 'pointer' }}>View All</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px', maxHeight: '320px', overflowY: 'auto', paddingRight: '12px' }} className="custom-scrollbar">
                {preferences?.favoriteGenres?.map((genre: string, i: number) => (
                  <PlaylistCard key={genre} title={`${genre} Mix`} color={i % 2 === 0 ? '#ff4b82' : '#8a2be2'} />
                ))}
                {!preferences?.favoriteGenres?.length && [1,2,3].map(i => (
                   <PlaylistCard key={i} title={`Discovery Mix ${i}`} color={i === 1 ? '#ff4b82' : i === 2 ? '#20BEFF' : '#8a2be2'} />
                ))}
              </div>
            </section>

            <section>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '24px' }}>
                {selectedPlaylist ? selectedPlaylist.playlist.name || selectedPlaylist.playlist.title : 'Song Library'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '320px', overflowY: 'auto', paddingRight: '12px' }} className="custom-scrollbar">
                {selectedPlaylistLoading && <div style={{ opacity: 0.5 }}>Loading playlist...</div>}
                
                {/* Playlist View */}
                {!selectedPlaylistLoading && selectedPlaylist && selectedPlaylist.songs.map((song: any, idx: number) => (
                  <SongItem 
                    key={song._id} 
                    song={song} 
                    active={currentSong?._id === song._id && queueName === (selectedPlaylist.playlist.name || selectedPlaylist.playlist.title)} 
                    onClick={() => handlePlaySongFromPlaylist(selectedPlaylist.songs, selectedPlaylist.playlist.name || selectedPlaylist.playlist.title, idx)} 
                  />
                ))}
                {!selectedPlaylistLoading && selectedPlaylist && selectedPlaylist.songs.length === 0 && (
                  <p style={{ opacity: 0.4 }}>No songs in this playlist.</p>
                )}

                {/* Default Library View */}
                {!selectedPlaylist && songs.map((song, idx) => (
                  <SongItem 
                    key={song._id} 
                    song={song} 
                    active={currentSongIndex === idx && (queueName === 'Your Library' || !queueName)} 
                    onClick={() => { handlePlaySongFromPlaylist(songs, 'Your Library', idx); }} 
                  />
                ))}
                {!selectedPlaylist && songs.length === 0 && (
                  <p style={{ opacity: 0.4 }}>No songs in the library yet.</p>
                )}
              </div>
            </section>
          </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>

      {showQuizModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1e30 0%, #0c0c14 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '28px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(32, 190, 255, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(32, 190, 255, 0.15)', filter: 'blur(50px)', borderRadius: '50%' }}></div>
            
            <div style={{ display: 'inline-flex', background: 'rgba(32, 190, 255, 0.1)', padding: '16px', borderRadius: '50%', marginBottom: '24px', color: '#20BEFF' }}>
              <Music size={40} className="pulse-icon" />
            </div>
            
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', background: 'linear-gradient(135deg, #fff 0%, #20BEFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {modalMode === 'completed' ? 'Song Completed! 🎉' : 'Practice Song 🎵'}
            </h2>
            <p style={{ opacity: 0.8, fontSize: '16px', lineHeight: '1.5', marginBottom: '32px' }}>
              {modalMode === 'completed' 
                ? `Great job listening to ${currentSong.title}. Choose a language to start practicing vocabulary:`
                : `Select a language to practice vocabulary from ${currentSong.title}:`
              }
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <button 
                  onClick={() => {
                    setShowQuizModal(false);
                    navigate(`/lessons?songId=${currentSong._id}&language=hindi`);
                  }}
                  className="btn-hover"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '16px',
                    borderRadius: '16px',
                    fontWeight: '800',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 10px 20px rgba(124, 58, 237, 0.2)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '28px' }}>🇮🇳</span>
                  <span>Hindi</span>
                </button>

                <button 
                  onClick={() => {
                    setShowQuizModal(false);
                    navigate(`/lessons?songId=${currentSong._id}&language=spanish`);
                  }}
                  className="btn-hover"
                  style={{
                    background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)',
                    color: '#000',
                    border: 'none',
                    padding: '16px',
                    borderRadius: '16px',
                    fontWeight: '800',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 10px 20px rgba(32, 190, 255, 0.2)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '28px' }}>🇪🇸</span>
                  <span>Spanish</span>
                </button>

                <button 
                  onClick={() => {
                    setShowQuizModal(false);
                    navigate(`/lessons?songId=${currentSong._id}&language=korean`);
                  }}
                  className="btn-hover"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '16px',
                    borderRadius: '16px',
                    fontWeight: '800',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '28px' }}>🇰🇷</span>
                  <span>Korean</span>
                </button>
              </div>
              
              <button 
                onClick={() => setShowQuizModal(false)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '14px',
                  borderRadius: '16px',
                  fontWeight: '600',
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginTop: '12px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              >
                {modalMode === 'completed' ? 'Maybe Later' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #121214 0%, #09090b 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '28px',
            padding: '32px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            position: 'relative'
          }}>
            <button 
              onClick={() => { setShowReviewModal(false); setSelectedAttempt(null); }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            {reviewLoading ? (
              <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.6 }}>Loading quiz review details...</div>
            ) : selectedAttempt ? (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#20BEFF', fontWeight: 'bold', letterSpacing: '1px' }}>
                    Quiz Review • {selectedAttempt.language}
                  </span>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '6px', marginBottom: '8px' }}>
                    {selectedAttempt.level === 'dynamic' ? 'Song Practice Quiz' : 'Lesson Quiz Completion'}
                  </h2>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', opacity: 0.6 }}>
                    <span>Score: <strong>{selectedAttempt.score}/{selectedAttempt.questions?.length}</strong></span>
                    <span>•</span>
                    <span>XP Earned: <strong style={{ color: '#eab308' }}>+{selectedAttempt.xpEarned} XP</strong></span>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {selectedAttempt.questions?.map((question: any, idx: number) => {
                    const userAnswerObj = selectedAttempt.userAnswers?.find((ua: any) => ua.questionId === question.id);
                    const isCorrect = userAnswerObj?.isCorrect || false;
                    const userAnswerText = userAnswerObj?.answer || '';

                    return (
                      <div 
                        key={question.id} 
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isCorrect ? 'rgba(32, 190, 255, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
                          borderRadius: '16px',
                          padding: '20px',
                          borderLeftWidth: '5px',
                          borderLeftColor: isCorrect ? '#20BEFF' : '#ef4444'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)' }}>Question {idx + 1}</span>
                          <span style={{
                            background: isCorrect ? 'rgba(32, 190, 255, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: isCorrect ? '#20BEFF' : '#ef4444',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>

                        <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>{question.questionText}</p>

                        {question.targetWord && (
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: '16px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
                            {question.targetWord}
                          </div>
                        )}

                        {question.sentence && (
                          <div style={{ fontSize: '16px', textAlign: 'center', marginBottom: '16px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
                            {question.sentence}
                          </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                          {question.options?.map((opt: string, oIdx: number) => {
                            const isUserSelected = opt === userAnswerText;
                            const isCorrectOpt = opt === question.correctAnswer;
                            
                            let bg = 'rgba(255,255,255,0.02)';
                            let border = '1px solid rgba(255,255,255,0.05)';
                            let color = '#fff';
                            
                            if (isCorrectOpt) {
                              bg = 'rgba(32, 190, 255, 0.1)';
                              border = '1px solid #20BEFF';
                            } else if (isUserSelected && !isCorrect) {
                              bg = 'rgba(239, 68, 68, 0.1)';
                              border = '1px solid #ef4444';
                            }

                            return (
                              <div key={oIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderRadius: '10px', background: bg, border: border, color: color, fontSize: '13px' }}>
                                <span>{opt}</span>
                                {isCorrectOpt && <span style={{ color: '#20BEFF', fontWeight: 'bold', fontSize: '11px' }}>Correct Answer</span>}
                                {isUserSelected && !isCorrect && <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '11px' }}>Your Answer</span>}
                              </div>
                            );
                          })}
                        </div>

                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', background: 'rgba(255,255,255,0.01)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid rgba(255,255,255,0.2)' }}>
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ padding: '40px 0', textAlign: 'center', opacity: 0.6 }}>No details found.</div>
            )}
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1e30 0%, #0c0c14 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '28px',
            padding: '40px',
            maxWidth: '450px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative'
          }}>
            <button 
              onClick={() => { setShowCreateModal(false); setNewPlaylistTitle(''); }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'inline-flex', background: 'rgba(32, 190, 255, 0.1)', padding: '16px', borderRadius: '50%', marginBottom: '24px', color: '#20BEFF' }}>
              <ListMusic size={32} />
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Create Playlist</h2>
            <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '24px' }}>Give your custom playlist a name to get started.</p>

            <div style={{ marginBottom: '24px' }}>
              <input 
                type="text" 
                placeholder="Playlist Title" 
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255,255,255,0.02)',
                  color: '#fff',
                  fontSize: '15px',
                  outline: 'none',
                  textAlign: 'center'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreatePlaylist();
                }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '14px' }}>
              <button 
                onClick={() => { setShowCreateModal(false); setNewPlaylistTitle(''); }}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '14px',
                  borderRadius: '16px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreatePlaylist}
                className="btn-hover"
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)',
                  color: '#000',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '16px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 10px 20px rgba(32, 190, 255, 0.25)'
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Badge Modal */}
      {shareBadgeModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1e30 0%, #0c0c14 100%)',
            border: `1px solid ${shareBadgeModal.color}50`, borderRadius: '28px',
            padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center',
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px ${shareBadgeModal.color}30`, position: 'relative'
          }}>
            <button 
              onClick={() => setShareBadgeModal(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            ><X size={16} /></button>

            <div style={{
              width: '100px', height: '100px', borderRadius: '24px', margin: '0 auto 24px auto',
              background: `${shareBadgeModal.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '48px', filter: `drop-shadow(0 0 20px ${shareBadgeModal.color})`
            }}>
              {shareBadgeModal.icon}
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>{shareBadgeModal.title}</h2>
            <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '32px' }}>{shareBadgeModal.desc}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => handleShareBadge('whatsapp', shareBadgeModal)} className="btn-hover" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#25D366', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                <Share2 size={18} /> Share on WhatsApp
              </button>
              <button onClick={() => handleShareBadge('instagram', shareBadgeModal)} className="btn-hover" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                <Share2 size={18} /> Share on Instagram
              </button>
              <button onClick={() => handleShareBadge('copy', shareBadgeModal)} className="btn-hover" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                <Copy size={18} /> Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Met & Goal Incomplete Toast Popups */}
      <AnimatePresence>
        {showGoalMetPopup && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            style={{
              position: 'fixed', top: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '16px 24px', borderRadius: '16px',
              display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 20px 40px rgba(16,185,129,0.35)', color: '#fff', fontWeight: 'bold'
            }}
          >
            <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '50%', padding: '8px' }}>
              <Check size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800' }}>Daily Goal Completed!</div>
              <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '500' }}>You completed your {profileForm.dailyGoal || 15} minutes learning goal today.</div>
            </div>
          </motion.div>
        )}

        {showGoalIncompleteToast && !goalAlreadyMet && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            style={{
              position: 'fixed', top: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '16px 24px', borderRadius: '16px',
              display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 20px 40px rgba(245,158,11,0.35)', color: '#000', fontWeight: 'bold'
            }}
          >
            <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '50%', padding: '8px' }}>
              <Clock size={22} color="#000" />
            </div>
            <div style={{ minWidth: '220px' }}>
              <div style={{ fontSize: '15px', fontWeight: '800' }}>Daily Goal Incomplete</div>
              <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '600' }}>
                {Math.max(1, parseInt(profileForm.dailyGoal || '15') - Math.floor(sessionTime / 60))} minutes remaining to complete today's target.
              </div>
            </div>
            <button
              onClick={() => setShowGoalIncompleteToast(false)}
              style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: '#000', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '8px' }}
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete Profile Popup Modal */}
      {showCompleteProfilePopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1e30 0%, #0c0c14 100%)',
            border: '1px solid rgba(32, 190, 255, 0.3)', borderRadius: '28px',
            padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(32, 190, 255, 0.15)', position: 'relative'
          }}>
            <button 
              onClick={() => {
                if (currentUser) sessionStorage.setItem(`profilePromptDismissed_${currentUser._id || currentUser.email || 'user'}`, 'true');
                setShowCompleteProfilePopup(false);
              }}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            ><X size={16} /></button>

            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 24px auto',
              background: 'rgba(32, 190, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#20BEFF', filter: 'drop-shadow(0 0 10px rgba(32, 190, 255, 0.3))'
            }}>
              <Settings size={40} />
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Complete Your Profile</h2>
            <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '32px', lineHeight: '1.6' }}>
              Your profile is missing some details like your target learning language. Complete it now to get personalized song recommendations and track your progress accurately!
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => {
                  if (currentUser) sessionStorage.setItem(`profilePromptDismissed_${currentUser._id || currentUser.email || 'user'}`, 'true');
                  setShowCompleteProfilePopup(false);
                }} 
                className="btn-hover" 
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Later
              </button>
              <button 
                onClick={() => { 
                  if (currentUser) sessionStorage.setItem(`profilePromptDismissed_${currentUser._id || currentUser.email || 'user'}`, 'true');
                  setShowCompleteProfilePopup(false); 
                  setActiveTab('profile'); 
                }} 
                className="btn-hover" 
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Complete Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Song Modal - Admin-grade Rich Interface for Users */}
      {showImportModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #16161d 0%, #0c0c12 100%)',
            border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '28px',
            padding: '32px', maxWidth: '1050px', width: '100%',
            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(168, 85, 247, 0.15)', position: 'relative',
            maxHeight: '92vh', overflowY: 'auto'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => { setShowImportModal(false); }}
              style={{ position: 'absolute', top: '22px', right: '22px', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            ><X size={18} /></button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #a855f7 0%, #20BEFF 100%)', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <Sparkles size={20} />
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, background: 'linear-gradient(90deg, #fff 0%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Import New Song
                  </h2>
                </div>
                <p style={{ opacity: 0.6, fontSize: '13px', margin: 0 }}>
                  Add custom YouTube songs to Lingofy. AI will automatically extract timed subtitles & parallel 4-language translations.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  fontSize: '12px', 
                  background: uploadQuota.remaining > 0 ? 'rgba(168, 85, 247, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                  border: uploadQuota.remaining > 0 ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  color: uploadQuota.remaining > 0 ? '#c084fc' : '#ef4444', 
                  padding: '6px 14px', 
                  borderRadius: '12px', 
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Upload size={13} />
                  Quota: {uploadQuota.uploadedCount} / 5 slots used
                </span>
              </div>
            </div>

            {/* Smart Suggestions Banner */}
            {suggestionsLoading ? (
              <div style={{ marginBottom: '24px', textAlign: 'center', opacity: 0.6, padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', fontSize: '13px' }}>
                <Loader2 size={16} className="spin" style={{ display: 'inline', marginRight: '8px' }} />
                Loading smart song suggestions...
              </div>
            ) : songSuggestions.length > 0 && (
              <div style={{ 
                marginBottom: '24px', 
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(32, 190, 255, 0.12) 100%)', 
                border: '1px solid rgba(168, 85, 247, 0.25)', 
                borderRadius: '20px', 
                padding: '20px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc' }}>
                    <Sparkles size={16} color="#c084fc" /> Recommended by Your Preferences & Goal
                  </h3>
                  <button 
                    onClick={fetchSongSuggestions}
                    title="Refresh suggestions"
                    style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '4px' }}
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {songSuggestions.slice(0, 3).map((suggestion, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.5)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', margin: 0 }}>{suggestion.title}</h4>
                          <span style={{ background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)', color: '#000', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '8px' }}>
                            {suggestion.language}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', opacity: 0.7, margin: '0 0 6px 0' }}>{suggestion.artist}</p>
                        <p style={{ fontSize: '11px', opacity: 0.5, fontStyle: 'italic', margin: '0 0 12px 0' }}>{suggestion.reason}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setImportForm({
                            title: suggestion.title,
                            artist: suggestion.artist,
                            language: suggestion.language,
                            url: suggestion.youtubeUrl,
                            lyrics: ''
                          });
                          setSavedSongId(null);
                          setSavedSongObj(null);
                          setTranslations(null);
                          setPreviewLines([]);
                          setImportStatusText(`Auto-filled "${suggestion.title}". Click "Save Song" to import!`);
                        }}
                        style={{ 
                          width: '100%', padding: '8px', background: 'rgba(168, 85, 247, 0.2)', 
                          border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '8px', 
                          color: '#fff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' 
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(168, 85, 247, 0.4)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(168, 85, 247, 0.2)'}
                      >
                        Use Suggestion
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2-Column Main Workspace */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
              
              {/* Form Column */}
              <div style={{ background: '#121216', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', opacity: 0.75 }}>Song Title *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Despacito"
                      value={importForm.title}
                      onChange={(e) => setImportForm({ ...importForm, title: e.target.value })}
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255,255,255,0.03)',
                        color: '#fff', fontSize: '13px', outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', opacity: 0.75 }}>Artist Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Luis Fonsi"
                      value={importForm.artist}
                      onChange={(e) => setImportForm({ ...importForm, artist: e.target.value })}
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255,255,255,0.03)',
                        color: '#fff', fontSize: '13px', outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', opacity: 0.75 }}>Original Song Language *</label>
                  <select 
                    value={importForm.language}
                    onChange={(e) => setImportForm({ ...importForm, language: e.target.value })}
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)', background: '#181822',
                      color: '#fff', fontSize: '13px', outline: 'none'
                    }}
                  >
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Korean">Korean (한국어)</option>
                    <option value="English">English</option>
                    <option value="French">French (Français)</option>
                    <option value="Japanese">Japanese (日本語)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', opacity: 0.75 }}>YouTube URL *</label>
                  <input 
                    type="text" 
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={importForm.url}
                    onChange={(e) => setImportForm({ ...importForm, url: e.target.value })}
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255,255,255,0.03)',
                      color: '#fff', fontSize: '13px', outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', opacity: 0.75 }}>Lyrics (Optional)</label>
                  <p style={{ fontSize: '12px', opacity: 0.8, color: '#c084fc', marginBottom: '8px' }}>
                    ✨ Leave this empty to automatically extract timed lyrics and timestamps from YouTube!
                  </p>
                  <textarea 
                    rows={6} 
                    placeholder="Paste lyrics line by line OR leave empty to auto-fetch from YouTube..."
                    value={importForm.lyrics}
                    onChange={(e) => {
                      setImportForm({ ...importForm, lyrics: e.target.value });
                      const lines = e.target.value.split('\n').filter(l => l.trim() !== '');
                      setPreviewLines(lines);
                    }}
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255,255,255,0.03)',
                      color: '#fff', fontSize: '13px', outline: 'none', resize: 'vertical'
                    }}
                  />
                </div>

                {/* Auto Translate Button */}
                <div style={{ marginBottom: '24px' }}>
                  <button 
                    type="button"
                    onClick={handleTranslateSong}
                    disabled={!savedSongId || isTranslating}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '12px', 
                      border: savedSongId ? '1px solid #a855f7' : '1px solid rgba(168, 85, 247, 0.3)', 
                      background: savedSongId 
                        ? 'linear-gradient(90deg, rgba(168, 85, 247, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)' 
                        : 'rgba(255,255,255,0.03)', 
                      color: savedSongId ? '#fff' : 'rgba(255,255,255,0.4)', 
                      fontWeight: '600', 
                      fontSize: '13px',
                      cursor: !savedSongId || isTranslating ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: savedSongId ? '0 0 20px rgba(168, 85, 247, 0.2)' : 'none',
                      transition: 'all 0.3s'
                    }}
                  >
                    {isTranslating ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} color={savedSongId ? "#c084fc" : undefined} />} 
                    {isTranslating ? 'Translating into 4 Languages...' : savedSongId ? 'Auto Translate Now (AI Groq)' : 'Auto Translate (Save Song First)'}
                  </button>
                </div>

                {/* Status indicator */}
                {importStatusText && (
                  <div style={{ marginBottom: '18px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#c084fc' }}>
                    <Sparkles size={15} />
                    <span>{importStatusText}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    type="button"
                    onClick={handleResetImportModal}
                    style={{ 
                      flex: 1, 
                      padding: '12px 18px', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      background: 'rgba(255,255,255,0.04)', 
                      color: '#fff', 
                      fontWeight: '600', 
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    New Song / Reset
                  </button>

                  <button 
                    type="button"
                    onClick={handleSaveImportSong}
                    disabled={isImporting || (uploadQuota.remaining <= 0 && !uploadQuota.isUnlimited && !savedSongId)}
                    style={{ 
                      flex: 1.5, 
                      padding: '12px 20px', 
                      borderRadius: '12px', 
                      border: 'none', 
                      background: savedSongId 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                        : (uploadQuota.remaining <= 0 && !uploadQuota.isUnlimited ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'), 
                      color: '#fff', 
                      fontWeight: '700', 
                      fontSize: '13px',
                      cursor: isImporting || (uploadQuota.remaining <= 0 && !uploadQuota.isUnlimited && !savedSongId) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: savedSongId ? '0 8px 20px rgba(16, 185, 129, 0.3)' : '0 8px 20px rgba(168, 85, 247, 0.3)'
                    }}
                  >
                    {isImporting ? <Loader2 size={16} className="spin" /> : (savedSongId ? <CheckCircle2 size={16} /> : <Send size={16} />)}
                    {isImporting ? 'Saving & Processing...' : (savedSongId ? 'Saved to Library' : 'Save & Import Song')}
                  </button>

                  {savedSongObj && (
                    <button
                      type="button"
                      onClick={() => {
                        handlePlaySingleSong(savedSongObj);
                        setShowImportModal(false);
                      }}
                      style={{
                        width: '100%',
                        marginTop: '4px',
                        padding: '12px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)',
                        color: '#000',
                        fontWeight: '800',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <Play size={15} fill="#000" /> Play Now in Lingofy Player
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Column */}
              <div style={{ background: '#121216', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', position: 'sticky', top: '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Languages size={17} color="#20BEFF" /> Preview Segments & AI Translations
                  </h3>
                  {previewLines.length > 0 && (
                    <span style={{ background: 'rgba(32, 190, 255, 0.15)', color: '#20BEFF', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                      {previewLines.length} lines
                    </span>
                  )}
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px', 
                  maxHeight: '440px', 
                  overflowY: 'auto',
                  paddingRight: '6px'
                }}>
                  {previewLines.length === 0 ? (
                    <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '40px 20px', textAlign: 'center', opacity: 0.5 }}>
                      <PlusCircle size={32} style={{ marginBottom: '10px' }} />
                      <p style={{ fontSize: '13px', margin: '0 0 4px 0', fontWeight: '600' }}>No lyric segments yet</p>
                      <p style={{ fontSize: '11px', margin: 0, opacity: 0.7 }}>
                        Paste lyrics, or enter a YouTube URL and click "Save" to auto-fetch timed subtitles and 4-language translations.
                      </p>
                    </div>
                  ) : (
                    previewLines.map((line, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', transition: 'all 0.2s' }}>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.5, fontWeight: '700', marginBottom: '4px', color: '#20BEFF' }}>
                          Line {idx + 1}
                        </div>
                        <div style={{ fontSize: '13px', lineHeight: '1.4', marginBottom: translations ? '8px' : '0', color: '#fff' }}>
                          {line}
                        </div>
                        
                        {translations && (
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {translations.hindi && translations.hindi[idx]?.text && (
                              <div style={{ fontSize: '12px', color: '#fed7aa' }}>
                                <span style={{ opacity: 0.6, fontSize: '10px', marginRight: '6px', fontWeight: 'bold' }}>HI:</span> 
                                {translations.hindi[idx]?.text}
                              </div>
                            )}
                            {translations.spanish && translations.spanish[idx]?.text && (
                              <div style={{ fontSize: '12px', color: '#bfdbfe' }}>
                                <span style={{ opacity: 0.6, fontSize: '10px', marginRight: '6px', fontWeight: 'bold' }}>ES:</span> 
                                {translations.spanish[idx]?.text}
                              </div>
                            )}
                            {translations.korean && translations.korean[idx]?.text && (
                              <div style={{ fontSize: '12px', color: '#e9d5ff' }}>
                                <span style={{ opacity: 0.6, fontSize: '10px', marginRight: '6px', fontWeight: 'bold' }}>KO:</span> 
                                {translations.korean[idx]?.text}
                              </div>
                            )}
                            {translations.english && translations.english[idx]?.text && (
                              <div style={{ fontSize: '12px', color: '#bbf7d0' }}>
                                <span style={{ opacity: 0.6, fontSize: '10px', marginRight: '6px', fontWeight: 'bold' }}>EN:</span> 
                                {translations.english[idx]?.text}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Quick Add Song To Playlist Modal */}
      {addToPlaylistModalSong && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1e30 0%, #0c0c14 100%)',
            border: '1px solid rgba(32, 190, 255, 0.3)', borderRadius: '28px',
            padding: '36px', maxWidth: '480px', width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(32, 190, 255, 0.15)', position: 'relative',
            maxHeight: '85vh', overflowY: 'auto'
          }}>
            <button 
              onClick={() => setAddToPlaylistModalSong(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            ><X size={16} /></button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#333', overflow: 'hidden', flexShrink: 0 }}>
                <img src={addToPlaylistModalSong.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop'} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: '11px', color: '#20BEFF', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Add to Playlist
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {addToPlaylistModalSong.title}
                </h3>
                <p style={{ fontSize: '13px', opacity: 0.6, margin: 0 }}>{addToPlaylistModalSong.artistName} • {addToPlaylistModalSong.language}</p>
              </div>
            </div>

            {/* Unlimited Quota Tip */}
            <div style={{ background: 'rgba(32, 190, 255, 0.08)', border: '1px solid rgba(32, 190, 255, 0.2)', borderRadius: '14px', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={18} color="#20BEFF" />
              <p style={{ fontSize: '12px', color: '#20BEFF', margin: 0, lineHeight: '1.4' }}>
                <strong>No quota consumed!</strong> Adding existing community songs to your playlists is 100% free and unlimited.
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', opacity: 0.8, marginBottom: '12px' }}>Choose a Playlist:</div>
              {playlists.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <p style={{ fontSize: '13px', opacity: 0.6, marginBottom: '12px' }}>You haven't created any playlists yet.</p>
                  <button
                    onClick={() => {
                      setAddToPlaylistModalSong(null);
                      setShowCreateModal(true);
                    }}
                    style={{ background: '#20BEFF', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    + Create Playlist First
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                  {playlists.map((pl) => (
                    <div
                      key={pl._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '14px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ListMusic size={16} color="#20BEFF" />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{pl.title}</div>
                          <div style={{ fontSize: '11px', opacity: 0.4 }}>{pl.songsCount || 0} songs</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleQuickAddSongToPlaylist(addToPlaylistModalSong._id, pl._id)}
                        className="btn-hover"
                        style={{
                          background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)',
                          color: '#000',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setAddToPlaylistModalSong(null)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', cursor: 'pointer', marginTop: '12px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Song Practice Quiz Modal */}
      <SongPracticeModal 
        isOpen={showQuizModal} 
        onClose={() => setShowQuizModal(false)} 
        song={currentSong} 
        defaultLanguage={learningLanguageKey} 
      />

      {/* FAQ Assistant & Interactive Screen Guided Tour */}
      <FaqChatbot />

      <style>{`
        :root { --sidebar-width: ${effectiveWidth}px; }
        .desktop-sidebar {
          transition: ${isResizing ? 'none' : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease, transform 0.3s ease'};
        }
        .main-content {
          transition: ${isResizing ? 'none' : 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'};
        }
        @media (max-width: 1024px) {
          :root { --sidebar-width: 0px; }
          .desktop-sidebar { 
            transform: translateX(${isMobileOpen ? '0' : '-100%'});
            display: flex !important;
            width: 280px !important;
            padding: 40px 24px !important;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          .mobile-toggle {
            display: flex !important;
          }
          .desktop-toggle-btn {
            display: none !important;
          }
          .sidebar-resize-handle {
            display: none !important;
          }
          .mobile-close-btn {
            display: flex !important;
          }
          main { padding: 24px !important; padding-bottom: 100px !important; padding-top: 80px !important; }
          .content-grid-desktop { grid-template-columns: 1fr !important; }
        }
        .btn-hover:hover { filter: brightness(1.1); transform: translateY(-2px); }
        .control-icon:hover { color: #20BEFF; transform: scale(1.1); }
        .control-icon { transition: all 0.2s; }
        .loader { font-size: 24px; font-weight: 800; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
        .mini-video-player:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 25px 50px rgba(0,0,0,0.7), 0 0 25px rgba(32, 190, 255, 0.25) !important;
        }
        .video-close-btn:hover {
          background: #ef4444 !important;
          border-color: #ef4444 !important;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick, collapsed = false }: any) => (
  <div onClick={onClick} style={{ 
    display: 'flex', alignItems: 'center', gap: collapsed ? '0' : '16px', padding: '12px 16px', borderRadius: '12px', 
    background: active ? 'rgba(32, 190, 255, 0.1)' : 'transparent',
    color: active ? '#20BEFF' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: active ? '700' : '500',
    justifyContent: collapsed ? 'center' : 'flex-start'
  }}>
    {icon} {!collapsed && <span>{label}</span>}
  </div>
);

const PlaylistCard = ({ title, color, songsCount, onClick }: any) => (
  <div onClick={onClick} style={{ 
    height: '140px', background: `linear-gradient(135deg, ${color}dd 0%, ${color} 100%)`,
    borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', transition: 'transform 0.2s', position: 'relative', overflow: 'hidden'
  }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
    <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span>{title}</span>
      {songsCount !== undefined && <span style={{ fontSize: '13px', fontWeight: 'normal', opacity: 0.8 }}>{songsCount} {songsCount === 1 ? 'song' : 'songs'}</span>}
    </div>
    <Globe size={80} style={{ position: 'absolute', right: '-15px', bottom: '-15px', opacity: 0.15 }} />
  </div>
);

const SongItem = ({ song, active, onClick }: any) => (
  <div onClick={onClick} style={{ 
    display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '16px', 
    background: active ? 'rgba(32, 190, 255, 0.1)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'all 0.2s',
    border: active ? '1px solid rgba(32, 190, 255, 0.3)' : '1px solid transparent'
  }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#333', overflow: 'hidden' }}>
      <img src={song.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop'} alt="Song" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', color: active ? '#20BEFF' : '#fff' }}>{song.title}</div>
      <div style={{ fontSize: '12px', opacity: 0.5 }}>{song.artistName}</div>
    </div>
    {active ? <Volume2 size={16} color="#20BEFF" /> : <Play size={14} fill="#fff" />}
  </div>
);

export default DashboardPage;
