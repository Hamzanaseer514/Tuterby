// controllers/adminController.js
const StudentPayment = require("../Models/studentPaymentSchema");

const TutorApplication = require("../Models/tutorApplicationSchema");

const TutorProfile = require("../Models/tutorProfileSchema");

const TutorDocument = require("../Models/tutorDocumentSchema");

const User = require("../Models/userSchema");

const StudentProfile = require("../Models/studentProfileSchema");

const ParentProfile = require("../Models/ParentProfileSchema");

const TutoringSession = require("../Models/tutoringSessionSchema");

const TutorReview = require("../Models/tutorReviewSchema");

const Assignment = require("../Models/assignmentSchema");
const AssignmentSubmission = require("../Models/assignmentSubmissionSchema");

const {

  EducationLevel,

  Subject,

  SubjectType,

} = require("../Models/LookupSchema");

const Rules = require("../Models/Rules");

const mongoose = require("mongoose");

const sendEmail = require("../Utils/sendEmail");
const { 
  generateTutorApprovalEmail, 
  generateTutorRejectionEmail, 
  generateTutorPartialApprovalEmail 
} = require("../Utils/tutorEmailTemplates");
const s3KeyToUrl = require("../Utils/s3KeyToUrl");

const generateOtpEmail = require("../Utils/otpTempelate");

const { v4: uuidv4 } = require('uuid');

const asyncHandler = require("express-async-handler");

// Function to generate interview token
const generateInterviewToken = () => {
  return uuidv4();
};

// Function to create interview scheduling email template
const createInterviewEmailTemplate = (tutorName, clientUrl, token) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Interview Scheduling - Tutorby</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Interview Scheduling Invitation</h1>
            </div>
            <div class="content">
                <h2>Hello ${tutorName},</h2>
                <p>Great news! We have received your tutor application and would like to schedule an interview with you.</p>
                <p>Please click the button below to access your interview scheduling portal where you can:</p>
                <ul>
                    <li>View your available interview time slots</li>
                    <li>Select your preferred interview time</li>
                    <li>Confirm your interview details</li>
                </ul>
                <div style="text-align: center;">
                    <a href="${clientUrl}/interview/${token}" class="button">Schedule Your Interview</a>
                </div>
                <p><strong>Important:</strong> This link will expire in 7 days. Please schedule your interview as soon as possible.</p>
                <p>If you have any questions, please don't hesitate to contact our support team.</p>
                <p>Best regards,<br>The Tutorby Team</p>
            </div>
            <div class="footer">
                <p>This is an automated email. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Function to create interview result email template
