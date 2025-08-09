const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { 
  uploadDocument, 
  getTutorDashboard, 
  createSession, 
  updateSessionStatus, 
  getTutorSessions, 
  getTutorInquiries, 
  replyToInquiry, 
  getTutorStats, 
  getTutorProfile,
  getAvailableStudents,
  getTutorAvailability,
  updateGeneralAvailability,
  addRecurringAvailability,
  updateRecurringAvailability,
  removeRecurringAvailability,
  addOneTimeAvailability,
  updateOneTimeAvailability,
  removeOneTimeAvailability,
  addBlackoutDate,
  updateBlackoutDate,
  removeBlackoutDate,
  getAvailableSlots,
  checkAvailability,
  getHireRequests,
  respondToHireRequest,
  sendMessageResponse,
  getTutorMessages,
  getSpecificUserChat
} = require('../Controllers/tutorController');
const {protect} = require('../Middleware/authMiddleware');

// Multer config for tutor documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const documentType = req.body.document_type?.replace(/\s+/g, '_') || 'unknownType';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const newFileName = `${documentType}_${timestamp}_${base}${ext}`;
    cb(null, newFileName);
  }
});

const upload = multer({ storage });

// Document upload route
router.post('/upload-document', upload.single('document'), uploadDocument);

// Dashboard routes
router.get('/dashboard/:user_id', getTutorDashboard);
router.get('/profile/:user_id', getTutorProfile);
router.get('/stats/:user_id', getTutorStats);

// Session management routes
router.post('/sessions', createSession);
router.put('/sessions/:session_id', updateSessionStatus);
router.get('/sessions/:user_id', getTutorSessions);

// Inquiry management routes
router.get('/inquiries/:user_id', getTutorInquiries);
router.put('/inquiries/:inquiry_id/reply', replyToInquiry);

// Student management routes
router.get('/students/:user_id', getAvailableStudents);

// Availability management routes

router.get('/availability/:user_id', getTutorAvailability);
router.put('/availability/:user_id/general', updateGeneralAvailability);
// router.post('/availability/:user_id/recurring', addRecurringAvailability);
// router.put('/availability/:user_id/recurring/:slot_id', updateRecurringAvailability);
// router.delete('/availability/:user_id/recurring/:slot_id', removeRecurringAvailability);
// router.post('/availability/:user_id/one-time', addOneTimeAvailability);
// router.put('/availability/:user_id/one-time/:slot_id', updateOneTimeAvailability);
// router.delete('/availability/:user_id/one-time/:slot_id', removeOneTimeAvailability);
router.post('/availability/:user_id/blackout', addBlackoutDate);
router.put('/availability/:user_id/blackout/:blackout_id', updateBlackoutDate);
router.delete('/availability/:user_id/blackout/:blackout_id', removeBlackoutDate);
router.get('/availability/:user_id/slots', getAvailableSlots);
router.get('/availability/:user_id/check', checkAvailability);


// Hire requests
router.get('/hire-requests/:user_id', getHireRequests);
router.post('/hire-requests/:user_id/respond', respondToHireRequest);

// Message management routes
router.post('/messages/reply', protect, sendMessageResponse);
router.get('/getallmessages', protect, getTutorMessages);
router.get('/getallmessages/:studentId', protect, getSpecificUserChat);


module.exports = router;