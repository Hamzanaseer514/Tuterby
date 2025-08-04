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
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../ui/use-toast';
import { Toaster } from '../ui/toaster';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Star, 
  MessageSquare, 
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Eye,
  Plus,
  Edit,
  Reply,
  XCircle
} from 'lucide-react';

const TutorDashboard = ({ tutorId }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Common subjects for dropdown
  const commonSubjects = [
    'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Economics', 'Business Studies', 'Computer Science',
    'Art', 'Music', 'Physical Education', 'Religious Studies', 'Modern Languages',
    'French', 'German', 'Spanish', 'Latin', 'Greek', 'Psychology', 'Sociology',
    'Philosophy', 'Literature', 'Creative Writing', 'Statistics', 'Accounting',
    'Law', 'Medicine', 'Engineering', 'Architecture', 'Design', 'Drama',
    'Media Studies', 'Politics', 'International Relations', 'Environmental Science'
  ];
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [showUpdateSessionModal, setShowUpdateSessionModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  
  // Form states
  const [sessionForm, setSessionForm] = useState({
    student_id: '',
    subject: '',
    session_date: '',
    duration_hours: 1,
    hourly_rate: 25,
    notes: ''
  });
  const [updateSessionForm, setUpdateSessionForm] = useState({
    student_id: '',
    subject: '',
    session_date: '',
    duration_hours: '',
    hourly_rate: '',
    status: '',
    rating: '',
    feedback: '',
    notes: ''
  });
  const [replyMessage, setReplyMessage] = useState('');
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    if (tutorId) {
      fetchDashboardData();
      fetchAvailableStudents();
    } else {
      setLoading(false);
    }
  }, [tutorId]);

  const fetchDashboardData = async () => {
    if (!tutorId) {
      setError('Tutor ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/tutor/dashboard/${tutorId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch dashboard data');
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    
    // Validate that a valid student is selected
    if (!sessionForm.student_id || sessionForm.student_id === 'loading' || sessionForm.student_id === 'no-students') {
      toast({
        title: "Error",
        description: "Please select a valid student",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Check availability before creating session
      const availabilityResponse = await fetch(
        `http://localhost:5000/api/tutor/availability/${tutorId}/check?date=${sessionForm.session_date}&duration_minutes=${sessionForm.duration_hours * 60}`
      );
      
      if (availabilityResponse.ok) {
        const availabilityData = await availabilityResponse.json();
        if (!availabilityData.is_available) {
          toast({
            title: "Error",
            description: "You are not available at the selected time. Please check your availability settings.",
            variant: "destructive",
          });
          return;
        }
      }
      
      const response = await fetch('http://localhost:5000/api/tutor/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...sessionForm,
          tutor_id: tutorId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      setShowCreateSessionModal(false);
      setSessionForm({
        student_id: '',
        subject: '',
        session_date: '',
        duration_hours: 1,
        hourly_rate: 25,
        notes: ''
      });
      fetchDashboardData(); // Refresh dashboard data
      toast({
        title: "Success!",
        description: "Session created successfully.",
        variant: "default",
      });
    } catch (err) {
      console.error('Error creating session:', err);
      toast({
        title: "Error",
        description: "Failed to create session: " + err.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateSession = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/tutor/sessions/${selectedSession._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updateSessionForm,
          total_earnings: updateSessionForm.duration_hours * updateSessionForm.hourly_rate
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update session');
      }

      setShowUpdateSessionModal(false);
      setSelectedSession(null);
      setUpdateSessionForm({
        student_id: '',
        subject: '',
        session_date: '',
        duration_hours: '',
        hourly_rate: '',
        status: '',
        rating: '',
        feedback: '',
        notes: ''
      });
      fetchDashboardData(); // Refresh dashboard data
      toast({
        title: "Success!",
        description: "Session updated successfully.",
        variant: "default",
      });
    } catch (err) {
      console.error('Error updating session:', err);
      toast({
        title: "Error",
        description: "Failed to update session: " + err.message,
        variant: "destructive",
      });
    }
  };

  const handleReplyToInquiry = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/tutor/inquiries/${selectedInquiry._id}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reply_message: replyMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      setShowReplyModal(false);
      setSelectedInquiry(null);
      setReplyMessage('');
      fetchDashboardData(); // Refresh dashboard data
      toast({
        title: "Success!",
        description: "Reply sent successfully.",
        variant: "default",
      });
    } catch (err) {
      console.error('Error sending reply:', err);
      toast({
        title: "Error",
        description: "Failed to send reply: " + err.message,
        variant: "destructive",
      });
    }
  };

  const openUpdateSessionModal = (session) => {
    setSelectedSession(session);
    setUpdateSessionForm({
      student_id: session.student_id._id,
      subject: session.subject,
      session_date: new Date(session.session_date).toISOString().slice(0, 16),
      duration_hours: session.duration_hours,
      hourly_rate: session.hourly_rate,
      status: session.status,
      rating: session.rating || '',
      feedback: session.feedback || '',
      notes: session.notes || ''
    });
    setShowUpdateSessionModal(true);
  };

  const openReplyModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowReplyModal(true);
  };

  const fetchAvailableStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await fetch('http://localhost:5000/api/tutor/students');
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      setAvailableStudents(data.students);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatHours = (hours) => {
    return `${Math.round(hours)} hours taught`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">
            {error === 'Tutor ID is required' 
              ? 'Authentication error. Please log in again.' 
              : error
            }
          </p>
          {error !== 'Tutor ID is required' && (
            <Button onClick={fetchDashboardData}>Try Again</Button>
          )}
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { upcomingSessions, recentSessions, pendingInquiries, metrics } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutor Dashboard</h1>
          <p className="text-gray-600">Manage your tutoring business and track your performance</p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="outline" 
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              onClick={() => navigate(`/tutor-dashboard/${tutorId}/availability`)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Manage Availability
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate(`/tutor-dashboard/${tutorId}/sessions`)}
            >
              <Clock className="h-4 w-4 mr-2" />
              View All Sessions
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate(`/tutor-dashboard/${tutorId}/inquiries`)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              View All Inquiries
            </Button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatHours(metrics.totalHours)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(metrics.totalEarnings)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.averageRating.toFixed(1)}/5
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.completedSessions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Response Time</span>
                  <span className="text-sm font-semibold">
                    {metrics.avgResponseTime > 0 
                      ? `${Math.round(metrics.avgResponseTime)} minutes`
                      : 'No data'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Booking Acceptance Rate</span>
                  <span className="text-sm font-semibold">
                    {metrics.bookingAcceptanceRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Average Session Duration</span>
                  <span className="text-sm font-semibold">
                    {metrics.completedSessions > 0 
                      ? `${(metrics.totalHours / metrics.completedSessions).toFixed(1)} hours`
                      : 'No data'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Recent Inquiries
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowReplyModal(true)}
                >
                  <Reply className="h-4 w-4 mr-1" />
                  Reply All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingInquiries.length > 0 ? (
                <div className="space-y-3">
                  {pendingInquiries.slice(0, 3).map((inquiry) => (
                    <div key={inquiry._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{inquiry.student_id.full_name}</p>
                        <p className="text-xs text-gray-600">{inquiry.subject}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={inquiry.status === 'unread' ? 'destructive' : 'secondary'}>
                          {inquiry.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openReplyModal(inquiry)}
                        >
                          <Reply className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingInquiries.length > 3 && (
                    <Button variant="outline" size="sm" className="w-full">
                      View All ({pendingInquiries.length})
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No pending inquiries</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Sessions
              </div>
              <Button 
                size="sm" 
                onClick={() => setShowCreateSessionModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Session
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{session.student_id.full_name}</p>
                        <p className="text-sm text-gray-600">{session.subject}</p>
                        <p className="text-xs text-gray-500">{formatDate(session.session_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openUpdateSessionModal(session)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Update
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming sessions</p>
                <p className="text-sm text-gray-400 mt-1">Your schedule is clear for now</p>
                <Button 
                  className="mt-4"
                  onClick={() => setShowCreateSessionModal(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Your First Session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        {recentSessions && recentSessions.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Sessions (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <Calendar className="h-3 w-3 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{session.student_id.full_name}</p>
                        <p className="text-xs text-gray-600">{session.subject}</p>
                        <p className="text-xs text-gray-500">{formatDate(session.session_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      {session.rating && (
                        <div className="flex items-center text-xs text-gray-600">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          {session.rating}/5
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Session</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCreateSessionModal(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <Label htmlFor="student_id">Select Student</Label>
                <Select 
                  value={sessionForm.student_id} 
                  onValueChange={(value) => setSessionForm({...sessionForm, student_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                                     <SelectContent>
                     {loadingStudents ? (
                       <SelectItem value="loading" disabled>Loading students...</SelectItem>
                     ) : availableStudents.length > 0 ? (
                       availableStudents.map((student) => (
                         <SelectItem key={student._id} value={student._id}>
                           {student.full_name} - {student.academic_level}
                         </SelectItem>
                       ))
                     ) : (
                       <SelectItem value="no-students" disabled>No students available</SelectItem>
                     )}
                   </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select 
                  value={sessionForm.subject} 
                  onValueChange={(value) => setSessionForm({...sessionForm, subject: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="session_date">Session Date & Time</Label>
                <Input
                  id="session_date"
                  type="datetime-local"
                  value={sessionForm.session_date}
                  onChange={(e) => setSessionForm({...sessionForm, session_date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="duration_hours">Duration (hours)</Label>
                <Select 
                  value={sessionForm.duration_hours.toString()} 
                  onValueChange={(value) => setSessionForm({...sessionForm, duration_hours: parseFloat(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">30 minutes</SelectItem>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="1.5">1.5 hours</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="2.5">2.5 hours</SelectItem>
                    <SelectItem value="3">3 hours</SelectItem>
                    <SelectItem value="3.5">3.5 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="hourly_rate">Hourly Rate (£)</Label>
                <Select 
                  value={sessionForm.hourly_rate.toString()} 
                  onValueChange={(value) => setSessionForm({...sessionForm, hourly_rate: parseFloat(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hourly rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">£15</SelectItem>
                    <SelectItem value="20">£20</SelectItem>
                    <SelectItem value="25">£25</SelectItem>
                    <SelectItem value="30">£30</SelectItem>
                    <SelectItem value="35">£35</SelectItem>
                    <SelectItem value="40">£40</SelectItem>
                    <SelectItem value="45">£45</SelectItem>
                    <SelectItem value="50">£50</SelectItem>
                    <SelectItem value="60">£60</SelectItem>
                    <SelectItem value="75">£75</SelectItem>
                    <SelectItem value="100">£100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm({...sessionForm, notes: e.target.value})}
                  rows={3}
                  placeholder="Add any additional notes about the session..."
                />
              </div>

              {/* Total Earnings Display */}
              {sessionForm.duration_hours && sessionForm.hourly_rate && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium text-gray-600">Total Earnings</Label>
                  <p className="text-lg font-semibold text-green-600">
                    £{(sessionForm.duration_hours * sessionForm.hourly_rate).toFixed(2)}
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowCreateSessionModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                                 <Button 
                   type="submit" 
                   className="flex-1"
                   disabled={!sessionForm.student_id || sessionForm.student_id === 'loading' || sessionForm.student_id === 'no-students'}
                 >
                   Create Session
                 </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Session Modal */}
      {showUpdateSessionModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Update Session</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowUpdateSessionModal(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleUpdateSession} className="space-y-4">
              {/* Student Selection */}
              <div>
                <Label htmlFor="student_id">Student</Label>
                <Select 
                  value={updateSessionForm.student_id} 
                  onValueChange={(value) => setUpdateSessionForm({...updateSessionForm, student_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudents.map((student) => (
                      <SelectItem key={student._id} value={student._id}>
                        {student.full_name} - {student.academic_level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Selection */}
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select 
                  value={updateSessionForm.subject} 
                  onValueChange={(value) => setUpdateSessionForm({...updateSessionForm, subject: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Session Date & Time */}
              <div>
                <Label htmlFor="session_date">Session Date & Time</Label>
                <Input
                  id="session_date"
                  type="datetime-local"
                  value={updateSessionForm.session_date}
                  onChange={(e) => setUpdateSessionForm({...updateSessionForm, session_date: e.target.value})}
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration_hours">Duration (hours)</Label>
                <Select 
                  value={updateSessionForm.duration_hours.toString()} 
                  onValueChange={(value) => setUpdateSessionForm({...updateSessionForm, duration_hours: parseFloat(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">30 minutes</SelectItem>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="1.5">1.5 hours</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="2.5">2.5 hours</SelectItem>
                    <SelectItem value="3">3 hours</SelectItem>
                    <SelectItem value="3.5">3.5 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hourly Rate */}
              <div>
                <Label htmlFor="hourly_rate">Hourly Rate (£)</Label>
                <Select 
                  value={updateSessionForm.hourly_rate.toString()} 
                  onValueChange={(value) => setUpdateSessionForm({...updateSessionForm, hourly_rate: parseFloat(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hourly rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">£15</SelectItem>
                    <SelectItem value="20">£20</SelectItem>
                    <SelectItem value="25">£25</SelectItem>
                    <SelectItem value="30">£30</SelectItem>
                    <SelectItem value="35">£35</SelectItem>
                    <SelectItem value="40">£40</SelectItem>
                    <SelectItem value="45">£45</SelectItem>
                    <SelectItem value="50">£50</SelectItem>
                    <SelectItem value="60">£60</SelectItem>
                    <SelectItem value="75">£75</SelectItem>
                    <SelectItem value="100">£100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={updateSessionForm.status} 
                  onValueChange={(value) => setUpdateSessionForm({...updateSessionForm, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={updateSessionForm.notes}
                  onChange={(e) => setUpdateSessionForm({...updateSessionForm, notes: e.target.value})}
                  rows={3}
                  placeholder="Add any additional notes about the session..."
                />
              </div>
              
              {/* Rating and Feedback (only for completed sessions) */}
              {updateSessionForm.status === 'completed' && (
                <>
                  <div>
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Select 
                      value={updateSessionForm.rating.toString()} 
                      onValueChange={(value) => setUpdateSessionForm({...updateSessionForm, rating: parseFloat(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Poor</SelectItem>
                        <SelectItem value="2">2 - Fair</SelectItem>
                        <SelectItem value="3">3 - Good</SelectItem>
                        <SelectItem value="4">4 - Very Good</SelectItem>
                        <SelectItem value="5">5 - Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="feedback">Feedback</Label>
                    <Textarea
                      id="feedback"
                      value={updateSessionForm.feedback}
                      onChange={(e) => setUpdateSessionForm({...updateSessionForm, feedback: e.target.value})}
                      rows={3}
                      placeholder="Add feedback about the session..."
                    />
                  </div>
                </>
              )}

              {/* Total Earnings Display */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Total Earnings</Label>
                <p className="text-lg font-semibold text-green-600">
                  £{(updateSessionForm.duration_hours * updateSessionForm.hourly_rate).toFixed(2)}
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowUpdateSessionModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Update Session
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reply to Inquiry Modal */}
      {showReplyModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Reply to Inquiry</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowReplyModal(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleReplyToInquiry} className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">From</Label>
                <p className="text-lg font-semibold">{selectedInquiry.student_id.full_name}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Subject</Label>
                <p className="text-lg">{selectedInquiry.subject}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Original Message</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedInquiry.message}</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="reply-message" className="text-sm font-medium text-gray-600">
                  Your Reply
                </Label>
                <Textarea
                  id="reply-message"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  className="mt-1"
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowReplyModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={!replyMessage.trim()}
                  className="flex-1"
                >
                  Send Reply
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default TutorDashboard; 
