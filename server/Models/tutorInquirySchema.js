const mongoose = require('mongoose');

const tutorInquirySchema = new mongoose.Schema({
  tutor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied', 'converted_to_booking'],
    default: 'unread'
  },
  response_time_minutes: {
    type: Number,
    default: null
  },
  replied_at: {
    type: Date
  },
  converted_to_session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TutoringSession'
  }
}, { timestamps: true });

// Index for efficient queries
tutorInquirySchema.index({ tutor_id: 1, status: 1 });
tutorInquirySchema.index({ created_at: -1 });

module.exports = mongoose.model('TutorInquiry', tutorInquirySchema); 