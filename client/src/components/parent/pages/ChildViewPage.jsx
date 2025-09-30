import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useParent } from '../../../contexts/ParentContext';
import { useSubject } from '../../../hooks/useSubject';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    GraduationCap,
    BookOpen,
    Target,
    Star,
    Edit3,
    Camera,
    MapPin,
    AlertCircle,
    TrendingUp,
    Clock,
    Award,
    Users,
    CheckCircle,
    XCircle,
    Clock as ClockIcon
} from 'lucide-react';
import { BASE_URL } from '../../../config';
import ChildDetailModal from '../ChildDetailModal';

const ChildViewPage = () => {
    const { childSlug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, getAuthToken, fetchWithAuth } = useAuth();
    const { getParentProfile, getSpecificStudentDetail } = useParent();
    const { academicLevels, subjects } = useSubject();

    const [child, setChild] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [studentDetails, setStudentDetails] = useState(null);

    // Check if we're in edit mode from URL
    const isEditMode = location.pathname.includes('/edit');

    useEffect(() => {
        fetchChildData();
    }, [childSlug]);

    useEffect(() => {
        // Auto-open edit modal if in edit mode
        if (isEditMode && child) {
            setShowEditModal(true);
        }
    }, [isEditMode, child]);

    const fetchChildData = async () => {
        try {
            setLoading(true);
            const data = await getParentProfile(user._id);

            const idPart = childSlug.split("-").pop();
            const foundChild = data.children?.find(c => c._id.endsWith(idPart));

            if (foundChild) {
                setChild(foundChild);
                await fetchStudentDetails(foundChild._id);
            } else {
                setError("Child not found");
            }
        } catch (error) {
            // console.error("Error fetching child data:", error);
            setError("Failed to load child information");
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentDetails = async (userId) => {
        try {
            const response = await getSpecificStudentDetail(userId);
            if (response.success) {
                setStudentDetails(response.student);
            }
        } catch (error) {
            // console.error('Error fetching student details:', error);
        }
    };

    const getAcademicLevelName = (id) => {
        if (!id) return null;
        const academicLevel = academicLevels.find(level => level._id === id);
        return academicLevel;
    };

    const getSubjectName = (id) => {
        if (!id) return null;
        const subject = subjects.find(subject => subject._id === id);
        return subject;
    };

    const handleEdit = () => {
        setShowEditModal(true);
    };

    const handleBack = () => {
        navigate('/parent-dashboard/children');
    };

    const handleTutorClick = (tutorId) => {
        navigate(`/tutor`, {
            state: {
                tutorId: tutorId,
                studentId: child._id, // Pass the child's user ID
                isParentView: true // Flag to indicate this is a parent viewing
            }
        });
    };

    const handleChildUpdated = (updatedChild) => {
        setChild(updatedChild);
        setShowEditModal(false);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>;
            case 'accepted':
                return <Badge variant="default" className="bg-green-100 text-green-800 text-xs">Accepted</Badge>;
            case 'rejected':
                return <Badge variant="destructive" className="bg-red-100 text-red-800 text-xs">Rejected</Badge>;
            default:
                return <Badge variant="secondary" className="text-xs">Unknown</Badge>;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !child) {
        return (
            <div className="text-center py-8 sm:py-12 px-4">
                <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">
                    {error || 'Child not found'}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                    The child you're looking for could not be found.
                </p>
                <Button onClick={handleBack} className="w-full sm:w-auto">
                    Back to Children
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBack}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden xs:inline">Back</span>
                    </Button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            {child.full_name}'s Profile
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            View and manage your child's tutoring information
                        </p>
                    </div>
                </div>
                <Button 
                    onClick={handleEdit} 
                    className="flex items-center gap-2 w-full sm:w-auto justify-center"
                    size="sm"
                >
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Left Column - Profile Information */}
                <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardHeader className="text-center pb-4 p-4 sm:p-6">
                            <div className="relative inline-block">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 overflow-hidden">
                                    {child.photo_url ? (
                                        <img
                                            src={`${BASE_URL}${child.photo_url}`}
                                            alt="Profile"
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        child.full_name?.charAt(0)?.toUpperCase() || 'C'
                                    )}
                                </div>
                            </div>
                            <CardTitle className="text-lg sm:text-xl">{child.full_name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{child.email}</span>
                            </div>
                            {child.phone_number && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{child.phone_number}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {child.age} years old
                                </span>
                            </div>
                            {child.address && (
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{child.address}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Joined {new Date(child.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                                Quick Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                            <div className="flex justify-between items-center">
                                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Sessions</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{studentDetails?.totalSessions || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Completed</span>
                                <span className="font-semibold text-green-600">{studentDetails?.completedSessions || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Upcoming</span>
                                <span className="font-semibold text-blue-600">{studentDetails?.upcomingSessions || 0}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    {/* Academic Information */}
                    <Card>
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
                                Academic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Academic Level</label>
                                    <p className="text-sm sm:text-base text-gray-900 dark:text-white mt-1">
                                        {child.academic_level ? getAcademicLevelName(child.academic_level._id)?.level || 'Not specified' : 'Not specified'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Account Status</label>
                                    <div className="mt-1">
                                        <Badge
                                            variant={child.is_verified === 'active' ? 'default' : 'secondary'}
                                            className={`text-xs ${child.is_verified === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                                        >
                                            {child.is_verified === 'active' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {child.preferred_subjects && child.preferred_subjects.length > 0 && (
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Subjects</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {child.preferred_subjects.map((subjectId) => {
                                            const subject = getSubjectName(subjectId);
                                            return subject ? (
                                                <Badge key={subjectId} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                                    <BookOpen className="h-3 w-3 mr-1" />
                                                    {subject.name}
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Hired Tutors Section */}
                    {studentDetails?.hired_tutors && studentDetails.hired_tutors.length > 0 && (
                        <Card>
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Requested Tutors
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Click on any tutor to view their complete profile and details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0">
                                <div className="space-y-3 sm:space-y-4">
                                    {studentDetails.hired_tutors.map((hiredTutor) => (
                                        <div
                                            key={hiredTutor._id}
                                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 cursor-pointer hover:shadow-lg hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
                                            onClick={() => handleTutorClick(hiredTutor.tutor._id)}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden">
                                                        {hiredTutor.tutor.photo_url ? (
                                                            <img
                                                                src={`${BASE_URL}${hiredTutor.tutor.photo_url}`}
                                                                alt="Tutor"
                                                                className="w-full h-full rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            hiredTutor.tutor.full_name?.charAt(0)?.toUpperCase() || 'T'
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                                            {hiredTutor.tutor.full_name}
                                                        </h4>
                                                        <div className="sm:hidden mt-1">
                                                            {getStatusBadge(hiredTutor.status)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="hidden sm:block text-right">
                                                    {getStatusBadge(hiredTutor.status)}
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {formatDate(hiredTutor.hired_at)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 mb-3">
                                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject</div>
                                                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                                        {hiredTutor.subject.name}
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Academic Level</div>
                                                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                                        {hiredTutor.academic_level.level}
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hourly Rate</div>
                                                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                                        £{hiredTutor.tutor.hourly_rate || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>

                                            {hiredTutor.tutor.rating && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                                                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                                        {hiredTutor.tutor.rating} / 5.0
                                                    </span>
                                                </div>
                                            )}

                                            {/* Mobile date display */}
                                            <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                {formatDate(hiredTutor.hired_at)}
                                            </div>

                                            {/* Click indicator */}
                                            <div className="pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                                                        Click to view full profile
                                                    </span>
                                                    <div className="flex items-center gap-1 text-primary group-hover:text-primary/80 transition-colors">
                                                        <span className="text-xs font-medium hidden xs:inline">View Profile</span>
                                                        <ArrowLeft className="h-3 w-3 rotate-180 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Learning Preferences */}
                    {(child.learning_goals || child.special_needs || child.preferred_learning_style) && (
                        <Card>
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                    <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Learning Preferences
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                                {child.learning_goals && (
                                    <div>
                                        <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Learning Goals</label>
                                        <p className="text-sm sm:text-base text-gray-900 dark:text-white mt-1">{child.learning_goals}</p>
                                    </div>
                                )}
                                {child.preferred_learning_style && (
                                    <div>
                                        <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Learning Style</label>
                                        <p className="text-sm sm:text-base text-gray-900 dark:text-white mt-1">{child.preferred_learning_style}</p>
                                    </div>
                                )}
                                {child.special_needs && (
                                    <div>
                                        <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Special Needs</label>
                                        <p className="text-sm sm:text-base text-gray-900 dark:text-white mt-1">{child.special_needs}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <ChildDetailModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                child={child}
                onChildUpdated={handleChildUpdated}
            />
        </div>
    );
};

export default ChildViewPage;