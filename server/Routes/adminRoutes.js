// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
  setAvailableInterviewSlots,
  getAllPendingApplications,
  selectInterviewSlot,
  verifyBackgroundCheck,
  verifyReferenceChecks,
  verifyQualifications,
  approveTutorProfile,
  rejectTutorProfile
} = require('../Controllers/adminController');

router.get('/tutors/applications/pending', getAllPendingApplications);
router.post('/tutors/interview/assign', setAvailableInterviewSlots);
router.post('/tutors/interview/select', selectInterviewSlot);
router.post('/tutors/verify/background', verifyBackgroundCheck);
router.post('/tutors/verify/references', verifyReferenceChecks);
router.post('/tutors/verify/qualifications', verifyQualifications);
router.post('/tutors/approve', approveTutorProfile);
router.post('/tutors/reject', rejectTutorProfile);

module.exports = router;