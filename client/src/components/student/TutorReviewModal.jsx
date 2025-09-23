import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BASE_URL } from '@/config';
import { useToast } from '../ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Star, MessageSquare } from 'lucide-react';

const TutorReviewModal = ({ tutor, isOpen, onClose, onReviewSubmitted }) => {
  const { getAuthToken, user, fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    if (isOpen && tutor) {
      fetchExistingReview();
    }
  }, [isOpen, tutor]);

  const fetchExistingReview = async () => {
    try {
      const token = getAuthToken();
      const response = await fetchWithAuth(
        `${BASE_URL}/api/auth/student/${user._id}/tutor/${tutor._id}/review`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        },
        token,
        (newToken) => localStorage.setItem("authToken", newToken)
      );

      if (response.ok) {
        const data = await response.json();
        if (data.review) {
          setExistingReview(data.review);
          setRating(data.review.rating);
          setReviewText(data.review.review_text);
        }
      }
    } catch (error) {
      console.error('Error fetching existing review:', error);
    }
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetchWithAuth(
        `${BASE_URL}/api/auth/student/${user._id}/rate-tutor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tutor_id: tutor._id,
            rating: rating,
            review_text: reviewText
          })
        },
        token,
        (newToken) => localStorage.setItem("authToken", newToken)
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }

      const data = await response.json();
      
      toast({
        title: "Success",
        description: data.message,
        variant: "default"
      });

      onReviewSubmitted();
      onClose();
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setReviewText('');
    setExistingReview(null);
    onClose();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-8 h-8 cursor-pointer transition-colors ${
            i <= rating 
              ? 'text-yellow-500 fill-current' 
              : 'text-gray-300 hover:text-yellow-400'
          }`}
          onClick={() => handleStarClick(i)}
        />
      );
    }
    return stars;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {existingReview ? 'Update Review' : 'Rate & Review Tutor'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tutor Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {tutor.user_id?.photo_url ? (
              <img
                src={`${BASE_URL}${tutor.user_id.photo_url}`}
                alt={tutor.user_id.full_name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {tutor.user_id?.full_name?.charAt(0) || 'T'}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {tutor.user_id?.full_name || 'Tutor'}
              </h3>
              <p className="text-sm text-gray-600">
                {tutor.location || 'Location not specified'}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Rating *
            </label>
            <div className="flex items-center gap-1">
              {renderStars()}
              <span className="ml-2 text-sm text-gray-600">
                {rating > 0 && `${rating} star${rating > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Review (Optional)
            </label>
            <Textarea
              placeholder="Share your experience with this tutor..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 text-right">
              {reviewText.length}/1000 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={loading || rating === 0}
            >
              {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TutorReviewModal;
