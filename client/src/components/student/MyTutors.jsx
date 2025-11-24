import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BASE_URL } from '@/config';
import { useToast } from '../../components/ui/use-toast';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar } from '../../components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Star,
  MapPin,
  Clock,
  Calendar,
  MessageCircle,
  BookOpen,
  Award,
  MessageSquare,
  Trash
} from 'lucide-react';
import { RefreshCw, Repeat } from 'lucide-react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { useSubject } from '../../hooks/useSubject';
import TutorReviewModal from './TutorReviewModal';

const MyTutors = () => {
  const { getAuthToken, user, fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const [hiredTutors, setHiredTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { subjects, academicLevels } = useSubject();
  const navigate = useNavigate();

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [tutorPaymentStatus, setTutorPaymentStatus] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [newUpdatesAvailable, setNewUpdatesAvailable] = useState(false);
  const [lastDataHash, setLastDataHash] = useState(null);
  // Delete confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Responsive height constants
  const CARD_HEIGHT = 'h-auto min-h-[420px] sm:min-h-[440px] lg:min-h-[460px]';
  const SUBJECTS_HEIGHT = 'h-16 sm:h-20 lg:h-24';
  const BASIC_INFO_HEIGHT = 'h-20 sm:h-24 lg:h-28';
  const BUTTONS_HEIGHT = 'h-auto min-h-10';

  useEffect(() => {
    fetchHiredTutors();
  }, []);

  // polling for updates when autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchHiredTutors(true);
    }, 30000); // every 30s
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // fetchHiredTutors: if `silent` is true, don't flip loading/error UI and detect changes
  const fetchHiredTutors = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      const token = getAuthToken();

      const response = await fetchWithAuth(`${BASE_URL}/api/auth/student/${user._id}/hired-tutors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }, token, (newToken) => localStorage.setItem("authToken", newToken)
      );

      if (!response.ok) {
        if (!silent) throw new Error('Failed to fetch hired tutors');
        return;
      }

      const data = await response.json();

      const newTutors = data.tutors || [];

      // detect changes by hashing the tutors list
      try {
        const hash = JSON.stringify(newTutors.map(t => t._id || t));
        if (lastDataHash && hash !== lastDataHash) {
          setNewUpdatesAvailable(true);
        }
        setLastDataHash(hash);
      } catch (e) {
        // fallback: compare lengths
        if (lastDataHash && (newTutors.length !== (hiredTutors?.length || 0))) {
          setNewUpdatesAvailable(true);
        }
        setLastDataHash(String(newTutors.length));
      }

      setHiredTutors(newTutors);

      // Check payment status for each tutor
      await checkPaymentStatusForTutors(newTutors);
    } catch (error) {
      if (!silent) setError(error.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const checkPaymentStatusForTutors = async (tutors) => {
    try {
      const token = getAuthToken();
      const response = await fetchWithAuth(
        `${BASE_URL}/api/auth/student/payment-status/${user._id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        },
        token,
        (newToken) => localStorage.setItem("authToken", newToken)
      );

      if (response.ok) {
        const data = await response.json();
        const paymentStatusMap = {};

        data.payment_statuses.forEach(status => {
          try {
            paymentStatusMap[String(status.tutor_id)] = !!status.is_paid;
          } catch (e) {
            paymentStatusMap[status.tutor_id] = !!status.is_paid;
          }
        });

        setTutorPaymentStatus(paymentStatusMap);
      }
    } catch (error) {
      // Error handling
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s._id === subjectId);
    return subject ? subject : '';
  }

  const getHiringStatusBadge = (status) => {
    const statusConfig = {
      'pending': { variant: 'secondary', text: 'Request Pending', color: 'bg-yellow-100 text-yellow-800' },
      'accepted': { variant: 'default', text: 'Hired', color: 'bg-green-100 text-green-800' },
      'rejected': { variant: 'destructive', text: 'Request Rejected', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || { variant: 'outline', text: status, color: 'bg-gray-100 text-gray-800' };

    return (
      <Badge variant={config.variant} className={`${config.color} text-xs sm:text-sm`}>
        {config.text}
      </Badge>
    );
  };

  const renderStars = (rating) => {
    if (!rating || rating === 0) return null;

    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 sm:w-4 sm:h-4 ${i <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  const handleViewTutor = (tutorId) => {
    navigate(`/tutor`, {
      state: { tutorId: tutorId }
    });
  };

  const handleOpenReviewModal = (tutor) => {
    setSelectedTutor(tutor);
    setReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedTutor(null);
  };

  const handleReviewSubmitted = () => {
    fetchHiredTutors();
  };

  const handleDeleteRequest = async (hireId) => {
    setDeleteTarget(hireId);
    setDeleteConfirmOpen(true);
  };

  const performDeleteRequest = async () => {
    const hireId = deleteTarget;
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
    try {
      const token = getAuthToken();
      const response = await fetchWithAuth(
        `${BASE_URL}/api/auth/student/hire/${hireId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        },
        token,
        (newToken) => localStorage.setItem('authToken', newToken)
      );

      let body = {};
      try { body = await response.json(); } catch (e) { body = {}; }

      if (!response.ok) {
        const msg = body.message || body.error || 'Failed to delete hire request';
        toast({ title: 'Error', description: msg, variant: 'destructive' });
        return;
      }

      toast({ title: 'Success', description: body.message || 'Hire request deleted', variant: 'default' });
      setHiredTutors(prev => prev.filter(h => String(h._id) !== String(hireId)));
    } catch (err) {
      console.error('Delete hire request failed', err);
      toast({ title: 'Error', description: err.message || 'Failed to delete hire request', variant: 'destructive' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-center min-h-[60vh] sm:min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading your tutors...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                My Tutors
              </h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                {hiredTutors.length > 0
                  ? `You have ${hiredTutors.length} tutor request${hiredTutors.length > 1 ? 's' : ''}`
                  : "You haven't sent any tutor requests yet"
                }
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* {newUpdatesAvailable && (
                <Button
                  size="sm"
                  variant="default"
                  className="text-xs"
                  onClick={() => { setNewUpdatesAvailable(false); fetchHiredTutors(false); }}
                >
                  New updates — Refresh
                </Button>
              )} */}

              <Button
                size="sm"
                variant="outline"
                className="text-xs flex items-center gap-2"
                onClick={() => { setNewUpdatesAvailable(false); fetchHiredTutors(false); }}
              >
                <RefreshCw className="w-4 h-4" />
                {/* Refresh */}
              </Button>

              {/* <Button
                size="sm"
                variant={autoRefresh ? 'default' : 'outline'}
                className="text-xs flex items-center gap-2"
                onClick={() => setAutoRefresh(prev => !prev)}
              >
                <Repeat className="w-4 h-4" />
                {autoRefresh ? 'Auto On' : 'Auto Off'}
              </Button> */}
            </div>
          </div>
        </div>

        {hiredTutors.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6 sm:p-8 lg:p-10 text-center">
              <div className="text-gray-400 mb-4 sm:mb-6">
                {user.photo_url ? (
                  <img
                    src={`${user.photo_url}`}
                    alt={user.full_name || "Student"}
                    className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover ring-2 ring-gray-100 mx-auto"
                  />
                ) : (
                  <Avatar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto">
                    <div className="h-full w-full bg-blue-100 flex items-center justify-center rounded-full">
                      <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    </div>
                  </Avatar>
                )}
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-900 mb-2 sm:mb-3">
                No Tutor Requests
              </h3>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6">
                You haven't sent any tutor requests yet. Start by searching for tutors in your area.
              </p>
              <Link to="/student/tutor-search">
                <Button className="text-sm sm:text-base" size="lg">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Find Tutors
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {hiredTutors.map((hiredTutor) => {
              const visibleSubjects = hiredTutor.subjects?.slice(0, 2) || [];
              const hiddenSubjectsCount = Math.max(0, (hiredTutor.subjects?.length || 0) - 2);

              return (
                <Card
                  key={hiredTutor._id}
                  className={`hover:shadow-lg transition-shadow duration-300 ${CARD_HEIGHT} flex flex-col`}
                >
                  <CardHeader className="pb-3 sm:pb-4 flex-shrink-0">
                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {hiredTutor.user_id?.photo_url ? (
                            <img
                              src={`${hiredTutor.user_id.photo_url}`}
                              alt="Profile"
                              className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-full object-cover ring-2 ring-gray-100"
                            />
                          ) : (
                            <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg lg:text-xl truncate">
                            {hiredTutor.full_name}
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">
                            {hiredTutor.location || 'Location not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {getHiringStatusBadge(hiredTutor.hireStatus)}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 sm:space-y-4 flex-1 flex flex-col">
                    {/* Basic Info with responsive height */}
                    <div className={`${BASIC_INFO_HEIGHT} space-y-1 sm:space-y-2 overflow-hidden`}>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-xs sm:text-sm">Hourly Rate:</span>
                        {(() => {
                          if (hiredTutor.academic_levels_taught && hiredTutor.academic_levels_taught.length > 0) {
                            const rates = hiredTutor.academic_levels_taught.map(level => level.hourlyRate).filter(rate => rate);
                            if (rates.length > 0) {
                              const minRate = Math.min(...rates);
                              const maxRate = Math.max(...rates);
                              return (
                                <span className="font-semibold text-xs sm:text-sm">
                                  £{minRate === maxRate ? minRate : `${minRate}-${maxRate}`}/hr
                                </span>
                              );
                            }
                          }
                          return <span className="font-semibold text-xs sm:text-sm">£{hiredTutor.hourly_rate || 'N/A'}/hr</span>;
                        })()}
                      </div>

                      {hiredTutor.experience && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-xs sm:text-sm">Experience:</span>
                          <span className="font-semibold text-xs sm:text-sm">{hiredTutor.experience} years</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-xs sm:text-sm">Rating:</span>
                        <div className="flex items-center gap-1">
                          {hiredTutor.rating && renderStars(hiredTutor.rating)}
                          {!hiredTutor.rating && (
                            <span className="text-xs text-gray-500">No ratings</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Subjects with responsive height and overflow handling */}
                    {hiredTutor.subjects && hiredTutor.subjects.length > 0 && (
                      <div className={`${SUBJECTS_HEIGHT} overflow-hidden`}>
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Subjects:</p>
                        <div className="flex flex-wrap gap-1">
                          {visibleSubjects.map((subject, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs max-w-full truncate px-1 sm:px-2"
                            >
                              {getSubjectName(subject).name}
                            </Badge>
                          ))}
                          {hiddenSubjectsCount > 0 && (
                            <Badge variant="outline" className="text-xs px-1 sm:px-2">
                              +{hiddenSubjectsCount} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Request Details */}
                    <div className="border-t pt-3 sm:pt-4 space-y-1 sm:space-y-2 flex-1">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Requested on:</span>
                        <span className="font-medium">{formatDate(hiredTutor.hired_at)}</span>
                      </div>
                    </div>

                    {/* Action Buttons with responsive layout */}
                    <div className={`flex flex-col xs:flex-row gap-2 pt-2 sm:pt-3 ${BUTTONS_HEIGHT}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 sm:h-9 p-1 lg:h-10 text-xs sm:text-sm"
                        onClick={() => handleViewTutor(hiredTutor._id)}
                      >
                        <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Profile
                      </Button>

                      {(() => {
                        const statusLower = String(hiredTutor.hireStatus || '').toLowerCase();
                        const isPaid = !!tutorPaymentStatus[String(hiredTutor._id)];
                        return (
                          hiredTutor.hireStatus === 'accepted' && isPaid
                        );
                      })() && (
                          <Button
                            size="sm"
                            className="flex-1 h-8 sm:h-9 lg:h-10 p-1 text-xs sm:text-sm"
                            onClick={() => handleOpenReviewModal(hiredTutor)}
                          >
                            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Rate
                          </Button>
                        )}

                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 h-8 sm:h-9 lg:h-10 p-1 text-xs sm:text-sm"
                        onClick={() => handleDeleteRequest(hiredTutor._id)}
                      >
                        <Trash className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        className="p-3 sm:p-4"
      >
        <DialogTitle className="text-lg sm:text-xl font-semibold">
          Delete Hire Request
        </DialogTitle>
        <DialogContent>
          <Typography className="text-sm sm:text-base">
            Are you sure you want to delete this hire request? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions className="p-4 gap-2">
          <Button
            variant="ghost"
            onClick={() => setDeleteConfirmOpen(false)}
            className="text-sm sm:text-base"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={performDeleteRequest}
            className="text-sm sm:text-base"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Modal */}
      {selectedTutor && (
        <TutorReviewModal
          tutor={selectedTutor}
          isOpen={reviewModalOpen}
          onClose={handleCloseReviewModal}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

export default MyTutors;