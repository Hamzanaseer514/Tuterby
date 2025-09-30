import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BASE_URL } from '@/config';
import { useToast } from '../../components/ui/use-toast';
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
  MessageSquare
} from 'lucide-react';
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
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
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
      // toast({
      //   title: "Error",
      //   description: "Failed to load hired tutors",
      //   variant: "destructive"
      // });
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
          paymentStatusMap[status.tutor_id] = status.is_paid;
        });
        
        setTutorPaymentStatus(paymentStatusMap);
      }
    } catch (error) {
      // console.error('Error checking payment status:', error);
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s._id === subjectId);
    return subject ? subject: '';
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
    // Refresh the tutors list to show updated ratings
    fetchHiredTutors();
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

  // if (error) {
  //   return (
  //       <div className="min-h-screen bg-gray-50">
  //           <div className="container mx-auto px-4 py-8">
  //         <div className="text-center">
  //           <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Tutors</h2>
  //           <p className="text-gray-600 mb-4">{error}</p>
  //           {/* <Button onClick={fetchHiredTutors}>Try Again</Button> */}
  //         </div>
  //           </div>
  //       </div>
  //   );
  // }

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
                src={`${BASE_URL}${user.photo_url}`}
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
              <Button onClick={() => window.history.back()}>
                <BookOpen className="w-4 h-4 mr-2" />
                Find Tutors
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hiredTutors.map((hiredTutor) => (
              <Card key={hiredTutor._id} className="hover:shadow-lg transition-shadow" >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {hiredTutor.user_id?.photo_url ? (
                          <img
                            src={`${BASE_URL}${hiredTutor.user_id.photo_url}`}
                            alt="Profile"
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
                          />
                        ) : (
                          <User className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{hiredTutor.full_name}</CardTitle>
                        <p className="text-sm text-gray-600">{hiredTutor.location || 'Location not specified'}</p>
                      </div>
                    </div>
                    {getHiringStatusBadge(hiredTutor.hireStatus)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Basic Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Hourly Rate:</span>
                      <span className="font-semibold">£{hiredTutor.hourly_rate}/hr</span>
                    </div>
                    
                    {hiredTutor.experience && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-semibold">{hiredTutor.experience} years</span>
                      </div>
                    )}
                    
                    {hiredTutor.rating && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <div className="flex items-center gap-1">
                          {renderStars(hiredTutor.rating)}
                          {/* <span className="font-semibold ml-1">{hiredTutor.rating.toFixed(1)}</span> */}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subjects */}
                  {hiredTutor.subjects && hiredTutor.subjects.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Subjects:</p>
                      <div className="flex flex-wrap gap-1">
                        {hiredTutor.subjects.slice(0, 3).map((subject, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {getSubjectName(subject).name}
                          </Badge>
                        ))}
                        {hiredTutor.subjects.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{hiredTutor.subjects.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Request Details */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Requested on:</span>
                      <span className="font-medium">{formatDate(hiredTutor.hired_at)}</span>
                    </div>
                    
                  
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewTutor(hiredTutor._id)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                    
                    {hiredTutor.hireStatus === 'accepted' && tutorPaymentStatus[hiredTutor._id] && (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleOpenReviewModal(hiredTutor)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Rate & Review
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
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