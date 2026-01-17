const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  tutor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TutorProfile',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  academic_level: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EducationLevel',
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  file_url: { type: String, default: '' },
  file_name: { type: String, default: '' },
  file_mime_type: { type: String, default: '' },
  due_date: { type: Date, default: null },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

assignmentSchema.index({ tutor_id: 1, student_id: 1, createdAt: -1 });
assignmentSchema.index({ subject: 1, academic_level: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
