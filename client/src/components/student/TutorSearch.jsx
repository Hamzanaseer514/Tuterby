import React, { useState, useEffect } from 'react';
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
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '../ui/use-toast';
import {
  Search,
  Star,
  MapPin,
  Clock,
  User,
  BookOpen,
  Filter,
  ArrowLeft,
  Eye,
  MessageCircle,
  Calendar,
  Plus,
  HelpCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useSubject } from '../../hooks/useSubject';

const TutorSearch = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getAuthToken, user } = useAuth();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [bookingData, setBookingData] = useState({
    subject: '',
    // session_date: '',
    duration_hours: 1,
    notes: '',
    academic_level: ''
  });
  const { subjects, academicLevels } = useSubject();
  // Simple search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);
  // New checkbox state for preferred subjects filter
  const [preferredSubjectsOnly, setPreferredSubjectsOnly] = useState(false);

  // Advanced filters
  const [filters, setFilters] = useState({
    subject: '',
    academic_level: '',
    location: '',
    min_rating: '',
    max_hourly_rate: ''
  });

  useEffect(() => {
    if (user) {
      loadAllTutors();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      getStudentProfile();
      searchTutors();
    }
  }, [currentPage, filters, searchQuery, preferredSubjectsOnly]);

  // Helper functions
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

  const getStudentProfile = async () => {
    const response = await fetch(`${BASE_URL}/api/auth/student/profile/${user._id}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    setStudentProfile(data.student)
    console.log("studentProfile", data.student)
  }
  // Inside your loadAllTutors function
  const loadAllTutors = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      const params = new URLSearchParams({
        page: 1,
        limit: 12,
        user_id: user._id
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

      // ✅ Fix subjects & academic_levels_taught here
      const cleanedTutors = cleanTutorData(data.tutors);

      setTutors(cleanedTutors);
      setTotalPages(data.pagination.total_pages);
      setCurrentPage(1);
    } catch (error) {
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load tutors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  const searchTutors = async () => {
    try {
      setLoading(true);
      setError(null);
      const authToken = getAuthToken();

      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...filters
      });

      // Add search query if provided
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      // Add preferred subjects filter if checkbox is checked
      if (preferredSubjectsOnly && studentProfile.preferred_subjects) {
        params.append('preferred_subjects_only', 'true');
      }

      const response = await fetch(`${BASE_URL}/api/auth/tutors/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search tutors');
      }

      const data = await response.json();

      // ✅ Fix subjects & academic_levels_taught here too
      const cleanedTutors = cleanTutorData(data.tutors);
      setTutors(cleanedTutors);
      setTotalPages(data.pagination.total_pages);
    } catch (error) {
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to search tutors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setPreferredSubjectsOnly(false);
    setFilters({
      subject: '',
      academic_level: '',
      location: '',
      min_rating: '',
      max_hourly_rate: ''
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewTutor = (tutorId) => {
    navigate(`/tutor`, {
      state: { tutorId: tutorId }
    });

  };


  const handleHireTutor = (tutor) => {
    setSelectedTutor(tutor);
    setBookingData({
      subject: '',
      // session_date: '',
      duration_hours: 1,
      notes: '',
      academic_level: ''
    });
    setShowBookingModal(true);
  };



  const handleHireTutorSubmit = async () => {
    try {
      const token = getAuthToken();
      // Try to resolve academic_level_id by matching the label in global academicLevels
      let academic_level_id = null;
      if (bookingData.academic_level) {
        const match = (academicLevels || []).find(l => l.level === bookingData.academic_level || l._id === bookingData.academic_level);
        if (match) academic_level_id = match._id;
      }
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
          academic_level_id,
          notes: bookingData.notes
        })
      });


      const data = await response.json();
      const status = response.status;
      if (status === 400) {
        toast({
          title: "Warning",
          description: data.message,
        });
      }
      else if (status === 200) {
        toast({
          title: "Success",
          description: data.message,
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

  if (loading && tutors.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate(`/student-dashboard`)}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Tutors</h1>
            <p className="text-gray-600 mt-1">Browse and connect with qualified tutors</p>
          </div>
        </div>
      </div>

      {/* Simple Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by tutor name or subject..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showAdvancedFilters ? 'Hide' : 'Show'} Filters
            </Button>
            {(searchQuery || Object.values(filters).some(v => v) || preferredSubjectsOnly) && (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
          
          {/* Preferred Subjects Filter Checkbox */}
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="preferred-subjects"
              checked={preferredSubjectsOnly}
              onCheckedChange={setPreferredSubjectsOnly}
            />
            <label
              htmlFor="preferred-subjects"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show only tutors who teach my preferred subjects
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Search Filters */}
      {showAdvancedFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <Select value={filters.subject} onValueChange={(value) => handleFilterChange('subject', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Level</label>
                <Select value={filters.academic_level} onValueChange={(value) => handleFilterChange('academic_level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicLevels.map((level) => (
                      <SelectItem key={level._id} value={level._id}>
                        {level.level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Hourly Rate</label>
                <Input
                  type="number"
                  placeholder="e.g., 50"
                  value={filters.max_hourly_rate}
                  onChange={(e) => handleFilterChange('max_hourly_rate', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        {error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Results</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={loadAllTutors}>Try Again</Button>
            </CardContent>
          </Card>
        ) : tutors.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || Object.values(filters).some(v => v) ? 'No tutors found' : 'Loading tutors...'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || Object.values(filters).some(v => v)
                  ? 'Try adjusting your search filters or broadening your criteria'
                  : 'Please wait while we load all available tutors...'
                }
              </p>
              {(searchQuery || Object.values(filters).some(v => v)) && (
                <Button onClick={clearAllFilters}>Show All Tutors</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Found {tutors.length} tutor{tutors.length !== 1 ? 's' : ''}
                {(searchQuery || Object.values(filters).some(v => v)) && (
                  <span className="ml-2">
                    (filtered results)
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tutors.map((tutor) => (
                <Card key={tutor._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-blue-600" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {tutor.user_id.full_name}
                            </h3>
                            {tutor.location && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 blur-sm">
                                <MapPin className="w-4 h-4" />
                                {tutor.location}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              £{tutor.min_hourly_rate} - £{tutor.max_hourly_rate}/hr
                              </p>
                              {tutor.average_rating && (
                              <div className="flex items-center gap-1 mt-1">
                                {renderStars(tutor.average_rating)}
                                <span className="text-sm text-gray-600 ml-1">
                                  ({tutor.average_rating})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mb-3">

                          <div className="flex flex-wrap gap-1 mb-3">
                            {tutor.academic_levels_taught?.map((level, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {level}
                              </Badge>
                            ))}
                            {/* {tutor.academic_levels_taught?.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{tutor.academic_levels_taught.length - 3} more
                              </Badge>
                            )} */}
                          </div>

                          <div className="flex flex-wrap gap-1 mb-2">
                            {tutor.subjects?.map((subject, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                            {/* {tutor.subjects?.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{tutor.subjects.length - 3} more
                              </Badge>
                            )} */}
                          </div>

                        </div>




                        {tutor.bio && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {tutor.bio}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
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

                        <div className="flex gap-2">
                        {tutor.hire_status === "accepted" ? (
                          <Button
                            // onClick={() => handleHireTutor(tutor)}
                            size="sm"
                            className="flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Hired
                          </Button>
                        ) : tutor.hire_status === "pending" ? (
                          <Button
                            size="sm"
                            className="flex-1"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Pending
                          </Button>
                          ) : (
                          <Button
                          onClick={() => handleHireTutor(tutor)}
                          size="sm"
                          className="flex-1"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Hire Tutor
                        </Button>
                        )}
                        <Button
                            onClick={() => handleViewTutor(tutor._id)}
                            variant="outline"
                            size="sm"
                            
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </Button>
                        </div>

                      
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
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
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedTutor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Book Session with {selectedTutor.user_id.full_name}</h3>
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
                {(() => {
                  const tutorSubjects = Array.isArray(selectedTutor?.subjects) ? selectedTutor.subjects : [];
                  const studentSubjects = Array.isArray(studentProfile?.preferred_subjects) ? studentProfile.preferred_subjects : [];
                  const subjectOptions = Array.from(new Set([...(tutorSubjects || []), ...(studentSubjects || [])].filter(Boolean)));
                  return (
                    <Select value={bookingData.subject} onValueChange={(value) => setBookingData(prev => ({ ...prev, subject: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectOptions.map((subject, index) => (
                          <SelectItem key={index} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                })()}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Level</label>
                {(() => {
                  const tutorLevels = Array.isArray(selectedTutor?.academic_levels_taught) ? selectedTutor.academic_levels_taught : [];
                  const studentLevels = Array.isArray(studentProfile?.academic_level) ? studentProfile.academic_level : [];
                  const levelOptions = Array.from(new Set([...(tutorLevels || []), ...(studentLevels || [])].filter(Boolean)));
                  return (
                    <Select value={bookingData.academic_level} onValueChange={(value) => setBookingData(prev => ({ ...prev, academic_level: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic level" />
                      </SelectTrigger>
                      <SelectContent>
                        {levelOptions.map((level, index) => (
                          <SelectItem key={index} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                })()}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                <Input
                  placeholder="Any specific topics or requirements..."
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                />
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
                  disabled={!bookingData.subject || !bookingData.academic_level}
                >
                  Hire Tutor
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorSearch; 