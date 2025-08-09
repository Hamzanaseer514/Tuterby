const asyncHandler = require("express-async-handler");
const User = require("../Models/userSchema");
const Student = require("../Models/studentProfileSchema");
const TutorProfile = require("../Models/tutorProfileSchema");
const TutorApplication = require("../Models/tutorApplicationSchema");
const TutorDocument = require("../Models/tutorDocumentSchema");
const ParentProfile = require("../Models/ParentProfileSchema");
const { generateAccessToken, generateRefreshToken } = require("../Utils/generateTokens");
const sendEmail = require("../Utils/sendEmail");
const otpStore = require("../Utils/otpStore");
const generateOtpEmail = require("../Utils/otpTempelate");
const path = require("path");

exports.registerUser = asyncHandler(async (req, res) => {
  const {
    full_name,
    email,
    password,
    age,
    academic_level,
    role
  } = req.body;

  if (!email || !password || !age || !full_name || !academic_level) {
    res.status(400);
    throw new Error(
      "Full name, email, password, age, and academic level are required"
    );
  }

  if (age < 12) {
    res.status(400);
    throw new Error("Age must be 12 or older");
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error("Email already exists");
  }

  try {
    const user = await User.create({
      full_name,
      email,
      password,
      age,
      role: role || "student",
      is_verified: "active",
    });

    const student = await Student.create({
      user_id: user._id,
      academic_level,
    });

    res.status(201).json({
      message: "Student registered successfully",
      user: {
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        age: user.age,
        role: user.role,
      },
      student: {
        academic_level: student.academic_level,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error("User/Student creation failed: " + error.message);
  }
});


exports.registerTutor = asyncHandler(async (req, res) => {
  const {
    full_name,
    email,
    password,
    phone_number,
    age,
    photo_url,
    qualifications,
    experience_years,
    subjects, // array of subjects
    academic_levels_taught, // array of academic levels they will teach
    location, // tutor's location
    hourly_rate, // tutor's hourly rate
    bio,
    code_of_conduct_agreed,
    documentsMap,
  } = req.body;
  if (
    !email ||
    !password ||
    !age ||
    !full_name ||
    !qualifications ||
    !subjects ||
    !academic_levels_taught ||
    !location ||
    !hourly_rate ||
    !experience_years ||
    code_of_conduct_agreed === undefined ||
    !documentsMap
  ) {
    res.status(400);
    throw new Error("All required fields must be provided ok!");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("Email already exists");
  }

  // const session = await User.startSession();
  // session.startTransaction();

  try {
    // Step 1: Create user
    const user = await User.create(
      [
        {
          full_name,
          email,
          password,
          phone_number,
          age,
          role: "tutor",
          photo_url,
          is_verified: "inactive", // Not verified yet
        },
      ]
      // { session }
    );

    // Step 2: Create tutor profile
    const tutorProfile = await TutorProfile.create(
      [
        {
          user_id: user[0]._id,
          bio: bio || "",
          qualifications,
          experience_years,
          subjects,
          academic_levels_taught: Array.isArray(academic_levels_taught)
            ? academic_levels_taught
            : [academic_levels_taught],
          location,
          hourly_rate: parseFloat(hourly_rate),
          average_rating: 0, // Initialize with 0 rating
          total_sessions: 0, // Initialize with 0 sessions
          is_verified: false, // Not verified yet
          is_approved: false, // Not approved yet
        },
      ]
      // { session }
    );

    // Step 3: Create tutor application entry
    const tutorApplication = await TutorApplication.create(
      [
        {
          tutor_id: tutorProfile[0]._id,
          interview_status: "Pending",
          code_of_conduct_agreed: code_of_conduct_agreed,
          application_status: "Pending",
        },
      ]
      // { session }
    );

    const savedDocuments = [];
    const documentMapRaw = req.body.documentsMap;


    if (documentMapRaw && req.files && req.files['documents']) {

      let documentsObj;
      try {
        documentsObj = JSON.parse(documentMapRaw);
      } catch (error) {
        res.status(400);
        throw new Error("Invalid documentsMap format");
      }

      for (const [documentType, originalFileName] of Object.entries(documentsObj)) {
        const uploadedFile = req.files['documents'].find(file => file.originalname === originalFileName);
        if (!uploadedFile) continue;

        // Optionally rename file to include document type
        const oldPath = uploadedFile.path;
        const ext = path.extname(uploadedFile.filename);
        const base = path.basename(uploadedFile.filename, ext);
        const newFilename = `${documentType.replace(
          /\s+/g,
          "_"
        )}_${base}${ext}`;
        const fs = require("fs");
        const newPath = `uploads/documents/${newFilename}`;

        // Rename the file on disk
        fs.renameSync(oldPath, newPath);

        const relativePath = `/uploads/documents/${newFilename}`;
        const newDoc = await TutorDocument.create({
          tutor_id: tutorProfile[0]._id,
          document_type: documentType,
          file_url: relativePath,
          uploaded_at: new Date(),
          verified_by_admin: false,
          verification_status: "Pending",
        });

        savedDocuments.push(newDoc);
      }
    }





    // await session.commitTransaction();
    // session.endSession();

    res.status(201).json({
      message: "Tutor registered successfully",
      user: {
        _id: user[0]._id,
        full_name: user[0].full_name,
        email: user[0].email,
        role: user[0].role,
        phone_number: user[0].phone_number,
        age: user[0].age,
        photo_url: user[0].photo_url,
      },
      profile: tutorProfile[0],
      application: tutorApplication[0],
      documents: savedDocuments,
    });
  } catch (error) {
    // await session.abortTransaction();
    // session.endSession();
    res.status(500);
    throw new Error("Tutor registration failed: " + error.message);
  }
});

exports.registerParent = asyncHandler(async (req, res) => {
  const { full_name, email, phone_number, password, age, photo_url } = req.body;

  if (!email || !password || !full_name) {
    res.status(400);
    throw new Error("Full name, email, and password are required");
  }
  if (age < 20) {
    res.status(400);
    throw new Error("Age must be 20 or older");
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error("Email already exists");
  }

  // const session = await User.startSession();
  // session.startTransaction();

  try {
    const user = await User.create(
      [{
        full_name,
        email,
        password,
        phone_number,
        age,
        role: "parent",
        photo_url,
        is_verified: "active"
      }],
      // { session }
    );

    const parent = await ParentProfile.create(
      [
        {
          user_id: user[0]._id,
          students: [], // start with empty student array
        },
      ]
      // { session }
    );

    // await session.commitTransaction();
    // session.endSession();

    res.status(201).json({
      message: "Parent registered successfully",
      _id: user[0]._id,
      full_name: user[0].full_name,
      email: user[0].email,
      role: user[0].role,
      phone_number: user[0].phone_number,
      age: user[0].age,
      photo_url: user[0].photo_url,
      parentProfile: parent[0],
    });
  } catch (error) {
    // await session.abortTransaction();
    // session.endSession();
    res.status(500);
    throw new Error("Parent creation failed: " + error.message);
  }
});

exports.addStudentToParent = asyncHandler(async (req, res) => {
  const {
    parent_user_id, // user._id of parent
    full_name,
    email,
    password,
    age,
    photo_url,
    academic_level,
    learning_goals,
    preferred_subjects,
    availability,
  } = req.body;

  if (
    !parent_user_id ||
    !email ||
    !password ||
    !full_name ||
    !academic_level ||
    !learning_goals ||
    !preferred_subjects ||
    !availability
  ) {
    res.status(400);
    throw new Error("Missing required student fields");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("Student email already exists");
  }

  // const session = await User.startSession();
  // session.startTransaction();

  try {
    const studentUser = await User.create(
      [
        {
          full_name,
          email,
          password,
          age,
          role: "student",
          photo_url,
          is_verified: "active",
        },
      ]
      // { session }
    );

    const studentProfile = await Student.create(
      [
        {
          user_id: studentUser[0]._id,
          academic_level,
          learning_goals,
          preferred_subjects,
          availability,
        },
      ]
      // { session }
    );
    

    const parentProfile = await ParentProfile.findOneAndUpdate(
      { user_id: parent_user_id },
      { $push: { students: studentProfile[0] } } // push whole object or just ref
      // { new: true, session }
    );

    if (!parentProfile) {
      throw new Error("Parent profile not found");
    }

    // await session.commitTransaction();
    // session.endSession();

    res.status(201).json({
      message: "Student added to parent successfully",
      studentUser: studentUser[0],
      studentProfile: studentProfile[0],
      parentProfile,
    });
  } catch (error) {
    // await session.abortTransaction();
    // session.endSession();
    res.status(500);
    throw new Error("Failed to add student: " + error.message);
  }
});

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  if (user.is_verified === "inactive") {
    res.status(403);
    throw new Error(
      "User not verified. please be Patient, Admin will verify you soon"
    );
  }
  if (user.role === "student" || user.role === "tutor" || user.role === "parent") {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[user._id] = {
      otp,
      expiresAt: Date.now() + 60000,
      attempts: 1,
      maxAttempts: 5,
      lockUntil: null
    };
    const htmlContent = generateOtpEmail(otp, user.username);
    await sendEmail(user.email, "Your TutorBy OTP Code", htmlContent);
    res.status(200).json({
      message: "OTP sent to your email",
      userId: user._id,
      email: user.email,
    });
  } else if (user.role === "admin") {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Admin login successful",
      user: {
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified
      },
      accessToken
    });


    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Admin login successful",
      user: {
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      },
      accessToken,
    });
  }
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;
  const entry = otpStore[userId];

  if (!entry) {
    return res.status(400).json({ message: "No OTP request found" });
  }

  if (entry.lockUntil && Date.now() < entry.lockUntil) {
    return res
      .status(429)
      .json({ message: "Too many attempts. Try after 30 minutes." });
  }

  if (Date.now() > entry.expiresAt) {
    return res.status(400).json({ message: "OTP expired. Please regenerate." });
  }

  if (otp !== entry.otp) {
    entry.attempts++;
    if (entry.attempts >= entry.maxAttempts) {
      entry.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes lock
      return res
        .status(429)
        .json({ message: "Too many wrong attempts. Try after 30 minutes." });
    }
    return res.status(401).json({ message: "Incorrect OTP" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // ✅ Case 1: Forgot Password
  if (entry.purpose === "forgotPassword") {
    delete otpStore[userId];
    return res.status(200).json({
      message: "OTP verified successfully. You can now reset your password.",
      userId,
    });
  }

  let roleData = null;
  if (user.role === "student") {
    roleData = await Student.findOne({ user_id: user._id }).select("-__v -createdAt -updatedAt");

  } else if (user.role === "tutor") {
    roleData = await TutorProfile.findOne({ user_id: user._id }).select(
      "-__v -createdAt -updatedAt"
    );
  } else if (user.role === "parent") {
    roleData = await ParentProfile.findOne({ user_id: user._id }).select("-__v -createdAt -updatedAt");

  } else if (user.role === "admin") {
    roleData = {
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    };
  }
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  delete otpStore[userId];

  const responseData = {
    message: "Login successful",
    user: {
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    },
    data: roleData,
    accessToken,
  };

  res.status(200).json(responseData);
});

exports.resendOtp = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const entry = otpStore[userId];

  if (!entry) {
    return res.status(400).json({ message: "OTP not requested yet" });
  }

  if (entry.lockUntil && Date.now() < entry.lockUntil) {
    return res
      .status(429)
      .json({ message: "Too many attempts. Try after 30 minutes." });
  }

  if (entry.attempts >= entry.maxAttempts) {
    entry.lockUntil = Date.now() + 30 * 60 * 1000;
    return res
      .status(429)
      .json({ message: "OTP resend limit reached. Try after 30 minutes." });
  }

  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[userId] = {
    otp: newOtp,
    expiresAt: Date.now() + 60000,
    attempts: entry.attempts + 1,
    maxAttempts: entry.maxAttempts,
    lockUntil: entry.lockUntil || null,
  };

  const user = await User.findById(userId);
  const htmlContent = generateOtpEmail(newOtp, user.username);
  await sendEmail(user.email, "Your SaferSavvy OTP Code", htmlContent);

  res.status(200).json({ message: "New OTP sent to your email." });
});

exports.addAdmin = asyncHandler(async (req, res) => {
  const { full_name, email, password, phone_number } = req.body;

  if (!email || !password || !full_name || !phone_number) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error("Email already exists");
  }

  try {
    // const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create([
      {
        full_name,
        email,
        password,
        phone_number,
        role: "admin",
        is_verified: 'active', // ✅ manually set as admin
      },
    ]);

    res.status(201).json({
      message: `Admin ${user[0].full_name} added successfully`,
      _id: user[0]._id,
      full_name: user[0].full_name,
      email: user[0].email,
      role: user[0].role,
      is_verified: user[0].is_verified,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Admin creation failed: " + error.message);
  }
});


exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("No user found with this email");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[user._id] = {
    otp,
    expiresAt: Date.now() + 60000,
    attempts: 1,
    maxAttempts: 5,
    lockUntil: null,
    purpose: "forgotPassword",
  };

  const htmlContent = generateOtpEmail(
    otp,
    user.full_name || user.username || "User"
  );
  await sendEmail(user.email, "Reset Your Password - OTP", htmlContent);

  res.status(200).json({
    message: "OTP sent to your email for password reset",
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { userId, newPassword } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
});


