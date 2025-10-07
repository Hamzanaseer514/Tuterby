const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
  assignment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
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
  submission_text: {
    type: String,
    default: ''
  },
  submission_file_url: {
    type: String,
    default: ''
  },
  submission_file_name: {
    type: String,
    default: ''
  },
  submission_file_mime_type: {
    type: String,
    default: ''
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  is_late: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned'],
    default: 'submitted'
  },
  grade: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  feedback: {
    type: String,
    default: ''
  },
  graded_at: {
    type: Date,
    default: null
  }
}, { timestamps: true });

assignmentSubmissionSchema.index({ assignment_id: 1, student_id: 1 });
assignmentSubmissionSchema.index({ tutor_id: 1, status: 1 });
assignmentSubmissionSchema.index({ submitted_at: -1 });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);


