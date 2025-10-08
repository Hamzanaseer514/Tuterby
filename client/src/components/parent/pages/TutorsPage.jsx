import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParent } from '../../../contexts/ParentContext';
import { useSubject } from '../../../hooks/useSubject';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Checkbox } from '../../ui/checkbox';
import {
    Search,
    Filter,
    Star,
    MapPin,
    Clock,
    User,
    BookOpen,
    Eye,
    MessageCircle,
    Calendar,
    GraduationCap,
    Award,
    CheckCircle,
    X,
    Users,
    TrendingUp
} from 'lucide-react';
import { BASE_URL } from '../../../config';

const TutorsPage = () => {
    const navigate = useNavigate();
    const { getTutorsForParent, loading } = useParent();
    const { subjects, academicLevels } = useSubject();
    
    const [tutors, setTutors] = useState([]);
    const [filteredTutors, setFilteredTutors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    
    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        subject: '',
        academic_level: '',
        location: '',
        min_rating: '',
        preferred_subjects_only: false
    });

    useEffect(() => {
        loadTutors();
    }, [currentPage, filters, searchQuery]);

    useEffect(() => {
        filterTutors();
    }, [tutors, searchQuery, filters]);

    const loadTutors = async () => {
        try {
            const params = {
                page: currentPage,
                limit: 12,
                ...(searchQuery && { search: searchQuery }),
                ...(filters.subject && { subject_id: filters.subject }),
                ...(filters.academic_level && { academic_level: filters.academic_level }),
                ...(filters.location && { location: filters.location }),
                ...(filters.min_rating && { min_rating: filters.min_rating }),
                ...(filters.preferred_subjects_only && { preferred_subjects_only: filters.preferred_subjects_only })
            };

            const data = await getTutorsForParent(params);
            setTutors(data.tutors || []);
            setTotalPages(data.pagination?.total || 1);
        } catch (error) {
            // console.error('Error loading tutors');
        }
    };

    const filterTutors = () => {
        let filtered = tutors;

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(tutor =>
                tutor.user_id?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tutor.subjects?.some(subject => 
                    typeof subject === 'string' ? 
                        subject.toLowerCase().includes(searchQuery.toLowerCase()) :
                        subject.name?.toLowerCase().includes(searchQuery.toLowerCase())
                ) ||
                tutor.location?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredTutors(filtered);
    };

    const handleTutorClick = (tutor) => {
        // Navigate to tutor profile page without exposing ID in URL
        navigate(`/parent-dashboard/tutors/profile`, { 
            state: { tutor } 
        });
    };
    

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const clearFilters = () => {
        setFilters({
            subject: '',
            academic_level: '',
            location: '',
            min_rating: '',
            preferred_subjects_only: false
        });
        setSearchQuery('');
        setCurrentPage(1);
    };

    const getSubjectName = (subjectId) => {
        const subject = subjects.find(s => s._id === subjectId);
        return subject?.name || 'Unknown Subject';
    };

    const getAcademicLevelName = (levelId) => {
        const level = academicLevels.find(l => l._id === levelId);
        return level?.level || 'Unknown Level';
    };

    const parseSubjects = (subjects) => {
        if (!subjects) return [];
        if (Array.isArray(subjects)) {
            return subjects.map(subject => {
                if (typeof subject === 'string') {
                    try {
                        return JSON.parse(subject);
                    } catch {
                        return subject;
                    }
                }
                return subject;
            }).flat();
        }
        return [];
    };

    const getHourlyRate = (tutor, academicLevelId) => {
        if (!tutor.academic_levels_taught || !academicLevelId) return null;
        
        const level = tutor.academic_levels_taught.find(l => 
            l.educationLevel?.toString() === academicLevelId.toString()
        );
        return level?.hourlyRate || null;
    };

    return (
        <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-4">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 sm:p-6 rounded-lg">
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                            Find Tutors
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                            Discover qualified tutors for your children
                        </p>
                    </div>
                    {/* <div className="flex items-center gap-2 sm:gap-3 w-full xs:w-auto">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 w-full xs:w-auto text-xs sm:text-sm"
                            size="sm"
                        >
                            <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Filters</span>
                        </Button>
                    </div> */}
                </div>
            </div>

            {/* Search Bar */}
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                            <Input
                                placeholder="Search tutors by name, subjects, or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 sm:pl-10 text-xs sm:text-sm h-9 sm:h-10"
                            />
                        </div>
                        <Button 
                            onClick={loadTutors} 
                            disabled={loading} 
                            className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
                            size="sm"
                        >
                            Search
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            {showFilters && (
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                        <CardTitle className="flex items-center justify-between text-sm sm:text-base lg:text-lg">
                            <span>Filters</span>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={clearFilters} 
                                className="text-xs sm:text-sm h-8"
                            >
                                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Clear All
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div>
                                <label className="text-xs sm:text-sm font-medium mb-2 block">Subject</label>
                                <Select value={filters.subject} onValueChange={(value) => handleFilterChange('subject', value)}>
                                    <SelectTrigger className="text-xs sm:text-sm h-9">
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Subjects</SelectItem>
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject._id} value={subject._id}>
                                                {subject.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-xs sm:text-sm font-medium mb-2 block">Academic Level</label>
                                <Select value={filters.academic_level} onValueChange={(value) => handleFilterChange('academic_level', value)}>
                                    <SelectTrigger className="text-xs sm:text-sm h-9">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Levels</SelectItem>
                                        {academicLevels.map((level) => (
                                            <SelectItem key={level._id} value={level._id}>
                                                {level.level}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-xs sm:text-sm font-medium mb-2 block">Location</label>
                                <Input
                                    placeholder="Enter location"
                                    value={filters.location}
                                    onChange={(e) => handleFilterChange('location', e.target.value)}
                                    className="text-xs sm:text-sm h-9"
                                />
                            </div>

                            <div>
                                <label className="text-xs sm:text-sm font-medium mb-2 block">Minimum Rating</label>
                                <Select value={filters.min_rating} onValueChange={(value) => handleFilterChange('min_rating', value)}>
                                    <SelectTrigger className="text-xs sm:text-sm h-9">
                                        <SelectValue placeholder="Any rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Any Rating</SelectItem>
                                        <SelectItem value="4">4+ Stars</SelectItem>
                                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                                        <SelectItem value="5">5 Stars</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-3 sm:mt-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="preferred_subjects"
                                    checked={filters.preferred_subjects_only}
                                    onCheckedChange={(checked) => handleFilterChange('preferred_subjects_only', checked)}
                                    className="h-4 w-4"
                                />
                                <label htmlFor="preferred_subjects" className="text-xs sm:text-sm leading-tight">
                                    Show only tutors who teach my children's preferred subjects
                                </label>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tutors Grid */}
            <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                        Available Tutors ({filteredTutors.length})
                    </h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                                            <div className="space-y-1 flex-1">
                                                <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24 lg:w-32"></div>
                                                <div className="h-2 sm:h-3 bg-gray-200 rounded w-16 sm:w-20 lg:w-24"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-2 sm:h-3 bg-gray-200 rounded w-full"></div>
                                            <div className="h-2 sm:h-3 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                        <div className="flex gap-1">
                                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredTutors.length === 0 ? (
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
                            <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                            <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 dark:text-white mb-2">
                                No tutors found
                            </h3>
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                                Try adjusting your search terms or filters to find more tutors
                            </p>
                            <Button 
                                onClick={clearFilters} 
                                variant="outline" 
                                size="sm"
                                className="w-full sm:w-auto text-xs sm:text-sm"
                            >
                                Clear Filters
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                        {filteredTutors.map((tutor) => (
                            <Card 
                                key={tutor._id} 
                                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 flex flex-col h-full"
                                onClick={() => handleTutorClick(tutor)}
                            >
                                <CardContent className="p-4 sm:p-6 flex flex-col flex-1">
                                    {/* Tutor Header */}
                                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
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
                                                        <User className="h-5 w-5 sm:h-6 sm:w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base lg:text-lg group-hover:text-primary transition-colors truncate">
                                                    {tutor.user_id?.full_name}
                                                </h4>
                                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                                    {tutor.qualifications}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                                            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                                {tutor.average_rating?.toFixed(1) || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tutor Details */}
                                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-1">
                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                            <span className="truncate">{tutor.location || 'Location not specified'}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                            <span>{tutor.experience_years || 0} years experience</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                            <span>{tutor.total_sessions || 0} sessions completed</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                            <span>{tutor.total_students_taught || 0} students taught</span>
                                        </div>
                                    </div>

                                    {/* Subjects */}
                                    <div className="mb-3 sm:mb-4">
                                        <h5 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
                                            Subjects
                                        </h5>
                                        <div className="flex flex-wrap gap-1">
                                            {parseSubjects(tutor.subjects).slice(0, 3).map((subject, index) => (
                                                <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0">
                                                    {getSubjectName(subject._id)}
                                                </Badge>
                                            ))}
                                            {parseSubjects(tutor.subjects).length > 3 && (
                                                <Badge variant="outline" className="text-xs px-1.5 py-0">
                                                    +{parseSubjects(tutor.subjects).length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Academic Levels */}
                                    <div className="mb-4 sm:mb-6">
                                        <h5 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
                                            Academic Levels
                                        </h5>
                                        <div className="flex flex-wrap gap-1">
                                            {tutor.academic_levels_taught?.slice(0, 2).map((level, index) => (
                                                <Badge key={index} variant="outline" className="text-xs px-1.5 py-0">
                                                    {getAcademicLevelName(level.educationLevel)}
                                                    {level.hourlyRate && ` - £${level.hourlyRate}/hr`}
                                                </Badge>
                                            ))}
                                            {tutor.academic_levels_taught?.length > 2 && (
                                                <Badge variant="outline" className="text-xs px-1.5 py-0">
                                                    +{tutor.academic_levels_taught.length - 2} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-1 sm:gap-2 mt-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-xs h-8 group-hover:border-primary group-hover:text-primary transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTutorClick(tutor);
                                            }}
                                        >
                                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                            View
                                        </Button>
                                    </div>

                                    {/* Verification Badges */}
                                    {tutor.is_verified && (
                                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-1 sm:gap-2 text-xs text-green-600">
                                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                                <span>Verified Tutor</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="text-xs sm:text-sm h-8 sm:h-9"
                        >
                            Previous
                        </Button>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-2 sm:px-4">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="text-xs sm:text-sm h-8 sm:h-9"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TutorsPage;