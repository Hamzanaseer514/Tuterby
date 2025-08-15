const asyncHandler = require("express-async-handler");
const User = require("../Models/userSchema");
const Student = require("../Models/studentProfileSchema");
const TutorProfile = require("../Models/tutorProfileSchema");
const TutoringSession = require("../Models/tutoringSessionSchema"); // Added for student dashboard
const TutorInquiry = require("../Models/tutorInquirySchema"); // Added for tutor search and help requests
const Message = require("../Models/messageSchema"); // Added for messaging
const { EducationLevel, Subject } = require("../Models/LookupSchema");




exports.getStudentProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user || user.role !== 'student') {
        res.status(404);
        throw new Error('Student not found');
    }
    const studentProfile = await Student.findOne({ user_id: userId });
    res.status(200).json({
        student: studentProfile,
    });
});

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
        .populate({
            path: "tutor_id",
            select: "user_id", // only include user_id from TutorProfile
            populate: {
                path: "user_id",
                select: "full_name email", // only include name & email from User
            },
        })
        .sort({ session_date: 1 })
        .limit(10);

    const pastSessions = await TutoringSession.find({
        student_ids: studentProfile._id,
        // session_date: { $lt: new Date() },
        status: 'completed'
    })
        .populate({
            path: "tutor_id",
            select: "user_id", // only include user_id from TutorProfile
            populate: {
                path: "user_id",
                select: "full_name email", // only include name & email from User
            },
        })
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
        // .populate('tutor_id', 'full_name email photo_url')
        .populate({
            path: "tutor_id",
            select: "user_id", // only include user_id from TutorProfile
            populate: {
                path: "user_id",
                select: "full_name email", // only include name & email from User
            },
        })
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
    try {
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

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // ✅ Fetch user without invalid enum issues
        const user = await User.findById(user_id).lean(); // lean() removes mongoose doc wrapping

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: "User is not a student"
            });
        }

        // ✅ Prepare update object only with allowed fields
        const userUpdates = {};
        if (phone_number) {
            const existingUser = await User.findOne({ phone_number });
            if (existingUser && existingUser._id.toString() !== user_id) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number already in use"
                });
            }
            userUpdates.phone_number = phone_number;
        }
        if (full_name) userUpdates.full_name = full_name;
        if (photo_url) userUpdates.photo_url = photo_url;
        if (age) userUpdates.age = age;

        // ✅ Update without touching is_verified
        await User.updateOne(
            { _id: user_id },
            { $set: userUpdates },
            { runValidators: true }
        );

        // Update student profile
        const studentProfile = await Student.findOne({ user_id });
        if (!studentProfile) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        if (academic_level) studentProfile.academic_level = academic_level;
        if (learning_goals) studentProfile.learning_goals = learning_goals;
        if (Array.isArray(preferred_subjects) && preferred_subjects.length > 0) {
            studentProfile.preferred_subjects = preferred_subjects;
        }
        if (Array.isArray(availability) && availability.length > 0) {
            studentProfile.availability = availability;
        }

        await studentProfile.save();

        return res.status(200).json({
            success: true,
            message: "Student profile updated successfully",
            user: userUpdates,
            student: {
                academic_level: studentProfile.academic_level,
                learning_goals: studentProfile.learning_goals,
                preferred_subjects: studentProfile.preferred_subjects,
                availability: studentProfile.availability,
            },
        });

    } catch (error) {
        console.error("Error updating student profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while updating student profile",
            error: error.message
        });
    }
});

