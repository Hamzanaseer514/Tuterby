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
const ChangeLog = require("../Models/Logs");
const mongoose = require('mongoose');
const {

  EducationLevel,

  Subject,

  SubjectType,

} = require("../Models/LookupSchema");



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

  const studentProfile = await StudentProfile.findOne({ _id: student_user_id });
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

  // Convert S3 keys to URLs and add submission status
  const assignmentsWithUrls = await Promise.all(assignments.map(async (assignment) => {
    const assignmentObj = assignment.toObject();
    
    // Convert S3 key to URL for file attachments
    if (assignmentObj.file_url) {
      assignmentObj.file_url = await s3KeyToUrl(assignmentObj.file_url);
    }

    // Check if this assignment has been submitted
    const submission = await AssignmentSubmission.findOne({
      assignment_id: assignment._id
    });

    // Add submission status information
    assignmentObj.has_submission = !!submission;
    assignmentObj.submission_status = submission ? submission.status : 'not_submitted';
    assignmentObj.submission_date = submission ? submission.submitted_at : null;
    assignmentObj.is_graded = submission ? submission.status === 'graded' : false;
    assignmentObj.grade = submission ? submission.grade : null;
    assignmentObj.is_late = submission ? submission.is_late : false;

    return assignmentObj;
  }));

  return res.status(200).json(assignmentsWithUrls);
});

