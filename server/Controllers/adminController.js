// controllers/adminController.js
const TutorApplication = require("../Models/tutorApplicationSchema");
const TutorProfile = require("../Models/tutorProfileSchema");
const TutorDocument = require("../Models/tutorDocumentSchema");
const User = require("../Models/userSchema");
const StudentProfile = require("../Models/studentProfileSchema");
const ParentProfile = require("../Models/ParentProfileSchema");
const mongoose = require("mongoose");
const sendEmail = require("../Utils/sendEmail");
const generateOtpEmail = require("../Utils/otpTempelate");


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
  const tutor = await TutorProfile.findOne({ user_id: user_id });

  if (
    !tutor ||
    !preferred_interview_times ||
    !Array.isArray(preferred_interview_times)
  ) {
    return res.status(400).json({
      message: "tutor_id and preferred_interview_times (array) are required",
    });
  }

  try {
    let application = await TutorApplication.findOne({ tutor_id: tutor._id });
    if (!application) {
      application = new TutorApplication({
        tutor_id: tutor._id,
        preferred_interview_times: preferred_interview_times.map(time => new Date(time)),
        interview_status: 'Pending',
        application_status: 'Pending',
      });
    } else {
      const existingTimes = application.preferred_interview_times || [];
      const mergedTimes = Array.from(
        new Set([
          ...existingTimes.map(time => new Date(time).toISOString()),
          ...preferred_interview_times.map(time => new Date(`${time}:00Z`).toISOString()) // Ensure UTC
        ])
      ).map(time => new Date(time));
      

      application.preferred_interview_times = mergedTimes;
    }

    await application.save();
    res.status(200).json({
      message: "Available interview slots set successfully",
      data: application,
    });
  } catch (err) {
    console.error('Error setting available interview slots:', err);
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

    // Ensure scheduled_time is treated as UTC
    const selectedTime = new Date(scheduled_time.endsWith('Z') ? scheduled_time : `${scheduled_time}Z`);

    // Normalize to start of minute to avoid millisecond issues
    selectedTime.setMilliseconds(0);

    // Check for existing slot
    const existingSlot = await TutorApplication.findOne({
      preferred_interview_times: { $elemMatch: { $eq: selectedTime } },
      interview_status: { $in: ["Scheduled", "Pending"] },
      tutor_id: { $ne: tutor._id },
    });

    if (existingSlot) {
      return res.status(409).json({
        message: "This interview slot is already booked by another tutor.",
      });
    }

    // Save as a single Date object in preferred_interview_times (array)
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
// // Background Check Verification
// exports.verifyBackgroundCheck = async (req, res) => {
//   const { tutor_id } = req.body;

//   try {
//     const tutor = await TutorProfile.findOne({user_id:tutor_id});
//     const documents = await TutorDocument.find({
//       tutor_id:tutor._id,
//       document_type: { $in: ["ID Proof", "Address Proof","Background Check"] },
//     });
//     const hasIDProof = documents.some(
//       (doc) => doc.document_type === "ID Proof"
//     );
//     const hasAddressProof = documents.some(
//       (doc) => doc.document_type === "Address Proof"
//     );

//     if (!hasIDProof || !hasAddressProof) {
//       let missingDocs = [];
//       if (!hasIDProof) missingDocs.push("ID Proof");
//       if (!hasAddressProof) missingDocs.push("Address Proof");

//       return res.status(400).json({
//         message: `Missing required document(s): ${missingDocs.join(", ")}`,
//       });
//     }

//     await TutorProfile.findOneAndUpdate(
//       { _id: tutor._id },
//       { is_background_checked: true }
//     );
//     await TutorDocument.updateMany(
//       { tutor_id:tutor._id, document_type: { $in: ["ID Proof", "Address Proof", "Background Check"] } },
//       { $set: { verification_status: "Approved" } }
//     );

//     res.status(200).json({
//       message: "Background check verified. All required documents are valid.",
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: "Failed to verify background check",
//       error: err.message,
//     });
//   }
// };

// exports.verifyReferenceChecks = async (req, res) => {
//   const { tutor_id } = req.body;
//   const tutor = await TutorProfile.findOne({user_id:tutor_id});
//   try {
//     const referenceDocs = await TutorDocument.find({
//       tutor_id:tutor._id,
//       document_type: "Reference Letter",
//     });

//     if (referenceDocs.length < 1) {
//       return res
//         .status(400)
//         .json({ message: "Less than 2 reference letters found." });
//     }

//     await TutorProfile.findOneAndUpdate(
//       { _id: tutor._id },
//       { is_reference_verified: true }
//     );
//     await TutorDocument.updateMany(
//       {
//         tutor_id:tutor._id,
//         document_type: "Reference Letter",
//       },
//       { $set: { verification_status: "Approved" } }
//     );

//     res.status(200).json({ message: "Reference check verified successfully." });
//   } catch (err) {
//     res.status(500).json({
//       message: "Failed to verify references",
//       error: err.message,
//     });
//   }
// };

// // Qualification Verification
// exports.verifyQualifications = async (req, res) => {
//   const { tutor_id } = req.body;
//   const tutor = await TutorProfile.findOne({user_id:tutor_id});
//   try {
//     const qualificationDocs = await TutorDocument.find({
//       tutor_id:tutor._id,
//       document_type: { $in: ["Degree", "Certificate"] },
//     });

//     if (qualificationDocs.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "No qualification documents found." });
//     }

//     // ✅ Step 1: Update tutor profile
//     await TutorProfile.findOneAndUpdate(
//       { _id: tutor._id },
//       { is_qualification_verified: true }
//     );

//     // ✅ Step 2: Update document verification status
//     await TutorDocument.updateMany(
//       {
//         tutor_id:tutor._id,
//         document_type: { $in: ["Degree", "Certificate"] },
//       },
//       { $set: { verification_status: "Approved" } }
//     );

//     res.status(200).json({ message: "Qualifications verified successfully." });
//   } catch (err) {
//     res.status(500).json({
//       message: "Failed to verify qualifications",
//       error: err.message,
//     });
//   }
// };

exports.approveTutorProfile = async (req, res) => {
  const { user_id } = req.body;
  const tutor = await TutorProfile.findOne({user_id:user_id});
  try {
    const profile = await TutorProfile.findOne({ _id: tutor._id });
    const application = await TutorApplication.findOne({ tutor_id:tutor._id });

    if (!profile || !application) {
      return res.status(404).json({ message: "Tutor profile or application not found." });
    }

    const user = await User.findOne({ _id: profile.user_id });

    const allVerified =
      profile.is_background_checked &&
      profile.is_reference_verified &&
      profile.is_qualification_verified;

    if (!allVerified) {
      return res.status(400).json({
        message: "Tutor has not completed all verification steps.",
      });
    }

    // Approve tutor
    profile.profile_status = "approved";
    profile.is_verified = true;
    user.is_verified = 'active';

    await profile.save();
    await user.save();

    await sendEmail(
      user.email,
      "Tutor Approved",
      "Congratulations! Your tutor profile has been approved. You can now start tutoring on the platform."
    );
    console.log("Tutor profile approved and email sent.");
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
  const tutor = await TutorProfile.findOne({user_id:user_id});
  try {
    const profile = await TutorProfile.findOne({ _id: tutor._id });
    const application = await TutorApplication.findOne({ tutor_id:tutor._id });

    if (!profile || !application) {
      return res.status(404).json({ message: "Tutor profile or application not found." });
    }

    const user = await User.findOne({ _id: profile.user_id });


    // Approve tutor
    profile.profile_status = "partial_approved";
    profile.is_verified = true;
    user.is_verified = 'partial_active';

    await profile.save();
    await user.save();

    await sendEmail(
      user.email,
      "Tutor Partially Approved",
      "Congratulations! Your tutor profile has been partially approved. You can now start tutoring on the platform."
    );
    console.log("Tutor profile approved and email sent.");
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
    const profile = await TutorProfile.findOne({ user_id:user_id });
    const application = await TutorApplication.findOne({ tutor_id:profile._id });

    if (!profile || !application) {
      return res.status(404).json({ message: "Tutor profile or application not found." });
    }

    const user = await User.findOne({ _id: profile.user_id });

    // Set all statuses to false
    profile.profile_status = "rejected";
    profile.rejection_reason = reason || "Not specified";
    profile.is_verified = false;
    profile.is_background_checked = false;
    profile.is_reference_verified = false;
    profile.is_qualification_verified = false;
    application.application_status = "Rejected";
  
    user.is_verified = 'inactive';


    await profile.save();
    await user.save();
    await application.save();

    // ❗ Reject all documents
    await TutorDocument.updateMany(
      { tutor_id:profile._id },
      { $set: { verification_status: "Rejected" } }
    );
    await sendEmail(
      user.email,
      "Tutor Rejected",
      "Sorry! Your tutor profile has been rejected. Please contact the admin for more information."
    );

    res.status(200).json({
      message: "Tutor application rejected. Profile and documents updated.",
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
    if (userType && userType !== 'all') {
      // Map frontend userType to database role
      const roleMapping = {
        'tutors': 'tutor',
        'students': 'student', 
        'parents': 'parent'
      };
      query.role = roleMapping[userType] || userType;
    }
    if (status) {
      query.is_verified = status === 'verified';
    }

    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
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
    const formattedUsers = await Promise.all(users.map(async (user) => {
      
      const baseUser = {
        id: user._id,
        name: user.full_name || 'Unknown',
        email: user.email,
        phone: user.phone_number || '',
        role: user.role,
        status: user.is_verified,
        joinDate: user.created_at || user.createdAt,
        lastActive: user.updated_at || user.updatedAt
      };
      if (user.role === 'tutor') {
        const tutorProfile = await TutorProfile.findOne({ user_id: user._id });
        
        if (tutorProfile) {
          // Get documents for this tutor
          const documents = await TutorDocument.find({ tutor_id: tutorProfile._id });
          
          // Get application for this tutor
          const application = await TutorApplication.findOne({ tutor_id: tutorProfile._id });
          
          return {
            ...baseUser,
            subjects: tutorProfile.subjects || [],
            location: tutorProfile.location || '',
            documents: documents.map(doc => ({
              type: doc.document_type,
              url: doc.file_url || '#',
              verified: doc.verification_status === 'Approved',
              uploadDate: doc.uploaded_at || doc.createdAt,
              notes: doc.notes || ''
            })),
              interviewSlots: application && application.scheduled_time ? [{
              date: application.scheduled_time,
              time: new Date(application.scheduled_time).toLocaleTimeString('en-US', {
                timeZone: 'UTC',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
              }),
              is_interview: application.is_interview,
              scheduled: application.interview_status,
              completed: ['Passed', 'Failed'].includes(application.interview_status),
              result: application.interview_status === 'Passed' ? 'Passed' : application.interview_status === 'Failed' ? 'Failed' : null,
              notes: application.interview_notes || ''
            }] : [],
            preferredSlots: application && application.preferred_interview_times
            ? application.preferred_interview_times.map(time =>
                new Date(time).toLocaleString('en-US', {
                  timeZone: 'UTC',
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })
              )
            : [],
            backgroundCheck: tutorProfile.is_background_checked || false,
            qualificationCheck: tutorProfile.is_qualification_verified || false,
            referenceCheck: tutorProfile.is_reference_verified || false,
            references: documents.filter(doc => doc.document_type === 'Reference Letter').length,
            qualifications: tutorProfile.qualifications || '',
            interviewStatus: application ? ['Passed', 'Failed'].includes(application.interview_status) : false,
            rating: tutorProfile.average_rating || null,
            profileStatus: tutorProfile.profile_status === 'approved',
            applicationNotes: application ? application.admin_notes : ''
          };
        }
      } else if (user.role === 'student') {
        const studentProfile = await StudentProfile.findOne({ user_id: user._id });
        
        if (studentProfile) {
          return {
            ...baseUser,
            subjects: studentProfile.preferred_subjects || [],
            location: studentProfile.location || '',
            sessionsCompleted: 0, // Will be calculated from sessions
            rating: null // Students don't have ratings
          };
        }
      } else if (user.role === 'parent') {
        const parentProfile = await ParentProfile.findOne({ user_id: user._id });
        
        if (parentProfile) {
          return {
            ...baseUser,
            children: parentProfile.students || [],
            location: parentProfile.location || '',
            sessionsBooked: 0 // Will be calculated from sessions
          };
        }
      }

      // Return base user if no profile found
      return baseUser;
    }));
    res.status(200).json(formattedUsers);
  } catch (err) {
    console.error('Error in getAllUsers:', err);
    res.status(500).json({
      message: "Failed to fetch users",
      error: err.message,
    });
  }
};

// Get detailed tutor information including documents and interviews
exports.getTutorDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const tutor = await TutorProfile.findOne({user_id:userId})
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }
    
    // Get documents
    const documents = await TutorDocument.find({tutor_id: tutor._id });
    
    // Get interview slots
    const application = await TutorApplication.findOne({tutor_id: tutor._id });
    
    // Parse subjects if they are JSON strings
    let parsedSubjects = tutor.subjects || [];
    if (Array.isArray(parsedSubjects)) {
      parsedSubjects = parsedSubjects.map(subject => {
        if (typeof subject === 'string' && subject.startsWith('[') && subject.endsWith(']')) {
          try {
            return JSON.parse(subject);
          } catch (error) {
            return subject;
          }
        }
        return subject;
      }).flat();
    } else if (typeof parsedSubjects === 'string') {
      try {
        parsedSubjects = JSON.parse(parsedSubjects);
      } catch (error) {
        console.error('Error parsing subjects for tutor:', tutor.user_id.full_name, error);
        parsedSubjects = [];
      }
    }

    const tutorDetails = {
      id: tutor._id,
      name: tutor.user_id.full_name,
      email: tutor.user_id.email,
      phone: tutor.user_id.phone_number || '',
      location: tutor.location,
      subjects: parsedSubjects,
      status: tutor.profile_status,
      documents: documents.map(doc => ({
        type: doc.document_type,
        url: doc.file_url,
        verified: doc.verification_status === 'Approved',
        uploadDate: doc.uploaded_at,
        notes: doc.notes
      })),
      interviewSlots: application && application.scheduled_time ? [{
        date: application.scheduled_time,
        time: new Date(application.scheduled_time).toLocaleTimeString(),
        scheduled: application.interview_status === 'Scheduled',
        completed: application.interview_status === 'Passed' || application.interview_status === 'Failed',
        result: application.interview_status === 'Passed' ? 'Passed' : application.interview_status === 'Failed' ? 'Failed' : null,
        notes: application.interview_notes || ''
      }] : [],
      preferredSlots: application && application.preferred_interview_times ? 
        application.preferred_interview_times.map(time => 
          new Date(time).toLocaleString()
        ) : [],
      backgroundCheck: tutor.is_background_checked,
      references: documents.filter(doc => doc.document_type === 'Reference Letter').length,
      qualifications: tutor.qualifications,
      interviewCompleted: application ? ['Passed', 'Failed'].includes(application.interview_status) : false,
      rating: tutor.average_rating || null,
      profileComplete: tutor.profile_status === 'approved',
      joinDate: tutor.user_id.createdAt,
      lastActive: tutor.user_id.updatedAt,
      applicationNotes: application ? application.admin_notes : ''
    };


    res.status(200).json(tutorDetails);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch tutor details",
      error: err.message,
    });
  }
};