const createInterviewResultEmailTemplate = (tutorName, result, notes = '') => {
  const isPassed = result === 'passed';
  const headerColor = isPassed ? '#4CAF50' : '#f44336';
  const resultText = isPassed ? 'Congratulations!' : 'Interview Result';
  const statusText = isPassed ? 'PASSED' : 'FAILED';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Interview Result - Tutorby</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${headerColor}; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .result-badge { display: inline-block; background-color: ${headerColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .notes { background-color: #e8f4fd; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${resultText}</h1>
            </div>
            <div class="content">
                <h2>Hello ${tutorName},</h2>
                <p>We hope this email finds you well. We are writing to inform you about the result of your recent interview.</p>
                
                <div style="text-align: center;">
                    <span class="result-badge">${statusText}</span>
                </div>
                
                ${isPassed ? `
                    <p><strong>Congratulations!</strong> We are pleased to inform you that you have successfully passed your interview.</p>
                    <p>Your application has been approved and you are now officially part of the Tutorby teaching community.</p>
                    <p>Next steps:</p>
                    <ul>
                        <li>You can now start accepting tutoring sessions</li>
                        <li>Complete your profile setup if not already done</li>
                        <li>Set your availability schedule</li>
                        <li>Begin connecting with students</li>
                    </ul>
                ` : `
                    <p>We regret to inform you that you have not passed the interview at this time.</p>
                    <p>This decision was made after careful consideration of your interview performance and application materials.</p>
                    <p>Please note that this does not mean you cannot reapply in the future. We encourage you to:</p>
                    <ul>
                        <li>Review the feedback provided below</li>
                        <li>Consider reapplying after addressing any areas for improvement</li>
                        <li>Contact our support team if you have any questions</li>
                    </ul>
                `}
                
                ${notes ? `
                    <div class="notes">
                        <h3>Interview Feedback:</h3>
                        <p>${notes}</p>
                    </div>
                ` : ''}
                
                <p>If you have any questions or need further clarification, please don't hesitate to contact our support team.</p>
                <p>Thank you for your interest in joining Tutorby.</p>
                <p>Best regards,<br>The Tutorby Team</p>
            </div>
            <div class="footer">
                <p>This is an automated email. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};



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



    // Generate interview token and expiration time
    const interviewToken = generateInterviewToken();
    const tokenExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    if (!application) {

      application = new TutorApplication({

        tutor_id: tutor._id,

        preferred_interview_times: newPreferredTimes,

        interview_status: "Pending",

        application_status: "Pending",

        interview_token: interviewToken,

        expire_token: tokenExpiration,

      });

    } else {

      // Case 1: If tutor already scheduled, don't add that into preferred again

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
      
      // Update token and expiration time
      application.interview_token = interviewToken;
      application.expire_token = tokenExpiration;

    }

    await application.save();

    // Get tutor's user information for email
    const tutorUser = await User.findById(user_id);
    
    if (tutorUser && tutorUser.email) {
      // Send email to tutor with interview scheduling link
      const clientUrl = process.env.FRONTEND_URL;
      const emailSubject = 'Interview Scheduling Invitation - Tutorby';
      const emailContent = createInterviewEmailTemplate(
        tutorUser.full_name, 
        clientUrl, 
        interviewToken
      );

      try {
        await sendEmail(tutorUser.email, emailSubject, emailContent);
      } catch (emailError) {
        console.error('Error sending interview email:', emailError);
        // Don't fail the entire request if email fails
      }
    }

    res.status(200).json({

      message: "Available interview slots set successfully and email sent to tutor",

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

    const existingSlot = await TutorApplication.findOne({

      preferred_interview_times: { $elemMatch: { $eq: selectedTime } },

      interview_status: { $in: ["Scheduled"] },

      tutor_id: { $ne: tutor._id },

    });

    if (existingSlot) {

      return res.status(409).json({

        message: "This interview slot is already booked by another tutor.",

      });

    }

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

    // Get tutor user details for email
    const tutorUser = await User.findById(userId);
    
    if (tutorUser && tutorUser.email) {
      // Send interview result email to tutor
      const emailSubject = result === "passed" 
        ? 'Congratulations! Interview Passed - Tutorby' 
        : 'Interview Result - Tutorby';
      
      const emailContent = createInterviewResultEmailTemplate(
        tutorUser.full_name, 
        result, 
        notes || ''
      );

      try {
        await sendEmail(tutorUser.email, emailSubject, emailContent);
      } catch (emailError) {
        console.error('Error sending interview result email:', emailError);
        // Don't fail the entire request if email fails
      }
    }

    res.status(200).json({

      message: "Interview completed successfully and email sent to tutor",

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



    const emailContent = generateTutorApprovalEmail(user.full_name, reason);
    await sendEmail(
      user.email,
      "🎉 Tutor Application Approved - TutorBy",
      emailContent
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



    const emailContent = generateTutorPartialApprovalEmail(user.full_name, reason);
    await sendEmail(
      user.email,
      "🎯 Tutor Application Partially Approved - TutorBy",
      emailContent

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

    const emailContent = generateTutorRejectionEmail(user.full_name, reason);
    await sendEmail(
      user.email,
      "❌ Tutor Application Rejected - TutorBy",
      emailContent
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



// Get all users (tutors, students, parents) with detailed information - ULTRA OPTIMIZED VERSION

exports.getAllUsers = async (req, res) => {
  try {
    const { userType, status, search, page = 1, limit = 50 } = req.query;
    
    // Pagination setup - increased default limit for better performance
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * lim;

    let query = {};

    if (userType && userType !== "all") {
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

    // Get total count for pagination - use estimated count for better performance
    const totalUsers = await User.estimatedDocumentCount();
    
    // Get users with pagination - optimized query
    const users = await User.find(query)
      .select('_id full_name email phone_number photo_url role is_verified createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .lean(); // Use lean() for better performance

    if (users.length === 0) {
      return res.status(200).json({
        users: [],
        pagination: {
          current_page: pageNum,
          total_pages: 0,
          total_items: 0,
          items_per_page: lim
        }
      });
    }

    // Get user IDs for batch queries
    const userIds = users.map(user => user._id);

    // Batch fetch all related data in parallel - optimized queries
    const [tutorProfiles, studentProfiles, parentProfiles] = await Promise.all([
      // Tutor profiles with minimal population for speed
      TutorProfile.find({ user_id: { $in: userIds } })
        .select('user_id subjects academic_levels_taught location profile_status_reason is_background_checked is_qualification_verified is_reference_verified qualifications average_rating profile_status')
        .populate({
          path: "subjects",
          select: "name"
        })
        .populate({
          path: "academic_levels_taught.educationLevel",
          select: "level"
        })
        .lean(),
      
      // Student profiles with minimal population
      StudentProfile.find({ user_id: { $in: userIds } })
        .select('user_id preferred_subjects academic_level location parent_id')
        .populate({
          path: "parent_id",
          select: "user_id",
          populate: {
            path: "user_id",
            select: "full_name email photo_url"
          }
        })
        .lean(),
      
      // Parent profiles with minimal population
      ParentProfile.find({ user_id: { $in: userIds } })
        .select('user_id students location')
        .populate({
          path: "students",
          select: "user_id academic_level preferred_subjects",
          populate: {
            path: "user_id",
            select: "full_name email photo_url"
          }
        })
        .lean()
    ]);

    // Get tutor IDs for documents and applications
    const tutorIds = tutorProfiles.map(tp => tp._id);
    
    // Fetch documents and applications only if we have tutors
    const [tutorDocuments, tutorApplications] = tutorIds.length > 0 ? await Promise.all([
      TutorDocument.find({ tutor_id: { $in: tutorIds } })
        .select('tutor_id document_type file_url verification_status uploaded_at notes')
        .lean(),
      TutorApplication.find({ tutor_id: { $in: tutorIds } })
        .select('tutor_id scheduled_time interview_status application_status admin_notes is_interview again_interview')
        .lean()
    ]) : [[], []];

    // Create lookup maps for O(1) access
    const tutorProfileMap = new Map(tutorProfiles.map(tp => [tp.user_id.toString(), tp]));
    const studentProfileMap = new Map(studentProfiles.map(sp => [sp.user_id.toString(), sp]));
    const parentProfileMap = new Map(parentProfiles.map(pp => [pp.user_id.toString(), pp]));
    const documentsMap = new Map();
    const applicationsMap = new Map();

    // Group documents by tutor_id
    tutorDocuments.forEach(doc => {
      if (!documentsMap.has(doc.tutor_id.toString())) {
        documentsMap.set(doc.tutor_id.toString(), []);
      }
      documentsMap.get(doc.tutor_id.toString()).push(doc);
    });

    // Group applications by tutor_id
    tutorApplications.forEach(app => {
      applicationsMap.set(app.tutor_id.toString(), app);
    });

    // Process users efficiently
    const formattedUsers = await Promise.all(users.map(async user => {
      const baseUser = {
        id: user._id,
        name: user.full_name || "Unknown",
        email: user.email,
        phone: user.phone_number || "",
        photo_url: user.photo_url ? await s3KeyToUrl(user.photo_url) : user.photo_url || "",
        role: user.role,
        status: user.is_verified,
        joinDate: user.created_at || user.createdAt,
        lastActive: user.updated_at || user.updatedAt,
      };

      if (user.role === "tutor") {
        const tutorProfile = tutorProfileMap.get(user._id.toString());
        if (tutorProfile) {
          const documents = documentsMap.get(tutorProfile._id.toString()) || [];
          const application = applicationsMap.get(tutorProfile._id.toString());

          return {
            ...baseUser,
            subjects: tutorProfile.subjects || [],
            academic_levels_taught: tutorProfile.academic_levels_taught || [],
            location: tutorProfile.location || "",
            profileStatusReason: tutorProfile.profile_status_reason || "",
            documents: await Promise.all(documents.map(async (doc) => ({
              type: doc.document_type,
              url: doc.file_url ? await s3KeyToUrl(doc.file_url) : "#",
              verified: doc.verification_status,
              uploadDate: doc.uploaded_at || doc.createdAt,
              notes: doc.notes || "",
            }))),
            interviewSlots: application && application.scheduled_time ? [{
              date: application.scheduled_time,
              time: new Date(application.scheduled_time).toLocaleTimeString("en-US", {
                timeZone: "UTC",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              }),
              scheduled: application.interview_status,
              completed: ["Passed", "Failed"].includes(application.interview_status),
              result: application.interview_status === "Passed" ? "Passed" : 
                     application.interview_status === "Failed" ? "Failed" : null,
              notes: application.interview_notes || "",
            }] : [],
            is_interview: application?.is_interview || false,
            backgroundCheck: tutorProfile.is_background_checked || false,
            qualificationCheck: tutorProfile.is_qualification_verified || false,
            referenceCheck: tutorProfile.is_reference_verified || false,
            references: documents.filter((doc) => doc.document_type === "Reference Letter").length,
            qualifications: tutorProfile.qualifications || "",
            interviewStatus: application ? ["Passed", "Failed"].includes(application.interview_status) : false,
            applicationStatus: application?.application_status,
            interviewStatus1: application?.interview_status,
            rating: tutorProfile.average_rating || null,
            profileStatus: tutorProfile.profile_status,
            applicationNotes: application?.admin_notes || "",
          };
        }
      } else if (user.role === "student") {
        const studentProfile = studentProfileMap.get(user._id.toString());
        if (studentProfile) {
          return {
            ...baseUser,
            subjects: studentProfile.preferred_subjects || [],
            academic_level: studentProfile.academic_level || null,
            location: studentProfile.location || "",
            sessionsCompleted: 0, // Simplified - remove expensive count query
            parent: studentProfile.parent_id ? {
              id: studentProfile.parent_id._id,
              name: studentProfile.parent_id.user_id.full_name,
              email: studentProfile.parent_id.user_id.email,
              photo_url: studentProfile.parent_id.user_id.photo_url ? await s3KeyToUrl(studentProfile.parent_id.user_id.photo_url) : studentProfile.parent_id.user_id.photo_url || "",
            } : null,
          };
        }
      } else if (user.role === "parent") {
        const parentProfile = parentProfileMap.get(user._id.toString());
        if (parentProfile) {
          console.log("parentProfile", parentProfile);
          return {
            ...baseUser,
            children: parentProfile.students,
            location: parentProfile.location || "",
            sessionsBooked: 0,
          };
        }
      }
      console.log("baseUser", baseUser);
      return baseUser;
    }));

    res.status(200).json({
      users: formattedUsers,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(totalUsers / lim),
        total_items: totalUsers,
        items_per_page: lim
      }
    });
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

    const tutor = await TutorProfile.findOne({ user_id: user_id })
    .populate({
      path: "user_id",
      select: "full_name email phone_number photo_url createdAt updatedAt",
    })
    .populate({
      path: "subjects", // 👈 populate subjects
      select: "name",   // sirf name chahiye
    })
    .populate({
      path: "academic_levels_taught.educationLevel",
      select: "level",
    });

    if (!tutor) {

      return res.status(404).json({ message: "Tutor not found" });

    }


    const totalSessions = await TutoringSession.countDocuments({ tutor_id: tutor._id });
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
      photo_url: tutor.user_id.photo_url ? await s3KeyToUrl(tutor.user_id.photo_url) : tutor.user_id.photo_url || "",
      location: tutor.location,
      subjects: parsedSubjects,
      status: tutor.profile_status,
      experience_years : tutor.experience_years,
      TotalSessions:totalSessions,
      bio: tutor.bio,
      // 🔹 Academic Levels
      academic_levels_taught: tutor.academic_levels_taught || [],
    
      documents: await Promise.all(documents.map(async (doc) => ({
        type: doc.document_type,
        url: doc.file_url ? await s3KeyToUrl(doc.file_url) : "#",
        verified: doc.verification_status === "Approved",
        uploadDate: doc.uploaded_at,
        notes: doc.notes,
      }))),
    
      interviewSlots:
        application && application.scheduled_time
          ? [
              {
                dateTime: application.scheduled_time,
                scheduled: application.interview_status === "Scheduled",
                completed: ["Passed", "Failed"].includes(application.interview_status),
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
      is_interview: application.is_interview || false,
      profileComplete: tutor.profile_status === "approved",
      joinDate: tutor.user_id.createdAt,
      lastActive: tutor.user_id.updatedAt,
      applicationNotes: application ? application.admin_notes : "",
    };

      res.status(200).json(tutorDetails);

  } catch (err) {

    res.status(500).json({

      message: "Failed to fetch tutor details",

      error: err.message,

    });

  }

};

// Admin: Update a specific hire request on a student's profile
exports.updateHireRequest = asyncHandler(async (req, res) => {
  try {
    const { student_profile_id, hire_record_id } = req.params;
    // status may be 'accepted'|'rejected' or 'accept'|'reject'
    const { status, subject, academic_level_id } = req.body || {};

    if (!student_profile_id || !hire_record_id) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const student = await StudentProfile.findById(student_profile_id);
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const hireRecord = student.hired_tutors.id(hire_record_id);
    if (!hireRecord) return res.status(404).json({ message: 'Hire record not found' });

    // Normalize action: map incoming status to 'accept'|'reject'
    let action = null;
    const normalizedStatus = status ? String(status).toLowerCase() : null;
    if (normalizedStatus) {
      if (normalizedStatus === 'accept' || normalizedStatus === 'accepted') action = 'accept';
      else if (normalizedStatus === 'reject' || normalizedStatus === 'rejected') action = 'reject';
    }

    // If status is provided but it's not an accept/reject action (e.g. 'pending'),
    // treat this as a simple field update and save the provided status along with
    // any subject/academic level changes. However, do NOT allow setting to
    // 'pending' when an active payment exists (same blocking rule as reject).
    if (!action) {
      // fetch tutor profile early for payment checks
      const tutorProfile = await TutorProfile.findById(hireRecord.tutor);

      // If admin is trying to set status to 'pending', block if there's an active payment
      if (status && String(status).toLowerCase() === 'pending') {
        try {
          const now = new Date();
          const activePayment = await StudentPayment.findOne({
            student_id: student._id,
            tutor_id: tutorProfile?._id,
            subject: hireRecord.subject,
            academic_level: hireRecord.academic_level_id,
            payment_status: 'paid',
            academic_level_paid: true,
            validity_status: 'active',
            validity_end_date: { $gt: now },
            sessions_remaining: { $gt: 0 }
          }).lean();

          if (activePayment) {
            return res.status(400).json({
              success: false,
              message: 'Cannot set status to pending: student has an active/paid package for this subject and level.',
              links: {
                payments: [
                  {
                    id: activePayment._id,
                    payment_status: activePayment.payment_status,
                    validity_status: activePayment.validity_status,
                    sessions_remaining: activePayment.sessions_remaining
                  }
                ]
              }
            });
          }
        } catch (err) {
          console.error('Error checking active payments before admin set-pending:', err);
          // continue but log
        }
      }

      if (status) hireRecord.status = status; // allow other non accept/reject states
      if (subject) hireRecord.subject = subject;
      if (academic_level_id) hireRecord.academic_level_id = academic_level_id;
      hireRecord.updated_at = new Date();
      await student.save();
      return res.status(200).json({ success: true, message: 'Hire request updated', hireRecord });
    }

    // Find tutor profile referenced in the hire record
    const tutorProfile = await TutorProfile.findById(hireRecord.tutor);
    if (!tutorProfile) {
      return res.status(404).json({ message: 'Associated tutor profile not found' });
    }

    // If admin is attempting to reject, ensure the student does NOT have a valid active payment
    if (action === 'reject') {
      try {
        const now = new Date();
        const activePayment = await StudentPayment.findOne({
          student_id: student._id,
          tutor_id: tutorProfile._id,
          subject: hireRecord.subject,
          academic_level: hireRecord.academic_level_id,
          payment_status: 'paid',
          academic_level_paid: true,
          validity_status: 'active',
          validity_end_date: { $gt: now },
          sessions_remaining: { $gt: 0 }
        }).lean();

        if (activePayment) {
          return res.status(400).json({
            success: false,
            message: 'Cannot reject hire request: student has an active/paid package for this subject and level. ',
            links: {
              payments: [
                {
                  id: activePayment._id,
                  payment_status: activePayment.payment_status,
                  validity_status: activePayment.validity_status,
                  sessions_remaining: activePayment.sessions_remaining
                }
              ]
            }
          });
        }
      } catch (err) {
        console.error('Error checking active payments before admin reject:', err);
        // continue but log
      }
    }

    // Capture previous status
    const prevHireStatus = hireRecord.status;

    // Apply status update
    hireRecord.status = action === 'accept' ? 'accepted' : 'rejected';
    if (subject) hireRecord.subject = subject;
    if (academic_level_id) hireRecord.academic_level_id = academic_level_id;
    hireRecord.updated_at = new Date();

    await student.save();

    // If previously accepted and now rejected -> expire/cancel related payments
    if (prevHireStatus === 'accepted' && action === 'reject') {
      try {
        await StudentPayment.updateMany(
          {
            student_id: student._id,
            tutor_id: tutorProfile._id,
            subject: hireRecord.subject,
            academic_level: hireRecord.academic_level_id,
          },
          {
            $set: {
              academic_level_paid: false,
              is_active: false,
              validity_status: 'expired',
              payment_status: 'cancelled',
            },
          }
        );
      } catch (err) {
        console.error('Error updating payments after admin hire rejection:', err);
      }
    }

    // If accepted, create or mark a pending StudentPayment record
    if (action === 'accept') {
      try {
        const existingPayment = await StudentPayment.findOne({
          student_id: student._id,
          tutor_id: tutorProfile._id,
          subject: hireRecord.subject,
          academic_level: hireRecord.academic_level_id,
        });

        if (existingPayment) {
          try {
            await StudentPayment.findByIdAndUpdate(
              existingPayment._id,
              {
                $set: {
                  academic_level_paid: false,
                  is_active: true,
                  validity_status: 'pending',
                  payment_status: 'pending',
                  validity_start_date: new Date(),
                  validity_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                  request_date: new Date(),
                  sessions_remaining: existingPayment.total_sessions_per_month,
                },
              },
              { new: true }
            );
          } catch (uErr) {
            console.error('Error updating existing payment on admin hire accept:', uErr);
          }
        } else {
          const subjectData = await Subject.findById(hireRecord.subject);
          const academicLevelData = await EducationLevel.findById(hireRecord.academic_level_id);

          const tutorAcademicLevel = (tutorProfile.academic_levels_taught || []).find(
            (level) => String(level.educationLevel) === String(hireRecord.academic_level_id)
          );

          if (!tutorAcademicLevel) {
            console.error('Tutor academic level not found for payment creation (admin)');
          } else {
            const baseAmount = tutorAcademicLevel.hourlyRate || tutorProfile.hourly_rate || 25;
            const discount = tutorAcademicLevel.discount || 0;
            const totalSessions = tutorAcademicLevel.totalSessionsPerMonth || 1;

            const validityStartDate = new Date();
            const validityEndDate = new Date(
              validityStartDate.getTime() + 30 * 24 * 60 * 60 * 1000
            );

            const paymentRecord = new StudentPayment({
              student_id: student._id,
              tutor_id: tutorProfile._id,
              subject: hireRecord.subject,
              academic_level: hireRecord.academic_level_id,
              payment_type: 'monthly',
              base_amount: baseAmount,
              discount_percentage: discount,
              monthly_amount: tutorAcademicLevel.monthlyRate,
              validity_start_date: validityStartDate,
              validity_end_date: validityEndDate,
              sessions_remaining: tutorAcademicLevel.totalSessionsPerMonth,
              total_sessions_per_month: tutorAcademicLevel.totalSessionsPerMonth,
              payment_status: 'pending',
              request_notes: `Monthly package for ${subjectData?.name || 'Subject'} - ${academicLevelData?.level || 'Level'}. ${totalSessions} sessions per month.`,
              currency: 'GBP',
            });

            await paymentRecord.save();
          }
        }
      } catch (paymentError) {
        console.error('Error creating/updating payment record for admin accepted hire request:', paymentError);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Request ${action}ed successfully`,
      student_profile_id,
      hire_record_id: hireRecord._id,
      status: hireRecord.status,
    });
  } catch (err) {
    console.error('Error updating hire request:', err);
    return res.status(500).json({ success: false, message: 'Failed to update hire request', error: err.message });
  }
});

// Admin: Delete a specific hire request from a student's profile
exports.deleteHireRequest = asyncHandler(async (req, res) => {
  try {
    const { student_profile_id, hire_record_id } = req.params;

    if (!student_profile_id || !hire_record_id) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const student = await StudentProfile.findById(student_profile_id);
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const hireRecord = student.hired_tutors.id(hire_record_id);
    if (!hireRecord) return res.status(404).json({ message: 'Hire record not found' });

    // Allow deletion only if status is 'rejected' or 'pending'
    const currentStatus = hireRecord.status ? String(hireRecord.status).toLowerCase() : '';
    if (!['rejected', 'pending'].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete hire request unless status is 'rejected' or 'pending'. Current status: ${hireRecord.status}`,
      });
    }

    // Expire/cancel related StudentPayment records for this student/tutor/subject/level
    try {
      const updateResult = await StudentPayment.updateMany(
        {
          student_id: student._id,
          tutor_id: hireRecord.tutor,
          subject: hireRecord.subject,
          academic_level: hireRecord.academic_level_id,
        },
        {
          $set: {
            academic_level_paid: false,
            is_active: false,
            validity_status: 'expired',
            payment_status: 'cancelled',
          },
        }
      );

      // Remove hire record from student profile
      student.hired_tutors = (student.hired_tutors || []).filter(h => String(h._id) !== String(hire_record_id));
      await student.save();

      return res.status(200).json({
        success: true,
        message: 'Hire request deleted',
        hire_record_id,
        paymentsUpdated: updateResult?.modifiedCount ?? updateResult?.nModified ?? 0,
      });
    } catch (err) {
      console.error('Error cancelling payments during hire deletion:', err);
      // Still attempt removal even if payment update fails
      student.hired_tutors = (student.hired_tutors || []).filter(h => String(h._id) !== String(hire_record_id));
      await student.save();
      return res.status(200).json({
        success: true,
        message: 'Hire request deleted (payments update failed)',
        hire_record_id,
      });
    }
  } catch (err) {
    console.error('Error deleting hire request:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete hire request', error: err.message });
  }
});



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
    const studentProfile = await StudentProfile.findOne({ user_id: user_id });
    const parentProfile = await ParentProfile.findOne({ user_id: user_id });

    
    if (studentProfile) {
      studentProfile.profile_status = status;
      await studentProfile.save();
    }
    if (parentProfile) {
      parentProfile.profile_status = status;
      await parentProfile.save();
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



// Get dashboard statistics - OPTIMIZED VERSION

exports.getDashboardStats = async (req, res) => {

  try {
    // Calculate previous calendar month's start and end
    const now = new Date();
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const [
      tutors,
      students,
      parents,
      sessions,
      revenueAgg,
      lastMonthRevenueAgg,
    ] = await Promise.all([
      TutorProfile.aggregate([
        {
          $group: {
            _id: "$profile_status",
            count: { $sum: 1 }
          }
        }
      ]),
      StudentProfile.countDocuments(),
      ParentProfile.countDocuments(),
      TutoringSession.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      // Revenue: sum of paid StudentPayment amounts (prefer monthly_amount if present, otherwise base_amount)
      StudentPayment.aggregate([
        { $match: { payment_status: 'paid' } },
        { $group: { _id: null, total: { $sum: { $ifNull: ["$monthly_amount", "$base_amount"] } } } }
      ]),
      StudentPayment.aggregate([
        {
          $addFields: {
            effectivePaymentDate: { $ifNull: ["$payment_date", "$validity_start_date", "$createdAt"] }
          }
        },
        {
          $match: {
            payment_status: 'paid',
            effectivePaymentDate: { $gte: prevMonthStart, $lte: prevMonthEnd }
          }
        },
        { $group: { _id: null, total: { $sum: { $ifNull: ["$monthly_amount", "$base_amount"] } } } }
      ]),
    ]);

    const tutorStats = tutors.reduce((acc, t) => {
      acc[t._id] = t.count;
      return acc;
    }, {});

    const sessionStats = sessions.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {});
    // Get student and parent status counts
    const [studentStatusCounts, parentStatusCounts] = await Promise.all([
      StudentProfile.aggregate([
        {
          $group: {
            _id: "$profile_status",
            count: { $sum: 1 }
          }
        }
      ]),
      ParentProfile.aggregate([
        {
          $group: {
            _id: "$profile_status",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const studentStats = studentStatusCounts.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {});
    const parentStats = parentStatusCounts.reduce((acc, p) => {
      acc[p._id] = p.count;
      return acc;
    }, {});
    // Additional aggregated totals for dashboard
    // We'll fetch both total payment transactions and paid transactions
    const [hireReqAgg, paymentsTotalCount, paymentsPaidCount, assignmentsCount, assignmentSubmissionsCount, subjectsCount, academicLevelsCount, tutorReviewsCount] = await Promise.all([
      // totalHireRequests: count only accepted hired_tutors entries across StudentProfile
      StudentProfile.aggregate([
        { $unwind: { path: '$hired_tutors', preserveNullAndEmptyArrays: false } },
        { $match: { 'hired_tutors.status': 'accepted' } },
        { $count: 'count' },
      ]),
      // totalPayments: total transactions (all) and paid transactions
      StudentPayment.countDocuments({}),
      StudentPayment.countDocuments({ payment_status: 'paid' }),
      // totalAssignments: count assignment documents
      Assignment.countDocuments({}),
      // totalAssignmentSubmissions: count assignment submission documents
      AssignmentSubmission.countDocuments({}),
      // totalSubjects: count subject documents
      Subject.countDocuments({}),
      // totalAcademicLevels: count education levels
      EducationLevel.countDocuments({}),
      // totalTutorReviews: count tutor review documents
      TutorReview.countDocuments({}),
    ]);

    const totalHireRequests = (hireReqAgg && hireReqAgg.length > 0) ? hireReqAgg[0].count : 0;
    
    const stats = {
      tutors: {
        total: Object.values(tutorStats).reduce((sum, count) => sum + count, 0),
        inactive: tutorStats.rejected || 0,
        verified: tutorStats.approved || 0,
      },
      students: { 
        total: Object.values(studentStats).reduce((sum, count) => sum + count, 0),
        inactive: studentStats.inactive || 0 
      },
      parents: { 
        total: Object.values(parentStats).reduce((sum, count) => sum + count, 0),
        inactive: parentStats.inactive || 0 
      },
      sessions: {
        total: (sessionStats.completed || 0) + (sessionStats.pending || 0),
        completed: sessionStats.completed || 0,
        pending: sessionStats.pending || 0,
      },
      revenue: {
        total: revenueAgg[0]?.total || 0,
        lastMonth: lastMonthRevenueAgg[0]?.total || 0,
      },
      // appended totals
      totalHireRequests,
      totalPayments: {
        total: paymentsTotalCount,
        paid: paymentsPaidCount,
      },
      totalAssignments: assignmentsCount,
      totalAssignmentSubmissions: assignmentSubmissionsCount,
      totalSubjects: subjectsCount,
      totalAcademicLevels: academicLevelsCount,
      totalTutorReviews: tutorReviewsCount,
    };
   
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ message: "Failed to get dashboard statistics", error: err.message });
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

// Reject grouped documents (Background Check, Qualifications, References)
exports.rejectGroupedDocuments = async (req, res) => {
  const { user_id, group_type, reason } = req.body;

  try {
    const tutor = await TutorProfile.findOne({ user_id: user_id });
    if (!tutor) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    let documentTypes = [];
    let profileField = "";

    // Determine which documents to reject based on group type
    if (group_type === "background") {
      documentTypes = ["ID Proof", "Address Proof"];
      profileField = "is_background_checked";
    } else if (group_type === "qualifications") {
      documentTypes = ["Degree", "Certificate"];
      profileField = "is_qualification_verified";
    } else if (group_type === "references") {
      documentTypes = ["Reference Letter"];
      profileField = "is_reference_verified";
    } else {
      return res.status(400).json({ message: "Invalid group type" });
    }

    // Reject all documents in the group
    await TutorDocument.updateMany(
      {
        tutor_id: tutor._id,
        document_type: { $in: documentTypes }
      },
      {
        $set: {
          verification_status: "Rejected",
          notes: reason || "Documents rejected by admin"
        }
      }
    );

    // Update profile field to false
    tutor[profileField] = false;
    await tutor.save();

    res.status(200).json({ 
      message: `${group_type} documents rejected successfully`,
      rejectedDocuments: documentTypes
    });

  } catch (error) {
    console.error("Error rejecting grouped documents:", error);
    res.status(500).json({
      message: "Failed to reject documents",
      error: error.message
    });
  }
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

  const { level, description } = req.body;



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



  const newLevel = await EducationLevel.create({ level, description });



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

  const id = req.params.id;
  const level = await EducationLevel.findById(id);



  if (!level) {

    res.status(404);

    throw new Error("Education level not found");

  }



  // Check dependencies across the system
  const [
    subjectCount,
    tutorLevelCount,
    studentLevelCount,
    studentHireLevelCount,
    sessionLevelCount,
    paymentLevelCount,
  ] = await Promise.all([
    Subject.countDocuments({ level_id: id }),
    TutorProfile.countDocuments({ 'academic_levels_taught.educationLevel': id }),
    StudentProfile.countDocuments({ academic_level: id }),
    StudentProfile.countDocuments({ 'hired_tutors.academic_level_id': id }),
    TutoringSession.countDocuments({ academic_level: id }),
    StudentPayment.countDocuments({ academic_level: id }),
  ]);

  const dependencies = {
    subjects: subjectCount,
    tutors: tutorLevelCount,
    students: studentLevelCount,
    student_hires: studentHireLevelCount,
    sessions: sessionLevelCount,
    payments: paymentLevelCount,
  };

  const totalDeps = Object.values(dependencies).reduce((sum, v) => sum + v, 0);
  if (totalDeps > 0) {
    return res.status(400).json({
      success: false,
      message:
        'Cannot delete academic level. It is referenced by other records. Please remove or reassign those references first.',
      dependencies,
    });
  }

  await EducationLevel.findByIdAndDelete(id);

  res.status(200).json({

    success: true,

    message: "Education level deleted successfully",

  });

});



exports.updateEducationLevel = asyncHandler(async (req, res) => {

  const { level, description } = req.body;

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
  if (description !== undefined) existingLevel.description = description;

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

    description,

  } = req.body;

  const levelId = req.params.id;



  const existingLevel = await EducationLevel.findById(levelId);

  if (!existingLevel) {

    res.status(404);

    throw new Error("Education level not found");

  }



  if (hourlyRate !== undefined) existingLevel.hourlyRate = hourlyRate;

  if (totalSessionsPerMonth !== undefined) {
    // Get current min and max session values (either from request or existing values)
    const currentMinSession = minSession !== undefined ? minSession : existingLevel.minSession;
    const currentMaxSession = maxSession !== undefined ? maxSession : existingLevel.maxSession;
    
    // Validate that totalSessionsPerMonth is within min and max range
    if (currentMinSession !== undefined && currentMaxSession !== undefined) {
      if (totalSessionsPerMonth < currentMinSession || totalSessionsPerMonth > currentMaxSession) {
        res.status(400);
        throw new Error(`Total sessions per month (${totalSessionsPerMonth}) must be between minimum (${currentMinSession}) and maximum (${currentMaxSession}) sessions`);
      }
    }
    
    existingLevel.totalSessionsPerMonth = totalSessionsPerMonth;
  }

  if (discount !== undefined) existingLevel.discount = discount;

  if (isTutorCanChangeRate !== undefined)

    existingLevel.isTutorCanChangeRate = isTutorCanChangeRate;

  if (maxSession !== undefined) existingLevel.maxSession = maxSession;

  if (minSession !== undefined) existingLevel.minSession = minSession;

  if (description !== undefined) existingLevel.description = description;

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



  // Prevent duplicates: same name within the same education level

  const existingSubject = await Subject.findOne({

    name: name.trim(),

    level_id: level_id,

  });

  if (existingSubject) {

    return res.status(400).json({

      success: false,

      message: "Subject already have for this education level",

    });

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



  // Prevent duplicates on update too: same name within the same education level (exclude current)

  const duplicate = await Subject.findOne({

    name: name.trim(),

    level_id: level_id,

    _id: { $ne: subject._id },

  });

  if (duplicate) {

    return res.status(400).json({

      success: false,

      message: "Subject already have for this education level",

    });

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

  const id = req.params.id;
  const subject = await Subject.findById(id);



  if (!subject) {

    res.status(404);

    throw new Error("Subject not found");

  }



  // Dependency checks across system
  const [
    tutorCount,
    studentPrefCount,
    studentHireCount,
    sessionCount,
    paymentCount,
  ] = await Promise.all([
    TutorProfile.countDocuments({ subjects: id }),
    StudentProfile.countDocuments({ preferred_subjects: id }),
    StudentProfile.countDocuments({ 'hired_tutors.subject': id }),
    TutoringSession.countDocuments({ subject: id }),
    StudentPayment.countDocuments({ subject: id }),
  ]);

  const dependencies = {
    tutors: tutorCount,
    students_preferred: studentPrefCount,
    student_hires: studentHireCount,
    sessions: sessionCount,
    payments: paymentCount,
  };

  const totalDeps = Object.values(dependencies).reduce((sum, v) => sum + v, 0);
  if (totalDeps > 0) {
    return res.status(400).json({
      success: false,
      message:
        'Cannot delete subject. It is referenced by other records. Please remove or reassign those references first.',
      dependencies,
    });
  }

  await Subject.findByIdAndDelete(id);

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

  const id = req.params.id;
  const subjectType = await SubjectType.findById(id);



  if (!subjectType) {

    res.status(404);

    throw new Error("Subject type not found");

  }



  // Dependency checks: any subjects using this type?
  const subjectCount = await Subject.countDocuments({ subject_type: id });
  const dependencies = { subjects: subjectCount };
  const totalDeps = Object.values(dependencies).reduce((sum, v) => sum + v, 0);
  if (totalDeps > 0) {
    return res.status(400).json({
      success: false,
      message:
        'Cannot delete subject type. It is referenced by subjects. Please delete or reassign those subjects first.',
      dependencies,
    });
  }

  await subjectType.deleteOne();



  res.status(200).json({

    success: true,

    message: "Subject type deleted successfully",

  });

});



exports.fetchSubjectRelatedToAcademicLevels = asyncHandler(async (req, res) => {

  const { levels } = req.query; // e.g. "64f1a,64f2b,64f3c"



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


exports.getAllTutorSessions = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50, // Increased default limit for better performance
      tutor_id,
      status,
      start_date,
      end_date,
      search
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(200, Math.max(1, parseInt(limit, 10) || 50)); // Increased max limit
    const skip = (pageNum - 1) * lim;

    const query = {};

    if (tutor_id) {
      if (!mongoose.Types.ObjectId.isValid(tutor_id)) {
        return res.status(400).json({ success: false, message: 'Invalid tutor_id' });
      }
      query.tutor_id = new mongoose.Types.ObjectId(tutor_id);
    }

    if (status) {
      query.status = status;
    }

    if (start_date || end_date) {
      query.session_date = {};
      if (start_date) {
        const sd = new Date(start_date);
        if (isNaN(sd)) {
          return res.status(400).json({ success: false, message: 'Invalid start_date' });
        }
        query.session_date.$gte = sd;
      }
      if (end_date) {
        const ed = new Date(end_date);
        if (isNaN(ed)) {
          return res.status(400).json({ success: false, message: 'Invalid end_date' });
        }
        ed.setHours(23, 59, 59, 999);
        query.session_date.$lte = ed;
      }
    }

    // 🔎 Handle search by user full_name
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const matchedUsers = await User.find({ full_name: searchRegex }).select('_id').lean();
      const userIds = matchedUsers.map(u => u._id);

      const tutorIds = userIds.length
        ? (await TutorProfile.find({ user_id: { $in: userIds } }).select('_id').lean()).map(t => t._id)
        : [];

      const studentIds = userIds.length
        ? (await StudentProfile.find({ user_id: { $in: userIds } }).select('_id').lean()).map(s => s._id)
        : [];

      const or = [{ notes: searchRegex }];
      if (tutorIds.length) or.push({ tutor_id: { $in: tutorIds } });
      if (studentIds.length) or.push({ student_ids: { $in: studentIds } });

      query.$or = or;
    }

    // ✅ Optimized queries with minimal field selection for better performance
    const sessionsPromise = TutoringSession.find(query)
      .select('tutor_id student_ids subject academic_level session_date status duration_hours hourly_rate total_earnings rating student_ratings student_responses student_payments meeting_link notes createdAt updatedAt')
      .populate({
        path: 'tutor_id',
        select: 'user_id qualifications average_rating total_sessions experience_years location',
        populate: { path: 'user_id', select: 'full_name email photo_url' }
      })
      .populate({
        path: 'student_ids',
        select: 'user_id preferred_subjects',
        populate: { path: 'user_id', select: 'full_name email photo_url phone_number' }
      })
      .populate('subject', 'name')
      .populate('academic_level', 'level')
      .populate({
        path: 'student_payments.payment_id',
        model: 'StudentPayment',
        select: 'payment_type base_amount monthly_amount discount_percentage validity_start_date validity_end_date sessions_remaining payment_status payment_method payment_date currency'
      })
      .sort({ session_date: -1 })
      .skip(skip)
      .limit(lim)
      .lean();

    // Use estimated count for better performance
    const totalPromise = TutoringSession.estimatedDocumentCount();

    const [sessions, total] = await Promise.all([sessionsPromise, totalPromise]);

    // ✅ Format response
    const formattedSessions = await Promise.all(sessions.map(async session => {
      const tutorDetails = session.tutor_id?.user_id ? {
        _id: session.tutor_id._id,
        full_name: session.tutor_id.user_id.full_name,
        email: session.tutor_id.user_id.email,
        photo_url: session.tutor_id.user_id.photo_url ? await s3KeyToUrl(session.tutor_id.user_id.photo_url) : session.tutor_id.user_id.photo_url,
        qualifications: session.tutor_id.qualifications || [],
        average_rating: session.tutor_id.average_rating || 0,
        total_sessions: session.tutor_id.total_sessions || 0,
        experience_years: session.tutor_id.experience_years || 0,
        location: session.tutor_id.location || ''
      } : null;

      const studentDetails = await Promise.all((session.student_ids || []).map(async student => ({
        _id: student._id,
        full_name: student.user_id?.full_name || 'Unknown',
        email: student.user_id?.email || 'Unknown',
        photo_url: student.user_id?.photo_url ? await s3KeyToUrl(student.user_id.photo_url) : student.user_id?.photo_url || null,
        preferred_subjects: student.preferred_subjects || [],
        phone_number: student.user_id?.phone_number || ''
      })));

      const sessionDate = session.session_date ? new Date(session.session_date) : null;

      return {
        _id: session._id,
        session_title: sessionDate ? `Session on ${sessionDate.toLocaleDateString()}` : 'Session',
        description: session.notes || 'No description available',
        subject: session.subject?.name || 'Unknown',
        academic_level: session.academic_level?.level || 'Unknown',
        tutor: tutorDetails,
        students: studentDetails,
        status: session.status,
        session_date: session.session_date,
        session_time: sessionDate ? sessionDate.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'UTC'
        }) : null,
        duration: session.duration_hours,
        hourly_rate: session.hourly_rate,
        total_amount: session.total_earnings,
        rating: session.rating ?? null,
        student_ratings: session.student_ratings || [],
        student_responses: session.student_responses || [],
        // ✅ Full payment info (ready for frontend payment modal)
        student_payments: (session.student_payments || []).map(sp => ({
          student_id: sp.student_id,
          payment_id: sp.payment_id?._id || null,
          payment_type: sp.payment_id?.payment_type || null,
          base_amount: sp.payment_id?.base_amount || null,
          monthly_amount: sp.payment_id?.monthly_amount || null,
          discount_percentage: sp.payment_id?.discount_percentage || 0,
          validity_start_date: sp.payment_id?.validity_start_date || null,
          validity_end_date: sp.payment_id?.validity_end_date || null,
          sessions_remaining: sp.payment_id?.sessions_remaining || null,
          payment_status: sp.payment_id?.payment_status || null,
          validity_status: sp.payment_id?.getPaymentStatus ? sp.payment_id.getPaymentStatus() : (sp.payment_id?.validity_status || 'pending'),
          payment_method: sp.payment_id?.payment_method || null,
          payment_date: sp.payment_id?.payment_date || null,
          currency: sp.payment_id?.currency || 'GBP',
          
          // Renewal tracking
          is_renewal: sp.payment_id?.is_renewal || false,
          original_payment_id: sp.payment_id?.original_payment_id || null
        })),
        meeting_link: session.meeting_link || '',
        notes: session.notes || '',
        created_at: session.createdAt,
        updated_at: session.updatedAt
      };
    }));

    // ✅ Stats aggregation
    const statsAgg = await TutoringSession.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total_sessions: { $sum: 1 },
          total_revenue: { $sum: { $ifNull: ['$total_earnings', 0] } },
          avg_rating: { $avg: { $ifNull: ['$rating', null] } },
          completed_sessions: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          pending_sessions: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          cancelled_sessions: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
        }
      }
    ]);

    const summaryStats = statsAgg[0] || {
      total_sessions: 0,
      total_revenue: 0,
      avg_rating: null,
      completed_sessions: 0,
      pending_sessions: 0,
      cancelled_sessions: 0
    };

    res.status(200).json({
      success: true,
      data: formattedSessions,
      pagination: {
        current_page: pageNum,
        total_pages: total ? Math.ceil(total / lim) : 0,
        total_items: total,
        items_per_page: lim
      },
      stats: {
        total_sessions: summaryStats.total_sessions,
        total_revenue: summaryStats.total_revenue || 0,
        average_rating: summaryStats.avg_rating ? Math.round(summaryStats.avg_rating * 10) / 10 : 0,
        completed_sessions: summaryStats.completed_sessions,
        pending_sessions: summaryStats.pending_sessions,
        cancelled_sessions: summaryStats.cancelled_sessions
      }
    });
  } catch (error) {
    console.error('Error fetching tutor sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor sessions',
      error: error.message
    });
  }
});




exports.getAllChatsOfUsers = asyncHandler(async (req, res) => {

  // Fetch all messages and populate student and tutor details

  const messages = await Message.find()

    .populate("studentId", "full_name email photo_url") // Only include name and email of student

    .populate("tutorId", "full_name email photo_url") // Only include name and email of tutor

    .sort({ createdAt: -1 }); // Sort by latest first


  // Format the response data

  const formattedMessages = await Promise.all(messages.map(async (msg) => ({
    _id: msg._id,
    student: msg.studentId
      ? {
          id: msg.studentId._id,
          full_name: msg.studentId.full_name,
          email: msg.studentId.email,
          photo_url: msg.studentId.photo_url ? await s3KeyToUrl(msg.studentId.photo_url) : msg.studentId.photo_url,
        }
      : null, // or {} if you prefer empty object
    tutor: msg.tutorId
      ? {
          id: msg.tutorId._id,
          full_name: msg.tutorId.full_name,
          email: msg.tutorId.email,
          photo_url: msg.tutorId.photo_url ? await s3KeyToUrl(msg.tutorId.photo_url) : msg.tutorId.photo_url,
        }
      : null,
    message: msg.message,
    response: msg.response,
    status: msg.status,
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
  })));
  


  res.status(200).json({

    success: true,

    count: messages.length,

    data: formattedMessages,

  });

});

// controllers/adminPaymentController.js

exports.getAllTutorPayments = asyncHandler(async (req, res) => {
  try {
    // Optimized query with minimal field selection for better performance
    const payments = await StudentPayment.find()
      .select('student_id tutor_id subject academic_level payment_type base_amount monthly_amount discount_percentage payment_status validity_status payment_method payment_date validity_start_date validity_end_date sessions_remaining createdAt is_renewal original_payment_id')
      .populate({
        path: "student_id",
        select: "user_id",
        populate: {
          path: "user_id",
          select: "full_name email photo_url"
        }
      })
      .populate({
        path: "tutor_id",
        select: "user_id",
        populate: {
          path: "user_id",
          select: "full_name email photo_url"
        }
      })
      .populate("subject", "name") // subject name
      .populate("academic_level", "level") // education level name
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    // ✅ Transform the data for admin dashboard
    const formattedPayments = await Promise.all(payments.map(async p => ({
      payment_id: p._id,
      student_name: p.student_id?.user_id?.full_name || "Unknown",
      student_email: p.student_id?.user_id?.email || "",
      tutor_name: p.tutor_id?.user_id?.full_name || "Unknown",
      stphoto_url: p.student_id?.user_id?.photo_url ? await s3KeyToUrl(p.student_id.user_id.photo_url) : p.student_id?.user_id?.photo_url,
      tutor_email: p.tutor_id?.user_id?.email || "",
      tphoto_url: p.tutor_id?.user_id?.photo_url ? await s3KeyToUrl(p.tutor_id.user_id.photo_url) : p.tutor_id?.user_id?.photo_url,
      subject: p.subject?.name || "N/A",
      academic_level: p.academic_level?.level || "N/A",
      payment_type: p.payment_type,
      base_amount: p.base_amount,
      discount: p.discount_percentage,
      final_amount: p.monthly_amount || p.base_amount, // adjust depending on type
      payment_status: p.payment_status,
      validity_status: p.validity_status,
      payment_method: p.payment_method,
      payment_date: p.payment_date,
      validity_start_date: p.validity_start_date,
      validity_end_date: p.validity_end_date,
      sessions_remaining: p.sessions_remaining,
      createdAt: p.createdAt,
      
      // Renewal tracking
      is_renewal: p.is_renewal || false,
      original_payment_id: p.original_payment_id || null
    })));
    res.status(200).json({ success: true, payments: formattedPayments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update a tutor payment by ID (admin)
exports.updateTutorPayment = asyncHandler(async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ success: false, message: 'Invalid paymentId' });
    }

    const allowedFields = [
      'payment_status',
      'validity_status',
      'base_amount',
      'sessions_remaining',
      'payment_method',
      'payment_type',
      'validity_start_date',
      'validity_end_date',
      'is_active'
    ];

    const updates = {};
    Object.keys(req.body || {}).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Parse dates if provided
    if (updates.validity_start_date) updates.validity_start_date = new Date(updates.validity_start_date);
    if (updates.validity_end_date) updates.validity_end_date = new Date(updates.validity_end_date);
    if (typeof updates.base_amount !== 'undefined') updates.base_amount = Number(updates.base_amount);
    if (typeof updates.sessions_remaining !== 'undefined') updates.sessions_remaining = Number(updates.sessions_remaining);

    // Before updating, check whether this payment is linked to any tutoring sessions or used as an original_payment (renewal)
    const linkedSessions = await TutoringSession.find({ 'student_payments.payment_id': paymentId })
      .select('_id session_date tutor_id status')
      .lean();

    const linkedRenewals = await StudentPayment.find({ original_payment_id: paymentId })
      .select('_id student_id tutor_id payment_status')
      .lean();

    if ((linkedSessions && linkedSessions.length > 0) || (linkedRenewals && linkedRenewals.length > 0)) {
      // Build a helpful response listing where the payment is linked
      const links = {};
      if (linkedSessions && linkedSessions.length > 0) {
        links.sessions = linkedSessions.map(s => ({ id: s._id, session_date: s.session_date, tutor_id: s.tutor_id, status: s.status }));
      }
      if (linkedRenewals && linkedRenewals.length > 0) {
        links.renewals = linkedRenewals.map(r => ({ id: r._id, student_id: r.student_id, tutor_id: r.tutor_id, payment_status: r.payment_status }));
      }

      return res.status(400).json({
        success: false,
        message: 'Payment is linked to other records and cannot be updated. See links for details.',
        links
      });
    }

    const updated = await StudentPayment.findByIdAndUpdate(paymentId, { $set: updates }, { new: true }).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.status(200).json({ success: true, payment: updated });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete a tutor payment by ID (admin)
exports.deleteTutorPayment = asyncHandler(async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ success: false, message: 'Invalid paymentId' });
    }

    // First load the payment so we can check contextual dependencies (student, tutor, subject, level)
    const payment = await StudentPayment.findById(paymentId).lean();
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Check references before deleting
    const linkedSessions = await TutoringSession.find({ 'student_payments.payment_id': paymentId })
      .select('_id session_date tutor_id status')
      .lean();

    const linkedRenewals = await StudentPayment.find({ original_payment_id: paymentId })
      .select('_id student_id tutor_id payment_status')
      .lean();

    // Additional: check whether the student has a hire request for this tutor / subject / academic level
    // Hire requests are stored on StudentProfile.hired_tutors
    let hireConflicts = [];
    try {
      if (payment.student_id) {
        const studentProfile = await StudentProfile.findOne({_id: payment.student_id }).select('hired_tutors').lean();
        if (studentProfile && Array.isArray(studentProfile.hired_tutors)) {
          // Match tutor, subject and academic level
          hireConflicts = studentProfile.hired_tutors.filter(ht => {
            try {
              const sameTutor = ht.tutor && String(ht.tutor) === String(payment.tutor_id);
              const sameSubject = ht.subject && payment.subject && String(ht.subject) === String(payment.subject);
              const sameLevel = ht.academic_level_id && payment.academic_level && String(ht.academic_level_id) === String(payment.academic_level);
              // Consider active/pending/accepted requests as blocking (not rejected)
              const blockingStatus = ht.status && ['pending', 'accepted'].includes(String(ht.status));
              return sameTutor && sameSubject && sameLevel && blockingStatus;
            } catch (e) {
              return false;
            }
          });
        }
      }
    } catch (e) {
      // Swallow profile lookup errors but keep going with other checks
      console.error('Error checking hire requests for payment delete:', e);
    }

    if ((linkedSessions && linkedSessions.length > 0) || (linkedRenewals && linkedRenewals.length > 0) || (hireConflicts && hireConflicts.length > 0)) {
      const links = {};
      if (linkedSessions && linkedSessions.length > 0) {
        links.sessions = linkedSessions.map(s => ({ id: s._id, session_date: s.session_date, tutor_id: s.tutor_id, status: s.status }));
      }
      if (linkedRenewals && linkedRenewals.length > 0) {
        links.renewals = linkedRenewals.map(r => ({ id: r._id, student_id: r.student_id, tutor_id: r.tutor_id, payment_status: r.payment_status }));
      }
      if (hireConflicts && hireConflicts.length > 0) {
        try {
          // Resolve subject names and academic level names in batch to avoid per-item queries
          const subjectIds = [...new Set(hireConflicts.map(h => h.subject).filter(Boolean).map(String))];
          const levelIds = [...new Set(hireConflicts.map(h => h.academic_level_id).filter(Boolean).map(String))];

          const [subjectDocs, levelDocs] = await Promise.all([
            subjectIds.length ? Subject.find({ _id: { $in: subjectIds } }).select('name').lean() : [],
            levelIds.length ? EducationLevel.find({ _id: { $in: levelIds } }).select('level').lean() : []
          ]);

          const subjectMap = {};
          (subjectDocs || []).forEach(s => { subjectMap[String(s._id)] = s.name; });
          const levelMap = {};
          (levelDocs || []).forEach(l => { levelMap[String(l._id)] = l.level; });

          links.hireRequests = hireConflicts.map(h => ({
            tutor: h.tutor,
            subject_id: h.subject || null,
            subject_name: subjectMap[String(h.subject)] || null,
            academic_level_id: h.academic_level_id || null,
            academic_level_name: levelMap[String(h.academic_level_id)] || null,
            status: h.status,
            hired_at: h.hired_at
          }));
        } catch (e) {
          // Fallback to original minimal info if lookup fails
          console.error('Error resolving subject/level names for hireConflicts:', e);
          links.hireRequests = hireConflicts.map(h => ({ tutor: h.tutor, subject: h.subject, academic_level_id: h.academic_level_id, status: h.status, hired_at: h.hired_at }));
        }
      }

      return res.status(400).json({
        success: false,
        message: 'Payment is linked to other records and cannot be deleted. Resolve related hire requests/sessions/renewals first. See links for details.',
        links
      });
    }

    const deleted = await StudentPayment.findByIdAndDelete(paymentId).lean();
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.status(200).json({ success: true, message: 'Payment deleted', paymentId: deleted._id });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update a tutoring session by ID (admin)
exports.updateTutorSession = asyncHandler(async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ success: false, message: 'Invalid sessionId' });
    }

    const session = await TutoringSession.findById(sessionId).lean();
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    // Block edits if session is currently in progress
    if (session.status === 'in_progress') {
      return res.status(400).json({ success: false, message: 'Session is currently in progress and cannot be edited.' });
    }

    const allowedFields = [
      'status',
      'notes',
      'meeting_link',
      'session_date',
      'duration_hours',
      'hourly_rate',
      'total_earnings'
    ];

    const updates = {};
    Object.keys(req.body || {}).forEach(key => {
      if (allowedFields.includes(key)) updates[key] = req.body[key];
    });

    if (updates.session_date) updates.session_date = new Date(updates.session_date);
    if (typeof updates.duration_hours !== 'undefined') updates.duration_hours = Number(updates.duration_hours);
    if (typeof updates.hourly_rate !== 'undefined') updates.hourly_rate = Number(updates.hourly_rate);
    if (typeof updates.total_earnings !== 'undefined') updates.total_earnings = Number(updates.total_earnings);

    const updated = await TutoringSession.findByIdAndUpdate(sessionId, { $set: updates }, { new: true }).lean();
    return res.status(200).json({ success: true, session: updated });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete a tutoring session by ID (admin)
exports.deleteTutorSession = asyncHandler(async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ success: false, message: 'Invalid sessionId' });
    }

    const session = await TutoringSession.findById(sessionId).lean();
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    // Block deletes if session is in progress
    if (session.status === 'in_progress') {
      return res.status(400).json({ success: false, message: 'Session is currently in progress and cannot be deleted.' });
    }

    // If session references payments, return links instead of deleting
    const paymentIds = (session.student_payments || []).map(sp => sp.payment_id).filter(Boolean);
    let linkedPayments = [];
    if (paymentIds.length > 0) {
      linkedPayments = await StudentPayment.find({ _id: { $in: paymentIds } }).select('_id student_id tutor_id payment_status').lean();
    }

    if (linkedPayments.length > 0) {
      return res.status(400).json({ success: false, message: 'Session references payments and cannot be deleted. See links for details.', links: { payments: linkedPayments } });
    }

    const deleted = await TutoringSession.findByIdAndDelete(sessionId).lean();
    if (!deleted) return res.status(404).json({ success: false, message: 'Session not found' });
    return res.status(200).json({ success: true, message: 'Session deleted', sessionId: deleted._id });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all tutor reviews for admin
exports.getAllTutorReviews = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 50, tutor_id, search } = req.query; // Increased default limit from 20 to 50
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(200, Math.max(1, parseInt(limit, 10) || 50)); // Increased max limit to 200
    const skip = (pageNum - 1) * lim;

    let query = {};
    
    // Filter by tutor if specified
    if (tutor_id) {
      if (!mongoose.Types.ObjectId.isValid(tutor_id)) {
        return res.status(400).json({ success: false, message: 'Invalid tutor_id' });
      }
      query.tutor_id = new mongoose.Types.ObjectId(tutor_id);
    }

    // Fast search by student name or tutor name using aggregation
    if (search && search.trim()) {
      const searchTerm = search.trim();
      const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Use aggregation pipeline for faster search
      const searchPipeline = [
        // Lookup student profiles and their users
        {
          $lookup: {
            from: 'studentprofiles',
            localField: 'student_id',
            foreignField: '_id',
            as: 'student_profile',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'user_id',
                  foreignField: '_id',
                  as: 'user',
                  pipeline: [
                    {
                      $match: {
                        full_name: { $regex: escapedSearchTerm, $options: 'i' }
                      }
                    }
                  ]
                }
              },
              {
                $match: {
                  'user.0': { $exists: true }
                }
              }
            ]
          }
        },
        // Lookup tutor profiles and their users
        {
          $lookup: {
            from: 'tutorprofiles',
            localField: 'tutor_id',
            foreignField: '_id',
            as: 'tutor_profile',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'user_id',
                  foreignField: '_id',
                  as: 'user',
                  pipeline: [
                    {
                      $match: {
                        full_name: { $regex: escapedSearchTerm, $options: 'i' }
                      }
                    }
                  ]
                }
              },
              {
                $match: {
                  'user.0': { $exists: true }
                }
              }
            ]
          }
        },
        // Match reviews where either student or tutor matches
        {
          $match: {
            $or: [
              { 'student_profile.0': { $exists: true } },
              { 'tutor_profile.0': { $exists: true } }
            ]
          }
        },
        // Project only the fields we need
        {
          $project: {
            tutor_id: 1,
            student_id: 1,
            parent_id: 1,
            rating: 1,
            review_text: 1,
            review_type: 1,
            created_at: 1,
            updated_at: 1
          }
        }
      ];

      // Execute the search pipeline
      const searchResults = await TutorReview.aggregate(searchPipeline);
      
      if (searchResults.length === 0) {
          return res.status(200).json({
            success: true,
            reviews: [],
            pagination: {
              current_page: pageNum,
              total_pages: 0,
              total_reviews: 0,
              has_next: false,
              has_prev: false
            }
          });
        }

      // Get the IDs of matching reviews
      const matchingReviewIds = searchResults.map(r => r._id);
      query._id = { $in: matchingReviewIds };
    }

    // Fetch reviews with optimized populated data
    const reviewsPromise = TutorReview.find(query)
      .select('tutor_id student_id parent_id rating review_text review_type created_at updated_at')
      .populate({
        path: 'tutor_id',
        select: 'user_id average_rating',
        populate: {
          path: 'user_id',
          select: 'full_name email photo_url'
        }
      })
      .populate({
        path: 'student_id',
        select: 'user_id',
        populate: {
          path: 'user_id',
          select: 'full_name email photo_url'
        }
      })
      .populate({
        path: 'parent_id',
        select: 'user_id',
        populate: {
          path: 'user_id',
          select: 'full_name email photo_url'
        }
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(lim)
      .lean();

    // Use estimatedDocumentCount for faster total count
    const totalPromise = TutorReview.estimatedDocumentCount(query);

    const [reviews, total] = await Promise.all([reviewsPromise, totalPromise]);

    // Format the response
    const formattedReviews = await Promise.all(reviews.map(async review => {
      const isStudentReview = review.student_id && review.review_type === 'student';
      const isParentReview = review.parent_id && review.review_type === 'parent';
      
      return {
        _id: review._id,
        rating: review.rating,
        review_text: review.review_text,
        review_type: review.review_type || 'student', // Default to student for backward compatibility
        tutor: {
          _id: review.tutor_id?._id,
          name: review.tutor_id?.user_id?.full_name || 'Unknown',
          email: review.tutor_id?.user_id?.email || '',
          photo_url: review.tutor_id?.user_id?.photo_url ? await s3KeyToUrl(review.tutor_id.user_id.photo_url) : review.tutor_id?.user_id?.photo_url || '',
          average_rating: review.tutor_id?.average_rating || 0
        },
        reviewer: {
          type: isStudentReview ? 'student' : isParentReview ? 'parent' : 'unknown',
          name: isStudentReview 
            ? (review.student_id?.user_id?.full_name || 'Anonymous Student')
            : isParentReview 
            ? (review.parent_id?.user_id?.full_name || 'Anonymous Parent')
            : 'Anonymous',
          email: isStudentReview 
            ? (review.student_id?.user_id?.email || '')
            : isParentReview 
            ? (review.parent_id?.user_id?.email || '')
            : '',
          photo_url: isStudentReview 
            ? (review.student_id?.user_id?.photo_url ? await s3KeyToUrl(review.student_id.user_id.photo_url) : review.student_id?.user_id?.photo_url || '')
            : isParentReview 
            ? (review.parent_id?.user_id?.photo_url ? await s3KeyToUrl(review.parent_id.user_id.photo_url) : review.parent_id?.user_id?.photo_url || '')
            : '',
          id: isStudentReview 
            ? review.student_id?._id 
            : isParentReview 
            ? review.parent_id?._id 
            : null
        },
        // Keep backward compatibility
        student: {
          _id: review.student_id?._id,
          name: review.student_id?.user_id?.full_name || 'Anonymous',
          email: review.student_id?.user_id?.email || '',
          photo_url: review.student_id?.user_id?.photo_url ? await s3KeyToUrl(review.student_id.user_id.photo_url) : review.student_id?.user_id?.photo_url || ''
        },
        created_at: review.created_at,
        updated_at: review.updated_at
      };
    }));

    res.status(200).json({
      success: true,
      reviews: formattedReviews,
      pagination: {
        current_page: pageNum,
        total_pages: total ? Math.ceil(total / lim) : 0,
        total_reviews: total,
        has_next: skip + lim < total,
        has_prev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching tutor reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor reviews',
      error: error.message
    });
  }
});

