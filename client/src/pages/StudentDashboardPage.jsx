import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  BookOpen,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import StudentDashboard from '../components/student/StudentDashboard';
import StudentSessions from '../components/student/StudentSessions';
import StudentPreferences from '../components/student/StudentPreferences';

const StudentDashboardPage = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Checking user authentication and role...', user, loading);

    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }

    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    if (user.role !== 'student') {
      console.log('User role is not student:', user.role);
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      component: <StudentDashboard  />,
    },
    {
      id: 'sessions',
      name: 'My Sessions',
      icon: Calendar,
      component: <StudentSessions />,
    },
    {
      id: 'assignments',
      name: 'Assignments',
      icon: FileText,
      component: <div className="p-6">Assignments coming soon...</div>,
    },
    {
      id: 'notes',
      name: 'Notes',
      icon: BookOpen,
      component: <div className="p-6">Notes coming soon...</div>,
    },
    {
      id: 'preferences',
      name: 'Preferences',
      icon: Settings,
      component: <StudentPreferences />,
    },
  ];

  const activeComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-gray-500">Student</p>
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeComponent}
      </main>
    </div>
  );
};

export default StudentDashboardPage;
