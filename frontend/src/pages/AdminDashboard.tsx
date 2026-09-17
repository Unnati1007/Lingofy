import { API_BASE } from '../config';
import React, { useState } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListMusic, 
  Users, 
  Music, 
  LogOut,
  ChevronRight,
  Send,
  Loader2,
  CheckCircle2,
  X,
  BarChart3,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [form, setForm] = useState({
    title: "",
    artist: "",
    language: "English",
    audioUrl: "",
    lyrics: ""
  });
  const [previewLines, setPreviewLines] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [savedSongId, setSavedSongId] = useState<string | null>(null);
  const [translations, setTranslations] = useState<{ hindi: any[], spanish: any[], korean: any[] } | null>(null);
  const [showToast, setShowToast] = useState(false);
  
  const [activeView, setActiveView] = useState<'add-song' | 'users' | 'dashboard' | 'profile'>('dashboard');
  const [analyticsData, setAnalyticsData] = useState<{ traditional: any, music: any } | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserAttempts, setSelectedUserAttempts] = useState<any[]>([]);
  const [selectedUserProgress, setSelectedUserProgress] = useState<any>(null);
  const [progressLoading, setProgressLoading] = useState<boolean>(false);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Notification States
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyUser, setNotifyUser] = useState<any>(null);
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifySendEmail, setNotifySendEmail] = useState(false);
  const [isSendingNotify, setIsSendingNotify] = useState(false);
  
  // Admin Profile Edit States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    nativeLanguage: '',
    learningLanguage: '',
    age: '',
    dailyGoal: '15',
    proficiency: 'advanced',
    username: '',
    mobile: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');
  const [passwordResetEmail, setPasswordResetEmail] = useState('');
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  // Song suggestions state
  const [songSuggestions, setSongSuggestions] = useState<any[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const navigate = useNavigate();

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch users list');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleToggleUserMode = async (e: React.MouseEvent, userId: string, currentMode: string) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const newMode = currentMode === 'music' ? 'traditional' : 'music';
      await axios.put(`${API_BASE}/api/users/${userId}/mode`, { mode: newMode }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Update local state
      setUsers(users.map(u => u._id === userId ? { ...u, learningMode: newMode } : u));
    } catch (err) {
      console.error(err);
      alert('Failed to change user mode');
    }
  };

  const fetchUserAttempts = async (userId: string) => {
    setAttemptsLoading(true);
    setProgressLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/admin/users/${userId}/attempts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSelectedUserAttempts(response.data);

      const progResponse = await axios.get(`${API_BASE}/api/lessons/admin/progress/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSelectedUserProgress(progResponse.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch user quiz history');
    } finally {
      setAttemptsLoading(false);
      setProgressLoading(false);
    }
  };

  const handleReviewAttempt = async (attemptId: string) => {
    setReviewLoading(true);
    setShowReviewModal(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/admin/attempts/${attemptId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSelectedAttempt(response.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch attempt details');
      setShowReviewModal(false);
    } finally {
      setReviewLoading(false);
    }
  };

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token) {
      navigate('/login');
    } else if (role !== 'admin') {
      navigate('/dashboard');
    } else {
      // Fetch admin profile
      axios.get(`${API_BASE}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => {
        setCurrentUser(res.data);
        setProfileForm({
          name: res.data.name || '',
          nativeLanguage: res.data.nativeLanguage || '',
          learningLanguage: res.data.learningLanguage || '',
          age: res.data.age ? res.data.age.toString() : '',
          dailyGoal: res.data.dailyGoal ? res.data.dailyGoal.toString() : '15',
          proficiency: res.data.proficiency || 'advanced',
          username: res.data.username || '',
          mobile: res.data.mobile || ''
        });
        setPasswordResetEmail(res.data.email);
      }).catch(err => console.error(err));
    }
  }, [navigate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE}/api/users/me/profile`, {
        name: profileForm.name,
        nativeLanguage: profileForm.nativeLanguage,
        learningLanguage: profileForm.learningLanguage,
        age: profileForm.age ? parseInt(profileForm.age) : undefined,
        dailyGoal: profileForm.dailyGoal ? parseInt(profileForm.dailyGoal) : undefined,
        proficiency: profileForm.proficiency,
        username: profileForm.username,
        mobile: profileForm.mobile
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCurrentUser(res.data.user);
      setProfileSuccessMessage('Admin profile updated successfully!');
      setTimeout(() => setProfileSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  React.useEffect(() => {
    if (activeView === 'users') {
      fetchUsers();
      setSelectedUser(null);
      setSelectedUserAttempts([]);
      setSelectedUserProgress(null);
    } else if (activeView === 'dashboard') {
      fetchAnalytics();
      fetchUsers(); // Fetch users to get counts for summary cards
    } else if (activeView === 'add-song') {
      fetchSongSuggestions();
    }
  }, [activeView]);

  const fetchSongSuggestions = async () => {
    setSuggestionsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/admin/song-suggestions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSongSuggestions(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleDeleteUser = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/users/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Remove from UI
      setUsers(users.filter(u => u._id !== id));
      if (selectedUser?._id === id) {
        setSelectedUser(null);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyUser || !notifyTitle || !notifyMessage) return;
    
    setIsSendingNotify(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/api/notifications/admin/send`, {
        userId: notifyUser._id,
        title: notifyTitle,
        message: notifyMessage,
        sendEmail: notifySendEmail
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Notification sent successfully!');
      setShowNotifyModal(false);
      setNotifyTitle('');
      setNotifyMessage('');
      setNotifySendEmail(false);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setIsSendingNotify(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/admin/analytics/comparison`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAnalyticsData(response.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch analytics data');
    }
  };

  const handlePreview = () => {
    const lines = form.lyrics.split('\n').filter(line => line.trim() !== '');
    setPreviewLines(lines);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/api/admin/song`, {
        title: form.title,
        artistName: form.artist,
        language: form.language,
        audioUrl: form.audioUrl,
        youtubeUrl: form.audioUrl, // send youtubeUrl so backend can fetch transcript
        lyrics: previewLines.length > 0 ? previewLines : form.lyrics.split('\n').filter(l => l.trim() !== '')
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        setShowToast(true);
        setSavedSongId(response.data.song._id);
        setTimeout(() => setShowToast(false), 3000);
        
        // If we auto-fetched segments from YouTube, display them in the textarea and preview pane
        if (response.data.fetchedSegments > 0 && response.data.segments) {
           const lines = response.data.segments.map((s: any) => s.text);
           setPreviewLines(lines);
           setForm((prev) => ({ ...prev, lyrics: lines.join('\n') }));
           alert(`Successfully auto-fetched ${response.data.fetchedSegments} lyric segments from YouTube!`);
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save song');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTranslate = async () => {
    if (!savedSongId) return;
    setIsTranslating(true);
    try {
      const token = localStorage.getItem('token');
      console.log("Requesting translation for:", savedSongId);
      
      const response = await axios.post(`${API_BASE}/api/admin/translate/${savedSongId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log("Translation Response:", response.data);
      
      if (response.data && (response.data.hindi?.length > 0 || response.data.korean?.length > 0 || response.data.english?.length > 0 || response.data.spanish?.length > 0)) {
        setTranslations(response.data);
        // Force refresh preview lines to ensure they match the translation indices
        const lines = form.lyrics.split('\n').filter(line => line.trim() !== '');
        setPreviewLines(lines);
        alert("✨ Translation complete! You can see them in the preview now.");
      } else {
        alert("Translation returned empty data. Please check the backend logs.");
      }
    } catch (err: any) {
      console.error("Translation Error:", err);
      alert('Translation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsTranslating(false);
    }
  };

  const handleReset = () => {
    setForm({
      title: "",
      artist: "",
      language: "English",
      audioUrl: "",
      lyrics: ""
    });
    setPreviewLines([]);
    setSavedSongId(null);
    setTranslations(null);
  };

  const renderDashboardView = () => {
    if (!analyticsData) return <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>Loading Dashboard Data...</div>;
    
    const accuracyData = [
      { name: 'Traditional Mode', accuracy: Math.round(analyticsData.traditional.averageAccuracy) || 0, fill: '#ef4444' },
      { name: 'Music Mode', accuracy: Math.round(analyticsData.music.averageAccuracy) || 0, fill: '#20BEFF' }
    ];

    const engagementData = [
      { name: 'Traditional Mode', value: analyticsData.traditional.totalAttempts || 0 },
      { name: 'Music Mode', value: analyticsData.music.totalAttempts || 0 }
    ];

    const dropoutData = [
      { name: 'Traditional Mode', rate: Math.round(analyticsData.traditional.dropoutRate || 0), fill: '#ef4444' },
      { name: 'Music Mode', rate: Math.round(analyticsData.music.dropoutRate || 0), fill: '#20BEFF' }
    ];

    const timeData = [
      { name: 'Traditional Mode', time: Math.round(analyticsData.traditional.averageTimeSpentSeconds || 0), fill: '#ef4444' },
      { name: 'Music Mode', time: Math.round(analyticsData.music.averageTimeSpentSeconds || 0), fill: '#20BEFF' }
    ];

    const COLORS = ['#ef4444', '#20BEFF'];

    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px', background: 'linear-gradient(90deg, #20BEFF, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard Overview</h1>
            <p style={{ opacity: 0.6, fontSize: '13px' }}>Welcome back, Admin. Here's a summary of the platform's performance and research metrics.</p>
          </div>
          <div style={{ padding: '8px 16px', background: 'rgba(32, 190, 255, 0.1)', border: '1px solid rgba(32, 190, 255, 0.2)', borderRadius: '10px', color: '#20BEFF', fontWeight: 'bold', fontSize: '13px' }}>
            Total Users: {users.length}
          </div>
        </div>

        {/* Top Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(239, 68, 68, 0.05)' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Traditional Mode Learners</h3>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#ef4444', filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.3))' }}>{analyticsData.traditional.uniqueUsersCount || 0}</div>
            <p style={{ opacity: 0.7, fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>Active Participants</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, rgba(32, 190, 255, 0.15) 0%, rgba(32, 190, 255, 0.05) 100%)', border: '1px solid rgba(32, 190, 255, 0.3)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(32, 190, 255, 0.05)' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#20BEFF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Music Mode Learners</h3>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#20BEFF', filter: 'drop-shadow(0 0 10px rgba(32,190,255,0.3))' }}>{analyticsData.music.uniqueUsersCount || 0}</div>
            <p style={{ opacity: 0.7, fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>Active Participants</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* Accuracy Chart */}
          <div style={{ background: '#121214', border: '1px solid #1e1e21', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', textAlign: 'center' }}>Average Accuracy (%)</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <RechartsTooltip cursor={{ fill: '#27272a' }} contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                    {accuracyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p style={{ fontSize: '11px', opacity: 0.5, textAlign: 'center', marginTop: '12px' }}>Measures the percentage of correctly answered questions per session.</p>
          </div>

          {/* Engagement Chart */}
          <div style={{ background: '#121214', border: '1px solid #1e1e21', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', textAlign: 'center' }}>Total Engagement (Attempts)</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={engagementData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }} />
                  <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p style={{ fontSize: '11px', opacity: 0.5, textAlign: 'center', marginTop: '12px' }}>Compares the total number of quizzes initiated by each group.</p>
          </div>
        </div>

        {/* Telemetry Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* Dropout Rate Chart */}
          <div style={{ background: '#121214', border: '1px solid #1e1e21', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', textAlign: 'center' }}>Task Dropout Rate (%)</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dropoutData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <RechartsTooltip cursor={{ fill: '#27272a' }} contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                    {dropoutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p style={{ fontSize: '11px', opacity: 0.5, textAlign: 'center', marginTop: '12px' }}>Percentage of users who abandoned the quiz before finishing.</p>
          </div>

          {/* Average Time Spent Chart */}
          <div style={{ background: '#121214', border: '1px solid #1e1e21', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', textAlign: 'center' }}>Avg Cognitive Load (Time per Text Question)</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ fill: '#27272a' }} contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="time" radius={[6, 6, 0, 0]}>
                    {timeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p style={{ fontSize: '11px', opacity: 0.5, textAlign: 'center', marginTop: '12px' }}>Average seconds taken to answer purely text-based questions (excluding audio playback time) to accurately compare cognitive hesitation.</p>
          </div>
        </div>
      </div>
    );
  };


  const renderUsersView = () => {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>User Management</h1>
            <p style={{ opacity: 0.5 }}>Manage registered users and inspect their quiz completions and performance metrics.</p>
          </div>
          <div style={{ background: '#27272a', padding: '6px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>
            Total Users: {users.length}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '32px', alignItems: 'start' }} className="admin-grid-layout">
          {/* User List Panel */}
          <section style={{ background: '#121214', border: '1px solid #1e1e21', borderRadius: '20px', padding: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Registered Users</h3>
            {usersLoading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', opacity: 0.5 }}>Loading users...</div>
            ) : users.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', opacity: 0.5 }}>No registered users found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
                {users.map((user) => {
                  const isSelected = selectedUser?._id === user._id;
                  return (
                    <div 
                      key={user._id}
                      onClick={() => {
                        setSelectedUser(user);
                        fetchUserAttempts(user._id);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        borderRadius: '14px',
                        background: isSelected ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isSelected ? '#a855f7' : 'rgba(255,255,255,0.04)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: isSelected ? '#a855f7' : '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {user.name}
                          <span style={{ 
                            fontSize: '10px', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            background: user.learningMode === 'traditional' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(32, 190, 255, 0.2)',
                            color: user.learningMode === 'traditional' ? '#3b82f6' : '#20BEFF'
                          }}>
                            {user.learningMode === 'traditional' ? 'Traditional' : 'Music'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '2px' }}>{user.email}</div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                          <button
                            onClick={(e) => handleToggleUserMode(e, user._id, user.learningMode)}
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: '#fff',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            Switch Mode
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotifyUser(user);
                              setShowNotifyModal(true);
                            }}
                            style={{
                              background: 'rgba(59, 130, 246, 0.1)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              color: '#3b82f6',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            Notify
                          </button>
                          {user.email !== 'admin123@gmail.com' && (
                            <button
                              onClick={(e) => handleDeleteUser(e, user._id)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#ef4444',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', opacity: 0.4 }}>
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                        <ChevronRight size={16} color={isSelected ? '#a855f7' : '#fff'} style={{ opacity: isSelected ? 1 : 0.4 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* User History Panel */}
          <section style={{ position: 'sticky', top: '0', background: '#121214', border: '1px solid #1e1e21', borderRadius: '20px', padding: '32px', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            {selectedUser ? (
              <>
                <div style={{ borderBottom: '1px solid #1e1e21', paddingBottom: '16px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#a855f7', fontWeight: 'bold', letterSpacing: '0.5px' }}>User Profile</div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '4px' }}>{selectedUser.name}</h3>
                  <p style={{ fontSize: '12px', opacity: 0.5, margin: '2px 0 0 0' }}>{selectedUser.email}</p>
                </div>

                {/* Dynamic Roadmap Progress */}
                {selectedUserProgress && (
                  <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#a855f7', fontWeight: 'bold', marginBottom: '12px', letterSpacing: '0.5px' }}>Learning Milestones</div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      {/* Hindi Milestones */}
                      <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', paddingRight: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Hindi 🇮🇳</span>
                          <span style={{ fontSize: '11px', color: '#a855f7', fontWeight: 'bold', textTransform: 'capitalize' }}>
                            {selectedUserProgress.hindi.currentStage}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '18px', opacity: selectedUserProgress.hindi.badges.includes('easy_explorer') ? 1 : 0.2 }} title="Easy Explorer">🎖️</span>
                          <span style={{ fontSize: '18px', opacity: selectedUserProgress.hindi.badges.includes('intermediate_scholar') ? 1 : 0.2 }} title="Intermediate Scholar">🏆</span>
                          <span style={{ fontSize: '18px', opacity: selectedUserProgress.hindi.badges.includes('language_star') ? 1 : 0.2 }} title="Language Star">⭐</span>
                        </div>
                        <div style={{ fontSize: '10px', opacity: 0.5 }}>
                          E: {selectedUserProgress.hindi.easyCompleted}/1 | I: {selectedUserProgress.hindi.intermediateCompleted}/2 | H: {selectedUserProgress.hindi.hardCompleted}/3
                        </div>
                      </div>

                      {/* Spanish Milestones */}
                      <div style={{ paddingLeft: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Spanish 🇪🇸</span>
                          <span style={{ fontSize: '11px', color: '#a855f7', fontWeight: 'bold', textTransform: 'capitalize' }}>
                            {selectedUserProgress.spanish.currentStage}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '18px', opacity: selectedUserProgress.spanish.badges.includes('easy_explorer') ? 1 : 0.2 }} title="Easy Explorer">🎖️</span>
                          <span style={{ fontSize: '18px', opacity: selectedUserProgress.spanish.badges.includes('intermediate_scholar') ? 1 : 0.2 }} title="Intermediate Scholar">🏆</span>
                          <span style={{ fontSize: '18px', opacity: selectedUserProgress.spanish.badges.includes('language_star') ? 1 : 0.2 }} title="Language Star">⭐</span>
                        </div>
                        <div style={{ fontSize: '10px', opacity: 0.5 }}>
                          E: {selectedUserProgress.spanish.easyCompleted}/1 | I: {selectedUserProgress.spanish.intermediateCompleted}/2 | H: {selectedUserProgress.spanish.hardCompleted}/3
                        </div>
                      </div>

                      {/* Korean Milestones */}
                      <div style={{ paddingLeft: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Korean 🇰🇷</span>
                          <span style={{ fontSize: '11px', color: '#a855f7', fontWeight: 'bold', textTransform: 'capitalize' }}>
                            {selectedUserProgress.korean?.currentStage}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '18px', opacity: selectedUserProgress.korean?.badges.includes('easy_explorer') ? 1 : 0.2 }} title="Easy Explorer">🎖️</span>
                          <span style={{ fontSize: '18px', opacity: selectedUserProgress.korean?.badges.includes('intermediate_scholar') ? 1 : 0.2 }} title="Intermediate Scholar">🏆</span>
                          <span style={{ fontSize: '18px', opacity: selectedUserProgress.korean?.badges.includes('language_star') ? 1 : 0.2 }} title="Language Star">⭐</span>
                        </div>
                        <div style={{ fontSize: '10px', opacity: 0.5 }}>
                          E: {selectedUserProgress.korean?.easyCompleted}/1 | I: {selectedUserProgress.korean?.intermediateCompleted}/2 | H: {selectedUserProgress.korean?.hardCompleted}/3
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Quiz & Lesson History</h4>

                {attemptsLoading ? (
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0.5 }}>Loading quiz records...</div>
                ) : selectedUserAttempts.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4, padding: '40px 0' }}>
                    <PlusCircle size={28} style={{ marginBottom: '8px' }} />
                    <p style={{ fontSize: '13px' }}>No quiz completions found for this user.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '45vh', overflowY: 'auto', paddingRight: '8px' }}>
                    {selectedUserAttempts.map((attempt) => (
                      <div 
                        key={attempt._id}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.04)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                            {attempt.level === 'dynamic' ? 'Song Practice' : 'Lesson'} • {attempt.language}
                          </div>
                          <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '2px' }}>
                            {new Date(attempt.completedAt).toLocaleString()}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#20BEFF' }}>{attempt.score} Correct</div>
                            <div style={{ fontSize: '10px', color: '#eab308', fontWeight: 'bold' }}>+{attempt.xpEarned} XP</div>
                          </div>
                          <button
                            onClick={() => handleReviewAttempt(attempt._id)}
                            style={{
                              background: '#27272a',
                              border: 'none',
                              color: '#fff',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            className="btn-hover"
                          >
                            Audit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4, textAlign: 'center', padding: '60px 0' }}>
                <Users size={36} style={{ marginBottom: '12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 4px 0' }}>No User Selected</h4>
                <p style={{ fontSize: '13px', maxWidth: '250px' }}>Select a registered user from the left list to review their quiz performance.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  };

  const handleRequestPasswordReset = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/request-password-reset`, { email: passwordResetEmail });
      setResetCodeSent(true);
      setResetMessage(res.data.message || 'Verification code sent (check console if simulated)');
    } catch (err: any) {
      setResetMessage(err.response?.data?.message || 'Error sending code');
    }
  };

  const handleVerifyAndReset = async () => {
    try {
      // 1. Verify code
      await axios.post(`${API_BASE}/api/auth/verify-reset-code`, { email: passwordResetEmail, code: resetCode });
      
      // 2. Reset password
      await axios.post(`${API_BASE}/api/auth/reset-password`, { email: passwordResetEmail, code: resetCode, newPassword });
      
      setResetMessage('Password updated successfully!');
      setResetCodeSent(false);
      setResetCode('');
      setNewPassword('');
    } catch (err: any) {
      setResetMessage(err.response?.data?.message || 'Error resetting password');
    }
  };

  const renderProfileView = () => {
    return (
      <div style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Admin Profile</h2>
        <p style={{ opacity: 0.6, fontSize: '15px', marginBottom: '32px' }}>Manage your administrative details and security settings.</p>

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <form onSubmit={handleSaveProfile} style={{ flex: 1, background: '#121214', border: '1px solid #1e1e21', borderRadius: '24px', padding: '32px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.8 }}>Username</label>
                <input type="text" value={profileForm.username} onChange={(e) => setProfileForm({...profileForm, username: e.target.value})} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.8 }}>Email <span style={{opacity:0.5}}>(Read Only)</span></label>
                <input type="email" value={currentUser?.email || ''} readOnly style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.5)', outline: 'none', cursor: 'not-allowed' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.8 }}>Mobile Number</label>
                <input type="text" value={profileForm.mobile} onChange={(e) => setProfileForm({...profileForm, mobile: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }} />
              </div>
            </div>

            <button type="submit" disabled={savingProfile} style={{ padding: '16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)', color: '#000', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', opacity: savingProfile ? 0.7 : 1 }}>
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>

            {profileSuccessMessage && (
              <p style={{ color: '#20BEFF', fontSize: '14px', textAlign: 'center', marginTop: '10px' }}>{profileSuccessMessage}</p>
            )}
          </form>

          {/* Password Reset Section */}
          <div style={{ flex: 1, background: '#121214', border: '1px solid #1e1e21', borderRadius: '24px', padding: '32px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>Security & Password</h3>
            <p style={{ opacity: 0.6, fontSize: '14px' }}>Change your password by verifying your email via code.</p>

            {!resetCodeSent ? (
              <button onClick={handleRequestPasswordReset} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #20BEFF', background: 'transparent', color: '#20BEFF', fontWeight: 'bold', cursor: 'pointer' }}>
                Request Password Reset
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input type="text" placeholder="Enter 6-digit Code" value={resetCode} onChange={(e) => setResetCode(e.target.value)} style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }} />
                <input type="password" placeholder="Enter New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }} />
                <button onClick={handleVerifyAndReset} style={{ padding: '16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
                  Verify & Reset Password
                </button>
              </div>
            )}
            {resetMessage && (
              <p style={{ color: '#a855f7', fontSize: '14px', textAlign: 'center', marginTop: '10px' }}>{resetMessage}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Sidebar */}
      <aside style={{ width: '260px', background: '#000', borderRight: '1px solid #18181b', padding: '32px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 12px' }}>
          <img src="/Logo-1.png" alt="Logo" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
          <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>Lingofy Admin</span>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <SidebarItem 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            active={activeView === 'dashboard'} 
            onClick={() => setActiveView('dashboard')}
          />
          <SidebarItem 
            icon={<PlusCircle size={18} />} 
            label="Add Song" 
            active={activeView === 'add-song'} 
            onClick={() => setActiveView('add-song')}
          />
          <SidebarItem 
            icon={<ListMusic size={18} />} 
            label="Manage Songs" 
            active={false} 
          />
          <SidebarItem 
            icon={<Users size={18} />} 
            label="Users" 
            active={activeView === 'users'} 
            onClick={() => setActiveView('users')}
          />
        </nav>

        <div style={{ borderTop: '1px solid #18181b', paddingTop: '20px' }}>
          <SidebarItem 
            icon={<Settings size={18} />} 
            label="Profile" 
            active={activeView === 'profile'} 
            onClick={() => setActiveView('profile')} 
          />
          <SidebarItem 
            icon={<LogOut size={18} />} 
            label="Logout" 
            onClick={() => { localStorage.clear(); navigate('/login'); }} 
          />
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Navbar */}
        <header style={{ height: '70px', borderBottom: '1px solid #18181b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 40px', background: '#000' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>Admin User</div>
              <div style={{ fontSize: '12px', opacity: 0.5 }}>System Administrator</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ padding: '40px', overflowY: 'auto', flex: 1 }}>
          {activeView === 'dashboard' ? renderDashboardView() : activeView === 'users' ? renderUsersView() : activeView === 'profile' ? renderProfileView() : (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Add New Song</h1>
              <p style={{ opacity: 0.5 }}>Expand your library by adding high-quality musical content.</p>
            </div>

            {/* Song Suggestions Banner */}
            {suggestionsLoading ? (
              <div style={{ marginBottom: '32px', textAlign: 'center', opacity: 0.5, padding: '24px' }}>Loading smart recommendations...</div>
            ) : songSuggestions.length > 0 && (
              <div style={{ marginBottom: '32px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(32, 190, 255, 0.15) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ✨ Recommended by User Preferences
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {songSuggestions.map((suggestion, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>{suggestion.title}</h4>
                          <p style={{ fontSize: '12px', opacity: 0.7 }}>{suggestion.artist}</p>
                        </div>
                        <span style={{ background: 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)', color: '#000', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>{suggestion.language}</span>
                      </div>
                      <p style={{ fontSize: '11px', opacity: 0.5, marginBottom: '16px', fontStyle: 'italic' }}>{suggestion.reason}</p>
                      
                      <button 
                        onClick={() => {
                          setForm({ ...form, title: suggestion.title, artist: suggestion.artist, language: suggestion.language, audioUrl: suggestion.youtubeUrl });
                        }}
                        style={{ width: '100%', padding: '8px', background: '#27272a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#18181b'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#27272a'}
                      >
                        Use Suggestion
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px', alignItems: 'start' }}>
              
              {/* Form Section */}
              <section style={{ background: '#121214', border: '1px solid #1e1e21', borderRadius: '20px', padding: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', opacity: 0.7 }}>Song Title</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      placeholder="Song Title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', opacity: 0.7 }}>Artist Name</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      placeholder="Artist Name"
                      value={form.artist}
                      onChange={(e) => setForm({ ...form, artist: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', opacity: 0.7 }}>Language</label>
                  <select 
                    className="admin-input" 
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    style={{ appearance: 'none', background: '#09090b' }}
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>Japanese</option>
                    <option>Korean</option>
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', opacity: 0.7 }}>YouTube URL</label>
                  <input 
                    type="text" 
                    className="admin-input" 
                    placeholder="YouTube URL"
                    value={form.audioUrl}
                    onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', opacity: 0.7 }}>Lyrics (Optional)</label>
                  <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '-4px', marginBottom: '12px', color: '#a855f7' }}>
                    ✨ Leave this empty to automatically extract lyrics and timestamps from YouTube!
                  </p>
                  <textarea 
                    className="admin-input" 
                    rows={12} 
                    placeholder="Paste English Lyrics (line by line) OR leave empty to auto-fetch"
                    value={form.lyrics}
                    onChange={(e) => setForm({ ...form, lyrics: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <button 
                    onClick={handleTranslate}
                    disabled={!savedSongId || isTranslating}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '12px', 
                      border: savedSongId ? '1px solid #a855f7' : '1px solid rgba(168, 85, 247, 0.4)', 
                      background: savedSongId 
                        ? 'linear-gradient(90deg, rgba(168, 85, 247, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)' 
                        : 'linear-gradient(90deg, rgba(168, 85, 247, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)', 
                      color: savedSongId ? '#fff' : '#a855f7', 
                      fontWeight: '600', 
                      fontSize: '14px',
                      cursor: !savedSongId || isTranslating ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: savedSongId ? '0 0 20px rgba(168, 85, 247, 0.2)' : 'none',
                      transition: 'all 0.3s'
                    }}
                  >
                    {isTranslating ? <Loader2 size={18} className="spin" /> : '✨'} 
                    {isTranslating ? 'Translating...' : savedSongId ? 'Auto Translate Now' : 'Auto Translate (Save first)'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button 
                    onClick={handleReset}
                    style={{ 
                      flex: 1, 
                      padding: '14px', 
                      borderRadius: '12px', 
                      border: '1px solid #27272a', 
                      background: 'transparent', 
                      color: '#fff', 
                      fontWeight: '600', 
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    New Song
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving || !!savedSongId}
                    style={{ 
                      flex: 1, 
                      padding: '14px', 
                      borderRadius: '12px', 
                      border: 'none', 
                      background: savedSongId ? 'linear-gradient(135deg, #20BEFF 0%, #0099e6 100%)' : '#fff', 
                      color: savedSongId ? '#000' : '#000', 
                      fontWeight: '700', 
                      cursor: (isSaving || !!savedSongId) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                  >
                    {isSaving ? <Loader2 size={20} className="spin" /> : (savedSongId ? <CheckCircle2 size={18} /> : <Send size={18} />)}
                    {isSaving ? 'Saving...' : (savedSongId ? 'Saved' : 'Save Song')}
                  </button>
                </div>
              </section>

              {/* Preview Section */}
              <section style={{ position: 'sticky', top: '0' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Preview Segments {previewLines.length > 0 && <span style={{ background: '#27272a', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{previewLines.length}</span>}
                </h3>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px', 
                  maxHeight: 'calc(100vh - 200px)', 
                  overflowY: 'auto',
                  paddingRight: '8px'
                }}>
                  {previewLines.length === 0 ? (
                    <div style={{ border: '2px dashed #27272a', borderRadius: '16px', padding: '40px', textAlign: 'center', opacity: 0.4 }}>
                      <PlusCircle size={32} style={{ marginBottom: '12px' }} />
                      <p style={{ fontSize: '13px' }}>Click preview to see segmented lyrics</p>
                    </div>
                  ) : (
                    previewLines.map((line, idx) => (
                      <div key={idx} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '16px', transition: 'all 0.2s' }}>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.4, fontWeight: '700', marginBottom: '6px' }}>Line {idx + 1}</div>
                        <div style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: translations ? '12px' : '0' }}>{line}</div>
                        
                        {translations && (
                          <div style={{ borderTop: '1px solid #27272a', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ fontSize: '12px' }}>
                              <span style={{ opacity: 0.5, fontSize: '10px', marginRight: '6px' }}>HI:</span> 
                              {translations.hindi[idx]?.text}
                            </div>
                            <div style={{ fontSize: '12px' }}>
                              <span style={{ opacity: 0.5, fontSize: '10px', marginRight: '6px' }}>ES:</span> 
                              {translations.spanish[idx]?.text}
                            </div>
                            <div style={{ fontSize: '12px' }}>
                              <span style={{ opacity: 0.5, fontSize: '10px', marginRight: '6px' }}>KO:</span> 
                              {translations.korean?.[idx]?.text}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
            </div>
          )}
        </div>
      </main>

      {/* Success Toast */}
      {showToast && (
        <div style={{ 
          position: 'fixed', 
          bottom: '40px', 
          right: '40px', 
          background: '#fff', 
          color: '#000', 
          padding: '16px 24px', 
          borderRadius: '12px', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease'
        }}>
          <CheckCircle2 size={20} color="#20BEFF" />
          <span style={{ fontWeight: '600' }}>Song saved successfully!</span>
        </div>
      )}

      {/* Quiz Detail Audit Modal */}
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
              <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.6 }}>Loading quiz details...</div>
            ) : selectedAttempt ? (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#a855f7', fontWeight: 'bold', letterSpacing: '1px' }}>
                    User Quiz Audit • {selectedAttempt.userId?.name || 'User'}
                  </span>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '6px', marginBottom: '8px' }}>
                    {selectedAttempt.level === 'dynamic' ? 'Song Practice Quiz' : 'Lesson Quiz'}
                  </h2>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', opacity: 0.6 }}>
                    <span>User: <strong>{selectedAttempt.userId?.name} ({selectedAttempt.userId?.email})</strong></span>
                    <span>•</span>
                    <span>Score: <strong>{selectedAttempt.score}/{selectedAttempt.questions?.length}</strong></span>
                  </div>

                  {/* HCI Research Metrics */}
                  {(selectedAttempt.cognitiveLoad || selectedAttempt.reflectionText) && (
                    <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '12px', padding: '16px', marginTop: '16px' }}>
                      <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#a855f7', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '12px' }}>HCI Research Metrics</h4>
                      {selectedAttempt.cognitiveLoad && (
                        <div style={{ marginBottom: '12px' }}>
                          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>NASA-TLX Effort Rating: </span>
                          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{selectedAttempt.cognitiveLoad} / 5</span>
                        </div>
                      )}
                      {selectedAttempt.reflectionText && (
                        <div>
                          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '4px' }}>Qualitative Reflection:</span>
                          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', fontSize: '13px', color: '#fff', fontStyle: 'italic', borderLeft: '2px solid #a855f7' }}>
                            "{selectedAttempt.reflectionText}"
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
                                {isUserSelected && !isCorrect && <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '11px' }}>User Answer</span>}
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

      {/* Notify Modal */}
      {showNotifyModal && notifyUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button 
              onClick={() => setShowNotifyModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Send Notification</h2>
            <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '24px' }}>Sending an alert to <strong>{notifyUser.name}</strong> ({notifyUser.email})</p>

            <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>Title</label>
                <input 
                  type="text" 
                  value={notifyTitle}
                  onChange={e => setNotifyTitle(e.target.value)}
                  placeholder="e.g. You've earned a new badge!"
                  className="admin-input"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>Message</label>
                <textarea 
                  value={notifyMessage}
                  onChange={e => setNotifyMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="admin-input"
                  style={{ minHeight: '120px', resize: 'vertical' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input 
                  type="checkbox" 
                  id="sendEmail" 
                  checked={notifySendEmail} 
                  onChange={e => setNotifySendEmail(e.target.checked)} 
                  style={{ width: '16px', height: '16px', accentColor: '#a855f7' }}
                />
                <label htmlFor="sendEmail" style={{ fontSize: '14px', cursor: 'pointer' }}>Also send as an email</label>
              </div>

              <button 
                type="submit" 
                disabled={isSendingNotify}
                style={{
                  background: isSendingNotify ? 'rgba(168, 85, 247, 0.5)' : '#a855f7',
                  color: '#fff',
                  border: 'none',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: isSendingNotify ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '16px',
                  transition: 'background 0.2s'
                }}
              >
                {isSendingNotify ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                {isSendingNotify ? 'Sending...' : 'Send Alert'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid #27272a;
          background: #09090b;
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }
        .admin-input:focus {
          border-color: #3f3f46;
          background: #121214;
        }
        .spin {
          animation: rotate 1s linear infinite;
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false, onClick }: any) => (
  <div 
    onClick={onClick}
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px', 
      padding: '10px 12px', 
      borderRadius: '8px', 
      cursor: 'pointer',
      color: active ? '#fff' : '#a1a1aa',
      background: active ? '#27272a' : 'transparent',
      transition: 'all 0.2s',
      fontSize: '14px',
      fontWeight: active ? '600' : '400'
    }}
  >
    {icon}
    <span>{label}</span>
    {active && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
  </div>
);

export default AdminDashboard;
