const asyncHandler = require("express-async-handler");
const User = require("../Models/userSchema");
const Student = require("../Models/studentProfileSchema");
const TutorProfile = require("../Models/tutorProfileSchema");
const TutoringSession = require("../Models/tutoringSessionSchema"); // Added for student dashboard
const TutorInquiry = require("../Models/tutorInquirySchema"); // Added for tutor search and help requests



// Student Dashboard Controllers
exports.getStudentDashboard = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user || user.role !== 'student') {
        res.status(404);
        throw new Error('Student not found');
    }

    // Get student profile with assignments and notes
    const studentProfile = await Student.findOne({ user_id: userId });

    const upcomingSessions = await TutoringSession.find({
        student_ids: studentProfile._id, // changed from student_id to student_ids
        session_date: { $gte: new Date() },
        status: { $in: ['confirmed', 'pending'] }
    })
        .populate('tutor_id', 'full_name email photo_url')
        .sort({ session_date: 1 })
        .limit(10);

    const pastSessions = await TutoringSession.find({
        student_ids: studentProfile._id, // changed here too
        session_date: { $lt: new Date() },
        status: 'completed'
    })
        .populate('tutor_id', 'full_name email photo_url')
        .sort({ session_date: -1 })
        .limit(10);

    res.status(200).json({
        student: {
            _id: studentProfile._id,
            full_name: user.full_name,
            email: user.email,
            phone_number: user.phone_number,
            age: user.age,
            photo_url: user.photo_url
        },
        profile: studentProfile,
        upcomingSessions,
        pastSessions,
    });
});

exports.getStudentSessions = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const user = await User.findById(userId);
    if (!user || user.role !== 'student') {
        res.status(404);
        throw new Error('Student not found');
    }

    const studentProfile = await Student.findOne({ user_id: userId });

    const query = { student_ids: studentProfile._id }; // ✅ fixed for array matching
    if (status && status !== 'all') {
        query.status = status;
    }

    const sessions = await TutoringSession.find(query)
        .populate('tutor_id', 'full_name email photo_url')
        .sort({ session_date: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const total = await TutoringSession.countDocuments(query);

    res.status(200).json({
        sessions,
        pagination: {
            current: parseInt(page),
            total: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
        }
    });
});

