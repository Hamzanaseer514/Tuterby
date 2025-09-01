const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const TutorDocument = require("../Models/tutorDocumentSchema");
const TutoringSession = require("../Models/tutoringSessionSchema");
const TutorApplication = require("../Models/tutorApplicationSchema");
const TutorProfile = require("../Models/tutorProfileSchema");
const TutorInquiry = require("../Models/tutorInquirySchema");
const TutorAvailability = require("../Models/tutorAvailabilitySchema");
const User = require("../Models/userSchema");
const StudentProfile = require("../Models/studentProfileSchema");
const StudentPayment = require("../Models/studentPaymentSchema"); // Added for payment records
const Message = require("../Models/messageSchema"); // Importing Message model
const { EducationLevel, Subject } = require("../Models/LookupSchema");
const sendEmail = require("../Utils/sendEmail");
const uploadDocument = asyncHandler(async (req, res) => {
  const { tutor_id, document_type } = req.body;

  if (!req.file || !tutor_id || !document_type) {
    res.status(400);
    throw new Error("All fields and file are required");
  }

  const relativePath = `/uploads/documents/${req.file.filename}`;

  const newDoc = await TutorDocument.create({
    tutor_id: tutor_id,
    document_type,
    file_url: relativePath,
    uploaded_at: new Date(),
    verification_status: "Pending"
  });

  res.status(201).json({
    message: "Document uploaded successfully",
    document: newDoc
  });
});

