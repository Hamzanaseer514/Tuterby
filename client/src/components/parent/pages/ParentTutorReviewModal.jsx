import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useParent } from '../../../contexts/ParentContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Star, User, X } from 'lucide-react';
import { BASE_URL } from '../../../config';

const ParentTutorReviewModal = ({ tutor, isOpen, onClose, onReviewSubmitted }) => {
  const { user } = useAuth();
  const { submitParentReview } = useParent();
  
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating || rating < 1 || rating > 5) {
      return;
    }

    try {
      setSubmitting(true);
      
      await submitParentReview(user._id, {
        tutor_id: tutor._id,
        rating: rating,
        review_text: reviewText.trim()
      });

      onReviewSubmitted();
      onClose();
      
      // Reset form
      setRating(5);
      setReviewText('');
    } catch (error) {
      // console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
      // Reset form
      setRating(5);
      setReviewText('');
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          className={`p-1 transition-colors ${
            i <= rating ? 'text-yellow-500' : 'text-gray-300'
          } hover:text-yellow-400`}
          disabled={submitting}
        >
          <Star className={`w-5 h-5 sm:w-6 sm:h-6 ${i <= rating ? 'fill-current' : ''}`} />
        </button>
      );
    }
    return stars;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              {tutor.photo_url ? (
                <img
                  src={`${BASE_URL}${tutor.photo_url}`}
                  alt="Profile"
                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-lg font-semibold truncate">Rate {tutor.full_name}</div>
              <div className="text-xs sm:text-sm text-gray-500">Share your experience</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
              How would you rate this tutor?
            </label>
            <div className="flex items-center gap-1 sm:gap-2">
              {renderStars()}
              <span className="ml-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {rating} star{rating !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Write a review (optional)
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this tutor..."
              className="min-h-[80px] sm:min-h-[100px] resize-none text-xs sm:text-sm"
              maxLength={1000}
              disabled={submitting}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {reviewText.length}/1000 characters
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !rating}
              className="flex-1 order-1 sm:order-2"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParentTutorReviewModal;
