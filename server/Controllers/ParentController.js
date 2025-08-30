const asyncHandler = require("express-async-handler");
const User = require("../Models/userSchema");
const Student = require("../Models/studentProfileSchema");
const ParentProfile = require("../Models/ParentProfileSchema");
const StudentPayment = require("../Models/studentPaymentSchema");
const mongoose = require("mongoose");

exports.addStudentToParent = asyncHandler(async (req, res) => {
  const {
    parent_user_id,
    full_name,
    email,
    password,
    age,
    photo_url,
    academic_level,
  } = req.body;

  if (
    !parent_user_id ||
    !email ||
    !password ||
    !full_name ||
    !academic_level ||
    !age
  ) {
    res.status(400);
    throw new Error("Missing required student fields");
  }

  // Validate that only children under 12 can be added by parents
  if (age >= 12) {
    res.status(400);
    throw new Error("Only children under 12 can be added by parents. Children 12 and older must register themselves.");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("Student email already exists");
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(password)) {
    res.status(400);
    throw new Error(
      "Password must be at least 8 characters long, include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
    );
  }

  try {
    const studentUser = await User.create({
      full_name,
      email,
      password,
      age,
      role: "student",
      photo_url,
      is_verified: "active",
    });

    const studentProfile = await Student.create({
      user_id: studentUser._id,
      academic_level: academic_level, // This should be ObjectId from frontend
    });

    const parentProfile = await ParentProfile.findOneAndUpdate(
      { user_id: parent_user_id },
      { $push: { students: studentProfile._id } },
      { new: true }
    );

    if (!parentProfile) {
      throw new Error("Parent profile not found");
    }

    res.status(201).json({
      message: "Student added to parent successfully",
      studentUser: studentUser,
      studentProfile: studentProfile,
      parentProfile,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to add student: " + error.message);
  }
});

exports.getParentProfile = asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  try {
    // Fetch parent profile with parent user info and nested student info
    const parentProfile = await ParentProfile.findOne({ user_id })
      .populate({
        path: "user_id", // populate parent's own user info
        select: "full_name email age  phone_number photo_url is_verified created_at updatedAt"
      })
      .populate({
        path: "students",
        populate: [
          { path: "user_id", select: "full_name email phone_number age photo_url is_verified created_at" },
          { path: "academic_level", select: "level" }
        ]
      });

    if (!parentProfile) {
      res.status(404);
      throw new Error("Parent profile not found");
    }

    // Transform student info
    const childrenWithUserInfo = parentProfile.students.map(child => ({
      _id: child.user_id._id,
      full_name: child.user_id.full_name,
      email: child.user_id.email,
      phone_number: child.user_id.phone_number,
      age: child.user_id.age,
      photo_url: child.user_id.photo_url,
      is_verified: child.user_id.is_verified,
      created_at: child.user_id.created_at,
      academic_level: child.academic_level,
      preferred_subjects: child.preferred_subjects,
    }));

    res.status(200).json({
      parentProfile,
      children: childrenWithUserInfo
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch parent profile: " + error.message);
  }
});

exports.updateParentProfile = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const updateData = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      user_id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404);
      throw new Error("Parent not found");
    }

    res.status(200).json({
      message: "Parent profile updated successfully",
      user
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to update parent profile: " + error.message);
  }
});

exports.getParentDashboardStats = asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  try {
    const parentProfile = await ParentProfile.findOne({ user_id });

    if (!parentProfile) {
      res.status(404);
      throw new Error("Parent profile not found");
    }

    // Fetch all students with their user info
    const students = await Student.find({ _id: { $in: parentProfile.students } })
      .populate("user_id", "is_verified");

    const totalChildren = students.length;

    // Count active/inactive by checking populated user_id.is_verified
    const activeChildren = students.filter(s => s.user_id?.is_verified === "active").length;
    const inactiveChildren = totalChildren - activeChildren;

    res.status(200).json({
      totalChildren,
      activeChildren,
      inactiveChildren
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch parent dashboard stats: " + error.message);
  }
});

