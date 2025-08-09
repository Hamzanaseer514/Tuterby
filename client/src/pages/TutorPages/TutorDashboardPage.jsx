import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TutorDashboard from '../../components/tutor/TutorDashboard';
import SessionManagement from '../../components/tutor/SessionManagement';
import InquiryManagement from '../../components/tutor/InquiryManagement';
import AvailabilityCalendar from '../../components/tutor/AvailabilityCalendar';
import StudentHireRequests from '../../components/tutor/StudentHireRequests';
import Chatting from '../../components/tutor/Chatting';
import { Button } from '../../components/ui/button';
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const TutorDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tutorId, setTutorId] = useState(null);
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
      
      // Use URL parameter if available, otherwise use user ID
      setTutorId(tutorId);
    }
  }, [user, loading, navigate, isTutor]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
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
      id: 'inquiries',
      name: 'Inquiries',
      icon: MessageSquare,
      component: <InquiryManagement/>
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: TrendingUp,
      component: <div className="p-6">Analytics coming soon...</div>
    },
    {
      id: 'student-requests',
      name: 'Student Requests',
      icon: Settings,
      component: <StudentHireRequests/>,
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      component: <div className="p-6">Settings coming soon...</div>
    },
    {
      id: 'availability',
      name: 'Availability',
      icon: Calendar,
      component: <AvailabilityCalendar/>
    },
    {
      id: 'chat',
      name: 'Chat',
      icon: MessageSquare,
      component: <Chatting/>
    }
  ];

  const activeComponent = tabs.find(tab => tab.id === activeTab)?.component;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Tutor Portal</h1>
              {user && (
                <span className="ml-4 text-sm text-gray-600">
                  Welcome, {user.full_name}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Profile
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main>
        {activeComponent}
      </main>
    </div>
  );
};

export default TutorDashboardPage; 