// Admin: delete a tutor review
exports.deleteTutorReview = asyncHandler(async (req, res) => {
  try {
    const { review_id } = req.params;
    if (!review_id || !mongoose.Types.ObjectId.isValid(review_id)) {
      return res.status(400).json({ success: false, message: 'Invalid review id' });
    }

    const review = await TutorReview.findById(review_id).lean();
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    // Remove the review
    await TutorReview.deleteOne({ _id: review_id });

    // Optionally, you may want to update the tutor's average rating/count here.
    // We'll attempt a safe recalculation: compute average from remaining reviews
    try {
      const agg = await TutorReview.aggregate([
        { $match: { tutor_id: review.tutor_id } },
        { $group: { _id: '$tutor_id', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);
      if (agg && agg.length > 0) {
        const avg = agg[0].avgRating || 0;
        const count = agg[0].count || 0;
        await TutorProfile.findByIdAndUpdate(review.tutor_id, { average_rating: avg, review_count: count }).catch(() => {});
      } else {
        // No reviews left
        await TutorProfile.findByIdAndUpdate(review.tutor_id, { average_rating: 0, review_count: 0 }).catch(() => {});
      }
    } catch (err) {
      // Non-fatal
      console.error('Failed to recalc tutor rating after review delete:', err && err.message);
    }

    return res.status(200).json({ success: true, message: 'Review deleted', review_id });
  } catch (error) {
    console.error('Error deleting tutor review:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete review', error: error.message });
  }
});

// Get all hire requests with student-tutor matching and status
exports.getAllHireRequests = asyncHandler(async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status = '', 
      search = '',
      tutor_id = '',
      student_id = ''
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * lim;

    // Build base aggregation pipeline for efficient querying (shared by list, count, and stats)
    const basePipeline = [
      // Match students with hire requests
      {
        $match: {
          'hired_tutors.0': { $exists: true } // Students with at least one hire request
        }
      },
      // Unwind hired_tutors to get individual requests
      {
        $unwind: '$hired_tutors'
      },
      // Add filters
      ...(status ? [{ $match: { 'hired_tutors.status': status } }] : []),
      ...(tutor_id ? [{ $match: { 'hired_tutors.tutor': new mongoose.Types.ObjectId(tutor_id) } }] : []),
      ...(student_id ? [{ $match: { 'user_id': new mongoose.Types.ObjectId(student_id) } }] : []),
      // Lookup student user info
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'student_user',
          pipeline: [
            { $project: { full_name: 1, email: 1, phone_number: 1, photo_url: 1 } }
          ]
        }
      },
      // Lookup tutor profile and user info
      {
        $lookup: {
          from: 'tutorprofiles',
          localField: 'hired_tutors.tutor',
          foreignField: '_id',
          as: 'tutor_profile',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'tutor_user',
                pipeline: [
                  { $project: { full_name: 1, email: 1, phone_number: 1, photo_url: 1 } }
                ]
              }
            },
            { $project: { user_id: 1, tutor_user: 1, subjects: 1, academic_levels_taught: 1 } }
          ]
        }
      },
      // Lookup subject info
      {
        $lookup: {
          from: 'subjects',
          localField: 'hired_tutors.subject',
          foreignField: '_id',
          as: 'subject_info',
          pipeline: [
            { $project: { name: 1 } }
          ]
        }
      },
      // Lookup academic level info
      {
        $lookup: {
          from: 'educationlevels',
          localField: 'hired_tutors.academic_level_id',
          foreignField: '_id',
          as: 'academic_level_info',
          pipeline: [
            { $project: { level: 1 } }
          ]
        }
      },
      // Project final structure
      {
        $project: {
          _id: 1,
          hire_record_id: '$hired_tutors._id',
          hire_for_this_tutor: '$hired_tutors',
          student: {
            id: '$user_id',
            name: { $arrayElemAt: ['$student_user.full_name', 0] },
            email: { $arrayElemAt: ['$student_user.email', 0] },
            phone: { $arrayElemAt: ['$student_user.phone_number', 0] },
            photo_url: { $arrayElemAt: ['$student_user.photo_url', 0] }
          },
          tutor: {
            id: '$hired_tutors.tutor',
            name: { $arrayElemAt: [ { $arrayElemAt: ['$tutor_profile.tutor_user.full_name', 0] }, 0 ] },
            email: { $arrayElemAt: [ { $arrayElemAt: ['$tutor_profile.tutor_user.email', 0] }, 0 ] },
            phone: { $arrayElemAt: [ { $arrayElemAt: ['$tutor_profile.tutor_user.phone_number', 0] }, 0 ] },
            photo_url: { $arrayElemAt: [ { $arrayElemAt: ['$tutor_profile.tutor_user.photo_url', 0] }, 0 ] }
          },
          subject: {
            id: '$hired_tutors.subject',
            name: { $arrayElemAt: ['$subject_info.name', 0] }
          },
          academic_level: {
            id: '$hired_tutors.academic_level_id',
            level: { $arrayElemAt: ['$academic_level_info.level', 0] }
          },
          status: '$hired_tutors.status',
          hired_at: '$hired_tutors.hired_at',
          created_at: '$createdAt',
          updated_at: '$updatedAt'
        }
      },
      // Add search filter if provided
      ...(search ? [{
        $match: {
          $or: [
            { 'student.name': { $regex: search, $options: 'i' } },
            { 'student.email': { $regex: search, $options: 'i' } },
            { 'tutor.name': { $regex: search, $options: 'i' } },
            { 'tutor.email': { $regex: search, $options: 'i' } },
            { 'subject.name': { $regex: search, $options: 'i' } },
            { 'academic_level.level': { $regex: search, $options: 'i' } }
          ]
        }
      }] : [])
    ];

    // Get total count for pagination (use base pipeline without pagination or sort)
    const countResult = await StudentProfile.aggregate([
      ...basePipeline,
      { $count: 'total' }
    ]);
    const total = countResult[0]?.total || 0;

    // Build list pipeline by adding sort and pagination
    const listPipeline = [
      ...basePipeline,
      { $sort: { hired_at: -1 } },
      { $skip: skip },
      { $limit: lim }
    ];

    // Execute aggregation
    const hireRequests = await StudentProfile.aggregate(listPipeline);

    // Resolve S3 photo URLs for student and tutor images
    const resolvedHireRequests = await Promise.all(hireRequests.map(async (req) => {
      let resolvedStudentPhoto = req?.student?.photo_url || '';
      let resolvedTutorPhoto = req?.tutor?.photo_url || '';
      try {
        if (resolvedStudentPhoto && !resolvedStudentPhoto.startsWith('http')) {
          const url = await s3KeyToUrl(resolvedStudentPhoto);
          if (url) resolvedStudentPhoto = url;
        }
      } catch (_) {}
      try {
        if (resolvedTutorPhoto && !resolvedTutorPhoto.startsWith('http')) {
          const url = await s3KeyToUrl(resolvedTutorPhoto);
          if (url) resolvedTutorPhoto = url;
        }
      } catch (_) {}
      return {
        ...req,
        student: {
          ...req.student,
          photo_url: resolvedStudentPhoto
        },
        tutor: {
          ...req.tutor,
          photo_url: resolvedTutorPhoto
        }
      };
    }));

    // Calculate stats using the SAME base filters/search as the list
    const statsResult = await StudentProfile.aggregate([
      ...basePipeline,
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    const stats = {
      total: total,
      pending: statsResult.find(s => s._id === 'pending')?.count || 0,
      accepted: statsResult.find(s => s._id === 'accepted')?.count || 0,
      rejected: statsResult.find(s => s._id === 'rejected')?.count || 0
    };

    console.log("resolvedHireRequests", resolvedHireRequests);

    res.status(200).json({
      success: true,
      hireRequests: resolvedHireRequests,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(total / lim),
        total_items: total,
        items_per_page: lim,
        has_next: skip + lim < total,
        has_prev: pageNum > 1
      },
      stats: stats
    });

  } catch (error) {
    console.error('Error fetching hire requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hire requests',
      error: error.message
    });
  }
});

