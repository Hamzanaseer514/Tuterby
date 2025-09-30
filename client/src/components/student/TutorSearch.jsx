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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';


const TutorSearch = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getAuthToken, user, fetchWithAuth } = useAuth();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const token = getAuthToken();
  const { subjects, academicLevels, fetchSubjectRelatedToAcademicLevels, subjectRelatedToAcademicLevels } = useSubject();

  // Debug: Log subjects data
  useEffect(() => {

    fetchSubjectRelatedToAcademicLevels(academicLevels.map(level => level._id));
  }, [subjects, academicLevels]);
  // Simple search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);
  // New checkbox state for preferred subjects filter
  const [preferredSubjectsOnly, setPreferredSubjectsOnly] = useState(false);

  // Hiring dialog state
  const [showHiringDialog, setShowHiringDialog] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [hiringData, setHiringData] = useState({
    subject: '',
    academic_level: '',
    notes: ''
  });

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
      getStudentProfile();
      loadAllTutors(); // Load all tutors initially
    }
  }, [user]);

  useEffect(() => {
    if (user && studentProfile) {
      searchTutors();
    }
  }, [currentPage, filters, searchQuery, preferredSubjectsOnly, studentProfile]);


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

  // Helper functions
  const parseField = (field) => {
    if (!field) return [];

    // If it's already array of objects, keep it
    if (Array.isArray(field) && field.every(item => typeof item === "object")) {
      return field;
    }

    // Handle array case like ['["Math","Physics"]']
    if (Array.isArray(field)) {
      if (field.length === 1 && typeof field[0] === "string" && field[0].startsWith("[")) {
        try {
          const parsed = JSON.parse(field[0]);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          // console.warn(`Failed to parse array field: ${field[0]}`, error);
          return [];
        }
      }
      if (field.every(item => typeof item === "string")) {
        return [...new Set(field)];
      }
      return [];
    }

    if (typeof field === "string" && field.startsWith("[")) {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? [...new Set(parsed)] : [];
      } catch (error) {
        // console.warn(`Failed to parse string field: ${field}`, error);
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
    try {
      if (!user?._id) return;

      const response = await fetchWithAuth(`${BASE_URL}/api/auth/student/profile/${user._id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch student profile: ${response.status}`);
      }

      const data = await response.json();
      setStudentProfile(data.student);
    } catch (error) {
      // console.error('Error fetching student profile:', error);
      // Don't show error toast for profile fetch, just log it
    }
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

      // Debug: Log the load all params

      const response = await fetchWithAuth(`${BASE_URL}/api/auth/tutors/search?${params}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // ✅ Fix subjects & academic_levels_taught here
      const cleanedTutors = cleanTutorData(data.tutors || []);
      setTutors(cleanedTutors);
      setTotalPages(data.pagination?.total_pages || 1);
      setCurrentPage(1);
    } catch (error) {
      // console.error('Load all tutors error:', error);
      setError(error.message || 'Failed to load tutors');
      // toast({
      //   title: "Error",
      //   description: error.message || "Failed to load tutors",
      //   variant: "destructive"
      // });
    } finally {
      setLoading(false);
    }
  };


  const searchTutors = async () => {
    try {
      setLoading(true);
      setError(null);
      const authToken = getAuthToken();

      // Validate that we have required data before making the API call
      if (!user?._id) {
        throw new Error('User not authenticated');
      }

      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        user_id: user._id
      });

      // Add filters only if they have values
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          // For subject filter, we need to send it as subject_id, not subject
          // The backend expects subject_id to search by subject ID
          if (key === 'subject') {
            params.append('subject_id', value.trim());
          } else if (key === 'academic_level') {
            // For academic level filter, we need to send it as academic_level
            // The backend expects academic_level to search by academic level ID
            params.append('academic_level', value.trim());
          } else {
            params.append(key, value.trim());
          }
        }
      });

      // Add search query if provided
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      // Add preferred subjects filter if checkbox is checked and student profile exists
      if (preferredSubjectsOnly && studentProfile?.preferred_subjects) {
        params.append('preferred_subjects_only', 'true');
      }


      // Make the search request with the correct parameters
      const response = await fetchWithAuth(`${BASE_URL}/api/auth/tutors/search?${params}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // console.error('Search API error:', errorData);

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // ✅ Fix subjects & academic_levels_taught here too
      const cleanedTutors = cleanTutorData(data.tutors || []);
      setTutors(cleanedTutors);
      setTotalPages(data.pagination?.total_pages || 1);
    } catch (error) {
      // console.error('Search error:', error);
      setError(error.message || 'Failed to search tutors');
      toast({
        title: "Error",
        description: error.message || "Failed to search tutors",
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


  const handleFilterChange = async (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);

    if (key === "academic_level") {
      fetchSubjectRelatedToAcademicLevels([value]);
    }

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
    // Auto-select first academic level when tutor data loads
    if (tutor?.academic_levels_taught && tutor.academic_levels_taught.length > 0) {
      const firstLevel = tutor.academic_levels_taught[0];
      setHiringData(prev => ({
        ...prev,
        academic_level: firstLevel.educationLevel
      }));
    }
    setShowHiringDialog(true);
  };

  const handleHiringSubmit = async () => {
    if (!hiringData.subject || !hiringData.academic_level) {
      toast({
        title: "Error",
        description: "Please select subject and academic level",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();

      // Map academic_level name to ID from global academicLevels
      let academic_level_id = null;
      if (hiringData.academic_level) {
        const match = (academicLevels || []).find(l => l.level === hiringData.academic_level || l._id === hiringData.academic_level);
        if (match) academic_level_id = match._id;
      }

      const response = await fetchWithAuth(`${BASE_URL}/api/auth/tutors/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tutor_user_id: selectedTutor.user_id._id,
          student_user_id: user._id,
          subject: hiringData.subject,
          academic_level_id,
          notes: hiringData.notes || 'Hiring request from student',
          payment_type: 'hourly'
        })
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );

      const data = await response.json();
      const status = response.status;

      if (status === 400) {
        toast({
          title: "Warning",
          description: data.message,
        });
      } else if (status === 200) {
        toast({
          title: "Success",
          description: data.message,
        });
        // Close dialog and refresh the tutors list
        setShowHiringDialog(false);
        searchTutors();
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to hire tutor",
        variant: "destructive"
      });
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
                <p className="text-xs text-gray-500 mt-1">Select an academic level to filter tutors</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <Select
                  value={filters.subject}
                  onValueChange={(value) => handleFilterChange('subject', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectRelatedToAcademicLevels.map((subject) => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.name} - {subject.subjectTypeData?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Select a subject to find tutors who teach it</p>
              </div>




              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Hourly Rate</label>
                <Input
                  type="number"
                  placeholder="e.g., 50"
                  value={filters.max_hourly_rate}
                  onChange={(e) => handleFilterChange('max_hourly_rate', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Maximum hourly rate you're willing to pay</p>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tutor Found</h3>
              {/* <p className="text-gray-600 mb-4">{error}</p> */}

              {/* Helpful error guidance */}
              {error.includes('Cast to ObjectId failed') && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg text-left">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">What to do:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Try using just the search bar above instead of filters</li>
                        <li>Clear all filters and search again</li>
                        <li>Use different search criteria</li>
                        <li>If the problem persists, contact support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-center">
                <Button onClick={loadAllTutors}>Try Again</Button>
                <Button onClick={clearAllFilters} variant="outline">Clear Filters</Button>
              </div>
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
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                        {tutor.user_id?.photo_url ? (
                          <img
                            src={`${BASE_URL}${tutor.user_id.photo_url}`}
                            alt="Profile"
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          <User className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {tutor.user_id?.full_name || 'Unknown Tutor'}
                            </h3>
                           
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              £{tutor.min_hourly_rate || 0} - £{tutor.max_hourly_rate || 0}/hr
                            </p>
                            {tutor.average_rating && typeof tutor.average_rating === 'number' && (
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
                            {tutor.academic_levels_taught?.map((level, index) => {
                              return (
                                <Badge key={index} variant="secondary" className="text-xs">

                                  {typeof level === 'object' ? getAcademicLevelById(level.educationLevel)?.level : level}
                                </Badge>
                              );
                            })}
                            {/* {tutor.academic_levels_taught?.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{tutor.academic_levels_taught.length - 3} more
                              </Badge>
                            )} */}
                          </div>

                          <div className="flex flex-wrap gap-1 mb-2">
                            {tutor.subjects?.map((subject, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {typeof subject === 'object' ? subject.name : (getSubjectById(subject)?.name || subject)}
                              </Badge>
                            ))}
                            {/* {tutor.subjects?.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{tutor.subjects.length - 3} more
                              </Badge>
                            )} */}
                          </div>

                        </div>




                        {tutor.bio && typeof tutor.bio === 'string' && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {tutor.bio}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {typeof tutor.total_sessions === 'number' ? tutor.total_sessions : 0} sessions
                          </div>
                          {tutor.experience_years && typeof tutor.experience_years === 'number' && (
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
                              disabled={loading}
                            >
                              {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Request Tutor
                                </>
                              )}
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

      {/* Hiring Dialog */}
      <Dialog open={showHiringDialog} onOpenChange={setShowHiringDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Request {selectedTutor?.user_id?.full_name}
            </DialogTitle>
          </DialogHeader>

          {selectedTutor && (
            <div className="space-y-6">
              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                {(() => {
                  const tutorSubjects = Array.isArray(selectedTutor?.subjects) ? selectedTutor.subjects : [];
                  const subjectOptions = Array.from(new Set([...(tutorSubjects || [])].filter(Boolean)));
                  return (
                    <Select value={hiringData.subject} onValueChange={(value) => setHiringData(prev => ({ ...prev, subject: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectOptions.map((subject, index) => (
                          <SelectItem key={index} value={subject}>
                            {getSubjectById(subject)?.name || subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                })()}
              </div>

              {/* Academic Level Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Level</label>
                {(() => {
                  const tutorLevels = Array.isArray(selectedTutor?.academic_levels_taught) ? selectedTutor.academic_levels_taught : [];
                  return (
                    <Select
                      value={hiringData.academic_level}
                      onValueChange={(value) => setHiringData(prev => ({ ...prev, academic_level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic level" />
                      </SelectTrigger>
                      <SelectContent>
                        {tutorLevels.map((level, index) => (
                          <SelectItem key={index} value={level.educationLevel}>
                            {getAcademicLevelById(level.educationLevel)?.level}
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

              {/* Submit Button */}
              <Button
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
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default TutorSearch; 