// Student: list assignments assigned to them
exports.getStudentAssignments = asyncHandler(async (req, res) => {
  console.log("student assignments")
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

    // Fetch submission for this student (if any)
    try {
      const submission = await AssignmentSubmission.findOne({
        assignment_id: assignment._id,
        student_id: studentProfile._id
      });

      assignmentObj.has_submission = !!submission;
      assignmentObj.submission_status = submission ? submission.status : 'not_submitted';
      assignmentObj.submission_date = submission ? submission.submitted_at : null;
      assignmentObj.is_graded = submission ? submission.status === 'graded' : false;
      assignmentObj.grade = submission ? submission.grade : null;
      assignmentObj.is_late = submission ? submission.is_late : false;
    } catch (e) {
      // If submission lookup fails, still return assignment but mark unknown
      assignmentObj.has_submission = false;
      assignmentObj.submission_status = 'unknown';
      assignmentObj.submission_date = null;
      assignmentObj.is_graded = false;
      assignmentObj.grade = null;
      assignmentObj.is_late = false;
    }

    // Normalize a simple status field for frontend checks
    assignmentObj.status = assignmentObj.status || (assignmentObj.is_active ? 'active' : 'inactive');

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
    .populate({
      path: 'assignment_id',
      select: 'title description due_date academic_level subject',
      populate: [
        { path: 'academic_level', select: 'level' },
        { path: 'subject', select: 'name' }
      ]
    })
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
// Tutor: Grade assignment submission with ChangeLog
exports.gradeSubmission = asyncHandler(async (req, res) => {
  console.log("submission")
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

  // Capture BEFORE snapshot
  const beforeSubmission = submission.toObject ? submission.toObject() : JSON.parse(JSON.stringify(submission));

  // Apply grading
  submission.grade = grade;
  submission.feedback = feedback || '';
  submission.status = 'graded';
  submission.graded_at = new Date();

  await submission.save();

  // Log grading action
  try {
    await ChangeLog.create({
      table: 'assignment_submissions',
      action: 'update',
      actualJson: beforeSubmission,
      documentKey: { submission_id: submission._id },
      changedBy: req.user ? req.user._id : null, // whoever graded
      meta: { note: 'Tutor graded assignment submission' },
    });
  } catch (logErr) {
    console.error('Failed to create ChangeLog for submission grading:', logErr);
  }

  return res.status(200).json({
    success: true,
    message: 'Submission graded successfully',
    submission,
  });
});



// Tutor: Delete a submission (tutor can remove a student's submission for their assignment)
exports.deleteSubmission = asyncHandler(async (req, res) => {
  const { user_id, submission_id } = req.params;

  const tutorProfile = await TutorProfile.findOne({ user_id });
  if (!tutorProfile) return res.status(404).json({ message: 'Tutor profile not found' });

  const submission = await AssignmentSubmission.findById(submission_id);
  if (!submission) return res.status(404).json({ message: 'Submission not found' });

  // Ensure this submission belongs to the tutor
  if (submission.tutor_id.toString() !== tutorProfile._id.toString()) {
    return res.status(403).json({ message: 'You are not authorized to delete this submission' });
  }

  await AssignmentSubmission.findByIdAndDelete(submission_id);

  return res.status(200).json({ success: true, message: 'Submission deleted successfully' });
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


// Admin: Edit any assignment (with ChangeLog)
exports.adminEditAssignment = asyncHandler(async (req, res) => {
  const { assignment_id } = req.params;
  const actor = req.user ? req.user._id : null;

  const assignment = await Assignment.findById(assignment_id);
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

  // BEFORE snapshot
  const beforeAssignment = assignment.toObject ? assignment.toObject() : JSON.parse(JSON.stringify(assignment));

  // Update allowed fields
  const { title, description, due_date, subject, academic_level, tutor_profile_id, student_profile_id } = req.body || {};
  if (title !== undefined) assignment.title = title;
  if (description !== undefined) assignment.description = description;
  if (due_date !== undefined) assignment.due_date = due_date ? new Date(due_date) : null;

  if (tutor_profile_id !== undefined) {
    const tutorProfile = await TutorProfile.findById(tutor_profile_id);
    if (!tutorProfile) return res.status(404).json({ message: 'Tutor profile not found' });
    assignment.tutor_id = tutorProfile._id;
  }

  if (student_profile_id !== undefined) {
    const studentProfile = await StudentProfile.findById(student_profile_id);
    if (!studentProfile) return res.status(404).json({ message: 'Student profile not found' });
    assignment.student_id = studentProfile._id;
  }

  if (subject !== undefined) assignment.subject = subject;
  if (academic_level !== undefined) assignment.academic_level = academic_level;

  // File replacement if provided
  if (req.file) {
    try {
      const s3Key = await uploadToS3(req.file, 'assignments');
      assignment.file_url = s3Key;
      assignment.file_name = req.file.originalname;
      assignment.file_mime_type = req.file.mimetype;
    } catch (err) {
      console.error('Failed to upload assignment file (admin):', err);
      return res.status(500).json({ message: 'Failed to upload file' });
    }
  }

  assignment._changedBy = actor;
  await assignment.save();

  // Log the update
  try {
    await ChangeLog.create({
      table: 'assignments',
      action: 'update',
      actualJson: beforeAssignment,
      documentKey: { _id: assignment._id },
      changedBy: actor,
      meta: { note: 'Admin edited assignment via adminEditAssignment' }
    });
  } catch (logErr) {
    console.error('Failed to create ChangeLog for assignment update:', logErr);
  }

  const assignmentObj = assignment.toObject();
  if (assignmentObj.file_url) {
    assignmentObj.file_url = await s3KeyToUrl(assignmentObj.file_url);
  }

  return res.status(200).json({ success: true, assignment: assignmentObj });
});

// Admin: Delete any assignment and its submissions (with ChangeLog)
exports.adminDeleteAssignment = asyncHandler(async (req, res) => {
  const { assignment_id } = req.params;
  const actor = req.user ? req.user._id : null;

  const assignment = await Assignment.findById(assignment_id);
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

  // BEFORE snapshot
  const beforeAssignment = assignment.toObject ? assignment.toObject() : JSON.parse(JSON.stringify(assignment));

  const relatedSubmissions = await AssignmentSubmission.find({ assignment_id: assignment._id });
  const beforeSubmissions = relatedSubmissions.map(sub => sub.toObject ? sub.toObject() : JSON.parse(JSON.stringify(sub)));

  // Delete submissions
  await AssignmentSubmission.deleteMany({ assignment_id: assignment._id });

  // Delete assignment
  await Assignment.findByIdAndDelete(assignment._id);

  // Log assignment deletion
  try {
    await ChangeLog.create({
      table: 'assignments',
      action: 'delete',
      actualJson: beforeAssignment,
      documentKey: { _id: assignment._id },
      changedBy: actor,
      meta: { note: 'Admin deleted assignment via adminDeleteAssignment' }
    });

    // Log all submissions deletion
    for (const sub of beforeSubmissions) {
      await ChangeLog.create({
        table: 'assignment_submissions',
        action: 'delete',
        actualJson: sub,
        documentKey: { _id: sub._id },
        changedBy: actor,
        meta: { note: 'Admin deleted submission as part of assignment deletion' }
      });
    }
  } catch (logErr) {
    console.error('Failed to create ChangeLog for assignment/submissions deletion:', logErr);
  }

  return res.status(200).json({
    success: true,
    message: 'Assignment and its submissions deleted successfully by admin',
    submissionsDeleted: beforeSubmissions.length
  });
});



exports.getTutorAcademicLevels = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const tutor = await TutorProfile.findOne({ user_id });

  if (!tutor) {
    return res.status(404).json({ message: "Tutor not found" });
  }


  const ids = tutor.academic_levels_taught.map(level =>
    new mongoose.Types.ObjectId(level.educationLevel)
  );

  const academicLevels = await EducationLevel.find({
    _id: { $in: ids },
  }).select("_id level");


  return res.status(200).json({
    success: true,
    academic_levels: academicLevels,
  });
});


  // Get subjects for a specific academic level taught by tutor
exports.getTutorSubjectsForLevel = asyncHandler(async (req, res) => {
  const { user_id, academic_level_id } = req.params;
  
  const tutor = await TutorProfile.findOne({ user_id });
  if (!tutor) {
    return res.status(404).json({ message: 'Tutor not found' });
  }

  // Find the academic level data for this tutor
  const academicLevelData = tutor.academic_levels_taught.find(
    level => level.educationLevel.toString() === academic_level_id
  );

  if (!academicLevelData) {
    return res.status(404).json({ message: 'Academic level not taught by this tutor' });
  }

  // Get subjects taught by this tutor
  const subjects = await Subject.find({
    _id: { $in: tutor.subjects }
  }).select('_id name');

  return res.status(200).json({
    success: true,
    subjects: subjects
  });
});

// Get students for assignment creation (hired by tutor, payment active, specific academic level)
exports.getStudentsForAssignment = asyncHandler(async (req, res) => {
  const { user_id, academic_level_id, subject_id } = req.params;
  
  const tutor = await TutorProfile.findOne({ user_id });
  if (!tutor) {
    return res.status(404).json({ message: 'Tutor not found' });
  }
  // Find students who:
  // 1. Have hired this tutor
  // 2. Have active payment for this academic level and subject
  // 3. Are studying at the specified academic level

  const students = await StudentProfile.find({
    'hired_tutors.tutor': tutor._id,
    'hired_tutors.status': 'accepted',
    'hired_tutors.academic_level_id': academic_level_id,
    'hired_tutors.subject': subject_id,
    // academic_level: academic_level_id
  })
  .populate("user_id", "full_name email photo_url")

  // Filter students who have active payment for this subject and academic level
  const studentsWithActivePayment = [];
  
  for (const student of students) {
    const activePayment = await StudentPayment.findOne({
      student_id: student._id,
      tutor_id: tutor._id,
      subject: subject_id,
      academic_level: academic_level_id,
      payment_status: 'paid',
      academic_level_paid: true,
      validity_status: 'active',
      is_active: true
    });

    // Check if payment is valid (not expired)
    const isPaymentValid = activePayment ? activePayment.isValid() : false;

    if (isPaymentValid) {
      studentsWithActivePayment.push({
        _id: student._id,
        user_id: student.user_id,
        payment_info: {
          payment_id: activePayment._id,
          paid_at: activePayment.payment_date,
          validity_status: activePayment.validity_status,
          expires_at: activePayment.validity_end_date
        }
      });
    }
  }

  return res.status(200).json({
    success: true,
    students: studentsWithActivePayment,
    total: studentsWithActivePayment.length
  });
});

// Get unread submissions count for tutor
exports.getUnreadSubmissionsCount = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  
  const tutor = await TutorProfile.findOne({ user_id });
  if (!tutor) {
    return res.status(404).json({ message: 'Tutor not found' });
  }

  // Count submissions that haven't been graded yet
  const unreadCount = await AssignmentSubmission.countDocuments({
    tutor_id: tutor._id,
    status: { $ne: 'graded' }
  });

  return res.status(200).json({
    success: true,
    unread_count: unreadCount
  });
});

