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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              Session Details
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {getSubjectName(session.subject)} - {getAcademicLevelName(session.academic_level)}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0 ml-2">
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Session Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                Session Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">Subject:</span>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                      {getSubjectName(session.subject)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">Academic Level:</span>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                      {getAcademicLevelName(session.academic_level)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">Duration:</span>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      {session.duration_hours} hours
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">Date:</span>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      {new Date(session.session_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">Time:</span>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      {new Date(session.session_date).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                        timeZone: 'UTC'
                      })} ({session.duration_hours}h)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">Rate:</span>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      £{session.hourly_rate}/hour
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge className={`flex items-center gap-1 px-2 py-1 text-xs ${getStatusColor(session.status)}`}>
                  {getStatusIcon(session.status)}
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </Badge>
                {session.payment_required && (
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 text-xs">
                    Payment Required
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tutor Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                Tutor Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                    {session.tutor_id?.user_id?.full_name || 'Unknown Tutor'}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    {session.tutor_id?.qualifications || 'No qualifications listed'}
                  </p>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {session.tutor_id?.average_rating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
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
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                Students ({session.student_ids?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {session.student_ids?.map((student, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                            {student.user_id?.full_name || 'Unknown Student'}
                          </h5>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={`text-xs ${
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
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          Rating: {getStudentRating(student._id)}/5
                        </span>
                      </div>
                    )}
                    
                    {/* Student Response Details */}
                    {session.student_responses && (
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {session.student_responses.find(r => r.student_id === student._id)?.note && (
                          <p className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
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
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                Additional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {session.notes && (
                <div>
                  <h6 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base mb-2">Session Notes</h6>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded">
                    {session.notes}
                  </p>
                </div>
              )}
              
              {session.meeting_link && (
                <div>
                  <h6 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base mb-2">Meeting Link</h6>
                  <a 
                    href={session.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-2"
                  >
                    <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                    Join Meeting
                  </a>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h6 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base mb-2">Total Earnings</h6>
                  <p className="text-base sm:text-lg font-semibold text-green-600">
                    £{session.total_earnings || (session.hourly_rate * session.duration_hours)}
                  </p>
                </div>
                <div>
                  <h6 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base mb-2">Payment Status</h6>
                  <Badge className={`text-xs ${session.payment_required ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {session.payment_required ? 'Payment Required' : 'Paid'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs sm:text-sm">
              Close
            </Button>
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
  const { getParentProfile, getStudentSessions } = useParent();
  const { subjects, academicLevels } = useSubject();
  const [child, setChild] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      fetchStudentSessions(user._id);
      setLoading(false);
    }, 1000);
  }, []);

  const fetchStudentSessions = async (userId) => {
    try {
      const response = await getStudentSessions(userId);
      if (response) {
        setSessions(response.sessions);
      }
    } catch (error) {
      // console.error('Error fetching student sessions:', error);
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
        return <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'confirmed':
        return <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'pending':
        return <Clock className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'cancelled':
        return <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'in_progress':
        return <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />;
      default:
        return <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64 px-4">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-4">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Tutoring Sessions
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Track and manage all tutoring sessions for your children
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
              {sessions.filter(s => s.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sessions done
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">
              {sessions.filter(s => s.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Hours</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
              {sessions.reduce((total, session) => total + (session.duration_hours || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Sessions ({sessions.length})</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            All tutoring sessions for your children
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
          {sessions.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 dark:text-white mb-2">
                No sessions scheduled
              </h3>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                      {/* Session Info */}
                      <div className="flex-1 space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {getSubjectName(session.subject)} - {getAcademicLevelName(session.academic_level)}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                              with {session.tutor_id?.user_id?.full_name || 'Unknown Tutor'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300 truncate">
                              {session.student_ids?.map(id => id.user_id?.full_name).join(', ') || 'No students'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {new Date(session.session_date).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {new Date(session.session_date).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                                timeZone: 'UTC'
                              })} ({session.duration_hours}h)
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-gray-600 dark:text-gray-300">
                              £{session.hourly_rate}/hr
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status and Actions */}
                      <div className="flex flex-col items-start lg:items-end gap-2 sm:gap-3">
                        <div className="flex flex-col items-start lg:items-end gap-1 sm:gap-2">
                          <Badge 
                            className={`flex items-center gap-1 px-2 py-1 text-xs ${getStatusColor(session.status)}`}
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
                        
                        <div className="flex gap-1 sm:gap-2 w-full lg:w-auto">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1 lg:flex-none text-xs"
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