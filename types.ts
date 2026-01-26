
import React from 'react';

export interface BilingualText {
  ml: string;
  en: string;
}

export type ExamLevel = 'Preliminary' | 'Main' | 'Departmental' | 'Special';
export type Difficulty = 'Easy' | 'Moderate' | 'PSC Level';

export interface Exam {
  id: string;
  title: BilingualText;
  description: BilingualText;
  icon: React.ReactNode;
  category: 'General' | 'Technical' | 'Special';
  level: ExamLevel;
}

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  topic: string;
  subject: string; // e.g., 'History', 'Maths', 'English'
  difficulty: Difficulty;
  explanation?: string;
}

export interface MockTest {
  id: string;
  examId: string;
  title: BilingualText;
  description: BilingualText;
  questionsCount: number;
  duration: number; // in minutes
  negativeMarking: number; // e.g., 0.33
  isPro?: boolean;
}

export interface TestResult {
  score: number;
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  timeSpent: number; // seconds
  subjectBreakdown: Record<string, { correct: number; total: number }>;
}

export interface ActiveTest {
  title: string;
  questionsCount: number;
  topic: string;
  isPro?: boolean;
  negativeMarking?: number;
  examId?: string;
}

export type SubscriptionStatus = 'free' | 'pro';

export type Page = 
  | 'dashboard' 
  | 'exam_details' 
  | 'test' 
  | 'results' 
  | 'bookstore' 
  | 'about' 
  | 'privacy' 
  | 'terms' 
  | 'disclosure'
  | 'exam_calendar'
  | 'quiz_home'
  | 'mock_test_home'
  | 'upgrade'
  | 'psc_live_updates'
  | 'previous_papers'
  | 'current_affairs'
  | 'gk'
  | 'admin_panel'
  | 'study_material'
  | 'sitemap';

/**
 * Interface representing a PSC notification
 */
export interface Notification {
  id: string;
  title: string;
  categoryNumber: string;
  lastDate: string;
  link: string;
}

/**
 * Interface representing a study material topic
 */
export interface StudyMaterial {
  id: string;
  title: string;
}

/**
 * Interface representing a practice test in an exam page
 */
export interface PracticeTest {
  id: string;
  title: string;
  questions: number;
  duration: number;
}

/**
 * Interface representing content for a specific exam page
 */
export interface ExamPageContent {
  practiceTests: PracticeTest[];
  studyNotes: StudyMaterial[];
  previousPapers: { id: string; title: string }[];
}

/**
 * Interface representing a user testimonial
 */
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  quote: string;
}

/**
 * Interface representing a book in the bookstore
 */
export interface Book {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  amazonLink: string;
}

/**
 * Interface representing an entry in the PSC exam calendar
 */
export interface ExamCalendarEntry {
  slNo: number;
  catNo: string;
  postName: string;
  department: string;
  examDate: string;
  syllabusLink: string;
}

/**
 * Interface representing a quiz category
 */
export interface QuizCategory {
  id: string;
  title: BilingualText;
  description: BilingualText;
  icon: React.ReactNode;
  isPro?: boolean;
}

/**
 * Interface representing a PSC live update item
 */
export interface PscUpdateItem {
  title: string;
  url: string;
  section: string;
  published_date: string;
}

/**
 * Interface representing a previous question paper
 */
export interface QuestionPaper {
  title: string;
  url: string;
  date: string;
}

/**
 * Interface representing a current affairs item
 */
export interface CurrentAffairsItem {
  id: string;
  title: string;
  source: string;
  date: string;
}

/**
 * Interface representing a GK item
 */
export interface GkItem {
  id: string;
  fact: string;
  category: string;
}

/**
 * Type representing user answers in a test (questionIndex -> optionIndex)
 */
export interface UserAnswers {
  [questionIndex: number]: number;
}

/**
 * Interface representing a navigation link structure
 */
export interface NavLink {
  nameKey: string;
  target?: Page;
  children?: NavLink[];
}
