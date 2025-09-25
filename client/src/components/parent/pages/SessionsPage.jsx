import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  MapPin, 
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  MessageSquare,
  FileText,
  DollarSign,
  X,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { useParent } from '../../../contexts/ParentContext';
import { useSubject } from '../../../hooks/useSubject';

// Session Details Modal Component
const SessionDetailsModal = ({ session, isOpen, onClose, subjects, academicLevels }) => {
  if (!isOpen || !session) return null;

  const getAcademicLevelName = (id) => {
    if (!id) return null;
    const academicLevel = academicLevels.find(level => level._id === id);
    return academicLevel?.level || id;
  };

  const getSubjectName = (id) => {
    if (!id) return null;
    const subject = subjects.find(subject => subject._id === id);
    return subject?.name || id;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'confirmed':
        return <AlertCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStudentResponseStatus = (studentId) => {
    const response = session.student_responses?.find(r => r.student_id._id === studentId);
    return response?.status || 'pending';
  };

  const getStudentRating = (studentId) => {
    const rating = session.student_ratings?.find(r => r.student_id._id === studentId);
    return rating?.rating || null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Session Details
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {getSubjectName(session.subject)} - {getAcademicLevelName(session.academic_level)}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Session Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Session Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Subject:</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {getSubjectName(session.subject)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Academic Level:</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {getAcademicLevelName(session.academic_level)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Duration:</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {session.duration_hours} hours
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Date:</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(session.session_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Time:</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                    {new Date(session.session_date).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                                timeZone: 'UTC'
                              })} ({session.duration_hours}h)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Rate:</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      £{session.hourly_rate}/hour
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={`flex items-center gap-1 px-3 py-1 ${getStatusColor(session.status)}`}>
                  {getStatusIcon(session.status)}
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </Badge>
                {session.payment_required && (
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                    Payment Required
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tutor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Tutor Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {session.tutor_id?.user_id?.full_name || 'Unknown Tutor'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {session.tutor_id?.qualifications || 'No qualifications listed'}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {session.tutor_id?.average_rating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {session.tutor_id?.total_sessions || 0} sessions
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Students ({session.student_ids?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {session.student_ids?.map((student, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {student.user_id?.full_name || 'Unknown Student'}
                          </h5>
                         
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={`${
                            getStudentResponseStatus(student._id) === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : getStudentResponseStatus(student._id) === 'declined'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {getStudentResponseStatus(student._id).charAt(0).toUpperCase() + 
                           getStudentResponseStatus(student._id).slice(1)}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Student Rating */}
                    {getStudentRating(student._id) && (
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Rating: {getStudentRating(student._id)}/5
                        </span>
                      </div>
                    )}
                    
                    {/* Student Response Details */}
                    {session.student_responses && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {session.student_responses.find(r => r.student_id === student._id)?.note && (
                          <p className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <strong>Note:</strong> {session.student_responses.find(r => r.student_id === student._id)?.note}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.notes && (
                <div>
                  <h6 className="font-medium text-gray-900 dark:text-white mb-2">Session Notes</h6>
                  <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {session.notes}
                  </p>
                </div>
              )}
              
              {session.meeting_link && (
                <div>
                  <h6 className="font-medium text-gray-900 dark:text-white mb-2">Meeting Link</h6>
                  <a 
                    href={session.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-2"
                  >
                    <Video className="h-4 w-4" />
                    Join Meeting
                  </a>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h6 className="font-medium text-gray-900 dark:text-white mb-2">Total Earnings</h6>
                  <p className="text-lg font-semibold text-green-600">
                    £{session.total_earnings || (session.hourly_rate * session.duration_hours)}
                  </p>
                </div>
                <div>
                  <h6 className="font-medium text-gray-900 dark:text-white mb-2">Payment Status</h6>
                  <Badge className={session.payment_required ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                    {session.payment_required ? 'Payment Required' : 'Paid'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {/* {session.status === 'pending' && (
              <Button variant="outline" className="text-green-600 hover:text-green-700">
                Accept Session
              </Button>
            )}
            {session.status === 'confirmed' && (
              <Button variant="outline" className="text-blue-600 hover:text-blue-700">
                Reschedule
              </Button>
            )}
            {session.meeting_link && session.status === 'confirmed' && (
              <Button className="bg-green-600 hover:bg-green-700">
                <Video className="h-4 w-4 mr-2" />
                Join Meeting
              </Button>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

const SessionsPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getParentProfile,getStudentSessions } = useParent();
  const { subjects, academicLevels } = useSubject();
  const [child, setChild] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);


  useEffect(() => {
    // Simulate loading sessions data
    setTimeout(() => {
      // fetchChildData();
      fetchStudentSessions(user._id);
      setLoading(false);
    }, 1000);
  }, []);


//   const fetchChildData = async () => {
//     try {
//         setLoading(true);
//         const data = await getParentProfile(user._id);
//         const foundChild = data.children?.find(c => c.full_name?.toLowerCase().replace(/\s+/g, '-') === childSlug);
//         console.log("foundChild", foundChild)
//         if (foundChild) {
//             setChild(foundChild);
//             // Fetch detailed student information including hired tutors
//             await fetchStudentSessions(foundChild._id);
//         } else {
//             setError('Child not found');
//         }
//     } catch (error) {
//         console.error('Error fetching child data:', error);
//         setError('Failed to load child information');
//     } finally {
//         setLoading(false);
//     }
// };

const fetchStudentSessions = async (userId) => {
    try {
        const response = await getStudentSessions(userId);
        if (response) {
            setSessions(response.sessions);
        }
    } catch (error) {
        console.error('Error fetching student sessions:', error);
    }
};

const getAcademicLevelName = (id) => {
    if (!id) return null;
    const academicLevel = academicLevels.find(level => level._id === id);
    return academicLevel?.level || id;
};

const getSubjectName = (id) => {
    if (!id) return null;
    const subject = subjects.find(subject => subject._id === id);
    return subject?.name || id;
};


  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'confirmed':
        return <AlertCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tutoring Sessions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track and manage all tutoring sessions for your children
            </p>
          </div>
          {/* <Button className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule New Session
          </Button> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sessions.filter(s => s.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Sessions done
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {sessions.filter(s => s.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.reduce((total, session) => total + (session.duration_hours || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions ({sessions.length})</CardTitle>
          <CardDescription>
            All tutoring sessions for your children
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No sessions scheduled
              </h3>
              {/* <p className="text-gray-500 dark:text-gray-400 mb-4">
                Start by scheduling your first tutoring session
              </p> */}
              {/* <Button>Schedule Session</Button> */}
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Session Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {getSubjectName(session.subject)} - {getAcademicLevelName(session.academic_level)}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              with {session.tutor_id?.user_id?.full_name || 'Unknown Tutor'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {session.student_ids.map(id => id.user_id.full_name).join(', ')}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {new Date(session.session_date).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {new Date(session.session_date).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                                timeZone: 'UTC'
                              })} ({session.duration_hours}h)
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-300">
                              £{session.hourly_rate}/hr
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status and Actions */}
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex flex-col items-end gap-2">
                          <Badge 
                            className={`flex items-center gap-1 px-3 py-1 ${getStatusColor(session.status)}`}
                          >
                            {getStatusIcon(session.status)}
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </Badge>
                          
                          {session.payment_required && (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 text-xs">
                              Payment Required
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {/* {session.status === 'pending' && (
                            <>
                              <Button variant="outline" size="sm">
                                Accept
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                Decline
                              </Button>
                            </>
                          )} */}
                          
                          {/* {session.status === 'confirmed' && (
                            <>
                              <Button variant="outline" size="sm">
                                Reschedule
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                Cancel
                              </Button>
                            </>
                          )} */}
                          
                          {/* {session.status === 'completed' && (
                            <Button variant="outline" size="sm">
                              View Report
                            </Button>
                          )} */}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedSession(session);
                              setShowDetailsModal(true);
                            }}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Details Modal */}
       {selectedSession && (
         <SessionDetailsModal
           session={selectedSession}
           isOpen={showDetailsModal}
           onClose={() => {
             setShowDetailsModal(false);
             setSelectedSession(null);
           }}
           subjects={subjects}
           academicLevels={academicLevels}
         />
      )}
    </div>
  );
};

export default SessionsPage;
