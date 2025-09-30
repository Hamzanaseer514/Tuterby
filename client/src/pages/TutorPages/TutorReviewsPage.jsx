import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Star, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { BASE_URL } from '../../config';

const TutorReviewsPage = () => {
    const { getAuthToken, user, fetchWithAuth } = useAuth();
    const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const token = getAuthToken();

  const fetchReviews = useCallback(async (pageNum = 1) => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      setError(null);
        
      // First get tutor profile to get tutor_id
      const tutorResponse = await fetchWithAuth(`${BASE_URL}/api/tutor/profile/${user._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }, token, (newToken) => localStorage.setItem("authToken", newToken));
      if (!tutorResponse.ok) {
        throw new Error('Failed to fetch tutor profile');
      }

      const tutorData = await tutorResponse.json();
      const tutorId = tutorData._doc._id;

       // Now fetch reviews using tutor_id
       const response = await fetch(`${BASE_URL}/api/auth/tutor/${tutorId}/reviews?page=${pageNum}&limit=10`, {
         method: 'GET',
         headers: {
           'Content-Type': 'application/json'
         }
       });

       if (!response.ok) {
         throw new Error('Failed to fetch reviews');
       }

       const data = await response.json();
       
       if (pageNum === 1) {
         setReviews(data.reviews || []);
       } else {
         setReviews(prev => [...prev, ...(data.reviews || [])]);
       }
      
       setTotalReviews(data.pagination?.total_reviews || 0);
       setHasMore(data.pagination?.has_next || false);
      setPage(pageNum);
      
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user, token, fetchWithAuth]);

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchReviews(page + 1);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 sm:h-4 sm:w-4 ${
              i < rating ? 'text-amber-500 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
          {rating}/5
        </span>
      </div>
    );
  };

  const renderReviewCard = (review) => (
    <div key={review._id} className="bg-slate-50 dark:bg-slate-700 p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-3">
        <div className="flex items-center">
          <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
          <div className="min-w-0 flex-1">
             <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
               {review.reviewer?.name || review.student_name || 'Anonymous'}
             </h4>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {review.reviewer?.type === 'parent' ? 'Parent' : 'Student'} • {new Date(review.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          {renderStars(review.rating)}
        </div>
      </div>
      
      {review.review_text && (
        <div className="mt-3">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-xs sm:text-sm">
            "{review.review_text}"
          </p>
        </div>
      )}
    </div>
  );

  if (loading && reviews.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading your reviews...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="text-red-600 dark:text-red-400 mb-3 sm:mb-0">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="sm:ml-3 flex-1">
                  <h3 className="text-sm sm:text-base font-medium text-red-800 dark:text-red-200">
                    Error Loading Reviews
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  onClick={() => fetchReviews(1)}
                  variant="outline"
                  className="w-full sm:w-auto text-red-600 border-red-300 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Student Reviews
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Feedback from your students
                </p>
              </div>
              {totalReviews > 0 && (
                <div className="text-center sm:text-right">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {totalReviews}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Total Reviews
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Content */}
          <Card className="bg-white dark:bg-slate-800 shadow-sm">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                <div className="flex items-center">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 mr-2" />
                  Your Reviews
                </div>
                {totalReviews > 0 && (
                  <Badge variant="secondary" className="w-fit sm:ml-2">
                    {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map(renderReviewCard)}
                  
                  {hasMore && (
                    <div className="text-center pt-4 sm:pt-6">
                      <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="w-full sm:w-auto text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600 mr-2"></div>
                            <span className="text-xs sm:text-sm">Loading...</span>
                          </>
                        ) : (
                          <span className="text-xs sm:text-sm">Load More Reviews</span>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Star className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Reviews Yet
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto px-4">
                    You haven't received any reviews from students yet. Complete some tutoring sessions to start receiving feedback!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TutorReviewsPage;
