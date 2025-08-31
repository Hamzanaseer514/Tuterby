const express = require("express");
const router = express.Router();
const { protect } = require("../Middleware/authMiddleware");
const {
  addStudentToParent,
  getParentProfile,
  updateParentProfile,
  getParentDashboardStats,
  getSpecificStudentDetail,
  getParentStudentsPayments,
  getParentStudentSessions
} = require("../Controllers/ParentController");

// Parent dashboard routes
router.get("/profile/:user_id", protect, getParentProfile);
router.post("/add-student", protect, addStudentToParent);
router.put("/profile/:user_id", protect, updateParentProfile);
router.get("/dashboard-stats/:user_id", protect, getParentDashboardStats);
router.get("/student/:userId", protect, getSpecificStudentDetail);
router.get("/payments/:user_id", protect, getParentStudentsPayments);
router.get("/sessions/:user_id", protect, getParentStudentSessions);

module.exports = router;