// Get tutor dashboard overview
const getTutorDashboard = asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  const tutor = await TutorProfile.findOne({ user_id: user_id });
  tutor.subjects = tutor.subjects;
  const upcomingSessions = await TutoringSession.find({
    tutor_id: tutor._id,
    session_date: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed', 'in_progress'] }
  })
    .populate({
      path: 'student_ids',
      populate: {
        path: 'user_id',
        select: 'full_name email'
      }
    })
    .populate({ path: 'academic_level', select: 'level' })
    .sort({ session_date: 1 })
    .limit(10);


  // Only keep valid ObjectIds
  const academicLevelIds = upcomingSessions
    .flatMap(s => s.student_ids.map(st => st.academic_level))
    .filter(id => mongoose.Types.ObjectId.isValid(id));

  const educationLevels = academicLevelIds.length
    ? await EducationLevel.find({ _id: { $in: academicLevelIds } })
    : [];

  const sessionsWithLevelNames = upcomingSessions.map(s => {
    // Ensure session is a plain object
    const sObj = typeof s.toObject === 'function' ? s.toObject() : s;

    sObj.student_ids = (sObj.student_ids || []).map(st => {
      // Ensure student is a plain object
      const stObj = typeof st.toObject === 'function' ? st.toObject() : st;

      stObj.academic_level_name = educationLevels.find(
        el => el._id.toString() === stObj.academic_level
      )?.level || null;

      return stObj;
    });

    return sObj;
  });



  const pendingInquiries = await TutorInquiry.find({
    tutor_id: tutor._id,
    status: { $in: ['unread', 'read'] }
  })
    .populate({
      path: 'student_id',
      populate: {
        path: 'user_id',
        select: 'full_name email'
      }
    })
    .sort({ created_at: -1 })
    .limit(10);

  const recentSessions = await TutoringSession.find({
    tutor_id: tutor._id,
    session_date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  })
    .populate({
      path: 'student_ids',
      populate: { path: 'user_id', select: 'full_name email' }
    })
    .populate({ path: 'academic_level', select: 'level' })
    .sort({ session_date: -1 })
    .limit(5);

  const [totalHours, totalEarnings, completedSessions] = await Promise.all([
    TutoringSession.aggregate([
      { $match: { tutor_id: tutor._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$duration_hours' } } }
    ]),
    TutoringSession.aggregate([
      { $match: { tutor_id: tutor._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total_earnings' } } }
    ]),
    TutoringSession.countDocuments({ tutor_id: tutor._id, status: 'completed' })
  ]);

  const [avgResponseTime, bookingAcceptanceRate] = await Promise.all([
    TutorInquiry.aggregate([
      { $match: { tutor_id: tutor._id, response_time_minutes: { $exists: true } } },
      { $group: { _id: null, average: { $avg: '$response_time_minutes' } } }
    ]),
    calculateBookingAcceptanceRate(tutor._id)
  ]);
  const studentObjectIds = upcomingSessions.flatMap(session => session.student_ids);
  const students = await StudentProfile.find({ _id: { $in: studentObjectIds } });
  const students_ids = students.map(student => student.user_id);
  const users = await User.find({ _id: students_ids });

  // ✅ Ensure session objects are preserved and session_date is ISO string
  const formatSessions = (sessions) => {
    return sessions.map((s) => {
      const o = typeof s.toObject === 'function' ? s.toObject() : s;
      // If academic_level is an ObjectId string, resolve name from preloaded levels
      let academic_level_name = null;
      if (o.academic_level && typeof o.academic_level === 'string') {
        const looksLikeObjectId = /^[a-fA-F0-9]{24}$/.test(o.academic_level);
        if (looksLikeObjectId) {
          const match = educationLevels.find(el => el._id.toString() === o.academic_level);
          academic_level_name = match ? match.level : null;
        } else {
          // Backward compatibility: old sessions stored the level name directly
          academic_level_name = o.academic_level;
        }
      } else if (o.academic_level && typeof o.academic_level === 'object' && o.academic_level.level) {
        academic_level_name = o.academic_level.level;
        o.academic_level = o.academic_level._id?.toString?.() || o.academic_level; // normalize to id for client if needed
      }
      return {
        ...o,
        session_date: o.session_date ? new Date(o.session_date).toISOString() : null,
        academic_level_name,
      };
    });
  };
  const dashboard = {
    upcomingSessions: formatSessions(sessionsWithLevelNames),
    recentSessions: formatSessions(recentSessions),
    tutor,
    pendingInquiries,
    users,
    students,
    metrics: {
      totalHours: totalHours[0]?.total || 0,
      totalEarnings: totalEarnings[0]?.total || 0,
      averageRating: tutor.average_rating || 0,
      completedSessions,
      avgResponseTime: avgResponseTime[0]?.average || 0,
      bookingAcceptanceRate
    }
  };
  res.json(dashboard);
});



// Calculate booking acceptance rate
const calculateBookingAcceptanceRate = async (tutor_id) => {
  const tutorObjectId = new mongoose.Types.ObjectId(tutor_id);
  const [totalInquiries, convertedInquiries] = await Promise.all([
    TutorInquiry.countDocuments({ tutor_id: tutorObjectId }),
    TutorInquiry.countDocuments({
      tutor_id: tutorObjectId,
      status: 'converted_to_booking'
    })
  ]);
  return totalInquiries > 0 ? (convertedInquiries / totalInquiries) * 100 : 0;
};

// Create a new tutoring session (supports single or multiple students)
const createSession = asyncHandler(async (req, res) => {
  const { tutor_id, student_id, student_ids, subject, academic_level, session_date, duration_hours, hourly_rate, notes } = req.body;
 
  let studentUserIds = [];
  if (Array.isArray(student_ids) && student_ids.length > 0) {
    studentUserIds = student_ids;
  } else if (student_id) {
    studentUserIds = [student_id];
  }

  if (!tutor_id || studentUserIds.length === 0 || !subject || !session_date || duration_hours === undefined || hourly_rate === undefined || !academic_level) {
    return res.status(400).json({ message: "All required fields must be provided" });
  }
  let sessionDateExactUTC;
  if (typeof session_date === 'string') {
    // Force interpret as UTC to prevent timezone shift
    sessionDateExactUTC = new Date(session_date + ':00Z');
  } else {
    sessionDateExactUTC = new Date(session_date);
  }

  // Calculate new session end time
  const newSessionEndTime = new Date(sessionDateExactUTC.getTime() + duration_hours * 60 * 60 * 1000);

  // Fetch profiles
  const students = await StudentProfile.find({ user_id: { $in: studentUserIds } });
  const tutor = await TutorProfile.findOne({ user_id: tutor_id });
  const tutor_total_sessions = await TutoringSession.countDocuments({ tutor_id: tutor._id , status: 'completed' });
  const allowed_session = tutor.academic_levels_taught.find(level => level.educationLevel.toString() === academic_level.toString());
  if (allowed_session) {
    if (tutor_total_sessions >= allowed_session.totalSessionsPerMonth) {
      return res.status(400).json({ message: `You have reached the maximum number ${allowed_session.totalSessionsPerMonth} of sessions for this academic level for this month` });
    }
  }
  else{
    return res.status(401).json({ message: "This Academic Level is not selected by you. Please add this academic level to your profile." });
  }

  if (!tutor) {
    return res.status(404).json({ message: "Tutor profile not found" });
  }
  if (!students || students.length === 0) {
    return res.status(404).json({ message: "Student profile(s) not found" });
  }

  // Authorization check
  // Ensure authorization for all selected students

  for (const student of students) {
    const hireRecord = (student.hired_tutors || []).find(
      (h) => h.tutor?.toString() === tutor._id.toString() && h.status === "accepted"
    );
    if (!hireRecord) {
      return res.status(403).json({ message: "Tutor is not authorized to create a session with one or more selected students" });
    }
  }

  // Payment validation check
  // Ensure payment is completed for all selected students for this subject and academic level
  let allStudentsCanCreate = true;
  const studentPaymentStatuses = [];
  
  for (const student of students) {
    const canCreate = await canCreateSessionForStudent(tutor._id, student._id, subject, academic_level);
    if (!canCreate) {
      allStudentsCanCreate = false;
    }
    
    // Get payment details for this student
    const payment = await StudentPayment.findOne({
      student_id: student._id,
      tutor_id: tutor._id,
      subject: subject,
      academic_level: academic_level,
      payment_status: 'paid'
    });
    
    studentPaymentStatuses.push({
      student_id: student._id,
      canCreateSession: canCreate,
      paymentCompleted: !!payment,
      paymentDetails: payment ? {
        payment_type: payment.payment_type,
        final_amount: payment.final_amount,
        sessions_remaining: payment.sessions_remaining,
        validity_end_date: payment.validity_end_date
      } : null
    });
  }
  
  if (!allStudentsCanCreate) {
    return res.status(403).json({ 
      message: "Payment not completed. Student must pay for academic level access before sessions can be created.",
      studentPaymentStatuses: studentPaymentStatuses
    });
  }

  // Check for overlapping in-progress session
  const conflictingSession = await TutoringSession.findOne({
    tutor_id: tutor._id,
    status: { $in: ['in_progress', 'pending', 'confirmed'] },
    $expr: {
      $and: [
        { $lt: ['$session_date', newSessionEndTime] }, // existing start < new end
        {
          $gt: [
            { $add: ['$session_date', { $multiply: ['$duration_hours', 60 * 60 * 1000] }] },
            sessionDateExactUTC
          ]
        } // existing end > new start
      ]
    }
  });

  if (conflictingSession) {
    return res.status(400).json({
      message: "Cannot create new session. You already have an active session in progress."
    });
  }

  // Create session
  // Normalize hourly rate (could be number or [number])
  const hourlyRateNumber = Array.isArray(hourly_rate)
    ? parseFloat(hourly_rate[0])
    : parseFloat(hourly_rate);

  const session = await TutoringSession.create({
    tutor_id: tutor._id,
    student_ids: students.map(s => s._id),
    subject,
    academic_level: new mongoose.Types.ObjectId(academic_level),
    session_date: sessionDateExactUTC, // exact time from frontend
    duration_hours,
    hourly_rate: Number.isFinite(hourlyRateNumber) ? hourlyRateNumber : 0,
    // Initialize per-student responses as pending
    student_responses: students.map(s => ({
      student_id: s._id,
      status: 'pending'
    })),
    total_earnings: duration_hours * (Number.isFinite(hourlyRateNumber) ? hourlyRateNumber : 0),
    notes: notes || "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  return res.status(201).json({
    message: "Tutoring session created successfully",
    session,
    studentPaymentStatuses: studentPaymentStatuses
  });
});

const updateSessionStatus = asyncHandler(async (req, res) => {
  const { session_id } = req.params;
  const {
    student_id,
    subject,
    academic_level,
    session_date,
    duration_hours,
    hourly_rate,
    status,
    notes,
    student_proposed_date,
    approve_proposed,
    reject_proposed,
    // New: per-student response update
    student_response_status,
    student_response_note
  } = req.body;
  try {
    const session = await TutoringSession.findById(session_id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    // Handle per-student response updates (confirm/decline) without altering date/time logic
    if (student_response_status && ['confirmed', 'declined', 'pending'].includes(student_response_status)) {
      if (!student_id) {
        return res.status(400).json({ success: false, message: 'student_id is required for per-student response' });
      }
      let studentObjectId = new mongoose.Types.ObjectId(student_id);
      // If this ObjectId does not match any session student, try to resolve by user_id -> StudentProfile
      const isMember = (session.student_ids || []).some(id => id.toString() === studentObjectId.toString());
      if (!isMember) {
        const maybeProfile = await StudentProfile.findOne({ user_id: student_id }).select('_id');
        if (maybeProfile) {
          studentObjectId = new mongoose.Types.ObjectId(maybeProfile._id);
        }
      }
      const responseIndex = (session.student_responses || []).findIndex(r => r.student_id.toString() === studentObjectId.toString());
      if (responseIndex === -1) {
        // Ensure the student is part of the session
        const isInSession = (session.student_ids || []).some(id => id.toString() === studentObjectId.toString());
        if (!isInSession) {
          return res.status(403).json({ success: false, message: 'Student not part of this session' });
        }
        // Initialize if missing
        session.student_responses = session.student_responses || [];
        session.student_responses.push({ student_id: studentObjectId, status: student_response_status, responded_at: new Date(), note: student_response_note || '' });
      } else {
        session.student_responses[responseIndex].status = student_response_status;
        session.student_responses[responseIndex].responded_at = new Date();
        if (student_response_note !== undefined) session.student_responses[responseIndex].note = student_response_note;
      }

      // Do not auto-confirm here. Tutor will send meeting link to confirmed students, which will confirm the session overall.

      const saved = await session.save();
      return res.status(200).json({ success: true, message: 'Student response updated', session: saved });
    }

    // Disallow changing date/time once session is confirmed
    if (session.status === 'confirmed') {
      const isTryingToPropose = !!student_proposed_date || approve_proposed;
      // Parse potential new date for comparison
      let incomingDate = null;
      if (typeof session_date === 'string') incomingDate = new Date(session_date + ':00Z');
      else if (session_date) incomingDate = new Date(session_date);
      const isTryingToChangeDate = !!incomingDate && session.session_date && incomingDate.getTime() !== new Date(session.session_date).getTime();
      if (isTryingToPropose || isTryingToChangeDate) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change date/time of a confirmed session'
        });
      }
    }
    // Determine the intended operation
    const isProposalOnly = !!student_proposed_date && !approve_proposed && !reject_proposed;

    // Parse incoming dates safely
    const parseLocalToUTC = (val) => {
      if (!val) return null;
      if (typeof val === 'string') return new Date(val + ':00Z');
      return new Date(val);
    };

    let sessionDateExactUTC = parseLocalToUTC(session_date);
    let proposedDateUTC = parseLocalToUTC(student_proposed_date);

    // For approve flow, use stored proposed date if not provided in body
    if (approve_proposed && !proposedDateUTC && session.student_proposed_date) {
      proposedDateUTC = new Date(session.student_proposed_date);
    }

    // If approving, target date becomes proposed
    if (approve_proposed && proposedDateUTC) {
      sessionDateExactUTC = proposedDateUTC;
    }

    // Compute duration for conflict checks/earnings (fallback to existing)
    const effectiveDuration = Number.isFinite(parseFloat(duration_hours))
      ? parseFloat(duration_hours)
      : session.duration_hours;

    // Calculate new session's end time
    const newSessionEndTime = sessionDateExactUTC
      ? new Date(sessionDateExactUTC.getTime() + effectiveDuration * 60 * 60 * 1000)
      : null;

    // Check for conflicting in-progress sessions
    if (!isProposalOnly && (status === 'in_progress' || status === 'pending' || status === 'confirmed' || approve_proposed)) {
      const conflictingSession = await TutoringSession.findOne({
        tutor_id: session.tutor_id,
        status: { $in: ['in_progress', 'pending', 'confirmed'] },
        _id: { $ne: session_id },
        $or: [
          {
            // Case: Existing session starts before new session ends and ends after new session starts
            session_date: newSessionEndTime ? { $lte: newSessionEndTime } : session.session_date,
            $expr: {
              $gt: [
                { $add: ['$session_date', { $multiply: ['$duration_hours', 60 * 60 * 1000] }] },
                sessionDateExactUTC || session.session_date
              ]
            }
          }
        ]
      });
      if (conflictingSession) {
        return res.status(400).json({
          success: false,
          message: "Cannot start this session. You already have an active session in progress."
        });
      }
    }

    // Store old duration for tutor hours update
    const oldDuration = session.duration_hours;

    // Normalize academic_level: accept ObjectId string, populated object, or legacy name
    let normalizedAcademicLevel = session.academic_level;
    if (academic_level !== undefined && academic_level !== null && academic_level !== '') {
      if (typeof academic_level === 'object' && academic_level._id) {
        normalizedAcademicLevel = new mongoose.Types.ObjectId(academic_level._id);
      } else if (typeof academic_level === 'string') {
        const isObjectId = /^[a-fA-F0-9]{24}$/.test(academic_level);
        if (isObjectId) {
          normalizedAcademicLevel = new mongoose.Types.ObjectId(academic_level);
        } else {
          const foundLevel = await EducationLevel.findOne({ level: academic_level });
          if (foundLevel) {
            normalizedAcademicLevel = foundLevel._id;
          }
        }
      }
    }

    // Normalize hourly rate (could be number or [number])
    const hourlyRateNumberRaw = Array.isArray(hourly_rate)
      ? parseFloat(hourly_rate?.[0])
      : parseFloat(hourly_rate);
    const hourlyRateNumber = Number.isFinite(hourlyRateNumberRaw) ? hourlyRateNumberRaw : session.hourly_rate;
    const total_earnings = (Number.isFinite(parseFloat(duration_hours)) ? parseFloat(duration_hours) : session.duration_hours) * hourlyRateNumber;

    const updates = {
      student_id: student_id || session.student_id,
      subject: subject || session.subject,
      academic_level: normalizedAcademicLevel,
      // session_date will be set only for approval or explicit update
      duration_hours: Number.isFinite(parseFloat(duration_hours)) ? parseFloat(duration_hours) : session.duration_hours,
      hourly_rate: hourlyRateNumber,
      total_earnings,
      status: status || session.status,
      notes: notes !== undefined ? notes : session.notes
    };

    // Handle student proposal only (no other fields required)
    if (isProposalOnly) {
      updates.student_proposed_date = proposedDateUTC;
      updates.student_proposed_status = 'pending';
      updates.student_proposed_decided_at = null;
      if (status) updates.status = status;
      const updatedOnlyProposal = await TutoringSession.findByIdAndUpdate(
        session_id,
        updates,
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: 'Proposed time saved successfully',
        session: updatedOnlyProposal
      });
    }

    // If approving proposed date
    if (approve_proposed && proposedDateUTC) {
      updates.session_date = proposedDateUTC;
      updates.student_proposed_status = 'accepted';
      updates.student_proposed_decided_at = new Date();
      updates.student_proposed_date = null;
      if (!status) {
        updates.status = 'confirmed';
      }
    } else if (reject_proposed) {
      updates.student_proposed_status = 'rejected';
      updates.student_proposed_decided_at = new Date();
      updates.student_proposed_date = null;
    } else if (sessionDateExactUTC) {
      // Normal update path sets the new date
      updates.session_date = sessionDateExactUTC;
    }

    // Do not accept rating/feedback in this endpoint anymore; use student rating endpoint
    const nextStatus = status || session.status;
    if (status === 'completed') {
      updates.completed_at = new Date();

      if (duration_hours !== oldDuration) {
        const tutorProfile = await TutorProfile.findOne({ user_id: session.tutor_id });
        if (tutorProfile) {
          tutorProfile.tutoring_hours =
            (tutorProfile.tutoring_hours || 0) - oldDuration + duration_hours;
          await tutorProfile.save();
        }
      }
    }

    // If tutor sets status back to pending, clear meeting link and student responses
    if ((status && status === 'pending')) {
      updates.meeting_link = '';
      updates.meeting_link_sent_at = null;
      updates.student_responses = [];
      // also clear any pending proposal state
      updates.student_proposed_date = null;
      updates.student_proposed_status = undefined;
      updates.student_proposed_decided_at = undefined;
    }

    const updatedSession = await TutoringSession.findByIdAndUpdate(
      session_id,
      updates,
      { new: true }
    );
    
    
    res.status(200).json({
      success: true,
      message: "Session updated successfully",
      session: updatedSession
    });

  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({
      success: false,
      message: "Server error while updating session",
      error: error.message
    });
  }
});


