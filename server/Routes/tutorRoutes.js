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
  checkAvailability
} = require('../Controllers/tutorController');

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
router.get('/dashboard/:tutor_id', getTutorDashboard);
router.get('/profile/:tutor_id', getTutorProfile);
router.get('/stats/:tutor_id', getTutorStats);

// Session management routes
router.post('/sessions', createSession);
router.put('/sessions/:session_id', updateSessionStatus);
router.get('/sessions/:tutor_id', getTutorSessions);

// Inquiry management routes
router.get('/inquiries/:tutor_id', getTutorInquiries);
router.put('/inquiries/:inquiry_id/reply', replyToInquiry);

// Student management routes
router.get('/students', getAvailableStudents);

// Availability management routes
router.get('/availability/:tutor_id', getTutorAvailability);
router.put('/availability/:tutor_id/general', updateGeneralAvailability);
router.post('/availability/:tutor_id/recurring', addRecurringAvailability);
router.put('/availability/:tutor_id/recurring/:slot_id', updateRecurringAvailability);
router.delete('/availability/:tutor_id/recurring/:slot_id', removeRecurringAvailability);
router.post('/availability/:tutor_id/one-time', addOneTimeAvailability);
router.put('/availability/:tutor_id/one-time/:slot_id', updateOneTimeAvailability);
router.delete('/availability/:tutor_id/one-time/:slot_id', removeOneTimeAvailability);
router.post('/availability/:tutor_id/blackout', addBlackoutDate);
router.put('/availability/:tutor_id/blackout/:blackout_id', updateBlackoutDate);
router.delete('/availability/:tutor_id/blackout/:blackout_id', removeBlackoutDate);
router.get('/availability/:tutor_id/slots', getAvailableSlots);
router.get('/availability/:tutor_id/check', checkAvailability);

module.exports = router;