// Get submitted assignments for tutor (assignments that have submissions)
exports.getSubmittedAssignments = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const tutor = await TutorProfile.findOne({ user_id });
  if (!tutor) {
    return res.status(404).json({ message: 'Tutor not found' });
  }
  // Find assignments that have submissions
  const assignmentsWithSubmissions = await Assignment.find({
    tutor_id: tutor._id
  })
  .populate('student_id', 'user_id')
  .populate({ path: 'student_id', populate: { path: 'user_id', select: 'full_name email' } })
  .populate('subject', 'name')
  .populate('academic_level', 'level')
  .sort({ createdAt: -1 });
  // Get submission data for each assignment
  const assignmentsWithSubmissionData = await Promise.all(
    assignmentsWithSubmissions.map(async (assignment) => {
      const submission = await AssignmentSubmission.findOne({
        assignment_id: assignment._id
      });

      const assignmentObj = assignment.toObject();
      
      // Convert S3 key to URL for file attachments
      if (assignmentObj.file_url) {
        assignmentObj.file_url = await s3KeyToUrl(assignmentObj.file_url);
      }

      return {
        ...assignmentObj,
        has_submission: !!submission,
        submission_status: submission ? submission.status : 'not_submitted',
        submission_date: submission ? submission.submitted_at : null,
        is_graded: submission ? submission.status === 'graded' : false,
        grade: submission ? submission.grade : null,
        is_late: submission ? submission.is_late : false,
      };
    })
  );

  // Filter only assignments that have submissions
  const submittedAssignments = assignmentsWithSubmissionData.filter(
    assignment => assignment.has_submission
  );

  return res.status(200).json({
    success: true,
    assignments: submittedAssignments,
    total: submittedAssignments.length
  });
});