exports.searchTutors = asyncHandler(async (req, res) => {
    const {
        search,
        subject, // Changed from subjects to subject (singular)
        academic_level,
        location,
        min_rating,
        max_hourly_rate,
        preferred_subjects_only,
        page = 1,
        limit = 10
    } = req.query;
    console.log("req.query",req.query)
    try {
        // Get current student's profile to check hiring status
        const currentStudent = await Student.findOne({ user_id: req.user._id });
        if (!currentStudent) {
            res.status(404);
            throw new Error("Student profile not found");
        }

        const query = {
            // Uncomment below to restrict to verified tutors
            profile_status: 'approved',
        };
        
        // Handle preferred subjects filter
        if (preferred_subjects_only === 'true' && currentStudent.preferred_subjects && currentStudent.preferred_subjects.length > 0) {
            // Get the subject names from student's preferred subjects (they are strings)
            query.subjects = { $in: currentStudent.preferred_subjects };
        } else if (subject) {
            // Single subject filter (when not using preferred subjects)
            // We need to get the subject name from the ID first
            const subjectDoc = await Subject.findById(subject);
            if (subjectDoc) {
                query.subjects = subjectDoc.name;
            }
        }

        // Academic level filter
        if (academic_level) {
            // academic_level is an ID, so we need to find tutors that have this education level
            query['academic_levels_taught.educationLevel'] = academic_level;
        }

        // Location filter
        if (location) {
            query.location = new RegExp(location, 'i');
        }

        // Rating filter
        if (min_rating) {
            query.average_rating = { $gte: parseFloat(min_rating) };
        }

        // Hourly rate filter - Note: This filter might not work as expected since hourly_rate is stored in academic_levels_taught
        // You might need to implement this using aggregation pipeline instead
        // if (max_hourly_rate) {
        //     query.hourly_rate = { $lte: parseFloat(max_hourly_rate) };
        // }

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

            // If using preferred subjects, we need to handle the $or differently
            if (preferred_subjects_only === 'true' && currentStudent.preferred_subjects && currentStudent.preferred_subjects.length > 0) {
                searchQuery = {
                    ...query,
                    $or: [
                        { subjects: { $in: currentStudent.preferred_subjects } },
                        ...(userIds.length ? [{ user_id: { $in: userIds } }] : [])
                    ]
                };
            } else {
                searchQuery = {
                    ...query,
                    $or: [
                        { subjects: new RegExp(search, 'i') },
                        ...(userIds.length ? [{ user_id: { $in: userIds } }] : [])
                    ]
                };
            }
        }

        // Fetch matching tutors
        const tutors = await TutorProfile.find(searchQuery)
            .populate('user_id', 'full_name email photo_url')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ average_rating: -1 })
            .lean(); // For performance

        // Get all unique education level IDs from all tutors
        const tutor_acdemicLevel_ids = tutors.flatMap(tutor => tutor.academic_levels_taught.map(level => level.educationLevel));
        const academicLevels = await EducationLevel.find({ _id: { $in: tutor_acdemicLevel_ids } });
        
        // Create a map for quick lookup
        const academicLevelMap = {};
        academicLevels.forEach(level => {
            academicLevelMap[level._id.toString()] = level;
        });

        // Count total results
        const total = await TutorProfile.countDocuments(searchQuery);

        const total_session = await TutoringSession.countDocuments({tutor_id: {$in: tutors.map(tutor => tutor._id)}});
        // Format tutor output with hiring information
        const formattedTutors = tutors
            .filter(tutor => tutor.user_id) // Filter out orphaned tutor profiles
            .map(tutor => {
                // Check if this tutor has been hired by the current student
                const hireRecord = currentStudent.hired_tutors.find(
                    hire => hire.tutor.toString() === tutor._id.toString()
                );

                // Get this tutor's academic levels and hourly rates
                const tutorAcademicLevels = tutor.academic_levels_taught.map(level => {
                    const levelDoc = academicLevelMap[level.educationLevel.toString()];
                    return {
                        name: levelDoc ? levelDoc.level : 'Unknown',
                        hourlyRate: levelDoc ? levelDoc.hourlyRate : 0
                    };
                });

                const tutorHourlyRates = tutorAcademicLevels.map(level => level.hourlyRate).filter(rate => rate > 0);
                const min_hourly_rate_value = tutorHourlyRates.length > 0 ? Math.min(...tutorHourlyRates) : 0;
                const max_hourly_rate_value = tutorHourlyRates.length > 0 ? Math.max(...tutorHourlyRates) : 0;

                return {
                    _id: tutor._id,
                    user_id: tutor.user_id,
                    subjects: tutor.subjects,
                    academic_levels_taught: tutorAcademicLevels.map(level => level.name),
                    min_hourly_rate: min_hourly_rate_value,
                    max_hourly_rate: max_hourly_rate_value,
                    average_rating: tutor.average_rating,
                    total_sessions: total_session,
                    location: tutor.location,
                    bio: tutor.bio,
                    qualifications: tutor.qualifications,
                    experience_years: tutor.experience_years,
                    // Add hiring information
                    is_hired: !!hireRecord,
                    hire_status: hireRecord ? hireRecord.status : null,
                    hired_at: hireRecord ? hireRecord.hired_at : null
                };
            });
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
    console.log("tutorId", tutorId)
    try {
        // Get current student's profile to check hiring status
        const currentStudent = await Student.findOne({ user_id: req.user._id });
        if (!currentStudent) {
            res.status(404);
            throw new Error("Student profile not found");
        }

        const tutor = await TutorProfile.findOne({
            _id: tutorId,
            profile_status: 'approved', // Changed from is_verified to profile_status
        }).populate('user_id', 'full_name email photo_url');
        
        if (!tutor) {
            res.status(404);
            throw new Error("Tutor not found");
        }

        const tutor_acdemicLevel_ids = tutor.academic_levels_taught.map(level => level.educationLevel);
        const academicLevels = await EducationLevel.find({ _id: { $in: tutor_acdemicLevel_ids } });
        
        // Create a map for quick lookup
        const academicLevelMap = {};
        academicLevels.forEach(level => {
            academicLevelMap[level._id.toString()] = level;
        });

        // Get this tutor's academic levels and hourly rates
        const tutorAcademicLevels = tutor.academic_levels_taught.map(level => {
            const levelDoc = academicLevelMap[level.educationLevel.toString()];
            return {
                name: levelDoc ? levelDoc.level : 'Unknown',
                hourlyRate: levelDoc ? levelDoc.hourlyRate : 0
            };
        });

        const tutorHourlyRates = tutorAcademicLevels.map(level => level.hourlyRate).filter(rate => rate > 0);
        const min_hourly_rate_value = tutorHourlyRates.length > 0 ? Math.min(...tutorHourlyRates) : 0;
        const max_hourly_rate_value = tutorHourlyRates.length > 0 ? Math.max(...tutorHourlyRates) : 0;

        // Get tutor's recent sessions for availability context
        const recentSessions = await TutoringSession.find({
            tutor_id: tutor._id
        })
            .sort({ session_date: -1 })
            .limit(5)
            .populate('student_ids', 'user_id', 'full_name email');

        // Get hiring status for current student
        const hireRecord = currentStudent.hired_tutors.find(
            hire => hire.tutor.toString() === tutor._id.toString()
        );

        // Get tutor's hiring statistics
        let totalHiringRequests = [];
        try {
            totalHiringRequests = await Student.aggregate([
                {
                    $match: {
                        'hired_tutors.tutor': tutor._id
                    }
                },
                {
                    $unwind: '$hired_tutors'
                },
                {
                    $match: {
                        'hired_tutors.tutor': tutor._id
                    }
                },
                {
                    $group: {
                        _id: null,
                        total_requests: { $sum: 1 },
                        accepted_requests: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$hired_tutors.status', 'accepted'] },
                                    1,
                                    0
                                ]
                            }
                        },
                        pending_requests: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$hired_tutors.status', 'pending'] },
                                    1,
                                    0
                                ]
                            }
                        },
                        rejected_requests: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$hired_tutors.status', 'rejected'] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);
        } catch (error) {
            console.error('Error in hiring statistics aggregation:', error);
            totalHiringRequests = [];
        }

        // Get tutor's response time statistics from inquiries
        let responseTimeStats = [];
        try {
            responseTimeStats = await TutorInquiry.aggregate([
                {
                    $match: {
                        tutor_id: tutor._id,
                        status: { $in: ['replied', 'converted_to_booking'] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total_replied: { $sum: 1 },
                        avg_response_time: { $avg: '$response_time_minutes' },
                        min_response_time: { $min: '$response_time_minutes' },
                        max_response_time: { $max: '$response_time_minutes' }
                    }
                }
            ]);
        } catch (error) {
            console.error('Error in response time statistics aggregation:', error);
            responseTimeStats = [];
        }

        // Get total inquiries the tutor has received
        let totalInquiriesReceived = 0;
        try {
            totalInquiriesReceived = await TutorInquiry.countDocuments({
                tutor_id: tutor._id
            });
        } catch (error) {
            console.error('Error counting total inquiries:', error);
            totalInquiriesReceived = 0;
        }

        // Get inquiries by status
        let inquiryStatusStats = [];
        try {
            inquiryStatusStats = await TutorInquiry.aggregate([
                {
                    $match: {
                        tutor_id: tutor._id
                    }
                },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);
        } catch (error) {
            console.error('Error in inquiry status statistics aggregation:', error);
            inquiryStatusStats = [];
        }

        // Check if current student has sent any inquiries to this tutor
        let studentInquiriesToTutor = [];
        try {
            studentInquiriesToTutor = await TutorInquiry.find({
                student_id: currentStudent._id,
                tutor_id: tutor._id
            }).sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error fetching student inquiries:', error);
            studentInquiriesToTutor = [];
        }

        // Get recent inquiries to show response patterns
        let recentInquiries = [];
        try {
            recentInquiries = await TutorInquiry.find({
                tutor_id: tutor._id
            })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('student_id', 'user_id', 'full_name email');
        } catch (error) {
            console.error('Error fetching recent inquiries:', error);
            recentInquiries = [];
        }

        const hiringStats = totalHiringRequests[0] || {
            total_requests: 0,
            accepted_requests: 0,
            pending_requests: 0,
            rejected_requests: 0
        };

        const responseStats = responseTimeStats[0] || {
            total_replied: 0,
            avg_response_time: 0,
            min_response_time: 0,
            max_response_time: 0
        };

        // Process inquiry status statistics
        const inquiryStats = {};
        inquiryStatusStats.forEach(stat => {
            inquiryStats[stat._id] = stat.count;
        });

        const formattedTutor = {
            _id: tutor._id,
            user_id: tutor.user_id,
            subjects: tutor.subjects,
            academic_levels_taught: tutorAcademicLevels.map(level => level.name),
            min_hourly_rate: min_hourly_rate_value,
            max_hourly_rate: max_hourly_rate_value,
            average_rating: tutor.average_rating,
            total_sessions: tutor.total_sessions,
            location: tutor.location,
            bio: tutor.bio,
            qualifications: tutor.qualifications,
            experience_years: tutor.experience_years,
            teaching_approach: tutor.teaching_approach,
            recent_sessions: recentSessions,

            // Hiring status for current student
            hiring_status: {
                is_hired: !!hireRecord,
                status: hireRecord ? hireRecord.status : null,
                hired_at: hireRecord ? hireRecord.hired_at : null
            },

            // Overall hiring statistics
            hiring_statistics: {
                total_requests: hiringStats.total_requests || 0,
                accepted_requests: hiringStats.accepted_requests || 0,
                pending_requests: hiringStats.pending_requests || 0,
                rejected_requests: hiringStats.rejected_requests || 0,
                acceptance_rate: (hiringStats.total_requests || 0) > 0
                    ? (((hiringStats.accepted_requests || 0) / (hiringStats.total_requests || 0)) * 100).toFixed(1)
                    : 0
            },

            // Response time statistics
            response_statistics: {
                total_replied: responseStats.total_replied || 0,
                average_response_time_minutes: Math.round(responseStats.avg_response_time || 0),
                fastest_response_minutes: responseStats.min_response_time || 0,
                slowest_response_minutes: responseStats.max_response_time || 0
            },

            // Inquiry statistics
            inquiry_statistics: {
                total_received: totalInquiriesReceived || 0,
                total_replied: responseStats.total_replied || 0,
                reply_rate: (totalInquiriesReceived || 0) > 0
                    ? (((responseStats.total_replied || 0) / (totalInquiriesReceived || 0)) * 100).toFixed(1)
                    : 0,
                by_status: inquiryStats
            },

            // Current student's inquiries to this tutor
            student_inquiries: (studentInquiriesToTutor || []).map(inquiry => ({
                id: inquiry._id,
                subject: inquiry.subject,
                academic_level: inquiry.academic_level,
                description: inquiry.description,
                status: inquiry.status,
                urgency_level: inquiry.urgency_level,
                created_at: inquiry.createdAt,
                response_time_minutes: inquiry.response_time_minutes,
                reply_message: inquiry.reply_message,
                replied_at: inquiry.replied_at
            })),

            // Recent inquiries for transparency
            recent_inquiries: (recentInquiries || []).map(inquiry => ({
                id: inquiry._id,
                subject: inquiry.subject,
                academic_level: inquiry.academic_level,
                status: inquiry.status,
                urgency_level: inquiry.urgency_level,
                created_at: inquiry.createdAt,
                response_time_minutes: inquiry.response_time_minutes,
                student_name: inquiry.student_id?.user_id?.full_name || 'Anonymous'
            }))
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
        return res.status(400).json({
            success: false,
            message: "Subject, academic level, and description are required"
        });
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

        return res.status(201).json({
            success: true,
            message: "Help request submitted successfully",
            inquiry: inquiry
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to submit help request: " + error.message
        });
    }
});

