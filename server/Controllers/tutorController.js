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
  })    .sort({ session_date: 1 })
    .limit(10);

  // Get pending inquiries
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
  })    .sort({ created_at: -1 })
    .limit(10);

  // Get recent sessions (last 30 days, all statuses)
  const recentSessions = await TutoringSession.find({
    tutor_id: tutor._id,
    session_date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  })
  .populate({
    path: 'student_ids',
    populate: {
      path: 'user_id',
      select: 'full_name email'
    }
  })    .sort({ session_date: -1 })
    .limit(5);
  // Calculate metrics
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

  // Calculate response time and booking acceptance rate
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

  const dashboard = {
    upcomingSessions,
    recentSessions,
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

// Create a new tutoring session
const createSession = asyncHandler(async (req, res) => {
  const { tutor_id, student_id, subject, session_date, duration_hours, hourly_rate, notes } = req.body;
  if (!tutor_id || !student_id || !subject || !session_date || !duration_hours || !hourly_rate) {
    res.status(400);
    throw new Error("All required fields must be provided");
  }
  const total_earnings = duration_hours * hourly_rate;
  const student = await StudentProfile.findOne({ user_id: student_id });
  const tutor = await TutorProfile.findOne({ user_id: tutor_id });
  const student_ids = [student._id];

  const session = await TutoringSession.create({
    tutor_id: tutor._id,
    student_ids,
    subject,
    session_date: new Date(session_date),
    duration_hours,
    hourly_rate,
    total_earnings,
    notes: notes || ''
  });
  res.status(201).json({
    message: "Tutoring session created successfully",
    session
  });
});

// Update session (full update)
const updateSessionStatus = asyncHandler(async (req, res) => {
  const { session_id } = req.params;
  const {
    student_id,
    subject,
    session_date,
    duration_hours,
    hourly_rate,
    total_earnings,
    status,
    rating,
    feedback,
    notes
  } = req.body;

  const session = await TutoringSession.findById(session_id);
  if (!session) {
    res.status(404);
    throw new Error("Session not found");
  }

  // Store old duration for tutor hours calculation
  const oldDuration = session.duration_hours;

  // Update all fields
  session.student_id = student_id || session.student_id;
  session.subject = subject || session.subject;
  session.session_date = session_date ? new Date(session_date) : session.session_date;
  session.duration_hours = duration_hours || session.duration_hours;
  session.hourly_rate = hourly_rate || session.hourly_rate;
  session.total_earnings = total_earnings || session.total_earnings;
  session.status = status || session.status;
  session.notes = notes !== undefined ? notes : session.notes;

  if (status === 'completed') {
    session.completed_at = new Date();
    session.rating = rating;
    session.feedback = feedback;

    // Update tutor's total hours (only if duration changed)
    if (duration_hours && duration_hours !== oldDuration) {
      const tutorProfile = await TutorProfile.findOne({ user_id: session.tutor_id });
      if (tutorProfile) {
        // Remove old duration and add new duration
        tutorProfile.tutoring_hours = tutorProfile.tutoring_hours - oldDuration + duration_hours;
        await tutorProfile.save();
      }
    }
  }

  await session.save();

  res.json({
    message: "Session updated successfully",
    session
  });
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
const getAvailableStudents = asyncHandler(async (req, res) => {
  try {
    const students = await StudentProfile.find()
      .populate('user_id', 'full_name email age')
      .select('user_id academic_level preferred_subjects availability');

    const formattedStudents = students.map(student => ({
      _id: student.user_id._id,
      full_name: student.user_id.full_name,
      email: student.user_id.email,
      age: student.user_id.age,
      academic_level: student.academic_level,
      preferred_subjects: student.preferred_subjects,
      availability: student.availability
    }));

    res.json({
      students: formattedStudents,
      total: formattedStudents.length
    });
  } catch (err) {
    res.status(500);
    throw new Error("Failed to fetch students: " + err.message);
  }
});

// Availability Management Functions

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
    availability = await TutorAvailability.create({ tutor_id: tutor._id  });
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

// Add recurring availability slot
// const addRecurringAvailability = asyncHandler(async (req, res) => {
//   const { user_id } = req.params;
//   const { day_of_week, start_time, end_time } = req.body;
//   const tutor = await TutorProfile.findOne({ user_id });
//   if (!tutor) {
//     res.status(400);
//     throw new Error("Invalid tutor ID");
//   }

//   if (!day_of_week || !start_time || !end_time) {
//     res.status(400);
//     throw new Error("Day of week, start time, and end time are required");
//   }

//   let availability = await TutorAvailability.findOne({ tutor_id: tutor._id });

//   if (!availability) {
//     availability = new TutorAvailability({ tutor_id: tutor._id });
//   }

//   availability.recurring_availability.push({
//     day_of_week,
//     start_time,
//     end_time
//   });

//   await availability.save();

//   res.status(201).json({
//     message: "Recurring availability slot added successfully",
//     availability
//   });
// });

// // Update recurring availability slot
// const updateRecurringAvailability = asyncHandler(async (req, res) => {
//   const { user_id, slot_id } = req.params;
//   const { day_of_week, start_time, end_time, is_active } = req.body;
//   const tutor = await TutorProfile.findOne({ user_id });
//   if (!tutor) {
//     res.status(400);
//     throw new Error("Invalid tutor ID");
//   }

//   const availability = await TutorAvailability.findOne({ tutor_id: tutor._id });

//   if (!availability) {
//     res.status(404);
//     throw new Error("Availability record not found");
//   }

//   const slot = availability.recurring_availability.id(slot_id);

//   if (!slot) {
//     res.status(404);
//     throw new Error("Recurring availability slot not found");
//   }

//   if (day_of_week !== undefined) slot.day_of_week = day_of_week;
//   if (start_time !== undefined) slot.start_time = start_time;
//   if (end_time !== undefined) slot.end_time = end_time;
//   if (is_active !== undefined) slot.is_active = is_active;

//   await availability.save();

//   res.json({
//     message: "Recurring availability slot updated successfully",
//     availability
//   });
// });

// // Remove recurring availability slot
// const removeRecurringAvailability = asyncHandler(async (req, res) => {
//   const { user_id, slot_id } = req.params;
//   const tutor = await TutorProfile.findOne({ user_id });
//   if (!tutor) {
//     res.status(400);
//     throw new Error("Invalid tutor ID");
//   }

//   const availability = await TutorAvailability.findOne({ tutor_id: tutor._id });

//   if (!availability) {
//     res.status(404);
//     throw new Error("Availability record not found");
//   }

//   availability.recurring_availability = availability.recurring_availability.filter(
//     slot => slot._id.toString() !== slot_id
//   );

//   await availability.save();

//   res.json({
//     message: "Recurring availability slot removed successfully",
//     availability
//   });
// });

// // Add one-time availability slot
// const addOneTimeAvailability = asyncHandler(async (req, res) => {
//   const { user_id } = req.params;
//   const { date, start_time, end_time } = req.body;
//   const tutor = await TutorProfile.findOne({ user_id });
//   if (!tutor) {
//     res.status(400);
//     throw new Error("Invalid tutor ID");
//   }

//   if (!date || !start_time || !end_time) {
//     res.status(400);
//     throw new Error("Date, start time, and end time are required");
//   }

//     let availability = await TutorAvailability.findOne({ tutor_id: tutor._id });

//   if (!availability) {
//     availability = new TutorAvailability({ tutor_id: tutor._id });
//   }

//   availability.one_time_availability.push({
//     date: new Date(date),
//     start_time,
//     end_time
//   });

//   await availability.save();

//   res.status(201).json({
//     message: "One-time availability slot added successfully",
//     availability
//   });
// });

// // Update one-time availability slot
// const updateOneTimeAvailability = asyncHandler(async (req, res) => {
//   const { user_id, slot_id } = req.params;
//   const { date, start_time, end_time, is_active } = req.body;
//   const tutor = await TutorProfile.findOne({ user_id });
//   if (!tutor) {
//     res.status(400);
//     throw new Error("Invalid tutor ID");
//   }

//   const availability = await TutorAvailability.findOne({ tutor_id: tutor._id });

//   if (!availability) {
//     res.status(404);
//     throw new Error("Availability record not found");
//   }

//   const slot = availability.one_time_availability.id(slot_id);

//   if (!slot) {
//     res.status(404);
//     throw new Error("One-time availability slot not found");
//   }

//   if (date !== undefined) slot.date = new Date(date);
//   if (start_time !== undefined) slot.start_time = start_time;
//   if (end_time !== undefined) slot.end_time = end_time;
//   if (is_active !== undefined) slot.is_active = is_active;

//   await availability.save();

//   res.json({
//     message: "One-time availability slot updated successfully",
//     availability
//   });
// });

// // Remove one-time availability slot
// const removeOneTimeAvailability = asyncHandler(async (req, res) => {
//   const { user_id, slot_id } = req.params;
//   const tutor = await TutorProfile.findOne({ user_id });
//   if (!tutor) {
//     res.status(400);
//     throw new Error("Invalid tutor ID");
//   }

//   const availability = await TutorAvailability.findOne({ tutor_id: tutor._id });

//   if (!availability) {
//     res.status(404);
//     throw new Error("Availability record not found");
//   }

//   availability.one_time_availability = availability.one_time_availability.filter(
//     slot => slot._id.toString() !== slot_id
//   );

//   await availability.save();

//   res.json({
//     message: "One-time availability slot removed successfully",
//     availability
//   });
// });

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
  sendMessageResponse,
  getTutorMessages,
  getSpecificUserChat
};