// Get tutor's sessions with filtering
const getTutorSessions = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { status, limit = 10, page = 1, start_date, end_date } = req.query;

  const tutor = await TutorProfile.findOne({ user_id: user_id });
  const query = { tutor_id: tutor._id };
  if (status) {
    query.status = status;
  }
  if (start_date && end_date) {
    query.session_date = {
      $gte: new Date(start_date),
      $lte: new Date(end_date)
    };
  }

  const sessions = await TutoringSession.find(query)
    .populate({
      path: 'student_ids',
      populate: {
        path: 'user_id',
        select: 'full_name email'
      }
    })
    .populate({ path: 'student_responses.student_id', select: 'user_id', populate: { path: 'user_id', select: 'full_name email' } })
    .populate({ path: 'student_ratings.student_id', select: 'user_id', populate: { path: 'user_id', select: 'full_name email' } })
    .populate({ path: 'academic_level', select: 'level' })
    .sort({ session_date: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));
  const total = await TutoringSession.countDocuments(query);
  res.json({
    sessions,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit))
  });
});

// Get tutor's inquiries
const getTutorInquiries = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { status, limit = 10, page = 1 } = req.query;

  if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
    res.status(400);
    throw new Error("Invalid tutor ID");
  }

  const tutor = await TutorProfile.findOne({ user_id });
  if (!tutor) {
    res.status(404);
    throw new Error("Tutor not found");
  }

  const query = { tutor_id: tutor._id };
  if (status && status !== 'all') {
    query.status = status;
  }

  const inquiries = await TutorInquiry.find(query)
    .populate({
      path: 'student_id',
      populate: {
        path: 'user_id',
        select: 'full_name email'
      }
    })
    .sort({ created_at: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));
  const total = await TutorInquiry.countDocuments(query);
  res.json({
    inquiries,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit))
  });
});

