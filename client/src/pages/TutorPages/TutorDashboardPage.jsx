import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import TutorPaymentHistory from '../../components/tutor/TutorPaymentHistory';
import TutorReviewsPageForTutor from './TutorReviewsPage';
import TutorDocumentReuploadPage from './TutorDocumentReuploadPage';
import TutorAssignments from '../../components/tutor/TutorAssignments';
import TutorSubmissions from '../../components/tutor/TutorSubmissions';
import { BASE_URL } from '../../config';
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
  HelpCircle,
  DollarSign,
  Star,
  Upload,
  FileText,
  CheckCircle
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
  const [badgeCounts, setBadgeCounts] = useState({ inquiries: 0, chat: 0, 'student-requests': 0, sessions: 0, interviews: 0, submissions: 0, assignments: 0, 'payment-history': 0, reviews: 0 });
  const [hasRejectedDocuments, setHasRejectedDocuments] = useState(false);
  const navigate = useNavigate();
  const { user, loading, logout, isTutor, getUserProfile, fetchWithAuth } = useAuth();

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const raw = await getUserProfile(user?._id);
        const photo_url = raw.photo_url;
        if (!photo_url) {
          setProfileImageUrl('');
          return;
        }
        // Backend already sends complete S3 URL, no need to construct
        setProfileImageUrl(photo_url);
      } catch (error) {
        console.error('Error fetching profile image:', error);
        setProfileImageUrl('');
      }
    };

    if (user?._id) {
      fetchProfileImage();
    }
  }, [user]);

  // Listen for photo updates from localStorage or custom events
  useEffect(() => {
    const handlePhotoUpdate = async () => {
      if (user?._id) {
        try {
          const raw = await getUserProfile(user._id);
          const photo_url = raw.photo_url;
          if (!photo_url) {
            setProfileImageUrl('');
            return;
          }
          // Backend already sends complete S3 URL, no need to construct
          setProfileImageUrl(photo_url);
        } catch (error) {
          console.error('Error fetching profile image:', error);
          setProfileImageUrl('');
        }
      }
    };

    // Listen for custom event when photo is updated
    window.addEventListener('photoUpdated', handlePhotoUpdate);
    
    // Also check localStorage for photo updates
    const checkPhotoUpdate = () => {
      const lastPhotoUpdate = localStorage.getItem('lastPhotoUpdate');
      if (lastPhotoUpdate) {
        const updateTime = parseInt(lastPhotoUpdate);
        const now = Date.now();
        // If photo was updated in the last 5 seconds, refresh
        if (now - updateTime < 5000) {
          handlePhotoUpdate();
        }
      }
    };

    const interval = setInterval(checkPhotoUpdate, 1000);

    return () => {
      window.removeEventListener('photoUpdated', handlePhotoUpdate);
      clearInterval(interval);
    };
  }, [user, getUserProfile]);

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
      
      // Check for rejected documents if partially approved
      if (user?.is_verified === 'partial_active') {
        checkRejectedDocuments();
      }
    }
  }, [user, loading, navigate, isTutor]);

  const checkRejectedDocuments = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/tutor/rejected-documents/${user._id}`);
      const data = await response.json();
      if (response.ok) {
        const hasRejectedOrPending = data.documents.some(doc => 
          doc.status === 'rejected' || doc.status === 'pending' || doc.status === 'missing'
        );
        setHasRejectedDocuments(hasRejectedOrPending);
        console.log('Has Rejected/Pending/Missing Documents:', hasRejectedOrPending);
      }
    } catch (error) {
      console.error('Error checking rejected documents:', error);
    }
  };

  const fetchCounts = useCallback(async () => {
    try {
      if (!user?._id) return;
      const getAuthToken = () => sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const headers = { 'Content-Type': 'application/json' };
      const token = getAuthToken();
      // if (token) headers['Authorization'] = `Bearer ${token}`;

      const inquiriesRes = await fetchWithAuth(`${BASE_URL}/api/tutor/inquiries/${user._id}?status=unread`, { headers }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      // console.log("inquiriesRes", inquiriesRes);  
    );
      const inquiriesJson = inquiriesRes.ok ? await inquiriesRes.json() : { total: 0, inquiries: [] };
      const inquiriesList = inquiriesJson.inquiries || [];
      const inquiriesLatest = inquiriesList[0]?.created_at || inquiriesList[0]?.createdAt || null;
      let inquiriesCount = Number.isFinite(inquiriesJson.total) ? inquiriesJson.total : inquiriesList.length;
      const inquiriesSeen = Number(localStorage.getItem(lastSeenKey('inquiries')) || 0);
      if (inquiriesLatest && inquiriesSeen >= new Date(inquiriesLatest).getTime()) {
        inquiriesCount = 0;
      }

      const hiresRes = await fetchWithAuth(`${BASE_URL}/api/tutor/hire-requests/${user._id}?status=pending`, { headers }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );
      const hiresJson = hiresRes.ok ? await hiresRes.json() : { requests: [] };
      const hireList = hiresJson.requests || [];
      const hireLatest = hireList[0]?.updatedAt || hireList[0]?.hired_at || null;
      let hireCount = hireList.length;
      const hiresSeen = Number(localStorage.getItem(lastSeenKey('student-requests')) || 0);
      if (hireLatest && hiresSeen >= new Date(hireLatest).getTime()) {
        hireCount = 0;
      }

      const sessionsRes = await fetchWithAuth(`${BASE_URL}/api/tutor/sessions/${user._id}?status=pending`, { headers }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );
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
        const msgRes = await fetchWithAuth(`${BASE_URL}/api/tutor/getallmessages`, { headers }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
        );
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
      } catch { }

      let interviewsCount = 0;
      try {
        const iRes = await fetchWithAuth(`${BASE_URL}/api/tutor/interview-slots/${user._id}`, { headers }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
        );
        if (iRes.ok) {
          const iJson = await iRes.json();
          const data = iJson?.data || {};
          const preferred = Array.isArray(data.preferred_interview_times) ? data.preferred_interview_times : [];
          const scheduledTime = data.scheduled_time ? new Date(data.scheduled_time).getTime() : 0;
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
            interviewsCount = 1;
          }

          const currentStatus = data.interview_status || '';
          localStorage.setItem('tutor_last_known_interviews_status', currentStatus);
          const seenStatus = localStorage.getItem('tutor_last_seen_interviews_status') || '';
          if (currentStatus && currentStatus !== 'Pending' && currentStatus !== seenStatus) {
            interviewsCount = 1;
          }
        }
      } catch { }

      // Unread submissions count for Submissions tab
      let submissionsCount = 0;
      try {
        const subsRes = await fetchWithAuth(`${BASE_URL}/api/assignments/tutor/${user._id}/unread-submissions-count`, { headers }, token, (newToken) => localStorage.setItem('authToken', newToken));
        if (subsRes.ok) {
          const subsJson = await subsRes.json();
          submissionsCount = Number(subsJson.unread_count) || 0;
        }
      } catch {}

      // Use submissionsCount also to notify on Assignments tab
      const assignmentsCount = 0;

      // Payment History badge: show if there are new payments or payment issues
      let paymentHistoryCount = 0;
      try {
        const paymentRes = await fetchWithAuth(`${BASE_URL}/api/tutor/payment-history/${user._id}`, { headers }, token, (newToken) => localStorage.setItem('authToken', newToken));
        if (paymentRes.ok) {
          const paymentJson = await paymentRes.json();
          const dataObj = paymentJson?.data || {};
          const payments = Array.isArray(paymentJson) ? paymentJson : (Array.isArray(dataObj?.payments) ? dataObj.payments : (paymentJson.payments || []));
          const latestPayment = payments[0]?.createdAt || payments[0]?.payment_date || payments[0]?.date || null;
          const pendingPayments = payments.filter(p => {
            const status = (p?.payment_status || p?.status || p?.state || '').toString().toLowerCase();
            return status === 'pending' || status === 'failed';
          }).length;
          const seen = Number(localStorage.getItem(lastSeenKey('payment-history')) || 0);
          
          // Show badge if there are pending/failed payments or new payments since last seen
          if (pendingPayments > 0 || (latestPayment && seen < new Date(latestPayment).getTime())) {
            paymentHistoryCount = 1;
          }
        }
      } catch {}

      // Student Reviews badge: show if there are new reviews
      let reviewsCount = 0;
      try {
        const reviewsRes = await fetchWithAuth(`${BASE_URL}/api/tutor/reviews/${user._id}`, { headers }, token, (newToken) => localStorage.setItem('authToken', newToken));
        if (reviewsRes.ok) {
          const reviewsJson = await reviewsRes.json();
          const reviews = Array.isArray(reviewsJson) ? reviewsJson : (reviewsJson.reviews || []);
          const latestReview = reviews[0]?.createdAt || reviews[0]?.review_date || null;
          const seen = Number(localStorage.getItem(lastSeenKey('reviews')) || 0);
          
          // Show badge if there are new reviews since last seen
          if (latestReview && seen < new Date(latestReview).getTime()) {
            reviewsCount = 1;
          }
        }
      } catch {}

      setBadgeCounts({ inquiries: inquiriesCount, chat: messagesCount, 'student-requests': hireCount, sessions: sessionsCount, interviews: interviewsCount, submissions: submissionsCount, assignments: assignmentsCount, 'payment-history': paymentHistoryCount, reviews: reviewsCount });
    } catch { }
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;
    fetchCounts();
    const onFocus = () => fetchCounts();
    window.addEventListener('focus', onFocus);
    const id = setInterval(fetchCounts, 30000);
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
          id: 'student-requests',
          name: 'Student Requests',
          icon: Briefcase,
          component: <StudentHireRequests />,
        },
    
        ...(user?.is_verified === 'partial_active' && hasRejectedDocuments ? [{
          id: 'document-reupload',
          name: 'Document Re-upload',
          icon: Upload,
          component: <TutorDocumentReuploadPage />
        }] : [])
      ]
    },
    {
      group: 'payments & reviews',
      name: 'Payments & Reviews',
      items: [
        {
          id: 'payment-history',
          name: 'Payment History',
          icon: DollarSign,
          component: <TutorPaymentHistory />
        },
        {
          id: 'reviews',
          name: 'Student Reviews',
          icon: Star,
          component: <TutorReviewsPageForTutor />
        },
      ]
    },
    {
      group: 'assignments',
      name: 'Assignments',
      items: [
        {
          id: 'assignments',
          name: 'Assignments',
          icon: FileText,
          component: <TutorAssignments />
        },
        {
          id: 'submissions',
          name: 'Evalutions ',
          icon: CheckCircle,
          component: <TutorSubmissions />
        },
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
          id: 'profile',
          name: 'Profile',
          icon: User,
          component: <TutorSelfProfilePage />
        },
      
        {
          id: 'settings',
          name: 'Settings',
          icon: Settings,
          component: <TutorSetting />
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

        <nav className="flex-1 overflow-y-auto p-2" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
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

            <nav className="flex-1 overflow-y-auto p-2" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
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
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-black">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" className="h-full w-full object-cover rounded-full" />
              ) : (
                user?.full_name?.charAt(0) || <User className="h-5 w-5" />
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          {activeComponent}
        </main>
      </div>
    </div>
  );
};

export default TutorDashboardPage;
