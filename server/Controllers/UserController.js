const asyncHandler = require("express-async-handler");
const User = require("../Models/userSchema");
const Student = require("../Models/studentProfileSchema");
const TutorProfile = require("../Models/tutorProfileSchema");
const TutorApplication = require("../Models/tutorApplicationSchema");
const TutorDocument = require("../Models/tutorDocumentSchema");
const ParentProfile = require("../Models/ParentProfileSchema");
const TutoringSession = require("../Models/tutoringSessionSchema"); // Added for student dashboard
const TutorInquiry = require("../Models/tutorInquirySchema"); // Added for tutor search and help requests
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
    role,
    phone_number,
    photo_url,
    academic_level,
    learning_goals,
    preferred_subjects,
    availability,
  } = req.body;

  if (
    !email || !password || !age || !full_name ||
    !academic_level || !learning_goals || !preferred_subjects || !availability
  ) {
    res.status(400);
    throw new Error("All fields are required");
  }
  if(age < 12) {
    res.status(400);
    throw new Error("Age must be 12 or older");
  }
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error("Email already exists");
  }


  // const session = await User.startSession();
  // session.startTransaction();

  try {
    // Create user with password (hashing will happen in model)
    const user = await User.create(
      [
        {
          full_name,
          email,
          password, // will be hashed by pre-save hook
          age,
          phone_number,
          role: role || "student",
          photo_url,
          is_verified: true // Assuming auto-verification for registration
        },
      ],
      // { session }
    );

    // Create student profile
    const student = await Student.create(
      [
        {
          user_id: user[0]._id,
          academic_level,
          learning_goals,
          preferred_subjects,
          availability
        },
      ],
      // { session }
    );

    // await session.commitTransaction();
    // session.endSession();

    res.status(201).json({
      message: "Student registered successfully",
      _id: user[0]._id,
      full_name: user[0].full_name,
      email: user[0].email,
      role: user[0].role,
      age: user[0].age,
      phone_number: user[0].phone_number,
      photo_url: user[0].photo_url,
      studentData: student[0]
    });

  } catch (error) {
    // await session.abortTransaction();
    // session.endSession();
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
    documentsMap
  } = req.body;
  if (!email || !password || !age || !full_name || !photo_url || !qualifications || !subjects || !academic_levels_taught || !location || !hourly_rate || !experience_years || code_of_conduct_agreed === undefined || !documentsMap) {
    res.status(400);
    throw new Error("All required fields must be provided");
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
      [{
        full_name,
        email,
        password,
        phone_number,
        age,
        role: "tutor",
        photo_url,
        is_verified: false // Not verified yet
      }],
      // { session }
    );

    // Step 2: Create tutor profile
    const tutorProfile = await TutorProfile.create(
      [{
        user_id: user[0]._id,
        bio: bio || '',
        qualifications,
        experience_years,
        subjects,
        academic_levels_taught: Array.isArray(academic_levels_taught) ? academic_levels_taught : [academic_levels_taught],
        location,
        hourly_rate: parseFloat(hourly_rate),
        average_rating: 0, // Initialize with 0 rating
        total_sessions: 0, // Initialize with 0 sessions
        is_verified: false, // Not verified yet
        is_approved: false // Not approved yet
      }],
      // { session }
    );

    // Step 3: Create tutor application entry
    const tutorApplication = await TutorApplication.create(
      [{
        tutor_id: tutorProfile[0]._id,
        interview_status: 'Pending',
        code_of_conduct_agreed: code_of_conduct_agreed,
        application_status: 'Pending'
      }],
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
        const newFilename = `${documentType.replace(/\s+/g, '_')}_${base}${ext}`;
        const fs = require('fs');
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
          verification_status: "Pending"
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
        photo_url: user[0].photo_url
      },
      profile: tutorProfile[0],
      application: tutorApplication[0],
      documents: savedDocuments
    });

  } catch (error) {
    // await session.abortTransaction();
    // session.endSession();
    res.status(500);
    throw new Error("Tutor registration failed: " + error.message);
  }
});


