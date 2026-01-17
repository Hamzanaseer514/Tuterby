// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../Middleware/authMiddleware");
const {
  setAvailableInterviewSlots,
  getAllPendingApplications,
  selectInterviewSlot,
  approveTutorProfile,
  rejectTutorProfile,
  partialApproveTutor,
  verifyDocument,
  rejectGroupedDocuments,
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
  manageEducationLevel,
  addSubjectType,
  getSubjectTypes,
  updateSubjectType,
  deleteSubjectType,
  fetchSubjectRelatedToAcademicLevels,
    getAllTutorSessions,
  getAllTutorPayments,
    updateTutorSession,
    deleteTutorSession,
  updateTutorPayment,
  deleteTutorPayment,
  getAllTutorReviews,
  // Add delete handler for reviews
  deleteTutorReview,
  getAllHireRequests,
  updateHireRequest,
  deleteHireRequest,
  updateTutorByAdmin,
  removeTutorLevelByAdmin,
  updateParentByAdmin,
  updateStudentByAdmin,
} = require("../Controllers/adminController");

// Import assignment controller functions
const {
  getAllAssignments,
  getAllSubmissions
  , adminEditAssignment,
  adminDeleteAssignment
} = require("../Controllers/assignmentController");



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
router.get("/levelsubjects", fetchSubjectRelatedToAcademicLevels);

// Subjects Type
router.post("/subject-types", addSubjectType);
router.get("/subject-types", getSubjectTypes);
router.put("/subject-types/:id", updateSubjectType);
router.delete("/subject-types/:id", deleteSubjectType);

// users chat
router.get("/chats", getAllChatsOfUsers);

// Existing routes
router.get("/tutors/applications/pending", getAllPendingApplications);
router.put("/tutors/interview/assign", setAvailableInterviewSlots);
router.post("/tutors/interview/select", selectInterviewSlot);
router.put("/tutors/:user_id/interview-toggle", updateInterviewToggle);

router.post("/tutors/approve", approveTutorProfile);
router.post("/tutors/reject", rejectTutorProfile);
router.post("/tutors/partial-approve", partialApproveTutor);
router.post("/tutors/verify/document", verifyDocument);
router.post("/tutors/reject/grouped-documents", rejectGroupedDocuments);

// New comprehensive admin routes
router.get("/users", getAllUsers);
router.get("/tutors/:user_id", getTutorDetails);
router.put("/tutors/:user_id", updateTutorByAdmin);
router.delete("/tutors/:user_id/levels/:level_id", removeTutorLevelByAdmin);
router.put("/parents/:user_id", updateParentByAdmin);
router.put("/students/:user_id", updateStudentByAdmin);
router.post("/interviews/complete", completeInterview);
router.get("/interviews/available-slots", getAvailableInterviewSlots);
router.put("/applications/notes", updateApplicationNotes);
router.get("/dashboard/stats", getDashboardStats);
router.get("/tutor-sessions", getAllTutorSessions);
router.get("/tutor-payments", getAllTutorPayments);
// Admin edit and delete session endpoints
router.put("/tutor-sessions/:sessionId", protect, adminOnly, updateTutorSession);
router.delete("/tutor-sessions/:sessionId", protect, adminOnly, deleteTutorSession);
// Admin edit and delete payment endpoints
router.put("/tutor-payments/:paymentId", protect, adminOnly, updateTutorPayment);
router.delete("/tutor-payments/:paymentId", protect, adminOnly, deleteTutorPayment);
router.get("/tutor-reviews", getAllTutorReviews);
// Admin delete a tutor review
router.delete('/tutor-reviews/:review_id', protect, adminOnly, require('../Controllers/adminController').deleteTutorReview);
router.get("/hire-requests", getAllHireRequests);
// Admin edit and delete hire request
router.put("/hire-requests/:student_profile_id/:hire_record_id", protect, adminOnly, updateHireRequest);
router.delete("/hire-requests/:student_profile_id/:hire_record_id", protect, adminOnly, deleteHireRequest);

// Assignment management routes
router.get("/assignments", protect, adminOnly, getAllAssignments);
router.get("/assignment-submissions", protect, adminOnly, getAllSubmissions);
// Multer for optional file uploads when admin edits assignment
const multer = require('multer');
const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

// Admin edit assignment
router.put('/assignments/:assignment_id', protect, adminOnly, upload.single('file'), adminEditAssignment);

// Admin delete assignment
router.delete('/assignments/:assignment_id', protect, adminOnly, adminDeleteAssignment);

// User management
router.put("/users/:user_id/status", require("../Controllers/adminController").updateUserStatus);

module.exports = router;