exports.updateStudentProfile = asyncHandler(async (req, res) => {
    const {
        full_name,
        phone_number,
        photo_url,
        age,
        academic_level,
        learning_goals,
        preferred_subjects,
        availability,
    } = req.body;

    const { user_id } = req.params;

    const user = await User.findById(user_id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (phone_number !== undefined && phone_number !== "") {
        const existingUser = await User.findOne({ phone_number });
        if (existingUser && existingUser._id.toString() !== user_id) {
            res.status(400);
            throw new Error("Phone number already in use");
        }
        user.phone_number = phone_number;
    }

    if (full_name !== undefined && full_name !== "") {
        user.full_name = full_name;
    }

    if (photo_url !== undefined && photo_url !== "") {
        user.photo_url = photo_url;
    }

    if (age !== undefined) {
        user.age = age;
    }

    await user.save();

    const student = await Student.findOne({ user_id: user_id });
    if (!student) {
        res.status(404);
        throw new Error("Student profile not found");
    }

    if (academic_level !== undefined && academic_level !== "") {
        student.academic_level = academic_level;
    }

    if (learning_goals !== undefined && learning_goals !== "") {
        student.learning_goals = learning_goals;
    }

    if (
        preferred_subjects !== undefined &&
        Array.isArray(preferred_subjects) &&
        preferred_subjects.length > 0
    ) {
        student.preferred_subjects = preferred_subjects;
    }

    if (
        availability !== undefined &&
        Array.isArray(availability) &&
        availability.length > 0
    ) {
        student.availability = availability;
    }

    await student.save();

    res.status(200).json({
        message: "Student profile updated successfully",
        user: {
            phone_number: user.phone_number,
            photo_url: user.photo_url,
            age: user.age,
            full_name: user.full_name,
        },
        student: {
            academic_level: student.academic_level,
            learning_goals: student.learning_goals,
            preferred_subjects: student.preferred_subjects,
            availability: student.availability,
        },
    });
});

exports.searchTutors = asyncHandler(async (req, res) => {
    const {
        search,
        subjects,
        academic_level,
        location,
        min_rating,
        max_hourly_rate,
        page = 1,
        limit = 10
    } = req.query;
    try {
        const query = {
            // Uncomment below to restrict to verified tutors
            is_verified: true,
        };
        // Subject filter
        if (subjects) {
            query.subjects_taught = new RegExp(subjects, 'i');
        }

        // Academic level filter
        if (academic_level) {
            query.academic_levels_taught = new RegExp(academic_level, 'i');
        }

        // Location filter
        if (location) {
            query.location = new RegExp(location, 'i');
        }

        // Rating filter
        if (min_rating) {
            query.average_rating = { $gte: parseFloat(min_rating) };
        }

        // Hourly rate filter
        if (max_hourly_rate) {
            query.hourly_rate = { $lte: parseFloat(max_hourly_rate) };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        let searchQuery = { ...query };
        let userIds = [];

        // Handle search term (name or subject)
        if (search) {
            const matchingUsers = await User.find({
                full_name: { $regex: search, $options: 'i' },
                role: 'tutor'
            }).select('_id');

            userIds = matchingUsers.map(user => user._id);

            searchQuery = {
                ...query,
                $or: [
                    { subjects_taught: new RegExp(search, 'i') },
                    ...(userIds.length ? [{ user_id: { $in: userIds } }] : [])
                ]
            };
        }

        // Fetch matching tutors
        const tutors = await TutorProfile.find(searchQuery)
            .populate('user_id', 'full_name email photo_url')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ average_rating: -1, hourly_rate: 1 })
            .lean(); // For performance

        // Count total results
        const total = await TutorProfile.countDocuments(searchQuery);

        // Format tutor output
        const formattedTutors = tutors
            .filter(tutor => tutor.user_id) // Filter out orphaned tutor profiles
            .map(tutor => ({
                _id: tutor._id,
                user_id: tutor.user_id,
                subjects: tutor.subjects,
                academic_levels_taught: tutor.academic_levels_taught,
                hourly_rate: tutor.hourly_rate,
                average_rating: tutor.average_rating,
                total_sessions: tutor.total_sessions,
                location: tutor.location,
                bio: tutor.bio,
                qualifications: tutor.qualifications,
                experience_years: tutor.experience_years
            }));

        // Send response
        res.status(200).json({
            tutors: formattedTutors,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(total / parseInt(limit)),
                total_tutors: total,
                has_next: skip + parseInt(limit) < total,
                has_prev: parseInt(page) > 1
            }
        });

    } catch (error) {
        res.status(500);
        throw new Error("Failed to search tutors: " + error.message);
    }
});

exports.getTutorDetails = asyncHandler(async (req, res) => {
    const { tutorId } = req.params;
    try {
        const tutor = await TutorProfile.findOne({
            _id: tutorId,
            is_verified: true,
        }).populate('user_id', 'full_name email photo_url');

        if (!tutor) {
            res.status(404);
            throw new Error("Tutor not found");
        }

        // Get tutor's recent sessions for availability context
        const recentSessions = await TutoringSession.find({
            tutor_id: tutor._id
        })
            .sort({ session_date: -1 })
            .limit(5)
            .populate('student_ids', 'full_name');

        const formattedTutor = {
            _id: tutor._id,
            user_id: tutor.user_id,
            subjects: tutor.subjects,
            academic_levels_taught: tutor.academic_levels_taught,
            hourly_rate: tutor.hourly_rate,
            average_rating: tutor.average_rating,
            total_sessions: tutor.total_sessions,
            location: tutor.location,
            bio: tutor.bio,
            qualifications: tutor.qualifications,
            experience_years: tutor.experience_years,
            teaching_approach: tutor.teaching_approach,
            recent_sessions: recentSessions
        };

        res.json(formattedTutor);

    } catch (error) {
        res.status(500);
        throw new Error("Failed to get tutor details: " + error.message);
    }
});

