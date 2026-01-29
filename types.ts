
import React from 'react';

export interface BilingualText {
  ml: string;
  en: string;
}

export type ExamLevel = 'Preliminary' | 'Main' | 'Departmental' | 'Special';
export type Difficulty = 'Easy' | 'Moderate' | 'PSC Level';
export type ExamCategory = 'General' | 'Technical' | 'Special';

export interface Exam {
  id: string;
  title: BilingualText;
  description: BilingualText;
  icon: React.ReactNode;
  category: ExamCategory;
  level: ExamLevel;
}

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  topic: string;
  subject: 'GK' | 'Maths' | 'English' | 'Malayalam' | 'Science' | 'Technical' | 'Current Affairs';
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
  negativeMarking: number;
  isPro?: boolean;
}

export interface SubjectStats {
  correct: number;
  total: number;
}

export interface TestResult {
  score: number;
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  timeSpent: number;
  subjectBreakdown: Record<string, SubjectStats>;
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

export interface Notification {
  id: string;
  title: string;
  categoryNumber: string;
  lastDate: string;
  link: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
}

export interface PracticeTest {
  id: string;
  title: string;
  questions: number;
  duration: number;
  topic?: string; // Specific topic for database filtering
}

export interface ExamPageContent {
  practiceTests: PracticeTest[];
  studyNotes: StudyMaterial[];
  previousPapers: { id: string; title: string }[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  quote: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  amazonLink: string;
}

export interface ExamCalendarEntry {
  slNo: number;
  catNo: string;
  postName: string;
  department: string;
  examDate: string;
  syllabusLink: string;
}

export interface QuizCategory {
  id: string;
  title: BilingualText;
  description: BilingualText;
  icon: React.ReactNode;
  isPro?: boolean;
}

export interface PscUpdateItem {
  title: string;
  url: string;
  section: string;
  published_date: string;
}

export interface QuestionPaper {
  title: string;
  url: string;
  date: string;
}

export interface CurrentAffairsItem {
  id: string;
  title: string;
  source: string;
  date: string;
}

export interface GkItem {
  id: string;
  fact: string;
  category: string;
}

export interface UserAnswers {
  [questionIndex: number]: number;
}

export interface NavLink {
  nameKey: string;
  target?: Page;
  children?: NavLink[];
}
