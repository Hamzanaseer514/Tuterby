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

const SessionsPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading sessions data
    setTimeout(() => {
      setSessions([
        {
          id: 1,
          childName: 'Emma Johnson',
          subject: 'GCSE Mathematics',
          tutor: 'Dr. Sarah Williams',
          date: '2024-01-15',
          time: '14:00',
          duration: '60',
          status: 'completed',
          type: 'online',
          location: 'Zoom Meeting'
        },
        {
          id: 2,
          childName: 'Emma Johnson',
          subject: 'GCSE English Literature',
          tutor: 'Prof. Michael Brown',
          date: '2024-01-17',
          time: '16:00',
          duration: '90',
          status: 'upcoming',
          type: 'in-person',
          location: 'Tutor Center - London'
        },
        {
          id: 3,
          childName: 'James Johnson',
          subject: 'A-Level Physics',
          tutor: 'Dr. Lisa Chen',
          date: '2024-01-20',
          time: '10:00',
          duration: '120',
          status: 'cancelled',
          type: 'online',
          location: 'Google Meet'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'upcoming':
        return <AlertCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
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
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {sessions.filter(s => s.status === 'upcoming').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Scheduled
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
              {sessions.reduce((total, session) => total + parseInt(session.duration), 0) / 60}
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
                              {session.subject}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              with {session.tutor}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {session.childName}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {new Date(session.date).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {session.time} ({session.duration}min)
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {session.type === 'online' ? (
                              <Video className="h-4 w-4 text-gray-400" />
                            ) : (
                              <MapPin className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-gray-600 dark:text-gray-300">
                              {session.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status and Actions */}
                      <div className="flex flex-col items-end gap-3">
                        <Badge 
                          className={`flex items-center gap-1 px-3 py-1 ${getStatusColor(session.status)}`}
                        >
                          {getStatusIcon(session.status)}
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </Badge>
                        
                        <div className="flex gap-2">
                          {session.status === 'upcoming' && (
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
