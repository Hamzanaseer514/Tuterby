import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LogOut,
  User,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import RequestHelp from '../components/student/RequestHelp';
import { Toaster } from "@/components/ui/toaster";

const StudentRequestHelpPage = () => {
  const { studentId } = useParams();
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }

    // Check if user is authenticated and is a student
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    // Check user role immediately
    if (user.role !== 'student') {
      console.log('User role is not student:', user.role);
      toast({
        title: "Access Denied",
        description: "This page is only for students",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    // Check if the studentId in URL matches the logged-in user
    const userId = studentId;
    if (userId !== studentId) {
      console.log('User ID mismatch:', userId, 'vs', studentId);
      toast({
        title: "Access Denied",
        description: "You can only access your own dashboard",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    setLoading(false);
  }, [user, studentId, navigate, toast, authLoading]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    navigate(`/student-dashboard/${studentId}`);
  };

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
              <Button 
                onClick={handleBackToDashboard} 
                variant="outline" 
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Request Help</h1>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RequestHelp studentId={studentId} />
      </main>
      
      <Toaster />
    </div>
  );
};

export default StudentRequestHelpPage; 