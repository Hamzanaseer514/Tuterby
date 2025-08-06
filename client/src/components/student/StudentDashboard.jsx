import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
  Eye
} from 'lucide-react';

const StudentDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getAuthToken, user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
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
      const response = await fetch(`http://localhost:5000/api/auth/student/dashboard/${user?._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
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

  const getAssignmentStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "secondary", icon: AlertCircle },
      in_progress: { variant: "default", icon: Clock },
      completed: { variant: "default", icon: CheckCircle }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

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
          <Button onClick={() => navigate(`/student/request-help`)}>
            <Plus className="w-4 h-4 mr-2" />
            Request Help
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <FileText className="w-8 h-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.recentAssignments.filter(a => a.status !== 'completed').length}
                </p>
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
                <Button 
                  onClick={() => navigate(`/student/tutor-search`)} 
                  variant="outline" 
                  className="mt-2"
                >
                  Book a Session
                </Button>
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
                        <p className="font-medium">{session.tutor_id.full_name}</p>
                        <p className="text-sm text-gray-600">{session.subject}</p>
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

        {/* Recent Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.recentAssignments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No assignments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.recentAssignments.map((assignment) => (
                  <div key={assignment._id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{assignment.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{assignment.subject}</Badge>
                          {getAssignmentStatusBadge(assignment.status)}
                        </div>
                        {assignment.due_date && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {formatDate(assignment.due_date)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
                        <p className="font-medium">{session.tutor_id.full_name}</p>
                        <p className="text-sm text-gray-600">{session.subject}</p>
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

        {/* Recent Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Recent Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.recentNotes.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No notes yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.recentNotes.map((note) => (
                  <div key={note._id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{note.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{note.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{note.subject}</Badge>
                          <p className="text-xs text-gray-500">
                            {formatDate(note.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => navigate(`/student/tutor-search/${studentId}`)} 
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Search className="w-6 h-6" />
              <span>Find New Tutors</span>
            </Button>
            
            <Button 
              onClick={() => navigate(`/student/request-help/${studentId}`)} 
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Plus className="w-6 h-6" />
              <span>Request Help</span>
            </Button>
            
            <Button 
              onClick={() => navigate(`/student/preferences/${studentId}`)} 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Settings className="w-6 h-6" />
              <span>Update Preferences</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/subjects')} 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <BookOpen className="w-6 h-6" />
              <span>Browse Subjects</span>
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default StudentDashboard; 