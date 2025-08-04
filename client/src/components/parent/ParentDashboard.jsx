import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../ui/use-toast';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  FileText, 
  Plus,
  Search,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  User,
  Star,
  Clock
} from 'lucide-react';

const ParentDashboard = ({ parentId }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (parentId) {
      fetchDashboardData();
    }
  }, [parentId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      // For now, we'll simulate parent dashboard data
      // In a real implementation, you'd fetch this from the backend
      const mockData = {
        parent: {
          _id: parentId,
          full_name: "John Smith",
          email: "john.smith@example.com"
        },
        students: [
          {
            _id: "student1",
            full_name: "Emma Smith",
            academic_level: "GCSE",
            preferred_subjects: ["Mathematics", "English", "Science"],
            upcomingSessions: [
              {
                _id: "session1",
                tutor_id: { full_name: "Dr. Johnson", email: "johnson@example.com" },
                subject: "Mathematics",
                session_date: new Date(Date.now() + 86400000).toISOString(),
                status: "confirmed",
                hourly_rate: 45
              }
            ],
            pastSessions: [
              {
                _id: "session2",
                tutor_id: { full_name: "Dr. Johnson", email: "johnson@example.com" },
                subject: "Mathematics",
                session_date: new Date(Date.now() - 86400000).toISOString(),
                status: "completed",
                rating: 5,
                total_earnings: 45
              }
            ],
            assignments: [
              {
                _id: "assignment1",
                title: "Algebra Practice",
                description: "Complete exercises 1-10 in Chapter 5",
                subject: "Mathematics",
                status: "pending",
                due_date: new Date(Date.now() + 172800000).toISOString()
              }
            ]
          },
          {
            _id: "student2",
            full_name: "James Smith",
            academic_level: "A-Level",
            preferred_subjects: ["Physics", "Chemistry"],
            upcomingSessions: [],
            pastSessions: [],
            assignments: []
          }
        ]
      };
      
      setDashboardData(mockData);
      if (mockData.students.length > 0) {
        setSelectedStudent(mockData.students[0]);
      }
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
      cancelled: { variant: "destructive", icon: AlertCircle }
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

  const totalUpcomingSessions = dashboardData.students.reduce(
    (total, student) => total + student.upcomingSessions.length, 0
  );
  
  const totalCompletedSessions = dashboardData.students.reduce(
    (total, student) => total + student.pastSessions.length, 0
  );
  
  const totalActiveAssignments = dashboardData.students.reduce(
    (total, student) => total + student.assignments.filter(a => a.status !== 'completed').length, 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {dashboardData.parent.full_name}!</h1>
          <p className="text-gray-600 mt-1">Monitor your children's tutoring progress and activities</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/subjects')} variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Find Tutors
          </Button>
          <Button onClick={() => navigate('/register')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Student Selector */}
      {dashboardData.students.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">View activities for:</span>
              <Select value={selectedStudent?._id} onValueChange={(value) => {
                const student = dashboardData.students.find(s => s._id === value);
                setSelectedStudent(student);
              }}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {dashboardData.students.map((student) => (
                    <SelectItem key={student._id} value={student._id}>
                      {student.full_name} - {student.academic_level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Upcoming Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{totalUpcomingSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.students.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{totalActiveAssignments}</p>
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
                <p className="text-2xl font-bold text-gray-900">{totalCompletedSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Selected Student Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {selectedStudent.full_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Academic Level</p>
                  <p className="text-lg font-semibold">{selectedStudent.academic_level}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Subjects</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedStudent.preferred_subjects.map((subject) => (
                      <Badge key={subject} variant="outline">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedStudent.upcomingSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming sessions</p>
                  <Button 
                    onClick={() => navigate('/subjects')} 
                    variant="outline" 
                    className="mt-2"
                  >
                    Book a Session
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedStudent.upcomingSessions.map((session) => (
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
              {selectedStudent.assignments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No assignments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedStudent.assignments.slice(0, 3).map((assignment) => (
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

          {/* Recent Completed Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Recent Completed Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedStudent.pastSessions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No completed sessions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedStudent.pastSessions.slice(0, 3).map((session) => (
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
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => navigate('/subjects')} 
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Search className="w-6 h-6" />
              <span>Find Tutors</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/register')} 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Plus className="w-6 h-6" />
              <span>Add Student</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/subjects')} 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <BookOpen className="w-6 h-6" />
              <span>View Progress</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentDashboard; 