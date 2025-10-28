import React, { useState, useEffect } from 'react';
import { 
  StarIcon, 
  MagnifyingGlassIcon,
  UserCircleIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { getAllTutorReviews } from '../../services/adminService';
import AdminLayout from '../../components/admin/components/AdminLayout';
import { BASE_URL } from "../../config";

const TutorReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true); // Start with true to show loading
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showTutorList, setShowTutorList] = useState(true);
  const [tutorsWithReviews, setTutorsWithReviews] = useState([]);

  const reviewsPerPage = 50; // Increased from 10 for better performance

  // Fetch all reviews and group by tutor
  const fetchReviews = async (page = 1, search = '', tutorId = '') => {
    try {
      setLoading(true);
      const filters = {
        page,
        limit: reviewsPerPage,
        ...(search && { search }),
        ...(tutorId && { tutor_id: tutorId })
      };

      const response = await getAllTutorReviews(filters);
      
      if (response.success) {
        setReviews(response.reviews);
        setCurrentPage(response.pagination.current_page);
        setTotalPages(response.pagination.total_pages);
        setTotalReviews(response.pagination.total_reviews);
        
        // If no specific tutor selected, group reviews by tutor (for both normal view and search)
        if (!tutorId) {
          const tutorMap = new Map();
          response.reviews.forEach(review => {
            const tutorId = review.tutor._id;
            if (!tutorMap.has(tutorId)) {
              tutorMap.set(tutorId, {
                tutor: review.tutor,
                reviews: [],
                totalReviews: 0,
                averageRating: 0
              });
            }
            tutorMap.get(tutorId).reviews.push(review);
            tutorMap.get(tutorId).totalReviews += 1;
          });

          // Calculate average ratings
          const tutorsArray = Array.from(tutorMap.values()).map(tutorData => {
            const totalRating = tutorData.reviews.reduce((sum, review) => sum + review.rating, 0);
            tutorData.averageRating = tutorData.totalReviews > 0 ? totalRating / tutorData.totalReviews : 0;
            return tutorData;
          });

          setTutorsWithReviews(tutorsArray);
        }
      }
    } catch (err) {
      setError('Failed to fetch reviews');
      //console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Keep showing tutor list but filter based on search
    setShowTutorList(true);
    fetchReviews(1, searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowTutorList(true);
    fetchReviews(1, '');
  };

  const handleTutorSelect = (tutorData) => {
    setSelectedTutor(tutorData);
    setShowTutorList(false);
    fetchReviews(1, '', tutorData.tutor._id);
  };

  const handleBackToTutors = () => {
    setSelectedTutor(null);
    setShowTutorList(true);
    setSearchTerm('');
    fetchReviews();
  };

  const handlePageChange = (newPage) => {
    fetchReviews(newPage, searchTerm, selectedTutor?.tutor._id);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIconSolid
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const renderTutorCard = (tutorData) => (
    <div
      key={tutorData.tutor._id}
      onClick={() => handleTutorSelect(tutorData)}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {tutorData.tutor.photo_url ? (
            <img
            //   src={tutorData.tutor.photo_url}
              src={`${tutorData.tutor.photo_url}`}   
              alt={tutorData.tutor.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {tutorData.tutor.name}
          </h3>
          <p className="text-sm text-gray-600 truncate">{tutorData.tutor.email}</p>
          
          <div className="mt-2 flex items-center space-x-4">
            <div className="flex items-center">
              {renderStars(Math.round(tutorData.averageRating))}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
              {tutorData.totalReviews} review{tutorData.totalReviews !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <EyeIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );

  const renderReviewCard = (review) => (
    <div key={review._id} className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {review.reviewer?.photo_url ? (
            <img
              src={`${review.reviewer.photo_url}`}
              alt={review.reviewer.name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
              <UserCircleIcon className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                {review.reviewer?.name || review.student?.name || 'Anonymous'}
              </h4>
              <p className="text-xs text-gray-500">
                {review.reviewer?.type === 'parent' ? 'Parent' : 'Student'} • {review.reviewer?.email || review.student?.email || ''}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {renderStars(review.rating)}
              <span className="text-xs text-gray-500">
                <CalendarIcon className="h-3 w-3 inline mr-1" />
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {review.review_text && (
            <div className="mt-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                {review.review_text}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * reviewsPerPage) + 1} to{' '}
          {Math.min(currentPage * reviewsPerPage, totalReviews)} of {totalReviews} reviews
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          
          <span className="px-3 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <AdminLayout tabValue="tutor-reviews">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    // <AdminLayout tabValue="tutor-reviews">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tutor Reviews</h1>
            <p className="text-gray-600">Manage and view all tutor reviews</p>
          </div>
          
          {selectedTutor && (
            <button
              onClick={handleBackToTutors}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Back to Tutors
            </button>
          )}
        </div>

        {/* Search - Only show when not viewing specific tutor reviews */}
        {!selectedTutor && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student name or tutor name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    // Auto-search as user types
                    if (e.target.value.length >= 2 || e.target.value.length === 0) {
                      fetchReviews(1, e.target.value);
                    }
                  }}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {showTutorList ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {searchTerm ? `Search Results for "${searchTerm}"` : 'Tutors with Reviews'} ({tutorsWithReviews.length})
              </h2>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600">Loading tutors...</p>
                </div>
              </div>
            ) : tutorsWithReviews.length === 0 ? (
              <div className="text-center py-12">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No Tutors Found' : 'No Reviews Yet'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? `No tutors found matching "${searchTerm}".` : 'No tutors have received reviews yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorsWithReviews.map(renderTutorCard)}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {selectedTutor && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  {selectedTutor.tutor.photo_url ? (
                    <img
                    //   src={selectedTutor.tutor.photo_url}
                      src={`${selectedTutor.tutor.photo_url}`}
                      alt={selectedTutor.tutor.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserCircleIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedTutor.tutor.name}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedTutor.tutor.email}</p>
                    <div className="flex items-center mt-1">
                      {renderStars(Math.round(selectedTutor.averageRating))}
                      <span className="ml-2 text-sm text-gray-600">
                        ({selectedTutor.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedTutor ? `${selectedTutor.tutor.name}'s Reviews` : 'All Reviews'} ({totalReviews})
              </h2>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600">Loading reviews...</p>
                </div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'No reviews match your search criteria.' : 'No reviews available.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(renderReviewCard)}
                {renderPagination()}
              </div>
            )}
          </div>
        )}
      </div>
    // </AdminLayout>
  );
};

export default TutorReviewsPage;