// Reply to inquiry
const replyToInquiry = asyncHandler(async (req, res) => {
  const { inquiry_id } = req.params;
  const { reply_message } = req.body;
  const inquiry = await TutorInquiry.findById(inquiry_id);
  if (!inquiry) {
    res.status(404);
    throw new Error("Inquiry not found");
  }
  // Calculate response time
  const responseTime = Math.round((Date.now() - inquiry.createdAt.getTime()) / (1000 * 60));
  inquiry.status = 'replied';
  inquiry.response_time_minutes = responseTime;
  inquiry.replied_at = new Date();
  inquiry.reply_message = reply_message;

  await inquiry.save();

  res.json({
    message: "Reply sent successfully",
    inquiry
  });
});

// Get tutor's detailed statistics
const getTutorStats = asyncHandler(async (req, res) => {
  const { tutor_id } = req.params;
  const { period = 'all' } = req.query; // all, month, week

  let dateFilter = {};
  if (period === 'month') {
    dateFilter = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  } else if (period === 'week') {
    dateFilter = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
  }

  const tutorObjectId = new mongoose.Types.ObjectId(tutor_id);

  const [totalHours, totalEarnings, completedSessions, avgResponseTime] = await Promise.all([
    TutoringSession.aggregate([
      { $match: { tutor_id: tutorObjectId, status: 'completed', ...(Object.keys(dateFilter).length > 0 && { completed_at: dateFilter }) } },
      { $group: { _id: null, total: { $sum: '$duration_hours' } } }
    ]),
    TutoringSession.aggregate([
      { $match: { tutor_id: tutorObjectId, status: 'completed', ...(Object.keys(dateFilter).length > 0 && { completed_at: dateFilter }) } },
      { $group: { _id: null, total: { $sum: '$total_earnings' } } }
    ]),
    TutoringSession.countDocuments({ tutor_id: tutorObjectId, status: 'completed', ...(Object.keys(dateFilter).length > 0 && { completed_at: dateFilter }) }),
    TutorInquiry.aggregate([
      { $match: { tutor_id: tutorObjectId, response_time_minutes: { $exists: true } } },
      { $group: { _id: null, average: { $avg: '$response_time_minutes' } } }
    ])
  ]);

  const bookingAcceptanceRate = await calculateBookingAcceptanceRate(tutor_id);

  const stats = {
    totalHours: totalHours[0]?.total || 0,
    totalEarnings: totalEarnings[0]?.total || 0,
    completedSessions,
    averageRating: tutor.average_rating || 0,
    avgResponseTime: avgResponseTime[0]?.average || 0,
    bookingAcceptanceRate,
    period
  };

  res.json(stats);
});

// Get tutor profile
const getTutorProfile = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const profile = await TutorProfile.findOne({ user_id })
    .populate('user_id', 'full_name email photo_url');
  const total_sessions = await TutoringSession.countDocuments({ tutor_id: profile._id });
  if (!profile) {
    res.status(404);
    throw new Error("Tutor profile not found");
  }

  res.json({...profile, total_sessions});
});

// Get tutor's preferred interview slots and status
const getMyInterviewSlots = asyncHandler(async (req, res) => {
  try {
    const { user_id } = req.params;
    const tutor = await TutorProfile.findOne({ user_id });
    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor profile not found' });
    }
    const application = await TutorApplication.findOne({ tutor_id: tutor._id }).select(
      'preferred_interview_times interview_status scheduled_time again_interview'
    );
    if (!application) {
      return res.status(404).json({ success: false, message: 'Tutor application not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        preferred_interview_times: application.preferred_interview_times || [],
        interview_status: application.interview_status || 'Pending',
        scheduled_time: application.scheduled_time || null,
        again_interview: Boolean(application.again_interview)
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Tutor requests interview again (only once, only if previous status is Failed)
const requestInterviewAgain = asyncHandler(async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) {
      return res.status(400).json({ success: false, message: 'user_id is required' });
    }

    const tutor = await TutorProfile.findOne({ user_id });
    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor profile not found' });
    }

    const application = await TutorApplication.findOne({ tutor_id: tutor._id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Tutor application not found' });
    }

    if (application.again_interview) {
      return res.status(400).json({ success: false, message: 'Re-interview already requested' });
    }

    if (application.interview_status !== 'Failed') {
      return res.status(400).json({ success: false, message: 'Re-interview can be requested only when status is Failed' });
    }

    application.again_interview = true;
    application.interview_status = 'Pending';
    application.preferred_interview_times = [];
    application.scheduled_time = null;
    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Re-interview requested successfully',
      data: {
        again_interview: true,
        interview_status: application.interview_status,
        preferred_interview_times: application.preferred_interview_times,
        scheduled_time: application.scheduled_time
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Send meeting link to confirmed students and set session status to confirmed
const sendMeetingLink = asyncHandler(async (req, res) => {
  const { session_id } = req.params;
  const { meeting_link } = req.body;
  if (!meeting_link) {
    return res.status(400).json({ success: false, message: 'meeting_link is required' });
  }
  const session = await TutoringSession.findById(session_id)
    .populate({ path: 'student_responses.student_id', populate: { path: 'user_id', select: 'email full_name' } })
    .populate({ path: 'tutor_id', populate: { path: 'user_id', select: 'full_name email' } });
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  // Gather confirmed students
  const confirmed = (session.student_responses || []).filter(r => r.status === 'confirmed');
  if (confirmed.length === 0) {
    return res.status(400).json({ success: false, message: 'No confirmed students to send meeting link to' });
  }

  // Send emails
  try {
    const toList = confirmed
      .map(r => r?.student_id?.user_id?.email)
      .filter(Boolean);
    if (toList.length === 0) {
      return res.status(400).json({ success: false, message: 'Confirmed students have no emails on file' });
    }

    const subject = `Session Link for ${session.subject}`;
    const html = `
      <p>Hello,</p>
      <p>Your session is scheduled on <b>${new Date(session.session_date).toUTCString()}</b>.</p>
      <p>Please join using this link: <a href="${meeting_link}">${meeting_link}</a></p>
      <p>Regards,<br/>${session.tutor_id?.user_id?.full_name || 'Your Tutor'}</p>
    `;

    // We send to each student separately to avoid email exposure
    for (const to of toList) {
      await sendEmail(to, subject, html);
    }

    // Update session level
    session.meeting_link = meeting_link;
    session.meeting_link_sent_at = new Date();
    session.status = 'confirmed';
    await session.save();

    return res.status(200).json({ success: true, message: 'Meeting link sent and session confirmed', session });
  } catch (err) {
    console.error('Error sending meeting link:', err);
    return res.status(500).json({ success: false, message: 'Failed to send meeting link', error: err.message });
  }
});

// Get available students for tutor to select from
// Get available students for tutor to select from
const getAvailableStudents = asyncHandler(async (req, res) => {
  try {
    const user_id = req.params.user_id;

    // Find tutor profile
    const tutorProfile = await TutorProfile.findOne({ user_id });
    if (!tutorProfile) {
      res.status(404);
      throw new Error("Tutor profile not found");
    }

    // Find students who accepted this tutor
    const students = await StudentProfile.find({
      hired_tutors: {
        $elemMatch: {
          tutor: tutorProfile._id,
          status: "accepted"
        }
      }
    })
      .populate("user_id", "full_name email age")
      .populate("academic_level", "level hourlyRate") // Directly populate EducationLevel info
      .select("user_id academic_level preferred_subjects availability");
    // Format the student list
    const formattedStudents = students.map(student => {
     

      return {
        _id: student.user_id._id,
        full_name: student.user_id.full_name,
        email: student.user_id.email,
        age: student.user_id.age,
        academic_level: student.academic_level || null,
        preferred_subjects: student.preferred_subjects || [],
        availability: student.availability || [],
        // hourly_rate
      };
    });
    res.json({
      students: formattedStudents,
      total: formattedStudents.length
    });

  } catch (err) {
    res.status(500);
    throw new Error("Failed to fetch students: " + err.message);
  }
});



// Get tutor's availability settings
const getTutorAvailability = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const tutor = await TutorProfile.findOne({ user_id });
  if (!tutor) {
    res.status(400);
    throw new Error("Invalid tutor ID");
  }

  let availability = await TutorAvailability.findOne({ tutor_id: tutor._id });

  // If no availability record exists, create a default one
  if (!availability) {
    availability = await TutorAvailability.create({ tutor_id: tutor._id });
  }
  res.json(availability);
});

// Update tutor's general availability settings
const updateGeneralAvailability = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { general_availability, minimum_notice_hours, maximum_advance_days, session_durations, is_accepting_bookings } = req.body;
  const tutor = await TutorProfile.findOne({ user_id });
  if (!tutor) {
    res.status(400);
    throw new Error("Invalid tutor ID");
  }

  let availability = await TutorAvailability.findOne({ tutor_id: tutor._id });

  if (!availability) {
    availability = new TutorAvailability({ tutor_id: tutor._id });
  }

  if (general_availability) {
    availability.general_availability = general_availability;
  }

  if (minimum_notice_hours !== undefined) {
    availability.minimum_notice_hours = minimum_notice_hours;
  }

  if (maximum_advance_days !== undefined) {
    availability.maximum_advance_days = maximum_advance_days;
  }

  if (session_durations) {
    availability.session_durations = session_durations;
  }

  if (is_accepting_bookings !== undefined) {
    availability.is_accepting_bookings = is_accepting_bookings;
  }

  await availability.save();

  res.json({
    message: "General availability updated successfully",
    availability
  });
});

// Add blackout date
const addBlackoutDate = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { start_date, end_date, reason } = req.body;
  const tutor = await TutorProfile.findOne({ user_id });
  if (!tutor) {
    res.status(400);
    throw new Error("Invalid tutor ID");
  }

  if (!start_date || !end_date) {
    res.status(400);
    throw new Error("Start date and end date are required");
  }

  let availability = await TutorAvailability.findOne({ tutor_id: tutor._id });

  if (!availability) {
    availability = new TutorAvailability({ tutor_id: tutor._id });
  }

  availability.blackout_dates.push({
    start_date: new Date(start_date),
    end_date: new Date(end_date),
    reason: reason || ''
  });

  await availability.save();

  res.status(201).json({
    message: "Blackout date added successfully",
    availability
  });
});

