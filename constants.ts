
import React from 'react';
import type { Exam, Notification, StudyMaterial, ExamPageContent, Testimonial, Book, ExamCalendarEntry, QuizCategory, MockTest, PscUpdateItem, QuestionPaper, CurrentAffairsItem, GkItem, QuizQuestion, Page, NavLink } from './types';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { StarIcon } from './components/icons/StarIcon';
import { AcademicCapIcon } from './components/icons/AcademicCapIcon';
import { ShieldCheckIcon } from './components/icons/ShieldCheckIcon';
import { BeakerIcon } from './components/icons/BeakerIcon';

export const EXAMS_DATA: Exam[] = [
  // A. General PSC Examinations
  {
    id: 'ldc_lgs',
    title: { ml: 'LDC / LGS (എൽ.ഡി.സി / എൽ.ജി.എസ്)', en: 'LDC / LGS' },
    description: { ml: 'പത്താം ക്ലാസ്സ് യോഗ്യതയുള്ള പ്രധാന പരീക്ഷകൾ.', en: 'Major exams for 10th level qualification.' },
    icon: React.createElement(BookOpenIcon, { className: "h-8 w-8 text-indigo-500" }),
    category: 'General',
    level: 'Preliminary'
  },
  {
    id: 'degree_prelims',
    title: { ml: 'Degree Prelims (ഡിഗ്രി പ്രിലിംസ്)', en: 'Degree Level Prelims' },
    description: { ml: 'സെക്രട്ടേറിയറ്റ് അസിസ്റ്റന്റ് ഉൾപ്പെടെയുള്ള പരീക്ഷകൾ.', en: 'Exams including Secretariat Assistant.' },
    icon: React.createElement(AcademicCapIcon, { className: "h-8 w-8 text-indigo-600" }),
    category: 'General',
    level: 'Preliminary'
  },
  {
    id: 'plus_two_prelims',
    title: { ml: '+2 Prelims (+2 പ്രിലിംസ്)', en: 'Plus Two Prelims' },
    description: { ml: 'ഹയർ സെക്കൻഡറി തലത്തിലുള്ള പരീക്ഷകൾ.', en: 'Higher Secondary level examinations.' },
    icon: React.createElement(AcademicCapIcon, { className: "h-8 w-8 text-indigo-400" }),
    category: 'General',
    level: 'Preliminary'
  },
  // B. Technical
  {
    id: 'overseer_civil',
    title: { ml: 'Overseer Civil (ഓവർസിയർ സിവിൽ)', en: 'Overseer Civil' },
    description: { ml: 'എഞ്ചിനീയറിംഗ് വിഭാഗം സാങ്കേതിക പരീക്ഷകൾ.', en: 'Technical exams for Engineering wing.' },
    icon: React.createElement(BeakerIcon, { className: "h-8 w-8 text-orange-500" }),
    category: 'Technical',
    level: 'Special'
  },
  {
    id: 'staff_nurse',
    title: { ml: 'Staff Nurse (സ്റ്റാഫ് നഴ്സ്)', en: 'Staff Nurse' },
    description: { ml: 'ഹെൽത്ത് സർവീസ് വിഭാഗം പരീക്ഷകൾ.', en: 'Health Service department exams.' },
    icon: React.createElement(BeakerIcon, { className: "h-8 w-8 text-orange-600" }),
    category: 'Technical',
    level: 'Main'
  },
  // C. Special Competitive
  {
    id: 'police_constable',
    title: { ml: 'Police Constable (പോലീസ് കോൺസ്റ്റബിൾ)', en: 'Police Constable' },
    description: { ml: 'യൂണിഫോം തസ്തികകളിലേക്കുള്ള പരീക്ഷകൾ.', en: 'Exams for uniform category posts.' },
    icon: React.createElement(ShieldCheckIcon, { className: "h-8 w-8 text-red-600" }),
    category: 'Special',
    level: 'Preliminary'
  },
  {
    id: 'fireman',
    title: { ml: 'Fireman (ഫയർമാൻ)', en: 'Fireman' },
    description: { ml: 'ഫയർ ആൻഡ് റെസ്ക്യൂ സർവീസ് പരീക്ഷകൾ.', en: 'Fire and Rescue service exams.' },
    icon: React.createElement(ShieldCheckIcon, { className: "h-8 w-8 text-red-500" }),
    category: 'Special',
    level: 'Preliminary'
  }
];

