import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BASE_URL } from '@/config';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../ui/use-toast';
import { 
  Calendar, 
  Clock, 
  User, 
  Star,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { useSubject } from '../../hooks/useSubject';

const StudentSessions = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getAuthToken, user } = useAuth();
  const { academicLevels, subjects } = useSubject();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleSession, setRescheduleSession] = useState(null);
  const [rescheduleDateTime, setRescheduleDateTime] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingSession, setRatingSession] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loadingPaymentStatus, setLoadingPaymentStatus] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSessions();
      checkPaymentStatus();
    }
  }, [user, currentPage, statusFilter]);

  const checkPaymentStatus = async () => {
    try {
      setLoadingPaymentStatus(true);
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/api/auth/student/payment-status/${user?._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentStatus(data);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setLoadingPaymentStatus(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`${BASE_URL}/api/auth/student/sessions/${user?._id}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await response.json();
      setSessions(data.sessions);
      setTotalPages(data.pagination.total);
    } catch (error) {
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const putUpdateSession = async (session, updates) => {
    const token = getAuthToken();
    const baseBody = {
      // API expects these fields always
      session_date: new Date(session.session_date).toISOString().slice(0, 16),
      duration_hours: session.duration_hours,
      hourly_rate: session.hourly_rate,
      subject: session.subject,
      academic_level: session.academic_level
    };
    const response = await fetch(`${BASE_URL}/api/tutor/sessions/update/${session._id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...baseBody, ...updates })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to update session');
    }
    return response.json();
  };

  const handleStudentConfirm = async (session) => {
    try {
      await putUpdateSession(session, { student_response_status: 'confirmed', student_id: user._id });
      toast({ title: 'Confirmed', description: 'Session confirmed successfully.' });
      fetchSessions();
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };
  const getSubjectById = useCallback((id) => {
    if (!id) return undefined;
    const s = (subjects || []).find(s => s?._id?.toString() === id.toString());
    return s;
}, [subjects]);

  const handleStudentDecline = async (session) => {
    try {
      await putUpdateSession(session, { student_response_status: 'declined', student_id: user._id });
      toast({ title: 'Updated', description: 'You marked yourself unavailable for this session.' });
      fetchSessions();
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const openRescheduleModal = (session) => {
    setRescheduleSession(session);
    setRescheduleDateTime(new Date(session.session_date).toISOString().slice(0, 16));
    setShowRescheduleModal(true);
  };

  const submitReschedule = async () => {
    if (!rescheduleSession || !rescheduleDateTime) return;
    try {
      await putUpdateSession(rescheduleSession, {
        student_proposed_date: rescheduleDateTime,
        status: 'pending'
      });
      setShowRescheduleModal(false);
      setRescheduleSession(null);
      toast({ title: 'Requested', description: 'Reschedule request sent. Waiting for tutor approval.' });
      fetchSessions();
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const canCompleteAndRate = (session) => {
    const start = new Date(session.session_date);
    const end = new Date(start.getTime() + session.duration_hours * 60 * 60 * 1000);
    return Date.now() >= end.getTime();
  };

  const openRatingModal = (session) => {
    setRatingSession(session);
    setRatingValue(5);
    setRatingFeedback('');
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!ratingSession) return;
    try {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/api/auth/student/sessions/${ratingSession._id}/rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating: ratingValue, feedback: ratingFeedback })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to submit rating');
      }
      setShowRatingModal(false);
      setRatingSession(null);
      toast({ title: 'Thank you!', description: 'Your rating has been submitted.' });
      fetchSessions();
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const matchAcademicLevel = (level) => {
    const matchedLevel = academicLevels.find(l => l._id === level);
    if(matchedLevel){
      return matchedLevel.level;
    }
    return null;
  }
  const formatTime = (dateString) => {
    const [datePart, timePart] = dateString.split('T');
    const time = timePart.slice(0, 5); 
    return `${time}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "secondary", color: "text-yellow-600", bgColor: "bg-yellow-100" },
      confirmed: { variant: "default", color: "text-blue-600", bgColor: "bg-blue-100" },
      in_progress: { variant: "default", color: "text-purple-600", bgColor: "bg-purple-100" },
      completed: { variant: "default", color: "text-green-600", bgColor: "bg-green-100" },
      cancelled: { variant: "destructive", color: "text-red-600", bgColor: "bg-red-100" }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className={`${config.color} ${config.bgColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredSessions = sessions.filter(session => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        session.tutor_id.full_name.toLowerCase().includes(searchLower) ||
        session.subject.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Sessions</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchSessions}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
            <p className="text-gray-600 mt-1">View and manage all your tutoring sessions</p>
          </div>
        </div>
       
      </div>

      {/* Payment Status Warning */}
      {paymentStatus && paymentStatus.has_unpaid_requests && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-lg font-bold">!</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-red-600 text-base">Payment Required for Academic Level Access</h3>
                <div className="mt-2">
                  {paymentStatus.payment_statuses
                    .filter(p => !p.is_paid)
                    .slice(0, 3)
                    .map((item, index) => (
                      <div key={index} className="text-xs text-red-600">
                        • {item.tutor_name} - {getSubjectById(item.subject_id)?.name || item.subject_name} ({matchAcademicLevel(item.academic_level_name)})
                      </div>
                    ))}
                  {paymentStatus.total_unpaid_requests > 3 && (
                    <div className="text-xs text-red-600">
                      ... and {paymentStatus.total_unpaid_requests - 3} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by tutor name or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters or search terms'
                  : 'You haven\'t booked any sessions yet'
                }
              </p>
              <Button onClick={() => navigate(`/student/tutor-search`)}>
                Hire Your First Tutor
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => (
            <Card key={session._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {session.tutor_id.user_id.full_name}
                        </h3>
                        {(() => {
                          const myResp = Array.isArray(session.student_responses) ? session.student_responses.find(r => {
                            const uid = r?.student_id?.user_id?._id || r?.student_id?.user_id;
                            return uid && uid.toString() === user?._id?.toString();
                          }) : null;
                          const effectiveStatus = myResp?.status === 'declined' ? 'cancelled' : session.status;
                          return getStatusBadge(effectiveStatus);
                        })()}
                      </div>
                      <p className="text-gray-600 mb-1">{getSubjectById(session.subject)?.name || session.subject} - {matchAcademicLevel(session.academic_level)}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.session_date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(session.session_date)}
                        </div>
                        <span>Duration: {session.duration_hours}h</span>
                      </div>
                      {/* Show my response status and meeting link if available */}
                      {Array.isArray(session.student_responses) && session.student_responses.length > 0 && (() => {
                        const myResp = session.student_responses.find(r => {
                          const uid = r?.student_id?.user_id?._id || r?.student_id?.user_id;
                          return uid && uid.toString() === user?._id?.toString();
                        });
                        if (!myResp) return null;
                        const label = myResp.status === 'confirmed' ? 'You confirmed' : myResp.status === 'declined' ? 'You are not available' : 'Awaiting your response';
                        const cls = myResp.status === 'confirmed' ? 'text-green-700' : myResp.status === 'declined' ? 'text-red-700' : 'text-yellow-700';
                        return (
                          <div className={`mt-2 text-sm ${cls}`}>
                            <div>{label}</div>
                            {myResp.status === 'confirmed' && session.meeting_link && (
                              <div className="mt-1">
                                Meeting link: 
                                <span> </span>
                                <a href={session.meeting_link} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                  {session.meeting_link}
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      {session.student_proposed_date && (
                        <div className="mt-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-yellow-100 text-yellow-700">Proposed</Badge>
                            <span className="text-gray-600">Student proposed time:</span>
                            <span className="font-medium text-gray-800">{formatTime(new Date(session.student_proposed_date).toISOString())} • {formatDate(new Date(session.student_proposed_date).toISOString())}</span>
                          </div>
                          {session.student_proposed_status && (
                            <div className="mt-1 text-xs text-gray-500">
                              {session.student_proposed_status === 'pending' && 'Awaiting tutor decision'}
                              {session.student_proposed_status === 'accepted' && `Accepted${session.student_proposed_decided_at ? ` on ${formatDate(session.student_proposed_decided_at)}` : ''}`}
                              {session.student_proposed_status === 'rejected' && `Rejected${session.student_proposed_decided_at ? ` on ${formatDate(session.student_proposed_decided_at)}` : ''}`}
                            </div>
                          )}
                        </div>
                      )}
                      {session.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          "{session.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        £{session.hourly_rate}/hr
                      </p>
                      <p className="text-sm text-gray-600">
                        Total: £{session.total_earnings}
                      </p>
                    </div>
                    
                    {(() => {
                      // Overall session rating
                      const overall = typeof session.rating === 'number' ? session.rating : null;
                      // My own rating
                      const my = Array.isArray(session.student_ratings) ? session.student_ratings.find(sr => {
                        const sid = sr?.student_id?.user_id?._id || sr?.student_id?._id || sr?.student_id;
                        return sid && sid.toString() === user?._id?.toString();
                      }) : null;
                      return (
                        <div className="flex items-center gap-3">
                          {typeof overall === 'number' && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">Session: {overall}/5</span>
                            </div>
                          )}
                          {my && (
                            <div className="text-sm text-gray-700">Your rating: {my.rating}/5</div>
                          )}
                        </div>
                      );
                    })()}
                    
                    {session.feedback && (
                      <p className="text-xs text-gray-500 max-w-xs text-right">
                        "{session.feedback}"
                      </p>
                    )}

                    {/* Student actions */}
                    <div className="flex flex-wrap gap-2 mt-2 justify-end">
                      {(() => {
                        const myResp = Array.isArray(session.student_responses) ? session.student_responses.find(r => {
                          const uid = r?.student_id?.user_id?._id || r?.student_id?.user_id;
                          return uid && uid.toString() === user?._id?.toString();
                        }) : null;
                        const effectiveStatus = myResp?.status === 'declined' ? 'cancelled' : session.status;
                        return effectiveStatus === 'pending';
                      })() && (
                        <>
                          <Button size="sm" onClick={() => handleStudentConfirm(session)}>Confirm</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleStudentDecline(session)}>Not available</Button>
                        </>
                      )}
                      {/* Allow rating/feedback while in progress and after completion */}
                      {(() => {
                        // Hide rate button if student declined
                        const myResp = Array.isArray(session.student_responses) ? session.student_responses.find(r => {
                          const uid = r?.student_id?.user_id?._id || r?.student_id?.user_id;
                          return uid && uid.toString() === user?._id?.toString();
                        }) : null;
                        const declined = myResp?.status === 'declined';
                        const allowed = !declined && ['in_progress', 'completed'].includes(session.status);
                        return allowed ? (
                          <Button size="sm" onClick={() => openRatingModal(session)}>
                            {session.status === 'completed' ? 'Rate Session' : 'Rate Now'}
                          </Button>
                        ) : null;
                      })()}
                      {/* No reschedule allowed when confirmed */}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Request Reschedule</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">New Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={rescheduleDateTime}
                  onChange={(e) => setRescheduleDateTime(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowRescheduleModal(false)}>Cancel</Button>
                <Button onClick={submitReschedule}>Submit</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Rate Your Session</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Rating</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={ratingValue}
                  onChange={(e) => setRatingValue(Number(e.target.value))}
                >
                  {[5,4,3,2,1].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Feedback (optional)</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  placeholder="Share your feedback"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowRatingModal(false)}>Cancel</Button>
                <Button onClick={submitRating}>Submit</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSessions; 