// Update blackout date
const updateBlackoutDate = asyncHandler(async (req, res) => {
  const { user_id, blackout_id } = req.params;
  const { start_date, end_date, reason, is_active } = req.body;
  const tutor = await TutorProfile.findOne({ user_id });
  if (!tutor) {
    res.status(400);
    throw new Error("Invalid tutor ID");
  }

  const availability = await TutorAvailability.findOne({ tutor_id: tutor._id });

  if (!availability) {
    res.status(404);
    throw new Error("Availability record not found");
  }

  const blackout = availability.blackout_dates.id(blackout_id);

  if (!blackout) {
    res.status(404);
    throw new Error("Blackout date not found");
  }

  if (start_date !== undefined) blackout.start_date = new Date(start_date);
  if (end_date !== undefined) blackout.end_date = new Date(end_date);
  if (reason !== undefined) blackout.reason = reason;
  if (is_active !== undefined) blackout.is_active = is_active;

  await availability.save();

  res.json({
    message: "Blackout date updated successfully",
    availability
  });
});

// Remove blackout date
const removeBlackoutDate = asyncHandler(async (req, res) => {
  const { user_id, blackout_id } = req.params;
  const tutor = await TutorProfile.findOne({ user_id });
  if (!tutor) {
    res.status(400);
    throw new Error("Invalid tutor ID");
  }

  const availability = await TutorAvailability.findOne({ tutor_id: tutor._id });

  if (!availability) {
    res.status(404);
    throw new Error("Availability record not found");
  }

  availability.blackout_dates = availability.blackout_dates.filter(
    blackout => blackout._id.toString() !== blackout_id
  );

  await availability.save();

  res.json({
    message: "Blackout date removed successfully",
    availability
  });
});

// Get available slots for a specific date
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { date, duration_minutes = 60 } = req.query;
  const tutor = await TutorProfile.findOne({ user_id });
  if (!tutor) {
    res.status(400);
    throw new Error("Invalid tutor ID");
  }

  if (!date) {
    res.status(400);
    throw new Error("Date is required");
  }

  const availability = await TutorAvailability.findOne({ tutor_id: tutor._id });

  if (!availability) {
    res.status(404);
    throw new Error("Availability record not found");
  }

  const slots = availability.getAvailableSlots(date, parseInt(duration_minutes));

  res.json({
    date: date,
    duration_minutes: parseInt(duration_minutes),
    available_slots: slots
  });
});

// Check if a specific date/time is available
const checkAvailability = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { date, duration_minutes = 60 } = req.query;
  const tutor = await TutorProfile.findOne({ user_id });
  if (!tutor) {
    res.status(400);
    throw new Error("Invalid tutor ID");
  }

  if (!date) {
    res.status(400);
    throw new Error("Date is required");
  }

  // Ensure proper date parsing for datetime-local input
  let parsedDate = date;
  if (date.includes('T')) {
    // Handle datetime-local format (YYYY-MM-DDTHH:MM)
    parsedDate = new Date(date).toISOString();
  }


  const availability = await TutorAvailability.findOne({ tutor_id: tutor._id });

  if (!availability) {
    res.status(404);
    throw new Error("Availability record not found");
  }

  const isAvailable = availability.isAvailable(parsedDate, parseInt(duration_minutes));

  res.json({
    date: date,
    duration_minutes: parseInt(duration_minutes),
    is_available: isAvailable
  });
});

