const path = require('path');
const fs = require('fs');
const asyncHandler = require('express-async-handler');
const Assignment = require('../Models/assignmentSchema');
const AssignmentSubmission = require('../Models/assignmentSubmissionSchema');
const StudentPayment = require('../Models/studentPaymentSchema');
const TutorProfile = require('../Models/tutorProfileSchema');
const StudentProfile = require('../Models/studentProfileSchema');
const uploadToS3 = require('../Utils/uploadToS3');
const s3KeyToUrl = require('../Utils/s3KeyToUrl');

const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Validate student has active paid access for this tutor/subject/level
const hasActivePayment = async (tutorProfileId, studentProfileId, subjectId, academicLevelId) => {
  const payment = await StudentPayment.findOne({
    student_id: studentProfileId,
    tutor_id: tutorProfileId,
    subject: subjectId,
    academic_level: academicLevelId,
    payment_status: 'paid',
    academic_level_paid: true,
    validity_status: 'active',
  }).sort({ createdAt: -1 });
  if (!payment) return false;
  const now = new Date();
  const isValidDate = payment.validity_end_date > now;
  const hasSessionsRemaining = payment.sessions_remaining > 0;
  return isValidDate && hasSessionsRemaining;
};

// Tutor creates an assignment for a specific student
exports.createAssignment = asyncHandler(async (req, res) => {
  const { user_id } = req.params; // tutor user id
  const { student_user_id, subject, academic_level, title, description, due_date } = req.body;

  if (!student_user_id || !subject || !academic_level || !title) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const tutorProfile = await TutorProfile.findOne({ user_id });
  if (!tutorProfile) return res.status(404).json({ message: 'Tutor profile not found' });

  const studentProfile = await StudentProfile.findOne({ user_id: student_user_id });
  if (!studentProfile) return res.status(404).json({ message: 'Student profile not found' });

  const isAllowed = await hasActivePayment(
    tutorProfile._id,
    studentProfile._id,
    subject,
    academic_level
  );
  if (!isAllowed) {
    return res.status(403).json({ message: 'Student does not have active paid access for this tutor/subject/level' });
  }

  let fileFields = { file_url: '', file_name: '', file_mime_type: '' };
  if (req.file) {
    const s3Key = await uploadToS3(req.file, 'assignments');
    fileFields = {
      file_url: s3Key,
      file_name: req.file.originalname,
      file_mime_type: req.file.mimetype,
    };
  }

  const assignment = await Assignment.create({
    tutor_id: tutorProfile._id,
    student_id: studentProfile._id,
    subject,
    academic_level,
    title,
    description: description || '',
    due_date: due_date ? new Date(due_date) : null,
    ...fileFields,
  });

  return res.status(201).json(assignment);
});

// Tutor: list assignments they created
exports.getTutorAssignments = asyncHandler(async (req, res) => {
  const { user_id } = req.params; // tutor user id
  const tutorProfile = await TutorProfile.findOne({ user_id });
  if (!tutorProfile) return res.status(404).json({ message: 'Tutor profile not found' });

  const assignments = await Assignment.find({ tutor_id: tutorProfile._id })
    .sort({ createdAt: -1 })
    .populate('subject', 'name')
    .populate('academic_level', 'level')
    .populate({ path: 'student_id', select: 'user_id', populate: { path: 'user_id', select: 'full_name' } });

  // Convert S3 keys to URLs for file attachments
  const assignmentsWithUrls = await Promise.all(assignments.map(async (assignment) => {
    const assignmentObj = assignment.toObject();
    if (assignmentObj.file_url) {
      assignmentObj.file_url = await s3KeyToUrl(assignmentObj.file_url);
    }
    return assignmentObj;
  }));

  return res.status(200).json(assignmentsWithUrls);
});

// Student: list assignments assigned to them
exports.getStudentAssignments = asyncHandler(async (req, res) => {
  const { user_id } = req.params; // student user id
  const studentProfile = await StudentProfile.findOne({ user_id });
  if (!studentProfile) return res.status(404).json({ message: 'Student profile not found' });

  const assignments = await Assignment.find({ student_id: studentProfile._id })
    .sort({ createdAt: -1 })
    .populate('subject', 'name')
    .populate('academic_level', 'level')
    .populate({ path: 'tutor_id', select: 'user_id', populate: { path: 'user_id', select: 'full_name' } })
    .populate({ path: 'student_id', select: 'user_id', populate: { path: 'user_id', select: 'full_name' } });

  // Convert S3 keys to URLs for file attachments
  const assignmentsWithUrls = await Promise.all(assignments.map(async (assignment) => {
    const assignmentObj = assignment.toObject();
    if (assignmentObj.file_url) {
      assignmentObj.file_url = await s3KeyToUrl(assignmentObj.file_url);
    }
    return assignmentObj;
  }));

  return res.status(200).json(assignmentsWithUrls);
});