// Get student's help requests
exports.getStudentHelpRequests = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, tutor_id } = req.query;

        // Get the base user information
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const student = await Student.findOne({ user_id: userId });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        const query = { student_id: student._id };
        const total = await TutorInquiry.countDocuments(query);
        const inquiries = await TutorInquiry.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Get tutor profiles and their corresponding users
        const tutorIds = inquiries.map(inquiry => inquiry.tutor_id);
        const tutorProfiles = await TutorProfile.find({ _id: { $in: tutorIds } });
        const userIds = tutorProfiles.map(tutor => tutor.user_id);
        const users = await User.find({ _id: { $in: userIds } });

        // Create a mapping of TutorProfile ID to User data for easy lookup
        const tutorToUserMap = {};
        tutorProfiles.forEach(tutorProfile => {
            const user = users.find(u => u._id.toString() === tutorProfile.user_id.toString());
            if (user) {
                tutorToUserMap[tutorProfile._id.toString()] = user;
            }
        });

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                full_name: user.full_name,
                email: user.email,
                phone_number: user.phone_number,
                age: user.age,
                photo_url: user.photo_url,
                role: user.role
            },
            inquiries,
            tutors: users,
            tutorToUserMap, // Add this mapping
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(total / parseInt(limit)),
                total
            }
        });
    } catch (error) {
        console.error("Error fetching student help requests:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching help requests",
            error: error.message
        });
    }
});