// Get hire requests for a tutor with optional status filter
const getHireRequests = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { status = 'all' } = req.query; // all | pending | accepted | rejected

  const tutorProfile = await TutorProfile.findOne({ user_id });
  if (!tutorProfile) {
    return res.status(404).json({ message: "Tutor profile not found" });
  }

  let query;
  if (status && status !== 'all') {
    query = { hired_tutors: { $elemMatch: { tutor: tutorProfile._id, status } } };
  } else {
    query = { 'hired_tutors.tutor': tutorProfile._id };
  }

  const students = await StudentProfile.find(query)
    .populate('user_id', 'full_name email photo_url age')
    .select('user_id academic_level preferred_subjects hired_tutors createdAt updatedAt')
    .lean();

  const shaped = students.map((s) => {
    // Find ALL hire requests from this student for this tutor
    const allHires = (s.hired_tutors || []).filter(
      (h) => h && h.tutor && h.tutor.toString() === tutorProfile._id.toString()
    );

    // Get the most recent hire request (by hired_at timestamp)
    const mostRecentHire = allHires.length > 0
      ? allHires.reduce((latest, current) => {
        const latestTime = new Date(latest.hired_at || latest.createdAt || 0);
        const currentTime = new Date(current.hired_at || current.createdAt || 0);
        return currentTime > latestTime ? current : latest;
      })
      : null;

    return {
      _id: s._id,
      user_id: s.user_id,
      academic_level: s.academic_level,
      preferred_subjects: s.preferred_subjects,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      hire_for_this_tutor: mostRecentHire ? {
        status: mostRecentHire.status,
        hired_at: mostRecentHire.hired_at,
        academic_level_id: mostRecentHire.academic_level_id,
        subject: mostRecentHire.subject,
        _id: mostRecentHire._id // Include the hire record ID for proper updating
      } : null,
      // Include count of total requests for debugging
      total_requests: allHires.length
    };
  });

  res.status(200).json({ success: true, requests: shaped });
});

// Respond to a hire request (accept or reject)
const respondToHireRequest = asyncHandler(async (req, res) => {
  const { user_id } = req.params; // Tutor's user id
  const { student_profile_id, action, hire_record_id } = req.body; // action: 'accept' | 'reject'

  if (!student_profile_id || !['accept', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'student_profile_id and valid action are required' });
  }

  const tutorProfile = await TutorProfile.findOne({ user_id });
  if (!tutorProfile) {
    return res.status(404).json({ message: 'Tutor profile not found' });
  }

  const studentProfile = await StudentProfile.findById(student_profile_id);
  if (!studentProfile) {
    return res.status(404).json({ message: 'Student profile not found' });
  }

  // Find the specific hire record by ID if provided, otherwise find by tutor
  let hireRecord;
  if (hire_record_id) {
    // Find by specific hire record ID
    hireRecord = studentProfile.hired_tutors.id(hire_record_id);
    if (!hireRecord || hireRecord.tutor.toString() !== tutorProfile._id.toString()) {
      return res.status(404).json({ message: 'Hire request not found for this tutor' });
    }
  } else {
    // Fallback: find by tutor (for backward compatibility)
    hireRecord = studentProfile.hired_tutors.find(
      (h) => h && h.tutor && h.tutor.toString() === tutorProfile._id.toString()
    );
    if (!hireRecord) {
      return res.status(404).json({ message: 'Hire request not found for this tutor' });
    }
  }

  // Update the status
  hireRecord.status = action === 'accept' ? 'accepted' : 'rejected';
  await studentProfile.save();

  // If tutor accepts the request, create a payment record
  if (action === 'accept') {
    try {
      // Check if payment record already exists
      const existingPayment = await StudentPayment.findOne({
        student_id: studentProfile._id,
        tutor_id: tutorProfile._id,
        subject: hireRecord.subject,
        academic_level: hireRecord.academic_level_id
      });

      if (!existingPayment) {
        // Get the subject and academic level details for better notes
        const subjectData = await Subject.findById(hireRecord.subject);
        const academicLevelData = await EducationLevel.findById(hireRecord.academic_level_id);
        
        // Calculate payment details based on tutor's settings
        const tutorAcademicLevel = tutorProfile.academic_levels_taught.find(
          level => level.educationLevel.toString() === hireRecord.academic_level_id.toString()
        );
        
        if (!tutorAcademicLevel) {
          console.error('Tutor academic level not found for payment creation');
          return;
        }
        
        // Calculate payment details based on tutor's settings
        const baseAmount = tutorAcademicLevel.hourlyRate || tutorProfile.hourly_rate || 25;
        const discount = tutorAcademicLevel.discount || 0;
        const totalSessions = tutorAcademicLevel.totalSessionsPerMonth || 1;

        
        // Calculate validity period (30 days from now)
        const validityStartDate = new Date();
        const validityEndDate = new Date(validityStartDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
        
        // Create comprehensive payment record
        const paymentRecord = new StudentPayment({
          student_id: studentProfile._id,
          tutor_id: tutorProfile._id,
          subject: hireRecord.subject,
          academic_level: hireRecord.academic_level_id,
          
          // Payment Type and Amount
          payment_type: 'monthly', // Default to monthly package
          base_amount: baseAmount,
          discount_percentage: discount,
          
          // Monthly Package Details
          monthly_amount: tutorAcademicLevel.monthlyRate,
          
          // Validity and Sessions
          validity_start_date: validityStartDate,
          validity_end_date: validityEndDate,
          sessions_remaining: tutorAcademicLevel.totalSessionsPerMonth,
          total_sessions_per_month: tutorAcademicLevel.totalSessionsPerMonth,
          
          // Request Details
          payment_status: 'pending',
          request_notes: `Monthly package for ${subjectData?.name || 'Subject'} - ${academicLevelData?.level || 'Level'}. ${totalSessions} sessions per month.`,
          
          // Additional Details
          currency: 'GBP'
        });

        await paymentRecord.save();
      }
    } catch (paymentError) {
      console.error('Error creating payment record for accepted hire request:', paymentError);
      // Don't fail the hire acceptance if payment record creation fails
    }
  }

  return res.status(200).json({
    success: true,
    message: `Request ${action}ed successfully`,
    student_profile_id,
    hire_record_id: hireRecord._id,
    status: hireRecord.status,
  });
});

// Helper function to check if tutor can create sessions for student (payment must be completed and valid)
const canCreateSessionForStudent = async (tutorId, studentId, subject, academicLevel) => {
  try {
    const payment = await StudentPayment.findOne({
      student_id: studentId,
      tutor_id: tutorId,
      subject: subject,
      academic_level: academicLevel,
      payment_status: 'paid',
      academic_level_paid: true,
      is_active: true
    });
    
    if (!payment) {
      return false;
    }
    // Check if payment is still valid (not expired and has sessions remaining)
    return payment.isValid();
  } catch (error) {
    console.error('Error checking payment status:', error);
    return false;
  }
};

