import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '@/config';
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
  XCircle,
  User
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const TutorDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getAuthToken, user } = useAuth();
  const token = getAuthToken();
  const [parsed_subjects, setParsedSubjects] = useState([]);


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
    student_ids: [], // was student_id
    subject: '',
    academic_level: '',
    session_date: '',
    duration_hours: 1,
    hourly_rate: '',
    notes: ''
  });
  const [selectedStudentSubjects, setSelectedStudentSubjects] = useState([]);
  const [selectedStudentAcademicLevels, setSelectedStudentAcademicLevels] = useState([]);
  const [academic_levels, setAcademicLevels] = useState([
    'Primary', 'Secondary', 'GCSE', 'A-Level', 'University', 'Adult Learner'
  ]);

  const [updateSessionForm, setUpdateSessionForm] = useState({
    student_id: [],
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
  const [viewSession, setViewSession] = useState(null);

  const handleViewSession = (session) => {
    setViewSession(session);
  }

  const parseField = (field) => {
    
    if (!field) return [];

    // Handle array case like ['["Math","Physics"]']
    if (Array.isArray(field)) {
      if (field.length === 1 && typeof field[0] === "string" && field[0].startsWith("[")) {
        try {
          const parsed = JSON.parse(field[0]);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          return [];
        }
      }
      // If it's already a proper array, return as is
      if (field.every(item => typeof item === "string")) {
        return field;
      }
      return [];
    }

    // Handle string case like "["Math","Physics"]"
    if (typeof field === "string" && field.startsWith("[")) {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.warn(`Failed to parse string field: ${field}`, error);
        return [];
      }
    }
    return [];
  };
  useEffect(() => {
    if (user && user._id) {
      // First fetch dashboard data, then fetch available students
      const initializeData = async () => {
        await fetchDashboardData();
        await fetchAvailableStudents();
        setSessionForm({
          student_id: '',
          subject: '',
          academic_level: '',
          session_date: '',
          duration_hours: 1,
          hourly_rate: 0, // Will be updated when students are loaded
        });
      };
      initializeData();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  // Update session form when available students are loaded
  useEffect(() => {
    if (availableStudents.length > 0 && !sessionForm.student_id) {
      setSessionForm(prev => ({
        ...prev,
        hourly_rate: availableStudents[0]?.hourly_rate || 0
      }));
    }
  }, [availableStudents]);


  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setError('Tutor ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/api/tutor/dashboard/${user?._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch dashboard data');
      }
      const data = await response.json();
      setDashboardData(data);
      const parsed = parseField(data.tutor.subjects);
      setParsedSubjects(parsed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, token]);



  const handleReplyToInquiry = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/api/tutor/inquiries/${selectedInquiry._id}/reply`, {
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



  const openReplyModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowReplyModal(true);
  };

  const fetchAvailableStudents = useCallback(async () => {
    if (!user?._id) {
      return;
    }
    
    try {
      setLoadingStudents(true);
      const response = await fetch(`${BASE_URL}/api/tutor/students/${user._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      setAvailableStudents(data.students || []);
      if (data.academic_levels && Array.isArray(data.academic_levels)) {
        setAcademicLevels(data.academic_levels);
      } else {
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoadingStudents(false);
    }
  }, [user]);

  const formatDate = (dateString) => {
    const [datePart, timePart] = dateString.split('T');
    const time = timePart.slice(0, 5); // HH:MM
    const [year, month, day] = datePart.split('-');
    return `${day}-${month}-${year} ${time}`;
  };

  // "2025-08-15T09:29:00.000+00:00" → "15-08-2025 09:29"

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
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
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

  const { upcomingSessions, recentSessions, pendingInquiries, metrics, users, students } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutor Dashboard</h1>
          <p className="text-gray-600">Manage your tutoring business and track your performance</p>
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingInquiries.length > 0 ? (
                <div className="space-y-3">
                  {pendingInquiries.slice(0, 3).map((inquiry) => (
                    <div key={inquiry._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{inquiry.student_id.user_id.full_name}</p>
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  console.log('Session:', session),
                  <div key={session._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{(session.student_ids || []).map((student, index) => (
                          <p key={index} className="text-sm font-semibold">
                            {student.user_id.full_name}
                          </p>
                        ))}</p>
                        <p className="text-sm text-gray-600">{session.subject}</p>
                        <p className="text-xs text-gray-600">Level: {session.academic_level_name || '—'}</p>
                        <p className="text-xs text-gray-600">
                          Duration: {session.duration_hours}h • Rate: {formatCurrency(session.hourly_rate)} • Total: {formatCurrency((session.duration_hours || 0) * (session.hourly_rate || 0))}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(session.session_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => handleViewSession(session)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No upcoming sessions</p>
                <p className="text-sm text-gray-400 mt-1">Your schedule is clear for now</p>
                <Button
                  className="mt-4"
                  onClick={() => navigate('/tutor/sessions', { state: { action: 'create' } })}
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
                        <p className="font-medium">
                          {(session.student_ids || []).map((student, index) => (
                            <p key={index} className="text-sm font-semibold">
                              {student.user_id.full_name}
                            </p>
                          ))}
                        </p>

                        <p className="text-xs text-gray-600">{session.subject}</p>
                        <p className="text-xs text-gray-600">Level: {session.academic_level_name || '—'}</p>
                        <p className="text-xs text-gray-600">
                          Duration: {session.duration_hours}h • Rate: {formatCurrency(session.hourly_rate)} • Total: {formatCurrency((session.duration_hours || 0) * (session.hourly_rate || 0))}
                        </p>
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
                <p className="text-lg font-semibold">{selectedInquiry.student_id.user_id.full_name}</p>
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

      {/* View Session Modal */}
      {viewSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Session Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewSession(null)}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Session Header */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-blue-900">
                      {viewSession.subject}
                    </h4>
                    <p className="text-blue-700">
                      {formatDate(viewSession.session_date)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(viewSession.status)}>
                    {viewSession.status}
                  </Badge>
                </div>
              </div>

              {/* Student Information */}
              <div>
                <h5 className="text-md font-semibold mb-3 text-gray-800">Student Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewSession.student_ids && viewSession.student_ids.map((student, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-gray-900">
                        {student.user_id?.full_name || 'Student Name'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {student.user_id?.email || 'Email not available'}
                      </p>
                    </div>
                  ))}
                            <div className="bg-gray-50 p-3 rounded-lg">
                    <Label className="text-sm font-medium text-gray-600">Academic Level</Label>
                    <p className="text-lg font-semibold">
                      {viewSession.academic_level_name || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div>
                <h5 className="text-md font-semibold mb-3 text-gray-800">Session Details</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Label className="text-sm font-medium text-gray-600">Duration</Label>
                    <p className="text-lg font-semibold">
                      {viewSession.duration_hours} hour{viewSession.duration_hours !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Label className="text-sm font-medium text-gray-600">Hourly Rate</Label>
                    <p className="text-lg font-semibold text-green-600">
                      £{viewSession.hourly_rate}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Label className="text-sm font-medium text-gray-600">Total Earnings</Label>
                    <p className="text-lg font-semibold text-green-600">
                      £{(viewSession.duration_hours * viewSession.hourly_rate).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Label className="text-sm font-medium text-gray-600">Session Date</Label>
                    <p className="text-lg font-semibold">
                      {formatDate(viewSession.session_date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {viewSession.notes && (
                <div>
                  <h5 className="text-md font-semibold mb-3 text-gray-800">Notes</h5>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700">{viewSession.notes}</p>
                  </div>
                </div>
              )}

              {/* Rating and Feedback */}
              {viewSession.rating && (
                <div>
                  <h5 className="text-md font-semibold mb-3 text-gray-800">Student Feedback</h5>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="font-medium">{viewSession.rating}/5</span>
                    </div>
                    {viewSession.feedback && (
                      <p className="text-gray-700">{viewSession.feedback}</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
};

export default TutorDashboard; 
