const asyncHandler = require("express-async-handler");
const User = require("../Models/userSchema");
const Student = require("../Models/studentProfileSchema");
const ParentProfile = require("../Models/ParentProfileSchema");
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
        select: "full_name email age  phone_number photo_url is_verified created_at"
      })
      .populate({
        path: "students",
        populate: [
          { path: "user_id", select: "full_name email age photo_url is_verified created_at" },
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

