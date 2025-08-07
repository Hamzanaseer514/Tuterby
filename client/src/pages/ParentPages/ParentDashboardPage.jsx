import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import ParentDashboard from '../components/parent/ParentDashboard';

const ParentDashboardPage = () => {
  const { parentId } = useParams();
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) {
      return;
    }

    // Check if user is authenticated and is a parent
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'parent') {
      toast({
        title: "Access Denied",
        description: "This dashboard is only for parents",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    // Check if the parentId in URL matches the logged-in user
    if (user._id !== parentId) {
      toast({
        title: "Access Denied",
        description: "You can only access your own dashboard",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    setLoading(false);
  }, [user, parentId, navigate, toast, authLoading]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      component: <ParentDashboard parentId={parentId} />
    },
    {
      id: 'students',
      name: 'My Students',
      icon: Users,
      component: <div className="p-6">Student management coming soon...</div>
    },
    {
      id: 'sessions',
      name: 'All Sessions',
      icon: Calendar,
      component: <div className="p-6">All sessions view coming soon...</div>
    },
    {
      id: 'assignments',
      name: 'Assignments',
      icon: FileText,
      component: <div className="p-6">Assignments overview coming soon...</div>
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      component: <div className="p-6">Settings coming soon...</div>
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Parent Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-gray-500">Parent</p>
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
                      ? 'border-green-500 text-green-600'
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

export default ParentDashboardPage; 