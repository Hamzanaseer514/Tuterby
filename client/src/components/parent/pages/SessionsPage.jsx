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
  AlertCircle
} from 'lucide-react';
import { useParent } from '../../../contexts/ParentContext';
import { useSubject } from '../../../hooks/useSubject';


const SessionsPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getParentProfile,getStudentSessions } = useParent();
  const { subjects, academicLevels } = useSubject();
  const [child, setChild] = useState(null);


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
          <Button className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule New Session
          </Button>
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
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Start by scheduling your first tutoring session
              </p>
              <Button>Schedule Session</Button>
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
                          {session.status === 'pending' && (
                            <>
                              <Button variant="outline" size="sm">
                                Accept
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                Decline
                              </Button>
                            </>
                          )}
                          
                          {session.status === 'confirmed' && (
                            <>
                              <Button variant="outline" size="sm">
                                Reschedule
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                Cancel
                              </Button>
                            </>
                          )}
                          
                          {session.status === 'completed' && (
                            <Button variant="outline" size="sm">
                              View Report
                            </Button>
                          )}
                          
                          <Button variant="outline" size="sm">
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
    </div>
  );
};

export default SessionsPage;
