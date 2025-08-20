import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { BASE_URL } from '@/config';
import { Textarea } from '../ui/textarea';
import { useSubject } from '../../hooks/useSubject';

const SendLinkButton = ({ session, onSend }) => {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState(session.meeting_link || '');
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Send meeting link</Button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Send meeting link</h3>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm text-gray-700 mb-1">Link</Label>
                <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
              </div>
              <p className="text-sm text-gray-600">This will be emailed to all students who have confirmed.</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={async () => { await onSend(session, link); setOpen(false); }}>Send</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showUpdateSessionModal, setShowUpdateSessionModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const { academicLevels, subjects } = useSubject();
  const [tutorAcademicLevels, setTutorAcademicLevels] = useState([]);
  const [updateSessionForm, setUpdateSessionForm] = useState({
    student_id: [],
    subject: '',
    academic_level: '',
    session_date: '',
    duration_hours: 1,
    hourly_rate: '',
    status: '',
    rating: '',
    feedback: '',
    notes: ''
  });
  const [sessionForm, setSessionForm] = useState({
    student_ids: [],
    subject: '',
    academic_level: '',
    session_date: '',
    duration_hours: 1,
    hourly_rate: 0,
    notes: ''
  });
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [parsed_subjects, setParsedSubjects] = useState([]);
  const [selectedStudentSubjects, setSelectedStudentSubjects] = useState([]);
  const [selectedStudentAcademicLevels, setSelectedStudentAcademicLevels] = useState([]);
  const { user, getAuthToken } = useAuth();
  const authToken = getAuthToken();
  const location = useLocation();
  const navigate = useNavigate();


  useEffect(() => {
    fetchSessions();
  }, [user, filter]);

  useEffect(() => {
    if (user && user._id) {
      fetchAvailableStudents();
      fetchTutorSubjects();
    }
  }, [user]);

  // Open modals based on navigation state (from Dashboard)
  useEffect(() => {
    if (!location?.state) return;
    const { action, session } = location.state || {};
    if (action === 'create') {
      navigate('/tutor-dashboard/create-session');
    } else if (action === 'update' && session) {
      // Ensure students are loaded before opening to populate fields
      if (availableStudents.length === 0) return;
      openUpdateSessionModal(session);
    }
  }, [location?.state, availableStudents, navigate]);

  useEffect(() => {
    if (availableStudents.length > 0 && (!sessionForm.student_ids || sessionForm.student_ids.length === 0)) {
      // keep rate 0 until level is chosen
      setSessionForm(prev => ({
        ...prev,
        hourly_rate: 0
      }));
    }
  }, [availableStudents]);

  const getLevelById = useCallback((id) => {
    if (!id) return undefined;
    return (academicLevels || []).find(l => l?._id === id || l?._id?.toString() === id);
  }, [academicLevels]);
  const resolveLevelName = useCallback((levelValue) => {
    if (!levelValue) return '—';
    if (typeof levelValue === 'object' && levelValue.level) return levelValue.level;
    if (typeof levelValue === 'string') {
      const found = getLevelById(levelValue);
      return found?.level || '—';
    }
    return '—';
  }, [getLevelById]);

  // Derive hourly rate strictly from the selected academic level
  useEffect(() => {
    if (!sessionForm.academic_level) {
      setSessionForm(prev => ({ ...prev, hourly_rate: 0 }));
      return;
    }
    const level = getLevelById(sessionForm.academic_level);
    const rate = typeof level?.hourlyRate === 'number' ? level.hourlyRate : 0;
    setSessionForm(prev => ({ ...prev, hourly_rate: rate }));
  }, [sessionForm.academic_level, getLevelById]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // Only include status parameter if filter is not 'all'
      const url = filter === 'all'
        ? `${BASE_URL}/api/tutor/sessions/${user._id}`
        : `${BASE_URL}/api/tutor/sessions/${user._id}?status=${filter}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
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
  const getSubjectById = useCallback((id) => {
    if (!id) return undefined;
    const s = (subjects || []).find(s => s?._id?.toString() === id.toString());
    return s;
}, [subjects]);
  const parseField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) {
      if (field.length === 1 && typeof field[0] === 'string' && field[0].startsWith('[')) {
        try {
          const parsed = JSON.parse(field[0]);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
      if (field.every(item => typeof item === 'string')) {
        return field;
      }
      return [];
    }
    if (typeof field === 'string' && field.startsWith('[')) {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const fetchTutorSubjects = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/tutor/dashboard/${user?._id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      const parsed = parseField(data?.tutor?.subjects);
      setParsedSubjects(parsed);
      if (Array.isArray(data?.tutor?.academic_levels_taught)) {
        setTutorAcademicLevels(data.tutor.academic_levels_taught);
      }
    } catch (e) {
      // ignore
    }
  }, [user, authToken]);

  const fetchAvailableStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);
      const response = await fetch(`${BASE_URL}/api/tutor/students/${user._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      setAvailableStudents(data.students || []);
      // if (data.academic_levels && Array.isArray(data.academic_levels)) {
      //   setAcademicLevels(data.academic_levels);
      // }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoadingStudents(false);
    }
  }, [user]);



  const openUpdateSessionModal = (session) => {
    setSelectedSession(session);

    // Extract student data from session
    const sessionStudent = session.student_ids[0]; // Assuming single student for now
    const studentId = sessionStudent?._id;
    const studentName = sessionStudent?.user_id?.full_name;

    // Find the student in availableStudents to get their subjects and academic levels
    const availableStudent = availableStudents.find(s => s._id === studentId);
    if (availableStudent) {
      if (Array.isArray(availableStudent.preferred_subjects)) {
        setSelectedStudentSubjects(availableStudent.preferred_subjects);
      } else if (typeof availableStudent.preferred_subjects === 'string') {
        setSelectedStudentSubjects([availableStudent.preferred_subjects]);
      } else {
        setSelectedStudentSubjects([]);
      }
      const levelIds = Array.isArray(availableStudent.academic_level)
        ? availableStudent.academic_level
        : (availableStudent.academic_level ? [availableStudent.academic_level] : []);
      const levelObjects = levelIds.map(id => getLevelById(id)).filter(Boolean);
      setSelectedStudentAcademicLevels(levelObjects);
    }
    else {
      // Fallback to session data
      if (sessionStudent?.preferred_subjects) {
        if (Array.isArray(sessionStudent.preferred_subjects)) {
          setSelectedStudentSubjects(sessionStudent.preferred_subjects);
        } else if (typeof sessionStudent.preferred_subjects === 'string') {
          setSelectedStudentSubjects([sessionStudent.preferred_subjects]);
        } else {
          setSelectedStudentSubjects([]);
        }
      } else {
        setSelectedStudentSubjects([]);
      }
      if (sessionStudent?.academic_level) {
        const levelIds = Array.isArray(sessionStudent.academic_level)
          ? sessionStudent.academic_level
          : (typeof sessionStudent.academic_level === 'string' ? [sessionStudent.academic_level] : []);
        const levelObjects = levelIds.map(id => getLevelById(id)).filter(Boolean);
        setSelectedStudentAcademicLevels(levelObjects);
      } else {
        setSelectedStudentAcademicLevels([]);
      }
    }

    setUpdateSessionForm({
      student_id: [studentId],
      full_name: [studentName],
      subject: session.subject,
      academic_level: session.academic_level || '',
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
      const response = await fetch(`${BASE_URL}/api/tutor/sessions/update/${selectedSession._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updateSessionForm,
          total_earnings: updateSessionForm.duration_hours * updateSessionForm.hourly_rate
        }),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update session');
      }
      toast.success('Session updated successfully');
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
      toast.error(err.message || 'Failed to update session');
    }
  };

  const approveReschedule = async (session) => {
    try {
      const response = await fetch(`${BASE_URL}/api/tutor/sessions/update/${session._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approve_proposed: true
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve');
      }
      toast.success('Session approved and confirmed');
      fetchSessions();
    } catch (e) {
      toast.error(e.message || 'Failed to approve');
    } finally {
      setShowApproveModal(false);
    }
  };

  const rejectReschedule = async (session) => {
    try {
      const response = await fetch(`${BASE_URL}/api/tutor/sessions/update/${session._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reject_proposed: true })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject');
      }
      toast.success('Proposed time rejected');
      fetchSessions();
    } catch (e) {
      toast.error(e.message || 'Failed to reject');
    } finally {
      setShowRejectModal(false);
    }
  };

  const deleteSession = async (sessionId) => {


    try {
      const response = await fetch(`${BASE_URL}/api/tutor/sessions/delete/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to delete session');
      }
      toast.success('Session deleted successfully');
      // Refresh sessions after deletion
      fetchSessions();
    } catch (err) {
      toast.error(err.message || 'Failed to delete session. Please try again.');
    }
  };

  const sendMeetingLink = async (session, meetingLink) => {
    try {
      const response = await fetch(`${BASE_URL}/api/tutor/sessions/${session._id}/send-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ meeting_link: meetingLink })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send meeting link');
      }
      toast.success('Meeting link sent to confirmed students');
      fetchSessions();
    } catch (e) {
      toast.error(e.message || 'Failed to send meeting link');
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
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Manage your tutoring sessions and track progress</p>
            <Button
              size="sm"
              onClick={() => navigate('/tutor-dashboard/create-session')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Session
            </Button>
          </div>
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
                        {/* {session.student_ids.map((student, index) => (
                          <p key={index} className="text-sm font-semibold">
                            {student.user_id.full_name}
                          </p>
                        ))} */}
                        <p className="text-gray-600 font-bold">{getSubjectById(session.subject)?.name || session.subject}</p>
                        <p className="text-xs text-gray-600 font-semibold mt-1">Level: {session.academic_level_name || resolveLevelName(session.academic_level)}</p>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(session.session_date)}</p>
                        {session.student_proposed_date && (
                          <p className="text-xs text-yellow-700 font-semibold mt-1">
                            Student proposed: {formatDate(new Date(session.student_proposed_date).toISOString())}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-1">
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
                        {Array.isArray(session.student_responses) && session.student_responses.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm font-semibold text-gray-800 mb-1">Student responses</div>
                            <div className="flex flex-wrap gap-2">
                              {session.student_responses.map((r, idx) => {
                                const name = r.student_id?.user_id?.full_name || 'Student';
                                const color = r.status === 'confirmed' ? 'bg-green-100 text-green-700' : r.status === 'declined' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';
                                const ratingEntry = Array.isArray(session.student_ratings) ? session.student_ratings.find(sr => {
                                  const sid = sr?.student_id?._id || sr?.student_id;
                                  const rsid = r?.student_id?._id || r?.student_id;
                                  return sid && rsid && sid.toString() === rsid.toString();
                                }) : null;
                                return (
                                  <Badge key={idx} className={color}>
                                    {name}: {r.status}{ratingEntry ? ` • ${ratingEntry.rating}/5` : ''}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(session.status)}>
                        {getStatusIcon(session.status)}
                        <span className="ml-1">{session.status}</span>
                      </Badge>
                      {/* {getActionButton(session)} */}
                      <div className="flex space-x-2 ml-2">
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
                        {session.student_proposed_date && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSession(session);
                              setShowApproveModal(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        {session.student_proposed_date && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSession(session);
                              setShowRejectModal(true);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteSession(session._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        {Array.isArray(session.student_responses) && session.student_responses.some(r => r.status === 'confirmed') && (
                          <SendLinkButton session={session} onSend={sendMeetingLink} />
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
                        {selectedSession.academic_level_name || resolveLevelName(selectedSession.academic_level)} -   {getSubjectById(selectedSession.subject)?.name || selectedSession.subject}
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
                    {selectedSession.student_ids && selectedSession.student_ids.map((student, index) => {
                      const resp = Array.isArray(selectedSession.student_responses)
                        ? selectedSession.student_responses.find(r => {
                            const sid = r?.student_id?._id || r?.student_id;
                            return sid && sid.toString() === (student?._id?.toString?.() || student?._id);
                          })
                        : null;
                      const status = resp?.status || 'pending';
                      const badgeClass = status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : status === 'declined'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700';
                      return (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium text-gray-900">
                          {student.user_id?.full_name || 'Student Name'}
                        </p>
                        
                          <div className="mt-2">
                            <Badge className={badgeClass}>Response: {status}</Badge>
                      </div>
                        </div>
                      );
                    })}
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
                    {selectedSession.student_proposed_date && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <Label className="text-sm font-medium text-yellow-700">Student Proposed Date</Label>
                        <p className="text-lg font-semibold text-yellow-800">
                          {formatDate(new Date(selectedSession.student_proposed_date).toISOString())}
                        </p>
                        <div className="text-xs text-yellow-700 mt-1">
                          {selectedSession.student_proposed_status === 'pending' && 'Awaiting your decision'}
                          {selectedSession.student_proposed_status === 'accepted' && `Accepted${selectedSession.student_proposed_decided_at ? ` on ${formatDate(selectedSession.student_proposed_decided_at)}` : ''}`}
                          {selectedSession.student_proposed_status === 'rejected' && `Rejected${selectedSession.student_proposed_decided_at ? ` on ${formatDate(selectedSession.student_proposed_decided_at)}` : ''}`}
                        </div>
                      </div>
                    )}
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


                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowSessionModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  {selectedSession.status !== 'completed' && (
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
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSessionModal(false);
                      deleteSession(selectedSession._id);
                    }}
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Session
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Session Modal */}
        {showUpdateSessionModal && selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Update Session</h3>
                  <p className="text-sm text-gray-600 mt-1">Modify session details and manage student responses</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUpdateSessionModal(false)}
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleUpdateSession} className="space-y-6">
                {/* Session Overview Card */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-900 mb-3">Session Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                      <Label className="text-sm font-medium text-blue-700">Subject</Label>
                      <p className="text-lg font-semibold text-blue-900">
                        {getSubjectById(selectedSession.subject)?.name || selectedSession.subject}
                    </p>
                  </div>
                    <div>
                      <Label className="text-sm font-medium text-blue-700">Academic Level</Label>
                      <p className="text-lg font-semibold text-blue-900">
                        {resolveLevelName(selectedSession.academic_level)}
                      </p>
                </div>
                <div>
                      <Label className="text-sm font-medium text-blue-700">Current Status</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(selectedSession.status)}>
                          {getStatusIcon(selectedSession.status)}
                          <span className="ml-1">{selectedSession.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student Information Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSession.student_ids && selectedSession.student_ids.map((student, index) => {
                      const studentResponse = Array.isArray(selectedSession.student_responses)
                        ? selectedSession.student_responses.find(r => {
                            const sid = r?.student_id?._id || r?.student_id;
                            return sid && sid.toString() === (student?._id?.toString?.() || student?._id);
                          })
                        : null;
                      const studentRating = Array.isArray(selectedSession.student_ratings)
                        ? selectedSession.student_ratings.find(r => {
                            const sid = r?.student_id?._id || r?.student_id;
                            return sid && sid.toString() === (student?._id?.toString?.() || student?._id);
                          })
                        : null;
                      
                      return (
                        <div key={index} className="bg-white p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-semibold text-gray-900">
                              {student.user_id?.full_name || 'Student Name'}
                            </h5>
                            <Badge className={
                              studentResponse?.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              studentResponse?.status === 'declined' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }>
                              {studentResponse?.status || 'pending'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            {studentResponse?.note && (
                              <p className="text-gray-600">
                                <span className="font-medium">Note:</span> {studentResponse.note}
                              </p>
                            )}
                            {studentResponse?.responded_at && (
                              <p className="text-gray-500 text-xs">
                                Responded: {new Date(studentResponse.responded_at).toLocaleString()}
                              </p>
                            )}
                            {studentRating && (
                              <div className="flex items-center gap-2 mt-2">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="font-medium">{studentRating.rating}/5</span>
                                {studentRating.feedback && (
                                  <span className="text-gray-600">• {studentRating.feedback}</span>
                                )}
                  </div>
                            )}
                </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Meeting Link Section */}
                {selectedSession.meeting_link && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="text-lg font-semibold text-green-900 mb-3">Meeting Link</h4>
                    <div className="space-y-3">
                <div>
                        <Label className="text-sm font-medium text-green-700">Current Link</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={selectedSession.meeting_link}
                            readOnly
                            className="bg-white"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => navigator.clipboard.writeText(selectedSession.meeting_link)}
                          >
                            Copy
                          </Button>
                </div>
                      </div>
                      {selectedSession.meeting_link_sent_at && (
                        <p className="text-sm text-green-700">
                          Sent to confirmed students on: {new Date(selectedSession.meeting_link_sent_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Session Details Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                {/* Session Date & Time */}
                <div>
                        <Label htmlFor="session_date" className="text-sm font-medium text-gray-700">
                          Session Date & Time
                        </Label>
                  <Input
                    id="session_date"
                    type="datetime-local"
                    value={updateSessionForm.session_date}
                    onChange={(e) => setUpdateSessionForm({ ...updateSessionForm, session_date: e.target.value })}
                    required
                          className="mt-1"
                  />
                </div>

                {/* Duration */}
                <div>
                        <Label className="text-sm font-medium text-gray-700">Duration</Label>
                        <div className="p-3 bg-white rounded-lg border mt-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedSession.duration_hours} hour{selectedSession.duration_hours !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Hourly Rate */}
                <div>
                        <Label className="text-sm font-medium text-gray-700">Hourly Rate</Label>
                        <div className="p-3 bg-white rounded-lg border mt-1">
                          <p className="text-sm font-semibold text-gray-900">
                            £{selectedSession.hourly_rate}/hour
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Total Earnings */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Total Earnings</Label>
                        <div className="p-3 bg-green-50 rounded-lg border mt-1">
                          <p className="text-lg font-semibold text-green-700">
                            £{selectedSession.total_earnings}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div>
                        <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                  <Select
                    value={updateSessionForm.status}
                    onValueChange={(value) => setUpdateSessionForm({ ...updateSessionForm, status: value })}
                  >
                          <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
  {updateSessionForm.status === "confirmed" && (
    <SelectItem value="confirmed" disabled>
      Confirmed
    </SelectItem>
  )}
                    </SelectContent>

                  </Select>
                </div>

                      {/* Subject */}
                <div>
                        <Label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</Label>
                        <Select
                          value={updateSessionForm.subject}
                          onValueChange={(value) => setUpdateSessionForm({ ...updateSessionForm, subject: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {(() => {
                              const allSubjects = new Set();
                              if (updateSessionForm.subject) allSubjects.add(updateSessionForm.subject);
                              if (selectedStudentSubjects.length > 0) {
                                selectedStudentSubjects.forEach(s => allSubjects.add(s));
                              }
                              if (parsed_subjects && parsed_subjects.length > 0) {
                                parsed_subjects.forEach(s => allSubjects.add(s));
                              }
                              return Array.from(allSubjects).sort().map(subject => (
                                <SelectItem key={`update-subject-${subject}`} value={subject}>
                                  {getSubjectById(subject)?.name || subject}
                                </SelectItem>
                              ));
                            })()}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</Label>
                  <Textarea
                    id="notes"
                    value={updateSessionForm.notes}
                    onChange={(e) => setUpdateSessionForm({ ...updateSessionForm, notes: e.target.value })}
                    rows={4}
                    placeholder="Add any additional notes about the session..."
                    className="mt-1"
                  />
                </div>

                {/* Warning for Status Change */}
                {updateSessionForm.status === 'pending' && selectedSession.status !== 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <h5 className="font-semibold text-yellow-800">Status Change Warning</h5>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Changing status to 'pending' will clear the meeting link and all student responses. 
                      Students will need to confirm their attendance again.
                  </p>
                </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="text-sm text-gray-600">
                    Last updated: {selectedSession.updatedAt ? new Date(selectedSession.updatedAt).toLocaleString() : 'N/A'}
                  </div>
                  <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUpdateSessionModal(false)}
                    >
                    Cancel
                  </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Update Session
                  </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {showApproveModal && selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Approve Session</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApproveModal(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-700 mb-4">Approve the student's proposed date/time and confirm the session?</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowApproveModal(false)}>Cancel</Button>
                <Button onClick={() => approveReschedule(selectedSession)}>Approve</Button>
              </div>
            </div>
          </div>
        )}

        {showRejectModal && selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Reject Proposed Time</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRejectModal(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-700 mb-4">Are you sure you want to reject the student's proposed date/time?</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                <Button onClick={() => rejectReschedule(selectedSession)} className="bg-red-600 hover:bg-red-700">Reject</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionManagement; 