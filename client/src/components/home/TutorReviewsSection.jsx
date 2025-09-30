import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, UserCircle, Sparkles, Quote, Filter, X, Search } from 'lucide-react';
import { BASE_URL } from '@/config';

const TutorReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    rating: '',
    reviewerType: '',
    tutorName: '',
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTutorReviews();
  }, []);

  const fetchTutorReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/tutor-reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      // console.error('Error fetching tutor reviews:', error);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => setVisibleCount(prev => prev + 6);
  const handleShowLess = () => setVisibleCount(6);

  // Filter functions
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setVisibleCount(6); // Reset visible count when filters change
  };

  const resetFilters = () => {
    setFilters({
      rating: '',
      reviewerType: '',
      tutorName: '',
      searchTerm: ''
    });
    setVisibleCount(6);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Get unique tutors for filter dropdown
  const uniqueTutors = useMemo(() => {
    const tutors = reviews
      .map(review => review.tutor?.name)
      .filter(name => name && name !== 'Unknown')
      .filter((name, index, arr) => arr.indexOf(name) === index)
      .sort();
    return tutors;
  }, [reviews]);

  // Filter reviews based on current filters
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      // Rating filter
      if (filters.rating && review.rating !== parseInt(filters.rating)) {
        return false;
      }

      // Reviewer type filter
      if (filters.reviewerType && review.reviewer?.type !== filters.reviewerType) {
        return false;
      }

      // Tutor name filter
      if (filters.tutorName && review.tutor?.name !== filters.tutorName) {
        return false;
      }

      // Search term filter (searches in review text, reviewer name, and tutor name)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const reviewText = (review.review_text || '').toLowerCase();
        const reviewerName = (review.reviewer?.name || '').toLowerCase();
        const tutorName = (review.tutor?.name || '').toLowerCase();
        
        if (!reviewText.includes(searchLower) && 
            !reviewerName.includes(searchLower) && 
            !tutorName.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [reviews, filters]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading) {
    return <div className="py-10 text-center">Loading reviews...</div>;
  }

  if (error) {
    return <div className="py-10 text-center text-red-600">{error}</div>;
  }

  return (
    <section className="py-10 md:py-12 bg-background dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-10"
        >
          <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-2" />
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Real Stories of <span className="gradient-text">Brilliance Ignited</span>
          </h2>
          <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how TutorNearby has helped students and parents forge brighter academic futures.
          </p>
        </motion.div>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* Filter Toggle Button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  {Object.values(filters).filter(v => v !== '').length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Search Input */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Search Reviews
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by review text, reviewer, or tutor..."
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Rating
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>

                {/* Reviewer Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Reviewer Type
                  </label>
                  <select
                    value={filters.reviewerType}
                    onChange={(e) => handleFilterChange('reviewerType', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">All Types</option>
                    <option value="parent">Parent</option>
                    <option value="student">Student</option>
                  </select>
                </div>
              </div>

          
              {/* Reset Filters Button */}
              {hasActiveFilters && (
                <div className="flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Reset All Filters
                  </button>
                </div>
              )}

              {/* Results Count */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredReviews.length} of {reviews.length} reviews
                  {hasActiveFilters && ' (filtered)'}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Reviews Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {filteredReviews.slice(0, visibleCount).map((review) => (
            <motion.div key={review._id} className="h-full">
              <div className="relative h-full flex flex-col p-6 rounded-xl shadow-xl border border-border/70 bg-gradient-to-br from-card via-muted/5 to-card dark:from-slate-800 dark:via-slate-700/30 dark:to-slate-800 hover:shadow-primary/20 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 ease-in-out group">
                <Quote className="absolute top-4 right-4 w-12 h-12 text-primary/10 dark:text-primary/20" />

                {/* Reviewer Info */}
                <div className="mb-4 z-10 flex items-center gap-3">
                  {review.reviewer?.photo_url ? (
                    <img
                      src={`${BASE_URL}${review.reviewer.photo_url}`}
                      alt={review.reviewer.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                      <UserCircle className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground text-md">
                      {review.reviewer?.name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {review.reviewer?.type === 'parent' ? 'Parent' : 'Student'}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex mb-3 z-10">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-yellow-400/50'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground font-medium">
                    {review.rating}/5
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-sm text-muted-foreground italic mb-4 flex-grow leading-relaxed z-10">
                  "{review.review_text || 'Great tutor!'}"
                </p>

                {/* Tutor Info */}
                <div className="mt-auto z-10 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Tutor: <span className="font-medium text-primary">{review.tutor?.name || 'Unknown'}</span>
                  </span>
                  <span className="text-xs text-muted-foreground/70">
                    {formatDate(review.created_at)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Load More / Show Less Buttons */}
        {filteredReviews.length > 0 && (
          <div className="text-center mt-10">
            {visibleCount < filteredReviews.length && (
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium mr-3"
              >
                Load More
              </button>
            )}
            {visibleCount > 6 && (
              <button
                onClick={handleShowLess}
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm font-medium"
              >
                Show Less
              </button>
            )}
          </div>
        )}

        {/* No Results Message */}
        {filteredReviews.length === 0 && reviews.length > 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Filter className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No reviews match your filters</h3>
              <p className="text-sm">Try adjusting your search criteria or reset the filters to see all reviews.</p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default React.memo(TutorReviewsSection);
