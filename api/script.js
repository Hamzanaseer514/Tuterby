const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import all models
const User = require('./Models/userSchema');
const TutorProfile = require('./Models/tutorProfileSchema');
const StudentProfile = require('./Models/studentProfileSchema');
const ParentProfile = require('./Models/ParentProfileSchema');
const { EducationLevel, Subject, SubjectType } = require('./Models/LookupSchema');
const TutoringSession = require('./Models/tutoringSessionSchema');
const StudentPayment = require('./Models/studentPaymentSchema');
const TutorInquiry = require('./Models/tutorInquirySchema');
const Assignment = require('./Models/assignmentSchema');
const Message = require('./Models/messageSchema');
const TutorReview = require('./Models/tutorReviewSchema');
const TutorAvailability = require('./Models/tutorAvailabilitySchema');

// Foreign names and countries data
const foreignNames = {
  tutors: [
    { name: "Alexander Petrov", country: "Russia", email: "alex.petrov@email.com" },
    { name: "Maria Rodriguez", country: "Spain", email: "maria.rodriguez@email.com" },
    { name: "Jean Dubois", country: "France", email: "jean.dubois@email.com" },
    { name: "Hans Mueller", country: "Germany", email: "hans.mueller@email.com" },
    { name: "Giulia Bianchi", country: "Italy", email: "giulia.bianchi@email.com" }
  ],
  students: [
    { name: "Emma Thompson", country: "United Kingdom", email: "emma.thompson@email.com" },
    { name: "Liam O'Connor", country: "Ireland", email: "liam.oconnor@email.com" },
    { name: "Sophie Martin", country: "Canada", email: "sophie.martin@email.com" },
    { name: "Oliver Schmidt", country: "Austria", email: "oliver.schmidt@email.com" },
    { name: "Isabella Silva", country: "Brazil", email: "isabella.silva@email.com" }
  ],
  parents: [
    { name: "David Johnson", country: "United States", email: "david.johnson@email.com" },
    { name: "Anna Kowalski", country: "Poland", email: "anna.kowalski@email.com" },
    { name: "Michael Chen", country: "China", email: "michael.chen@email.com" },
    { name: "Sarah Ahmed", country: "Egypt", email: "sarah.ahmed@email.com" },
    { name: "Roberto Santos", country: "Portugal", email: "roberto.santos@email.com" }
  ],
  admins: [
    { name: "Admin Smith", country: "Australia", email: "admin.smith@tuterby.com" },
    { name: "Admin Garcia", country: "Mexico", email: "admin.garcia@tuterby.com" },
    { name: "Admin Kim", country: "South Korea", email: "admin.kim@tuterby.com" },
    { name: "Admin Patel", country: "India", email: "admin.patel@tuterby.com" },
    { name: "Admin Anderson", country: "Sweden", email: "admin.anderson@tuterby.com" }
  ]
};

const subjectsData = {
  primary: ["Mathematics", "English", "Science", "History", "Geography"],
  secondary: ["Advanced Mathematics", "Literature", "Physics", "Chemistry", "Biology"],
  gcse: ["GCSE Mathematics", "GCSE English", "GCSE Physics", "GCSE Chemistry", "GCSE Biology"],
  alevel: ["A-Level Mathematics", "A-Level English Literature", "A-Level Physics", "A-Level Chemistry", "A-Level Biology"],
  university: ["Calculus", "Advanced Literature", "Quantum Physics", "Organic Chemistry", "Molecular Biology"]
};

const subjectTypes = ["Academic", "Language", "Arts", "Sciences"];

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Clear existing data
const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await TutorProfile.deleteMany({});
    await StudentProfile.deleteMany({});
    await ParentProfile.deleteMany({});
    await EducationLevel.deleteMany({});
    await Subject.deleteMany({});
    await SubjectType.deleteMany({});
    await TutoringSession.deleteMany({});
    await StudentPayment.deleteMany({});
    await TutorInquiry.deleteMany({});
    await Assignment.deleteMany({});
    await Message.deleteMany({});
    await TutorReview.deleteMany({});
    await TutorAvailability.deleteMany({});
    console.log('✅ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
  }
};