// Check payment status for a specific student-subject-academic level combination
const checkPaymentStatus = asyncHandler(async (req, res) => {
  const { student_id, subject, academic_level } = req.body;
  const tutor_id = req.user._id; // From auth middleware

  if (!student_id || !subject || !academic_level) {
    return res.status(400).json({ 
      message: "Missing required fields: student_id, subject, academic_level" 
    });
  }

  try {
    const canCreate = await canCreateSessionForStudent(tutor_id, student_id, subject, academic_level);
    
    // Get payment details if payment exists
    let paymentDetails = null;
    if (canCreate) {
      const payment = await StudentPayment.findOne({
        student_id: student_id,
        tutor_id: tutor_id,
        subject: subject,
        academic_level: academic_level,
        payment_status: 'paid'
      });
      
      if (payment) {
        paymentDetails = {
          payment_type: payment.payment_type,
          final_amount: payment.final_amount,
          sessions_remaining: payment.sessions_remaining,
          validity_end_date: payment.validity_end_date
        };
      }
    }

    return res.status(200).json({
      canCreateSession: canCreate,
      paymentDetails: paymentDetails
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return res.status(500).json({ 
      message: "Internal server error while checking payment status" 
    });
  }
});

const sendMessageResponse = asyncHandler(async (req, res) => {
  const { messageId, response } = req.body;
  const tutorId = req.user._id;

  if (!messageId || !response) {
    res.status(400);
    throw new Error("Message ID and response are required");
  }

  const messageDoc = await Message.findById(messageId);

  if (!messageDoc) {
    res.status(404);
    throw new Error("Message not found");
  }

  // Ensure only assigned tutor can reply
  if (messageDoc.tutorId.toString() !== tutorId.toString()) {
    res.status(403);
    throw new Error("You are not authorized to reply to this message");
  }

  // Update response & status
  messageDoc.response = response;
  messageDoc.status = "answered";
  await messageDoc.save();
  res.status(200).json({
    success: true,
    message: "Response sent successfully",
    data: messageDoc,
  });
});

const getTutorMessages = asyncHandler(async (req, res) => {
  const tutorId = req.user._id; // Logged-in tutor

  const messages = await Message.find({ tutorId })
    .populate("studentId", "full_name") // sirf name & email le rahe hain
    .sort({ createdAt: -1 }); // latest first

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages,

  });
});

const getSpecificUserChat = asyncHandler(async (req, res) => {
  const tutorId = req.user._id;
  const { studentId } = req.params;

  const messages = await Message.find({ tutorId, studentId })
    .populate("studentId", "full_name")
    .sort({ createdAt: 1 }); // oldest first for chat order

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages,
  });
})

const deleteSession = asyncHandler(async (req, res) => {
  const { session_id } = req.params;
  const { user } = req; // Get the authenticated user from auth middleware

  if (!session_id) {
    res.status(400);
    throw new Error("Session ID is required");
  }

  // Find the session first to check ownership
  const session = await TutoringSession.findById(session_id);

  if (!session) {
    res.status(404);
    throw new Error("Session not found");
  }

  // Find the tutor profile for the authenticated user
  const tutorProfile = await TutorProfile.findOne({ user_id: user._id });
  if (!tutorProfile) {
    res.status(404);
    throw new Error("Tutor profile not found");
  }

  // Verify that the logged-in tutor owns this session
  if (session.tutor_id.toString() !== tutorProfile._id.toString()) {
    res.status(403);
    throw new Error("You are not authorized to delete this session");
  }

  // Check if session can be deleted (e.g., not completed or in progress)
  if (session.status === 'completed' || session.status === 'in_progress') {
    return res.status(400).json({
      success: false,
      message: "Cannot delete completed or in-progress sessions"
    });
  }

  // Delete the session
  await TutoringSession.findByIdAndDelete(session_id);

  res.status(200).json({
    success: true,
    message: "Session deleted successfully"
  });
});

// Get all verified tutors for home page display
const getVerifiedTutors = asyncHandler(async (req, res) => {
  try {
    const verifiedTutors = await TutorProfile.find({
      profile_status: 'approved',
      is_verified: true
    })
      .populate({
        path: 'user_id',
        select: 'full_name photo_url email'
      })
      .populate({
        path: 'academic_levels_taught.educationLevel',
        select: 'name'
      })
      .lean();

    // Transform the data to include min-max hourly rates and other required fields
    const transformedTutors = verifiedTutors.map(tutor => {
      const user = tutor.user_id;

      // Calculate min and max hourly rates
      let minHourlyRate = Infinity;
      let maxHourlyRate = 0;

      if (tutor.academic_levels_taught && tutor.academic_levels_taught.length > 0) {
        tutor.academic_levels_taught.forEach(level => {
          if (level.hourlyRate < minHourlyRate) minHourlyRate = level.hourlyRate;
          if (level.hourlyRate > maxHourlyRate) maxHourlyRate = level.hourlyRate;
        });
      }

      // If no rates found, set defaults
      if (minHourlyRate === Infinity) minHourlyRate = 0;
      if (maxHourlyRate === 0) maxHourlyRate = 0;

      return {
        _id: tutor._id,
        user_id: tutor.user_id._id,
        full_name: user.full_name,
        photo_url: user.photo_url,
        email: user.email,
        bio: tutor.bio,
        qualifications: tutor.qualifications,
        experience_years: tutor.experience_years,
        subjects: tutor.subjects || [],
        academic_levels: tutor.academic_levels_taught,
        min_hourly_rate: minHourlyRate,
        max_hourly_rate: maxHourlyRate,
        average_rating: tutor.average_rating || 0,
        total_sessions: tutor.total_sessions || 0,
        location: tutor.location,
        is_background_checked: tutor.is_background_checked,
        is_reference_verified: tutor.is_reference_verified,
        is_qualification_verified: tutor.is_qualification_verified
      };
    });
    res.status(200).json({
      success: true,
      count: transformedTutors.length,
      tutors: transformedTutors
    });

  } catch (error) {
    console.error('Error fetching verified tutors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verified tutors',
      error: error.message
    });
  }
});

// Get tutor settings data (education levels and subjects)
const getTutorSettings = asyncHandler(async (req, res) => {
  try {
    const { user_id } = req.params;

    // Get tutor profile
    const tutorProfile = await TutorProfile.findOne({ user_id })
      .populate('academic_levels_taught.educationLevel');
    if (!tutorProfile) {
      res.status(404);
      throw new Error("Tutor profile not found");
    }

    // Get all education levels
    const educationLevels = await EducationLevel.find().sort({ level: 1 });
    const tutor_prmision = tutorProfile.academic_levels_taught.map(level => level.educationLevel.isTutorCanChangeRate)
    // Get all subjects
    const subjects = await Subject.find().sort({ name: 1 });

    // Get current tutor settings for each education level
    const currentSettings = tutorProfile.academic_levels_taught.map(level => ({
      educationLevelId: level.educationLevel._id,
      educationLevelName: level.educationLevel.level,
      hourlyRate: level.hourlyRate,
      totalSessionsPerMonth: level.totalSessionsPerMonth,
      discount: level.discount,
      monthlyRate: level.monthlyRate,
    }));

    res.status(200).json({
      success: true,
      data: {
        educationLevels,
        subjects: tutorProfile.subjects,
        allSubjects: subjects,
        currentSettings,
        canModifyRates: tutor_prmision // This can be controlled by admin later
      }
    });

  } catch (error) {
    console.error('Error fetching tutor settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor settings',
      error: error.message
    });
  }
});

