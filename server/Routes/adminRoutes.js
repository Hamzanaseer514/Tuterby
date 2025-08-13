// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../Middleware/authMiddleware");
const {
  setAvailableInterviewSlots,
  getAllPendingApplications,
  selectInterviewSlot,
  // verifyBackgroundCheck,
  // verifyReferenceChecks,
  // verifyQualifications,
  approveTutorProfile,
  rejectTutorProfile,
  partialApproveTutor,
  verifyDocument,
  // New comprehensive admin functions
  getAllUsers,
  getTutorDetails,
  completeInterview,
  getAvailableInterviewSlots,
  updateApplicationNotes,
  getDashboardStats,
  updateInterviewToggle,
  toggleOtpRule,
  addEducationLevel,
  getEducationLevels,
  getOtpStatus,
  updateEducationLevel,
  deleteEducationLevel,
  getSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
  getAllChatsOfUsers,
  manageEducationLevel
} = require("../Controllers/adminController");



// ADD RULED AND EDUCATOIN LEVEL.
router.post("/rules/toggle-otp", toggleOtpRule);
router.get("/rules/otp-status", getOtpStatus);
router.post("/education-levels", addEducationLevel);
router.get("/education-levels", getEducationLevels);
router.put("/education-levels/:id", updateEducationLevel);
router.delete("/education-levels/:id", deleteEducationLevel);
router.put("/education-levels/:id/manage", manageEducationLevel);

// Subjects
router.post("/subjects", addSubject);
router.get("/subjects", getSubjects);
router.put("/subjects/:id", updateSubject);
router.delete("/subjects/:id", deleteSubject);

// users chat
router.get("/chats", getAllChatsOfUsers);

// Existing routes
router.get("/tutors/applications/pending", getAllPendingApplications);
router.put("/tutors/interview/assign", setAvailableInterviewSlots);
router.post("/tutors/interview/select", selectInterviewSlot);
router.put("/tutors/:user_id/interview-toggle", updateInterviewToggle);
// router.post('/tutors/verify/background', verifyBackgroundCheck);
// router.post('/tutors/verify/references', verifyReferenceChecks);
// router.post('/tutors/verify/qualifications', verifyQualifications);
router.post("/tutors/approve", approveTutorProfile);
router.post("/tutors/reject", rejectTutorProfile);
router.post("/tutors/partial-approve", partialApproveTutor);
router.post("/tutors/verify/document", verifyDocument);

// New comprehensive admin routes
router.get("/users", getAllUsers);
router.get("/tutors/:user_id", getTutorDetails);
router.post("/interviews/complete", completeInterview);
router.get("/interviews/available-slots", getAvailableInterviewSlots);
router.put("/applications/notes", updateApplicationNotes);
router.get("/dashboard/stats", getDashboardStats);

module.exports = router;
