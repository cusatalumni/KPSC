export interface BilingualText {
  ml: string;
  en: string;
}

export interface Exam {
  id: string;
  title: BilingualText;
  description: BilingualText;
  icon: React.ReactNode;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  topic: string; // Added topic for categorization in question bank
}

export interface QuizCategory {
  id: string;
  title: BilingualText;
  description: BilingualText;
  icon: React.ReactNode;
  isPro?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  lastDate: string;
  categoryNumber: string;
  link: string;
}

export interface PscUpdateItem {
    title: string;
    url: string;
    section: string;
    published_date: string;
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

export interface QuestionPaper {
    title: string;
    url: string;
    date: string;
}

export interface StudyMaterial {
    id: string;
    title: string;
    link: string;
}

// New types for Exam Page Content
export interface PracticeTest {
  id: string;
  title: string;
  questions: number;
  duration: number; // in minutes
}

export interface StudyNote {
  id: string;
  title: string;
  link: string;
}

export interface ExamPageContent {
  practiceTests: PracticeTest[];
  studyNotes: StudyNote[];
  previousPapers: StudyNote[]; // Reusing StudyNote for simplicity
}

export type UserAnswers = Record<number, number>; // questionIndex: selectedOptionIndex

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
  slNo: string;
  catNo: string;
  postName: string;
  department: string;
  examDate: string;
  syllabusLink: string;
}

export interface MockTest {
  id: string;
  examId: string; // To link with an exam like 'ldc', 'lgs'
  title: BilingualText;
  description: BilingualText;
  questionsCount: number;
  duration: number; // in minutes
  isPro?: boolean;
}

export type SubscriptionStatus = 'free' | 'pro';

export interface ActiveTest {
  title: string;
  questionsCount: number;
  topic: string;
  isPro?: boolean;
}