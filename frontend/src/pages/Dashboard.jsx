import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [skillsCount, setSkillsCount] = useState(0);
  const [goalsCount, setGoalsCount] = useState(0);
  const [appsCount, setAppsCount] = useState(0);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    // Fetch everything in parallel; each request fails independently
    // so one missing endpoint doesn't blank out the whole dashboard.
    const [profileRes, skillsRes, goalsRes, appsRes] = await Promise.allSettled([
      api.get('/profile'),
      api.get('/skills/my-skills'),
      api.get('/goals'),
      api.get('/applications'),
    ]);

    if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
    if (skillsRes.status === 'fulfilled') setSkillsCount(skillsRes.value.data?.length || 0);
    if (goalsRes.status === 'fulfilled') setGoalsCount(goalsRes.value.data?.length || 0);
    if (appsRes.status === 'fulfilled') setAppsCount(appsRes.value.data?.length || 0);

    // Build a simple "recent activity" feed from goals + applications
    const activity = [];
    if (goalsRes.status === 'fulfilled') {
      goalsRes.value.data.slice(0, 3).forEach(g =>
        activity.push({
          text: `Goal: ${g.targetRole || g.goalType}`,
          date: g.createdAt || g.targetDate,
          type: 'goal',
        })
      );
    }
    if (appsRes.status === 'fulfilled') {
      appsRes.value.data.slice(0, 3).forEach(a =>
        activity.push({
          text: `Applied to ${a.jobTitle} @ ${a.companyName}`,
          date: a.applicationDate,
          type: 'application',
        })
      );
    }
    activity.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    setRecentItems(activity.slice(0, 5));

    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const profileComplete = !!profile?.currentTitle;

  const stats = [
    {
      label: 'Profile',
      value: loading ? '…' : profileComplete ? profile.currentTitle : 'Not Set',
      icon: '👤',
      color: 'indigo',
      path: '/profile',
    },
    { label: 'Skills', value: loading ? '…' : String(skillsCount), icon: '✓', color: 'green', path: '/profile' },
    { label: 'Goals', value: loading ? '…' : String(goalsCount), icon: '⚡', color: 'yellow', path: '/goals' },
    { label: 'Applications', value: loading ? '…' : String(appsCount), icon: '💼', color: 'purple', path: '/applications' },
  ];

  const quickActions = [
    { title: "Update Resume", sub: "Upload & manage resumes", icon: "📄", path: "/resumes", color: "#4B8BFF" },
    { title: "AI Job Analyzer", sub: "Match score + suggestions", icon: "✦", path: "/analyzer", color: "#7DF9C2" },
    { title: "Career Goals", sub: "Track your progress", icon: "🎯", path: "/goals", color: "#FFC400" },
  ];

  return (
    <div className="min-h-screen bg-[#0C0C14] text-[#F0EDE8] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        .db-container { max-width: 1000px; margin: 0 auto; padding: 100px 24px 40px; }
        .db-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 20px; transition: all 0.2s; }
        .db-card:hover { border-color: rgba(255, 255, 255, 0.12); background: rgba(255, 255, 255, 0.04); }
        .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .action-btn { display: flex; align-items: center; gap: 16px; padding: 24px; border-radius: 20px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); transition: all 0.2s; text-align: left; }
        .action-btn:hover { transform: translateY(-2px); border-color: currentColor; background: rgba(255, 255, 255, 0.05); }
        .stat-value-text { font-size: 1.1rem; }
        .stat-value-text.long { font-size: 0.95rem; line-height: 1.3; }
      `}</style>

      <Navbar user={user} onLogout={handleLogout} onNavigate={navigate} activePath="/dashboard" />

      <div className="db-container">
        {/* Welcome Header */}
        <div className="mb-10 relative">
          <div className="flex items-end gap-4 mb-2">
            <h2 className="text-4xl font-extrabold font-['Syne'] tracking-tight">
              Welcome back, <span className="text-[#7DF9C2]">{user?.firstName}</span>!
            </h2>
            <div className="h-2 w-2 rounded-full bg-[#7DF9C2] mb-3 animate-pulse" />
          </div>
          <p className="text-[#F0EDE8]/40 font-medium">
            {profileComplete
              ? `${profile.currentTitle}${profile.currentCompany ? ` @ ${profile.currentCompany}` : ''}`
              : 'Your career journey is looking bright today.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="db-card p-6 flex flex-col gap-4 group cursor-pointer" onClick={() => navigate(stat.path)}>
              <div className={`stat-icon bg-${stat.color}-500/10 text-${stat.color}-400 border border-${stat.color}-500/20`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-[#F0EDE8]/40 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</div>
                <div className={`font-bold font-['Syne'] stat-value-text ${stat.value.length > 14 ? 'long' : ''}`}>
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-sm font-bold uppercase tracking-[2px] text-[#F0EDE8]/20 mb-6 font-['Syne']">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className="action-btn group"
                style={{ color: action.color }}
              >
                <div className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-300">{action.icon}</div>
                <div>
                  <div className="text-[#F0EDE8] font-bold mb-1">{action.title}</div>
                  <div className="text-[#F0EDE8]/40 text-xs">{action.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity / Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 db-card p-8">
            <h3 className="text-xl font-bold font-['Syne'] mb-6">Recent Activity</h3>
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-white/20 text-sm italic">Loading…</p>
                </div>
              ) : recentItems.length === 0 ? (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-white/5 rounded-2xl">
                  <p className="text-white/20 text-sm italic">No recent activity to show.</p>
                </div>
              ) : (
                recentItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-sm text-white/70">{item.text}</span>
                    <span className="text-xs text-white/25 font-['DM_Mono']">
                      {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="db-card p-8">
            <h3 className="text-xl font-bold font-['Syne'] mb-6">Shortcuts</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: "📋 Applications", path: "/applications" },
                { label: "🎯 Goals", path: "/goals" },
                { label: "📄 Resumes", path: "/resumes" },
                { label: "✦ AI Analyzer", path: "/analyzer" },
                { label: "◉ Profile", path: "/profile" },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-white/60 hover:text-white"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;