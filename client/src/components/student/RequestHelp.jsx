import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '../ui/use-toast';
import {
  HelpCircle,
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Plus,
  Calendar,
  User,
  MapPin,
  Star,
  Search,
  Filter,
  Eye,
  MessageCircle,
  BookOpen
} from 'lucide-react';

const RequestHelp = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { getAuthToken, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [helpRequests, setHelpRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [tutor_name, setTutorName] = useState([]);
  const [tutorsLoading, setTutorsLoading] = useState(false);
  const [showTutorSelection, setShowTutorSelection] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInquiries, setShowInquiries] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    academic_level: '',
    location: '',
    min_rating: '',
    max_hourly_rate: ''
  });

  // Track which requests have their tutor reply expanded
  const [expandedRepliesById, setExpandedRepliesById] = useState({});

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
      fetchHelpRequests();
      loadTutors();
    }
  }, [user, currentPage]);

  useEffect(() => {
    // Check if we have a selected tutor from the tutor search
    if (location.state?.selectedTutor) {
      setSelectedTutor(location.state.selectedTutor);
      setShowTutorSelection(false);
      // Pre-fill form with tutor's subjects
      if (location.state.selectedTutor.subjects?.length > 0) {
        setFormData(prev => ({
          ...prev,
          subject: location.state.selectedTutor.subjects[0]
        }));
      }
    }
  }, [location.state]);

  const loadTutors = async () => {
    try {
      setTutorsLoading(true);
      const token = getAuthToken();

      const params = new URLSearchParams({
        page: 1,
        limit: 20
      });

      const response = await fetch(`${BASE_URL}/api/auth/tutors/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load tutors');
      }

      const data = await response.json();
      setTutors(data.tutors);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tutors",
        variant: "destructive"
      });
    } finally {
      setTutorsLoading(false);
    }
  };

  const searchTutors = async () => {
    try {
      setTutorsLoading(true);
      const token = getAuthToken();

      const params = new URLSearchParams({
        page: 1,
        limit: 20,
        ...filters
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`${BASE_URL}/api/auth/tutors/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search tutors');
      }

      const data = await response.json();
      setTutors(data.tutors);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search tutors",
        variant: "destructive"
      });
    } finally {
      setTutorsLoading(false);
    }
  };

  const handleTutorSelect = (tutor) => {
    setSelectedTutor(tutor);
    setShowTutorSelection(false);
    // Pre-fill form with tutor's subjects
    if (tutor.subjects?.length > 0) {
      setFormData(prev => ({
        ...prev,
        subject: tutor.subjects[0]
      }));
    }
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

  const fetchHelpRequests = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
      });
      const response = await fetch(
        `${BASE_URL}/api/auth/student/${user?._id}/help-requests?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );


      if (!response.ok) {
        throw new Error('Failed to fetch help requests');
      }

      const data = await response.json();
      setHelpRequests(data.inquiries);
      setTutorName(data.tutors);
      setTotalPages(data.pagination.total_pages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load help requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = getAuthToken();

      const requestData = {
        ...formData,
        tutor_id: selectedTutor._id
      };

      const response = await fetch(`${BASE_URL}/api/auth/student/${user?._id}/help-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit help request');
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: `Help request submitted to ${selectedTutor.user_id.full_name}`,
        variant: "default"
      });

      // Reset form and go back to tutor selection
      setFormData({
        subject: '',
        academic_level: '',
        description: '',
        preferred_schedule: '',
        urgency_level: 'normal'
      });
      setSelectedTutor(null);
      setShowTutorSelection(true);

      // Refresh help requests
      fetchHelpRequests();

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit help request",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "secondary", icon: Clock, color: "text-yellow-600" },
      in_progress: { variant: "default", icon: AlertCircle, color: "text-blue-600" },
      completed: { variant: "default", icon: CheckCircle, color: "text-green-600" },
      cancelled: { variant: "destructive", icon: AlertCircle, color: "text-red-600" }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Request Additional Help</h1>
          <p className="text-gray-600 mt-1">
            {showTutorSelection ? 'Select a tutor to request help from' : 'Submit your help request'}
          </p>
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
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : helpRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No inquiries or help requests yet</p>
                    <p className="text-sm text-gray-500 mt-1">Submit your first request above</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {helpRequests.map((request) => {
                      const tutor = tutors.find(t => t._id === request.tutor_id);
                      return (
                      <div key={request._id} className={`p-4 border rounded-lg ${request.type === 'tutor_inquiry' ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'
                        }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{request.subject}</h4>
                              <Badge variant={request.type === 'tutor_inquiry' ? 'default' : 'secondary'} className="text-xs">
                                {request.type === 'tutor_inquiry' ? 'Tutor Inquiry' : 'Help Request'}
                              </Badge>
                            </div>
                            <div className='flex items-center justify-start gap-8'>
                              <p className="text-sm text-gray-600">{request.academic_level}</p>
                              {request.preferred_schedule && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
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
                          <p className="text-sm text-gray-600 ">
                            {request.description}
                          </p>
                          {request.tutor_id ? (
                            <span className="text-blue-600 font-medium">
                              Assigned to: {tutor.user_id.full_name}
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              {request.type === 'tutor_inquiry' ? 'General inquiry' : 'No specific tutor assigned'}
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
                    )})}

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
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Find a Tutor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by tutor name or subject..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={searchTutors} disabled={tutorsLoading}>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <Input
                      placeholder="e.g., Mathematics, Physics"
                      value={filters.subject}
                      onChange={(e) => handleFilterChange('subject', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Academic Level</label>
                    <Select value={filters.academic_level} onValueChange={(value) => handleFilterChange('academic_level', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GCSE">GCSE</SelectItem>
                        <SelectItem value="A-Level">A-Level</SelectItem>
                        <SelectItem value="IB">IB</SelectItem>
                        <SelectItem value="BTEC">BTEC</SelectItem>
                        <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <Input
                      placeholder="e.g., London, Manchester"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tutors List */}
          <Card>
            <CardHeader>
              <CardTitle>Available Tutors</CardTitle>
            </CardHeader>
            <CardContent>
              {tutorsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : tutors.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No tutors found</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your search criteria</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tutors.map((tutor) => (
                    <Card key={tutor._id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleTutorSelect(tutor)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">{tutor.user_id.full_name}</h3>
                                {tutor.location && (
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    {tutor.location}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">£{tutor.hourly_rate}/hr</p>
                                {tutor.average_rating && (
                                  <div className="flex items-center gap-1 mt-1">
                                    {renderStars(tutor.average_rating)}
                                    <span className="text-sm text-gray-600">({tutor.average_rating})</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="mb-3">
                              <div className="flex flex-wrap gap-1 mb-2">
                                {tutor.subjects?.slice(0, 3).map((subject, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {subject}
                                  </Badge>
                                ))}
                                {tutor.subjects?.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{tutor.subjects.length - 3} more
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {tutor.academic_levels_taught?.slice(0, 2).map((level, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {level}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {tutor.bio && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {tutor.bio}
                              </p>
                            )}

                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {tutor.total_sessions || 0} sessions
                              </div>
                              {tutor.experience_years && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {tutor.experience_years} years
                                </div>
                              )}
                            </div>

                            <Button className="w-full" size="sm">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Select This Tutor
                            </Button>
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
      ) : (
        /* Request Form Interface */
        <div className="space-y-6">
          {/* Selected Tutor Info */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{selectedTutor.user_id.full_name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {selectedTutor.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedTutor.location}
                      </div>
                    )}
                    {selectedTutor.average_rating && (
                      <div className="flex items-center gap-1">
                        {renderStars(selectedTutor.average_rating)}
                        <span>({selectedTutor.average_rating})</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span>£{selectedTutor.hourly_rate}/hr</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedTutor.subjects?.slice(0, 3).map((subject, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToTutorSelection}
                >
                  Change Tutor
                </Button>
              </div>
            </CardContent>
          </Card>


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
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : helpRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No inquiries or help requests yet</p>
                    <p className="text-sm text-gray-500 mt-1">Submit your first request above</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {helpRequests.map((request) => {
                      const tutor = tutors.find(t => t._id === request.tutor_id);
                      return (
                      <div key={request._id} className={`p-4 border rounded-lg ${request.type === 'tutor_inquiry' ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'
                        }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{request.subject}</h4>
                              <Badge variant={request.type === 'tutor_inquiry' ? 'default' : 'secondary'} className="text-xs">
                                {request.type === 'tutor_inquiry' ? 'Tutor Inquiry' : 'Help Request'}
                              </Badge>
                            </div>
                            <div className='flex items-center justify-start gap-8'>
                              <p className="text-sm text-gray-600">{request.academic_level}</p>
                              {request.preferred_schedule && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
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
                          <p className="text-sm text-gray-600 ">
                            {request.description}
                          </p>
                          {request.tutor_id ? (
                            <span className="text-blue-600 font-medium">
                              Assigned to: {tutor.user_id.full_name}
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              {request.type === 'tutor_inquiry' ? 'General inquiry' : 'No specific tutor assigned'}
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
                    )})}

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

          <div className="">
            {/* Request Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Request Help from {selectedTutor.user_id.full_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedTutor.subjects?.map((subject, index) => (
                          <SelectItem key={index} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Level *
                    </label>
                    <Select
                      value={formData.academic_level}
                      onValueChange={(value) => handleInputChange('academic_level', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GCSE">GCSE</SelectItem>
                        <SelectItem value="A-Level">A-Level</SelectItem>
                        <SelectItem value="IB">IB</SelectItem>
                        <SelectItem value="BTEC">BTEC</SelectItem>
                        <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                        <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <Button
                    type="submit"
                    className="w-[50%] mx-auto flex justify-center items-center mt-10"
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
                        Request Help from {selectedTutor.user_id.full_name}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
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
                Browse and choose from qualified tutors based on your needs
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
  );
};

export default RequestHelp;

