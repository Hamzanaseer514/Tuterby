const express = require("express")
const router = express.Router()
const { registerUser,registerTutor,registerParent, addStudentToParent , loginUser, verifyOtp, resendOtp, addAdmin, forgotPassword,resetPassword} = require("../Controllers/UserController")
const { getStudentDashboard,updateStudentProfile, getStudentSessions,searchTutors, getTutorDetails, requestAdditionalHelp, getStudentHelpRequests ,hireTutor,sendMessage} = require("../Controllers/StudentController")
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
router.put("/updatestudent/:user_id", updateStudentProfile)  
router.post("/register-tutor", upload.fields([{ name: 'documents', maxCount: 10 }]), registerTutor);
router.post("/register-parent", registerParent)
router.post("/add-student-to-parent", protect, addStudentToParent)
router.post("/login", loginUser)
router.post("/verify-otp", verifyOtp)
router.post("/resend-otp", resendOtp)
router.post("/add-admin", addAdmin)
router.post("/forget-password", forgotPassword)
router.put("/reset-password", resetPassword)
router.post("/send-message", protect, sendMessage)

// Student dashboard routes
router.get("/student/dashboard/:userId", protect, getStudentDashboard);
router.get("/student/sessions/:userId", protect, getStudentSessions);


// Tutor search and help request routes
router.get("/tutors/search", protect, searchTutors);
router.get("/tutors/:tutorId", protect, getTutorDetails);
router.post("/tutors/sessions", protect, hireTutor);


router.post("/student/:userId/help-request", protect, requestAdditionalHelp);
router.get("/student/:userId/help-requests", protect, getStudentHelpRequests);

module.exports = router;            