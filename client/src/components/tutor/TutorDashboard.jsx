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
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Form states
  const [sessionForm, setSessionForm] = useState({
    student_ids: [],
    subject: '',
    academic_level: '',
    session_date: '',
    duration_hours: 1,
    hourly_rate: '',
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
    if (Array.isArray(field)) {
      if (field.length === 1 && typeof field[0] === "string" && field[0].startsWith("[")) {
        try {
          const parsed = JSON.parse(field[0]);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          return [];
        }
      }
      if (field.every(item => typeof item === "string")) {
        return field;
      }
      return [];
    }
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
      const initializeData = async () => {
        await fetchDashboardData();
        await fetchAvailableStudents();
        setSessionForm({
          student_id: '',
          subject: '',
          academic_level: '',
          session_date: '',
          duration_hours: 1,
          hourly_rate: 0,
        });
      };
      initializeData();
    } else {
      setLoading(false);
    }
  }, [user]);
  
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
      fetchDashboardData();
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
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoadingStudents(false);
    }
  }, [user]);

  const formatDate = (dateString) => {
    const [datePart, timePart] = dateString.split('T');
    const time = timePart.slice(0, 5);
    const [year, month, day] = datePart.split('-');
    return `${day}-${month}-${year} ${time}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatHours = (hours) => {
    return `${Math.round(hours)} hours`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <AlertCircle className="h-12 w-12 text-rose-500 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">
            {error === 'Tutor ID is required'
              ? 'Authentication error. Please log in again.'
              : error
            }
          </p>
          {error !== 'Tutor ID is required' && (
            <Button onClick={fetchDashboardData} className="bg-primary hover:bg-primary/90">
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { upcomingSessions, recentSessions, pendingInquiries, metrics, users, students } = dashboardData;

  return (
    <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tutor Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your tutoring business and track your performance</p>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Hours Card */}
          <Card className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hours Taught</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatHours(metrics.totalHours)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Earnings Card */}
          <Card className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                  <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings ($)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(metrics.totalEarnings)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Rating Card */}
          <Card className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                  <Star className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics.averageRating.toFixed(1)}/5
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Sessions Card */}
          <Card className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-violet-100 dark:bg-violet-900/50 rounded-lg">
                  <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Sessions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics.completedSessions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Metrics Card */}
          <Card className="bg-white dark:bg-slate-800 shadow-sm">
            <CardHeader className="border-b border-gray-200 dark:border-slate-700">
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Time</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {metrics.avgResponseTime > 0
                      ? `${Math.round(metrics.avgResponseTime)} minutes`
                      : 'No data'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Booking Acceptance Rate</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {metrics.bookingAcceptanceRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Session Duration</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {metrics.completedSessions > 0
                      ? `${(metrics.totalHours / metrics.completedSessions).toFixed(1)} hours`
                      : 'No data'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Inquiries Card */}
          <Card className="bg-white dark:bg-slate-800 shadow-sm">
            <CardHeader className="border-b border-gray-200 dark:border-slate-700">
              <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-900 dark:text-white">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  Recent Inquiries
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {pendingInquiries.length} New
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {pendingInquiries.length > 0 ? (
                <div className="space-y-3">
                  {pendingInquiries.slice(0, 3).map((inquiry) => (
                    <div key={inquiry._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{inquiry.student_id.user_id.full_name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{inquiry.subject}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={inquiry.status === 'unread' ? 'destructive' : 'secondary'}>
                          {inquiry.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReplyModal(inquiry)}
                          className="border-primary text-primary hover:bg-primary/10"
                        >
                          <Reply className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingInquiries.length > 3 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-primary hover:bg-primary/10"
                      onClick={() => navigate('/tutor/inquiries')}
                    >
                      View All ({pendingInquiries.length})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No pending inquiries</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Sessions */}
        <Card className="bg-white dark:bg-slate-800 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-slate-700">
            <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-900 dark:text-white">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Upcoming Sessions
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-bold">{session.subject}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 font-semibold">Level: {session.academic_level_name || '—'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Duration: {session.duration_hours}h • Rate: {formatCurrency(session.hourly_rate)} • Total: {formatCurrency((session.duration_hours || 0) * (session.hourly_rate || 0))}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{formatDate(session.session_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewSession(session)}
                        className="border-primary text-primary hover:bg-primary/10"
                      >
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
                <p className="text-gray-500 dark:text-gray-400">No upcoming sessions</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Your schedule is clear for now</p>
                <Button
                  className="mt-4 bg-primary hover:bg-primary/90"
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
          <Card className="mt-6 bg-white dark:bg-slate-800 shadow-sm">
            <CardHeader className="border-b border-gray-200 dark:border-slate-700">
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Recent Sessions (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session._id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                        <Calendar className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-bold">{session.subject}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 font-semibold">Level: {session.academic_level_name || '—'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Duration: {session.duration_hours}h • Rate: {formatCurrency(session.hourly_rate)} • Total: {formatCurrency((session.duration_hours || 0) * (session.hourly_rate || 0))}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{formatDate(session.session_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      {session.rating && (
                        <div className="flex items-center text-xs font-medium text-gray-900 dark:text-white">
                          <Star className="h-3 w-3 text-amber-500 fill-current mr-1" />
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
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reply to Inquiry</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleReplyToInquiry} className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">From</Label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedInquiry.student_id.user_id.full_name}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Subject</Label>
                <p className="text-lg text-gray-900 dark:text-white">{selectedInquiry.subject}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Original Message</Label>
                <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedInquiry.message}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="reply-message" className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Your Reply
                </Label>
                <Textarea
                  id="reply-message"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  className="mt-1 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                  rows={4}
                  required
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReplyModal(false)}
                  className="flex-1 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!replyMessage.trim()}
                  className="flex-1 bg-primary hover:bg-primary/90"
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
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Session Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewSession(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Session Header */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                      {viewSession.subject}
                    </h4>
                    <p className="text-blue-700 dark:text-blue-400">
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
                <h5 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">Student Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewSession.student_ids && viewSession.student_ids.map((student, index) => (
                    <div key={index} className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {student.user_id?.full_name || 'Student Name'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {student.user_id?.email || 'Email not available'}
                      </p>
                    </div>
                  ))}
                  <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Academic Level</Label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {viewSession.academic_level_name || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div>
                <h5 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">Session Details</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</Label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {viewSession.duration_hours} hour{viewSession.duration_hours !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Hourly Rate</Label>
                    <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(viewSession.hourly_rate)}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</Label>
                    <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(viewSession.duration_hours * viewSession.hourly_rate)}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Session Date</Label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatDate(viewSession.session_date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {viewSession.notes && (
                <div>
                  <h5 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">Notes</h5>
                  <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">{viewSession.notes}</p>
                  </div>
                </div>
              )}

              {/* Rating and Feedback */}
              {viewSession.rating && (
                <div>
                  <h5 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">Student Feedback</h5>
                  <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-amber-500 fill-current" />
                      <span className="font-medium text-gray-900 dark:text-white">{viewSession.rating}/5</span>
                    </div>
                    {viewSession.feedback && (
                      <p className="text-gray-700 dark:text-gray-300">{viewSession.feedback}</p>
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