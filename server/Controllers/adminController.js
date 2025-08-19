// controllers/adminController.js
const TutorApplication = require("../Models/tutorApplicationSchema");
const TutorProfile = require("../Models/tutorProfileSchema");
const TutorDocument = require("../Models/tutorDocumentSchema");
const User = require("../Models/userSchema");
const StudentProfile = require("../Models/studentProfileSchema");
const ParentProfile = require("../Models/ParentProfileSchema");
const TutoringSession = require("../Models/tutoringSessionSchema");
const {
  EducationLevel,
  Subject,
  SubjectType,
} = require("../Models/LookupSchema");
const Rules = require("../Models/Rules");
const mongoose = require("mongoose");
const sendEmail = require("../Utils/sendEmail");
const generateOtpEmail = require("../Utils/otpTempelate");
const asyncHandler = require("express-async-handler");

const Message = require("../Models/messageSchema");

exports.getAllPendingApplications = async (req, res) => {
  try {
    const applications = await TutorApplication.find({
      interview_status: "Pending",
    }).populate({
      path: "tutor_id",
      select: "user_id", // only include user_id from TutorProfile
      populate: {
        path: "user_id",
        select: "full_name email", // only include name & email from User
      },
    });

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch tutor applications",
      error: err.message,
    });
  }
};

// Admin provides available interview slots
exports.setAvailableInterviewSlots = async (req, res) => {
  const { user_id, preferred_interview_times } = req.body;
  const tutor = await TutorProfile.findOne({ user_id });

  if (!tutor || !Array.isArray(preferred_interview_times)) {
    return res.status(400).json({
      message: "user_id and preferred_interview_times (array) are required",
    });
  }

  try {
    let application = await TutorApplication.findOne({ tutor_id: tutor._id });

    const newPreferredTimes = preferred_interview_times.map(
      (time) => new Date(`${time}:00Z`)
    );

    if (!application) {
      application = new TutorApplication({
        tutor_id: tutor._id,
        preferred_interview_times: newPreferredTimes,
        interview_status: "Pending",
        application_status: "Pending",
      });
    } else {
      // Case 1: If tutor already scheduled, don’t add that into preferred again
      const scheduled = application.scheduled_time
        ? application.scheduled_time.toISOString()
        : null;

      const mergedTimes = Array.from(
        new Set([
          ...application.preferred_interview_times.map((t) =>
            new Date(t).toISOString()
          ),
          ...newPreferredTimes.map((t) => t.toISOString()),
        ])
      )
        .map((t) => new Date(t))
        .filter((t) => t.toISOString() !== scheduled);

      application.preferred_interview_times = mergedTimes;
    }

    await application.save();
    res.status(200).json({
      message: "Available interview slots set successfully",
      data: application,
    });
  } catch (err) {
    console.error("Error setting available interview slots:", err);
    res.status(500).json({
      message: "Failed to set available interview slots",
      error: err.message,
    });
  }
};
// Select interview slot by Tutor
exports.selectInterviewSlot = async (req, res) => {
  const { user_id, scheduled_time } = req.body;

  if (!user_id || !scheduled_time) {
    return res
      .status(400)
      .json({ message: "user_id and scheduled_time are required" });
  }

  try {
    const tutor = await TutorProfile.findOne({ user_id: user_id });
    if (!tutor) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    const application = await TutorApplication.findOne({ tutor_id: tutor._id });
    if (!application) {
      return res.status(404).json({ message: "Tutor application not found" });
    }

    const selectedTime = new Date(
      scheduled_time.endsWith("Z") ? scheduled_time : `${scheduled_time}Z`
    );
    selectedTime.setMilliseconds(0);
    console.log("selectedTime", selectedTime);
    const existingSlot = await TutorApplication.findOne({
      preferred_interview_times: { $elemMatch: { $eq: selectedTime } },
      interview_status: { $in: ["Scheduled"] },
      tutor_id: { $ne: tutor._id },
    });
    console.log("existingSlot", existingSlot);
    if (existingSlot) {
      return res.status(409).json({
        message: "This interview slot is already booked by another tutor.",
      });
    }
    console.log("application", application);
    application.scheduled_time = selectedTime;
    application.interview_status = "Scheduled";
    await application.save();

    res.status(200).json({
      message: "Interview slot selected successfully",
      data: application,
    });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ message: "Failed to select interview slot", error: err.message });
  }
};

// Complete interview with result
exports.completeInterview = async (req, res) => {
  try {
    const { userId, result, notes } = req.body;

    const Tutor = await TutorProfile.findOne({ user_id: userId });
    const application = await TutorApplication.findOneAndUpdate(
      { tutor_id: Tutor._id },
      {
        interview_status: result === "passed" ? "Passed" : "Failed",
        preferred_interview_times: [], // Case 2: clear array
        scheduled_time: null, // Case 2: clear scheduled
        application_status: result === "passed" ? "Approved" : "Rejected",
        again_interview: false,
      },
      { new: true }
    );
    if (!application)
      return res.status(404).json({ message: "Tutor application not found" });

    res.status(200).json({
      message: "Interview completed successfully",
      application,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to complete interview",
      error: err.message,
    });
  }
};

exports.updateInterviewToggle = async (req, res) => {
  const { user_id } = req.params;
  const { is_interview } = req.body;
  const tutor = await TutorProfile.findOne({ user_id: user_id });
  if (!tutor) {
    return res.status(404).json({ message: "Tutor not found" });
  }
  const application = await TutorApplication.findOne({ tutor_id: tutor._id });
  if (!application) {
    return res.status(404).json({ message: "Tutor application not found" });
  }
  application.is_interview = is_interview;
  await application.save();
  res.status(200).json({ message: "Interview toggle updated successfully" });
};

// Get available interview slots
exports.getAvailableInterviewSlots = async (req, res) => {
  try {
    const { date } = req.query; // format "2025-08-16"
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    // Fetch all booked slots
    const booked = await TutorApplication.find({
      scheduled_time: { $gte: startOfDay, $lte: endOfDay },
      interview_status: "Scheduled",
    }).select("scheduled_time");

    const bookedHours = booked.map((a) =>
      new Date(a.scheduled_time).getUTCHours()
    );

    const availableSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      availableSlots.push({
        date,
        time: `${hour.toString().padStart(2, "0")}:00`,
        available: !bookedHours.includes(hour), // exclude scheduled ones
      });
    }

    res.status(200).json(availableSlots);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get available interview slots",
      error: err.message,
    });
  }
};

exports.approveTutorProfile = async (req, res) => {
  const { user_id, reason } = req.body;
  const tutor = await TutorProfile.findOne({ user_id: user_id });
  try {
    const profile = await TutorProfile.findOne({ _id: tutor._id });
    const application = await TutorApplication.findOne({ tutor_id: tutor._id });
    const documents = await TutorDocument.find({ tutor_id: tutor._id });

    if (!profile || !application) {
      return res
        .status(404)
        .json({ message: "Tutor profile or application not found." });
    }
    if (reason === "") {
      return res.status(400).json({ message: "Reason is required." });
    }
    const user = await User.findOne({ _id: profile.user_id });
    if (documents.some((doc) => doc.verification_status !== "Approved")) {
      return res
        .status(400)
        .json({ message: "All documents must be verified." });
    }
    const allVerified =
      profile.is_background_checked &&
      profile.is_reference_verified &&
      profile.is_qualification_verified;

    if (profile.profile_status === "approved") {
      return res
        .status(400)
        .json({ message: "Tutor profile is already approved." });
    }
    if (!allVerified) {
      return res.status(400).json({
        message: "Tutor has not completed all verification steps.",
      });
    }

    // Approve tutor
    profile.profile_status = "approved";
    profile.is_verified = true;
    profile.profile_status_reason = reason || "Not specified";
    user.is_verified = "active";

    await profile.save();
    await user.save();

    await sendEmail(
      user.email,
      "Tutor Approved",
      "Congratulations! Your tutor profile has been approved. You can now start tutoring on the platform."
    );
    return res
      .status(200)
      .json({ message: "Tutor profile approved and email sent." });
    // res.status(200).json({ message: "Tutor profile approved and email sent." });
  } catch (err) {
    console.error("Error approving tutor:", err);
    return res.status(500).json({
      message: "Failed to approve tutor profile",
      error: err.message,
    });
  }
};

exports.partialApproveTutor = async (req, res) => {
  const { user_id, reason } = req.body;
  const tutor = await TutorProfile.findOne({ user_id: user_id });
  try {
    const profile = await TutorProfile.findOne({ _id: tutor._id });
    const application = await TutorApplication.findOne({ tutor_id: tutor._id });

    if (!profile || !application) {
      return res
        .status(404)
        .json({ message: "Tutor profile or application not found." });
    }
    if (reason === "") {
      return res.status(400).json({ message: "Reason is required." });
    }
    if (profile.profile_status === "partial_approved") {
      return res
        .status(400)
        .json({ message: "Tutor profile is already partially approved." });
    }

    const user = await User.findOne({ _id: profile.user_id });

    // Approve tutor
    profile.profile_status = "partial_approved";
    profile.is_verified = true;
    profile.profile_status_reason = reason || "Not specified";
    user.is_verified = "partial_active";

    await profile.save();
    await user.save();

    await sendEmail(
      user.email,
      "Tutor Partially Approved",
      "Congratulations! Your tutor profile has been partially approved with the following reason: " +
        reason +
        ". You can now start tutoring on the platform."
    );
    return res
      .status(200)
      .json({ message: "Tutor profile partially approved and email sent." });
    // res.status(200).json({ message: "Tutor profile approved and email sent." });
  } catch (err) {
    console.error("Error approving tutor:", err);
    return res.status(500).json({
      message: "Failed to approve tutor profile",
      error: err.message,
    });
  }
};

exports.rejectTutorProfile = async (req, res) => {
  const { user_id, reason } = req.body;
  try {
    const profile = await TutorProfile.findOne({ user_id: user_id });
    const application = await TutorApplication.findOne({
      tutor_id: profile._id,
    });

    if (!profile || !application) {
      return res
        .status(404)
        .json({ message: "Tutor profile or application not found." });
    }
    if (reason === "") {
      return res.status(400).json({ message: "Reason is required." });
    }
    if (profile.profile_status === "rejected") {
      return res
        .status(400)
        .json({ message: "Tutor profile is already rejected." });
    }
    const user = await User.findOne({ _id: profile.user_id });

    // Set all statuses to false
    profile.profile_status = "rejected";
    profile.profile_status_reason = reason || "Not specified";
    profile.is_verified = false;
    profile.is_background_checked = false;
    profile.is_reference_verified = false;
    profile.is_qualification_verified = false;
    application.application_status = "Rejected";

    user.is_verified = "inactive";

    await profile.save();
    await user.save();
    await application.save();

    // ❗ Reject all documents
    await TutorDocument.updateMany(
      { tutor_id: profile._id },
      { $set: { verification_status: "Rejected" } }
    );
    await sendEmail(
      user.email,
      "Tutor Rejected",
      "Sorry! Your tutor profile has been rejected. Please contact the admin for more information."
    );

    res.status(200).json({
      message:
        "Tutor application rejected. And Email Has been Sent to the Tutor.",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to reject tutor",
      error: err.message,
    });
  }
};

// Get all users (tutors, students, parents) with detailed information
exports.getAllUsers = async (req, res) => {
  try {
    const { userType, status, search } = req.query;

    let query = {};
    if (userType && userType !== "all") {
      // Map frontend userType to database role
      const roleMapping = {
        tutors: "tutor",
        students: "student",
        parents: "parent",
      };
      query.role = roleMapping[userType] || userType;
    }
    if (status) {
      query.is_verified = status === "verified";
    }

    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // First, let's check what users exist in the database
    const allUsers = await User.find({});

    const users = await User.find(query);

    // If no users found, return empty array with helpful message
    if (users.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch profiles separately for each user type
    const formattedUsers = await Promise.all(
      users.map(async (user) => {
        const baseUser = {
          id: user._id,
          name: user.full_name || "Unknown",
          email: user.email,
          phone: user.phone_number || "",
          role: user.role,
          status: user.is_verified,
          joinDate: user.created_at || user.createdAt,
          lastActive: user.updated_at || user.updatedAt,
        };
        if (user.role === "tutor") {
          const tutorProfile = await TutorProfile.findOne({
            user_id: user._id,
          });

          if (tutorProfile) {
            // Get documents for this tutor
            const documents = await TutorDocument.find({
              tutor_id: tutorProfile._id,
            });
            // Get application for this tutor
            const application = await TutorApplication.findOne({
              tutor_id: tutorProfile._id,
            });
            // Get subjects by IDs
            const subjects = await Subject.find({
              _id: { $in: tutorProfile.subjects },
            });
            return {
              ...baseUser,
              subjects: tutorProfile.subjects || [],
              //  subjects: subjects.map((s) => ({
              //   _id: s._id,
              //   name: s.name,
              //   level: s.level_id,
              //   subjectType: s.subject_type,
              // })),
              location: tutorProfile.location || "",
              profileStatusReason: tutorProfile.profile_status_reason || "",
              documents: documents.map((doc) => ({
                type: doc.document_type,
                url: doc.file_url || "#",
                verified: doc.verification_status,
                uploadDate: doc.uploaded_at || doc.createdAt,
                notes: doc.notes || "",
              })),
              interviewSlots:
                application && application.scheduled_time
                  ? [
                      {
                        date: application.scheduled_time,
                        time: new Date(
                          application.scheduled_time
                        ).toLocaleTimeString("en-US", {
                          timeZone: "UTC",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        }),
                        scheduled: application.interview_status,
                        completed: ["Passed", "Failed"].includes(
                          application.interview_status
                        ),
                        result:
                          application.interview_status === "Passed"
                            ? "Passed"
                            : application.interview_status === "Failed"
                            ? "Failed"
                            : null,
                        notes: application.interview_notes || "",
                      },
                    ]
                  : [],
              preferredSlots:
                application && application.preferred_interview_times
                  ? application.preferred_interview_times.map((time) =>
                      new Date(time).toLocaleString("en-US", {
                        timeZone: "UTC",
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    )
                  : [],
              is_interview: application.is_interview || false,
              backgroundCheck: tutorProfile.is_background_checked || false,
              qualificationCheck:
                tutorProfile.is_qualification_verified || false,
              referenceCheck: tutorProfile.is_reference_verified || false,
              references: documents.filter(
                (doc) => doc.document_type === "Reference Letter"
              ).length,
              qualifications: tutorProfile.qualifications || "",
              interviewStatus: application
                ? ["Passed", "Failed"].includes(application.interview_status)
                : false,
              applicationStatus: application.application_status,
              interviewStatus1: application.interview_status,
              rating: tutorProfile.average_rating || null,
              profileStatus: tutorProfile.profile_status,
              applicationNotes: application ? application.admin_notes : "",
            };
          }
        } else if (user.role === "student") {
          const studentProfile = await StudentProfile.findOne({
            user_id: user._id,
          });
          console.log("studentProfile._id", studentProfile._id);
          const sessionCount = await TutoringSession.countDocuments({
            student_ids: { $in: [studentProfile._id] },
          });

          console.log("sessionCount", sessionCount);

          if (studentProfile) {
            return {
              ...baseUser,
              subjects: studentProfile.preferred_subjects || [],
              location: studentProfile.location || "",
              sessionsCompleted: sessionCount, // Will be calculated from sessions
              rating: null, // Students don't have ratings
            };
          }
        } else if (user.role === "parent") {
          const parentProfile = await ParentProfile.findOne({
            user_id: user._id,
          });

          if (parentProfile) {
            return {
              ...baseUser,
              children: parentProfile.students || [],
              location: parentProfile.location || "",
              sessionsBooked: 0, // Will be calculated from sessions
            };
          }
        }

        // Return base user if no profile found
        return baseUser;
      })
    );
    res.status(200).json(formattedUsers);
  } catch (err) {
    console.error("Error in getAllUsers:", err);
    res.status(500).json({
      message: "Failed to fetch users",
      error: err.message,
    });
  }
};

// Get detailed tutor information including documents and interviews
exports.getTutorDetails = async (req, res) => {
  try {
    const { user_id } = req.params;
    console.log("userId", req.params);
    const tutor = await TutorProfile.findOne({ user_id: user_id }).populate({
      path: "user_id",
      select: "full_name email phone_number photo_url createdAt updatedAt",
    });
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Get documents
    const documents = await TutorDocument.find({ tutor_id: tutor._id });

    // Get interview slots
    const application = await TutorApplication.findOne({ tutor_id: tutor._id });

    // Parse subjects if they are JSON strings
    let parsedSubjects = tutor.subjects || [];
    if (Array.isArray(parsedSubjects)) {
      parsedSubjects = parsedSubjects
        .map((subject) => {
          if (
            typeof subject === "string" &&
            subject.startsWith("[") &&
            subject.endsWith("]")
          ) {
            try {
              return JSON.parse(subject);
            } catch (error) {
              return subject;
            }
          }
          return subject;
        })
        .flat();
    } else if (typeof parsedSubjects === "string") {
      try {
        parsedSubjects = JSON.parse(parsedSubjects);
      } catch (error) {
        console.error(
          "Error parsing subjects for tutor:",
          tutor.user_id.full_name,
          error
        );
        parsedSubjects = [];
      }
    }

    const tutorDetails = {
      id: tutor.user_id._id,
      name: tutor.user_id.full_name,
      email: tutor.user_id.email,
      phone: tutor.user_id.phone_number || "",
      photo_url: tutor.user_id.photo_url || "",
      location: tutor.location,
      subjects: parsedSubjects,
      status: tutor.profile_status,
      documents: documents.map((doc) => ({
        type: doc.document_type,
        url: doc.file_url,
        verified: doc.verification_status === "Approved",
        uploadDate: doc.uploaded_at,
        notes: doc.notes,
      })),
      interviewSlots:
        application && application.scheduled_time
          ? [
              {
                // send ISO only; don't format to local time on server
                dateTime: application.scheduled_time,
                scheduled: application.interview_status === "Scheduled",
                completed: ["Passed", "Failed"].includes(
                  application.interview_status
                ),
                result:
                  application.interview_status === "Passed"
                    ? "Passed"
                    : application.interview_status === "Failed"
                    ? "Failed"
                    : null,
              },
            ]
          : [],
      preferredSlots:
        application && application.preferred_interview_times
          ? application.preferred_interview_times
          : [],
      backgroundCheck: tutor.is_background_checked,
      references: documents.filter(
        (doc) => doc.document_type === "Reference Letter"
      ).length,
      qualifications: tutor.qualifications,
      interviewStatus: application.interview_status,
      applicationStatus: application.application_status,
      interviewCompleted: application
        ? ["Passed", "Failed"].includes(application.interview_status)
        : false,
      rating: tutor.average_rating || null,
      againInterview: application.again_interview,
      profileComplete: tutor.profile_status === "approved",
      joinDate: tutor.user_id.createdAt,
      lastActive: tutor.user_id.updatedAt,
      applicationNotes: application ? application.admin_notes : "",
    };

    res.status(200).json(tutorDetails);
    console.log("tutorDetails", tutorDetails);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch tutor details",
      error: err.message,
    });
  }
};

// Toggle or set a user's active status (admin only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { status } = req.body; // expected: "active" | "inactive" | "partial_active"

    if (!user_id || !status) {
      return res
        .status(400)
        .json({ message: "user_id and status are required" });
    }

    const validStatuses = [
      "active",
      "inactive",
      "partial_active",
      "verified",
      "unverified",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.is_verified = status;
    await user.save();

    res
      .status(200)
      .json({
        message: "User status updated",
        user_id,
        status: user.is_verified,
      });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update user status",
      error: err.message,
    });
  }
};

// Update application notes
exports.updateApplicationNotes = async (req, res) => {
  try {
    const { tutorId, notes } = req.body;

    const application = await TutorApplication.findOneAndUpdate(
      { tutor_id: tutorId },
      { admin_notes: notes },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Tutor application not found" });
    }

    res.status(200).json({
      message: "Application notes updated",
      application,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update application notes",
      error: err.message,
    });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalTutors = await TutorProfile.countDocuments();
    const pendingTutors = await TutorProfile.countDocuments({
      profile_status: "pending",
    });
    const verifiedTutors = await TutorProfile.countDocuments({
      profile_status: "approved",
    });

    const totalStudents = await StudentProfile.countDocuments();
    const totalParents = await ParentProfile.countDocuments();

    const pendingInterviews = await TutorApplication.countDocuments({
      interview_status: "Scheduled",
    });
    const inactiveTutors = await TutorProfile.countDocuments({
      profile_status: "unverified",
    });
    const inactiveStudents = await User.countDocuments({
      role: "student",
      is_verified: "inactive",
    });
    const inactiveParents = await User.countDocuments({
      role: "parent",
      is_verified: "inactive",
    });
    const stats = {
      tutors: {
        total: totalTutors,
        pending: pendingTutors,
        verified: verifiedTutors,
      },
      students: {
        total: totalStudents,
      },
      parents: {
        total: totalParents,
      },
      interviews: {
        pending: pendingInterviews,
      },
      inactive: {
        tutors: inactiveTutors,
        students: inactiveStudents,
        parents: inactiveParents,
      },
    };
    console.log("stats", stats);
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get dashboard statistics",
      error: err.message,
    });
  }
};

exports.verifyDocument = async (req, res) => {
  const { user_id, document_type } = req.body;
  const tutor = await TutorProfile.findOne({ user_id: user_id });
  const document = await TutorDocument.findOne({
    tutor_id: tutor._id,
    document_type,
  });
  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }
  if (document_type === "ID Proof" || document_type === "Address Proof") {
    tutor.is_background_checked = true;
    await tutor.save();
  }
  if (document_type === "Degree" || document_type === "Certificate") {
    tutor.is_qualification_verified = true;
    await tutor.save();
  }
  if (document_type === "Reference Letter") {
    tutor.is_reference_verified = true;
    await tutor.save();
  }
  document.verification_status = "Approved";
  await document.save();
  res.status(200).json({ message: "Document verified successfully" });
};

// RULE AND OTP ARE ADDED........................................................

exports.toggleOtpRule = asyncHandler(async (req, res) => {
  let rule = await Rules.findOne();

  if (!rule) {
    rule = await Rules.create({ otp_rule_active: false });
  }

  rule.otp_rule_active = !rule.otp_rule_active;
  await rule.save();

  res.status(200).json({
    message: "OTP rule toggled successfully",
    data: rule,
  });
});

exports.getOtpStatus = asyncHandler(async (req, res) => {
  let rule = await Rules.findOne();

  if (!rule) {
    rule = await Rules.create({ otp_rule_active: false });
  }

  res.status(200).json({
    success: true,
    data: {
      otp_rule_active: rule.otp_rule_active,
    },
  });
});

// EDUCATION LEVEL AND RULES ARE ADDED.......................................
exports.addEducationLevel = asyncHandler(async (req, res) => {
  const { level } = req.body;

  if (!level) {
    res.status(400);
    throw new Error("Level is required");
  }

  const existingLevel = await EducationLevel.findOne({ level });
  if (existingLevel) {
    res.status(400);
    throw new Error(
      "Education level already exists, Please Add another Education Level"
    );
  }

  const newLevel = await EducationLevel.create({ level });

  res.status(201).json({
    message: "Education level added successfully",
    data: newLevel,
  });
});

exports.getEducationLevels = asyncHandler(async (req, res) => {
  const levels = await EducationLevel.find({}).sort({ level: 1 });
  res.status(200).json(levels);
});

exports.deleteEducationLevel = asyncHandler(async (req, res) => {
  const level = await EducationLevel.findByIdAndDelete(req.params.id);

  if (!level) {
    res.status(404);
    throw new Error("Education level not found");
  }

  res.status(200).json({
    success: true,
    message: "Education level deleted successfully",
  });
});

exports.updateEducationLevel = asyncHandler(async (req, res) => {
  const { level } = req.body;
  const existingLevel = await EducationLevel.findById(req.params.id);

  if (!existingLevel) {
    res.status(404);
    throw new Error("Education level not found");
  }

  if (!level) {
    res.status(400);
    throw new Error("Level is required");
  }

  // Check if new level already exists (excluding current level)
  const levelExists = await EducationLevel.findOne({
    level,
    _id: { $ne: req.params.id },
  });

  if (levelExists) {
    res.status(400);
    throw new Error("Education level already exists");
  }

  existingLevel.level = level;
  const updatedLevel = await existingLevel.save();

  res.status(200).json({
    success: true,
    message: "Education level updated successfully",
    data: updatedLevel,
  });
});

exports.manageEducationLevel = asyncHandler(async (req, res) => {
  const {
    hourlyRate,
    totalSessionsPerMonth,
    discount,
    isTutorCanChangeRate,
    maxSession,
    minSession,
  } = req.body;
  const levelId = req.params.id;

  const existingLevel = await EducationLevel.findById(levelId);
  if (!existingLevel) {
    res.status(404);
    throw new Error("Education level not found");
  }

  if (hourlyRate !== undefined) existingLevel.hourlyRate = hourlyRate;
  if (totalSessionsPerMonth !== undefined)
    existingLevel.totalSessionsPerMonth = totalSessionsPerMonth;
  if (discount !== undefined) existingLevel.discount = discount;
  if (isTutorCanChangeRate !== undefined)
    existingLevel.isTutorCanChangeRate = isTutorCanChangeRate;
  if (maxSession !== undefined) existingLevel.maxSession = maxSession;
  if (minSession !== undefined) existingLevel.minSession = minSession;
  const updatedLevel = await existingLevel.save();

  res.status(200).json({
    success: true,
    message: "Education level managed successfully",
    data: updatedLevel,
  });
});

// All Subjects Handles Add remove update dlete ....................

exports.getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find()
    .sort({ name: 1 })
    .populate("level_id")        // full EducationLevel document
    .populate("subject_type");   // full SubjectType document

  res.status(200).json({
    success: true,
    data: subjects,
  });
});


const generateSubjectId = async () => {
  const lastSubject = await Subject.findOne().sort({ subject_id: -1 });

  if (!lastSubject) {
    return "SUB-001";
  }
  const lastId = lastSubject.subject_id;
  const lastNum = parseInt(lastId.split("-")[1]);
  const newNum = (lastNum + 1).toString().padStart(3, "0");

  return `SUB-${newNum}`;
};

exports.addSubject = asyncHandler(async (req, res) => {
  console.log(req.body);

  const { name, level_id, subject_type } = req.body;

  if (!name || !level_id || !subject_type) {
    res.status(400);
    throw new Error("Subject name, level id, and subject type are required");
  }

  const chklevel = await EducationLevel.findById(level_id);
  if (!chklevel) {
    res.status(404);
    throw new Error("Education level not found");
  }

  const chkType = await SubjectType.findById(subject_type);
  if (!chkType) {
    res.status(404);
    throw new Error("Subject type not found");
  }

  const subject_id = await generateSubjectId();

  const subject = await Subject.create({
    subject_id,
    name,
    level_id: level_id,
    subject_type,
  });

  res.status(201).json({
    success: true,
    message: "Subject added successfully",
    data: subject,
  });
});

exports.updateSubject = asyncHandler(async (req, res) => {
  const { name, level_id, subject_type } = req.body;

  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }

  if (!name || !level_id) {
    res.status(400);
    throw new Error("Subject name and level id are required");
  }

  const chklevel = await EducationLevel.findById(level_id);
  if (!chklevel) {
    res.status(404);
    throw new Error("Education level not found");
  }
  const chkType = await SubjectType.findById(subject_type);
  if (!chkType) {
    res.status(404);
    throw new Error("Subject type not found");
  }

  subject.name = name;
  subject.level_id = level_id;
  if (subject_type) {
    subject.subject_type = subject_type;
  }

  const updatedSubject = await subject.save();

  res.status(200).json({
    success: true,
    message: "Subject updated successfully",
    data: updatedSubject,
  });
});

exports.deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }

  res.status(200).json({
    success: true,
    message: "Subject deleted successfully",
  });
});

// ALL SUBJECT TYPE FUNCTION
exports.addSubjectType = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Subject type name is required");
  }

  const exists = await SubjectType.findOne({ name: name.trim() });
  if (exists) {
    res.status(400);
    throw new Error("Subject type already exists");
  }

  const subjectType = await SubjectType.create({ name: name.trim() });

  res.status(201).json({
    success: true,
    message: "Subject type added successfully",
    data: subjectType,
  });
});

// Get All SubjectTypes
exports.getSubjectTypes = asyncHandler(async (req, res) => {
  const subjectTypes = await SubjectType.find().sort({ name: 1 });
  res.status(200).json({
    success: true,
    data: subjectTypes,
  });
});

// Update SubjectType
exports.updateSubjectType = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const subjectType = await SubjectType.findById(req.params.id);

  if (!subjectType) {
    res.status(404);
    throw new Error("Subject type not found");
  }

  if (!name) {
    res.status(400);
    throw new Error("Subject type name is required");
  }

  subjectType.name = name.trim();
  const updated = await subjectType.save();

  res.status(200).json({
    success: true,
    message: "Subject type updated successfully",
    data: updated,
  });
});

// Delete SubjectType
exports.deleteSubjectType = asyncHandler(async (req, res) => {
  const subjectType = await SubjectType.findById(req.params.id);

  if (!subjectType) {
    res.status(404);
    throw new Error("Subject type not found");
  }

  await subjectType.deleteOne();

  res.status(200).json({
    success: true,
    message: "Subject type deleted successfully",
  });
});

exports.fetchSubjectRelatedToAcademicLevels = asyncHandler(async (req, res) => {
  const { levels } = req.query; // e.g. "64f1a,64f2b,64f3c"
  console.log("levels", levels);

  if (!levels) {
    return res.status(400).json({
      success: false,
      message: "Level IDs are required",
    });
  }
  const levelArray = levels
    .split(",")
    .map((id) => new mongoose.Types.ObjectId(id));

  const subjects = await Subject.aggregate([
    { $match: { level_id: { $in: levelArray } } },

    {
      $lookup: {
        from: "educationlevels",
        localField: "level_id",
        foreignField: "_id",
        as: "levelData",
      },
    },
    { $unwind: "$levelData" },

    {
      $lookup: {
        from: "subjecttypes",
        localField: "subject_type",
        foreignField: "_id",
        as: "subjectTypeData",
      },
    },
    { $unwind: "$subjectTypeData" },

    // group by unique fields to avoid duplicates
    {
      $group: {
        _id: {
          name: "$name",
          level_id: "$level_id",
          subject_type: "$subject_type",
        },
        doc: { $first: "$$ROOT" }, // pehla record le lo
      },
    },
    { $replaceRoot: { newRoot: "$doc" } },
  ]);

  res.status(200).json({
    success: true,
    data: subjects,
  });
});

exports.getAllChatsOfUsers = asyncHandler(async (req, res) => {
  // Fetch all messages and populate student and tutor details
  const messages = await Message.find()
    .populate("studentId", "full_name email") // Only include name and email of student
    .populate("tutorId", "full_name email") // Only include name and email of tutor
    .sort({ createdAt: -1 }); // Sort by latest first

  // Format the response data
  const formattedMessages = messages.map((msg) => ({
    _id: msg._id,
    student: {
      id: msg.studentId._id,
      full_name: msg.studentId.full_name,
      email: msg.studentId.email,
    },
    tutor: {
      id: msg.tutorId._id,
      full_name: msg.tutorId.full_name,
      email: msg.tutorId.email,
    },
    message: msg.message,
    response: msg.response,
    status: msg.status,
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
  }));

  res.status(200).json({
    success: true,
    count: messages.length,
    data: formattedMessages,
  });
});