// Get paid subjects and academic levels for a specific student-tutor relationship (for assignment creation)
exports.getPaidSubjectsAndLevels = asyncHandler(async (req, res) => {
  const { tutor_user_id, student_user_id } = req.params;

  try {
    // Get student profile
    const studentProfile = await StudentProfile.findOne({ user_id: student_user_id });
    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Get tutor profile
    const tutorProfile = await TutorProfile.findOne({ user_id: tutor_user_id });
    if (!tutorProfile) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }

    // Get all payments for this student-tutor combination that are active and paid
    const payments = await StudentPayment.find({
      student_id: studentProfile._id,
      
      tutor_id: tutorProfile._id,
      payment_status: 'paid',
      academic_level_paid: true,
      validity_status: 'active',
    })
    .populate('subject', 'name')
    .populate('academic_level', 'level')
    .sort({ createdAt: -1 });

    // Filter for currently valid payments (not expired and has sessions remaining)
    const now = new Date();
    const validPayments = payments.filter(payment => {
      const isValidDate = payment.validity_end_date > now;
      const hasSessionsRemaining = payment.sessions_remaining > 0;
      return isValidDate && hasSessionsRemaining;
    });

    // Extract unique subjects and academic levels
    const paidSubjects = [];
    const paidAcademicLevels = [];
    const subjectLevelCombinations = [];

    validPayments.forEach(payment => {
      if (payment.subject && payment.academic_level) {
        // Add to subjects if not already added
        if (!paidSubjects.find(s => s._id.toString() === payment.subject._id.toString())) {
          paidSubjects.push(payment.subject);
        }
        
        // Add to academic levels if not already added
        if (!paidAcademicLevels.find(l => l._id.toString() === payment.academic_level._id.toString())) {
          paidAcademicLevels.push(payment.academic_level);
        }

        // Add combination
        subjectLevelCombinations.push({
          subject: payment.subject,
          academic_level: payment.academic_level,
          payment_details: {
            sessions_remaining: payment.sessions_remaining,
            validity_end_date: payment.validity_end_date,
            payment_type: payment.payment_type
          }
        });
      }
    });

    return res.status(200).json({
      success: true,
      paid_subjects: paidSubjects,
      paid_academic_levels: paidAcademicLevels,
      subject_level_combinations: subjectLevelCombinations
    });

  } catch (error) {
    console.error('Error getting paid subjects and levels:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Student: Submit assignment
exports.submitAssignment = asyncHandler(async (req, res) => {
  const { assignment_id } = req.params;
  const { student_user_id, submission_text } = req.body;

  if (!student_user_id || !assignment_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Get assignment details
  const assignment = await Assignment.findById(assignment_id);
  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found' });
  }

  // Get student profile
  const studentProfile = await StudentProfile.findOne({ user_id: student_user_id });
  if (!studentProfile) {
    return res.status(404).json({ message: 'Student profile not found' });
  }

  // Verify this assignment is for this student
  if (assignment.student_id.toString() !== studentProfile._id.toString()) {
    return res.status(403).json({ message: 'This assignment is not assigned to you' });
  }

  // Check if already submitted
  const existingSubmission = await AssignmentSubmission.findOne({
    assignment_id: assignment_id,
    student_id: studentProfile._id
  });

  if (existingSubmission) {
    return res.status(400).json({ message: 'Assignment already submitted' });
  }

  // Check if assignment is still active
  if (!assignment.is_active) {
    return res.status(400).json({ message: 'Assignment is no longer active' });
  }

  // Handle file upload
  let fileFields = { submission_file_url: '', submission_file_name: '', submission_file_mime_type: '' };
  if (req.file) {
    const s3Key = await uploadToS3(req.file, 'assignment-submissions');
    fileFields = {
      submission_file_url: s3Key,
      submission_file_name: req.file.originalname,
      submission_file_mime_type: req.file.mimetype,
    };
  }

  // Check if submission is late
  const now = new Date();
  const isLate = assignment.due_date ? now > new Date(assignment.due_date) : false;

  // Create submission
  const submission = await AssignmentSubmission.create({
    assignment_id: assignment_id,
    student_id: studentProfile._id,
    tutor_id: assignment.tutor_id,
    submission_text: submission_text || '',
    submitted_at: now,
    is_late: isLate,
    ...fileFields,
  });

  return res.status(201).json(submission);
});

// Student: Get their submissions for assignments
exports.getStudentSubmissions = asyncHandler(async (req, res) => {
  const { user_id } = req.params; // student user id
  const studentProfile = await StudentProfile.findOne({ user_id });
  if (!studentProfile) return res.status(404).json({ message: 'Student profile not found' });

  const submissions = await AssignmentSubmission.find({ student_id: studentProfile._id })
    .populate('assignment_id', 'title description due_date')
    .populate('tutor_id', 'user_id')
    .populate({ path: 'tutor_id', populate: { path: 'user_id', select: 'full_name' } })
    .sort({ submitted_at: -1 });

  // Convert S3 keys to URLs for submission files
  const submissionsWithUrls = await Promise.all(submissions.map(async (submission) => {
    const submissionObj = submission.toObject();
    if (submissionObj.submission_file_url) {
      submissionObj.submission_file_url = await s3KeyToUrl(submissionObj.submission_file_url);
    }
    return submissionObj;
  }));

  return res.status(200).json(submissionsWithUrls);
});

// Tutor: Get submissions for their assignments
exports.getTutorSubmissions = asyncHandler(async (req, res) => {
  const { user_id } = req.params; // tutor user id
  const tutorProfile = await TutorProfile.findOne({ user_id });
  if (!tutorProfile) return res.status(404).json({ message: 'Tutor profile not found' });

  const submissions = await AssignmentSubmission.find({ tutor_id: tutorProfile._id })
    .populate('assignment_id', 'title description due_date')
    .populate('student_id', 'user_id')
    .populate({ path: 'student_id', populate: { path: 'user_id', select: 'full_name' } })
    .sort({ submitted_at: -1 });

  // Convert S3 keys to URLs for submission files
  const submissionsWithUrls = await Promise.all(submissions.map(async (submission) => {
    const submissionObj = submission.toObject();
    if (submissionObj.submission_file_url) {
      submissionObj.submission_file_url = await s3KeyToUrl(submissionObj.submission_file_url);
    }
    return submissionObj;
  }));

  return res.status(200).json(submissionsWithUrls);
});

// Tutor: Grade assignment submission
exports.gradeSubmission = asyncHandler(async (req, res) => {
  const { submission_id } = req.params;
  const { grade, feedback } = req.body;

  if (grade === undefined || grade === null) {
    return res.status(400).json({ message: 'Grade is required' });
  }

  if (grade < 0 || grade > 100) {
    return res.status(400).json({ message: 'Grade must be between 0 and 100' });
  }

  const submission = await AssignmentSubmission.findById(submission_id);
  if (!submission) {
    return res.status(404).json({ message: 'Submission not found' });
  }

  submission.grade = grade;
  submission.feedback = feedback || '';
  submission.status = 'graded';
  submission.graded_at = new Date();

  await submission.save();

  return res.status(200).json(submission);
});

// Get assignment file URL (S3 presigned URL)
exports.downloadAssignment = asyncHandler(async (req, res) => {
  const { assignment_id } = req.params;
  const assignment = await Assignment.findById(assignment_id);
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
  if (!assignment.file_url) return res.status(404).json({ message: 'No file attached' });

  // Convert S3 key to presigned URL
  const fileUrl = await s3KeyToUrl(assignment.file_url);
  if (!fileUrl) return res.status(404).json({ message: 'File not found in S3' });

  return res.status(200).json({
    file_url: fileUrl,
    file_name: assignment.file_name,
    file_mime_type: assignment.file_mime_type
  });
});

// Admin: Get all assignments across the platform
exports.getAllAssignments = asyncHandler(async (req, res) => {
  const assignments = await Assignment.find()
    .sort({ createdAt: -1 })
    .populate('subject', 'name')
    .populate('academic_level', 'level')
    .populate({ path: 'tutor_id', select: 'user_id', populate: { path: 'user_id', select: 'full_name email' } })
    .populate({ path: 'student_id', select: 'user_id', populate: { path: 'user_id', select: 'full_name email' } });

  // Convert S3 keys to URLs for file attachments
  const assignmentsWithUrls = await Promise.all(assignments.map(async (assignment) => {
    const assignmentObj = assignment.toObject();
    if (assignmentObj.file_url) {
      assignmentObj.file_url = await s3KeyToUrl(assignmentObj.file_url);
    }
    return assignmentObj;
  }));

  return res.status(200).json({
    success: true,
    assignments: assignmentsWithUrls,
    total: assignmentsWithUrls.length
  });
});

// Admin: Get all assignment submissions across the platform
exports.getAllSubmissions = asyncHandler(async (req, res) => {
  const submissions = await AssignmentSubmission.find()
    .populate('assignment_id', 'title description due_date')
    .populate('tutor_id', 'user_id')
    .populate({ path: 'tutor_id', populate: { path: 'user_id', select: 'full_name email' } })
    .populate('student_id', 'user_id')
    .populate({ path: 'student_id', populate: { path: 'user_id', select: 'full_name email' } })
    .sort({ submitted_at: -1 });

  // Convert S3 keys to URLs for submission files
  const submissionsWithUrls = await Promise.all(submissions.map(async (submission) => {
    const submissionObj = submission.toObject();
    if (submissionObj.submission_file_url) {
      submissionObj.submission_file_url = await s3KeyToUrl(submissionObj.submission_file_url);
    }
    return submissionObj;
  }));

  return res.status(200).json({
    success: true,
    submissions: submissionsWithUrls,
    total: submissionsWithUrls.length
  });
});


