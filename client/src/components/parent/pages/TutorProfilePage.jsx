import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useParent } from '../../../contexts/ParentContext';
import { useSubject } from '../../../hooks/useSubject';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import {
    ArrowLeft,
    Star,
    MapPin,
    Clock,
    User,
    BookOpen,
    GraduationCap,
    Award,
    CheckCircle,
    MessageCircle,
    Calendar,
    Phone,
    Mail,
    Globe,
    FileText,
    Users,
    TrendingUp,
    Shield,
    Clock3,
    DollarSign
} from 'lucide-react';
import { BASE_URL } from '../../../config';

const TutorProfilePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { subjects, academicLevels } = useSubject();
    const [tutor, setTutor] = useState(location.state?.tutor || null);
    const [loading, setLoading] = useState(!location.state?.tutor);
    const [activeTab, setActiveTab] = useState('overview');
    const [tutorReviews, setTutorReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    useEffect(() => {
        if (!location.state?.tutor) {
            // If no tutor data in state, redirect back to tutors list
            navigate('/parent-dashboard/tutors');
        } else {
            // Fetch tutor reviews when tutor data is available
            fetchTutorReviews();
        }
    }, [location.state?.tutor, navigate]);

    const fetchTutorReviews = async () => {
        if (!tutor?._id) return;
        
        try {
            setReviewsLoading(true);
            const response = await fetch(`${BASE_URL}/api/auth/tutor/${tutor._id}/reviews`);
            if (response.ok) {
                const data = await response.json();
                setTutorReviews(data.reviews || []);
            }
        } catch (error) {
            // console.error('Error fetching tutor reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64 px-4">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!tutor) {
        return (
            <div className="text-center py-8 sm:py-12 px-4">
                <User className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 dark:text-white mb-2">
                    Tutor not found
                </h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                    The tutor profile you're looking for doesn't exist or has been removed.
                </p>
                <Button 
                    onClick={() => navigate('/parent-dashboard/tutors')}
                    size="sm"
                    className="text-xs sm:text-sm"
                >
                    Back to Tutors
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-4">
            {/* Tutor Overview Card */}
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                        {/* Profile Image */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                            {tutor.user_id?.photo_url ? (
                                <img
                                    src={`${BASE_URL}${tutor.user_id.photo_url}`}
                                    alt="Profile"
                                    className="h-full w-full object-cover rounded-full"
                                />
                            ) : (
                                <User className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 text-white" />
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3">
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 truncate">
                                        {tutor.user_id?.full_name}
                                    </h2>
                                    <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 justify-center sm:justify-start mb-2">
                                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-400 font-semibold">
                                            Qualifications: 
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                            {tutor.qualifications}
                                        </p>
                                    </div>
                                  
                                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 justify-center sm:justify-start text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1 justify-center sm:justify-start">
                                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                            <span className="truncate">{tutor.location || 'Location not specified'}</span>
                                        </div>
                                        <div className="flex items-center gap-1 justify-center sm:justify-start">
                                            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current flex-shrink-0" />
                                            <span>{tutor.average_rating?.toFixed(1) || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center sm:justify-start">
                                    {tutor.is_verified && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Verified
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                                <div className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 lg:p-4 rounded-lg">
                                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                        <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Experience</span>
                                    </div>
                                    <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                                        {tutor.experience_years || 0} years
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 lg:p-4 rounded-lg">
                                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Sessions</span>
                                    </div>
                                    <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                                        {tutor.total_sessions || 0} completed
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 lg:p-4 rounded-lg">
                                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Students</span>
                                    </div>
                                    <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                                        {tutor.total_students_taught || 0} taught
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-2">
                    <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Overview</TabsTrigger>
                    <TabsTrigger value="subjects" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Subjects & Levels</TabsTrigger>
                    <TabsTrigger value="experience" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Experience</TabsTrigger>
                    <TabsTrigger value="reviews" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Reviews</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* About */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                                    About
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {tutor.bio || 'No bio available for this tutor.'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Inquiry Statistics */}
                        {tutor.inquiry_stats && (
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                                        <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Inquiry Statistics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                        <div className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg">
                                            <p className="text-xs text-gray-500">Avg Response</p>
                                            <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                                                {tutor.inquiry_stats.average_response_time || "N/A"}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg">
                                            <p className="text-xs text-gray-500">Fastest Response</p>
                                            <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                                                {tutor.inquiry_stats.fastest_response_time || "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                        <div className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg">
                                            <p className="text-xs text-gray-500">Total Received</p>
                                            <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                                                {tutor.inquiry_stats.total_received || 0}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg">
                                            <p className="text-xs text-gray-500">Total Replied</p>
                                            <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                                                {tutor.inquiry_stats.total_replied || 0}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg">
                                        <p className="text-xs text-gray-500">Reply Rate</p>
                                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                                            {tutor.inquiry_stats.reply_rate
                                                ? `${tutor.inquiry_stats.reply_rate}%`
                                                : "0%"}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* Subjects & Levels Tab */}
                <TabsContent value="subjects" className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Subjects */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Subjects Taught
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                    {parseSubjects(tutor.subjects).map((subject, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                                            {getSubjectName(subject._id)}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Academic Levels & Pricing */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                                    <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Academic Levels & Pricing
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                                <div className="space-y-2 sm:space-y-3">
                                    {tutor.academic_levels_taught?.map((level, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                                    {getAcademicLevelName(level.educationLevel)}
                                                </p>
                                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                    {level.totalSessionsPerMonth || 'Unlimited'} sessions/month
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                                    £{level.hourlyRate || 'N/A'}/hr
                                                </p>
                                                {level.discount > 0 && (
                                                    <p className="text-xs sm:text-sm text-green-600">
                                                        {level.discount}% discount
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Experience Tab */}
                <TabsContent value="experience" className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Qualifications */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                                    <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Qualifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {tutor.qualifications || 'No qualifications listed.'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Teaching Experience */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Teaching Experience
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Years of Experience</span>
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                            {tutor.experience_years || 0} years
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Sessions</span>
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                            {tutor.total_sessions || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Students Taught</span>
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                            {tutor.total_students_taught || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Average Rating</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                                            <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                                {tutor.average_rating?.toFixed(1) || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="space-y-4 sm:space-y-6">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                                <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                                Student Reviews ({tutorReviews.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                            {reviewsLoading ? (
                                <div className="text-center py-6 sm:py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading reviews...</p>
                                </div>
                            ) : !tutorReviews || tutorReviews.length === 0 ? (
                                <div className="text-center py-6 sm:py-8">
                                    <Star className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                                    <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 dark:text-white mb-2">
                                        No reviews yet
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                        This tutor hasn't received any reviews yet. Be the first to leave a review after your session!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4 sm:space-y-6">
                                    {tutorReviews.map((review, index) => (
                                        <div key={review._id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                                            {/* Review Header */}
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        {review.student_photo ? (
                                                            <img
                                                                src={`${BASE_URL}${review.student_photo}`}
                                                                alt={review.student_name}
                                                                className="h-full w-full object-cover rounded-full"
                                                            />
                                                        ) : (
                                                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                                            {review.student_name}
                                                        </h4>
                                                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                            {new Date(review.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {/* Rating */}
                                                {review.rating && (
                                                    <div className="flex items-center gap-1 justify-center sm:justify-start">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star 
                                                                key={i} 
                                                                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                                                    i < review.rating 
                                                                        ? 'text-yellow-400 fill-current' 
                                                                        : 'text-gray-300'
                                                                }`} 
                                                            />
                                                        ))}
                                                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white ml-1">
                                                            {review.rating}/5
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Review Text */}
                                            {review.review_text && (
                                                <div className="mb-2 sm:mb-3">
                                                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                                        "{review.review_text}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default TutorProfilePage;