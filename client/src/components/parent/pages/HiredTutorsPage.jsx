import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useParent } from '../../../contexts/ParentContext';
import { useSubject } from '../../../hooks/useSubject';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar } from '../../ui/avatar';
import { useToast } from '../../ui/use-toast';
import { Link } from 'react-router-dom';
import {
  User,
  Star,
  MapPin,
  Clock,
  Calendar,
  MessageCircle,
  BookOpen,
  Award,
  MessageSquare,
  Users,
  GraduationCap,
  CheckCircle,
  Eye
} from 'lucide-react';
import { BASE_URL } from '../../../config';
import ParentTutorReviewModal from './ParentTutorReviewModal';
import { useNavigate } from 'react-router-dom';

const HiredTutorsPage = () => {
  const { user } = useAuth();
  const { getParentHiredTutors, loading } = useParent();
  const { subjects, academicLevels } = useSubject();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [hiredTutors, setHiredTutors] = useState([]);
  const [loadingTutors, setLoadingTutors] = useState(true);
  const [error, setError] = useState(null);
  
  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);

  useEffect(() => {
    fetchHiredTutors();
  }, []);

  const fetchHiredTutors = async () => {
    try {
      setLoadingTutors(true);
      setError(null);
      
      const data = await getParentHiredTutors(user._id);
      setHiredTutors(data.tutors || []);
    } catch (error) {
      // console.error('Error fetching hired tutors:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load hired tutors",
        variant: "destructive"
      });
    } finally {
      setLoadingTutors(false);
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

  const renderStars = (rating) => {
    if (!rating || rating === 0) return null;
    
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 sm:w-4 sm:h-4 ${i <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  const handleOpenReviewModal = (tutor) => {
    setSelectedTutor(tutor);
    setReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedTutor(null);
  };

  const handleReviewSubmitted = () => {
    // Refresh the tutors list to show updated ratings
    fetchHiredTutors();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loadingTutors) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div className="space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Tutors
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">
            {hiredTutors.length > 0 
              ? `Your children have hired ${hiredTutors.length} tutor${hiredTutors.length > 1 ? 's' : ''}`
              : "Your children haven't hired any tutors yet"
            }
          </p>
        </div>

        {/* Content Section */}
        {hiredTutors.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
              <div className="text-gray-400 mb-3 sm:mb-4">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 mx-auto" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 dark:text-white mb-2">
                No Hired Tutors
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                Your children haven't hired any tutors yet. They can search and hire tutors from the tutors page.
              </p>
              <Link to="/parent-dashboard/tutors">
                <Button 
                  className="w-full sm:w-auto text-xs sm:text-sm"
                  size="sm"
                >
                  Find Tutors
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-4">
            {hiredTutors.map((tutor) => (
              <Card 
                key={tutor._id} 
                className="hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
              >
                <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
                  <div className="flex items-start justify-between space-x-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {tutor.photo_url ? (
                          <img
                            src={`${BASE_URL}${tutor.photo_url}`}
                            alt={`${tutor.full_name}'s profile`}
                            className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm sm:text-base lg:text-lg truncate leading-tight">
                          {tutor.full_name}
                        </CardTitle>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
                          {tutor.location || 'Location not specified'}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="default" 
                      className="bg-green-100 text-green-800 text-xs flex-shrink-0 whitespace-nowrap"
                    >
                      Hired
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-2 sm:space-y-3 flex-1 flex flex-col">
                  {/* Basic Info */}
                  <div className="space-y-1 sm:space-y-2 flex-1">
                    {tutor.experience_years && (
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Experience:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {tutor.experience_years} years
                        </span>
                      </div>
                    )}
                    
                    {tutor.average_rating && (
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                        <div className="flex items-center gap-1">
                          {renderStars(tutor.average_rating)}
                          <span className="font-semibold ml-1 text-gray-900 dark:text-white">
                            {tutor.average_rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Sessions:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {tutor.total_sessions || 0}
                      </span>
                    </div>
                  </div>

                  {/* Subjects */}
                  {tutor.subjects && tutor.subjects.length > 0 && (
                    <div className="flex-shrink-0">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        Subjects:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {tutor.subjects.slice(0, 2).map((subject, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs px-1.5 py-0"
                          >
                            {getSubjectName(subject)}
                          </Badge>
                        ))}
                        {tutor.subjects.length > 2 && (
                          <Badge 
                            variant="outline" 
                            className="text-xs px-1.5 py-0"
                          >
                            +{tutor.subjects.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col xs:flex-row gap-1 sm:gap-2 pt-2 flex-shrink-0">
                   
                    
                    <Button 
                      size="sm" 
                      className="flex-1 text-xs h-8 sm:h-9"
                      onClick={() => handleOpenReviewModal(tutor)}
                    >
                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline p-2">Rate & Review</span>
                      <span className="sm:hidden p-2">Review</span>
                    </Button>
                  </div>

                  {/* Verification Badges */}
                  {tutor.is_verified && (
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
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
      
        {/* Review Modal */}
        {selectedTutor && (
          <ParentTutorReviewModal
            tutor={selectedTutor}
            isOpen={reviewModalOpen}
            onClose={handleCloseReviewModal}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}
      </div>
    </div>
  );
};

export default HiredTutorsPage;