exports.getSpecificStudentDetail = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  console.log("userId", userId);

  try {
    // Find the student profile with all related information
    const studentProfile = await Student.findOne({ user_id: userId })
      .populate({
        path: "user_id",
        select: "full_name email phone_number age photo_url is_verified created_at"
      })
      .populate({
        path: "academic_level",
        select: "level"
      })
      .populate({
        path: "preferred_subjects",
        select: "name"
      })
      .populate({
        path: "hired_tutors.tutor",
        populate: {
          path: "user_id",
          select: "full_name email photo_url"
        },
        select: "average_rating academic_levels_taught"
      })
      .populate({
        path: "hired_tutors.subject",
        select: "name"
      })
      .populate({
        path: "hired_tutors.academic_level_id",
        select: "level"
      });
    
    if (!studentProfile) {
      res.status(404);
      throw new Error("Student profile not found");
    }

    // Transform the data for better frontend consumption
    const transformedStudent = {
      _id: studentProfile.user_id._id,
      full_name: studentProfile.user_id.full_name,
      email: studentProfile.user_id.email,
      phone_number: studentProfile.user_id.phone_number,
      age: studentProfile.user_id.age,
      photo_url: studentProfile.user_id.photo_url,
      is_verified: studentProfile.user_id.is_verified,
      created_at: studentProfile.user_id.created_at,
      academic_level: studentProfile.academic_level,
      preferred_subjects: studentProfile.preferred_subjects,
      learning_goals: studentProfile.learning_goals,
      availability: studentProfile.availability,
      hired_tutors: studentProfile.hired_tutors.map(tutor => {
        // find correct hourly rate for the hired academic level
        let hourlyRate = null;
        if (tutor.tutor && tutor.academic_level_id) {
          const match = tutor.tutor.academic_levels_taught.find(
            lvl => lvl.educationLevel?.toString() === tutor.academic_level_id._id.toString()
          );
          hourlyRate = match ? match.hourlyRate : null;
        }

        return {
          _id: tutor._id,
          tutor: {
            _id: tutor.tutor?._id,
            user_id: tutor.tutor?.user_id?._id,
            full_name: tutor.tutor?.user_id?.full_name,
            email: tutor.tutor?.user_id?.email,
            photo_url: tutor.tutor?.user_id?.photo_url,
            hourly_rate: hourlyRate, // ✅ Correct hourlyRate from academic_levels_taught
            rating: tutor.tutor?.average_rating
          },
          subject: tutor.subject
            ? {
                _id: tutor.subject._id,
                name: tutor.subject.name
              }
            : null,
          academic_level: tutor.academic_level_id
            ? {
                _id: tutor.academic_level_id._id,
                level: tutor.academic_level_id.level
              }
            : null,
          status: tutor.status,
          hired_at: tutor.hired_at,
          createdAt: tutor.createdAt,
          updatedAt: tutor.updatedAt
        };
      })
    };

    console.log("transformedStudent", transformedStudent.hired_tutors);

    res.status(200).json({
      success: true,
      student: transformedStudent
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch student details: " + error.message);
  }
});

exports.getParentStudentsPayments = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  
  try {
    // First get the parent profile to find all students
    const parentProfile = await ParentProfile.findOne({ user_id })
      .populate({
        path: 'students',
        populate: [
          { path: 'user_id', select: 'full_name email photo_url' },
          { path: 'academic_level', select: 'level' },
          { path: 'preferred_subjects', select: 'name' }
        ]
    });

    if (!parentProfile) {
      res.status(404);
      throw new Error("Parent profile not found");
    }

    // Get all payment records for the parent's students
    const studentIds = parentProfile.students.map(student => student._id);
    
    const payments = await StudentPayment.find({ 
      student_id: { $in: studentIds } 
    })
    .populate([
      { 
        path: 'student_id', 
        populate: { 
          path: 'user_id', 
          select: 'full_name email photo_url' 
        } 
      },
      { 
        path: 'tutor_id', 
        populate: { 
          path: 'user_id', 
          select: 'full_name email photo_url' 
        },
        select: 'average_rating academic_levels_taught'
      },
      { path: 'subject', select: 'name' },
      { path: 'academic_level', select: 'level' }
    ])
    .sort({ request_date: -1 }); // Most recent first

    // Transform the data to include student names and other details
    const transformedPayments = payments.map(payment => ({
      _id: payment._id,
      student: payment.student_id?.user_id,
      tutor: payment.tutor_id,
      subject: payment.subject,
      academic_level: payment.academic_level,
      payment_type: payment.payment_type,
      base_amount: payment.base_amount,
      monthly_amount: payment.monthly_amount,
      discount_percentage: payment.discount_percentage,
      total_sessions_per_month: payment.total_sessions_per_month,
      validity_start_date: payment.validity_start_date,
      validity_end_date: payment.validity_end_date,
      sessions_remaining: payment.sessions_remaining,
      payment_status: payment.payment_status,
      payment_method: payment.payment_method,
      payment_date: payment.payment_date,
      request_date: payment.request_date,
      request_notes: payment.request_notes,
      academic_level_paid: payment.academic_level_paid,
      is_active: payment.is_active,
      currency: payment.currency,
      gateway_transaction_id: payment.gateway_transaction_id,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    }));

    res.status(200).json({
      success: true,
      payments: transformedPayments,
      total: transformedPayments.length
    });

  } catch (error) {
    console.error("Error fetching parent students payments:", error);
    res.status(500);
    throw new Error("Failed to fetch payments data");
  }
});

