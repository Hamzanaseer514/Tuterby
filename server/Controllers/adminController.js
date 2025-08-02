// controllers/adminController.js
const TutorApplication = require('../Models/tutorApplicationSchema');
const TutorProfile = require('../Models/tutorProfileSchema');
const TutorDocument = require('../Models/tutorDocumentSchema');
const mongoose = require('mongoose');

// Get all pending tutor applications
exports.getAllPendingApplications = async (req, res) => {
  try {
    const applications = await TutorApplication.find({ interview_status: 'Pending' })
      .populate('user_id', 'full_name email');
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tutor applications', error: err.message });
  }
};


// Admin provides available interview slots
exports.setAvailableInterviewSlots = async (req, res) => {
    console.log("Setting available interview slots", req.body);
  const { user_id, preferred_interview_times } = req.body;

  if (!user_id || !preferred_interview_times || !Array.isArray(preferred_interview_times)) {
    return res.status(400).json({ message: 'user_id and preferred_interview_times (array) are required' });
  }

  try {
    // Check each preferred time if it's already scheduled for another tutor
    const unavailableSlots = [];

    for (const time of preferred_interview_times) {
      const slotTaken = await TutorApplication.findOne({
        scheduled_time: new Date(time),
        interview_status: { $in: ['Scheduled', 'Pending'] },
        user_id: { $ne: user_id }
      });

      if (slotTaken) {
        unavailableSlots.push(time);
      }
    }

    // Filter out unavailable ones
    const availableSlots = preferred_interview_times.filter(
      (time) => !unavailableSlots.includes(time)
    );

    if (availableSlots.length === 0) {
      return res.status(400).json({ message: 'All selected slots are already taken.' });
    }

    // Save only available slots
    const updated = await TutorApplication.findOneAndUpdate(
      { user_id },
      { preferred_interview_times: availableSlots },
      { new: true }
    );

    res.status(200).json({
      message: `Available slots saved successfully. Skipped ${unavailableSlots.length} booked slots.`,
      data: updated
    });

  } catch (err) {
    res.status(500).json({ message: 'Failed to assign preferred slots', error: err.message });
  }
};



// Tutor selects one interview slot
exports.selectInterviewSlot = async (req, res) => {
  const { user_id, scheduled_time } = req.body;
  if (!user_id || !scheduled_time) {
    return res.status(400).json({ message: 'user_id and scheduled_time are required' });
  }

  try {
    const application = await TutorApplication.findOne({ user_id });
    if (!application) return res.status(404).json({ message: 'Tutor application not found' });

    const selectedTime = new Date(scheduled_time);
    const existingSlot = await TutorApplication.findOne({
      scheduled_time: selectedTime,
      interview_status: { $in: ['Scheduled', 'Pending'] },
      user_id: { $ne: user_id },
    });

    if (existingSlot) {
      return res.status(409).json({ message: 'This interview slot is already booked by another tutor.' });
    }

    application.scheduled_time = selectedTime;
    application.interview_status = 'Scheduled';
    await application.save();

    res.status(200).json({ message: 'Interview slot selected successfully', data: application });
  } catch (err) {
    res.status(500).json({ message: 'Failed to select interview slot', error: err.message });
  }
};

// Background Check Verification
exports.verifyBackgroundCheck = async (req, res) => {
  const { user_id } = req.body;
  console.log("Verifying background check for user:", req.body);
  try {
    const approvedDocs = await TutorDocument.find({
      user_id,
      document_type: { $in: ['ID Proof', 'Address Proof'] },
    });
    console.log("Approved background documents:", approvedDocs);
    if (approvedDocs.length === 0) {
      return res.status(400).json({ message: 'No approved background documents found.' });
    }

    await TutorProfile.findOneAndUpdate({ user_id }, { is_background_checked: true });
    res.status(200).json({ message: 'Background check verified using approved documents.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify background check', error: err.message });
  }
};

// Reference Verification
exports.verifyReferenceChecks = async (req, res) => {
  const { user_id } = req.body;
  try {
    const count = await TutorDocument.countDocuments({
      user_id,
      document_type: 'Reference Letter',
    //   verification_status: 'Approved'
    });

    if (count < 2) {
      return res.status(400).json({ message: 'Less than 2 verified references found.' });
    }

    await TutorProfile.findOneAndUpdate({ user_id }, { is_reference_verified: true });
    res.status(200).json({ message: 'Reference check verified.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify references', error: err.message });
  }
};

// Qualification Verification
exports.verifyQualifications = async (req, res) => {
  const { user_id } = req.body;
  try {
    const count = await TutorDocument.countDocuments({
      user_id,
      document_type: { $in: ['Degree', 'Certificate'] },
    //   verification_status: 'Approved'
    });

    if (count === 0) {
      return res.status(400).json({ message: 'No verified qualification found.' });
    }

    await TutorProfile.findOneAndUpdate({ user_id }, { is_qualification_verified: true });
    res.status(200).json({ message: 'Qualifications verified.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify qualifications', error: err.message });
  }
};

// Final Approval
exports.approveTutorProfile = async (req, res) => {
  const { user_id } = req.body;
  try {
    const profile = await TutorProfile.findOne({ user_id });
    const application = await TutorApplication.findOne({ user_id });

    if (
      profile?.is_background_checked &&
      profile?.is_reference_verified &&
      profile?.is_qualification_verified &&
      application?.interview_status === 'Passed'
    ) {
      profile.profile_status = 'approved';
      await profile.save();
      return res.status(200).json({ message: 'Tutor approved successfully.' });
    }

    res.status(400).json({ message: 'Tutor has not completed all verification steps.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve tutor profile', error: err.message });
  }
};

exports.rejectTutorProfile = async (req, res) => {
  const { user_id, reason } = req.body;

  try {
    const profile = await TutorProfile.findOne({ user_id });

    if (!profile) {
      return res.status(404).json({ message: 'Tutor profile not found.' });
    }

    await TutorProfile.findOneAndUpdate(
      { user_id },
      {
        profile_status: 'rejected',
        rejection_reason: reason || 'Not specified',
        interview_status: 'Rejected',
        is_background_verified: false,
        is_reference_verified: false,
        is_qualification_verified: false
      }
    );

    res.status(200).json({ message: 'Tutor application rejected and all statuses cleared.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject tutor', error: err.message });
  }
};


// Rejection
exports.rejectTutorProfile = async (req, res) => {
  const { user_id, reason } = req.body;
  try {
    await TutorProfile.findOneAndUpdate({ user_id }, {
      profile_status: 'rejected',
      rejection_reason: reason || 'Not specified'
    });
    res.status(200).json({ message: 'Tutor application rejected.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject tutor', error: err.message });
  }
};
