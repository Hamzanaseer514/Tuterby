const express = require('express');
const multer = require('multer');
const router = express.Router();
const { protect } = require('../Middleware/authMiddleware');
const {
  createAssignment,
  getTutorAssignments,
  getStudentAssignments,
  downloadAssignment,
  getPaidSubjectsAndLevels,
  submitAssignment,
  getStudentSubmissions,
  getTutorSubmissions,
  gradeSubmission,
} = require('../Controllers/assignmentController');

// Memory storage for S3 uploads
const memoryStorage = multer.memoryStorage();

const upload = multer({ storage: memoryStorage });
const uploadSubmission = multer({ storage: memoryStorage });

// Tutor creates an assignment for a student
router.post('/tutor/:user_id/assignments', protect, upload.single('file'), createAssignment);

// Tutor lists their assignments
router.get('/tutor/:user_id/assignments', protect, getTutorAssignments);

// Student lists their assignments
router.get('/student/:user_id/assignments', protect, getStudentAssignments);

// Download assignment file
router.get('/download/:assignment_id', protect, downloadAssignment);

// Get paid subjects and academic levels for assignment creation
router.get('/paid-subjects-levels/:tutor_user_id/:student_user_id', protect, getPaidSubjectsAndLevels);

// Student submits assignment
router.post('/submit/:assignment_id', protect, uploadSubmission.single('file'), submitAssignment);

// Student gets their submissions
router.get('/student/:user_id/submissions', protect, getStudentSubmissions);

// Tutor gets submissions for their assignments
router.get('/tutor/:user_id/submissions', protect, getTutorSubmissions);

// Tutor grades a submission
router.put('/grade/:submission_id', protect, gradeSubmission);

module.exports = router;