exports.hireTutor = asyncHandler(async (req, res) => {
    const { tutor_user_id, student_user_id, subject, academic_level_id } = req.body;

    // Find profiles
    const student = await Student.findOne({ user_id: student_user_id });
    const tutor = await TutorProfile.findOne({ user_id: tutor_user_id });

    if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
    }

    if (!tutor) {
        return res.status(404).json({ message: "Tutor profile not found" });
    }

    // Check if tutor is already hired and what the status is
    const existingHireIndex = student.hired_tutors.findIndex(
        (h) => {
            if (!h) return false;
            const tutorId = h.tutor ? h.tutor : h; // handle both object and raw ObjectId
            return tutorId.toString() === tutor._id.toString();
        }
    );

    if (existingHireIndex !== -1) {
        const existingHire = student.hired_tutors[existingHireIndex];

        // If the hire request is already accepted, show "already hired" message
        if (existingHire.status === "accepted") {
            return res.status(400).json({ message: "Tutor already hired. Select another tutor" });
        }

        // If there's a pending request, prevent duplicate
        if (existingHire.status === "pending") {
            return res.status(400).json({ message: "Hiring request already pending for this tutor" });
        }

        // If there's a rejected request, update it to pending instead of creating new one
        if (existingHire.status === "rejected") {
            // Update the existing rejected request to pending
            student.hired_tutors[existingHireIndex].status = "pending";
            student.hired_tutors[existingHireIndex].hired_at = new Date(); // Update timestamp
            if (subject) student.hired_tutors[existingHireIndex].subject = subject;
            // if (academic_level) student.hired_tutors[existingHireIndex].academic_level = academic_level;
            if (academic_level_id) student.hired_tutors[existingHireIndex].academic_level_id = academic_level_id;

            // Remove any other duplicate requests for this tutor to keep database clean
            student.hired_tutors = student.hired_tutors.filter((hire, index) => {
                if (index === existingHireIndex) return true; // Keep the updated one
                if (!hire || !hire.tutor) return false; // Remove invalid entries
                return hire.tutor.toString() !== tutor._id.toString(); // Remove other requests for this tutor
            });

            await student.save();

            return res.status(200).json({
                message: "Previous rejected request has been resubmitted successfully. The tutor will be notified."
            });
        }
    }

    // If no existing request, create a new one
    student.hired_tutors.push({
        tutor: tutor._id,
        subject: subject || "",
        // academic_level: academic_level || "",
        academic_level_id: academic_level_id || null,
        status: "pending", // Explicitly set status
        hired_at: new Date() // Explicitly set timestamp
    });

    await student.save();

    res.status(200).json({ message: "Tutor request sent successfully. The tutor will be notified and can accept or reject your request." });
});


