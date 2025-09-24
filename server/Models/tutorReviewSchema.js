const mongoose = require('mongoose');

const tutorReviewSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  tutor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TutorProfile',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review_text: {
    type: String,
    default: '',
    maxlength: 1000
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure one review per student per tutor
tutorReviewSchema.index({ student_id: 1, tutor_id: 1 }, { unique: true });

module.exports = mongoose.model('TutorReview', tutorReviewSchema);