exports.registerParent = asyncHandler(async (req, res) => {
  const {
    full_name,
    email,
    phone_number,
    password,
    age,
    photo_url
  } = req.body;

  if (!email || !password || !full_name) {
    res.status(400);
    throw new Error("Full name, email, and password are required");
  }
  if(age < 20) {
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
        is_verified: true
      }],
      // { session }
    );

    const parent = await ParentProfile.create(
      [{
        user_id: user[0]._id,
        students: [] // start with empty student array
      }],
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
    phone_number:user[0].phone_number,
      age: user[0].age,
      photo_url: user[0].photo_url,
      parentProfile: parent[0]
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
    availability
  } = req.body;

  if (!parent_user_id || !email || !password || !full_name || !academic_level || !learning_goals || !preferred_subjects || !availability) {
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
      [{
        full_name,
        email,
        password,
        age,
        role: "student",
        photo_url,
        is_verified: true
      }],
      // { session }
    );

    const studentProfile = await Student.create(
      [{
        user_id: studentUser[0]._id,
        academic_level,
        learning_goals,
        preferred_subjects,
        availability
      }],
      // { session }
    );

    const parentProfile = await ParentProfile.findOneAndUpdate(
      { user_id: parent_user_id },
      { $push: { students: studentProfile[0] } }, // push whole object or just ref
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
      parentProfile
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
  if (!user.is_verified) {
    res.status(403);
    throw new Error("User not verified. please be Patient, Admin will verify you soon");
  }
  if(user.role === "student" || user.role === "tutor" || user.role === "parent"){
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[user._id] = {
    otp,
    expiresAt: Date.now() + 60000,
    attempts: 1,
    maxAttempts: 5,
    lockUntil: null
  };
  const htmlContent = generateOtpEmail(otp, user.username);
  await sendEmail(user.email, "Your SaferSavvy OTP Code", htmlContent);
  res.status(200).json({
    message: "OTP sent to your email",
    userId: user._id,
    email: user.email,
  });
}else if(user.role === "admin"){
  // Admin login - no OTP required
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
}
});


exports.verifyOtp = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;
  const entry = otpStore[userId];

  if (!entry) {
    return res.status(400).json({ message: "No OTP request found" });
  }

  if (entry.lockUntil && Date.now() < entry.lockUntil) {
    return res.status(429).json({ message: "Too many attempts. Try after 30 minutes." });
  }

  if (Date.now() > entry.expiresAt) {
    return res.status(400).json({ message: "OTP expired. Please regenerate." });
  }

  if (otp !== entry.otp) {
    entry.attempts++;
    if (entry.attempts >= entry.maxAttempts) {
      entry.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes lock
      return res.status(429).json({ message: "Too many wrong attempts. Try after 30 minutes." });
    }
    return res.status(401).json({ message: "Incorrect OTP" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // // ✅ Case 1: Forgot Password
  // if (entry.purpose === "forgotPassword") {
  //   delete otpStore[userId];
  //   return res.status(200).json({
  //     message: "OTP verified successfully. You can now reset your password.",
  //     userId
  //   });
  // }

  // ✅ Case 2: Login
  let roleData = null;
  


  if (user.role === "student") {
    roleData = await Student.findOne({ user_id: user._id }).select("-__v -createdAt -updatedAt");
    // console.log('Found student role data:', roleData);
  } else if (user.role === "tutor") {
    roleData = await TutorProfile.findOne({ user_id: user._id }).select("-__v -createdAt -updatedAt");
    // console.log('Found tutor role data:', roleData);
  } else if (user.role === "parent") {
    roleData = await ParentProfile.findOne({ user_id: user._id }).select("-__v -createdAt -updatedAt");
    // console.log('Found parent role data:', roleData);
  } else if (user.role === "admin") {
    // Admin doesn't need separate profile data, use basic user info
    roleData = {
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    };
    // console.log('Created admin role data:', roleData);
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
      address: user.address,
      gender: user.gender
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
    return res.status(429).json({ message: "Too many attempts. Try after 30 minutes." });
  }

  if (entry.attempts >= entry.maxAttempts) {
    entry.lockUntil = Date.now() + 30 * 60 * 1000;
    return res.status(429).json({ message: "OTP resend limit reached. Try after 30 minutes." });
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
        is_verified: true // ✅ manually set as admin
      }
    ]);

    res.status(201).json({
      message: `Admin ${user[0].full_name} added successfully`,
      _id: user[0]._id,
      full_name: user[0].full_name,
      email: user[0].email,
      role: user[0].role,
      is_verified: user[0].is_verified
    });

  } catch (error) {
    res.status(500);
    throw new Error("Admin creation failed: " + error.message);
  }
});




// UPDATE USER...

exports.updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const {
    full_name,
    phone_number,
    address,
    gender,
    department,
    licence_no,
    experience,
    cnic,
    is_verified,
    profile_picture,
    joining_date
  } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (full_name) user.full_name = full_name;
  if (phone_number) user.phone_number = phone_number;
  if (address) user.address = address;
  if (gender) user.gender = gender;
  if (is_verified !== undefined) user.is_verified = is_verified;
  if (profile_picture) user.profile_picture = profile_picture;

  await user.save();

  let roleData;

  if (user.role === "student") {
    const student = await Student.findOne({ user: userId });
    if (!student) throw new Error("Student record not found");
    if (department) student.department = department;

    await student.save();
    roleData = student;

  } else if (user.role === "driver") {
    const driver = await Driver.findOne({ user: userId });
    if (!driver) throw new Error("Driver record not found");

    if (licence_no) driver.licence_no = licence_no;
    if (experience) driver.experience = experience;
    if (cnic) driver.cnic = cnic;
    if (joining_date) driver.joining_date = joining_date;

    await driver.save();
    roleData = driver;

  } else if (user.role === "transportAdmin") {
    const admin = await TransportAdmin.findOne({ user: userId });
    if (!admin) throw new Error("TransportAdmin record not found");

    roleData = admin;
  }

  res.status(200).json({
    message: "User updated successfully",
    user: {
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      address: user.address,
      gender: user.gender,
    },
    roleData,
  });
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
    purpose: "forgotPassword"
  };

  const htmlContent = generateOtpEmail(otp, user.full_name || user.username || "User");
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

// Student Dashboard Controllers
exports.getStudentDashboard = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    res.status(404);
    throw new Error('Student not found');
  }

  // Get student profile with assignments and notes
  const studentProfile = await Student.findOne({ user_id: studentId });
  
  // Get upcoming sessions
  const upcomingSessions = await TutoringSession.find({
    student_id: studentId,
    session_date: { $gte: new Date() },
    status: { $in: ['confirmed', 'pending'] }
  }).populate('tutor_id', 'full_name email photo_url')
    .sort({ session_date: 1 })
    .limit(10);

  // Get past sessions
  const pastSessions = await TutoringSession.find({
    student_id: studentId,
    session_date: { $lt: new Date() },
    status: 'completed'
  }).populate('tutor_id', 'full_name email photo_url')
    .sort({ session_date: -1 })
    .limit(10);

  // Get recent assignments
  const recentAssignments = studentProfile?.assignments?.slice(-5) || [];
  
  // Get recent notes
  const recentNotes = studentProfile?.notes?.slice(-5) || [];

  res.status(200).json({
    student: {
      _id: student._id,
      full_name: student.full_name,
      email: student.email,
      photo_url: student.photo_url
    },
    profile: studentProfile,
    upcomingSessions,
    pastSessions,
    recentAssignments,
    recentNotes
  });
});

exports.getStudentSessions = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;
  
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    res.status(404);
    throw new Error('Student not found');
  }

  const query = { student_id: studentId };
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

exports.updateStudentPreferences = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { preferred_subjects, preferences, learning_goals, academic_level } = req.body;
  
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    res.status(404);
    throw new Error('Student not found');
  }

  const updateData = {};
  if (preferred_subjects) updateData.preferred_subjects = preferred_subjects;
  if (preferences) updateData.preferences = preferences;
  if (learning_goals) updateData.learning_goals = learning_goals;
  if (academic_level) updateData.academic_level = academic_level;

  const updatedProfile = await Student.findOneAndUpdate(
    { user_id: studentId },
    updateData,
    { new: true }
  );

  res.status(200).json({
    message: 'Preferences updated successfully',
    profile: updatedProfile
  });
});

exports.getStudentAssignments = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  
  const studentProfile = await Student.findOne({ user_id: studentId });
  if (!studentProfile) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const assignments = studentProfile.assignments || [];
  
  // Populate tutor information for assignments
  const populatedAssignments = await Promise.all(
    assignments.map(async (assignment) => {
      if (assignment.tutor_id) {
        const tutor = await User.findById(assignment.tutor_id).select('full_name email');
        return {
          ...assignment.toObject(),
          tutor: tutor
        };
      }
      return assignment;
    })
  );

  res.status(200).json({
    assignments: populatedAssignments
  });
});

exports.getStudentNotes = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  
  const studentProfile = await Student.findOne({ user_id: studentId });
  if (!studentProfile) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const notes = studentProfile.notes || [];
  
  // Populate tutor information for notes
  const populatedNotes = await Promise.all(
    notes.map(async (note) => {
      if (note.tutor_id) {
        const tutor = await User.findById(note.tutor_id).select('full_name email');
        return {
          ...note.toObject(),
          tutor: tutor
        };
      }
      return note;
    })
  );

  res.status(200).json({
    notes: populatedNotes
  });
});

// Search for available tutors
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
      // Show all tutors, but you can uncomment these lines to only show verified tutors
      // is_verified: true,
      // is_approved: true
    };

    // Add subject filter
    if (subjects) {
      query.subjects = { $in: [new RegExp(subjects, 'i')] };
    }

    // Add academic level filter
    if (academic_level) {
      query.academic_levels_taught = { $in: [new RegExp(academic_level, 'i')] };
    }

    // Add location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Add rating filter
    if (min_rating) {
      query.average_rating = { $gte: parseFloat(min_rating) };
    }

    // Add hourly rate filter
    if (max_hourly_rate) {
      query.hourly_rate = { $lte: parseFloat(max_hourly_rate) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Handle search for tutor name or subject
    let tutors;
    if (search) {
      // Find users that match the search term
      const matchingUsers = await User.find({
        full_name: { $regex: search, $options: 'i' },
        role: 'tutor'
      }).select('_id');
      
      const userIds = matchingUsers.map(user => user._id);
      
      // Create search query
      const searchQuery = {
        ...query,
        $or: [
          { subjects_taught: { $in: [new RegExp(search, 'i')] } },
          ...(userIds.length > 0 ? [{ user_id: { $in: userIds } }] : [])
        ]
      };
      
      tutors = await TutorProfile.find(searchQuery)
        .populate('user_id', 'full_name email photo_url')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ average_rating: -1, hourly_rate: 1 });
    } else {
      tutors = await TutorProfile.find(query)
        .populate('user_id', 'full_name email photo_url')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ average_rating: -1, hourly_rate: 1 });
    }

    // Count total documents based on the same query used for fetching
    let total;
    if (search) {
      const matchingUsers = await User.find({
        full_name: { $regex: search, $options: 'i' },
        role: 'tutor'
      }).select('_id');
      
      const userIds = matchingUsers.map(user => user._id);
      
      const searchQuery = {
        ...query,
        $or: [
          { subjects_taught: { $in: [new RegExp(search, 'i')] } },
          ...(userIds.length > 0 ? [{ user_id: { $in: userIds } }] : [])
        ]
      };
      
      total = await TutorProfile.countDocuments(searchQuery);
    } else {
      total = await TutorProfile.countDocuments(query);
    }

    const formattedTutors = tutors.map(tutor => ({
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

    res.json({
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

// Get tutor details by ID
exports.getTutorDetails = asyncHandler(async (req, res) => {
  const { tutorId } = req.params;

  try {
    const tutor = await TutorProfile.findOne({ 
      _id: tutorId,
      is_verified: true,
      is_approved: true
    }).populate('user_id', 'full_name email photo_url');

    if (!tutor) {
      res.status(404);
      throw new Error("Tutor not found");
    }

    // Get tutor's recent sessions for availability context
    const recentSessions = await TutoringSession.find({
      tutor_id: tutor.user_id._id
    })
    .sort({ session_date: -1 })
    .limit(5)
    .populate('student_id', 'full_name');

    const formattedTutor = {
      _id: tutor._id,
      user_id: tutor.user_id,
      subjects_taught: tutor.subjects_taught,
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
  const { studentId } = req.params;
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
  const student = await Student.findOne({user_id:studentId});
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
exports.createTutorInquiry = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { 
    tutor_id,
    subject, 
    academic_level, 
    description, 
    preferred_schedule,
    urgency_level = 'normal'
  } = req.body;

  if (!tutor_id || !subject || !academic_level || !description) {
    res.status(400);
    throw new Error("Tutor ID, subject, academic level, and description are required");
  }

  try {
    // Create a new general tutor inquiry
    const inquiry = await TutorInquiry.create({
      student_id: studentId,
      tutor_id: tutor_id,
      subject: subject,
      academic_level: academic_level,
      description: description,
      preferred_schedule: preferred_schedule,
      urgency_level: urgency_level,
      status: 'unread',
      type: 'tutor_inquiry'
    });

    res.status(201).json({
      message: "Tutor inquiry submitted successfully",
      inquiry: inquiry
    });

  } catch (error) {
    res.status(500);
    throw new Error("Failed to submit tutor inquiry: " + error.message);
  }
});

// Get student's help requests
exports.getStudentHelpRequests = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const student = await Student.findOne({user_id:studentId});
  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const inquiries = await TutorInquiry.find({
      student_id: student._id
      // Removed type filter to show both tutor_inquiry and additional_help
    })
    .populate('tutor_id', 'full_name email')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await TutorInquiry.countDocuments({
      student_id: student._id
      // Removed type filter to count both types
    });

    res.json({
      inquiries: inquiries,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_inquiries: total,
        has_next: skip + parseInt(limit) < total,
        has_prev: parseInt(page) > 1
      }
    });

  } catch (error) {
    res.status(500);
    throw new Error("Failed to get help requests: " + error.message);
  }
});


