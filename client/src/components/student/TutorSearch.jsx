import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Slider, Typography } from '@mui/material';

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
  const [searchCache, setSearchCache] = useState(new Map()); // Cache for search results
  const token = getAuthToken();
  const { subjects, academicLevels, fetchSubjectRelatedToAcademicLevels, subjectRelatedToAcademicLevels } = useSubject();

  // Debug: Log subjects data
  useEffect(() => {
    fetchSubjectRelatedToAcademicLevels(academicLevels.map(level => level._id));
  }, [subjects, academicLevels]);

  // Simple search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const searchDebounceRef = useRef(null);
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
  // Track pending requests locally so refreshes don't drop the state
  const [pendingTutorIds, setPendingTutorIds] = useState(new Set());

  // Advanced filters
  const [filters, setFilters] = useState({
    subject: '',
    academic_level: '',
    location: '',
    min_rating: '',
    min_price: 0,
    max_price: 100
  });
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      getStudentProfile();
      loadAllTutors(); // Load all tutors initially
    }
  }, [user]);

  const skipNextSearchRef = useRef(false);

  useEffect(() => {
    if (!user || !studentProfile) return;
    if (skipNextSearchRef.current) {
      // Skip one automatic search after an intentional clear
      skipNextSearchRef.current = false;
      return;
    }
    searchTutors();
  }, [filters, searchQuery, preferredSubjectsOnly, studentProfile]);

  // Trigger search when page changes
  useEffect(() => {
    if (!user || !studentProfile) return;
    if (!initialLoaded) return;
    searchTutors();
  }, [currentPage, initialLoaded, user, studentProfile]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

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
      }, token, (newToken) => localStorage.setItem("authToken", newToken)
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch student profile: ${response.status}`);
      }

      const data = await response.json();
      setStudentProfile(data.student);
    } catch (error) {
      // Don't show error toast for profile fetch, just log it
    }
  }

  const loadAllTutors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      // Check cache for initial load
      const cacheKey = JSON.stringify({
        page: 1,
        filters: {},
        searchQuery: '',
        preferredSubjectsOnly: false,
        user_id: user._id
      });

      if (searchCache.has(cacheKey)) {
        const cachedData = searchCache.get(cacheKey);
        setTutors(cachedData.tutors);
        setTotalPages(cachedData.totalPages);
        setInitialLoaded(true);
        setCurrentPage(1);
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        page: 1,
        limit: 12,
        user_id: user._id
      });

      const response = await fetchWithAuth(`${BASE_URL}/api/auth/tutors/search?${params}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
      }, token, (newToken) => localStorage.setItem("authToken", newToken)
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const cleanedTutors = cleanTutorData(data.tutors || []);
      // Merge local pending state
      const mergedTutors = cleanedTutors.map(t =>
        pendingTutorIds.has(t._id) ? { ...t, hire_status: 'pending', is_hired: true } : t
      );
      
      // Cache the results
      setSearchCache(prev => {
        const newCache = new Map(prev);
        newCache.set(cacheKey, {
          tutors: mergedTutors,
          totalPages: data.pagination?.total_pages || 1
        });
        return newCache;
      });

      setTutors(mergedTutors);
      setTotalPages(data.pagination?.total_pages || 1);
      setInitialLoaded(true);
      setCurrentPage(1);
    } catch (error) {
      setError(error.message || 'Failed to load tutors');
    } finally {
      setLoading(false);
    }
  }, [user, searchCache, fetchWithAuth, token, cleanTutorData, pendingTutorIds]);

  const searchTutors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const authToken = getAuthToken();

      if (!user?._id) {
        throw new Error('User not authenticated');
      }

      // Create cache key
      const cacheKey = JSON.stringify({
        page: currentPage,
        filters,
        searchQuery,
        preferredSubjectsOnly,
        user_id: user._id
      });

      // Check cache first
      if (searchCache.has(cacheKey)) {
        const cachedData = searchCache.get(cacheKey);
        setTutors(cachedData.tutors);
        setTotalPages(cachedData.totalPages);
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        user_id: user._id
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          if (key === 'subject') {
            params.append('subject_id', value.toString().trim());
          } else if (key === 'academic_level') {
            params.append('academic_level', value.toString().trim());
          } else if (key === 'min_price' || key === 'max_price') {
            // Handle price range filters
            if (key === 'min_price' && value > 0) {
              params.append('min_hourly_rate', value);
            } else if (key === 'max_price' && value < 1000) {
              params.append('max_hourly_rate', value);
            }
          } else {
            params.append(key, value.toString().trim());
          }
        }
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      if (preferredSubjectsOnly) {
        params.append('preferred_subjects_only', 'true');
      }

      const response = await fetchWithAuth(`${BASE_URL}/api/auth/tutors/search?${params}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
      }, token, (newToken) => localStorage.setItem("authToken", newToken)
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const cleanedTutors = cleanTutorData(data.tutors || []);
      // Merge local pending state
      const mergedTutors = cleanedTutors.map(t =>
        pendingTutorIds.has(t._id) ? { ...t, hire_status: 'pending', is_hired: true } : t
      );
      
      // Cache the results
      setSearchCache(prev => {
        const newCache = new Map(prev);
        newCache.set(cacheKey, {
          tutors: mergedTutors,
          totalPages: data.pagination?.total_pages || 1
        });
        // Limit cache size to prevent memory issues
        if (newCache.size > 50) {
          const firstKey = newCache.keys().next().value;
          newCache.delete(firstKey);
        }
        return newCache;
      });

      setTutors(mergedTutors);
      setTotalPages(data.pagination?.total_pages || 1);
    } catch (error) {
      setError(error.message || 'Failed to search tutors');
      toast({
        title: "Error",
        description: error.message || "Failed to search tutors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, searchQuery, preferredSubjectsOnly, user, searchCache, fetchWithAuth, token, cleanTutorData, pendingTutorIds]);

  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(value);
      setCurrentPage(1);
    }, 150); // Reduced from 300ms to 150ms for faster response
  };

  const handleFilterChange = useCallback(async (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);

    if (key === "academic_level") {
      fetchSubjectRelatedToAcademicLevels([value]);
    }
  }, [fetchSubjectRelatedToAcademicLevels]);

  const clearAllFilters = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    skipNextSearchRef.current = true;
    setSearchInput('');
    setSearchQuery('');
    setPreferredSubjectsOnly(false);
    setFilters({
      subject: '',
      academic_level: '',
      location: '',
      min_rating: '',
      min_price: 0,
      max_price: 100
    });
    setCurrentPage(1);
    await loadAllTutors();
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
    if (tutor?.academic_levels_taught && tutor.academic_levels_taught.length > 0) {
      const firstLevel = tutor.academic_levels_taught[0];
      setHiringData(prev => ({
        ...prev,
        academic_level: firstLevel.educationLevel
      }));
      // Fetch subjects for the default level in dialog
      if (firstLevel?.educationLevel) {
        fetchSubjectRelatedToAcademicLevels([firstLevel.educationLevel]);
      }
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
      }, token, (newToken) => localStorage.setItem("authToken", newToken)
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
        setShowHiringDialog(false);
        
        // Optimistic UI update - immediately update the tutor's hire status
        setTutors(prevTutors => 
          prevTutors.map(tutor => 
            tutor._id === selectedTutor._id 
              ? { ...tutor, hire_status: 'pending', is_hired: true }
              : tutor
          )
        );
        // Track pending locally
        setPendingTutorIds(prev => {
          const next = new Set(prev);
          next.add(selectedTutor._id);
          return next;
        });
        // Also update any cached entries to keep consistency
        setSearchCache(prev => {
          const next = new Map(prev);
          for (const [key, value] of next.entries()) {
            if (value && Array.isArray(value.tutors)) {
              next.set(key, {
                ...value,
                tutors: value.tutors.map(t => t._id === selectedTutor._id ? { ...t, hire_status: 'pending', is_hired: true } : t)
              });
            }
          }
          return next;
        });
        
        // Skip next automatic search to prevent reload
        skipNextSearchRef.current = true;
        
        // Update student profile in background (no loading state)
        getStudentProfile();
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

  // Height constants for different sections
  const ACADEMIC_LEVELS_HEIGHT = 'h-8'; // Fixed height for academic levels
  const SUBJECTS_HEIGHT = 'h-12'; // Fixed height for subjects
  const BIO_HEIGHT = 'h-16'; // Fixed height for bio
  const BUTTONS_HEIGHT = 'h-10'; // Fixed height for buttons

  if (loading && tutors.length === 0 && !initialLoaded) {
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
            type="button"
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
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showAdvancedFilters ? 'Hide' : 'Show'} Filters
            </Button>
            {(searchQuery || Object.values(filters).some(v => v) || preferredSubjectsOnly) && (
              <Button
                type="button"
                onClick={(e) => clearAllFilters(e)}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  £{filters.min_price} - £{filters.max_price}/hr
                </Typography>
                <Slider
                  value={[filters.min_price, filters.max_price]}
                  onChange={(event, newValue) => {
                    handleFilterChange('min_price', newValue[0]);
                    handleFilterChange('max_price', newValue[1]);
                  }}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                  step={4}
                  sx={{
                    color: '#7C3AED',
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#7C3AED',
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: '#7C3AED',
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: '#E5E7EB',
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">Set your preferred hourly rate range</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="hover:shadow-md transition-shadow flex flex-col h-full">
                <CardContent className="p-6 flex flex-col flex-1">
                  {/* Skeleton for profile picture and name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                  </div>
                  
                  {/* Skeleton for badges */}
                  <div className="space-y-3 flex-1">
                    <div className="flex gap-1">
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-14"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-18"></div>
                    </div>
                    <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex gap-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                  </div>
                  
                  {/* Skeleton for buttons */}
                  <div className="flex gap-2 mt-4 h-10">
                    <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tutor Found</h3>
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
                <Button type="button" onClick={loadAllTutors}>Try Again</Button>
                <Button type="button" onClick={(e) => clearAllFilters(e)} variant="outline">Clear Filters</Button>
              </div>
            </CardContent>
          </Card>
        ) : tutors.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || Object.values(filters).some(v => v) ? 'No tutors found' : 'No tutors found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || Object.values(filters).some(v => v)
                  ? 'Try adjusting your search filters or broadening your criteria'
                  : 'No tutors of your preferred subjects'
                }
              </p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutors.map((tutor) => {
                const visibleAcademicLevels = tutor.academic_levels_taught?.slice(0, 3) || [];
                const hiddenAcademicLevelsCount = Math.max(0, (tutor.academic_levels_taught?.length || 0) - 3);

                const visibleSubjects = tutor.subjects?.slice(0, 3) || [];
                const hiddenSubjectsCount = Math.max(0, (tutor.subjects?.length || 0) - 3);

                return (
                  <Card key={tutor._id} className="hover:shadow-md transition-shadow flex flex-col h-full">
                    <CardContent className="p-6 flex flex-col flex-1">
                      {/* Row 1: Profile Picture, Name, Rating, and Hourly Rates */}
                      <div className="flex items-start gap-4 mb-4">
                        {/* Profile Picture */}
                        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 overflow-hidden relative flex-shrink-0">
                          {tutor.user_id?.photo_url ? (
                            <img
                              src={tutor.user_id.photo_url}
                              alt="Profile"
                              className="h-full w-full object-cover rounded-full transition-opacity duration-300 opacity-100"
                              loading="lazy"
                            />
                          ) : (
                            <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-600" />
                          )}
                          {!tutor.user_id?.photo_url && (
                            <div className="relative z-10 text-white flex items-center justify-center w-full h-full">
                              <User className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        
                        {/* Name, Rating, and Pricing */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {tutor.user_id?.full_name || 'Unknown Tutor'}
                              </h3>
                                <div className="flex items-center gap-1 mt-1">
                                  {renderStars(tutor.average_rating)}
                              {tutor.average_rating && typeof tutor.average_rating === 'number' && (
                                  <span className="text-sm text-gray-600 ml-1">
                                    ({tutor.average_rating})
                                  </span>
                                )}
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <p className="text-lg font-bold text-gray-900 whitespace-nowrap">
                                £{tutor.min_hourly_rate || 0} - £{tutor.max_hourly_rate || 0}/hr
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Other Details - Academic Levels, Subjects, Bio, Stats */}
                      <div className="space-y-3 flex-1">
                        {/* Academic Levels */}
                        <div className={`${ACADEMIC_LEVELS_HEIGHT} mt-2 overflow-hidden`}>
                          <div className="flex flex-wrap gap-1">
                            {visibleAcademicLevels.map((level, index) => (
                              <Badge key={index} variant="secondary" className="text-xs max-w-full truncate">
                                {typeof level === 'object' ? getAcademicLevelById(level.educationLevel)?.level : level}
                              </Badge>
                            ))}
                            {hiddenAcademicLevelsCount > 0 && (
                              <Badge variant="outline" className="text-xs">
                                +{hiddenAcademicLevelsCount} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Subjects */}
                        <div className={`${SUBJECTS_HEIGHT} overflow-hidden`}>
                          <div className="flex flex-wrap gap-1">
                            {visibleSubjects.map((subject, index) => (
                              <Badge key={index} variant="outline" className="text-xs max-w-full truncate">
                                {typeof subject === 'object' ? subject.name : (getSubjectById(subject)?.name || subject)}
                              </Badge>
                            ))}
                            {hiddenSubjectsCount > 0 && (
                              <Badge variant="outline" className="text-xs">
                                +{hiddenSubjectsCount} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Bio */}
                        {tutor.bio && typeof tutor.bio === 'string' && (
                          <div className={`${BIO_HEIGHT} overflow-hidden`}>
                            <p className="text-sm text-gray-600 line-clamp-3 h-full">
                              {tutor.bio}
                            </p>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{typeof tutor.total_sessions === 'number' ? tutor.total_sessions : 0} sessions</span>
                          </div>
                          {tutor.experience_years && typeof tutor.experience_years === 'number' && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{tutor.experience_years} years</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Buttons - Fixed at bottom */}
                      <div className={`flex gap-2 mt-4 ${BUTTONS_HEIGHT} items-center`}>
                        {tutor.hire_status === "accepted" ? (
                          <Button
                            type="button"
                            size="sm"
                            className="flex-1 h-10"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Hired
                          </Button>
                        ) : (pendingTutorIds.has(tutor._id) || tutor.hire_status === "pending") ? (
                          <Button
                            type="button"
                            size="sm"
                            className="flex-1 h-10"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Pending
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => handleHireTutor(tutor)}
                            size="sm"
                            className="flex-1 h-10"
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
                          type="button"
                          onClick={() => handleViewTutor(tutor._id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 h-10"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
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
                      type="button"
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
                 {/* Academic Level Selection */}
                 <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Level</label>
                {(() => {
                  const tutorLevels = Array.isArray(selectedTutor?.academic_levels_taught) ? selectedTutor.academic_levels_taught : [];
                  return (
                    <Select
                      value={hiringData.academic_level}
                      onValueChange={(value) => {
                        setHiringData(prev => ({ ...prev, academic_level: value, subject: '' }));
                        if (value) fetchSubjectRelatedToAcademicLevels([value]);
                      }}
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

              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                {(() => {
                  const tutorSubjects = Array.isArray(selectedTutor?.subjects) ? selectedTutor.subjects : [];
                  const tutorSubjectIdSet = new Set((tutorSubjects || []).map(s =>
                    typeof s === 'object' ? (s?._id?.toString?.() || s?.toString?.()) : s?.toString?.()
                  ).filter(Boolean));
                  // Filter fetched subjects by selected academic level and intersect with tutor's subjects
                  const filteredByLevel = (subjectRelatedToAcademicLevels || []).filter(s =>
                    hiringData.academic_level && (s?.level_id?._id?.toString?.() === hiringData.academic_level?.toString?.() || s?.level_id?.toString?.() === hiringData.academic_level?.toString?.())
                  );
                  const subjectOptions = filteredByLevel.filter(s => tutorSubjectIdSet.has(s?._id?.toString?.()));
                  return (
                    <Select value={hiringData.subject} onValueChange={(value) => setHiringData(prev => ({ ...prev, subject: value }))}>
                      <SelectTrigger>
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

              {/* Submit Button */}
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TutorSearch;