// Admin: Update parent details (basic user fields and optional location in profile)
exports.updateParentByAdmin = asyncHandler(async (req, res) => {
  try {
    const { user_id } = req.params;
    const { name, email, phone, location } = req.body || {};

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update basic user fields
    if (typeof name === 'string') user.full_name = name;
    if (typeof email === 'string') user.email = email;
    if (typeof phone === 'string') user.phone_number = phone;

    // Update parent profile location if provided
    if (typeof location === 'string') {
      const parent = await ParentProfile.findOne({ user_id });
      if (parent) {
        parent.location = location;
        await parent.save();
      }
    }

    await user.save();
    return res.status(200).json({ success: true, message: 'Parent updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update parent', error: error.message });
  }
});

// Admin: Update student details and education (academic level, subjects)
exports.updateStudentByAdmin = asyncHandler(async (req, res) => {
  try {
    const { user_id } = req.params;
    const { name, email, phone, location, academic_level, subjects } = req.body || {};

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const student = await StudentProfile.findOne({ user_id });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    if (typeof name === 'string') user.full_name = name;
    if (typeof email === 'string') user.email = email;
    if (typeof phone === 'string') user.phone_number = phone;
    if (typeof location === 'string') student.location = location;

    // Dependency checks if level/subjects change
    const prevLevel = student.academic_level ? String(student.academic_level) : null;
    const prevSubjects = Array.isArray(student.preferred_subjects) ? student.preferred_subjects.map(String) : [];
    const nextLevel = academic_level ? String(academic_level) : prevLevel;
    const nextSubjectsRaw = Array.isArray(subjects) ? subjects.map(String) : prevSubjects;

    // Filter submitted subjects to the selected level
    let nextSubjects = nextSubjectsRaw;
    if (academic_level) {
      const subjectDocs = await Subject.find({ _id: { $in: nextSubjectsRaw } }).select('_id level_id').lean();
      nextSubjects = subjectDocs
        .filter((sd) => sd.level_id && String(sd.level_id) === String(nextLevel))
        .map((sd) => String(sd._id));
    }

    // Subjects being removed
    const removedSubjects = prevSubjects.filter((s) => !new Set(nextSubjects).has(String(s)));
    const levelChanged = prevLevel && nextLevel && prevLevel !== nextLevel;

    if (levelChanged || removedSubjects.length > 0) {
      const studentProfile = await StudentProfile.findOne({ user_id }).select('_id hired_tutors').lean();
      const studentId = studentProfile?._id;
      const deps = {};
      if (levelChanged) {
        deps.sessionsWithPrevLevel = await TutoringSession.countDocuments({ student_ids: studentId, academic_level: prevLevel });
        deps.paymentsWithPrevLevel = await StudentPayment.countDocuments({ student_id: studentId, academic_level: prevLevel });
        deps.hiresWithPrevLevel = Array.isArray(studentProfile?.hired_tutors)
          ? studentProfile.hired_tutors.filter((h) => String(h.academic_level_id) === String(prevLevel)).length
          : 0;
      }
      if (removedSubjects.length > 0) {
        deps.sessionsWithRemovedSubjects = await TutoringSession.countDocuments({ student_ids: studentId, subject: { $in: removedSubjects } });
        deps.paymentsWithRemovedSubjects = await StudentPayment.countDocuments({ student_id: studentId, subject: { $in: removedSubjects } });
        deps.hiresWithRemovedSubjects = Array.isArray(studentProfile?.hired_tutors)
          ? studentProfile.hired_tutors.filter((h) => removedSubjects.map(String).includes(String(h.subject))).length
          : 0;
      }
      const total = Object.values(deps).reduce((a, b) => a + (b || 0), 0);
      if (total > 0) {
        return res.status(400).json({ success: false, message: 'Dependencies exist for previous academic level/subjects. Please resolve before updating.', dependencies: deps });
      }
    }

    if (academic_level) student.academic_level = nextLevel;
    if (Array.isArray(subjects)) student.preferred_subjects = nextSubjects;

    await Promise.all([user.save(), student.save()]);
    return res.status(200).json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update student', error: error.message });
  }
});

