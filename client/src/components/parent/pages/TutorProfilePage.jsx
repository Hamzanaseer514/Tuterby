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

    useEffect(() => {
        if (!location.state?.tutor) {
            // If no tutor data in state, redirect back to tutors list
            navigate('/parent-dashboard/tutors');
        }
    }, [location.state?.tutor, navigate]);



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
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!tutor) {
        return (
            <div className="text-center py-12">
                <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Tutor not found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                    The tutor profile you're looking for doesn't exist or has been removed.
                </p>
                <Button onClick={() => navigate('/parent-dashboard/tutors')}>
                    Back to Tutors
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            {/* <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/parent-dashboard/tutors')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Tutors
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Tutor Profile
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Detailed information about {tutor.user_id?.full_name}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleContactTutor}
                            className="flex items-center gap-2"
                        >
                            <MessageCircle className="h-4 w-4" />
                            Contact
                        </Button>
                        <Button
                            onClick={handleScheduleSession}
                            className="flex items-center gap-2"
                        >
                            <Calendar className="h-4 w-4" />
                            Schedule Session
                        </Button>
                    </div>
                </div>
            </div> */}

            {/* Tutor Overview Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                        {/* Profile Image */}
                        <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
                            {tutor.user_id?.photo_url ? (
                                <img
                                    src={`${BASE_URL}${tutor.user_id.photo_url}`}
                                    alt="Profile"
                                    className="h-full w-full object-cover rounded-full"
                                />
                            ) : (
                                <User className="h-12 w-12 text-white" />
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {tutor.user_id?.full_name}
                                    </h2>
                                    <div className="flex gap-2 item-center justify-start">
                                    <p className="text-gray-700 dark:text-gray-400 mb-2 font-semibold">
  Qualifications: 
</p>

                                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                                        {tutor.qualifications}
                                    </p>
                                    </div>
                                  
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            <span>{tutor.location || 'Location not specified'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                            <span>{tutor.average_rating?.toFixed(1) || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {tutor.is_verified && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Verified
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <GraduationCap className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Experience</span>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {tutor.experience_years || 0} years
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sessions</span>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {tutor.total_sessions || 0} completed
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Students</span>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {tutor.total_students_taught || 0} taught
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="subjects">Subjects & Levels</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
               {/* Overview Tab */}
<TabsContent value="overview" className="space-y-6">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* About */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          About
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {tutor.bio || 'No bio available for this tutor.'}
        </p>
      </CardContent>
    </Card>
{console.log(tutor)}
    {/* Inquiry Statistics */}
    {tutor.inquiry_stats && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Inquiry Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Avg Response</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {tutor.inquiry_stats.average_response_time || "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Fastest Response</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {tutor.inquiry_stats.fastest_response_time || "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Total Received</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {tutor.inquiry_stats.total_received || 0}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Total Replied</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {tutor.inquiry_stats.total_replied || 0}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Reply Rate</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
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
                <TabsContent value="subjects" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Subjects */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Subjects Taught
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {parseSubjects(tutor.subjects).map((subject, index) => (
                                        <Badge key={index} variant="secondary" className="text-sm">
                                            {/* {typeof subject === 'string' ? subject : subject.name} */}
                                            {getSubjectName(subject._id)}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Academic Levels & Pricing */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Academic Levels & Pricing
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {tutor.academic_levels_taught?.map((level, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {getAcademicLevelName(level.educationLevel)}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {level.totalSessionsPerMonth || 'Unlimited'} sessions/month
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    £{level.hourlyRate || 'N/A'}/hr
                                                </p>
                                                {level.discount > 0 && (
                                                    <p className="text-sm text-green-600">
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
                <TabsContent value="experience" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Qualifications */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Qualifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {tutor.qualifications || 'No qualifications listed.'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Teaching Experience */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Teaching Experience
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Years of Experience</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {tutor.experience_years || 0} years
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Total Sessions</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {tutor.total_sessions || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Students Taught</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {tutor.total_students_taught || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Average Rating</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                            <span className="font-semibold text-gray-900 dark:text-white">
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
                <TabsContent value="reviews" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Student Reviews ({tutor.reviews?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!tutor.reviews || tutor.reviews.length === 0 ? (
                                <div className="text-center py-8">
                                    <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No reviews yet
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        This tutor hasn't received any reviews yet. Be the first to leave a review after your session!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {tutor.reviews.map((review, index) => (
                                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            {/* Session Rating */}
                                            {review.rating && (
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star 
                                                                key={i} 
                                                                className={`h-4 w-4 ${
                                                                    i < review.rating 
                                                                        ? 'text-yellow-400 fill-current' 
                                                                        : 'text-gray-300'
                                                                }`} 
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {review.rating}/5
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Session Feedback */}
                                            {review.feedback && (
                                                <div className="mb-3">
                                                    <p className="text-gray-700 dark:text-gray-300">
                                                        <strong>Session Feedback:</strong> {review.feedback}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {/* Student Ratings */}
                                            {review.student_ratings && review.student_ratings.length > 0 && (
                                                <div className="space-y-3">
                                                    <h6 className="font-medium text-gray-900 dark:text-white">
                                                        Individual Student Ratings:
                                                    </h6>
                                                    {review.student_ratings.map((studentRating, studentIndex) => (
                                                        <div key={studentIndex} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-4 w-4 text-gray-400" />
                                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        Student {studentIndex + 1}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star 
                                                                            key={i} 
                                                                            className={`h-3 w-3 ${
                                                                                i < studentRating.rating 
                                                                                    ? 'text-yellow-400 fill-current' 
                                                                                : 'text-gray-300'
                                                                            }`} 
                                                                        />
                                                                    ))}
                                                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                        {studentRating.rating}/5
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {studentRating.feedback && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    "{studentRating.feedback}"
                                                                </p>
                                                            )}
                                                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                                                {new Date(studentRating.rated_at).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    ))}
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