// Create education levels
const createEducationLevels = async () => {
  try {
    console.log('📚 Creating education levels...');
    const levels = [
      { level: "Primary", hourlyRate: 15, totalSessionsPerMonth: 8, discount: 10, isTutorCanChangeRate: false, maxSession: 2, minSession: 1 },
      { level: "Secondary", hourlyRate: 20, totalSessionsPerMonth: 8, discount: 15, isTutorCanChangeRate: true, maxSession: 3, minSession: 1 },
      { level: "GCSE", hourlyRate: 25, totalSessionsPerMonth: 12, discount: 20, isTutorCanChangeRate: true, maxSession: 4, minSession: 2 },
      { level: "A-Level", hourlyRate: 30, totalSessionsPerMonth: 16, discount: 25, isTutorCanChangeRate: true, maxSession: 5, minSession: 2 },
      { level: "University", hourlyRate: 40, totalSessionsPerMonth: 20, discount: 30, isTutorCanChangeRate: true, maxSession: 6, minSession: 3 }
    ];

    const createdLevels = await EducationLevel.insertMany(levels);
    console.log(`✅ Created ${createdLevels.length} education levels`);
    return createdLevels;
  } catch (error) {
    console.error('❌ Error creating education levels:', error.message);
    return [];
  }
};

// Create subject types
const createSubjectTypes = async () => {
  try {
    console.log('📖 Creating subject types...');
    const types = subjectTypes.map(type => ({ name: type }));
    const createdTypes = await SubjectType.insertMany(types);
    console.log(`✅ Created ${createdTypes.length} subject types`);
    return createdTypes;
  } catch (error) {
    console.error('❌ Error creating subject types:', error.message);
    return [];
  }
};

// Create subjects
const createSubjects = async (educationLevels, subjectTypes) => {
  try {
    console.log('📝 Creating subjects...');
    const subjects = [];
    const academicType = subjectTypes.find(type => type.name === 'Academic');
    const sciencesType = subjectTypes.find(type => type.name === 'Sciences');

    educationLevels.forEach(level => {
      const levelSubjects = subjectsData[level.level.toLowerCase().replace('-', '')] || [];
      levelSubjects.forEach((subjectName, index) => {
        subjects.push({
          subject_id: `${level.level.toLowerCase().replace('-', '')}_${index + 1}`,
          name: subjectName,
          level_id: level._id,
          subject_type: level.level === 'University' ? sciencesType._id : academicType._id
        });
      });
    });

    const createdSubjects = await Subject.insertMany(subjects);
    console.log(`✅ Created ${createdSubjects.length} subjects`);
    return createdSubjects;
  } catch (error) {
    console.error('❌ Error creating subjects:', error.message);
    return [];
  }
};

// Create users
const createUsers = async () => {
  try {
    console.log('👥 Creating users...');
    const users = [];

    // Hash passwords before creating users
    const saltRounds = 10;
    const tutorPassword = await bcrypt.hash('password123', saltRounds);
    const studentPassword = await bcrypt.hash('password123', saltRounds);
    const parentPassword = await bcrypt.hash('password123', saltRounds);
    const adminPassword = await bcrypt.hash('admin123', saltRounds);

    // Create tutors
    foreignNames.tutors.forEach(tutor => {
      users.push({
        full_name: tutor.name,
        email: tutor.email,
        password: tutorPassword,
        phone_number: '+1234567890',
        role: 'tutor',
        age: Math.floor(Math.random() * 20) + 25, // 25-45
        photo_url: '',
        is_google_user: false,
        is_verified: 'active',
        isEmailVerified: true
      });
    });

    // Create students
    foreignNames.students.forEach(student => {
      users.push({
        full_name: student.name,
        email: student.email,
        password: studentPassword,
        phone_number: '+1234567890',
        role: 'student',
        age: Math.floor(Math.random() * 10) + 12, // 12-22
        photo_url: '',
        is_google_user: false,
        is_verified: 'active',
        isEmailVerified: true
      });
    });

    // Create parents
    foreignNames.parents.forEach(parent => {
      users.push({
        full_name: parent.name,
        email: parent.email,
        password: parentPassword,
        phone_number: '+1234567890',
        role: 'parent',
        age: Math.floor(Math.random() * 20) + 35, // 35-55
        photo_url: '',
        is_google_user: false,
        is_verified: 'active',
        isEmailVerified: true
      });
    });

    // Create admins
    foreignNames.admins.forEach(admin => {
      users.push({
        full_name: admin.name,
        email: admin.email,
        password: adminPassword,
        phone_number: '+1234567890',
        role: 'admin',
        age: Math.floor(Math.random() * 15) + 30, // 30-45
        photo_url: '',
        is_google_user: false,
        is_verified: 'active',
        isEmailVerified: true
      });
    });

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users with bcrypt hashed passwords`);
    return createdUsers;
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    return [];
  }
};

// Create tutor profiles
const createTutorProfiles = async (users, educationLevels, subjects) => {
  try {
    console.log('👨‍🏫 Creating tutor profiles...');
    const tutors = users.filter(user => user.role === 'tutor');
    const profiles = [];

    tutors.forEach(tutor => {
      const randomLevels = educationLevels.slice(0, Math.floor(Math.random() * 3) + 2); // 2-4 levels
      const academicLevelsTaught = randomLevels.map(level => ({
        educationLevel: level._id,
        name: level.level,
        hourlyRate: level.hourlyRate,
        totalSessionsPerMonth: level.totalSessionsPerMonth,
        discount: level.discount,
        monthlyRate: level.monthlyRate
      }));

      profiles.push({
        user_id: tutor._id,
        bio: `Experienced tutor from ${foreignNames.tutors.find(t => t.email === tutor.email)?.country || 'International'} with expertise in multiple subjects.`,
        qualifications: 'Bachelor\'s Degree in Education',
        experience_years: Math.floor(Math.random() * 10) + 2, // 2-12 years
        subjects: subjects.slice(0, Math.floor(Math.random() * 5) + 3).map(s => s._id), // 3-7 subjects
        academic_levels_taught: academicLevelsTaught,
        location: foreignNames.tutors.find(t => t.email === tutor.email)?.country || 'International',
        average_rating: Math.random() * 2 + 3, // 3-5 rating
        total_sessions: Math.floor(Math.random() * 100) + 10,
        is_background_checked: Math.random() > 0.3,
        is_reference_verified: Math.random() > 0.4,
        is_qualification_verified: Math.random() > 0.2,
        is_verified: Math.random() > 0.5,
        profile_status: Math.random() > 0.7 ? 'approved' : 'pending'
      });
    });

    const createdProfiles = await TutorProfile.insertMany(profiles);
    console.log(`✅ Created ${createdProfiles.length} tutor profiles`);
    return createdProfiles;
  } catch (error) {
    console.error('❌ Error creating tutor profiles:', error.message);
    return [];
  }
};

// Create student profiles
const createStudentProfiles = async (users, educationLevels, subjects) => {
  try {
    console.log('👨‍🎓 Creating student profiles...');
    const students = users.filter(user => user.role === 'student');
    const profiles = [];

    students.forEach(student => {
      const randomLevel = educationLevels[Math.floor(Math.random() * educationLevels.length)];
      const randomSubjects = subjects.filter(s => s.level_id.toString() === randomLevel._id.toString()).slice(0, Math.floor(Math.random() * 3) + 2);

      profiles.push({
        user_id: student._id,
        academic_level: randomLevel._id,
        learning_goals: 'Improve academic performance and develop strong study skills',
        preferred_subjects: randomSubjects.map(s => s._id),
        availability: [
          { day: 'Monday', duration: '3-4 hours' },
          { day: 'Wednesday', duration: '3-4 hours' },
          { day: 'Friday', duration: '1-2 hours' }
        ],
        parent_id: null, // Will be updated later
        hired_tutors: [],
        profile_status: 'active'
      });
    });

    const createdProfiles = await StudentProfile.insertMany(profiles);
    console.log(`✅ Created ${createdProfiles.length} student profiles`);
    return createdProfiles;
  } catch (error) {
    console.error('❌ Error creating student profiles:', error.message);
    return [];
  }
};

// Create parent profiles
const createParentProfiles = async (users, studentProfiles) => {
  try {
    console.log('👨‍👩‍👧‍👦 Creating parent profiles...');
    const parents = users.filter(user => user.role === 'parent');
    const profiles = [];

    parents.forEach((parent, index) => {
      // Assign 1-2 students to each parent
      const assignedStudents = studentProfiles.slice(index * 2, (index + 1) * 2).map(s => s._id);
      
      profiles.push({
        user_id: parent._id,
        students: assignedStudents,
        profile_status: 'active'
      });
    });

    const createdProfiles = await ParentProfile.insertMany(profiles);
    console.log(`✅ Created ${createdProfiles.length} parent profiles`);
    return createdProfiles;
  } catch (error) {
    console.error('❌ Error creating parent profiles:', error.message);
    return [];
  }
};

// Update student profiles with parent references
const updateStudentProfilesWithParents = async (studentProfiles, parentProfiles) => {
  try {
    console.log('🔗 Linking students with parents...');
    for (let i = 0; i < studentProfiles.length; i += 2) {
      const parentIndex = Math.floor(i / 2);
      if (parentProfiles[parentIndex]) {
        await StudentProfile.findByIdAndUpdate(studentProfiles[i]._id, {
          parent_id: parentProfiles[parentIndex]._id
        });
        if (studentProfiles[i + 1]) {
          await StudentProfile.findByIdAndUpdate(studentProfiles[i + 1]._id, {
            parent_id: parentProfiles[parentIndex]._id
          });
        }
      }
    }
    console.log('✅ Students linked with parents');
  } catch (error) {
    console.error('❌ Error linking students with parents:', error.message);
  }
};

// Create sample tutoring sessions
const createTutoringSessions = async (tutorProfiles, studentProfiles, subjects, educationLevels, studentPayments) => {
  try {
    console.log('📅 Creating tutoring sessions...');
    const sessions = [];

    for (let i = 0; i < 10; i++) {
      const tutor = tutorProfiles[Math.floor(Math.random() * tutorProfiles.length)];
      const student = studentProfiles[Math.floor(Math.random() * studentProfiles.length)];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const level = educationLevels[Math.floor(Math.random() * educationLevels.length)];

      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() + Math.floor(Math.random() * 30));

      // Find a payment for this student-tutor combination
      const studentPayment = studentPayments.find(p => 
        p.student_id.toString() === student._id.toString() && 
        p.tutor_id.toString() === tutor._id.toString()
      );

      const durationHours = Math.random() > 0.5 ? 1 : 1.5;
      const status = ['pending', 'confirmed', 'completed'][Math.floor(Math.random() * 3)];

      sessions.push({
        tutor_id: tutor._id,
        student_ids: [student._id],
        student_payments: studentPayment ? [{
          student_id: student._id,
          payment_id: studentPayment._id
        }] : [],
        subject: subject._id,
        session_date: sessionDate,
        academic_level: level._id,
        duration_hours: durationHours,
        hourly_rate: level.hourlyRate,
        total_earnings: level.hourlyRate * durationHours,
        status: status,
        notes: 'Regular tutoring session',
        rating: status === 'completed' && Math.random() > 0.5 ? Math.floor(Math.random() * 2) + 4 : null,
        feedback: status === 'completed' && Math.random() > 0.7 ? 'Great session, student made good progress' : '',
        student_ratings: status === 'completed' && Math.random() > 0.5 ? [{
          student_id: student._id,
          rating: Math.floor(Math.random() * 2) + 4,
          feedback: 'Excellent tutor!',
          rated_at: new Date()
        }] : [],
        student_responses: [{
          student_id: student._id,
          status: ['pending', 'confirmed', 'declined'][Math.floor(Math.random() * 3)],
          responded_at: Math.random() > 0.5 ? new Date() : null,
          note: Math.random() > 0.7 ? 'Looking forward to the session' : ''
        }],
        meeting_link: status === 'confirmed' || status === 'completed' ? `https://meet.google.com/session-${Math.random().toString(36).substr(2, 9)}` : '',
        meeting_link_sent_at: status === 'confirmed' || status === 'completed' ? new Date() : null,
        completed_at: status === 'completed' ? new Date() : null
      });
    }

    const createdSessions = await TutoringSession.insertMany(sessions);
    console.log(`✅ Created ${createdSessions.length} tutoring sessions`);
    return createdSessions;
  } catch (error) {
    console.error('❌ Error creating tutoring sessions:', error.message);
    return [];
  }
};

// Create sample payments
const createStudentPayments = async (studentProfiles, tutorProfiles, subjects, educationLevels) => {
  try {
    console.log('💳 Creating student payments...');
    const payments = [];

    for (let i = 0; i < 8; i++) {
      const student = studentProfiles[Math.floor(Math.random() * studentProfiles.length)];
      const tutor = tutorProfiles[Math.floor(Math.random() * tutorProfiles.length)];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const level = educationLevels[Math.floor(Math.random() * educationLevels.length)];

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const paymentType = Math.random() > 0.5 ? 'monthly' : 'hourly';
      const baseAmount = paymentType === 'monthly' ? level.hourlyRate * level.totalSessionsPerMonth : level.hourlyRate;
      const paymentStatus = ['pending', 'paid'][Math.floor(Math.random() * 2)];

      payments.push({
        student_id: student._id,
        tutor_id: tutor._id,
        subject: subject._id,
        academic_level: level._id,
        payment_type: paymentType,
        base_amount: baseAmount,
        discount_percentage: level.discount,
        isParentPayment: Math.random() > 0.7,
        studentName: 'Student',
        monthly_amount: paymentType === 'monthly' ? level.monthlyRate : null,
        total_sessions_per_month: paymentType === 'monthly' ? level.totalSessionsPerMonth : null,
        validity_start_date: startDate,
        validity_end_date: endDate,
        sessions_remaining: paymentType === 'monthly' ? level.totalSessionsPerMonth : 1,
        payment_status: paymentStatus,
        validity_status: paymentStatus === 'paid' ? 'active' : 'pending',
        payment_method: ['card', 'bank_transfer', 'paypal'][Math.floor(Math.random() * 3)],
        payment_date: paymentStatus === 'paid' ? new Date() : null,
        request_date: new Date(),
        request_notes: 'Monthly tutoring package',
        academic_level_paid: paymentStatus === 'paid',
        is_active: true,
        currency: 'GBP',
        gateway_transaction_id: paymentStatus === 'paid' ? `txn_${Math.random().toString(36).substr(2, 9)}` : null,
        gateway_response: paymentStatus === 'paid' ? { status: 'success', transaction_id: `txn_${Math.random().toString(36).substr(2, 9)}` } : null,
        is_renewal: false
      });
    }

    const createdPayments = await StudentPayment.insertMany(payments);
    console.log(`✅ Created ${createdPayments.length} student payments`);
    return createdPayments;
  } catch (error) {
    console.error('❌ Error creating student payments:', error.message);
    return [];
  }
};

// Create sample messages
const createMessages = async (users) => {
  try {
    console.log('💬 Creating messages...');
    const messages = [];
    const tutors = users.filter(user => user.role === 'tutor');
    const students = users.filter(user => user.role === 'student');

    for (let i = 0; i < 15; i++) {
      const tutor = tutors[Math.floor(Math.random() * tutors.length)];
      const student = students[Math.floor(Math.random() * students.length)];

      messages.push({
        studentId: student._id,
        tutorId: tutor._id,
        message: 'Hello, I need help with my homework. Can you assist me?',
        response: Math.random() > 0.5 ? 'Of course! I\'d be happy to help you with your homework.' : null,
        status: Math.random() > 0.5 ? 'answered' : 'unanswered'
      });
    }

    const createdMessages = await Message.insertMany(messages);
    console.log(`✅ Created ${createdMessages.length} messages`);
    return createdMessages;
  } catch (error) {
    console.error('❌ Error creating messages:', error.message);
    return [];
  }
};

// Create sample tutor reviews
const createTutorReviews = async (studentProfiles, tutorProfiles, parentProfiles) => {
  try {
    console.log('⭐ Creating tutor reviews...');
    const reviews = [];

    // Create student reviews
    for (let i = 0; i < 8; i++) {
      const student = studentProfiles[Math.floor(Math.random() * studentProfiles.length)];
      const tutor = tutorProfiles[Math.floor(Math.random() * tutorProfiles.length)];

      reviews.push({
        student_id: student._id,
        tutor_id: tutor._id,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        review_text: 'Excellent tutor! Very patient and explains concepts clearly.',
        review_type: 'student',
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Create parent reviews
    for (let i = 0; i < 4; i++) {
      const parent = parentProfiles[Math.floor(Math.random() * parentProfiles.length)];
      const tutor = tutorProfiles[Math.floor(Math.random() * tutorProfiles.length)];

      reviews.push({
        parent_id: parent._id,
        tutor_id: tutor._id,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        review_text: 'Great tutor! My child has improved significantly.',
        review_type: 'parent',
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    const createdReviews = await TutorReview.insertMany(reviews);
    console.log(`✅ Created ${createdReviews.length} tutor reviews`);
    return createdReviews;
  } catch (error) {
    console.error('❌ Error creating tutor reviews:', error.message);
    return [];
  }
};

// Create tutor availability
const createTutorAvailability = async (tutorProfiles) => {
  try {
    console.log('📅 Creating tutor availability...');
    const availabilities = [];

    tutorProfiles.forEach(tutor => {
      availabilities.push({
        tutor_id: tutor._id,
        general_availability: {
          monday: { start: "09:00", end: "17:00", available: true },
          tuesday: { start: "09:00", end: "17:00", available: true },
          wednesday: { start: "09:00", end: "17:00", available: true },
          thursday: { start: "09:00", end: "17:00", available: true },
          friday: { start: "09:00", end: "17:00", available: true },
          saturday: { start: "09:00", end: "17:00", available: Math.random() > 0.5 },
          sunday: { start: "09:00", end: "17:00", available: Math.random() > 0.7 }
        },
        minimum_notice_hours: Math.floor(Math.random() * 4) + 2, // 2-6 hours
        maximum_advance_days: Math.floor(Math.random() * 20) + 10, // 10-30 days
        session_durations: [30, 60, 90, 120],
        blackout_dates: [],
        is_accepting_bookings: true
      });
    });

    const createdAvailabilities = await TutorAvailability.insertMany(availabilities);
    console.log(`✅ Created ${createdAvailabilities.length} tutor availability records`);
    return createdAvailabilities;
  } catch (error) {
    console.error('❌ Error creating tutor availability:', error.message);
    return [];
  }
};

// Create sample tutor inquiries
const createTutorInquiries = async (studentProfiles, tutorProfiles) => {
  try {
    console.log('❓ Creating tutor inquiries...');
    const inquiries = [];

    for (let i = 0; i < 10; i++) {
      const student = studentProfiles[Math.floor(Math.random() * studentProfiles.length)];
      const tutor = Math.random() > 0.3 ? tutorProfiles[Math.floor(Math.random() * tutorProfiles.length)] : null;

      inquiries.push({
        tutor_id: tutor ? tutor._id : null,
        student_id: student._id,
        subject: ['Mathematics', 'English', 'Science', 'Physics', 'Chemistry'][Math.floor(Math.random() * 5)],
        academic_level: ['Primary', 'Secondary', 'GCSE', 'A-Level', 'University'][Math.floor(Math.random() * 5)],
        description: 'I need help understanding this topic better',
        message: 'Hello, I would like to schedule some tutoring sessions. Can you help me?',
        preferred_schedule: 'Weekdays after 4 PM',
        urgency_level: ['low', 'normal', 'high', 'urgent'][Math.floor(Math.random() * 4)],
        type: ['additional_help', 'tutor_inquiry'][Math.floor(Math.random() * 2)],
        status: ['pending', 'in_progress', 'completed', 'unread', 'read', 'replied'][Math.floor(Math.random() * 6)],
        response_time_minutes: Math.random() > 0.5 ? Math.floor(Math.random() * 120) + 30 : null,
        replied_at: Math.random() > 0.6 ? new Date() : null,
        reply_message: Math.random() > 0.6 ? 'I would be happy to help you with this subject!' : null
      });
    }

    const createdInquiries = await TutorInquiry.insertMany(inquiries);
    console.log(`✅ Created ${createdInquiries.length} tutor inquiries`);
    return createdInquiries;
  } catch (error) {
    console.error('❌ Error creating tutor inquiries:', error.message);
    return [];
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();
    await clearDatabase();

    // Create base data
    const educationLevels = await createEducationLevels();
    const subjectTypes = await createSubjectTypes();
    const subjects = await createSubjects(educationLevels, subjectTypes);
    const users = await createUsers();

    // Create profiles
    const tutorProfiles = await createTutorProfiles(users, educationLevels, subjects);
    const studentProfiles = await createStudentProfiles(users, educationLevels, subjects);
    const parentProfiles = await createParentProfiles(users, studentProfiles);

    // Link students with parents
    await updateStudentProfilesWithParents(studentProfiles, parentProfiles);

    // Create sample data
    const studentPayments = await createStudentPayments(studentProfiles, tutorProfiles, subjects, educationLevels);
    await createTutoringSessions(tutorProfiles, studentProfiles, subjects, educationLevels, studentPayments);
    await createMessages(users);
    await createTutorReviews(studentProfiles, tutorProfiles, parentProfiles);
    await createTutorAvailability(tutorProfiles);
    await createTutorInquiries(studentProfiles, tutorProfiles);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Education Levels: ${educationLevels.length}`);
    console.log(`- Subject Types: ${subjectTypes.length}`);
    console.log(`- Subjects: ${subjects.length}`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Tutor Profiles: ${tutorProfiles.length}`);
    console.log(`- Student Profiles: ${studentProfiles.length}`);
    console.log(`- Parent Profiles: ${parentProfiles.length}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