// Admin: Remove a single academic level and prune subjects not matching remaining levels
exports.removeTutorLevelByAdmin = asyncHandler(async (req, res) => {
  try {
    const { user_id, level_id } = req.params;

    console.log("level_id", req.params);
    if (!user_id || !level_id) {
      return res.status(400).json({ success: false, message: 'user_id and level_id are required' });
    }

    const tutor = await TutorProfile.findOne({ user_id });
    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor profile not found' });
    }

    // Dependency checks before removal
    const deps = {};
    deps.sessions = await TutoringSession.countDocuments({ tutor_id: tutor._id, academic_level: level_id });
    deps.payments = await StudentPayment.countDocuments({ tutor_id: tutor._id, academic_level: level_id });
    deps.hires = await StudentProfile.countDocuments({ 'hired_tutors.tutor': tutor._id, 'hired_tutors.academic_level_id': level_id });
    const totalDeps = (deps.sessions || 0) + (deps.payments || 0) + (deps.hires || 0);
    if (totalDeps > 0) {
      return res.status(400).json({ success: false, message: 'Cannot remove academic level due to existing dependencies', dependencies: deps });
    }

    const beforeCount = Array.isArray(tutor.academic_levels_taught) ? tutor.academic_levels_taught.length : 0;
    tutor.academic_levels_taught = (tutor.academic_levels_taught || []).filter((entry) => {
      const id = entry?.educationLevel && entry.educationLevel._id ? String(entry.educationLevel._id) : String(entry?.educationLevel);
      return id !== String(level_id);
    });
    const afterCount = tutor.academic_levels_taught.length;

    // Prune subjects that belong to the removed level by keeping only those in remaining levels
    const remainingLevelIds = new Set(
      (tutor.academic_levels_taught || []).map((e) => String(e.educationLevel && e.educationLevel._id ? e.educationLevel._id : e.educationLevel))
    );
    if (Array.isArray(tutor.subjects) && tutor.subjects.length > 0) {
      const subjectDocs = await Subject.find({ _id: { $in: tutor.subjects } }).select('_id level_id').lean();
      const pruned = subjectDocs.filter((sd) => sd.level_id && remainingLevelIds.has(String(sd.level_id))).map((sd) => sd._id);
      tutor.subjects = pruned;
    }

    await tutor.save();
    if (beforeCount === afterCount) {
      return res.status(404).json({ success: false, message: 'Level not found in tutor profile' });
    }

    return res.status(200).json({ success: true, message: 'Academic level removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove academic level', error: error.message });
  }
});

