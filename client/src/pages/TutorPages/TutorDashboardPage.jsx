import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TutorDashboard from '../../components/tutor/TutorDashboard';
import SessionManagement from '../../components/tutor/SessionManagement';
import InquiryManagement from '../../components/tutor/InquiryManagement';
import AvailabilityCalendar from '../../components/tutor/AvailabilityCalendar';
import StudentHireRequests from '../../components/tutor/StudentHireRequests';
import Chatting from '../../components/tutor/Chatting';
import { Button } from '../../components/ui/button';
import TutorSetting from '../../components/tutor/TutorSetting';
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

const TutorDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tutorId, setTutorId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    teaching: true,
    communication: true,
    account: true
  });
  const navigate = useNavigate();
  const { user, loading, logout, isTutor } = useAuth();

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
      component: <TutorDashboard/>
    },
    {
      id: 'sessions',
      name: 'Sessions',
      icon: Calendar,
      component: <SessionManagement/>
    },
        {
          id: 'availability',
          name: 'Availability',
          icon: Clock,
          component: <AvailabilityCalendar/>
        },
        {
          id: 'student-requests',
          name: 'Student Requests',
          icon: Briefcase,
          component: <StudentHireRequests/>,
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
      component: <InquiryManagement/>
    },
        {
          id: 'chat',
          name: 'Chat',
          icon: MessageSquare,
          component: <Chatting/>
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
          id: 'help',
          name: 'Help Center',
          icon: HelpCircle,
          component: <div className="p-6">Help center coming soon...</div>
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
          component: <TutorSetting/>
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
            <Avatar>
              <AvatarImage src={user?.profile_picture} />
              <AvatarFallback>
                {user?.full_name?.charAt(0) || 'T'}
              </AvatarFallback>
            </Avatar>
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
                        onClick={() => setActiveTab(item.id)}
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
                        <span>{item.name}</span>
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
                <Avatar>
                  <AvatarImage src={user?.profile_picture} />
                  <AvatarFallback>
                    {user?.full_name?.charAt(0) || 'T'}
                  </AvatarFallback>
                </Avatar>
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
                            <span>{item.name}</span>
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
              <AvatarImage src={user?.profile_picture} />
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