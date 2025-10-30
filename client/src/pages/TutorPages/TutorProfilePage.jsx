import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { BASE_URL } from '@/config';



import { useAuth } from '../../hooks/useAuth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import {
  User,
  Star,
  MapPin,
  Clock,
  BookOpen,
  ArrowLeft,
  MessageCircle,
  Calendar,
  Award,
  GraduationCap
} from 'lucide-react';
import { useSubject } from '../../hooks/useSubject';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const TutorProfilePage = () => {
  const location = useLocation();
  const tutorId = location.state?.tutorId;
  const studentId = location.state?.studentId;
  const isParentView = location.state?.isParentView;
  const { toast } = useToast();
  const navigate = useNavigate();

  const { getAuthToken, user, fetchWithAuth } = useAuth();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const { subjects, academicLevels } = useSubject();
  const token = getAuthToken();
  const [showHiringDialog, setShowHiringDialog] = useState(false);
  const [hiringData, setHiringData] = useState({ subject: '', academic_level: '', notes: '' });
  const { fetchSubjectRelatedToAcademicLevels, subjectRelatedToAcademicLevels } = useSubject();
  useEffect(() => {
    if (!tutorId) {
      setError("No tutor ID provided");
      setLoading(false);
      return;
    }

    fetchTutorDetails();
  }, [tutorId, studentId, isParentView]);

  const getSubjectById = useCallback((id) => {
    if (!id) return undefined;
    const s = (subjects || []).find(s => s?._id?.toString() === id.toString());
    return s;
  }, [subjects]);

  const getAcademicLevelById = useCallback((id) => {
    if (!id) return undefined;
    const a = (academicLevels || []).find(a => a?._id?.toString() === id.toString());
    return a;
  }, [academicLevels]);

  const fetchTutorDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      // Build URL with proper query parameters
      let url = `${BASE_URL}/api/auth/tutors/${tutorId}`;

      if (isParentView && studentId) {
        url += `?isParentView=true&studentId=${studentId}`;
      }

      const response = await fetchWithAuth(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }, token, (newToken) => localStorage.setItem("authToken", newToken));


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch tutor details');
      }

      const data = await response.json();
      const normalizeList = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) {
          if (value.length === 1 && typeof value[0] === 'string') {
            const str = value[0].trim();
            if (str.startsWith('[')) {
              try {
                const parsed = JSON.parse(str);
                return Array.isArray(parsed) ? parsed : [str];
              } catch {
                return [value[0]];
              }
            }
            return [value[0]];
          }
          return value;
        }
        if (typeof value === 'string') {
          const str = value.trim();
          if (str.startsWith('[')) {
            try {
              const parsed = JSON.parse(str);
              return Array.isArray(parsed) ? parsed : [str];
            } catch {
              return [value];
            }
          }
          return [value];
        }
        return [];
      };

      const parsedTutor = {
        ...data,
        qualifications: Array.isArray(data.qualifications)
          ? data.qualifications
          : data.qualifications?.split(',').map(q => q.trim()) || [],
        subjects: normalizeList(data.subjects),
        academic_levels_taught: normalizeList(data.academic_levels_taught),
      };

      setTutor(parsedTutor);
      // setTutor(data);

      // Fetch reviews after tutor data is loaded
      fetchTutorReviews();
    } catch (error) {
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load tutor profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorReviews = async (page = 1) => {
    if (!tutorId) return;

    try {
      setLoadingReviews(true);
      const response = await fetch(`${BASE_URL}/api/auth/tutor/${tutorId}/reviews?page=${page}&limit=5`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data.reviews || []);
      setReviewsTotal(data.pagination?.total_reviews || 0);
      setReviewsPage(page);
    } catch (error) {
      //console.error('Error fetching reviews:', error);
      // Don't show error toast for reviews, just log it
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      getStudentProfile();
    }
  }, [user]);

  const getStudentProfile = async () => {
    try {
      let response;

      if (isParentView && studentId) {
        // Parent view - fetch student profile using studentId
        response = await fetchWithAuth(`${BASE_URL}/api/auth/student/profile/${studentId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }, token, (newToken) => localStorage.setItem("authToken", newToken));
      } else if (user?._id) {
        // Student view - fetch current user's profile
        response = await fetchWithAuth(`${BASE_URL}/api/auth/student/profile/${user._id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }, token, (newToken) => localStorage.setItem("authToken", newToken));
      } else {
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch student profile');
      }

      const data = await response.json();
      setStudentProfile(data.student);
    } catch (e) {
      //console.error("Error fetching student profile:", e);
      // Don't throw error, just log it
    }
  };



  const handleBookSession = (tutorData) => {
    // Open hiring dialog here with default academic level and fetch related subjects
    if (tutorData?.academic_levels_taught && tutorData.academic_levels_taught.length > 0) {
      const first = tutorData.academic_levels_taught[0];
      // Resolve to an id string if possible
      let resolvedLevelId = null;
      if (first && typeof first === 'object' && first.educationLevel) {
        resolvedLevelId = first.educationLevel;
      } else if (typeof first === 'string') {
        // It might already be an id or a level name
        const byId = (academicLevels || []).find(l => l._id?.toString() === first.toString());
        resolvedLevelId = byId ? byId._id : (academicLevels || []).find(l => l.level === first)?._id;
      }
      setHiringData(prev => ({ ...prev, academic_level: resolvedLevelId || '', subject: '' }));
      if (resolvedLevelId) {
        fetchSubjectRelatedToAcademicLevels([resolvedLevelId]);
      }
    }
    setShowHiringDialog(true);
  };

  const handleHiringSubmit = async () => {
    if (!hiringData.subject || !hiringData.academic_level) {
      toast({ title: 'Error', description: 'Please select subject and academic level', variant: 'destructive' });
      return;
    }
    try {
      setLoading(true);
      const token = getAuthToken();

      let academic_level_id = null;
      if (hiringData.academic_level) {
        const match = (academicLevels || []).find(l => l.level === hiringData.academic_level || l._id === hiringData.academic_level);
        if (match) academic_level_id = match._id;
        else academic_level_id = hiringData.academic_level; // fallback
      }

      const response = await fetchWithAuth(`${BASE_URL}/api/auth/tutors/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutor_user_id: tutor?.user_id?._id,
          student_user_id: user?._id,
          subject: hiringData.subject,
          academic_level_id,
          notes: hiringData.notes || 'Hiring request from student',
          payment_type: 'hourly'
        })
      }, token, (newToken) => localStorage.setItem('authToken', newToken));

      const data = await response.json();
      const status = response.status;
      if (status === 400) {
        toast({ title: 'Warning', description: data.message });
      } else if (status === 200) {
        toast({ title: 'Success', description: data.message });
        setShowHiringDialog(false);
        // Refresh full tutor details and student profile to reflect all changes without manual reload
        try {
          await Promise.all([
            fetchTutorDetails(),
            getStudentProfile()
          ]);
        } catch (_) {
          // ignore refresh errors silently
        }
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to send request', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to hire tutor', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${i <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  const getHiringStatusBadge = (status) => {
    if (!status) return null;

    const statusConfig = {
      'pending': { variant: 'secondary', text: 'Request Pending' },
      'accepted': { variant: 'default', text: 'Hired' },
      'rejected': { variant: 'destructive', text: 'Request Rejected' }
    };

    const config = statusConfig[status] || { variant: 'outline', text: status };

    return (
      <Badge variant={config.variant} className="ml-2">
        {config.text}
      </Badge>
    );
  };

  const formatResponseTime = (minutes) => {
    if (!minutes || minutes === 0) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };



  if (loading) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </>
    );
  }

  if (error || !tutor) {
    return (
      <>

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
              <p className="text-gray-600 mb-4">{error || 'Tutor not found'}</p>
              {isParentView ? (
                <Button onClick={() => navigate(-1)} variant="outline"
                  size="sm"> <ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
              ) : (
                <Button onClick={() => navigate('/student/tutor-search')} variant="outline"
                  size="sm"> <ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                // <Button onClick={() => navigate('/student/tutor-search')}>Go Back</Button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              {isParentView ? (
                <Button onClick={() => navigate(-1)} variant="outline"
                  size="sm"> <ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
              ) : (
                <Button onClick={() => navigate('/student/tutor-search')} variant="outline"
                  size="sm"> <ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
              )}
              {/* <Button
                onClick={() => navigate('/student/tutor-search')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button> */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tutor Profile</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Learn more about this tutor</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {/* <Button onClick={handleContactTutor} variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact
              </Button> */}
              {tutor.hiring_status?.is_hired ? (
                <div className="flex items-center gap-2">
                  {getHiringStatusBadge(tutor.hiring_status.status)}
                  {tutor.hiring_status.status === 'accepted' && (
                    <Button variant="outline" disabled>
                      Already Hired
                    </Button>
                  )}
                  {tutor.hiring_status.status === 'pending' && (
                    <Button variant="outline" disabled>
                      Request Pending
                    </Button>
                  )}
                  {tutor.hiring_status.status === 'rejected' && (
                    <Button onClick={() => handleBookSession(tutor)}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  )}
                </div>
              ) : (
                <Button onClick={() => handleBookSession(tutor)} className="w-full sm:w-auto">
                  <Calendar className="w-4 h-4 mr-2" />
                  Request Tutor
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Info */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Basic Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-row items-start gap-4 sm:gap-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      {tutor.user_id?.photo_url ? (
                        <img
                          src={`${tutor.user_id.photo_url}`}
                          alt="Profile"
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="h-7 w-7 text-white" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row items-start justify-between mb-4">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-words">
                            {tutor.user_id.full_name}
                          </h2>

                            <div className="flex items-center gap-1 mb-2 justify-center">
                              {renderStars(tutor.average_rating)}
                            <span className="text-xs sm:text-sm text-gray-600 ml-2">
                              {tutor.average_rating && (
                                <>  

                                {tutor.average_rating} ({tutor.total_sessions || 0} sessions)
                                </>
                              )}
                              </span>
                            </div>
                        </div>

                        <div className="text-left sm:text-right mt-2 sm:mt-0 w-full sm:w-auto">
                          <p className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
                            £{tutor.min_hourly_rate} - £{tutor.max_hourly_rate}/hr
                          </p>
                          {tutor.experience_years && (
                            <p className="text-xs sm:text-sm text-gray-600">
                              {tutor.experience_years} years experience
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                      {tutor.bio && (
                        <p className="text-gray-700 leading-relaxed break-words">
                          {tutor.bio}
                        </p>
                      )}
                </CardContent>
              </Card>



              {/* Hiring Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Hiring Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{tutor.hiring_statistics?.total_requests || 0}</p>
                      <p className="text-sm text-gray-600">Total Requests</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{tutor.hiring_statistics?.accepted_requests || 0}</p>
                      <p className="text-sm text-gray-600">Accepted</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{tutor.hiring_statistics?.pending_requests || 0}</p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{tutor.hiring_statistics?.rejected_requests || 0}</p>
                      <p className="text-sm text-gray-600">Rejected</p>
                    </div>
                  </div>
                  {tutor.hiring_statistics?.acceptance_rate > 0 && (
                    <div className="mt-3 sm:mt-4 text-center">
                      <p className="text-sm text-gray-600">Acceptance Rate</p>
                      <p className="text-lg font-semibold text-gray-900">{tutor.hiring_statistics.acceptance_rate}%</p>
                    </div>
                  )}
                </CardContent>
              </Card>


              {/* Inquiry Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Inquiry Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{tutor.inquiry_statistics?.total_received || 0}</p>
                      <p className="text-sm text-gray-600">Total Received</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{tutor.inquiry_statistics?.total_replied || 0}</p>
                      <p className="text-sm text-gray-600">Total Replied</p>
                    </div>
                  </div>
                  {tutor.inquiry_statistics?.reply_rate > 0 && (
                    <div className="text-center mb-3 sm:mb-4">
                      <p className="text-sm text-gray-600">Reply Rate</p>
                      <p className="text-lg font-semibold text-gray-900">{tutor.inquiry_statistics.reply_rate}%</p>
                    </div>
                  )}
                  {tutor.inquiry_statistics?.by_status && Object.keys(tutor.inquiry_statistics.by_status).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">By Status:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(tutor.inquiry_statistics.by_status).map(([status, count]) => (
                          <Badge key={status} variant="outline" className="text-xs">
                            {status}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>


              {/* Tutor Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Reviews & Ratings
                    {tutor.average_rating > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {tutor.average_rating.toFixed(1)} ⭐
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingReviews ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-4">
                      {/* Average Rating Summary */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">
                            {tutor.average_rating > 0 ? tutor.average_rating.toFixed(1) : 'N/A'}
                          </div>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${star <= Math.round(tutor.average_rating || 0)
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Based on {reviewsTotal} review{reviewsTotal !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Average rating from students
                          </p>
                        </div>
                      </div>

                      {/* Individual Reviews */}
                      <div className="space-y-3">
                        {reviews.map((review) => (
                          <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${star <= review.rating
                                          ? 'text-yellow-500 fill-current'
                                          : 'text-gray-300'
                                        }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-medium text-gray-700 break-words">
                                  {review.student_name}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {review.review_text && (
                              <p className="text-sm text-gray-600 mt-2 break-words">
                                {review.review_text}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Load More Button */}
                      {reviewsTotal > reviews.length && (
                        <div className="text-center pt-4">
                          <Button
                            variant="outline"
                            onClick={() => fetchTutorReviews(reviewsPage + 1)}
                            disabled={loadingReviews}
                          >
                            {loadingReviews ? 'Loading...' : 'Load More Reviews'}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No Reviews Yet</p>
                      <p className="text-sm">
                        This tutor hasn't received any reviews from students yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Current Hiring Status */}
              {tutor.hiring_status?.is_hired && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Your Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      {getHiringStatusBadge(tutor.hiring_status.status)}
                      {tutor.hiring_status.hired_at && (
                        <p className="text-sm text-gray-600 mt-2">
                          Requested on: {new Date(tutor.hiring_status.hired_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Subjects and Levels */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Subjects & Levels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Subjects Taught</h4>
                      <div className="flex flex-wrap gap-2">
                        {tutor.subjects?.map((subject, index) => {
                          const subjectData = getSubjectById(subject);
                          const subjectName = subjectData?.name || subject || 'Unknown Subject';
                          const subjectType = subjectData?.subject_type?.name || 'Unknown Type';
                          const levelName = subjectData?.level_id?.level || 'Unknown Level';

                          return (
                            <Badge key={index} variant="outline" className="text-xs sm:text-sm break-words">
                              {subjectName} - {subjectType} - {levelName}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Academic Levels</h4>
                      <div className="flex flex-wrap gap-2">
                        {tutor.academic_levels_taught?.map((level, index) => (
                          <Badge key={index} variant="secondary" className="text-xs sm:text-sm break-words">
                            {level}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Qualifications */}
              {tutor.qualifications && tutor.qualifications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Qualifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {tutor.qualifications.map((qualification, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{qualification}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Requested For This Tutor */}
              {studentProfile?.hired_tutors?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tutor is Requested For</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Academic Level</span>
                      <span className="font-semibold">
                        {getAcademicLevelById(studentProfile.hired_tutors[0].academic_level_id)?.level || 'Unknown Level'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Subject</span>
                      <span className="font-semibold">
                        {getSubjectById(studentProfile.hired_tutors[0].subject)?.name || 'Unknown Subject'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}



              {/* Student's Inquiries Summary */}
              {tutor.student_inquiries && tutor.student_inquiries.length > 0 && (
                <Card className="cursor-pointer" onClick={() => navigate(`/student-dashboard?tab=requests`)}   >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Your Inquiries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-3">
                      <p className="text-2xl font-bold text-blue-600">{tutor.student_inquiries.length}</p>
                      <p className="text-sm text-gray-600">Total Inquiries</p>
                    </div>
                    <div className="space-y-2">
                      {tutor.student_inquiries.slice(0, 1).map((inquiry, index) => (
                        <div key={index} className="text-left border-l-2 border-blue-200 pl-2">
                          <p className="text-xs font-medium">{inquiry.subject}</p>
                          <Badge
                            variant={
                              inquiry.status === 'replied' ? 'default' :
                                inquiry.status === 'converted_to_booking' ? 'default' :
                                  inquiry.status === 'pending' ? 'secondary' : 'outline'
                            }
                            className="text-xs mt-1"
                          >
                            {inquiry.status}
                          </Badge>
                        </div>
                      ))}
                      {tutor.student_inquiries.length > 1 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{tutor.student_inquiries.length - 1} more
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Sessions</span>
                    <span className="font-semibold">{tutor.total_sessions || 0}</span>
                  </div>

                  {tutor.experience_years && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Experience</span>
                      <span className="font-semibold">{tutor.experience_years} years</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center gap-1">
                      {tutor.average_rating && (
                        <>
                          {renderStars(tutor.average_rating)}
                        </>
                  )}
                    </div>
                  </div>


                  {tutor.response_statistics?.average_response_time_minutes > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Avg Response</span>
                      <span className="font-semibold">{formatResponseTime(tutor.response_statistics.average_response_time_minutes)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>


              {/* Contact Actions */}
              {/* <Card>
                <CardHeader>
                  <CardTitle>Get Started</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tutor.hiring_status?.is_hired ? (
                    <>
                      {tutor.hiring_status.status === 'accepted' && (
                        <Button variant="outline" className="w-full" disabled>
                          Already Hired
                        </Button>
                      )}
                      {tutor.hiring_status.status === 'pending' && (
                        <Button variant="outline" className="w-full" disabled>
                          Request Pending
                        </Button>
                      )}
                      {tutor.hiring_status.status === 'rejected' && (
                        <Button onClick={() => handleBookSession(tutor)} className="w-full">
                          <Calendar className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button onClick={() => handleBookSession(tutor)} className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Request Tutor
                    </Button>
                  )}
                </CardContent>
              </Card> */}


              {/* Response Time Statistics */}
              {tutor.response_statistics?.total_replied >= 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Response Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Average Response:</span>
                        <span className="font-semibold">{formatResponseTime(tutor.response_statistics.average_response_time_minutes)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Fastest Response:</span>
                        <span className="font-semibold text-green-600">{formatResponseTime(tutor.response_statistics.fastest_response_minutes)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Replied:</span>
                        <span className="font-semibold">{tutor.response_statistics.total_replied}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          </div>
        </div>
      </div>
      {/* Hiring Dialog */}
      <Dialog open={showHiringDialog} onOpenChange={setShowHiringDialog}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Request {tutor?.user_id?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Academic Level Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Level</label>
              {(() => {
                const rawLevels = Array.isArray(tutor?.academic_levels_taught) ? tutor.academic_levels_taught : [];
                // Normalize to {_id, label}
                const options = rawLevels.map((lv) => {
                  if (lv && typeof lv === 'object' && lv.educationLevel) {
                    const l = getAcademicLevelById(lv.educationLevel);
                    return { id: lv.educationLevel, label: l?.level || 'Unknown Level' };
                  }
                  if (typeof lv === 'string') {
                    const byId = getAcademicLevelById(lv);
                    if (byId) return { id: byId._id, label: byId.level };
                    const byName = (academicLevels || []).find(a => a.level === lv);
                    if (byName) return { id: byName._id, label: byName.level };
                    return { id: lv, label: lv };
                  }
                  return null;
                }).filter(Boolean);

                return (
                  <Select
                    value={hiringData.academic_level}
                    onValueChange={(value) => {
                      setHiringData(prev => ({ ...prev, academic_level: value, subject: '' }));
                      if (value) fetchSubjectRelatedToAcademicLevels([value]);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select academic level" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((opt, idx) => (
                        <SelectItem key={idx} value={opt.id}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              })()}
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              {(() => {
                const tutorSubjects = Array.isArray(tutor?.subjects) ? tutor.subjects : [];
                const tutorSubjectIdSet = new Set((tutorSubjects || []).map(s =>
                  typeof s === 'object' ? (s?._id?.toString?.() || s?.toString?.()) : s?.toString?.()
                ).filter(Boolean));
                const filteredByLevel = (subjectRelatedToAcademicLevels || []).filter(s =>
                  hiringData.academic_level && (s?.level_id?._id?.toString?.() === hiringData.academic_level?.toString?.() || s?.level_id?.toString?.() === hiringData.academic_level?.toString?.())
                );
                const subjectOptions = filteredByLevel.filter(s => tutorSubjectIdSet.has(s?._id?.toString?.()));
                return (
                  <Select value={hiringData.subject} onValueChange={(value) => setHiringData(prev => ({ ...prev, subject: value }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectOptions.map((subject) => (
                        <SelectItem key={subject._id} value={subject._id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              })()}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
              <Input
                type="text"
                placeholder="Any specific topics or requirements..."
                value={hiringData.notes}
                onChange={(e) => setHiringData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full"
              />
            </div>

            <Button
              type="button"
              onClick={handleHiringSubmit}
              disabled={!hiringData.subject || !hiringData.academic_level || loading}
              className="w-full py-3"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Calendar className="w-5 h-5 mr-2" />
                  Hire Tutor
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Hiring Dialog UI
// Insert near the end of the component render (before return closing tags) but we append here after component for patch simplicity


export default TutorProfilePage; 