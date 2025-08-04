const express = require("express")
const router = express.Router()
const { registerUser,registerTutor,registerParent, addStudentToParent , loginUser, verifyOtp, resendOtp, addAdmin, updateUser, forgotPassword,resetPassword, getStudentDashboard, getStudentSessions, updateStudentPreferences, getStudentAssignments, getStudentNotes, searchTutors, getTutorDetails, requestAdditionalHelp, getStudentHelpRequests } = require("../Controllers/UserController")
const { protect } = require("../Middleware/authMiddleware")
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/documents/');
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext);
      const newName = `${timestamp}_${base}${ext}`;
      cb(null, newName);
    }
  });
  
  const upload = multer({ storage });
  

router.post("/register", registerUser)
router.post("/register-tutor", upload.fields([{ name: 'documents', maxCount: 10 }]), registerTutor);
router.post("/register-parent", registerParent)
router.post("/add-student-to-parent", protect, addStudentToParent)
router.post("/login", loginUser)
router.post("/verify-otp", verifyOtp)
router.post("/resend-otp", resendOtp)
router.post("/add-admin", addAdmin)
router.put("/update-user/:userId", protect, updateUser)
router.post("/forget-password", forgotPassword)
router.put("/reset-password", resetPassword)

// Student dashboard routes
router.get("/student/dashboard/:studentId", protect, getStudentDashboard);
router.get("/student/sessions/:studentId", protect, getStudentSessions);
router.put("/student/preferences/:studentId", protect, updateStudentPreferences);
router.get("/student/assignments/:studentId", protect, getStudentAssignments);
router.get("/student/notes/:studentId", protect, getStudentNotes);

// Tutor search and help request routes
router.get("/tutors/search", protect, searchTutors);
router.get("/tutors/:tutorId", protect, getTutorDetails);
router.post("/student/:studentId/help-request", protect, requestAdditionalHelp);
router.get("/student/:studentId/help-requests", protect, getStudentHelpRequests);

module.exports = router;            