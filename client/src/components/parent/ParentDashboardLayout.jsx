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
  User
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
      /* Custom scrollbar styling */
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }
      
      /* Firefox scrollbar */
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #d1d5db transparent;
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
    { id: 'tutors', label: 'Tutors', icon: BarChart3, path: '/parent-dashboard/tutors' },
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
      console.error('Error fetching dashboard stats:', error);
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Parent Dashboard
          </h1>
          <div className="relative">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar - Fixed position */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-black">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="h-full w-full object-cover rounded-full" />
                ) : (
                  user?.full_name?.charAt(0) || <User className="h-5 w-5" />
                )}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Parent Portal
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.full_name}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation - Scrollable if needed */}
        <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200",
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
                {item.id === 'children' && stats.totalChildren > 0 && (
                  <Badge variant={isActive ? "secondary" : "default"} className="ml-auto">
                    {stats.totalChildren}
                  </Badge>
                )}
                {item.id === 'sessions' && (
                  <Badge variant={isActive ? "secondary" : "default"} className="ml-auto">
                    {stats.activeChildren > 0 ? 'Active' : 'None'}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 flex flex-col">
        {/* Top spacing for mobile header */}
        <div className="lg:hidden h-20"></div>
        
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6">
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
