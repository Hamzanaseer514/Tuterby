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
  getTutorAcademicLevels,
  getTutorSubjectsForLevel,
  getStudentsForAssignment,
  getUnreadSubmissionsCount,
  getSubmittedAssignments,
} = require('../Controllers/assignmentController');

// Memory storage for S3 uploads
const memoryStorage = multer.memoryStorage();

const upload = multer({ storage: memoryStorage });
const uploadSubmission = multer({ storage: memoryStorage });

// Tutor creates an assignment for a student
router.post('/tutor/:user_id/assignments', protect, upload.single('file'), createAssignment);

// Tutor edits an assignment
router.put('/tutor/:user_id/assignments/:assignment_id', protect, upload.single('file'), require('../Controllers/assignmentController').editAssignment);

// Tutor deletes an assignment (also removes submissions)
router.delete('/tutor/:user_id/assignments/:assignment_id', protect, require('../Controllers/assignmentController').deleteAssignment);

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

// Tutor deletes a submission
router.delete('/tutor/:user_id/submissions/:submission_id', protect, require('../Controllers/assignmentController').deleteSubmission);

// New assignment creation flow APIs
router.get('/tutor/:user_id/academic-levels', protect, getTutorAcademicLevels);
router.get('/tutor/:user_id/academic-levels/:academic_level_id/subjects', protect, getTutorSubjectsForLevel);
router.get('/tutor/:user_id/academic-levels/:academic_level_id/subjects/:subject_id/students', protect, getStudentsForAssignment);

// Notification and submitted assignments APIs
router.get('/tutor/:user_id/unread-submissions-count', protect, getUnreadSubmissionsCount);
router.get('/tutor/:user_id/submitted-assignments', protect, getSubmittedAssignments);

module.exports = router;


