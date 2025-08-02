// controllers/adminController.js
const TutorApplication = require("../Models/tutorApplicationSchema");
const TutorProfile = require("../Models/tutorProfileSchema");
const TutorDocument = require("../Models/tutorDocumentSchema");
const User = require("../Models/userSchema");
const mongoose = require("mongoose");
const sendEmail = require("../Utils/sendEmail");

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
  console.log("Setting available interview slots", req.body);
  const { tutor_id, preferred_interview_times } = req.body;

  if (
    !tutor_id ||
    !preferred_interview_times ||
    !Array.isArray(preferred_interview_times)
  ) {
    return res.status(400).json({
      message: "tutor_id and preferred_interview_times (array) are required",
    });
  }

  try {
    const unavailableSlots = [];

    for (const time of preferred_interview_times) {
      const slotTaken = await TutorApplication.findOne({
        scheduled_time: new Date(time),
        interview_status: { $in: ["Scheduled", "Pending"] },
        tutor_id: { $ne: tutor_id },
      });

      if (slotTaken) {
        unavailableSlots.push(time);
      }
    }

    const availableSlots = preferred_interview_times.filter(
      (time) => !unavailableSlots.includes(time)
    );

    if (availableSlots.length === 0) {
      return res
        .status(400)
        .json({ message: "All selected slots are already taken." });
    }

    const updated = await TutorApplication.findOneAndUpdate(
      { tutor_id },
      { preferred_interview_times: availableSlots },
      { new: true }
    );

    res.status(200).json({
      message: `Available slots saved successfully. Skipped ${unavailableSlots.length} booked slots.`,
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to assign preferred slots",
      error: err.message,
    });
  }
};

exports.selectInterviewSlot = async (req, res) => {
  const { tutor_id, scheduled_time } = req.body;
  if (!tutor_id || !scheduled_time) {
    return res
      .status(400)
      .json({ message: "tutor_id and scheduled_time are required" });
  }

  try {
    const application = await TutorApplication.findOne({ tutor_id });
    if (!application)
      return res.status(404).json({ message: "Tutor application not found" });

    const selectedTime = new Date(scheduled_time);
    const existingSlot = await TutorApplication.findOne({
      scheduled_time: selectedTime,
      interview_status: { $in: ["Scheduled", "Pending"] },
      tutor_id: { $ne: tutor_id },
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
    res
      .status(500)
      .json({ message: "Failed to select interview slot", error: err.message });
  }
};

// Background Check Verification
exports.verifyBackgroundCheck = async (req, res) => {
  const { tutor_id } = req.body;
  console.log("Verifying background check for user:", req.body);

  try {
    const documents = await TutorDocument.find({
      tutor_id,
      document_type: { $in: ["ID Proof", "Address Proof"] },
    });

    const hasIDProof = documents.some(
      (doc) => doc.document_type === "ID Proof"
    );
    const hasAddressProof = documents.some(
      (doc) => doc.document_type === "Address Proof"
    );

    if (!hasIDProof || !hasAddressProof) {
      let missingDocs = [];
      if (!hasIDProof) missingDocs.push("ID Proof");
      if (!hasAddressProof) missingDocs.push("Address Proof");

      return res.status(400).json({
        message: `Missing required document(s): ${missingDocs.join(", ")}`,
      });
    }

    await TutorProfile.findOneAndUpdate(
      { _id: tutor_id },
      { is_background_checked: true }
    );
    await TutorDocument.updateMany(
      { tutor_id, document_type: { $in: ["ID Proof", "Address Proof"] } },
      { $set: { verification_status: "Verified" } }
    );

    res.status(200).json({
      message: "Background check verified. All required documents are valid.",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to verify background check",
      error: err.message,
    });
  }
};

exports.verifyReferenceChecks = async (req, res) => {
  const { tutor_id } = req.body;

  try {
    const referenceDocs = await TutorDocument.find({
      tutor_id,
      document_type: "Reference Letter",
    });

    if (referenceDocs.length < 2) {
      return res
        .status(400)
        .json({ message: "Less than 2 reference letters found." });
    }

    await TutorProfile.findOneAndUpdate(
      { _id: tutor_id },
      { is_reference_verified: true }
    );
    await TutorDocument.updateMany(
      {
        tutor_id,
        document_type: "Reference Letter",
      },
      { $set: { verification_status: "Verified" } }
    );

    res.status(200).json({ message: "Reference check verified successfully." });
  } catch (err) {
    res.status(500).json({
      message: "Failed to verify references",
      error: err.message,
    });
  }
};

// Qualification Verification
exports.verifyQualifications = async (req, res) => {
  const { tutor_id } = req.body;

  try {
    const qualificationDocs = await TutorDocument.find({
      tutor_id,
      document_type: { $in: ["Degree", "Certificate"] },
    });

    if (qualificationDocs.length === 0) {
      return res
        .status(400)
        .json({ message: "No qualification documents found." });
    }

    // ✅ Step 1: Update tutor profile
    await TutorProfile.findOneAndUpdate(
      { _id: tutor_id },
      { is_qualification_verified: true }
    );

    // ✅ Step 2: Update document verification status
    await TutorDocument.updateMany(
      {
        tutor_id,
        document_type: { $in: ["Degree", "Certificate"] },
      },
      { $set: { verification_status: "Verified" } }
    );

    res.status(200).json({ message: "Qualifications verified successfully." });
  } catch (err) {
    res.status(500).json({
      message: "Failed to verify qualifications",
      error: err.message,
    });
  }
};


exports.approveTutorProfile = async (req, res) => {
  const { tutor_id } = req.body;

  try {
    const profile = await TutorProfile.findOne({ _id: tutor_id });
    const application = await TutorApplication.findOne({ tutor_id });

    if (!profile || !application) {
      return res.status(404).json({ message: "Tutor profile or application not found." });
    }

    const user = await User.findOne({ _id: profile.user_id });

    const allVerified =
      profile.is_background_checked &&
      profile.is_reference_verified &&
      profile.is_qualification_verified &&
      application.interview_status === "Passed";

    if (!allVerified) {
      return res.status(400).json({
        message: "Tutor has not completed all verification steps.",
      });
    }

    // Approve tutor
    profile.profile_status = "approved";
    profile.is_approved = true;
    user.is_verified = true;

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

  } catch (err) {
    console.error("Error approving tutor:", err);
    return res.status(500).json({
      message: "Failed to approve tutor profile",
      error: err.message,
    });
  }
};

exports.rejectTutorProfile = async (req, res) => {
  const { tutor_id, reason } = req.body;

  try {
    const profile = await TutorProfile.findOne({ _id: tutor_id });

    if (!profile) {
      return res.status(404).json({ message: "Tutor profile not found." });
    }

    await TutorProfile.findOneAndUpdate(
      { tutor_id },
      {
        profile_status: "rejected",
        rejection_reason: reason || "Not specified",
        interview_status: "Rejected",
        is_background_verified: false,
        is_reference_verified: false,
        is_qualification_verified: false,
      }
    );

    res.status(200).json({
      message: "Tutor application rejected and all statuses cleared.",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to reject tutor", error: err.message });
  }
};

// Rejection
exports.rejectTutorProfile = async (req, res) => {
  const { tutor_id, reason } = req.body;
  try {
    await TutorProfile.findOneAndUpdate(
      { id: tutor_id },
      {
        profile_status: "rejected",
        rejection_reason: reason || "Not specified",
      }
    );
    res.status(200).json({ message: "Tutor application rejected." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to reject tutor", error: err.message });
  }
};
