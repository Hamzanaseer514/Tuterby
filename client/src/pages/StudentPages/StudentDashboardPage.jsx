import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  BookOpen,
  Settings,
  LogOut,
  User,
  MessageSquare,
  Menu,
  ChevronDown,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/use-toast';
import StudentDashboard from '../../components/student/StudentDashboard';
import StudentSessions from '../../components/student/StudentSessions';
import StudentPreferences from '../../components/student/StudentPreferences';
import StudentChatPage from '../../components/student/StudentChatPage';
import StudentHelpRequests from '../../components/student/StudentHelpRequests';
import MyTutors from '../../components/student/MyTutors';
import StudentTutorSearchPage from './StudentTutorSearchPage';
import { BASE_URL } from '@/config';
import StudentSelfProfilePage from './StudentSelfProfilePage';
import StudentPaymentPage from './StudentPaymentPage';

const lastSeenKey = (id) => `student_last_seen_${id}`;

const StudentDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const initialTab = (() => {
    try {
      const params = new URLSearchParams(location.search);
      return params.get('tab') || 'dashboard';
    } catch {
      return 'dashboard';
    }
  })();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    learning: true,
    communication: true,
    account: true
  });
  const [badgeCounts, setBadgeCounts] = useState({ sessions: 0, requests: 0, chat: 0 });

  const { user, logout, loading: authLoading, getUserProfile, getAuthToken } = useAuth();
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const raw = await getUserProfile(user?._id);
        const photo_url = raw.photo_url;
        if (!photo_url) {
          setProfileImageUrl('');
          return;
        }
        const url = photo_url.startsWith('http')
          ? photo_url
          : `${BASE_URL}${photo_url.startsWith('/') ? '' : '/'}${photo_url}`;
        setProfileImageUrl(url);
      } catch (error) {
        console.error('Error fetching profile image:', error);
        setProfileImageUrl('');
      }
    };

    if (user?._id) {
      fetchProfileImage();
    }
  }, [user]);

  useEffect(() => {

    if (authLoading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'student') {
      toast({
        title: 'Access Denied',
        description: 'This dashboard is only for students',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    setLoading(false);
  }, [user, navigate, toast, authLoading]);

  const fetchBadgeCounts = useCallback(async () => {
    try {
      if (!user?._id) return;
      const token = getAuthToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Sessions: pending, compare latest update with lastSeen
      let sessionsCount = 0;
      try {
        const sRes = await fetch(`${BASE_URL}/api/auth/student/sessions/${user._id}?status=pending`, { headers });
        if (sRes.ok) {
          const sJson = await sRes.json();
          const list = sJson.sessions || [];
          const latest = list[0]?.updatedAt || list[0]?.createdAt || list[0]?.session_date || null;
          sessionsCount = Number.isFinite(sJson.total) ? sJson.total : (list.filter(x => x.status === 'pending').length || 0);
          const seen = Number(localStorage.getItem(lastSeenKey('sessions')) || 0);
          if (latest && seen >= new Date(latest).getTime()) sessionsCount = 0;
        }
      } catch { }

      // Help Requests: replied/unread since lastSeen
      let requestsCount = 0;
      try {
        const rRes = await fetch(`${BASE_URL}/api/auth/student/${user._id}/help-requests?page=1&limit=50`, { headers });
        if (rRes.ok) {
          const rJson = await rRes.json();
          const list = rJson.inquiries || [];
          const latest = list[0]?.updated_at || list[0]?.created_at || list[0]?.createdAt || null;
          requestsCount = list.filter((i) => i.status === 'replied' || i.status === 'unread').length;
          const seen = Number(localStorage.getItem(lastSeenKey('requests')) || 0);
          if (latest && seen >= new Date(latest).getTime()) requestsCount = 0;
        }
      } catch { }

      // Chat dot left as 0 unless endpoint exists
      const chatCount = 0;

      setBadgeCounts({ sessions: sessionsCount, requests: requestsCount, chat: chatCount });
    } catch { }
  }, [user?._id, getAuthToken]);

  // Auto-refresh badges: on mount, focus, and every 30s
  useEffect(() => {
    if (!user?._id) return;
    fetchBadgeCounts();
    const onFocus = () => fetchBadgeCounts();
    window.addEventListener('focus', onFocus);
    const id = setInterval(fetchBadgeCounts, 30000);
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(id);
    };
  }, [user?._id, fetchBadgeCounts]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      component: <StudentDashboard />,
      section: 'learning'
    },
    // {
    //   id: 'tutor-search',
    //   name: 'Find Tutors',
    //   icon: BookOpen,
    //   component: <StudentTutorSearchPage />,
    //   section: 'learning'
    // },
    {
      id: 'sessions',
      name: 'My Sessions',
      icon: Calendar,
      component: <StudentSessions />,
      section: 'learning'
    },
    {
      id: 'assignments',
      name: 'Assignments',
      icon: FileText,
      component: <div className="p-6">Assignments coming soon...</div>,
      section: 'learning'
    },
    {
      id: 'notes',
      name: 'Notes',
      icon: BookOpen,
      component: <div className="p-6">Notes coming soon...</div>,
      section: 'learning'
    },
    {
      id: 'chat',
      name: 'Messages',
      icon: MessageSquare,
      component: <StudentChatPage />,
      section: 'communication'
    },
    {
      id: 'requests',
      name: 'Help Requests',
      icon: MessageSquare,
      component: <StudentHelpRequests />,
      section: 'communication'
    },
    {
      id: 'my-tutors',
      name: 'My Tutors',
      icon: User,
      component: <MyTutors />,
      section: 'communication'
    },
    {
      id: 'payments',
      name: 'Payments',
      icon: CreditCard,
      component: <StudentPaymentPage />,
      section: 'account'
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: User,
      component: <StudentSelfProfilePage />,
      section: 'account'
    },
    {
      id: 'preferences',
      name: 'Preferences',
      icon: Settings,
      component: <StudentPreferences />,
      section: 'account'
    }
  ];

  const activeComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderSidebarContent = () => (
    <>
      <div className="flex items-center gap-3 mb-6 p-2">
        {/* <Avatar className="h-10 w-10">
              <AvatarImage
                src={profileImageUrl}
                className="object-cover"
              />
              <AvatarFallback className="text-sm">
                {user?.full_name?.charAt(0) || 'T'}
              </AvatarFallback>
            </Avatar> */}
        <div className="h-10 w-10 rounded-full flex items-center justify-center text-black">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt="Profile" className="h-full w-full object-cover rounded-full" />
          ) : (
            user?.full_name?.charAt(0) || <User className="h-5 w-5" />
          )}
        </div>
        <div>
          <p className="text-xs text-gray-500">Welcome back,</p>
          <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
        </div>
      </div>

      <nav className="space-y-4">
        {/* Learning Section */}
        <div>
          <button
            onClick={() => toggleSection('learning')}
            className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            <span>Learning</span>
            {expandedSections.learning ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {expandedSections.learning && (
            <div className="ml-2 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
              {tabs.filter(tab => tab.section === 'learning').map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (badgeCounts[tab.id] > 0) setBadgeCounts(prev => ({ ...prev, [tab.id]: 0 }));
                      localStorage.setItem(lastSeenKey(tab.id), String(Date.now()));
                      fetchBadgeCounts();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className="flex-1 text-left">{tab.name}</span>
                    {badgeCounts[tab.id] > 0 && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-red-500" />)
                    }
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Communication Section */}
        <div>
          <button
            onClick={() => toggleSection('communication')}
            className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            <span>Communication</span>
            {expandedSections.communication ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {expandedSections.communication && (
            <div className="ml-2 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
              {tabs.filter(tab => tab.section === 'communication').map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (badgeCounts[tab.id] > 0) setBadgeCounts(prev => ({ ...prev, [tab.id]: 0 }));
                      localStorage.setItem(lastSeenKey(tab.id), String(Date.now()));
                      fetchBadgeCounts();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className="flex-1 text-left">{tab.name}</span>
                    {badgeCounts[tab.id] > 0 && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-red-500" />)
                    }
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Account Section */}
        <div>
          <button
            onClick={() => toggleSection('account')}
            className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            <span>Account</span>
            {expandedSections.account ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {expandedSections.account && (
            <div className="ml-2 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
              {tabs.filter(tab => tab.section === 'account').map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (badgeCounts[tab.id] > 0) setBadgeCounts(prev => ({ ...prev, [tab.id]: 0 }));
                      localStorage.setItem(lastSeenKey(tab.id), String(Date.now()));
                      fetchBadgeCounts();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className="flex-1 text-left">{tab.name}</span>
                    {badgeCounts[tab.id] > 0 && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-red-500" />)
                    }
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="mt-6 pt-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-gray-600 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 shrink-0 border-r bg-white">
        <div className="w-full p-4 sticky top-0 h-screen overflow-y-auto">
          {renderSidebarContent()}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden bg-white border-b">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="p-2 rounded-md hover:bg-gray-50"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {user?.full_name?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Active component */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {activeComponent}
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            {renderSidebarContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboardPage;