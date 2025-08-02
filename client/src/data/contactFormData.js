import { 
    gcseSubjectsList, 
    aLevelSubjectsList, 
    ibSubjectsList, 
    btecSubjectsList,
    undergraduateDegreeAreasList 
  } from './subjectsPageData';
  
  const primarySecondarySubjects = [
    "English (KS1-KS3)", "Mathematics (KS1-KS3)", "Science (KS1-KS3)", 
    "History (KS2-KS3)", "Geography (KS2-KS3)", "Computing (KS2-KS3)", "Art & Design (KS1-KS3)"
  ];
  
  export const levels = [
    "Primary Level (KS1-KS2)",
    "Secondary Level (KS3)",
    "GCSE / O-Level",
    "A-Level / AS-Level",
    "IB (International Baccalaureate)",
    "BTEC (Vocational)",
    "Undergraduate Degree",
    "Other / Not Sure"
  ];

  const undergraduateSubjectSample = [
    ...Object.keys(undergraduateDegreeAreasList),
    "Principles of Management (Business Sample)",
    "Introduction to Programming (Python/Java) (Computing Sample)",
    "Digital Photography (Creative Arts Sample)",
    "Engineering Mathematics (Engineering Sample)",
    "Introduction to Psychology (Humanities Sample)",
    "General Biology (Sciences Sample)",
    "Introduction to Linguistics (Languages Sample)"
  ].slice(0, 20);

  export const subjectsByLevel = {
    "Primary Level (KS1-KS2)": primarySecondarySubjects.filter(s => s.includes("KS1") || s.includes("KS2")),
    "Secondary Level (KS3)": primarySecondarySubjects.filter(s => s.includes("KS3")),
    "GCSE / O-Level": gcseSubjectsList,
    "A-Level / AS-Level": aLevelSubjectsList,
    "IB (International Baccalaureate)": ibSubjectsList,
    "BTEC (Vocational)": btecSubjectsList,
    "Undergraduate Degree": undergraduateSubjectSample,
    "Other / Not Sure": ["General Enquiry", "Study Skills", "Exam Preparation Techniques"]
  };

  export const preferredContact = [
    "Email",
    "Phone Call",
    "WhatsApp Message"
  ];

  export const tutoringFormat = [
    "Online Tutoring",
    "In-Person Tutoring (Check Availability)",
    "Hybrid (Mix of Online & In-Person)"
  ];

  export const howHeard = [
    "Search Engine (Google, Bing, etc.)",
    "Social Media (Facebook, Instagram, etc.)",
    "Referral from a Friend/Family",
    "School Recommendation",
    "Online Advertisement",
    "Local Event / Flyer",
    "Other"
  ];

  export const planTypes = [
    "Primary & Secondary Hourly",
    "Foundational Levels Hourly",
    "Advanced Levels Hourly",
    "Higher Ed & IB Hourly",
    "Silver Family Royalty",
    "Gold Family Royalty",
    "UG Silver Royalty",
    "UG Gold Royalty",
    "Custom Plan Enquiry"
  ];

  export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  export const hours = ['1-2 hours', '2-3 hours', '3-4 hours', '4-5 hours', '5+ hours'];

  export const contactFormData = {
    levels,
    subjectsByLevel,
    preferredContact,
    tutoringFormat,
    howHeard,
    planTypes,
    days,
    hours
  };