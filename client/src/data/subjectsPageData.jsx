import React from 'react';
import { BookMarked, BarChart3, Feather, TestTube2, Palette, Languages, Globe2, Briefcase, Cpu, Film, Music, Landmark, Microscope, Calculator, Users, Brain, Lightbulb, DraftingCompass, Code, Cloud, ShieldCheck, Network, Database, Gamepad, Brush, Server, GitFork, Package, TerminalSquare as SquareTerminal, Scaling, LockKeyhole, Route, BookOpen, ListChecks, Zap, Award, Target, KeyRound as UsersRound, Puzzle, TrendingUp, Microscope as Telescope, MessageSquare as MessageSquareQuote, PenTool, Users2 as UsersThree, WrapText as ClipboardText } from 'lucide-react';
import { iconMap as subjectIconMap, getIcon, defaultIcon } from '@/components/subjects/subjectIconMap';

const mapSubjectsWithIcons = (subjectsArray, isPremiumService = false) => {
  return subjectsArray.map(subject => ({
    name: typeof subject === 'string' ? subject : subject.name,
    icon: getIcon(typeof subject === 'string' ? subject : subject.name) || defaultIcon,
    blogSlug: typeof subject === 'object' && subject.blogSlug ? subject.blogSlug : null, 
    isPremiumFeature: isPremiumService || (typeof subject === 'object' && subject.isPremiumFeature) || false,
  }));
};

export const undergraduateDegreeAreasList = {
  "Business & Management": {
    icon: Briefcase,
    modules: ["Principles of Management", "Marketing Fundamentals", "Business Ethics & CSR", "Organisational Behaviour", "Strategic Management", "International Business", "Entrepreneurship & Innovation", "Human Resource Management", "Operations Management", "Financial Accounting for Managers"]
  },
  "Computing & IT": {
    icon: Cpu,
    modules: ["Introduction to Programming (Python/Java)", "Data Structures & Algorithms", "Web Development (HTML, CSS, JavaScript)", "Database Management Systems (SQL)", "Computer Networks", "Operating Systems", "Software Engineering Principles", "Cybersecurity Fundamentals", "Artificial Intelligence Basics", "Cloud Computing Concepts"]
  },
  "Creative Arts & Media": {
    icon: Palette,
    modules: ["Digital Photography", "Graphic Design Principles", "Introduction to Film Studies", "Creative Writing Workshop", "Media & Communication Theory", "Animation Basics", "Sound Design & Production", "User Interface (UI) Design", "User Experience (UX) Research", "History of Art & Design"]
  },
  "Engineering": {
    icon: DraftingCompass,
    modules: ["Engineering Mathematics", "Statics & Dynamics", "Thermodynamics", "Fluid Mechanics", "Electrical Circuits", "Materials Science", "Engineering Design Process", "Control Systems", "Digital Logic Design", "Sustainable Engineering"]
  },
  "Humanities & Social Sciences": {
    icon: Users,
    modules: ["Introduction to Psychology", "Sociological Theories", "World History Survey", "Political Ideologies", "Philosophical Inquiry", "Cultural Anthropology", "Geographical Concepts", "Research Methods in Social Sciences", "Critical Thinking & Argumentation", "Contemporary Social Issues"]
  },
  "Sciences": {
    icon: Microscope,
    modules: ["General Biology", "General Chemistry", "Introductory Physics", "Environmental Science", "Human Anatomy & Physiology", "Cellular & Molecular Biology", "Organic Chemistry", "Genetics", "Ecology & Evolution", "Scientific Writing & Communication"]
  },
  "Languages & Linguistics": {
    icon: Languages,
    modules: ["Introduction to Linguistics", "Phonetics & Phonology", "Syntax & Grammar", "Semantics & Pragmatics", "Second Language Acquisition", "Sociolinguistics", "Historical Linguistics", "Computational Linguistics Basics", "Language & Culture", "TESOL Fundamentals"]
  }
};

const mapUgAllModulesWithIcons = () => {
  let allModules = [];
  for (const categoryKey in undergraduateDegreeAreasList) {
    const category = undergraduateDegreeAreasList[categoryKey];
    const categoryModules = category.modules.map(moduleName => ({
      name: moduleName,
      category: categoryKey,
      icon: getIcon(moduleName) || category.icon || defaultIcon,
      isPremiumFeature: false, 
    }));
    allModules = allModules.concat(categoryModules);
  }
  return allModules;
};


const premiumServiceFeatures = [
  { name: "Concise Short Notes & Summaries", icon: PenTool, blogSlug: "concise-short-notes-dynamic-summaries" },
  { name: "Digital & Printable Flashcards", icon: Package, blogSlug: "digital-printable-flashcards-active-recall" },
  { name: "Interactive Mind Maps & Flow Charts", icon: GitFork, blogSlug: "interactive-mind-maps-flow-charts-visual-learning" },
  { name: "Bespoke Curriculum Worksheets", icon: Feather, blogSlug: "bespoke-curriculum-worksheets-targeted-practice" },
  { name: "Custom Test Papers & Grading", icon: TestTube2, blogSlug: "custom-test-papers-grading-exam-simulation" },
  { name: "High-Level Challenger Questions", icon: Target, blogSlug: "high-level-challenger-questions-critical-thinking" },
  { name: "Expert Exam Preparation Guidance", icon: Award, blogSlug: "expert-exam-preparation-guidance-strategic-learning" },
  { name: "Exam Technique & Time Management", icon: Zap, blogSlug: "exam-technique-time-management-peak-performance" },
  { name: "Personalised Study Schedules", icon: ListChecks, blogSlug: "personalised-study-schedules-structured-learning" },
  { name: "Targeted Grade Improvement Plans", icon: TrendingUp, blogSlug: "targeted-grade-improvement-achieve-potential" },
  { name: "SEN Inclusive Resources & Support", icon: UsersRound, blogSlug: "sen-inclusive-resources-tailored-support" },
  { name: "Parental Support & Revision Packs", icon: Users, blogSlug: "parental-support-revision-packs-collaborative-learning" },
  { name: "One-to-One Mentorship & Coaching", icon: MessageSquareQuote, blogSlug: "one-to-one-mentorship-coaching-academic-guidance" },
  { name: "Meditation & Focus Sessions", icon: Telescope, blogSlug: "meditation-focus-sessions-enhanced-concentration" },
  { name: "On-Demand Content Creation", icon: Lightbulb, blogSlug: "on-demand-content-creation-customised-learning" }
];


export const levelsData = [
  {
    id: 'gcse',
    name: 'GCSE',
    icon: BookOpen,
    description: 'Comprehensive tutoring for all core GCSE subjects. Build a strong foundation for A-Levels and beyond.',
    rawSubjects: ['Mathematics', 'English Language', 'English Literature', 'Combined Science', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Computer Science', 'French', 'Spanish', 'German', 'Business Studies', 'Religious Studies', 'Art & Design', 'Music', 'Drama', 'Physical Education'],
    get subjects() { return mapSubjectsWithIcons(this.rawSubjects); },
    categories: {
      "Core Subjects": ["Mathematics", "English Language", "English Literature", "Combined Science"],
      "Sciences": ["Biology", "Chemistry", "Physics"],
      "Humanities": ["History", "Geography", "Religious Studies"],
      "Modern Languages": ["French", "Spanish", "German"],
      "Creative & Technical": ["Computer Science", "Business Studies", "Art & Design", "Music", "Drama", "Physical Education"]
    },
    coreSample: ["Mathematics", "English Language", "Combined Science", "History"],
    path: '/subjects#gcse',
    isPremiumService: false,
  },
  {
    id: 'a-level',
    name: 'A-Level',
    icon: BarChart3,
    description: 'Specialised A-Level tuition to help you excel in your exams and secure university placements.',
    rawSubjects: ['Mathematics', 'Further Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics', 'Business Studies', 'English Literature', 'History', 'Geography', 'Politics', 'Sociology', 'Psychology', 'Law', 'Art & Design', 'French', 'Spanish', 'German'],
    get subjects() { return mapSubjectsWithIcons(this.rawSubjects); },
    categories: {
        "STEM Subjects": ["Mathematics", "Further Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"],
        "Social Sciences & Humanities": ["Economics", "Business Studies", "English Literature", "History", "Geography", "Politics", "Sociology", "Psychology", "Law"],
        "Arts & Languages": ["Art & Design", "French", "Spanish", "German"]
    },
    coreSample: ["Mathematics", "Physics", "Economics", "English Literature"],
    path: '/subjects#a-level',
    isPremiumService: false,
  },
  {
    id: 'btec',
    name: 'BTEC',
    icon: ClipboardText,
    description: 'Vocational BTEC courses offering practical skills and knowledge for various career paths.',
    rawSubjects: ['Business', 'Health and Social Care', 'Information Technology (IT)', 'Engineering', 'Sport', 'Art and Design', 'Media', 'Travel and Tourism', 'Applied Science', 'Public Services'],
    get subjects() { return mapSubjectsWithIcons(this.rawSubjects); },
    categories: {
        "Business & Enterprise": ["Business"],
        "Health & Social Care": ["Health and Social Care"],
        "Technology & Engineering": ["Information Technology (IT)", "Engineering", "Applied Science"],
        "Creative & Media": ["Art and Design", "Media"],
        "Services & Lifestyle": ["Sport", "Travel and Tourism", "Public Services"]
    },
    coreSample: ["Business", "Health and Social Care", "Information Technology (IT)", "Art and Design"],
    path: '/subjects#btec',
    isPremiumService: false,
  },
  {
    id: 'ib',
    name: 'International Baccalaureate (IB)',
    icon: UsersThree, 
    description: 'A challenging and comprehensive curriculum for students aged 16-19, recognized globally.',
    rawSubjects: ['Theory of Knowledge (TOK)', 'Extended Essay (EE)', 'Creativity, Activity, Service (CAS)', 'Mathematics (Analysis & Approaches / Applications & Interpretation)', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Economics', 'Psychology', 'English A (Language & Literature / Literature)', 'Spanish B', 'French B'],
    get subjects() { return mapSubjectsWithIcons(this.rawSubjects); },
    categories: {
        "Core Programme": ['Theory of Knowledge (TOK)', 'Extended Essay (EE)', 'Creativity, Activity, Service (CAS)'],
        "Group 1: Studies in Language and Literature": ['English A (Language & Literature / Literature)'],
        "Group 2: Language Acquisition": ['Spanish B', 'French B'],
        "Group 3: Individuals and Societies": ['History', 'Geography', 'Economics', 'Psychology'],
        "Group 4: Sciences": ['Physics', 'Chemistry', 'Biology'],
        "Group 5: Mathematics": ['Mathematics (Analysis & Approaches / Applications & Interpretation)']
    },
    coreSample: ["Theory of Knowledge (TOK)", "Mathematics (Analysis & Approaches)", "Physics", "English A (Language & Literature)"],
    path: '/subjects#ib',
    isPremiumService: false,
  },
  {
    id: 'undergraduate',
    name: 'Undergraduate',
    icon: Landmark,
    description: 'University-level support across a variety of disciplines, from foundational concepts to advanced topics.',
    get subjects() { return mapUgAllModulesWithIcons(); },
    categories: undergraduateDegreeAreasList,
    coreSample: ["Introduction to Programming (Python/Java)", "Marketing Fundamentals", "Engineering Mathematics", "Introduction to Psychology"],
    path: '/subjects#undergraduate',
    isPremiumService: false,
  },
  {
    id: 'premium-services',
    name: 'CONTENT ON DEMAND & Mentorship Programme',
    icon: Brain,
    description: 'Unlock your full academic potential with our exclusive suite of on-demand learning resources, tools, and personalized mentorship. This holistic programme is designed to enhance understanding, boost confidence, and achieve top grades.',
    get subjects() { return mapSubjectsWithIcons(premiumServiceFeatures, true); },
    categories: {
      "Study Aids & Resources": premiumServiceFeatures.slice(0, 6).map(f => f.name),
      "Exam Preparation & Strategy": premiumServiceFeatures.slice(6, 10).map(f => f.name),
      "Personalised Support & Wellbeing": premiumServiceFeatures.slice(10).map(f => f.name),
    },
    coreSample: premiumServiceFeatures.slice(0,4).map(f => f.name),
    path: '/premium-programme',
    isPremiumService: true,
  }
];

export const getLevelById = (id) => levelsData.find(level => level.id === id);
export const getSubjectByName = (levelId, subjectName) => {
    const level = getLevelById(levelId);
    if (!level) return null;
    return level.subjects.find(subject => subject.name.toLowerCase() === subjectName.toLowerCase());
};

export const getPremiumServiceByName = (featureName) => {
  const premiumLevel = levelsData.find(level => level.id === 'premium-services');
  if (!premiumLevel) return null;
  return premiumLevel.subjects.find(feature => feature.name.toLowerCase() === featureName.toLowerCase());
};

const extractSubjectNames = (levelId) => {
    const level = levelsData.find(l => l.id === levelId);
    return level && level.rawSubjects ? level.rawSubjects : (level && level.subjects ? level.subjects.map(s => s.name) : []);
};

export const gcseSubjectsList = extractSubjectNames('gcse');
export const aLevelSubjectsList = extractSubjectNames('a-level');
export const btecSubjectsList = extractSubjectNames('btec');
export const ibSubjectsList = extractSubjectNames('ib');