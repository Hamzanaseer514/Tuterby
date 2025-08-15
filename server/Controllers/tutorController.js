const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const TutorDocument = require("../Models/tutorDocumentSchema");
const TutoringSession = require("../Models/tutoringSessionSchema");
const TutorProfile = require("../Models/tutorProfileSchema");
const TutorInquiry = require("../Models/tutorInquirySchema");
const TutorAvailability = require("../Models/tutorAvailabilitySchema");
const User = require("../Models/userSchema");
const StudentProfile = require("../Models/studentProfileSchema");
const Message = require("../Models/messageSchema"); // Importing Message model
const { EducationLevel, Subject } = require("../Models/LookupSchema");

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

  const [totalHours, totalEarnings, averageRating, completedSessions] = await Promise.all([
    TutoringSession.aggregate([
      { $match: { tutor_id: tutor._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$duration_hours' } } }
    ]),
    TutoringSession.aggregate([
      { $match: { tutor_id: tutor._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total_earnings' } } }
    ]),
    TutoringSession.aggregate([
      { $match: { tutor_id: tutor._id, status: 'completed', rating: { $exists: true } } },
      { $group: { _id: null, average: { $avg: '$rating' } } }
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
      averageRating: averageRating[0]?.average || 0,
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

  // Normalize students: accept legacy single student_id or new array student_ids (both are student user_ids)
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
  const tutor_total_sessions = await TutoringSession.countDocuments({ tutor_id: tutor._id });
  const allowed_session = tutor.academic_levels_taught.find(level => level.educationLevel.toString() === academic_level.toString());
  if (tutor_total_sessions >= allowed_session.totalSessionsPerMonth) {
    return res.status(400).json({ message: `You have reached the maximum number ${allowed_session.totalSessionsPerMonth} of sessions for this academic level for this month` });
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
    total_earnings: duration_hours * (Number.isFinite(hourlyRateNumber) ? hourlyRateNumber : 0),
    notes: notes || "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });


  return res.status(201).json({
    message: "Tutoring session created successfully",
    session
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
    rating,
    feedback,
    notes
  } = req.body;
  if (!session_date || !duration_hours || !hourly_rate) {
    return res.status(400).json({
      success: false,
      message: "Date, duration, and hourly rate are required"
    });
  }
  try {
    const session = await TutoringSession.findById(session_id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }
    // Convert frontend time to exact UTC without timezone shift
    let sessionDateExactUTC;
    if (typeof session_date === 'string') {
      sessionDateExactUTC = new Date(session_date + ':00Z');
    } else {
      sessionDateExactUTC = new Date(session_date);
    }

    // Calculate new session's end time
    const newSessionEndTime = new Date(sessionDateExactUTC.getTime() + duration_hours * 60 * 60 * 1000);

    // Check for conflicting in-progress sessions
    if (status === 'in_progress' || status === 'pending' || status === 'confirmed') {
      const conflictingSession = await TutoringSession.findOne({
        tutor_id: session.tutor_id,
        status: { $in: ['in_progress', 'pending', 'confirmed'] },
        _id: { $ne: session_id },
        $or: [
          {
            // Case: Existing session starts before new session ends and ends after new session starts
            session_date: { $lte: newSessionEndTime },
            $expr: {
              $gt: [
                { $add: ['$session_date', { $multiply: ['$duration_hours', 60 * 60 * 1000] }] },
                sessionDateExactUTC
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
    const hourlyRateNumber = Array.isArray(hourly_rate)
      ? parseFloat(hourly_rate[0])
      : parseFloat(hourly_rate);
    const total_earnings = duration_hours * (Number.isFinite(hourlyRateNumber) ? hourlyRateNumber : session.hourly_rate);

    const updates = {
      student_id: student_id || session.student_id,
      subject: subject || session.subject,
      academic_level: normalizedAcademicLevel,
      session_date: sessionDateExactUTC, // exact time from frontend
      duration_hours,
      hourly_rate: Number.isFinite(hourlyRateNumber) ? hourlyRateNumber : session.hourly_rate,
      total_earnings,
      status: status || session.status,
      notes: notes !== undefined ? notes : session.notes
    };

    if (status === 'completed') {
      updates.completed_at = new Date();
      updates.rating = rating;
      updates.feedback = feedback;

      if (duration_hours !== oldDuration) {
        const tutorProfile = await TutorProfile.findOne({ user_id: session.tutor_id });
        if (tutorProfile) {
          tutorProfile.tutoring_hours =
            (tutorProfile.tutoring_hours || 0) - oldDuration + duration_hours;
          await tutorProfile.save();
        }
      }
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

  const [totalHours, totalEarnings, completedSessions, averageRating, avgResponseTime] = await Promise.all([
    TutoringSession.aggregate([
      { $match: { tutor_id: tutorObjectId, status: 'completed', ...(Object.keys(dateFilter).length > 0 && { completed_at: dateFilter }) } },
      { $group: { _id: null, total: { $sum: '$duration_hours' } } }
    ]),
    TutoringSession.aggregate([
      { $match: { tutor_id: tutorObjectId, status: 'completed', ...(Object.keys(dateFilter).length > 0 && { completed_at: dateFilter }) } },
      { $group: { _id: null, total: { $sum: '$total_earnings' } } }
    ]),
    TutoringSession.countDocuments({ tutor_id: tutorObjectId, status: 'completed', ...(Object.keys(dateFilter).length > 0 && { completed_at: dateFilter }) }),
    TutoringSession.aggregate([
      { $match: { tutor_id: tutorObjectId, status: 'completed', rating: { $exists: true }, ...(Object.keys(dateFilter).length > 0 && { completed_at: dateFilter }) } },
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]),
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
    averageRating: averageRating[0]?.average || 0,
    avgResponseTime: avgResponseTime[0]?.average || 0,
    bookingAcceptanceRate,
    period
  };

  res.json(stats);
});

// Get tutor profile with hours
const getTutorProfile = asyncHandler(async (req, res) => {
  const { tutor_id } = req.params;
  const profile = await TutorProfile.findOne({ user_id: tutor_id })
    .populate('user_id', 'full_name email photo_url');

  if (!profile) {
    res.status(404);
    throw new Error("Tutor profile not found");
  }

  res.json(profile);
});

// Get available students for tutor to select from
// Get available students for tutor to select from
const getAvailableStudents = asyncHandler(async (req, res) => {
  try {
    const user_id = req.params.user_id; // assuming tutor is authenticated

    // Find tutor profile
    const tutorProfile = await TutorProfile.findOne({ user_id: user_id });
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
      .populate('user_id', 'full_name email age')
      .select('user_id academic_level preferred_subjects availability');

    const academic_level_id = students.flatMap(student => Array.isArray(student.academic_level) ? student.academic_level : [student.academic_level]).filter(Boolean);
    const academicLevels = await EducationLevel.find({ _id: { $in: academic_level_id } });
    const levelMap = new Map(academicLevels.map(l => [l._id.toString(), { _id: l._id.toString(), level: l.level, hourlyRate: l.hourlyRate }]));
    const tutor_hourly_rates = tutorProfile.academic_levels_taught
      .filter(level => academic_level_id.some(id => id && id.toString() === level.educationLevel.toString()))
      .map(level => level.hourlyRate);
    let hourly_rate;
    if (tutor_hourly_rates) {
      hourly_rate = tutor_hourly_rates;
    } else {
      hourly_rate = academicLevels.map(level => level.hourlyRate);
    }

    // Format response
    const formattedStudents = students.map(student => {
      const rawIds = Array.isArray(student.academic_level) ? student.academic_level : [student.academic_level];
      const academic_levels = rawIds
        .filter(Boolean)
        .map(id => levelMap.get(id.toString()))
        .filter(Boolean);
      return {
        _id: student.user_id._id,
        full_name: student.user_id.full_name,
        email: student.user_id.email,
        age: student.user_id.age,
        // Back-compat: names array
        academic_level: academic_levels.map(l => l.level),
        // New: detailed array with ids
        academic_levels,
        preferred_subjects: student.preferred_subjects,
        availability: student.availability,
        hourly_rate: hourly_rate
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

  // Check if request is already processed
  // if (hireRecord.status !== 'pending') {
  //   return res.status(400).json({ 
  //     message: `Request already ${hireRecord.status}. Cannot ${action} a ${hireRecord.status} request.` 
  //   });
  // }

  // Update the status
  hireRecord.status = action === 'accept' ? 'accepted' : 'rejected';
  await studentProfile.save();

  return res.status(200).json({
    success: true,
    message: `Request ${action}ed successfully`,
    student_profile_id,
    hire_record_id: hireRecord._id,
    status: hireRecord.status,
  });
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
    res.status(400);
    throw new Error("Cannot delete completed or in-progress sessions");
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
        academic_levels: tutor.academic_levels_taught?.map(level => ({
          name: level.name,
          hourlyRate: level.hourlyRate
        })) || [],
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

// Update tutor settings (rates and sessions)
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

    // Update each academic level setting
    for (const setting of academicLevelSettings) {
      const { educationLevelId, hourlyRate, totalSessionsPerMonth, discount } = setting;

      // Find the corresponding academic level in tutor profile
      const levelIndex = tutorProfile.academic_levels_taught.findIndex(
        level => level.educationLevel.toString() === educationLevelId
      );

      // if total session are less than minSession or greate then maxSession show message. get mix andmax session from educationLevel
      const educationLevel = await EducationLevel.findById(educationLevelId);
      const minSession = educationLevel.minSession;
      const maxSession = educationLevel.maxSession;
      const tutor_prmision = educationLevel.isTutorCanChangeRate
      if (tutor_prmision === false) {
        res.status(400);
        return res.json({
          success: false,
          message: `You are not authorized to change the rates for this academic level`
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
  updateTutorSettings
};