// Update tutor settings (rates and sessions) for EXISTING levels only
const updateTutorSettings = asyncHandler(async (req, res) => {
  try {
    const { user_id } = req.params;
    const { academicLevelSettings } = req.body;

    if (!academicLevelSettings || !Array.isArray(academicLevelSettings)) {
      res.status(400);
      throw new Error("Academic level settings are required");
    }

    // Get tutor profile
    const tutorProfile = await TutorProfile.findOne({ user_id });
    if (!tutorProfile) {
      res.status(404);
      throw new Error("Tutor profile not found");
    }

    // Update each academic level setting (must already exist on profile)
    for (const setting of academicLevelSettings) {
      const { educationLevelId, hourlyRate, totalSessionsPerMonth, discount } = setting;

      // Find the corresponding academic level in tutor profile
      const levelIndex = tutorProfile.academic_levels_taught.findIndex(
        level => level.educationLevel.toString() === educationLevelId
      );

      // if total session are less than minSession or greate then maxSession show message. get min and max session from educationLevel
      const educationLevel = await EducationLevel.findById(educationLevelId);
      const minSession = educationLevel.minSession;
      const maxSession = educationLevel.maxSession;
      // If admin locked rates, do not allow updates to values
      if (educationLevel.isTutorCanChangeRate === false) {
        res.status(400);
        return res.json({
          success: false,
          message: `Rates for this level are managed by admin and cannot be changed`
        });
      }
      if (totalSessionsPerMonth < minSession || totalSessionsPerMonth > maxSession) {
        res.status(400);
        return res.json({
          success: false,
          message: `Total sessions per month must be between ${minSession} and ${maxSession}`
        });
      }

      if (levelIndex !== -1) {
        // Update the rates and sessions
        tutorProfile.academic_levels_taught[levelIndex].hourlyRate = hourlyRate;
        tutorProfile.academic_levels_taught[levelIndex].totalSessionsPerMonth = totalSessionsPerMonth;
        tutorProfile.academic_levels_taught[levelIndex].discount = discount;

        // Calculate monthly rate
        const gross = hourlyRate * totalSessionsPerMonth;
        const discountAmount = (gross * discount) / 100;
        tutorProfile.academic_levels_taught[levelIndex].monthlyRate = gross - discountAmount;
      } else {
        res.status(404);
        return res.json({
          success: false,
          message: "Academic level not found in tutor profile. Use add endpoint to add new levels."
        });
      }
    }

    

    // Save the updated profile
    await tutorProfile.save();

    res.status(200).json({
      success: true,
      message: "Tutor settings updated successfully",
      data: tutorProfile.academic_levels_taught
    });

  } catch (error) {
    console.error('Error updating tutor settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tutor settings',
      error: error.message
    });
  }
});

// Add a new academic level to tutor profile
const addTutorAcademicLevel = asyncHandler(async (req, res) => {
  try {
    const { user_id } = req.params;
    const { educationLevelId, hourlyRate, totalSessionsPerMonth, discount } = req.body || {};

    const tutorProfile = await TutorProfile.findOne({ user_id });
    if (!tutorProfile) {
      res.status(404);
      throw new Error("Tutor profile not found");
    }

    const educationLevel = await EducationLevel.findById(educationLevelId);
    if (!educationLevel) {
      res.status(404);
      throw new Error("Education level not found");
    }

    const exists = tutorProfile.academic_levels_taught.some(
      level => level.educationLevel.toString() === String(educationLevelId)
    );
    if (exists) {
      res.status(400);
      return res.json({ success: false, message: "Level already exists in profile" });
    }

    // Determine values: locked levels ignore provided values and use defaults
    let newHourly = educationLevel.hourlyRate || 0;
    let newTotalSessions = educationLevel.totalSessionsPerMonth || 0;
    let newDiscount = educationLevel.discount || 0;

    if (educationLevel.isTutorCanChangeRate !== false) {
      // allow overrides if provided
      if (typeof hourlyRate === 'number') newHourly = hourlyRate;
      if (typeof totalSessionsPerMonth === 'number') newTotalSessions = totalSessionsPerMonth;
      if (typeof discount === 'number') newDiscount = discount;
    }

    // ⚡ Removed min/max session bounds check

    const gross = newHourly * newTotalSessions;
    const discountAmount = (gross * newDiscount) / 100;
    const monthlyRate = gross - discountAmount;

    tutorProfile.academic_levels_taught.push({
      educationLevel: educationLevel._id,
      name: educationLevel.level,
      hourlyRate: newHourly,
      totalSessionsPerMonth: newTotalSessions,
      discount: newDiscount,
      monthlyRate
    });

    await tutorProfile.save();

    return res.status(201).json({
      success: true,
      message: "Academic level added successfully",
      data: tutorProfile.academic_levels_taught
    });
  } catch (error) {
    console.error('Error adding academic level:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add academic level',
      error: error.message,
    });
  }
});


// Remove an academic level from tutor profile
const removeTutorAcademicLevel = asyncHandler(async (req, res) => {
  try {
    const { user_id, education_level_id } = req.params;

    const tutorProfile = await TutorProfile.findOne({ user_id });
    if (!tutorProfile) {
      res.status(404);
      throw new Error("Tutor profile not found");
    }

    const index = tutorProfile.academic_levels_taught.findIndex(
      level => level.educationLevel.toString() === education_level_id
    );

    if (index === -1) {
      res.status(404);
      throw new Error("Academic level not found in tutor profile");
    }

    tutorProfile.academic_levels_taught.splice(index, 1);
    await tutorProfile.save();

    res.status(200).json({
      success: true,
      message: "Academic level removed successfully",
      data: tutorProfile.academic_levels_taught,
    });
  } catch (error) {
    console.error('Error removing academic level:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove academic level',
      error: error.message,
    });
  }
});

// Get hired subjects and academic levels for a specific tutor-student relationship
const getHiredSubjectsAndLevels = asyncHandler(async (req, res) => {
  const { studentId, tutorId } = req.params;
  console.log("studentId", studentId);
  console.log("tutorId", tutorId);
  
  try {
      // Get student profile
      const studentProfile = await StudentProfile.findOne({ user_id: studentId });
      if (!studentProfile) {
          res.status(404);
          throw new Error('Student profile not found');
      }
      const tutorProfile = await TutorProfile.findOne({ user_id: tutorId });
      if (!tutorProfile) {
          res.status(404);
          throw new Error('Tutor profile not found');
      }
      // Get all accepted hire requests for this student with this specific tutor
      const acceptedHireRequests = studentProfile.hired_tutors?.filter(hire => 
          hire.status === 'accepted' && 
          hire.tutor.toString() === tutorProfile._id.toString()
      ) || [];

      const hiredSubjects = new Set();
      const hiredAcademicLevels = new Set();

      for (const hireRequest of acceptedHireRequests) {
          // Check if payment exists for this hire request
          const payment = await StudentPayment.findOne({
              student_id: studentProfile._id,
              tutor_id: tutorProfile._id,
              subject: hireRequest.subject,
              academic_level: hireRequest.academic_level_id,
              payment_status: 'paid',
              is_active: true
          });
          // Only include if payment is completed and still valid
          if (payment ) {
              hiredSubjects.add(hireRequest.subject.toString());
              hiredAcademicLevels.add(hireRequest.academic_level_id.toString());
          }
      }
      res.status(200).json({
          success: true,
          hired_subjects: Array.from(hiredSubjects),
          hired_academic_levels: Array.from(hiredAcademicLevels)
      });

  } catch (error) {
      console.error('Error getting hired subjects and levels:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to get hired subjects and levels',
          error: error.message
      });
  }
});
module.exports = {
  uploadDocument,
  getTutorDashboard,
  createSession,
  updateSessionStatus,
  getTutorSessions,
  getTutorInquiries,
  replyToInquiry,
  getTutorStats,
  getTutorProfile,
  getMyInterviewSlots,
  requestInterviewAgain,
  getAvailableStudents,
  getTutorAvailability,
  updateGeneralAvailability,
  addBlackoutDate,
  updateBlackoutDate,
  removeBlackoutDate,
  getAvailableSlots,
  checkAvailability,
  getHireRequests,
  respondToHireRequest,
  sendMessageResponse,
  getTutorMessages,
  getSpecificUserChat,
  deleteSession,
  getVerifiedTutors,
  getTutorSettings,
  updateTutorSettings,
  addTutorAcademicLevel,
  removeTutorAcademicLevel,
  sendMeetingLink,
  canCreateSessionForStudent,
  checkPaymentStatus,
  getHiredSubjectsAndLevels
};
