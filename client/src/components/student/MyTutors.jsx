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
  // Delete confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Height constants for consistent sizing
  const CARD_HEIGHT = 'h-[390px]'; // Fixed height for tutor cards
  const SUBJECTS_HEIGHT = 'h-20'; // Fixed height for subjects section
  const BASIC_INFO_HEIGHT = 'h-20'; // Fixed height for basic info
  const BUTTONS_HEIGHT = 'h-8'; // Fixed height for buttons

  useEffect(() => {
    fetchHiredTutors();
  }, []);

  const fetchHiredTutors = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      const response = await fetchWithAuth(`${BASE_URL}/api/auth/student/${user._id}/hired-tutors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }, token, (newToken) => localStorage.setItem("authToken", newToken)
      );

      if (!response.ok) {
        throw new Error('Failed to fetch hired tutors');
      }

      const data = await response.json();
      setHiredTutors(data.tutors || []);

      // Check payment status for each tutor
      await checkPaymentStatusForTutors(data.tutors || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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
          // normalize key to string to avoid mismatches between ObjectId and string keys
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
      <Badge variant={config.variant} className={config.color}>
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
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
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
    // show confirmation dialog instead of native confirm
    setDeleteTarget(hireId);
    setDeleteConfirmOpen(true);
  };

  // perform the actual delete after user confirms
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
        toast({ title: 'Error', description: msg });
        return;
      }

      toast({ title: 'Success', description: body.message || 'Hire request deleted' });
      // remove from UI list (hiredTutor._id is tutor id in current response)
      setHiredTutors(prev => prev.filter(h => String(h._id) !== String(hireId)));
    } catch (err) {
      console.error('Delete hire request failed', err);
      toast({ title: 'Error', description: err.message || 'Failed to delete hire request' });
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tutors</h1>
          <p className="text-gray-600">
            {hiredTutors.length > 0
              ? `You have ${hiredTutors.length} tutor request${hiredTutors.length > 1 ? 's' : ''}`
              : "You haven't sent any tutor requests yet"
            }
          </p>
        </div>

        {hiredTutors.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                {user.photo_url ? (
                  <img
                    src={`${user.photo_url}`}
                    alt={user.full_name || "Student"}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
                  />
                ) : (
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <div className="h-full w-full bg-blue-100 flex items-center justify-center rounded-full">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                  </Avatar>
                )}              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tutor Requests</h3>
              <p className="text-gray-600 mb-4">
                You haven't sent any tutor requests yet. Start by searching for tutors in your area.
              </p>
              <Link to="/student/tutor-search">
                <Button>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Find Tutors
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hiredTutors.map((hiredTutor) => {
              const visibleSubjects = hiredTutor.subjects?.slice(0, 2) || [];
              const hiddenSubjectsCount = Math.max(0, (hiredTutor.subjects?.length || 0) - 2);

              return (
                <Card key={hiredTutor._id} className={`hover:shadow-lg transition-shadow ${CARD_HEIGHT} flex flex-col`}>
                  <CardHeader className="pb-4 flex-shrink-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {hiredTutor.user_id?.photo_url ? (
                            <img
                              src={`${hiredTutor.user_id.photo_url}`}
                              alt="Profile"
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100"
                            />
                          ) : (
                            <User className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg truncate">{hiredTutor.full_name}</CardTitle>
                          <p className="text-sm text-gray-600 truncate">
                            {hiredTutor.location || 'Location not specified'}
                          </p>
                        </div>
                      </div>
                      {getHiringStatusBadge(hiredTutor.hireStatus)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    {/* Basic Info with fixed height */}
                    <div className={`${BASIC_INFO_HEIGHT} space-y-2 overflow-hidden`}>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Hourly Rate:</span>
                        {(() => {
                          if (hiredTutor.academic_levels_taught && hiredTutor.academic_levels_taught.length > 0) {
                            const rates = hiredTutor.academic_levels_taught.map(level => level.hourlyRate).filter(rate => rate);
                            if (rates.length > 0) {
                              const minRate = Math.min(...rates);
                              const maxRate = Math.max(...rates);
                              return (
                                <span className="font-semibold text-sm">
                                  £{minRate === maxRate ? minRate : `${minRate}-${maxRate}`}/hr
                                </span>
                              );
                            }
                          }
                          return <span className="font-semibold text-sm">£{hiredTutor.hourly_rate || 'N/A'}/hr</span>;
                        })()}
                      </div>

                      {hiredTutor.experience && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Experience:</span>
                          <span className="font-semibold text-sm">{hiredTutor.experience} years</span>
                        </div>
                      )}


                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Rating:</span>
                        <div className="flex items-center gap-1">
                          {hiredTutor.rating && (
                            <>
                              {renderStars(hiredTutor.rating)}
                            </>)}
                        </div>
                      </div>
                    </div>

                    {/* Subjects with fixed height and overflow handling */}
                    {hiredTutor.subjects && hiredTutor.subjects.length > 0 && (
                      <div className={`${SUBJECTS_HEIGHT} overflow-hidden`}>
                        <p className="text-sm font-medium text-gray-700 mb-2">Subjects:</p>
                        <div className="flex flex-wrap gap-1">
                          {visibleSubjects.map((subject, index) => (
                            <Badge key={index} variant="outline" className="text-xs max-w-full truncate">
                              {getSubjectName(subject).name}
                            </Badge>
                          ))}
                          {hiddenSubjectsCount > 0 && (
                            <Badge variant="outline" className="text-xs">
                              +{hiddenSubjectsCount} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Request Details */}
                    <div className="border-t pt-4 space-y-2 flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Requested on:</span>
                        <span className="font-medium">{formatDate(hiredTutor.hired_at)}</span>
                      </div>
                    </div>

                    {/* Action Buttons with fixed height */}
                    <div className={`flex gap-2 pt-2 ${BUTTONS_HEIGHT} items-center`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-10"
                        onClick={() => handleViewTutor(hiredTutor._id)}
                      >
                        <User className="w-4 h-4 mr-2" />
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
                            className="flex-1 h-10"
                            onClick={() => handleOpenReviewModal(hiredTutor)}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Rate 
                          </Button>
                        )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 h-10"
                        onClick={() => handleDeleteRequest(hiredTutor._id)}
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                      {/* Delete button: show when payment not made/invalid or when request is pending/rejected */}
                      {/* {(() => {
                        const statusLower = String(hiredTutor.hireStatus || '').toLowerCase();
                        const isPaid = !!tutorPaymentStatus[String(hiredTutor._id)];
                        return (!isPaid || statusLower === 'pending' || statusLower === 'rejected');
                      })() && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 h-10"
                          onClick={() => handleDeleteRequest(hiredTutor._id)}
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      )} */}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Hire Request</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this hire request? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={performDeleteRequest}>Delete</Button>
        </DialogActions>
      </Dialog>
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