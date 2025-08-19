import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TutorDashboard from '../../components/tutor/TutorDashboard';
import SessionManagement from '../../components/tutor/SessionManagement';
import InquiryManagement from '../../components/tutor/InquiryManagement';
import AvailabilityCalendar from '../../components/tutor/AvailabilityCalendar';
import StudentHireRequests from '../../components/tutor/StudentHireRequests';
import Chatting from '../../components/tutor/Chatting';
import { Button } from '../../components/ui/button';
import TutorSetting from '../../components/tutor/TutorSetting';
import TutorSelfProfilePage from './TutorSelfProfilePage';
import TutorInterviewSlotsPage from './TutorInterviewSlotsPage';
import { BASE_URL } from '@/config';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  User,
  ChevronDown,
  ChevronRight,
  Clock,
  BookOpen,
  Briefcase,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { cn } from '../../lib/utils';

const lastSeenKey = (id) => `tutor_last_seen_${id}`;

const TutorDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tutorId, setTutorId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({
    teaching: true,
    communication: true,
    account: true
  });
  const [badgeCounts, setBadgeCounts] = useState({ inquiries: 0, chat: 0, 'student-requests': 0, sessions: 0, interviews: 0 });
  const navigate = useNavigate();
  const { user, loading, logout, isTutor, getUserProfile } = useAuth();
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
    if (!loading) {
      if (!user) {
        navigate('/login');
        return;
      }

      if (!isTutor()) {
        navigate('/dashboard');
        return;
      }

      setTutorId(tutorId);
    }
  }, [user, loading, navigate, isTutor]);

  const fetchCounts = useCallback(async () => {
    try {
      if (!user?._id) return;
      const getAuthToken = () => sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const headers = { 'Content-Type': 'application/json' };
      const token = getAuthToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const inquiriesRes = await fetch(`${BASE_URL}/api/tutor/inquiries/${user._id}?status=unread`, { headers });
      const inquiriesJson = inquiriesRes.ok ? await inquiriesRes.json() : { total: 0, inquiries: [] };
      const inquiriesList = inquiriesJson.inquiries || [];
      const inquiriesLatest = inquiriesList[0]?.created_at || inquiriesList[0]?.createdAt || null;
      let inquiriesCount = Number.isFinite(inquiriesJson.total) ? inquiriesJson.total : inquiriesList.length;
      const inquiriesSeen = Number(localStorage.getItem(lastSeenKey('inquiries')) || 0);
      if (inquiriesLatest && inquiriesSeen >= new Date(inquiriesLatest).getTime()) {
        inquiriesCount = 0;
      }

      const hiresRes = await fetch(`${BASE_URL}/api/tutor/hire-requests/${user._id}?status=pending`, { headers });
      const hiresJson = hiresRes.ok ? await hiresRes.json() : { requests: [] };
      const hireList = hiresJson.requests || [];
      const hireLatest = hireList[0]?.updatedAt || hireList[0]?.hired_at || null;
      let hireCount = hireList.length;
      const hiresSeen = Number(localStorage.getItem(lastSeenKey('student-requests')) || 0);
      if (hireLatest && hiresSeen >= new Date(hireLatest).getTime()) {
        hireCount = 0;
      }

      const sessionsRes = await fetch(`${BASE_URL}/api/tutor/sessions/${user._id}?status=pending`, { headers });
      const sessionsJson = sessionsRes.ok ? await sessionsRes.json() : { total: 0, sessions: [] };
      const sessList = sessionsJson.sessions || [];
      const sessLatest = sessList[0]?.updatedAt || sessList[0]?.createdAt || sessList[0]?.session_date || null;
      let sessionsCount = Number.isFinite(sessionsJson.total) ? sessionsJson.total : sessList.length;
      const sessionsSeen = Number(localStorage.getItem(lastSeenKey('sessions')) || 0);
      if (sessLatest && sessionsSeen >= new Date(sessLatest).getTime()) {
        sessionsCount = 0;
      }

      let messagesCount = 0;
      try {
        const msgRes = await fetch(`${BASE_URL}/api/tutor/getallmessages`, { headers });
        if (msgRes.ok) {
          const msgJson = await msgRes.json();
          const data = msgJson.data || [];
          const latestMsg = data[0]?.createdAt || null;
          messagesCount = data.filter(m => m.status !== 'answered').length;
          const chatSeen = Number(localStorage.getItem(lastSeenKey('chat')) || 0);
          if (latestMsg && chatSeen >= new Date(latestMsg).getTime()) {
            messagesCount = 0;
          }
        }
      } catch {}

      // Interviews: show a dot if there is a scheduled time or new admin-provided preferred times since last seen
      let interviewsCount = 0;
      try {
        const iRes = await fetch(`${BASE_URL}/api/tutor/interview-slots/${user._id}`, { headers });
        if (iRes.ok) {
          const iJson = await iRes.json();
          const data = iJson?.data || {};
          const preferred = Array.isArray(data.preferred_interview_times) ? data.preferred_interview_times : [];
          const scheduledTime = data.scheduled_time ? new Date(data.scheduled_time).getTime() : 0;
          // Determine latest timestamp among preferred times or scheduled
          const preferredMs = preferred
            .map(p => {
              const d = new Date(typeof p === 'string' ? p : new Date(p).toISOString());
              return d.getTime();
            })
            .filter(ms => Number.isFinite(ms));
          const latestPreferred = preferredMs.length > 0 ? Math.max(...preferredMs) : 0;
          const latest = Math.max(scheduledTime, latestPreferred);
          const seen = Number(localStorage.getItem(lastSeenKey('interviews')) || 0);
          if (latest && seen < latest) {
            interviewsCount = 1; // dot indicator
          }

          // Also alert on status changes like Passed/Failed/Scheduled even without timestamp
          const currentStatus = data.interview_status || '';
          localStorage.setItem('tutor_last_known_interviews_status', currentStatus);
          const seenStatus = localStorage.getItem('tutor_last_seen_interviews_status') || '';
          if (currentStatus && currentStatus !== 'Pending' && currentStatus !== seenStatus) {
            interviewsCount = 1;
          }
        }
      } catch {}

      setBadgeCounts({ inquiries: inquiriesCount, chat: messagesCount, 'student-requests': hireCount, sessions: sessionsCount, interviews: interviewsCount });
    } catch {}
  }, [user?._id]);

  // Initial fetch + focus refresh + polling
  useEffect(() => {
    if (!user?._id) return;
    fetchCounts();
    const onFocus = () => fetchCounts();
    window.addEventListener('focus', onFocus);
    const id = setInterval(fetchCounts, 30000); // refresh every 30s
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(id);
    };
  }, [user?._id, fetchCounts]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const sidebarItems = [
    {
      group: 'teaching',
      name: 'Teaching',
      items: [
        {
          id: 'dashboard',
          name: 'Dashboard',
          icon: LayoutDashboard,
          component: <TutorDashboard />
        },
        {
          id: 'sessions',
          name: 'Sessions',
          icon: Calendar,
          component: <SessionManagement />
        },
        {
          id: 'availability',
          name: 'Availability',
          icon: Clock,
          component: <AvailabilityCalendar />
        },
        {
          id: 'interviews',
          name: 'Interviews',
          icon: Calendar,
          component: <TutorInterviewSlotsPage />
        },
        {
          id: 'student-requests',
          name: 'Student Requests',
          icon: Briefcase,
          component: <StudentHireRequests />,
        }
      ]
    },
    {
      group: 'communication',
      name: 'Communication',
      items: [
        {
          id: 'inquiries',
          name: 'Inquiries',
          icon: MessageSquare,
          component: <InquiryManagement />
        },
        {
          id: 'chat',
          name: 'Chat',
          icon: MessageSquare,
          component: <Chatting />
        }
      ]
    },
    {
      group: 'account',
      name: 'Account',
      items: [
        {
          id: 'analytics',
          name: 'Analytics',
          icon: TrendingUp,
          component: <div className="p-6">Analytics coming soon...</div>
        },
        {
          id: 'resources',
          name: 'Resources',
          icon: BookOpen,
          component: <div className="p-6">Resources management coming soon...</div>
        },
        {
          id: 'profile',
          name: 'Profile',
          icon: User,
          component: <TutorSelfProfilePage />
        },
        {
          id: 'help',
          name: 'Help Center',
          icon: HelpCircle,
          component: <div className="p-6">Help center coming soon...</div>
        },
        {
          id: 'settings',
          name: 'Settings',
          icon: Settings,
          component: <TutorSetting />
        }
      ]
    }
  ];

  const activeComponent = sidebarItems
    .flatMap(group => group.items)
    .find(item => item.id === activeTab)?.component;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-white">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full flex items-center justify-center text-black">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt="Profile" className="h-full w-full object-cover rounded-full" />
          ) : (
            user?.full_name?.charAt(0) || <User className="h-5 w-5" />
          )}
        </div>

            
            <div>
              <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
              <p className="text-xs text-gray-500">Tutor Account</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {sidebarItems.map((group) => (
            <div key={group.group} className="mb-2">
              <button
                onClick={() => toggleGroup(group.group)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <span>{group.name}</span>
                {expandedGroups[group.group] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {expandedGroups[group.group] && (
                <div className="ml-2 mt-1 space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setBadgeCounts(prev => ({ ...prev, [item.id]: 0 }));
                          localStorage.setItem(lastSeenKey(item.id), String(Date.now()));
                          if (item.id === 'interviews') {
                            const status = localStorage.getItem('tutor_last_known_interviews_status') || '';
                            localStorage.setItem('tutor_last_seen_interviews_status', status);
                          }
                          fetchCounts();
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        <Icon className={cn(
                          "h-4 w-4 flex-shrink-0",
                          isActive ? "text-blue-600" : "text-gray-500"
                        )} />
                        <span className="flex-1 text-left">{item.name}</span>
                        {badgeCounts[item.id] > 0 && (
                          <span className="ml-auto h-2 w-2 rounded-full bg-red-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-gray-700 hover:bg-gray-100"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                {/* // In your desktop sidebar avatar: */}
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-black">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt="Profile" className="h-full w-full object-cover rounded-full" />
          ) : (
            user?.full_name?.charAt(0) || <User className="h-5 w-5" />
          )}
        </div>

                
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">Tutor Account</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-2">
              {sidebarItems.map((group) => (
                <div key={group.group} className="mb-2">
                  <button
                    onClick={() => toggleGroup(group.group)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <span>{group.name}</span>
                    {expandedGroups[group.group] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {expandedGroups[group.group] && (
                    <div className="ml-2 mt-1 space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setBadgeCounts(prev => ({ ...prev, [item.id]: 0 }));
                              localStorage.setItem(lastSeenKey(item.id), String(Date.now()));
                              fetchCounts();
                              setIsSidebarOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                              isActive
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-600 hover:bg-gray-100"
                            )}
                          >
                            <Icon className={cn(
                              "h-4 w-4 flex-shrink-0",
                              isActive ? "text-blue-600" : "text-gray-500"
                            )} />
                            <span className="flex-1 text-left">{item.name}</span>
                            {badgeCounts[item.id] > 0 && (
                              <span className="ml-auto h-2 w-2 rounded-full bg-red-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="p-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-gray-700 hover:bg-gray-100"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b p-3">
          <div className="flex items-center justify-between">
            <button
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">
              {sidebarItems
                .flatMap(group => group.items)
                .find(item => item.id === activeTab)?.name || 'Dashboard'}
            </h1>
            <Avatar className="h-8 w-8">
              <AvatarImage src={profileImageUrl} className="object-cover" />
              <AvatarFallback>
                {user?.full_name?.charAt(0) || 'T'}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {activeComponent}
        </main>
      </div>
    </div>
  );
};

export default TutorDashboardPage; 