// Tutor: Edit an assignment (title, description, due_date, subject, academic_level, student, optional file)
exports.editAssignment = asyncHandler(async (req, res) => {
  const { user_id, assignment_id } = req.params;
  const actor = req.user ? req.user._id : null;

  const tutorProfile = await TutorProfile.findOne({ user_id });
  if (!tutorProfile) return res.status(404).json({ message: 'Tutor profile not found' });

  const assignment = await Assignment.findById(assignment_id);
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

  if (assignment.tutor_id.toString() !== tutorProfile._id.toString()) {
    return res.status(403).json({ message: 'You are not authorized to edit this assignment' });
  }

  // BEFORE snapshot for logging
  const beforeAssignment = assignment.toObject ? assignment.toObject() : JSON.parse(JSON.stringify(assignment));

  // Update allowed fields
  const { title, description, due_date, subject, academic_level, student_user_id } = req.body || {};
  if (title !== undefined) assignment.title = title;
  if (description !== undefined) assignment.description = description;
  if (due_date !== undefined) assignment.due_date = due_date ? new Date(due_date) : null;
  if (subject !== undefined) assignment.subject = subject;
  if (academic_level !== undefined) assignment.academic_level = academic_level;

  // Handle student changes or subject/level changes with active payment check
  if (student_user_id !== undefined) {
    const studentProfile = await StudentProfile.findById(student_user_id);
    if (!studentProfile) return res.status(404).json({ message: 'Student profile not found' });

    const checkSubject = subject !== undefined ? subject : assignment.subject;
    const checkLevel = academic_level !== undefined ? academic_level : assignment.academic_level;

    const allowed = await hasActivePayment(tutorProfile._id, studentProfile._id, checkSubject, checkLevel);
    if (!allowed) {
      return res.status(403).json({ message: 'Student does not have active paid access for the chosen subject/level' });
    }
    assignment.student_id = studentProfile._id;
  } else if (subject !== undefined || academic_level !== undefined) {
    const studentProfile = await StudentProfile.findById(assignment.student_id);
    if (studentProfile) {
      const allowed = await hasActivePayment(
        tutorProfile._id,
        studentProfile._id,
        subject !== undefined ? subject : assignment.subject,
        academic_level !== undefined ? academic_level : assignment.academic_level
      );
      if (!allowed) {
        return res.status(403).json({ message: 'Current student does not have active paid access for the chosen subject/level' });
      }
    }
  }

  // Handle file replacement if provided
  if (req.file) {
    try {
      const s3Key = await uploadToS3(req.file, 'assignments');
      assignment.file_url = s3Key;
      assignment.file_name = req.file.originalname;
      assignment.file_mime_type = req.file.mimetype;
    } catch (err) {
      console.error('Failed to upload assignment file:', err);
      return res.status(500).json({ message: 'Failed to upload file' });
    }
  }

  assignment.updated_at = new Date();
  assignment._changedBy = actor;
  await assignment.save();

  // Log the edit
  try {
    await ChangeLog.create({
      table: 'assignments',
      action: 'update',
      actualJson: beforeAssignment,
      documentKey: { _id: assignment._id },
      changedBy: actor,
      meta: { note: 'Tutor edited assignment via editAssignment' }
    });
  } catch (logErr) {
    console.error('Failed to create ChangeLog for assignment edit:', logErr);
  }

  const assignmentObj = assignment.toObject();
  if (assignmentObj.file_url) {
    assignmentObj.file_url = await s3KeyToUrl(assignmentObj.file_url);
  }

  return res.status(200).json({ success: true, assignment: assignmentObj });
});


