import React from 'react';
import { FileText, Edit3, FolderTree as TreeStructure, Layers, Users2 as UsersThree, Target, Sparkles, Brain, BookOpen, Clock, ShieldCheck, MessageSquare, TrendingUp } from 'lucide-react';

export const premiumProgrammeFeatures = [
  {
    id: 'bespoke-worksheets',
    title: 'Bespoke Curriculum Worksheets',
    icon: FileText,
    shortDescription: 'Tailored worksheets designed to perfectly match your curriculum and learning style, reinforcing key concepts and boosting understanding.',
    detailedDescription: 'Receive custom-crafted worksheets that align precisely with your specific syllabus, learning objectives, and pace. Whether you need extra practice on challenging topics or advanced material to stretch your abilities, these worksheets are designed for you. They include a variety of question types, real-world examples, and clear explanations to ensure comprehensive understanding.',
    benefits: [
      'Targeted practice for specific curriculum areas.',
      'Reinforces classroom learning effectively.',
      'Addresses individual learning gaps and strengths.',
      'Builds confidence through progressive difficulty.',
      'Includes answer keys and model solutions for self-assessment.'
    ],
    blogSlug: 'bespoke-curriculum-worksheets',
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'custom-tests',
    title: 'Custom Test Papers & Grading',
    icon: Edit3,
    shortDescription: 'Personalized test papers that mirror exam conditions, complete with detailed feedback and grading to track progress.',
    detailedDescription: 'Experience exam-like conditions with custom-designed test papers covering your specific subjects and topics. These tests are not generic; they are built to assess your understanding of the material you\'ve covered. After completion, receive detailed grading and constructive feedback highlighting areas of strength and those needing improvement, along with actionable advice.',
    benefits: [
      'Simulates real exam conditions for better preparation.',
      'Identifies strengths and weaknesses accurately.',
      'Provides actionable feedback for improvement.',
      'Tracks progress over time effectively.',
      'Reduces exam anxiety through familiarity.'
    ],
    blogSlug: 'custom-test-papers-grading',
    image: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'interactive-maps',
    title: 'Interactive Mind Maps & Flow Charts',
    icon: TreeStructure,
    shortDescription: 'Visually engaging mind maps and flow charts to simplify complex topics and enhance memory retention.',
    detailedDescription: 'Grasp complex concepts and relationships with ease through custom-designed interactive mind maps and flow charts. These visual tools break down intricate information into digestible, interconnected parts, making it easier to understand, remember, and recall. Ideal for visual learners and for summarizing large amounts of information.',
    benefits: [
      'Simplifies complex information visually.',
      'Improves memory retention and recall.',
      'Organizes thoughts and ideas effectively.',
      'Makes learning more engaging and fun.',
      'Great for revision and summarizing topics.'
    ],
    blogSlug: 'interactive-mind-maps-flow-charts',
    image: 'https://images.unsplash.com/photo-1587614295999-6c1c13675117?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'digital-flashcards',
    title: 'Digital & Printable Flashcards',
    icon: Layers,
    shortDescription: 'Versatile flashcards for quick revision of key facts, vocabulary, and concepts, available in digital and printable formats.',
    detailedDescription: 'Reinforce your learning and test your knowledge with custom-made flashcards. Covering key terms, definitions, formulas, and concepts, these flashcards are perfect for quick revision sessions. Available in both digital formats for on-the-go learning and printable versions for a more tactile study experience.',
    benefits: [
      'Facilitates active recall and memorization.',
      'Portable and convenient for studying anywhere.',
      'Covers key information concisely.',
      'Available in digital and printable formats.',
      'Ideal for quick, focused revision sessions.'
    ],
    blogSlug: 'digital-printable-flashcards',
    image: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'mentorship-coaching',
    title: 'One-to-One Mentorship & Coaching',
    icon: UsersThree,
    shortDescription: 'Personalized guidance from expert mentors to develop study skills, set goals, and navigate academic challenges.',
    detailedDescription: 'Benefit from dedicated one-to-one mentorship from experienced educators. This goes beyond subject tutoring; it\'s about developing effective study habits, time management skills, exam strategies, and building academic confidence. Your mentor will help you set realistic goals, overcome learning obstacles, and provide ongoing support and motivation.',
    benefits: [
      'Personalized academic and study skills support.',
      'Goal setting and progress tracking.',
      'Builds confidence and motivation.',
      'Develops effective learning strategies.',
      'Provides a supportive, guiding relationship.'
    ],
    blogSlug: 'one-to-one-mentorship-coaching',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'exam-technique',
    title: 'Exam Technique & Time Management',
    icon: Target,
    shortDescription: 'Master exam techniques and time management strategies to maximize performance under pressure.',
    detailedDescription: 'Learn proven strategies for tackling exams effectively. This includes understanding question types, structuring answers, allocating time efficiently during exams, and managing exam-day stress. Our experts will equip you with the techniques needed to approach your exams strategically and perform at your best.',
    benefits: [
      'Improves exam performance significantly.',
      'Reduces exam stress and anxiety.',
      'Optimizes time allocation during exams.',
      'Develops skills for interpreting questions accurately.',
      'Boosts confidence in tackling any exam format.'
    ],
    blogSlug: 'exam-technique-time-management',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'on-demand-content',
    title: 'On-Demand Rapid Content (24-48hr)',
    icon: Sparkles,
    shortDescription: 'Urgent need for specific learning materials? Get custom content created and delivered within 24-48 hours.',
    detailedDescription: 'Facing a last-minute revision crisis or need specific material urgently? Our rapid content creation service delivers high-quality, tailored learning resources (notes, summaries, practice questions) within 24-48 hours. Perfect for emergency exam preparation or quickly grasping a difficult topic.',
    benefits: [
      'Quick turnaround for urgent learning needs.',
      'Customized content, even on short notice.',
      'Ideal for last-minute exam preparation.',
      'Addresses specific queries or topics rapidly.',
      'High-quality resources, delivered fast.'
    ],
    blogSlug: 'on-demand-content-creation',
    image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'critical-thinking-development',
    title: 'Critical Thinking & Problem-Solving Skills',
    icon: Brain,
    shortDescription: 'Enhance your analytical abilities and learn to approach complex problems with confidence and creativity.',
    detailedDescription: 'Develop essential critical thinking and problem-solving skills applicable across all subjects and future careers. Our programme focuses on analyzing information, evaluating arguments, identifying assumptions, and generating creative solutions. These skills are crucial for academic success and lifelong learning.',
    benefits: [
      'Strengthens analytical and reasoning abilities.',
      'Improves decision-making skills.',
      'Fosters a deeper understanding of subjects.',
      'Applicable to academic and real-world challenges.',
      'Encourages independent and innovative thought.'
    ],
    blogSlug: null,
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'academic-writing-support',
    title: 'Academic Writing & Research Support',
    icon: BookOpen,
    shortDescription: 'Refine your academic writing style, learn research methodologies, and master referencing for essays and dissertations.',
    detailedDescription: 'Improve your ability to write clear, concise, and well-structured academic papers. This includes guidance on essay planning, argumentation, research techniques, proper citation and referencing (Harvard, APA, etc.), and avoiding plagiarism. Essential for A-Levels, IB, and undergraduate studies.',
    benefits: [
      'Enhances clarity and structure in academic writing.',
      'Develops effective research skills.',
      'Ensures correct referencing and avoids plagiarism.',
      'Improves grades for written assignments.',
      'Prepares students for higher education demands.'
    ],
    blogSlug: null,
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
];