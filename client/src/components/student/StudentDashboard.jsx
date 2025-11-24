import React, { useState, useEffect,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BASE_URL } from '@/config';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  FileText, 
  User, 
  Star,
  Plus,
  Search,
  Settings,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Eye,
  CreditCard
} from 'lucide-react';
import { useSubject } from '../../hooks/useSubject';

const StudentDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getAuthToken, user ,fetchWithAuth } = useAuth();
  const { academicLevels, subjects } = useSubject();
  const [dashboardData, setDashboardData] = useState({
    student: { full_name: "" },
    upcomingSessions: [],
    pastSessions: [],
    pendingPayments: [],
    profile: { preferred_subjects: [] }
  });
    const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      const response = await fetchWithAuth(`${BASE_URL}/api/auth/student/dashboard/${user?._id}`, {
       method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      // setDashboardData(data);
      setDashboardData({
        student: data.student || { full_name: "" },
        upcomingSessions: data.upcomingSessions || [],
        pastSessions: data.pastSessions || [],
        pendingPayments: data.pendingPayments || [],
        profile: data.profile || { preferred_subjects: [] }
      });
    } catch (error) {
      // setError(error.message);
      // toast({
      //   title: "Error",
      //   description: "Failed to load dashboard data",
      //   variant: "destructive"
      // });
    } finally {
      setLoading(false);
    }
  };

  const matchAcademicLevel = (level) => {
    const matchedLevel = academicLevels.find(l => l._id === level);
    if(matchedLevel){
      return matchedLevel;
    }
    return null;
  }
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    // Format time from session_date to ensure timezone consistency
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "secondary", icon: AlertCircle },
      confirmed: { variant: "default", icon: CheckCircle },
      in_progress: { variant: "default", icon: Clock },
      completed: { variant: "default", icon: CheckCircle },
      cancelled: { variant: "destructive", icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  const getSubjectById = useCallback((id) => {
    if (!id) return undefined;
    const s = (subjects || []).find(s => s?._id?.toString() === id.toString());
    return s;
}, [subjects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
  //         <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
  //         <p className="text-gray-600 mb-4">{error}</p>
  //         <Button onClick={fetchDashboardData}>Try Again</Button>
  //       </div>
  //     </div>
  //   );
  // }

  // if (dashboardData )
  //   else
  



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {dashboardData.student.full_name}!</h1>
          <p className="text-gray-600 mt-1">Manage your tutoring activities and track your progress</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/student/tutor-search`)} variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Find Tutors
          </Button>
         
          {/* <Button onClick={() => navigate(`/student/request-help`)}>
            <Plus className="w-4 h-4 mr-2" />
            Request Help
          </Button> */}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.upcomingSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.profile?.preferred_subjects?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.pastSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.pendingPayments?.length || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {dashboardData.pendingPayments?.length > 0 
                    ? `£${dashboardData.pendingPayments.reduce((sum, p) => sum + (p.final_amount || 0), 0)} total`
                    : 'No pending payments'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No upcoming sessions</p>
                {/* <Button 
                  onClick={() => navigate(`/student/tutor-search`)} 
                  variant="outline" 
                  className="mt-2"
                >
                  Book a Session
                </Button> */}
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.upcomingSessions.slice(0, 5).map((session) => (
                  <div key={session._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{session.tutor_id.user_id.full_name}</p>
                        <p className="text-sm text-gray-600">{getSubjectById(session.subject)?.name || session.subject} - {matchAcademicLevel(session.academic_level).level}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(session.session_date)} at {formatTime(session.session_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(session.status)}
                      <p className="text-sm font-medium mt-1">£{session.hourly_rate}/hr</p>
                    </div>
                  </div>
                ))}
                {dashboardData.upcomingSessions.length > 5 && (
                  <Button 
                    onClick={() => navigate(`/student/sessions}`)} 
                    variant="outline" 
                    className="w-full"
                  >
                    View All Sessions
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Recent Completed Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.pastSessions.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No completed sessions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.pastSessions.slice(0, 5).map((session) => (
                  <div key={session._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{session.tutor_id.user_id.full_name}</p>
                        <p className="text-sm text-gray-600">{getSubjectById(session.subject)?.name || session.subject} - {matchAcademicLevel(session.academic_level).level}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(session.session_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {session.rating && (
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{session.rating}/5</span>
                        </div>
                      )}
                      <p className="text-sm font-medium">£{session.total_earnings}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard; 