// Request help in additional subjects
exports.requestAdditionalHelp = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const {
        subject,
        academic_level,
        description,
        preferred_schedule,
        urgency_level = 'normal',
        tutor_id // Add tutor_id to destructuring
    } = req.body;
    if (!subject || !academic_level || !description) {
        res.status(400);
        throw new Error("Subject, academic level, and description are required");
    }
    const student = await Student.findOne({ user_id: userId });
    try {
        // Create a new inquiry for additional help
        const inquiry = await TutorInquiry.create({
            student_id: student._id,
            tutor_id: tutor_id, // Save the tutor_id
            subject: subject,
            academic_level: academic_level,
            description: description,
            preferred_schedule: preferred_schedule,
            urgency_level: urgency_level,
            status: 'unread',
            type: 'additional_help'
        });

        res.status(201).json({
            message: "Help request submitted successfully",
            inquiry: inquiry
        });

    } catch (error) {
        res.status(500);
        throw new Error("Failed to submit help request: " + error.message);
    }
});

// Create a general tutor inquiry
// exports.createTutorInquiry = asyncHandler(async (req, res) => {
//     const { studentId } = req.params;
//     const {
//         tutor_id,
//         subject,
//         academic_level,
//         description,
//         preferred_schedule,
//         urgency_level = 'normal'
//     } = req.body;

//     if (!tutor_id || !subject || !academic_level || !description) {
//         res.status(400);
//         throw new Error("Tutor ID, subject, academic level, and description are required");
//     }

//     try {
//         // Create a new general tutor inquiry
//         const inquiry = await TutorInquiry.create({
//             student_id: studentId,
//             tutor_id: tutor_id,
//             subject: subject,
//             academic_level: academic_level,
//             description: description,
//             preferred_schedule: preferred_schedule,
//             urgency_level: urgency_level,
//             status: 'unread',
//             type: 'tutor_inquiry'
//         });

//         res.status(201).json({
//             message: "Tutor inquiry submitted successfully",
//             inquiry: inquiry
//         });

//     } catch (error) {
//         res.status(500);
//         throw new Error("Failed to submit tutor inquiry: " + error.message);
//     }
// });

// Get student's help requests
exports.getStudentHelpRequests = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10, tutor_id } = req.query;
    const student = await Student.findOne({ user_id: userId });
    if (!student) {
        res.status(404);
        throw new Error("Student profile not found");
    }

    const query = { student_id: student._id };

    const total = await TutorInquiry.countDocuments(query);
    const inquiries = await TutorInquiry.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    const tutorIds = inquiries.map(inquiry => inquiry.tutor_id);
    const tutorProfiles = await TutorProfile.find({ _id: { $in: tutorIds } });
    const tutorNames = tutorProfiles.map(tutor => tutor.user_id);
    const users = await User.find({ _id: { $in: tutorNames } });
    res.status(200).json({
        inquiries,
        tutors: users,
        pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(total / parseInt(limit)),
            total
        }
    });
});

exports.hireTutor = asyncHandler(async (req, res) => {
    const { tutor_user_id, student_user_id } = req.body;

    // Find profiles
    const student = await Student.findOne({ user_id: student_user_id });
    const tutor = await TutorProfile.findOne({ user_id: tutor_user_id });

    if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
    }

    if (!tutor) {
        return res.status(404).json({ message: "Tutor profile not found" });
    }

    const alreadyHired = student.hired_tutors.some(
        (h) => {
            if (!h) return false;
            const tutorId = h.tutor ? h.tutor : h; // handle both object and raw ObjectId
            return tutorId.toString() === tutor._id.toString();
        }
    );
    if(alreadyHired){
        console.log("alreadyHired",alreadyHired);
        return res.status(400).json({ message: "Tutor already hired. Select another tutor" });
    }

    // Push as per schema
    student.hired_tutors.push({
        tutor: tutor._id,
        // status: "pending", // Optional (defaults from schema)
        // hired_at: Date.now() // Optional (defaults from schema)
    });

    await student.save();

    res.status(200).json({ message: "Tutor hired successfully" });
});


