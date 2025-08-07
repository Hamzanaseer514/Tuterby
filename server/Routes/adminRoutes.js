// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../Middleware/authMiddleware');
const {
  setAvailableInterviewSlots,
  getAllPendingApplications,
  selectInterviewSlot,
  verifyBackgroundCheck,
  verifyReferenceChecks,
  verifyQualifications,
  approveTutorProfile,
  rejectTutorProfile,
  // New comprehensive admin functions
  getAllUsers,
  getTutorDetails,
  scheduleInterview,
  completeInterview,
  getAvailableInterviewSlots,
  updateApplicationNotes,
  getDashboardStats
} = require('../Controllers/adminController');

// Apply authentication middleware to all admin routes
router.use(protect);
router.use(adminOnly);

// Existing routes
router.get('/tutors/applications/pending', getAllPendingApplications);
router.post('/tutors/interview/assign', setAvailableInterviewSlots);
router.post('/tutors/interview/select', selectInterviewSlot);
router.post('/tutors/verify/background', verifyBackgroundCheck);
router.post('/tutors/verify/references', verifyReferenceChecks);
router.post('/tutors/verify/qualifications', verifyQualifications);
router.post('/tutors/approve', approveTutorProfile);
router.post('/tutors/reject', rejectTutorProfile);

// New comprehensive admin routes
router.get('/users', getAllUsers);
router.get('/tutors/:userId', getTutorDetails);
router.post('/interviews/complete', completeInterview);
router.get('/interviews/available-slots', getAvailableInterviewSlots);
router.put('/applications/notes', updateApplicationNotes);
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;