export const MOCK_TESTS_DATA: MockTest[] = [
  {
    id: 'mt_ldc_01',
    examId: 'ldc_lgs',
    title: { ml: 'LDC മോക്ക് ടെസ്റ്റ് 01', en: 'LDC Mock Test 01' },
    description: { ml: '100 ചോദ്യങ്ങൾ അടങ്ങിയ സമ്പൂർണ്ണ മാതൃകാ പരീക്ഷ.', en: 'Full mock test with 100 questions.' },
    questionsCount: 100,
    duration: 75,
    negativeMarking: 0.33,
    isPro: false
  }
];

export const QUIZ_CATEGORIES: QuizCategory[] = [
  {
    id: 'gk',
    title: { ml: 'പൊതുവിജ്ഞാനം', en: 'General Knowledge' },
    description: { ml: 'ചരിത്രം, ഭൂമിശാസ്ത്രം, ഭരണഘടന.', en: 'History, Geography, Constitution.' },
    icon: React.createElement(AcademicCapIcon, { className: "h-6 w-6 text-indigo-500" })
  },
  {
    id: 'maths',
    title: { ml: 'ഗണിതം', en: 'Mathematics' },
    description: { ml: 'അടിസ്ഥാന ഗണിതം, റീസണിംഗ്.', en: 'Basic Arithmetic, Reasoning.' },
    icon: React.createElement(StarIcon, { className: "h-6 w-6 text-orange-500" })
  }
];

export const LDC_EXAM_CONTENT: ExamPageContent = {
  practiceTests: [
    { id: 'pt1', title: 'ചരിത്രം (History)', questions: 20, duration: 15 },
    { id: 'pt2', title: 'ഭൂമിശാസ്ത്രം (Geography)', questions: 20, duration: 15 }
  ],
  studyNotes: [{ id: 'sn1', title: 'Kerala Renaissance' }],
  previousPapers: [{ id: 'pp1', title: 'LDC 2021 Question Paper' }]
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'LDC - Various Departments', categoryNumber: '207/2025', lastDate: '25-09-2025', link: '#' },
];

export const MOCK_PSC_UPDATES: PscUpdateItem[] = [
    { title: 'RANK LIST - LDC ERNAKULAM', url: '#', section: 'Ranked Lists', published_date: '2025-08-20' },
];

export const MOCK_CURRENT_AFFAIRS: CurrentAffairsItem[] = [
    { id: '1', title: 'Kerala Budget 2025', source: 'Official', date: '2025-08-15'},
];

export const MOCK_GK: GkItem[] = [
    { id: '1', fact: 'Periyar is the longest river in Kerala.', category: 'Geography'},
];

export const MOCK_QUESTION_BANK: QuizQuestion[] = [
    { id: '1', question: 'Father of Kerala Renaissance?', options: ['Sree Narayana Guru', 'Ayyankali', 'Chattampi Swamikal', 'Kumaran Asan'], correctAnswerIndex: 0, topic: 'History', subject: 'GK', difficulty: 'PSC Level' },
];

export const MOCK_QUESTION_PAPERS: QuestionPaper[] = [
    { title: "LDC 2021 Previous Paper", url: "#", date: "2021" }
];

export const STUDY_MATERIALS_DATA: StudyMaterial[] = [
    { id: '1', title: 'Kerala History' },
    { id: '2', title: 'Indian Constitution' }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  { id: '1', name: 'Rahul', role: 'LDC 2021 Batch', avatarUrl: 'https://picsum.photos/seed/1/200', quote: 'Great platform for practice!' }
];

export const MOCK_BOOKS_DATA: Book[] = [
  { id: '1', title: 'LDC Rank File', author: 'Talent Academy', imageUrl: 'https://m.media-amazon.com/images/I/81x1sVlXWJL._SY466_.jpg', amazonLink: '#' }
];

export const SEPTEMBER_EXAMS_DATA: ExamCalendarEntry[] = [];
export const OCTOBER_EXAMS_DATA: ExamCalendarEntry[] = [];

export const NAV_STRUCTURE: NavLink[] = [
  { nameKey: 'nav.home', target: 'dashboard' },
  { nameKey: 'nav.quizzes', target: 'quiz_home' },
  { nameKey: 'nav.mockTests', target: 'mock_test_home' },
  {
    nameKey: 'nav.more',
    children: [
      { nameKey: 'nav.currentAffairs', target: 'current_affairs' },
      { nameKey: 'nav.gk', target: 'gk' },
      { nameKey: 'nav.previousPapers', target: 'previous_papers' },
      { nameKey: 'nav.pscLive', target: 'psc_live_updates' },
      { nameKey: 'nav.bookstore', target: 'bookstore' },
      { nameKey: 'nav.examCalendar', target: 'exam_calendar' },
      { nameKey: 'nav.sitemap', target: 'sitemap' },
    ]
  }
];
