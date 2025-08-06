const mongoose = require('mongoose');

const tutoringSessionSchema = new mongoose.Schema({
  tutor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TutorProfile',
    required: true
  },
  student_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  }],
  subject: {
    type: String,
    required: true
  },
  session_date: {
    type: Date,
    required: true
  },
  duration_hours: {
    type: Number,
    required: true,
    min: 0.25, // Minimum 15 minutes
    max: 8 // Maximum 8 hours per session
  },
  hourly_rate: {
    type: Number,
    required: true,
    min: 0
  },
  total_earnings: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    default: ''
  },
  completed_at: {
    type: Date
  }
}, { timestamps: true });

// Index for efficient queries
tutoringSessionSchema.index({ tutor_id: 1, status: 1 });
tutoringSessionSchema.index({ session_date: 1 });
tutoringSessionSchema.index({ student_ids: 1 });

module.exports = mongoose.model('TutoringSession', tutoringSessionSchema); 