// Admin: Update tutor details and/or education (levels, subjects)
exports.updateTutorByAdmin = asyncHandler(async (req, res) => {
  try {
    const { user_id } = req.params;
    const {
      name,
      email,
      phone,
      location,
      experience_years,
      bio,
      qualifications,
      academic_levels_taught,
      subjects
    } = req.body || {};
console.log("req.body", req.body);
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const tutor = await TutorProfile.findOne({ user_id });
    if (!tutor) {
      return res.status(404).json({ success: false, message: "Tutor profile not found" });
    }

    // Update basic user fields
    if (typeof name === 'string') user.full_name = name;
    if (typeof email === 'string') user.email = email;
    if (typeof phone === 'string') user.phone_number = phone;

    // Update tutor profile fields
    if (typeof location === 'string') tutor.location = location;
    if (typeof experience_years !== 'undefined') {
      const exp = Number(experience_years);
      tutor.experience_years = Number.isNaN(exp) ? tutor.experience_years : exp;
    }
    if (typeof bio === 'string') tutor.bio = bio;
    if (typeof qualifications !== 'undefined') {
      if (Array.isArray(qualifications)) {
        tutor.qualifications = qualifications.join(', ');
      } else if (typeof qualifications === 'string') {
        tutor.qualifications = qualifications;
      }
    }

    // Handle academic levels taught if provided
    let selectedLevelIds = null;
    if (Array.isArray(academic_levels_taught)) {
      // Normalize to array of ObjectIds as strings
      selectedLevelIds = academic_levels_taught.map((lv) => {
        if (lv && typeof lv === 'object' && (lv.educationLevel || lv._id)) {
          return String(lv.educationLevel || lv._id);
        }
        return String(lv);
      }).filter(Boolean);

      // Find levels being removed and check dependencies before proceeding
      const prevLevels = (Array.isArray(tutor.academic_levels_taught) ? tutor.academic_levels_taught : []).map((e) => String(e.educationLevel && e.educationLevel._id ? e.educationLevel._id : e.educationLevel));
      const removedLevels = prevLevels.filter((l) => !new Set(selectedLevelIds).has(l));
      if (removedLevels.length > 0) {
        const deps = {};
        deps.sessions = await TutoringSession.countDocuments({ tutor_id: tutor._id, academic_level: { $in: removedLevels } });
        deps.payments = await StudentPayment.countDocuments({ tutor_id: tutor._id, academic_level: { $in: removedLevels } });
        deps.hires = await StudentProfile.countDocuments({ 'hired_tutors.tutor': tutor._id, 'hired_tutors.academic_level_id': { $in: removedLevels } });
        const total = (deps.sessions||0)+(deps.payments||0)+(deps.hires||0);
        if (total > 0) {
          return res.status(400).json({ success: false, message: 'Cannot update levels due to existing dependencies', dependencies: deps });
        }
      }
      console.log("removedLevels", removedLevels);
      // Build full objects satisfying TutorProfile schema requirements
      const existingByLevel = new Map(
        (Array.isArray(tutor.academic_levels_taught) ? tutor.academic_levels_taught : [])
          .map((entry) => [String(entry.educationLevel), entry])
      );

      const levelDocs = await EducationLevel.find({ _id: { $in: selectedLevelIds } }).lean();
      const levelDocMap = new Map(levelDocs.map((ld) => [String(ld._id), ld]));

      tutor.academic_levels_taught = selectedLevelIds.map((levelId) => {
        const prev = existingByLevel.get(levelId);
        const lvl = levelDocMap.get(levelId);
        const hourly = prev?.hourlyRate ?? lvl?.hourlyRate ?? 0;
        const totalSessions = prev?.totalSessionsPerMonth ?? lvl?.totalSessionsPerMonth ?? 0;
        const discount = prev?.discount ?? lvl?.discount ?? 0;
        const monthlyRate = Math.max(0, (hourly * totalSessions) - ((hourly * totalSessions) * (discount / 100)));
        return {
          educationLevel: levelId,
          name: lvl?.level || prev?.name || 'Level',
          hourlyRate: hourly,
          totalSessionsPerMonth: totalSessions,
          discount,
          monthlyRate
        };
      });
    }

    // Handle subjects if provided; optionally filter to selected levels
    if (Array.isArray(subjects)) {
      let subjectIds = subjects.map((s) => String(s)).filter(Boolean);

      // If levels were provided in same request, filter subjects to those levels
      if (selectedLevelIds && selectedLevelIds.length > 0) {
        const subjectDocs = await Subject.find({ _id: { $in: subjectIds } }).select('_id level_id').lean();
        const levelSet = new Set(selectedLevelIds.map(String));
        subjectIds = subjectDocs
          .filter((sd) => sd.level_id && levelSet.has(String(sd.level_id)))
          .map((sd) => String(sd._id));
      }

      // Subjects being removed and their dependencies
      const prevSubjects = Array.isArray(tutor.subjects) ? tutor.subjects.map(String) : [];
      const removedSubjects = prevSubjects.filter((s) => !new Set(subjectIds).has(s));
      if (removedSubjects.length > 0) {
        const deps = {};
        deps.sessions = await TutoringSession.countDocuments({ tutor_id: tutor._id, subject: { $in: removedSubjects } });
        deps.payments = await StudentPayment.countDocuments({ tutor_id: tutor._id, subject: { $in: removedSubjects } });
        deps.hires = await StudentProfile.countDocuments({ 'hired_tutors.tutor': tutor._id, 'hired_tutors.subject': { $in: removedSubjects } });
        const total = (deps.sessions||0)+(deps.payments||0)+(deps.hires||0);
        if (total > 0) {
          return res.status(400).json({ success: false, message: 'Cannot remove subjects due to existing dependencies', dependencies: deps });
        }
      }

      tutor.subjects = subjectIds;
    }

    await Promise.all([user.save(), tutor.save()]);

    return res.status(200).json({ success: true, message: 'Tutor updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update tutor', error: error.message });
  }
});

