import React, { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Star, 
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Eye,
  Edit
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { BASE_URL } from '@/config';
import { Textarea } from '../ui/textarea';

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showUpdateSessionModal, setShowUpdateSessionModal] = useState(false);
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
  const { user } = useAuth();

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

  useEffect(() => {
    fetchSessions();
  }, [user, filter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // Only include status parameter if filter is not 'all'
      const url = filter === 'all' 
        ? `${BASE_URL}/api/tutor/sessions/${user._id}`
        : `${BASE_URL}/api/tutor/sessions/${user._id}?status=${filter}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await response.json();
      setSessions(data.sessions);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatus = async (sessionId, newStatus) => {
    try {
      const response = await fetch(`${BASE_URL}/api/tutor/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update session');
      }

      // Refresh sessions after update
      fetchSessions();
    } catch (err) {
      console.error('Error updating session:', err);
    }
  };

  const openUpdateSessionModal = (session) => {
    setSelectedSession(session);
    
    // Extract student data from session
    const sessionStudent = session.student_ids[0]; // Assuming single student for now
    const studentId = sessionStudent?._id;
    const studentName = sessionStudent?.user_id?.full_name;
    
    setUpdateSessionForm({
      student_id: [studentId],
      full_name: [studentName],
      subject: session.subject,
      session_date: new Date(session.session_date).toISOString().slice(0, 16),
      duration_hours: session.duration_hours,
      hourly_rate: session.hourly_rate || 25,
      status: session.status,
      rating: session.rating || '',
      feedback: session.feedback || '',
      notes: session.notes || ''
    });

    setShowUpdateSessionModal(true);
  };

  const handleUpdateSession = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/api/tutor/sessions/${selectedSession._id}`, {
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
      fetchSessions(); // Refresh sessions after update
    } catch (err) {
      console.error('Error updating session:', err);
    }
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActionButton = (session) => {
    switch (session.status) {
      case 'pending':
        return (
          <Button 
            size="sm" 
            onClick={() => updateSessionStatus(session._id, 'confirmed')}
            className="bg-green-600 hover:bg-green-700"
          >
            Confirm
          </Button>
        );
      case 'confirmed':
        return (
          <Button 
            size="sm" 
            onClick={() => updateSessionStatus(session._id, 'in_progress')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Start Session
          </Button>
        );
      case 'in_progress':
        return (
          <Button 
            size="sm" 
            onClick={() => updateSessionStatus(session._id, 'completed')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Complete
          </Button>
        );
      default:
        return (
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => {
              setSelectedSession(session);
              setShowSessionModal(true);
            }}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {session.status !== 'completed' && (
              <Button size="sm" variant="outline" onClick={() => {
                openUpdateSessionModal(session);
              }}>
                <Edit className="h-4 w-4 mr-1" />
                Update
              </Button>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Management</h1>
          <p className="text-gray-600">Manage your tutoring sessions and track progress</p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <Label htmlFor="status-filter">Filter by Status:</Label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sessions List */}
        <div className="grid gap-6">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <Card key={session._id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                      {session.student_ids.map((student, index) => (
  <p key={index} className="text-sm font-semibold">
    {student.user_id.full_name}
  </p>
))}
                        <p className="text-gray-600">{session.subject}</p>
                        <p className="text-sm text-gray-500">{formatDate(session.session_date)}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-600">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {session.duration_hours} hours
                          </span>
                          <span className="text-sm text-gray-600">
                            <DollarSign className="h-3 w-3 inline mr-1" />
                            {formatCurrency(session.total_earnings)}
                          </span>
                          {session.rating && (
                            <span className="text-sm text-gray-600">
                              <Star className="h-3 w-3 inline mr-1" />
                              {session.rating}/5
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(session.status)}>
                        {getStatusIcon(session.status)}
                        <span className="ml-1">{session.status}</span>
                      </Badge>
                      {getActionButton(session)}
                      <div className="flex space-x-2 ml-2">
                      {session.status !== 'completed' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setSelectedSession(session);
                            setShowSessionModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      )}
                        {session.status !== 'completed' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              openUpdateSessionModal(session);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Update
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions found</h3>
                <p className="text-gray-600">You don't have any sessions matching the current filter.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Session Detail Modal */}
        {showSessionModal && selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Session Details</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSessionModal(false)}
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
                        {selectedSession.subject}
                      </h4>
                      <p className="text-blue-700">
                        {formatDate(selectedSession.session_date)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(selectedSession.status)}>
                      {getStatusIcon(selectedSession.status)}
                      <span className="ml-1">{selectedSession.status}</span>
                    </Badge>
                  </div>
                </div>

                {/* Student Information */}
                <div>
                  <h5 className="text-md font-semibold mb-3 text-gray-800">Student Information</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSession.student_ids && selectedSession.student_ids.map((student, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium text-gray-900">
                          {student.user_id?.full_name || 'Student Name'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {student.user_id?.email || 'Email not available'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session Details */}
                <div>
                  <h5 className="text-md font-semibold mb-3 text-gray-800">Session Details</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Label className="text-sm font-medium text-gray-600">Duration</Label>
                      <p className="text-lg font-semibold">
                        {selectedSession.duration_hours} hour{selectedSession.duration_hours !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Label className="text-sm font-medium text-gray-600">Total Earnings</Label>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(selectedSession.total_earnings)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Label className="text-sm font-medium text-gray-600">Session Date</Label>
                      <p className="text-lg font-semibold">
                        {formatDate(selectedSession.session_date)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <p className="text-lg font-semibold">
                        <Badge className={getStatusColor(selectedSession.status)}>
                          {selectedSession.status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedSession.notes && (
                  <div>
                    <h5 className="text-md font-semibold mb-3 text-gray-800">Notes</h5>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700">{selectedSession.notes}</p>
                    </div>
                  </div>
                )}

                {/* Rating and Feedback */}
                {selectedSession.rating && (
                  <div>
                    <h5 className="text-md font-semibold mb-3 text-gray-800">Student Feedback</h5>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        <span className="font-medium">{selectedSession.rating}/5</span>
                      </div>
                      {selectedSession.feedback && (
                        <p className="text-gray-700">{selectedSession.feedback}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSessionModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  {/* {selectedSession.status !== 'completed' && (
                    <Button 
                      onClick={() => {
                        setShowSessionModal(false);
                        openUpdateSessionModal(selectedSession);
                      }}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Session
                    </Button>
                  )} */}
                </div>
              </div>
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
                  <Label htmlFor="full_name">Student</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold">
                      {updateSessionForm.full_name[0] || 'Student Name'}
                    </p>
                  </div>
                </div>

                {/* Subject Selection */}
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={updateSessionForm.subject}
                    onValueChange={(value) => setUpdateSessionForm({ ...updateSessionForm, subject: value })}
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
                    onChange={(e) => setUpdateSessionForm({ ...updateSessionForm, session_date: e.target.value })}
                    required
                  />
                </div>

                {/* Duration */}
                <div>
                  <Label htmlFor="duration_hours">Duration (hours)</Label>
                  <Select
                    value={updateSessionForm.duration_hours.toString()}
                    onValueChange={(value) => setUpdateSessionForm({ ...updateSessionForm, duration_hours: parseFloat(value) })}
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
                    onValueChange={(value) => setUpdateSessionForm({ ...updateSessionForm, hourly_rate: parseFloat(value) })}
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
                    onValueChange={(value) => setUpdateSessionForm({ ...updateSessionForm, status: value })}
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
                    onChange={(e) => setUpdateSessionForm({ ...updateSessionForm, notes: e.target.value })}
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
                        onValueChange={(value) => setUpdateSessionForm({ ...updateSessionForm, rating: parseFloat(value) })}
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
                        onChange={(e) => setUpdateSessionForm({ ...updateSessionForm, feedback: e.target.value })}
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
      </div>
    </div>
  );
};

export default SessionManagement; 