exports.sendMessage = asyncHandler(async (req, res) => {
    const { tutorId, message } = req.body;
    const studentId = req.user._id; // logged-in student


    if (!tutorId || !message) {
        res.status(400);
        throw new Error("Tutor ID and message are required");
    }

    const tutor = await TutorProfile.findById(tutorId);
    if (!tutor) {
        res.status(404);
        throw new Error("Tutor not found");
    }

    const newMessage = await Message.create({
        studentId,
        tutorId: tutor.user_id,
        message,
        status: "unanswered",
    });

    res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: newMessage,
    });

});

exports.getAcceptedTutorsForStudent = async (req, res) => {
    try {
        // Step 1: Find the student document for the logged-in user
        const student = await Student.findOne({ user_id: req.user._id })
            .populate({
                path: "hired_tutors.tutor",
                model: "TutorProfile",
                populate: {
                    path: "user_id", // if TutorProfile has a user reference for name/email
                    select: "full_name email"
                }
            });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Step 2: Filter only accepted tutors
        const acceptedTutors = student.hired_tutors
            .filter(t => t.status === "accepted" && t.tutor !== null)
            .map(t => ({
                tutorId: t.tutor._id,
                full_name: t.tutor.user_id?.full_name || "Unknown",
                email: t.tutor.user_id?.email || "",
                subject: t.tutor.subject || "",
                hired_at: t.hired_at
            }));

        res.json({
            success: true,
            data: acceptedTutors
        });

    } catch (error) {
        console.error("Error fetching accepted tutors:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

exports.getStudentTutorChat = asyncHandler(async (req, res) => {
    const studentId = req.user._id; // logged-in student
    const { tutorId } = req.params;
    const tutor = await TutorProfile.findById(tutorId);
    if (!tutor) {
        res.status(404);
        throw new Error("Tutor not found");
    }


    const messages = await Message.find({ studentId, tutorId: tutor.user_id })
        .populate("tutorId", "full_name") // populate tutor details
        .sort({ createdAt: 1 }); // oldest first for proper chat order

    res.status(200).json({
        success: true,
        count: messages.length,
        data: messages,
    });
});

// Get hired tutors for student (for StudentHelpRequests component)
exports.getHiredTutors = asyncHandler(async (req, res) => {
    try {
        const studentId = req.user._id; // logged-in student

        // Find the student document
        const student = await Student.findOne({ user_id: studentId })
            .populate({
                path: "hired_tutors.tutor",
                model: "TutorProfile",
                populate: {
                    path: "user_id",
                    select: "full_name email photo_url"
                }
            });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        // Filter and format hired tutors
        const hiredTutors = student.hired_tutors
            .filter(hiredTutor => hiredTutor.tutor !== null) // Filter out any null tutors
            .map(hiredTutor => {
                const tutorProfile = hiredTutor.tutor;
                const user = tutorProfile.user_id;

                return {
                    _id: tutorProfile._id,
                    tutor_id: tutorProfile._id,
                    user_id: user,
                    full_name: user.full_name,
                    email: user.email,
                    photo_url: user.photo_url,
                    hireStatus: hiredTutor.status,
                    // status: hiredTutor.status || 'pending',
                    hired_at: hiredTutor.hired_at,
                    // Tutor profile information
                    subjects: tutorProfile.subjects || [],
                    location: tutorProfile.location,
                    experience: tutorProfile.experience_years,
                    rating: tutorProfile.average_rating,
                    hourly_rate: tutorProfile.hourly_rate,
                    bio: tutorProfile.bio,
                    qualifications: tutorProfile.qualifications,
                    academic_levels_taught: tutorProfile.academic_levels_taught
                };
            });

        res.status(200).json({
            success: true,
            tutors: hiredTutors,
            total: hiredTutors.length
        });

    } catch (error) {
        console.error("Error fetching hired tutors:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch hired tutors",
            error: error.message
        });
    }
});





