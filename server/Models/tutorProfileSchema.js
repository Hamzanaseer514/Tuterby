const mongoose = require('mongoose');

const tutorProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  qualifications: {
    type: String,
    default: ''
  },
  experience_years: {
    type: Number,
    default: 0
  },
  subjects: {
    type: [String],
    default: []
  },
  academic_levels_taught: {
    type: [String],
    default: []
  },
  hourly_rate: {
    type: Number,
    default: 0,
    min: 0
  },
  location: {
    type: String,
    default: ''
  },
  average_rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  total_sessions: {
    type: Number,
    default: 0
  },
  is_background_checked: {
    type: Boolean,
    default: false
  },
  is_reference_verified: {
    type: Boolean,
    default: false
  },
  is_qualification_verified: {
    type: Boolean,
    default: false
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  is_approved: {
    type: Boolean,
    default: false
  },
  profile_status: {
    type: String,
    enum: ['unverified', 'partial-approved', 'approved', 'rejected'],
    default: 'unverified'
  }
}, { timestamps: true });

module.exports = mongoose.model('TutorProfile', tutorProfileSchema);