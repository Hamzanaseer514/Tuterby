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

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const { user } = useAuth();
  useEffect(() => {
    fetchSessions();
  }, [user, filter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // Only include status parameter if filter is not 'all'
      const url = filter === 'all' 
        ? `http://localhost:5000/api/tutor/sessions/${user._id}`
        : `http://localhost:5000/api/tutor/sessions/${user._id}?status=${filter}`;
      
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
      const response = await fetch(`http://localhost:5000/api/tutor/sessions/${sessionId}`, {
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
          <Button size="sm" variant="outline" onClick={() => {
            setSelectedSession(session);
            setShowSessionModal(true);
          }}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
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
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Session Details</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSessionModal(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Student</Label>
                  {selectedSession.student_ids.map((student, index) => (
  <p key={index} className="text-sm font-semibold">
    {student.user_id.full_name}
  </p>
))}
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Subject</Label>
                  <p className="text-lg">{selectedSession.subject}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date & Time</Label>
                  <p className="text-lg">{formatDate(selectedSession.session_date)}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Duration</Label>
                  <p className="text-lg">{selectedSession.duration_hours} hours</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Earnings</Label>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(selectedSession.total_earnings)}
                  </p>
                </div>
                
                {selectedSession.rating && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Rating</Label>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-lg">{selectedSession.rating}/5</span>
                    </div>
                  </div>
                )}
                
                {selectedSession.feedback && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Feedback</Label>
                    <p className="text-sm text-gray-700">{selectedSession.feedback}</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSessionModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionManagement; 