import React, { useState, useEffect } from 'react';
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
import { Avatar } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '../ui/use-toast';
import {
  User,
  Star,
  Clock,
  MapPin,
  BookOpen,
  MessageSquare,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  HelpCircle,
  Plus,
  MessageCircle,
  Search,
  Filter,
  Eye
} from 'lucide-react';

const StudentHelpRequests = () => {
  const { user, getAuthToken } = useAuth();
  const token = getAuthToken();
  const { toast } = useToast();
  
  // Hired tutors state
  const [hiredTutors, setHiredTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parsedSubjects, setParsedSubjects] = useState([]);
  
  // Help request state
  const [submitting, setSubmitting] = useState(false);
  const [helpRequests, setHelpRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showTutorSelection, setShowTutorSelection] = useState(true);
  const [showInquiries, setShowInquiries] = useState(false);
  const [expandedRepliesById, setExpandedRepliesById] = useState({});
  const [tutorToUserMap, setTutorToUserMap] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    academic_level: '',
    description: '',
    preferred_schedule: '',
    urgency_level: 'normal'
  });

  useEffect(() => {
    if (user) {
      fetchHiredTutors();
      fetchHelpRequests();
    }
  }, [user, currentPage]);

  const parseField = (field) => {
    if (!field) return [];

    // Handle array case like ['["Math","Physics"]']
    if (Array.isArray(field)) {
      if (field.length === 1 && typeof field[0] === "string" && field[0].startsWith("[")) {
        try {
          const parsed = JSON.parse(field[0]);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          console.warn(`Failed to parse array field: ${field[0]}`, error);
          return [];
        }
      }
      // If it's already a proper array, return as is
      if (field.every(item => typeof item === "string")) {
        return field;
      }
      return [];
    }

    // Handle string case like "["Math","Physics"]"
    if (typeof field === "string" && field.startsWith("[")) {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.warn(`Failed to parse string field: ${field}`, error);
        return [];
      }
    }

    return [];
  };

  // Clean tutor data to fix array display issues
  const cleanTutorData = (tutors) => {
    return tutors.map((tutor) => {
      const cleaned = {
        ...tutor,
        subjects: parseField(tutor.subjects),
        academic_levels_taught: parseField(tutor.academic_levels_taught),
      };

      return cleaned;
    });
  };

  const fetchHiredTutors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/api/auth/student/${user._id}/hired-tutors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hired tutors');
      }

      const data = await response.json();

      // Filter only accepted tutors
      const acceptedTutors = data.tutors.filter(tutor => 
        tutor.hireStatus === 'accepted' || tutor.status === 'accepted'
      );
      setHiredTutors(cleanTutorData(acceptedTutors));
    } catch (err) {
      console.error('Error fetching hired tutors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHelpRequests = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/student/${user._id}/help-requests?page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch help requests');
      }

      const data = await response.json();
      setHelpRequests(data.inquiries || []);
      setTotalPages(data.pagination?.total_pages || 1);
      setTutorToUserMap(data.tutorToUserMap || {});
    } catch (err) {
      console.error('Error fetching help requests:', err);
      toast({
        title: "Error",
        description: "Failed to fetch help requests",
        variant: "destructive"
      });
    }
  };

  const handleRequestHelp = async (tutorId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/student/${user._id}/request-help`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tutor_id: tutorId,
          subject: 'General Help Request', // You can make this dynamic
          message: 'I need help with my studies. Please let me know when you are available.'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send help request');
      }

      const result = await response.json();
      // Show success message
      toast({
        title: "Success",
        description: result.message || 'Help request sent successfully!',
        variant: "default"
      });
    } catch (err) {
      console.error('Error sending help request:', err);
      toast({
        title: "Error",
        description: 'Failed to send help request: ' + err.message,
        variant: "destructive"
      });
    }
  };

  const handleTutorSelect = (tutor) => {
    setSelectedTutor(tutor);
    setShowTutorSelection(false);
    // Reset form data
    setFormData({
      subject: '',
      academic_level: '',
      description: '',
      preferred_schedule: '',
      urgency_level: 'normal'
    });
  };

  const handleBackToTutorSelection = () => {
    setSelectedTutor(null);
    setShowTutorSelection(true);
    setFormData({
      subject: '',
      academic_level: '',
      description: '',
      preferred_schedule: '',
      urgency_level: 'normal'
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleReplyVisibility = (requestId) => {
    setExpandedRepliesById(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTutor) {
      toast({
        title: "Error",
        description: "Please select a tutor first",
        variant: "destructive"
      });
      return;
    }

    if (!formData.subject || !formData.academic_level || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/student/${user._id}/help-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tutor_id: selectedTutor._id,
          subject: formData.subject,
          description: formData.description,
          academic_level: formData.academic_level,
          preferred_schedule: formData.preferred_schedule,
          urgency_level: formData.urgency_level
        })
      });
      if (!response.ok) {
        throw new Error('Failed to submit help request');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: result.message || 'Help request submitted successfully!',
        variant: "default"
      });

      // Reset form and go back to tutor selection
      handleBackToTutorSelection();
      
      // Refresh help requests
      fetchHelpRequests();
      
    } catch (error) {
      console.error('Error submitting help request:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to submit help request',
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "outline", color: "text-yellow-600", Icon: Clock },
      unread: { variant: "outline", color: "text-gray-600", Icon: Clock },
      read: { variant: "outline", color: "text-blue-600", Icon: Eye },
      replied: { variant: "default", color: "text-green-600", Icon: CheckCircle },
      completed: { variant: "secondary", color: "text-purple-600", Icon: CheckCircle },
      in_progress: { variant: "outline", color: "text-orange-600", Icon: Clock },
      cancelled: { variant: "destructive", color: "text-red-600", Icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.Icon;

    return (
      <Badge variant={config.variant} className={config.color}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      low: { variant: "outline", color: "text-green-600" },
      normal: { variant: "outline", color: "text-blue-600" },
      high: { variant: "outline", color: "text-orange-600" },
      urgent: { variant: "destructive", color: "text-red-600" }
    };

    const config = urgencyConfig[urgency] || urgencyConfig.normal;

    return (
      <Badge variant={config.variant} className={config.color}>
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Tutors</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchHiredTutors}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Hired Tutors & Help Requests</h1>
            <p className="text-gray-600 mt-1">Request help from tutors you've hired and accepted</p>
          </div>
          <Button onClick={() => setShowInquiries(!showInquiries)}>
            {showInquiries ? 'Hide Inquiries' : 'Show Inquiries'}
          </Button>
        </div>

        {/* Help Requests History */}
        {showInquiries && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Your Inquiries & Help Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {helpRequests.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No inquiries or help requests yet</p>
                  <p className="text-sm text-gray-500 mt-1">Submit your first request below</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {helpRequests.map((request) => {
                    // Use the mapping to find the tutor user
                    const tutorUser = tutorToUserMap[request.tutor_id];
                    return (
                      <div key={request._id} className={`p-4 border rounded-lg ${request.type === 'additional_help' ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{request.subject}</h4>
                              <Badge variant={request.type === 'additional_help' ? 'default' : 'secondary'} className="text-xs">
                                {request.type === 'additional_help' ? 'Help Request' : 'Tutor Inquiry'}
                              </Badge>
                            </div>
                            <div className='flex items-center gap-20 text-xs text-gray-500'>
                              <p className="text-sm text-gray-600">{request.academic_level}</p>
                              {request.preferred_schedule && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <Calendar className="w-4 h-4" />
                                  {request.preferred_schedule}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(request.status)}
                            {getUrgencyBadge(request.urgency_level)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <p className="text-sm text-gray-600">
                            {request.description || request.message || 'No description provided'}
                          </p>
                          {request.tutor_id ? (
                            <span className="text-blue-600 font-medium">
                              Assigned to: {tutorUser ? tutorUser.full_name : 'Unknown Tutor'}
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              {request.type === 'additional_help' ? 'Help Request' : 'No specific tutor assigned'}
                            </span>
                          )}
                        </div>

                        {/* Tutor reply toggle for replied requests */}
                        {request.status === 'replied' && (
                          <div className="mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleReplyVisibility(request._id)}
                            >
                              {expandedRepliesById[request._id] ? 'Hide Tutor Reply' : 'View Tutor Reply'}
                            </Button>
                            {expandedRepliesById[request._id] && (
                              <div className="mt-3 p-3 border rounded-md bg-white">
                                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {request.reply_message || 'No reply message available.'}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {showTutorSelection ? (
          /* Tutor Selection Interface */
          <div className="space-y-6">
            {/* Hired Tutors Grid */}
            {hiredTutors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hiredTutors.map((tutor) => (
                  <Card key={tutor._id || tutor.tutor_id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                          <div className="h-full w-full bg-blue-100 flex items-center justify-center">
                            <User className="h-8 w-8 text-blue-600" />
                          </div>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {tutor.full_name || tutor.user_id?.full_name || 'Tutor Name'}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(tutor.hireStatus || tutor.status)}>
                              {getStatusIcon(tutor.hireStatus || tutor.status)}
                              <span className="ml-1 capitalize">
                                {tutor.hireStatus || tutor.status}
                              </span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <p>{tutor.rating ? tutor.rating : 0.0}/5</p>
                        </div>
                    

                      {/* Subjects */}
                      {tutor.subjects && tutor.subjects.length > 0 && (
                        <div>
                          {/* <h4 className="text-sm font-medium text-gray-700 mb-2">Teaching Subjects:</h4> */}
                          <div className="flex flex-wrap gap-2">
                            {tutor.subjects.map((subject, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Location */}
                      {tutor.location && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 blur-sm">
                          <MapPin className="h-4 w-4" />
                          <span>{tutor.location}</span>
                        </div>
                      )}

                      {/* Experience */}
                      {tutor.experience && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <BookOpen className="h-4 w-4" />
                          <span>{tutor.experience} years experience</span>
                        </div>
                      )}

                      {/* Hired Date */}
                      {tutor.hired_at && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Hired on {new Date(tutor.hired_at).toLocaleDateString()}</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-4">
                        <Button
                          onClick={() => handleTutorSelect(tutor)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Request Help
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleRequestHelp(tutor._id || tutor.tutor_id)}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Hired Tutors Yet</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't hired any tutors yet, or none have accepted your offers.
                  </p>
                  <Button onClick={() => window.location.href = '/student/tutor-search'}>
                    Find Tutors
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Help Request Form */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Request Help from {selectedTutor?.full_name || selectedTutor?.user_id?.full_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <Input
                        placeholder="Enter subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Level *
                      </label>
                      <Input
                        placeholder="Enter academic level"
                        value={formData.academic_level}
                        onChange={(e) => handleInputChange('academic_level', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <Textarea
                      placeholder="Describe what you need help with, specific topics, exam preparation, etc."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Schedule
                      </label>
                      <Input
                        placeholder="e.g., Weekdays after 6 PM, Weekends"
                        value={formData.preferred_schedule}
                        onChange={(e) => handleInputChange('preferred_schedule', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency Level
                      </label>
                      <Select
                        value={formData.urgency_level}
                        onValueChange={(value) => handleInputChange('urgency_level', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - Flexible timing</SelectItem>
                          <SelectItem value="normal">Normal - Within a few weeks</SelectItem>
                          <SelectItem value="high">High - Within a week</SelectItem>
                          <SelectItem value="urgent">Urgent - ASAP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBackToTutorSelection}
                      className="flex-1"
                    >
                      Back to Tutors
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Request Help
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Select a Tutor</h4>
                <p className="text-sm text-gray-600">
                  Choose from tutors you've hired and who have accepted your offers
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Submit Request</h4>
                <p className="text-sm text-gray-600">
                  Fill out the form with your specific requirements and preferences
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Start Learning</h4>
                <p className="text-sm text-gray-600">
                  Begin your tutoring sessions and track your progress
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentHelpRequests;