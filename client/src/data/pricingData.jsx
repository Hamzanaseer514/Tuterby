import React from 'react';
import { BookOpen, Target, Award, Crown, Sparkles, Layers, GraduationCap, ShieldCheck, Baby as Child, Users, Brain, Zap, Star, FileText, KeyRound as UsersRound } from 'lucide-react';

export const hourlyPricingTiersData = [
  {
    name: 'Primary & Secondary',
    priceHourly: 22,
    features: [
      'KS1, KS2 & KS3 Focus',
      'Engaging & Fun Learning Methods',
      'Building Core Literacy & Numeracy',
      'Developing Confidence & Curiosity',
      'Introduction to Exam Skills',
      'Regular Parent-Teacher Collaboration',
      'Age-Appropriate Resources',
    ],
    icon: <Child className="w-8 h-8 text-primary" />,
    cta: 'Choose Primary/Secondary',
    popular: false,
    description: 'Nurturing young learners with foundational support for Key Stages 1, 2 & 3.',
    levelCategory: 'Primary/Secondary (KS1-KS3)',
    type: 'hourly_primary_secondary',
    category: 'hourly',
  },
  {
    name: 'Foundational Levels',
    priceHourly: 25,
    features: [
      'GCSE & O-Level Core Subjects',
      'Exam Board Specific (AQA, Edexcel, OCR, etc.)',
      'Experienced & Vetted Tutors',
      'Personalized Learning Plans',
      'Regular Progress Monitoring',
      'Interactive Online Platform Access',
      'Homework & Revision Support',
    ],
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    cta: 'Choose Foundational',
    popular: false,
    description: 'Ideal for students building strong foundations in GCSEs or O-Levels for future success.',
    levelCategory: 'GCSE/O-Level',
    type: 'hourly_foundational',
    category: 'hourly',
  },
  {
    name: 'Advanced Levels',
    priceHourly: 30,
    features: [
      'A-Level & BTEC Specialist Tutors',
      'In-depth Subject Mastery',
      'Advanced Exam Techniques & Strategies',
      'Coursework & NEA Guidance',
      'Flexible Scheduling Options',
      'Access to Premium Learning Resources',
      'UCAS Application Advice (Basic)',
    ],
    icon: <Target className="w-8 h-8 text-primary" />,
    cta: 'Choose Advanced',
    popular: true,
    description: 'Perfect for A-Level or BTEC students targeting top grades and strong university or career pathways.',
    levelCategory: 'A-Level/BTEC',
    type: 'hourly_advanced',
    category: 'hourly',
  },
  {
    name: 'Higher Education & IB',
    priceHourly: 45,
    features: [
      'Undergraduate & IB Diploma Tutors',
      'University-Level Subject Support',
      'International Baccalaureate Specialists',
      'Dissertation & Thesis Guidance (Basic)',
      'Advanced Critical Thinking Skills',
      'Dedicated Mentorship & Support',
      'Preparation for Academic Rigor',
    ],
    icon: <Award className="w-8 h-8 text-primary" />,
    cta: 'Choose Higher Ed & IB',
    popular: false,
    description: 'Comprehensive support for undergraduate students and those undertaking the challenging IB Diploma Programme.',
    levelCategory: 'Undergraduate/IB',
    type: 'hourly_higher_ib',
    category: 'hourly',
  },
];

export const familyRoyaltyPlansData = [
  {
    name: "Silver Family Royalty",
    level: "All Levels (GCSE, A-Level, IB, BTEC, UG)",
    levelDisplayName: "All Levels",
    kids: "Up to 2 Kids",
    price: 1700, // Changed from priceMonthly for RoyaltyCard
    hoursPerStudent: 40,
    subjectsPerStudent: 6,
    savings: "Up to 33%",
    icon: <Crown className="w-10 h-10" />, // Color will be handled by RoyaltyCard
    borderColor: "border-sky-500",
    gradientFrom: "from-sky-600",
    gradientTo: "to-cyan-400",
    type: "family_royalty_silver",
    category: "family_royalty",
    features: [
      "Dedicated academic advisor & success manager",
      "Priority tutor matching with top-tier educators",
      "Flexible hour distribution across family members",
      "Coverage of up to 6 subjects/modules per student",
      "Monthly progress reports & strategic review calls",
      "Access to 2 exclusive skill-building workshops per year",
      "Personalized Roadmap & Goal Setting Sessions for each child",
    ],
    description: "Ideal for smaller families seeking comprehensive, consistent, high-quality tutoring across various levels with significant savings.",
    cta: "Enquire Silver Family"
  },
  {
    name: "Gold Family Royalty",
    level: "All Levels (GCSE, A-Level, IB, BTEC, UG)",
    levelDisplayName: "All Levels",
    kids: "Up to 3 Kids",
    price: 2500, // Changed from priceMonthly for RoyaltyCard
    hoursPerStudent: 40,
    subjectsPerStudent: 6,
    savings: "Up to 33%+", 
    icon: <Crown className="w-10 h-10" />, // Color will be handled by RoyaltyCard
    borderColor: "border-amber-500",
    gradientFrom: "from-amber-500",
    gradientTo: "to-yellow-400",
    type: "family_royalty_gold",
    category: "family_royalty",
    features: [
      "All Silver benefits, plus:",
      "Enhanced priority support & dedicated senior success manager",
      "Sibling collaboration & peer study group facilitation",
      "Complimentary diagnostic & aptitude assessments for each child",
      "Access to 4 exclusive skill-building workshops per year",
      "Bi-annual comprehensive academic & future-planning strategy review",
      "University application or early career guidance add-on service",
    ],
    description: "The ultimate package for families committed to across-the-board academic excellence, offering maximum value, flexibility, and support for all children's needs.",
    cta: "Enquire Gold Family"
  }
];

export const undergraduateRoyaltyPlansData = [
  {
    name: "UG Silver Royalty",
    level: "Undergraduate",
    price: 1000, // Changed from priceMonthly for RoyaltyCard
    hoursPerStudent: 40, 
    modulesCovered: "Up to 4 modules",
    icon: <GraduationCap className="w-10 h-10" />, // Color will be handled by RoyaltyCard
    borderColor: "border-indigo-500",
    gradientFrom: "from-indigo-500",
    gradientTo: "to-purple-500",
    type: "undergrad_royalty_silver",
    category: "undergrad_royalty",
    features: [
      "Dedicated Undergraduate Academic Mentor",
      "Expert support for up to 4 core modules",
      "Up to 40 hours of focused tutoring per month",
      "Strategic exam preparation & revision techniques",
      "Assignment structuring & feedback sessions",
      "Access to curated university-level resources",
      "Time management & study skills coaching",
    ],
    description: "Targeted support for undergraduates to excel in core modules and build strong academic foundations.",
    cta: "Enquire UG Silver"
  },
  {
    name: "UG Gold Royalty",
    level: "Undergraduate",
    price: 1250, // Changed from priceMonthly for RoyaltyCard
    hoursPerStudent: 40, 
    modulesCovered: "All core modules (up to 6)",
    icon: <ShieldCheck className="w-10 h-10" />, // Color will be handled by RoyaltyCard
    borderColor: "border-teal-500",
    gradientFrom: "from-teal-500",
    gradientTo: "to-emerald-500",
    type: "undergrad_royalty_gold",
    category: "undergrad_royalty",
    features: [
      "All UG Silver benefits, plus:",
      "Comprehensive support for all core modules (up to 6)",
      "In-depth dissertation/thesis guidance & support",
      "Advanced research & academic writing skills development",
      "Presentation & viva preparation",
      "Networking opportunities & career insights (where applicable)",
      "Critical thinking & problem-solving masterclasses",
    ],
    description: "Premier, all-inclusive support for undergraduates aiming for distinction, including dissertation and advanced skills.",
    cta: "Enquire UG Gold"
  }
];

export const premiumServicesData = [
  {
    name: "CONTENT ON DEMAND & Mentorship Programme",
    priceHourly: 35, 
    description: "A comprehensive, research-backed service to elevate student performance through personalised content and expert mentorship. Starting from £35/hour.",
    levelCategory: "All Levels (EYFS to A-Levels & Beyond)",
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    cta: "Enquire About Mentorship",
    type: "mentorship_program",
    category: "premium_services",
    features: [
      "Bespoke Curriculum-Aligned Worksheets (EYFS to A-Levels)",
      "Custom Test Papers with Grading & Feedback",
      "High-Level Challenger Questions for Top-Tier Achievement",
      "Interactive Mind Maps & Flow Charts for Visual Learning",
      "Digital & Printable Flashcards with Spaced Repetition",
      "Concise Short Notes for Fast-Track Revision",
      "SEN-Inclusive Educational Resources",
      "Parental Support Revision Packs",
      "Exam Technique & Time Management Modules",
      "On-Demand Content Creation (24–48 Hour Turnaround)",
    ],
    mentorshipFeatures: [
      "Personalised Study & Revision Schedules",
      "One-to-One Mentorship & Academic Coaching",
      "Meditation & Focus Sessions for Mental Clarity",
      "Targeted Strategies for Grade Improvement",
      "Expert Guidance on Exam Preparation & Performance",
    ],
    popular: true,
  }
];


export const generalBenefitsData = [
  {
    icon: <Users className="w-10 h-10 text-secondary" />,
    title: 'Elite Tutors, Rigorously Vetted',
    description: 'Access a network of subject matter experts, all meticulously screened and trained to inspire academic excellence.',
  },
  {
    icon: <Brain className="w-10 h-10 text-secondary" />,
    title: 'AI-Powered Personalized Learning',
    description: 'Experience truly bespoke learning paths, adapting in real-time to your unique pace, style, and academic goals.',
  },
  {
    icon: <Zap className="w-10 h-10 text-secondary" />,
    title: 'Unmatched Scheduling Flexibility',
    description: 'Seamlessly integrate top-tier tutoring into your life with adaptable scheduling for online and in-person sessions.',
  },
  {
    icon: <Star className="w-10 h-10 text-secondary" />,
    title: 'Transformative Results, Guaranteed',
    description: 'Witness tangible improvements in grades, critical thinking, and confidence, backed by our commitment to your success.',
  },
];

export const filterButtonsData = [
  { label: 'Show All', filter: 'all', icon: <Layers className="mr-2 h-4 w-4" /> },
  { label: 'Hourly Plans', filter: 'hourly', icon: <BookOpen className="mr-2 h-4 w-4" /> },
  { label: 'Family Royalty', filter: 'family_royalty', icon: <Crown className="mr-2 h-4 w-4" /> },
  { label: 'Undergrad Royalty', filter: 'undergrad_royalty', icon: <GraduationCap className="mr-2 h-4 w-4" /> },
  { label: 'Premium Services', filter: 'premium_services', icon: <Sparkles className="mr-2 h-4 w-4" /> },
];