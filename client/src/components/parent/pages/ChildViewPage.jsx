import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useParent } from '../../../contexts/ParentContext';
import { useSubject } from '../../../hooks/useSubject';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
// import { Separator } from '../../ui/separator';
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
    const { user } = useAuth();
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
          console.error("Error fetching child data:", error);
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
            console.error('Error fetching student details:', error);
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
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'accepted':
                return <Badge variant="default" className="bg-green-100 text-green-800">Accepted</Badge>;
            case 'rejected':
                return <Badge variant="destructive" className="bg-red-100 text-red-800">Rejected</Badge>;
            default:
                return <Badge variant="secondary">Unknown</Badge>;
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
            <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {error || 'Child not found'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                    The child you're looking for could not be found.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {child.full_name}'s Profile
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            View and manage your child's tutoring information
                        </p>
                    </div>
                </div>
                <Button onClick={handleEdit} className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Information */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardHeader className="text-center pb-4">
                            <div className="relative inline-block">
                                <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                                    {child.photo_url ? (
                                        <img
                                            src={`${BASE_URL}${child.photo_url}`}
                                            alt="Profile"
                                            className="w-32 h-32 rounded-full object-cover"
                                        />
                                    ) : (
                                        child.full_name?.charAt(0)?.toUpperCase() || 'C'
                                    )}
                                </div>
                                {/* <div className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full">
                  <Camera className="h-4 w-4" />
                </div> */}
                            </div>
                            <CardTitle className="text-xl">{child.full_name}</CardTitle>
                            <CardDescription>
                                <Badge
                                    variant={child.is_verified === 'active' ? 'default' : 'secondary'}
                                    className={child.is_verified === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                                >
                                    {child.is_verified === 'active' ? 'Active Account' : 'Inactive Account'}
                                </Badge>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{child.email}</span>
                            </div>
                            {child.phone_number && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{child.phone_number}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {child.age} years old
                                </span>
                            </div>
                            {child.address && (
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{child.address}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-gray-500" />
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
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Quick Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{studentDetails.totalSessions}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                                <span className="font-semibold text-green-600">{studentDetails.completedSessions}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Upcoming</span>
                                <span className="font-semibold text-blue-600">{studentDetails.upcomingSessions}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Academic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <GraduationCap className="h-5 w-5" />
                                Academic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Academic Level</label>
                                    <p className="text-gray-900 dark:text-white mt-1">
                                        {child.academic_level ? getAcademicLevelName(child.academic_level._id)?.level || 'Not specified' : 'Not specified'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Status</label>
                                    <div className="mt-1">
                                        <Badge
                                            variant={child.is_verified === 'active' ? 'default' : 'secondary'}
                                            className={child.is_verified === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                                        >
                                            {child.is_verified === 'active' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {child.preferred_subjects && child.preferred_subjects.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Subjects</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {child.preferred_subjects.map((subjectId) => {
                                            const subject = getSubjectName(subjectId);
                                            return subject ? (
                                                <Badge key={subjectId} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
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
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Requested Tutors
                                </CardTitle>
                                <CardDescription>
                                    Click on any tutor to view their complete profile and details
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {studentDetails.hired_tutors.map((hiredTutor) => (
                                        <div
                                            key={hiredTutor._id}
                                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-lg hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
                                            onClick={() => handleTutorClick(hiredTutor.tutor._id)}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-semibold">

                                                        {hiredTutor.tutor.photo_url ? (
                                                            <img
                                                                src={`${BASE_URL}${hiredTutor.tutor.photo_url}`}
                                                                alt="Tutor"
                                                                className="w-12 h-12 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            hiredTutor.tutor.full_name?.charAt(0)?.toUpperCase() || 'T'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                                            {hiredTutor.tutor.full_name}
                                                        </h4>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {getStatusBadge(hiredTutor.status)}
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {formatDate(hiredTutor.hired_at)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject</div>
                                                    <div className="font-semibold text-gray-900 dark:text-white">
                                                        {hiredTutor.subject.name}
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Academic Level</div>
                                                    <div className="font-semibold text-gray-900 dark:text-white">
                                                        {hiredTutor.academic_level.level}
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hourly Rate</div>
                                                    <div className="font-semibold text-gray-900 dark:text-white">
                                                        £{hiredTutor.tutor.hourly_rate || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>

                                            {hiredTutor.tutor.rating && (
                                                <div className="flex items-center gap-2">
                                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        {hiredTutor.tutor.rating} / 5.0
                                                    </span>
                                                </div>
                                            )}

                                            {/* Click indicator */}
                                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                                                        Click to view full profile
                                                    </span>
                                                    <div className="flex items-center gap-1 text-primary group-hover:text-primary/80 transition-colors">
                                                        <span className="text-xs font-medium">View Profile</span>
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
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Learning Preferences
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {child.learning_goals && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Learning Goals</label>
                                        <p className="text-gray-900 dark:text-white mt-1">{child.learning_goals}</p>
                                    </div>
                                )}
                                {child.preferred_learning_style && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Learning Style</label>
                                        <p className="text-gray-900 dark:text-white mt-1">{child.preferred_learning_style}</p>
                                    </div>
                                )}
                                {child.special_needs && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Special Needs</label>
                                        <p className="text-gray-900 dark:text-white mt-1">{child.special_needs}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button variant="outline" className="h-12">
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Schedule Session
                                </Button>
                                <Button variant="outline" className="h-12">
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    View Progress
                                </Button>
                                <Button variant="outline" className="h-12">
                                    <Award className="h-4 w-4 mr-2" />
                                    View Certificates
                                </Button>
                                <Button variant="outline" className="h-12">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Contact Tutor
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
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
