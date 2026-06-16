import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Bell
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const SONGS_DATA = [
  { id: 1, title: 'STRUCT', artist: 'UdieNnx', duration: 234, image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop' },
  { id: 2, title: 'En Nuit', artist: 'Videoclub', duration: 221, image: 'https://picsum.photos/seed/1/200' },
  { id: 3, title: 'Black Swan', artist: 'BTS', duration: 198, image: 'https://picsum.photos/seed/2/200' },
  { id: 4, title: 'Parano (ft. DDB)', artist: 'Lomepal', duration: 202, image: 'https://picsum.photos/seed/3/200' },
  { id: 5, title: 'Kokoronashi', artist: 'Chouchou-P', duration: 276, image: 'https://picsum.photos/seed/4/200' },
];

const DashboardPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [songs, setSongs] = useState<any[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [preferences, setPreferences] = useState<any>(null);
  const [syncOffset, setSyncOffset] = useState<number>(0);
  const [translationLang, setTranslationLang] = useState<'none'|'en'|'hi'|'es'|'ko'>('none');
  const [playbackMode, setPlaybackMode] = useState<string>('100');
  const [loading, setLoading] = useState(true);
  const [roadmapProgress, setRoadmapProgress] = useState<any>(null);
  const [activeCardLanguage, setActiveCardLanguage] = useState<'hindi' | 'spanish' | 'korean'>('spanish');
  const [segments, setSegments] = useState<any[]>([]);
  const [ytReady, setYtReady] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [modalMode, setModalMode] = useState<'completed' | 'practice'>('practice');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'statistics' | 'library' | 'profile' | 'docs' | 'achievements'>('home');
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
        const userRes = await fetch('http://localhost:5000/api/users/me', {
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
          
          // Check if profile is incomplete
          if (!userData.nativeLanguage || !userData.learningLanguage || !userData.age) {
            setShowCompleteProfilePopup(true);
          }

          // If they are in traditional mode and currently on 'home' or 'library', redirect to statistics (as dashboard doesn't have lessons inside it)
          if (userData.learningMode === 'traditional') {
            setActiveTab('statistics'); // Or we just don't show the dashboard at all? Actually statistics is fine.
          }
        }

        // Fetch Preferences
        const prefRes = await fetch('http://localhost:5000/api/preferences', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (prefRes.ok) {
          const data = await prefRes.json();
          setPreferences(data);
        } else if (prefRes.status === 401) { navigate('/login'); }

        // Fetch Songs
        const songRes = await fetch('http://localhost:5000/api/admin', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (songRes.ok) {
          const data = await songRes.json();
          setSongs(data);
          setCurrentQueue(data);
        }

        // Fetch Roadmap Progress
        const progRes = await fetch('http://localhost:5000/api/lessons/progress', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (progRes.ok) {
          const data = await progRes.json();
          setRoadmapProgress(data);
        }
        // Fetch Notifications
        const notifRes = await fetch('http://localhost:5000/api/notifications', {
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
    // Session Timer logic
    const timer = setInterval(() => {
      setSessionTime(prev => {
        const newTime = prev + 1;
        // Check if goal is met
        if (profileForm.dailyGoal && !goalAlreadyMet) {
          const goalSeconds = parseInt(profileForm.dailyGoal) * 60;
          if (newTime >= goalSeconds) {
            setShowGoalMetPopup(true);
            setGoalAlreadyMet(true);
            // Auto hide after 5 seconds
            setTimeout(() => setShowGoalMetPopup(false), 5000);
          }
        }
        return newTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [profileForm.dailyGoal, goalAlreadyMet]);

  useEffect(() => {
    if (learningLanguageKey) {
      setActiveCardLanguage(learningLanguageKey);
    }
  }, [learningLanguageKey]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab') as 'home' | 'statistics' | 'library';
    if (currentUser?.learningMode === 'traditional' && (!tabParam || tabParam === 'home' || tabParam === 'library')) {
      setActiveTab('statistics');
    } else if (tabParam && ['home', 'statistics', 'library'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search, currentUser]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/lessons/history', {
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
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
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
      await fetch('http://localhost:5000/api/notifications/read-all', {
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
  }, [activeTab]);

  const handleReviewAttempt = async (attemptId: string) => {
    setReviewLoading(true);
    setShowReviewModal(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/lessons/history/${attemptId}`, {
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
      const res = await fetch('http://localhost:5000/api/users/me/mode', {
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
      const res = await fetch('http://localhost:5000/api/users/me/profile', {
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
    const last7 = [...history].slice(0, 7).reverse();
    return last7.map((attempt, index) => ({
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

  const points = chartData.map((d, i) => {
    const x = xPadding + (chartData.length > 1 ? (i * plotWidth / (chartData.length - 1)) : plotWidth / 2);
    const y = height - yPadding - (d.score * plotHeight / 12); // score out of 12 max
    return { x, y, score: d.score, label: d.label, xp: d.xp };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPath = points.length > 0 
    ? `M ${points[0].x} ${height - yPadding} ` + points.map(p => `L ${p.x} ${p.y}`).join(' ') + ` L ${points[points.length - 1].x} ${height - yPadding} Z`
    : '';

  useEffect(() => {
    if (currentSong?._id) {
      setSyncOffset(0); // Reset sync for new song
      
      const songLang = currentSong.language?.toLowerCase() || '';
      if (songLang !== 'english' && songLang !== '') {
        setTranslationLang('en');
      } else {
        setTranslationLang('hi');
      }

      const fetchSegments = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:5000/api/admin/segments/${currentSong._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setSegments(data);
          }
        } catch (err) { console.error(err); }
      };
      fetchSegments();
    }
  }, [currentSong]);

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
    if (videoId && ytReady && (window as any).YT && (window as any).YT.Player) {
      if (playerRef.current && playerRef.current.loadVideoById) {
        playerRef.current.loadVideoById(videoId);
      } else {
        playerRef.current = new (window as any).YT.Player('youtube-player', {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: { 'autoplay': 1, 'controls': 0, 'mute': 0, 'enablejsapi': 1 },
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
            'onReady': () => {
              console.log("Player Ready");
            }
          }
        });
      }
    }
  }, [videoId, ytReady]);

  // Sync currentTime with actual YouTube player
  useEffect(() => {
    let interval: any;
    if (isPlaying && playerRef.current && playerRef.current.getCurrentTime) {
      interval = setInterval(() => {
        try {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
        } catch (e) { console.error("Sync error", e); }
      }, 300); // 300ms for ultra-smooth sync
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (!playerRef.current || typeof playerRef.current.playVideo !== 'function') {
      console.log("Player not ready yet...");
      return;
    }
    
    const state = playerRef.current.getPlayerState();
    if (state === (window as any).YT.PlayerState.PLAYING) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
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
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#12d15e' }}>{totalQuizzes}</div>
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
            if (intensity === 1) return 'rgba(18, 209, 94, 0.4)';
            if (intensity === 2) return 'rgba(18, 209, 94, 0.7)';
            return 'rgba(18, 209, 94, 1)';
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
                      <stop offset="0%" stopColor="#12d15e" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#12d15e" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  {[0, 3, 6, 9, 12].map(scoreVal => {
                    const yVal = height - yPadding - (scoreVal * plotHeight / 12);
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
                  <polyline points={polylinePoints} fill="none" stroke="#12d15e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px rgba(18, 209, 94, 0.4))' }} />

                  {/* Circular Markers */}
                  {points.map((p, i) => (
                    <circle 
                      key={i} 
                      cx={p.x} 
                      cy={p.y} 
                      r="6" 
                      fill="#000" 
                      stroke="#12d15e" 
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
                    background: '#12d15e',
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
                          {attempt.level === 'dynamic' ? 'Song Practice' : 'Lesson'} • {attempt.language}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '2px' }}>
                          {new Date(attempt.completedAt).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#12d15e' }}>{attempt.score} Correct</div>
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
      const res = await fetch('http://localhost:5000/api/playlists', {
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
      const res = await fetch(`http://localhost:5000/api/playlists/${playlistId}`, {
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
      const res = await fetch('http://localhost:5000/api/playlists', {
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
      const res = await fetch(`http://localhost:5000/api/playlists/${playlistId}`, {
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
      const res = await fetch(`http://localhost:5000/api/playlists/${selectedPlaylist.playlist._id}/songs`, {
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
      const res = await fetch(`http://localhost:5000/api/playlists/${selectedPlaylist.playlist._id}/songs/${songId}`, {
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
      setSelectedPlaylist(null);
    }
  }, [activeTab]);

  const renderLibrary = () => {
    const filteredSongs = playlistSearchQuery.trim() === "" 
      ? songs 
      : songs.filter(s => 
          s.title.toLowerCase().includes(playlistSearchQuery.toLowerCase()) || 
          s.artistName.toLowerCase().includes(playlistSearchQuery.toLowerCase())
        );

    return (
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Your Library</h1>
            <p style={{ opacity: 0.6, margin: 0 }}>Create, manage, and listen to your custom playlists.</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-hover"
            style={{
              background: 'linear-gradient(135deg, #12d15e 0%, #0bb04c 100%)',
              color: '#000',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 10px 20px rgba(18, 209, 94, 0.15)'
            }}
          >
            <Plus size={16} /> Create Playlist
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '32px', alignItems: 'start' }} className="content-grid-desktop">
          
          {/* Playlists Sidebar */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ListMusic size={18} color="#12d15e" /> My Playlists
            </h3>

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
                        background: isSelected ? 'rgba(18, 209, 94, 0.08)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isSelected ? '#12d15e' : 'rgba(255,255,255,0.04)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '10px', 
                          background: isSelected ? 'rgba(18, 209, 94, 0.15)' : 'rgba(255,255,255,0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSelected ? '#12d15e' : '#fff'
                        }}>
                          <Music size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: isSelected ? '#12d15e' : '#fff' }}>
                            {playlist.title}
                          </div>
                          <div style={{ fontSize: '11px', opacity: 0.4, marginTop: '2px' }}>
                            {isCurrentlyPlaying ? 'Currently Playing' : 'Playlist'}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} opacity={isSelected ? 1 : 0.4} color={isSelected ? '#12d15e' : '#fff'} />
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
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedPlaylist.playlist.title}</h2>
                    <p style={{ opacity: 0.5, fontSize: '13px', margin: '4px 0 0 0' }}>
                      {selectedPlaylist.songs.length} {selectedPlaylist.songs.length === 1 ? 'song' : 'songs'} in playlist
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => handlePlayPlaylist(selectedPlaylist.songs, selectedPlaylist.playlist.title)}
                      className="btn-hover"
                      style={{
                        background: '#12d15e',
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
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Songs List</h3>
                  {selectedPlaylist.songs.length === 0 ? (
                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', textAlign: 'center', opacity: 0.5 }}>
                      No songs in this playlist. Search and add some below!
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
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: isCurrentPlayingSong ? '#12d15e' : '#fff' }}>
                                  {song.title}
                                </div>
                                <div style={{ fontSize: '12px', opacity: 0.5 }}>{song.artistName}</div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <button 
                                onClick={() => handlePlaySongFromPlaylist(selectedPlaylist.songs, selectedPlaylist.playlist.title, index)}
                                style={{
                                  background: isCurrentPlayingSong ? 'rgba(18, 209, 94, 0.1)' : 'rgba(255,255,255,0.05)',
                                  border: 'none',
                                  color: isCurrentPlayingSong ? '#12d15e' : '#fff',
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
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Add Songs to Playlist</h3>
                  
                  <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '16px', top: '16px', opacity: 0.4 }} />
                    <input 
                      type="text" 
                      placeholder="Search songs by title or artist..." 
                      value={playlistSearchQuery}
                      onChange={(e) => setPlaylistSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 44px',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.02)',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                    {filteredSongs.slice(0, 5).map((song) => {
                      const isAlreadyIn = selectedPlaylist.songs.some((s: any) => s._id === song._id);
                      return (
                        <div 
                          key={song._id} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            background: 'rgba(255,255,255,0.01)', 
                            border: '1px solid rgba(255,255,255,0.03)', 
                            borderRadius: '12px', 
                            padding: '10px 14px' 
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#333', overflow: 'hidden' }}>
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
                              background: isAlreadyIn ? 'rgba(255,255,255,0.05)' : 'rgba(18, 209, 94, 0.1)',
                              border: 'none',
                              color: isAlreadyIn ? 'rgba(255,255,255,0.3)' : '#12d15e',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: isAlreadyIn ? 'not-allowed' : 'pointer'
                            }}
                            className="btn-hover"
                          >
                            {isAlreadyIn ? 'Added' : 'Add'}
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
      </div>
    );
  };

  const renderDocs = () => {
    return (
      <div style={{ padding: '32px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px', marginTop: '24px' }}>
          <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '16px', background: 'linear-gradient(135deg, #fff 0%, #12d15e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>Welcome to Lingofy</h2>
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
            <div className="doc-card" style={{ background: 'linear-gradient(135deg, rgba(18, 209, 94, 0.08) 0%, rgba(0,0,0,0) 100%)', border: '1px solid rgba(18, 209, 94, 0.2)', borderRadius: '24px', padding: '32px', transition: 'all 0.3s ease', cursor: 'default' }}>
              <div style={{ background: '#12d15e', color: '#000', width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 8px 16px rgba(18, 209, 94, 0.3)' }}><Music size={24} /></div>
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
                <div style={{ background: 'rgba(18, 209, 94, 0.15)', color: '#12d15e', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', flexShrink: 0, border: '4px solid #14141c' }}>1</div>
                <div style={{ paddingTop: '8px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#12d15e', marginBottom: '8px' }}>Easy Tier (Vocabulary)</h4>
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
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #12d15e' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#12d15e' }}>Activity Streak Heatmap</h4>
                <p style={{ opacity: 0.7, fontSize: '14px', margin: 0, lineHeight: '1.5' }}>Similar to GitHub contributions, this visual grid shows your daily activity. The brighter the green, the more quizzes you've completed that day! Keep your streak alive to build strong habits.</p>
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
        id: `inter_${lang}`, title: `Scholar (${lang.charAt(0).toUpperCase()+lang.slice(1)})`, desc: 'Mastered intermediate sentence structures.', icon: '🏆', color: '#12d15e',
        unlocked: prog.intermediateCompleted >= 2
      });
      badges.push({
        id: `hard_${lang}`, title: `Master (${lang.charAt(0).toUpperCase()+lang.slice(1)})`, desc: 'Completed advanced comprehension challenges.', icon: '👑', color: '#eab308',
        unlocked: prog.hardCompleted >= 3
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
              onClick={() => b.unlocked ? setShareBadgeModal(b) : null}
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
      <div style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Profile</h2>
        <p style={{ opacity: 0.6, fontSize: '15px', marginBottom: '32px' }}>Update your personal details, demographics, and learning goals.</p>

        <form onSubmit={handleSaveProfile} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.8 }}>Full Name</label>
              <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.8 }}>Email <span style={{opacity:0.5}}>(Read Only)</span></label>
              <input type="email" value={currentUser?.email || ''} readOnly style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.5)', outline: 'none', cursor: 'not-allowed' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.8 }}>Native Language</label>
              <select value={profileForm.nativeLanguage} onChange={(e) => setProfileForm({...profileForm, nativeLanguage: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#121214', color: '#fff', outline: 'none' }}>
                <option value="">Select Native Language</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
                <option value="Korean">Korean</option>
                <option value="French">French</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.8 }}>Target Language</label>
              <select value={profileForm.learningLanguage} onChange={(e) => setProfileForm({...profileForm, learningLanguage: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#121214', color: '#fff', outline: 'none' }}>
                <option value="">Select Target Language</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
                <option value="Korean">Korean</option>
                <option value="French">French</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.8 }}>Age</label>
              <input type="number" min="1" max="120" value={profileForm.age} onChange={(e) => setProfileForm({...profileForm, age: e.target.value})} placeholder="e.g. 25" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.8 }}>Mobile</label>
              <input type="text" value={profileForm.mobile} onChange={(e) => setProfileForm({...profileForm, mobile: e.target.value})} placeholder="e.g. +1 234 567 8900" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.8 }}>Profession (Optional)</label>
              <input type="text" value={profileForm.profession} onChange={(e) => setProfileForm({...profileForm, profession: e.target.value})} placeholder="e.g. Software Engineer" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.8 }}>Known Languages (comma-separated)</label>
              <input type="text" value={profileForm.knownLanguages} onChange={(e) => setProfileForm({...profileForm, knownLanguages: e.target.value})} placeholder="e.g. English, Hindi" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.8 }}>About Me</label>
            <textarea value={profileForm.about} onChange={(e) => setProfileForm({...profileForm, about: e.target.value})} placeholder="Tell us a little about yourself..." style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', minHeight: '80px', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.8 }}>Daily Goal (Minutes)</label>
              <select value={profileForm.dailyGoal} onChange={(e) => setProfileForm({...profileForm, dailyGoal: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#121214', color: '#fff', outline: 'none' }}>
                <option value="10">10 mins (Casual)</option>
                <option value="15">15 mins (Regular)</option>
                <option value="30">30 mins (Serious)</option>
                <option value="60">60 mins (Intense)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.8 }}>Current Proficiency <span style={{opacity:0.5}}>(Read Only)</span></label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                <div
                  key={lvl}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${profileForm.proficiency === lvl ? '#12d15e' : 'rgba(255,255,255,0.1)'}`,
                    background: profileForm.proficiency === lvl ? 'rgba(18, 209, 94, 0.1)' : 'rgba(255,255,255,0.02)',
                    color: profileForm.proficiency === lvl ? '#12d15e' : 'rgba(255,255,255,0.5)', fontWeight: 'bold', textAlign: 'center', transition: 'all 0.2s', textTransform: 'capitalize',
                    cursor: 'not-allowed'
                  }}
                >{lvl}</div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
            {profileSuccessMessage && <span style={{ color: '#12d15e', fontSize: '13px', fontWeight: 'bold' }}>{profileSuccessMessage}</span>}
            <button type="submit" disabled={savingProfile} className="btn-hover" style={{ background: '#12d15e', color: '#000', border: 'none', padding: '14px 32px', borderRadius: '12px', fontWeight: '800', cursor: savingProfile ? 'not-allowed' : 'pointer', opacity: savingProfile ? 0.7 : 1 }}>
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
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
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(18, 209, 94, 0.15)',
          border: '1px solid rgba(255,255,255,0.12)',
          background: '#000',
          display: isPlaying && !hideVideo ? 'block' : 'none',
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
      <aside className={`desktop-sidebar ${isMobileOpen ? 'sidebar-open' : ''}`} style={{ 
        width: isSidebarCollapsed ? '88px' : '280px', background: '#000', borderRight: '1px solid rgba(255,255,255,0.05)',
        padding: isSidebarCollapsed ? '40px 12px' : '40px 24px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', marginBottom: '48px', position: 'relative' }}>
          {!isSidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="/Logo-1.png" alt="Logo" style={{ width: '40px' }} />
              <span style={{ fontSize: '24px', fontWeight: '800' }}>Lingofy</span>
            </div>
          )}
          {isSidebarCollapsed && (
            <img src="/Logo-1.png" alt="Logo" style={{ width: '40px' }} />
          )}
          
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="desktop-toggle-btn"
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
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {currentUser?.learningMode !== 'traditional' && (
            <NavItem icon={<Home size={20} />} label="Home" active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setIsMobileOpen(false); }} collapsed={isSidebarCollapsed} />
          )}
          <NavItem icon={<BookOpen size={20} />} label="Lessons" onClick={() => navigate('/lessons')} collapsed={isSidebarCollapsed} />
          {currentUser?.learningMode !== 'traditional' && (
            <NavItem icon={<Music size={20} />} label="Library" active={activeTab === 'library'} onClick={() => { setActiveTab('library'); setIsMobileOpen(false); }} collapsed={isSidebarCollapsed} />
          )}
          <NavItem icon={<BarChart2 size={20} />} label="Statistics" active={activeTab === 'statistics'} onClick={() => { setActiveTab('statistics'); setIsMobileOpen(false); }} collapsed={isSidebarCollapsed} />
          <NavItem icon={<Award size={20} />} label="Achievements" active={activeTab === 'achievements'} onClick={() => { setActiveTab('achievements'); setIsMobileOpen(false); }} collapsed={isSidebarCollapsed} />
          <NavItem icon={<HelpCircle size={20} />} label="Documentation" active={activeTab === 'docs'} onClick={() => { setActiveTab('docs'); setIsMobileOpen(false); }} collapsed={isSidebarCollapsed} />
        </nav>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
          <NavItem icon={<Settings size={20} />} label="Profile" active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setIsMobileOpen(false); }} collapsed={isSidebarCollapsed} />
          <NavItem icon={<LogOut size={20} />} label="Logout" onClick={() => { localStorage.clear(); navigate('/login'); }} collapsed={isSidebarCollapsed} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content custom-scrollbar" style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden', flex: 1, marginLeft: 'var(--sidebar-width, 0px)', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative' }}>
        
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
                width: '320px',
                background: '#121214',
                border: '1px solid #27272a',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                overflow: 'hidden',
                zIndex: 100
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #27272a' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>Notifications</h4>
                  {notifications.filter((n: any) => !n.isRead).length > 0 && (
                    <button 
                      onClick={handleMarkAllNotificationsAsRead}
                      style={{ background: 'none', border: 'none', color: '#a855f7', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', opacity: 0.5, fontSize: '13px' }}>
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notif: any) => (
                      <div 
                        key={notif._id}
                        onClick={() => {
                          if (!notif.isRead) handleMarkNotificationAsRead(notif._id);
                        }}
                        style={{
                          padding: '16px',
                          borderBottom: '1px solid rgba(255,255,255,0.02)',
                          background: notif.isRead ? 'transparent' : 'rgba(168, 85, 247, 0.05)',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          position: 'relative'
                        }}
                      >
                        {!notif.isRead && <div style={{ position: 'absolute', left: '8px', top: '24px', width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7' }}></div>}
                        <div style={{ paddingLeft: notif.isRead ? '0' : '12px' }}>
                          <h5 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: notif.isRead ? 'normal' : 'bold' }}>{notif.title}</h5>
                          <p style={{ margin: 0, fontSize: '12px', opacity: 0.6, lineHeight: '1.4' }}>{notif.message}</p>
                          <span style={{ display: 'block', marginTop: '8px', fontSize: '10px', opacity: 0.4 }}>
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
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
            {activeTab === 'docs' ? renderDocs() : activeTab === 'achievements' ? renderAchievements() : activeTab === 'profile' ? renderProfile() : activeTab === 'statistics' ? renderStatistics() : activeTab === 'library' && currentUser?.learningMode !== 'traditional' ? renderLibrary() : currentUser?.learningMode !== 'traditional' ? (
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
                      <div style={{ background: '#12d15e', color: '#000', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 'bold' }}>
                        {activeCardLanguage === 'hindi' ? 'N3' : activeCardLanguage === 'spanish' ? 'A2' : 'TOPIK 2'}
                      </div>
                    </div>

                    {/* Visual Roadmap Steps */}
                    <div style={{ padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ fontSize: '11px', opacity: 0.4, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>Roadmap Stages</div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '0 10px' }}>
                        {/* Connector Line behind steps */}
                        <div style={{ position: 'absolute', top: '15px', left: '20px', right: '20px', height: '2px', background: 'rgba(255,255,255,0.08)', zIndex: 1 }}>
                          <div style={{ width: `${(totalCompleted / 5) * 100}%`, height: '100%', background: '#12d15e', transition: 'width 0.5s ease' }}></div>
                        </div>

                        {/* Step 1: Easy */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: '4px' }}>
                          <div style={{ 
                            width: '30px', height: '30px', borderRadius: '50%', 
                            background: isEasyPassed ? '#12d15e' : (progressObj.currentStage === 'easy' ? '#1e1e1e' : 'rgba(255,255,255,0.05)'), 
                            border: `2px solid ${isEasyPassed || progressObj.currentStage === 'easy' ? '#12d15e' : 'rgba(255,255,255,0.1)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold',
                            color: isEasyPassed ? '#000' : '#fff', boxShadow: progressObj.currentStage === 'easy' ? '0 0 10px rgba(18,209,94,0.4)' : 'none'
                          }}>
                            {isEasyPassed ? '✓' : 'E'}
                          </div>
                          <span style={{ fontSize: '10px', opacity: progressObj.currentStage === 'easy' ? 1 : 0.5, fontWeight: progressObj.currentStage === 'easy' ? 'bold' : 'normal' }}>Easy</span>
                        </div>

                        {/* Step 2: Intermediate */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: '4px' }}>
                          <div style={{ 
                            width: '30px', height: '30px', borderRadius: '50%', 
                            background: isInterPassed ? '#12d15e' : (progressObj.currentStage === 'intermediate' ? '#1e1e1e' : 'rgba(255,255,255,0.05)'), 
                            border: `2px solid ${isInterPassed || progressObj.currentStage === 'intermediate' ? '#12d15e' : 'rgba(255,255,255,0.1)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold',
                            color: isInterPassed ? '#000' : '#fff', boxShadow: progressObj.currentStage === 'intermediate' ? '0 0 10px rgba(18,209,94,0.4)' : 'none'
                          }}>
                            {isInterPassed ? '✓' : 'I'}
                          </div>
                          <span style={{ fontSize: '10px', opacity: progressObj.currentStage === 'intermediate' ? 1 : 0.5, fontWeight: progressObj.currentStage === 'intermediate' ? 'bold' : 'normal' }}>Inter</span>
                        </div>

                        {/* Step 3: Hard */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: '4px' }}>
                          <div style={{ 
                            width: '30px', height: '30px', borderRadius: '50%', 
                            background: isHardPassed ? '#12d15e' : (progressObj.currentStage === 'hard' ? '#1e1e1e' : 'rgba(255,255,255,0.05)'), 
                            border: `2px solid ${isHardPassed || progressObj.currentStage === 'hard' ? '#12d15e' : 'rgba(255,255,255,0.1)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold',
                            color: isHardPassed ? '#000' : '#fff', boxShadow: progressObj.currentStage === 'hard' ? '0 0 10px rgba(18,209,94,0.4)' : 'none'
                          }}>
                            {isHardPassed ? '✓' : `${progressObj.hardCompleted}/3`}
                          </div>
                          <span style={{ fontSize: '10px', opacity: progressObj.currentStage === 'hard' ? 1 : 0.5, fontWeight: progressObj.currentStage === 'hard' ? 'bold' : 'normal' }}>Hard</span>
                        </div>
                                  {/* Achievements Link Section */}
                    <div style={{ marginTop: '8px' }}>
                      <button 
                        onClick={() => setActiveTab('achievements')}
                        style={{ 
                          width: '100%',
                          background: 'rgba(255,255,255,0.02)', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
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
                        <div style={{ width: `${progressPercent}%`, height: '100%', background: '#12d15e', transition: 'width 0.5s ease' }}></div>
                      </div>

                      <button 
                        onClick={() => {
                          const levelToUse = progressObj.currentStage === 'completed' ? 'hard' : progressObj.currentStage;
                          const songParam = currentSong?._id ? `&songId=${currentSong._id}` : '';
                          navigate(`/lessons?language=${activeCardLanguage}&level=${levelToUse}${songParam}`);
                        }}
                        className="btn-hover"
                        style={{ 
                          width: '100%', background: '#12d15e', color: '#000', border: 'none', padding: '14px', borderRadius: '14px', 
                          fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer',
                          fontSize: '14px', boxShadow: '0 4px 12px rgba(18,209,94,0.15)'
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
                  <div style={{ width: '100px', height: '100px', borderRadius: '16px', background: '#333', overflow: 'hidden', boxShadow: isPlaying ? '0 0 20px rgba(18, 209, 94, 0.3)' : 'none', transition: 'all 0.5s', flexShrink: 0 }}>
                    <img src={currentSong.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop'} alt="Album" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: isPlaying ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.5s' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentSong.title}</h3>
                    <p style={{ opacity: 0.6, margin: '0 0 12px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentSong.artistName || currentSong.artist}</p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                       <div style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px' }}>HQ AUDIO</div>
                       <div style={{ background: 'rgba(18, 209, 94, 0.2)', color: '#12d15e', padding: '4px 8px', borderRadius: '4px', fontSize: '10px' }}>LYRICS</div>
                       {currentSong?._id && (
                         <button 
                           onClick={() => {
                             setModalMode('practice');
                             setShowQuizModal(true);
                           }}
                           className="btn-hover"
                           style={{ 
                             background: 'rgba(18, 209, 94, 0.1)', 
                             color: '#12d15e', 
                             border: '1px solid rgba(18, 209, 94, 0.3)', 
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
                        <div style={{ width: `${(currentTime / (currentSong.durationSeconds || 180)) * 100}%`, height: '100%', background: '#12d15e', borderRadius: '4px', position: 'relative' }}>
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
                    <span style={{ color: '#12d15e', fontWeight: 'bold', fontSize: '11px', minWidth: '25px', textAlign: 'center' }}>{syncOffset > 0 ? `+${syncOffset}` : syncOffset}s</span>
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

            {/* Bottom Row: Immersive Interactive Lyrics */}
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
                  <Globe size={20} color="#12d15e" />
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Interactive Lyrics</h3>
                </div>
                <span style={{ fontSize: '12px', opacity: 0.5 }}>
                  {translationLang === 'none' ? 'Original Only' : `Parallel: ${translationLang === 'en' ? 'English' : translationLang === 'hi' ? 'Hindi' : translationLang === 'ko' ? 'Korean' : 'Spanish'}`}
                </span>
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
                      translationText = currentSong?.translations?.english?.[idx]?.text;
                    } else if (translationLang === 'hi') {
                      translationText = currentSong?.translations?.hindi?.[idx]?.text;
                    } else if (translationLang === 'es') {
                      translationText = currentSong?.translations?.spanish?.[idx]?.text;
                    } else if (translationLang === 'ko') {
                      translationText = currentSong?.translations?.korean?.[idx]?.text;
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
                          color: isActive ? '#12d15e' : '#ffffff',
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
                  <div style={{ opacity: 0.4, textAlign: 'center', marginTop: '60px' }}>
                    <Music size={40} style={{ marginBottom: '16px', margin: '0 auto' }} />
                    <p>Lyrics will appear here when synced.</p>
                  </div>
                )}
              </div>
            </div>
            
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 'bold' }}>Suggested for You</h3>
                <span style={{ fontSize: '14px', color: '#12d15e', cursor: 'pointer' }}>View All</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px', maxHeight: '320px', overflowY: 'auto', paddingRight: '12px' }} className="custom-scrollbar">
                {preferences?.favoriteGenres?.map((genre: string, i: number) => (
                  <PlaylistCard key={genre} title={`${genre} Mix`} color={i % 2 === 0 ? '#ff4b82' : '#8a2be2'} />
                ))}
                {!preferences?.favoriteGenres?.length && [1,2,3].map(i => (
                   <PlaylistCard key={i} title={`Discovery Mix ${i}`} color={i === 1 ? '#ff4b82' : i === 2 ? '#12d15e' : '#8a2be2'} />
                ))}
              </div>
            </section>

            <section>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '24px' }}>Song Library</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '320px', overflowY: 'auto', paddingRight: '12px' }} className="custom-scrollbar">
                {songs.map((song, idx) => (
                  <SongItem 
                    key={song._id} 
                    song={song} 
                    active={currentSongIndex === idx} 
                    onClick={() => { setCurrentSongIndex(idx); setCurrentTime(0); setIsPlaying(true); setHideVideo(false); }} 
                  />
                ))}
                {songs.length === 0 && <p style={{ opacity: 0.4 }}>No songs in the library yet.</p>}
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
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(18, 209, 94, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(18, 209, 94, 0.15)', filter: 'blur(50px)', borderRadius: '50%' }}></div>
            
            <div style={{ display: 'inline-flex', background: 'rgba(18, 209, 94, 0.1)', padding: '16px', borderRadius: '50%', marginBottom: '24px', color: '#12d15e' }}>
              <Music size={40} className="pulse-icon" />
            </div>
            
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', background: 'linear-gradient(135deg, #fff 0%, #12d15e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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
                    background: 'linear-gradient(135deg, #12d15e 0%, #0bb04c 100%)',
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
                    boxShadow: '0 10px 20px rgba(18, 209, 94, 0.2)',
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
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#12d15e', fontWeight: 'bold', letterSpacing: '1px' }}>
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
                          border: `1px solid ${isCorrect ? 'rgba(18, 209, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
                          borderRadius: '16px',
                          padding: '20px',
                          borderLeftWidth: '5px',
                          borderLeftColor: isCorrect ? '#12d15e' : '#ef4444'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)' }}>Question {idx + 1}</span>
                          <span style={{
                            background: isCorrect ? 'rgba(18, 209, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: isCorrect ? '#12d15e' : '#ef4444',
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
                              bg = 'rgba(18, 209, 94, 0.1)';
                              border = '1px solid #12d15e';
                            } else if (isUserSelected && !isCorrect) {
                              bg = 'rgba(239, 68, 68, 0.1)';
                              border = '1px solid #ef4444';
                            }

                            return (
                              <div key={oIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderRadius: '10px', background: bg, border: border, color: color, fontSize: '13px' }}>
                                <span>{opt}</span>
                                {isCorrectOpt && <span style={{ color: '#12d15e', fontWeight: 'bold', fontSize: '11px' }}>Correct Answer</span>}
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

            <div style={{ display: 'inline-flex', background: 'rgba(18, 209, 94, 0.1)', padding: '16px', borderRadius: '50%', marginBottom: '24px', color: '#12d15e' }}>
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
                  background: 'linear-gradient(135deg, #12d15e 0%, #0bb04c 100%)',
                  color: '#000',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '16px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 10px 20px rgba(18, 209, 94, 0.15)'
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

      {/* Goal Met Popup Toast */}
      <AnimatePresence>
        {showGoalMetPopup && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            style={{
              position: 'fixed', top: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
              background: 'linear-gradient(135deg, #12d15e 0%, #059669 100%)', padding: '16px 24px', borderRadius: '16px',
              display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 20px 40px rgba(18,209,94,0.4)', color: '#000', fontWeight: 'bold'
            }}
          >
            <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '50%', padding: '8px' }}><Check size={24} color="#000" /></div>
            <div>
              <div style={{ fontSize: '16px' }}>Daily Goal Met! 🎉</div>
              <div style={{ fontSize: '12px', opacity: 0.8, fontWeight: 'normal' }}>You spent {profileForm.dailyGoal} minutes learning today.</div>
            </div>
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
            border: '1px solid rgba(18, 209, 94, 0.3)', borderRadius: '28px',
            padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(18, 209, 94, 0.1)', position: 'relative'
          }}>
            <button 
              onClick={() => setShowCompleteProfilePopup(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            ><X size={16} /></button>

            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 24px auto',
              background: 'rgba(18, 209, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#12d15e', filter: 'drop-shadow(0 0 10px rgba(18, 209, 94, 0.3))'
            }}>
              <Settings size={40} />
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Complete Your Profile</h2>
            <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '32px', lineHeight: '1.6' }}>
              Your profile is missing some details like your target learning language. Complete it now to get personalized song recommendations and track your progress accurately!
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowCompleteProfilePopup(false)} 
                className="btn-hover" 
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Later
              </button>
              <button 
                onClick={() => { setShowCompleteProfilePopup(false); setActiveTab('profile'); }} 
                className="btn-hover" 
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#12d15e', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Complete Now
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        :root { --sidebar-width: ${isSidebarCollapsed ? '88px' : '280px'}; }
        .desktop-sidebar {
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease, transform 0.3s ease;
        }
        .main-content {
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
          .mobile-close-btn {
            display: flex !important;
          }
          main { padding: 24px !important; padding-bottom: 100px !important; padding-top: 80px !important; }
          .content-grid-desktop { grid-template-columns: 1fr !important; }
        }
        .btn-hover:hover { filter: brightness(1.1); transform: translateY(-2px); }
        .control-icon:hover { color: #12d15e; transform: scale(1.1); }
        .control-icon { transition: all 0.2s; }
        .loader { font-size: 24px; font-weight: 800; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
        .mini-video-player:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 25px 50px rgba(0,0,0,0.7), 0 0 25px rgba(18, 209, 94, 0.25) !important;
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
    background: active ? 'rgba(18, 209, 94, 0.1)' : 'transparent',
    color: active ? '#12d15e' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: active ? '700' : '500',
    justifyContent: collapsed ? 'center' : 'flex-start'
  }}>
    {icon} {!collapsed && <span>{label}</span>}
  </div>
);

const PlaylistCard = ({ title, color }: any) => (
  <div style={{ 
    height: '140px', background: `linear-gradient(135deg, ${color}dd 0%, ${color} 100%)`,
    borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'flex-end', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', transition: 'transform 0.2s', position: 'relative', overflow: 'hidden'
  }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
    <span style={{ zIndex: 1 }}>{title}</span>
    <Globe size={80} style={{ position: 'absolute', right: '-15px', bottom: '-15px', opacity: 0.15 }} />
  </div>
);

const SongItem = ({ song, active, onClick }: any) => (
  <div onClick={onClick} style={{ 
    display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '16px', 
    background: active ? 'rgba(18, 209, 94, 0.1)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'all 0.2s',
    border: active ? '1px solid rgba(18, 209, 94, 0.3)' : '1px solid transparent'
  }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#333', overflow: 'hidden' }}>
      <img src={song.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop'} alt="Song" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', color: active ? '#12d15e' : '#fff' }}>{song.title}</div>
      <div style={{ fontSize: '12px', opacity: 0.5 }}>{song.artistName}</div>
    </div>
    {active ? <Volume2 size={16} color="#12d15e" /> : <Play size={14} fill="#fff" />}
  </div>
);

export default DashboardPage;
