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
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Subject",
    default: []
  },
  academic_levels_taught: [
    {
      educationLevel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EducationLevel",
        required: true
      },
      name: {
        type: String,
        required: true
      },
      hourlyRate: { type: Number, required: true, min: 0 },
      totalSessionsPerMonth: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      monthlyRate: { type: Number, min: 0 }
    }
  ],
  // hourly_rate: {
  //   type: Number,
  //   default: 0,
  //   min: 0
  // },
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
  profile_status: {
    type: String,
    enum: ['unverified', 'pending', 'approved', 'rejected', 'partial_approved'],
    default: 'unverified'
  },
  profile_status_reason: {
    type: String,
    default: '',
  }
}, { timestamps: true });

// Indexes for better query performance
tutorProfileSchema.index({ user_id: 1 });
tutorProfileSchema.index({ subjects: 1 });
tutorProfileSchema.index({ academic_levels_taught: 1 });
tutorProfileSchema.index({ average_rating: -1 });
tutorProfileSchema.index({ profile_status: 1 }); // Critical for dashboard stats
tutorProfileSchema.index({ is_verified: 1 });
tutorProfileSchema.index({ created_at: -1 });
tutorProfileSchema.index({ updated_at: -1 });

module.exports = mongoose.model('TutorProfile', tutorProfileSchema);