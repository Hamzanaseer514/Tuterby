import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useParent } from '../../contexts/ParentContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  Settings, 
  Bell, 
  Menu, 
  X,
  Home,
  UserPlus,
  BarChart3,
  MessageSquare,
  User,
  Star
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { BASE_URL } from '../../config';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const ParentDashboardLayout = ({ children, activeTab }) => {
  // Custom CSS for thin, light grey scrollbars
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Custom scrollbar styling for sidebar */
      .sidebar-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      
      .sidebar-scrollbar::-webkit-scrollbar-track {
        background: #f3f4f6;
        border-radius: 3px;
      }
      
      .sidebar-scrollbar::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
      }
      
      .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }
      
      /* Custom scrollbar styling for main content */
      .content-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      .content-scrollbar::-webkit-scrollbar-track {
        background: #f9fafb;
        border-radius: 4px;
      }
      
      .content-scrollbar::-webkit-scrollbar-thumb {
        background: #e5e7eb;
        border-radius: 4px;
      }
      
      .content-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #d1d5db;
      }
      
      /* Firefox scrollbar */
      .sidebar-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #d1d5db #f3f4f6;
      }
      
      .content-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #e5e7eb #f9fafb;
      }

      /* Dark mode scrollbars */
      .dark .sidebar-scrollbar::-webkit-scrollbar-track {
        background: #374151;
      }
      
      .dark .sidebar-scrollbar::-webkit-scrollbar-thumb {
        background: #4b5563;
      }
      
      .dark .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
      }
      
      .dark .content-scrollbar::-webkit-scrollbar-track {
        background: #1f2937;
      }
      
      .dark .content-scrollbar::-webkit-scrollbar-thumb {
        background: #374151;
      }
      
      .dark .content-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #4b5563;
      }
      
      .dark .sidebar-scrollbar {
        scrollbar-color: #4b5563 #374151;
      }
      
      .dark .content-scrollbar {
        scrollbar-color: #374151 #1f2937;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const { user, getUserProfile} = useAuth();
  const { getParentDashboardStats } = useParent();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  
  const [stats, setStats] = useState({
    totalChildren: 0,
    activeChildren: 0,
    inactiveChildren: 0
  });
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New tutor available for GCSE Math', type: 'info', read: false },
    { id: 2, message: 'Session scheduled for tomorrow', type: 'success', read: false },
    { id: 3, message: 'Payment received for this month', type: 'success', read: true }
  ]);

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home, path: '/parent-dashboard' },
    { id: 'children', label: 'My Children', icon: Users, path: '/parent-dashboard/children' },
    { id: 'sessions', label: 'Sessions', icon: Calendar, path: '/parent-dashboard/sessions' },
    { id: 'profile', label: 'My Profile', icon: User, path: '/parent-dashboard/profile' },
    { id: 'payments', label: 'Payments', icon: CreditCard, path: '/parent-dashboard/payments' },
    { id: 'tutors', label: 'Find Tutors', icon: BarChart3, path: '/parent-dashboard/tutors' },
    { id: 'hired-tutors', label: 'Your Tutors', icon: Star, path: '/parent-dashboard/hired-tutors' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/parent-dashboard/settings' }
  ];
  
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const raw = await getUserProfile(user?._id);
        const photo_url = raw.photo_url;
        if (!photo_url) {
          setProfileImageUrl('');
          return;
        }
        // Preload image then swap to avoid flicker
        const img = new Image();
        img.src = photo_url;
        img.onload = () => {
          setProfileImageUrl(photo_url);
        };
        img.onerror = () => {
          setProfileImageUrl('');
        };
      } catch (error) {
        // console.error('Error fetching profile image:', error);
        setProfileImageUrl('');
      }
    };

    if (user?._id) {
      fetchProfileImage();
    }
  }, [user]);
  
  useEffect(() => {
    fetchDashboardStats();
    // Listen for custom events to update stats
    const handleDataUpdate = () => fetchDashboardStats();
    window.addEventListener('parentDataUpdated', handleDataUpdate);
    
    return () => window.removeEventListener('parentDataUpdated', handleDataUpdate);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await getParentDashboardStats(user._id);
      setStats(data);
    } catch (error) {
      // console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleTabClick = (tabId) => {
    if (tabId === 'overview') {
      navigate('/parent-dashboard');
    } else {
      navigate(`/parent-dashboard/${tabId}`);
    }
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header - Fixed at top */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 sm:p-2 h-8 sm:h-9 w-8 sm:w-9"
          >
            {isSidebarOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate mx-2">
            Parent Dashboard
          </h1>
         
        </div>
      </div>

      {/* Sidebar - Fixed position */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 xs:w-72 sm:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Profile"
                className="h-full w-full object-cover rounded-full transition-opacity duration-300 opacity-100"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-600" />
            )}
            {!profileImageUrl && (
              <div className="relative z-10 text-white flex items-center justify-center w-full h-full">
                {user?.full_name?.charAt(0) || <User className="h-4 w-4 sm:h-5 sm:w-5" />}
              </div>
            )}
          </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate">
                Parent Portal
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                {user?.full_name}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden flex-shrink-0 p-1.5 sm:p-2 h-8 sm:h-9 w-8 sm:w-9"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Navigation - Scrollable if needed */}
        <nav className="p-2 sm:p-3 lg:p-4 space-y-1 overflow-y-auto h-[calc(100vh-120px)] sidebar-scrollbar">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 rounded-lg text-left transition-colors duration-200 group",
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <Icon className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-sm lg:text-base truncate flex-1">
                  {item.label}
                </span>
                {item.id === 'children' && stats.totalChildren > 0 && (
                  <Badge 
                    variant={isActive ? "secondary" : "default"} 
                    className="text-xs px-1.5 py-0 min-w-[20px] flex-shrink-0"
                  >
                    {stats.totalChildren}
                  </Badge>
                )}
                {item.id === 'sessions' && (
                  <Badge 
                    variant={isActive ? "secondary" : "default"} 
                    className="text-xs px-1.5 py-0 min-w-[20px] flex-shrink-0"
                  >
                    {stats.activeChildren > 0 ? 'Active' : 'None'}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top spacing for mobile header */}
        <div className="lg:hidden h-12 sm:h-14 lg:h-16"></div>
        
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto content-scrollbar h-[calc(100vh-60px)] lg:h-[calc(100vh-0px)]">
          <div className="p-3 sm:p-4 lg:p-6 min-h-full">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ParentDashboardLayout;