// Tutor: Delete an assignment and its submissions (if any)
exports.deleteAssignment = asyncHandler(async (req, res) => {
  const { user_id, assignment_id } = req.params;

  const tutorProfile = await TutorProfile.findOne({ user_id });
  if (!tutorProfile) return res.status(404).json({ message: 'Tutor profile not found' });

  const assignment = await Assignment.findById(assignment_id);
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

  if (assignment.tutor_id.toString() !== tutorProfile._id.toString()) {
    return res.status(403).json({ message: 'You are not authorized to delete this assignment' });
  }

  // Capture BEFORE snapshot for logging
  const assignmentBefore = assignment.toObject ? assignment.toObject() : JSON.parse(JSON.stringify(assignment));

  // Delete related submissions
  const deleteResult = await AssignmentSubmission.deleteMany({ assignment_id: assignment._id });

  // Delete the assignment itself
  await Assignment.findByIdAndDelete(assignment._id);

  // Log the deletion in ChangeLog
  try {
    await ChangeLog.create({
      table: 'assignments',
      action: 'delete',
      actualJson: assignmentBefore,
      documentKey: { assignment_id: assignment._id },
      changedBy: tutorProfile._id,
      meta: {
        note: `Tutor deleted assignment with ${deleteResult.deletedCount || 0} related submissions`,
      },
    });
  } catch (logErr) {
    console.error('Failed to create ChangeLog for assignment deletion:', logErr);
  }

  return res.status(200).json({
    success: true,
    message: 'Assignment deleted successfully',
    submissionsDeleted: deleteResult.deletedCount || 0,
    assignment_id: assignment._id,
  });
});



