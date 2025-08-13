import React, { useState, useEffect } from 'react';
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

const TutorProfilePage = () => {
  const location = useLocation();
  const tutorId = location.state?.tutorId;
  const { toast } = useToast();
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [bookingData, setBookingData] = useState({
    subject: '',
    // session_date: '',
    duration_hours: 1,
    notes: ''
  });
  const navigate = useNavigate();
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { getAuthToken, user } = useAuth();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tutorId) {
      setError("No tutor ID provided");
      setLoading(false);
      return;
    }

    fetchTutorDetails();
  }, [tutorId]);

  const fetchTutorDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      const response = await fetch(`${BASE_URL}/api/auth/tutors/${tutorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tutor details');
      }

      const data = await response.json();
      const parsedTutor = {
        ...data,
        qualifications: Array.isArray(data.qualifications)
          ? data.qualifications
          : data.qualifications?.split(',').map(q => q.trim()) || [],
        subjects: Array.isArray(data.subjects)
        ? (
            typeof data.subjects[0] === 'string' && data.subjects.length === 1
              ? JSON.parse(data.subjects[0]) // case where it's ["[\"Math\",...]"]
              : data.subjects
          )
        : [],
    
      academic_levels_taught: Array.isArray(data.academic_levels_taught)
        ? (
            typeof data.academic_levels_taught[0] === 'string' && data.academic_levels_taught.length === 1
              ? JSON.parse(data.academic_levels_taught[0])
              : data.academic_levels_taught
          )
        : [],
      };

      setTutor(parsedTutor);
      // setTutor(data);
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

  const handleContactTutor = () => {
    navigate(`/student/request-help`, {
      state: { selectedTutor: tutor }
    });
  };

  const handleBookSession = (tutor) => {
    setSelectedTutor(tutor);
    setBookingData({
      subject: '',
      // session_date: '',
      duration_hours: 1,
      notes: ''
    });
    setShowBookingModal(true);
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

  const handleHireTutorSubmit = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/api/auth/tutors/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tutor_user_id: selectedTutor.user_id._id,
          student_user_id: user._id,
          subject: bookingData.subject,
          // session_date: bookingData.session_date,
          duration_hours: bookingData.duration_hours,
          hourly_rate: selectedTutor.hourly_rate,
          notes: bookingData.notes
        })
      });


      const data = await response.json();
      const status = response.status;
      if(status === 400){
        toast({
          title: "Warning",
          description: "Tutor already hired!",
        });
      }
      else if(status === 200){
      toast({
        title: "Success",
        description: "Tutor hired successfully!",
      });
    }
      setShowBookingModal(false);
      setSelectedTutor(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to hire tutor",
        variant: "destructive"
      });
    }
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
              <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tutor Profile</h1>
                <p className="text-gray-600 mt-1">Learn more about this tutor</p>
              </div>
            </div>
            <div className="flex gap-2">
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
              <Button onClick={() => handleBookSession(tutor)}>
                <Calendar className="w-4 h-4 mr-2" />
                Hire Tutor
              </Button>
              )}
            </div>
          </div>
          {showBookingModal && selectedTutor && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Hire Tutor {selectedTutor.user_id.full_name}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBookingModal(false)}
                  >
                    ×
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <select
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={bookingData.subject}
                      onChange={(e) => setBookingData(prev => ({ ...prev, subject: e.target.value }))}
                    >
                      <option value="">Select subject</option>
                      {selectedTutor.subjects?.map((subject, index) => (
                        <option key={index} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Date & Time</label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={bookingData.session_date}
                      onChange={(e) => setBookingData(prev => ({ ...prev, session_date: e.target.value }))}
                    />
                  </div> */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                    <select
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={bookingData.duration_hours.toString()}
                      onChange={(e) => setBookingData(prev => ({ ...prev, duration_hours: parseFloat(e.target.value) }))}
                    >
                      <option value="0.5">30 minutes</option>
                      <option value="1">1 hour</option>
                      <option value="1.5">1.5 hours</option>
                      <option value="2">2 hours</option>
                      <option value="3">3 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                    <input
                      type="text"
                      placeholder="Any specific topics or requirements..."
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={bookingData.notes}
                      onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Total Cost:</strong> £{(selectedTutor.hourly_rate * bookingData.duration_hours).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowBookingModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleHireTutorSubmit}
                      className="flex-1"
                      disabled={!bookingData.subject}
                    >
                      Hire Tutor
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {tutor.user_id.full_name}
                          </h2>
                          {tutor.location && (
                            <div className="flex items-center gap-1 text-gray-600 mb-2 blur-sm">
                              <MapPin className="w-4 h-4" />
                              {tutor.location}
                            </div>
                          )}
                          {tutor.average_rating && (
                            <div className="flex items-center gap-1 mb-2">
                              {renderStars(tutor.average_rating)}
                              <span className="text-sm text-gray-600 ml-2">
                                {tutor.average_rating} ({tutor.total_sessions || 0} sessions)
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-3xl font-bold text-gray-900">
                            £{tutor.hourly_rate}/hr
                          </p>
                          {tutor.experience_years && (
                            <p className="text-sm text-gray-600">
                              {tutor.experience_years} years experience
                            </p>
                          )}
                        </div>
                      </div>

                      {tutor.bio && (
                        <p className="text-gray-700 leading-relaxed">
                          {tutor.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                        {tutor.subjects?.map((subject, index) => (
                          <Badge key={index} variant="outline">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Academic Levels</h4>
                      <div className="flex flex-wrap gap-2">
                        {tutor.academic_levels_taught?.map((level, index) => (
                          <Badge key={index} variant="secondary">
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

              {/* Hiring Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Hiring Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">Acceptance Rate</p>
                      <p className="text-lg font-semibold text-gray-900">{tutor.hiring_statistics.acceptance_rate}%</p>
                    </div>
                  )}
                </CardContent>
              </Card>

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

              {/* Inquiry Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Inquiry Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
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
                    <div className="text-center mb-4">
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

              {/* Student's Inquiries to This Tutor */}
              {tutor.student_inquiries && tutor.student_inquiries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Your Inquiries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tutor.student_inquiries.map((inquiry, index) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-sm">{inquiry.subject} - {inquiry.academic_level}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(inquiry.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge 
                              variant={
                                inquiry.status === 'replied' ? 'default' : 
                                inquiry.status === 'converted_to_booking' ? 'default' :
                                inquiry.status === 'pending' ? 'secondary' : 'outline'
                              } 
                              className="text-xs"
                            >
                              {inquiry.status}
                            </Badge>
                          </div>
                          {inquiry.description && (
                            <p className="text-sm text-gray-600 mb-2">{inquiry.description}</p>
                          )}
                          {inquiry.reply_message && (
                            <div className="bg-gray-50 p-2 rounded text-sm">
                              <p className="font-medium text-gray-700 mb-1">Tutor's Reply:</p>
                              <p className="text-gray-600">{inquiry.reply_message}</p>
                              {inquiry.replied_at && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Replied on: {new Date(inquiry.replied_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}
                          {inquiry.response_time_minutes && inquiry.response_time_minutes > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Responded in: {formatResponseTime(inquiry.response_time_minutes)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Inquiries */}
              {tutor.recent_inquiries && tutor.recent_inquiries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Recent Inquiries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tutor.recent_inquiries.slice(0, 3).map((inquiry, index) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{inquiry.subject} - {inquiry.academic_level}</p>
                              <p className="text-xs text-gray-500">{inquiry.student_name}</p>
                            </div>
                            <Badge variant={inquiry.status === 'replied' ? 'default' : 'secondary'} className="text-xs">
                              {inquiry.status}
                            </Badge>
                          </div>
                          {inquiry.response_time_minutes && (
                            <p className="text-xs text-gray-500 mt-1">
                              Responded in: {formatResponseTime(inquiry.response_time_minutes)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Teaching Approach */}
              {tutor.teaching_approach && (
                <Card>
                  <CardHeader>
                    <CardTitle>Teaching Approach</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {tutor.teaching_approach}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
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

              {/* Student's Inquiries Summary */}
              {tutor.student_inquiries && tutor.student_inquiries.length > 0 && (
                <Card>
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
                      {tutor.student_inquiries.slice(0, 2).map((inquiry, index) => (
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
                      {tutor.student_inquiries.length > 2 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{tutor.student_inquiries.length - 2} more
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
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

                  {tutor.average_rating && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rating</span>
                      <div className="flex items-center gap-1">
                        {renderStars(tutor.average_rating)}
                        <span className="font-semibold ml-1">{tutor.average_rating}</span>
                      </div>
                    </div>
                  )}

                  {tutor.response_statistics?.average_response_time_minutes > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Avg Response</span>
                      <span className="font-semibold">{formatResponseTime(tutor.response_statistics.average_response_time_minutes)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

        
              {/* Contact Actions */}
              <Card>
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
                    Hire Tutor
                  </Button>
                  )}
                  {/* <Button onClick={handleContactTutor} variant="outline" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button> */}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorProfilePage; 