exports.updateInterviewToggle = async (req, res) => {
  const { user_id } = req.params;
  const { is_interview } = req.body;
  const tutor = await TutorProfile.findOne({user_id:user_id});
  if (!tutor) {
    return res.status(404).json({ message: "Tutor not found" });
  }
  const application = await TutorApplication.findOne({tutor_id:tutor._id});
  if (!application) {
    return res.status(404).json({ message: "Tutor application not found" });
  }
  application.is_interview = is_interview;
  await application.save();
  res.status(200).json({ message: "Interview toggle updated successfully" });
};

// Complete interview with result
exports.completeInterview = async (req, res) => {
  try {
    const { tutorId, result, notes } = req.body;
    
    const application = await TutorApplication.findOneAndUpdate(
      { tutor_id: tutorId },
      {
        interview_status: result === 'Passed' ? 'Passed' : 'Failed',
        interview_notes: notes || '',
        admin_notes: notes || ''
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Tutor application not found" });
    }

    // Send email notification to tutor
    const tutor = await TutorProfile.findById(tutorId).populate('user_id');
    if (tutor) {
      const emailSubject = result === 'Passed' ? 'Interview Passed' : 'Interview Result';
      const emailBody = result === 'Passed' 
        ? 'Congratulations! You have passed your interview. Your application will now proceed to the next stage.'
        : 'Thank you for your application. Unfortunately, you did not pass the interview. Please contact us for more information.';
      
      await sendEmail(tutor.user_id.email, emailSubject, emailBody);
    }

    res.status(200).json({
      message: "Interview completed successfully",
      application
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to complete interview",
      error: err.message,
    });
  }
};

// Get available interview slots
exports.getAvailableInterviewSlots = async (req, res) => {
  try {
    const { date } = req.query; // Expecting format like "2025-08-07"

    // Force date to be parsed as UTC
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    // Query for applications with preferred_interview_times within the date
    const applications = await TutorApplication.find({
      preferred_interview_times: {
        $elemMatch: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
    });
    // Extract preferred times and convert to UTC hours
    const preferredTimes = applications.flatMap(app => app.preferred_interview_times);
    const preferredHours = preferredTimes
      .filter(time => {
        const timeDate = new Date(time).toISOString().split('T')[0];
        return timeDate === date; // Only include times for the requested date
      })
      .map(time => new Date(time).getUTCHours());

    // Generate available slots from 9:00 to 17:00
    const availableSlots = [];
    const startHour = 9;
    const endHour = 17;

    for (let hour = startHour; hour < endHour; hour++) {
      const isPreferred = preferredHours.includes(hour);
      availableSlots.push({
        date,
        time: `${hour.toString().padStart(2, '0')}:00`,
        available: !isPreferred,
      });
    }

    res.status(200).json(availableSlots);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      message: "Failed to get available interview slots",
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
      application
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
    const pendingTutors = await TutorProfile.countDocuments({ profile_status: 'pending' });
    const verifiedTutors = await TutorProfile.countDocuments({ profile_status: 'approved' });
    
    const totalStudents = await StudentProfile.countDocuments();
    const totalParents = await ParentProfile.countDocuments();
    
    const pendingInterviews = await TutorApplication.countDocuments({
      interview_status: 'Scheduled'
    });

    const stats = {
      tutors: {
        total: totalTutors,
        pending: pendingTutors,
        verified: verifiedTutors
      },
      students: {
        total: totalStudents
      },
      parents: {
        total: totalParents
      },
      interviews: {
        pending: pendingInterviews
      }
    };

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
  const tutor = await TutorProfile.findOne({user_id:user_id});
  const document = await TutorDocument.findOne({ tutor_id: tutor._id, document_type });
  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }
  if(document_type === "ID Proof" || document_type === "Address Proof"){
    tutor.is_background_checked = true;
    await tutor.save();
  }
  if(document_type === "Degree" || document_type==="Certificate"){
    tutor.is_qualification_verified = true;
    await tutor.save();
  }
  if(document_type === "Reference Letter"){
    tutor.is_reference_verified = true;
    await tutor.save();
  }
  document.verification_status = 'Approved';
  await document.save();
  res.status(200).json({ message: "Document verified successfully" });
};