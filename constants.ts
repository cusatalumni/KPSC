
import React from 'react';
import type { Exam, Notification, StudyMaterial, ExamPageContent, Testimonial, Book, ExamCalendarEntry, QuizCategory, MockTest, PscUpdateItem, QuestionPaper, CurrentAffairsItem, GkItem, QuizQuestion, Page, NavLink, FlashCard } from './types';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { StarIcon } from './components/icons/StarIcon';
import { AcademicCapIcon } from './components/icons/AcademicCapIcon';
import { ShieldCheckIcon } from './components/icons/ShieldCheckIcon';
import { BeakerIcon } from './components/icons/BeakerIcon';
import { GlobeAltIcon } from './components/icons/GlobeAltIcon';
import { LightBulbIcon } from './components/icons/LightBulbIcon';
import { ScaleIcon } from './components/icons/ScaleIcon';
import { ClipboardListIcon } from './components/icons/ClipboardListIcon';

export const EXAMS_DATA: Exam[] = [
  {
    id: 'ldc_lgs',
    title: { ml: 'LDC / LGS (എൽ.ഡി.സി / എൽ.ജി.എസ്)', en: 'LDC / LGS' },
    description: { ml: 'പത്താം ക്ലാസ്സ് യോഗ്യതയുള്ള പ്രധാന പരീക്ഷകൾ.', en: 'Major exams for 10th level qualification.' },
    icon: React.createElement(BookOpenIcon, { className: "h-8 w-8 text-indigo-500" }),
    category: 'General',
    level: 'Preliminary'
  },
  {
    id: 'plus_two_prelims',
    title: { ml: 'Plus Two Prelims (CPO / Excise)', en: 'Plus Two Level Prelims' },
    description: { ml: 'സിവിൽ പോലീസ് ഓഫീസർ, എക്സൈസ് ഇൻസ്പെക്ടർ തുടങ്ങിയ പരീക്ഷകൾ.', en: 'CPO, Excise Inspector and related exams.' },
    icon: React.createElement(ShieldCheckIcon, { className: "h-8 w-8 text-indigo-600" }),
    category: 'General',
    level: 'Preliminary'
  },
  {
    id: 'degree_prelims',
    title: { ml: 'Degree Level Exams (ഡിഗ്രി ലെവൽ)', en: 'Degree Level Exams' },
    description: { ml: 'സെക്രട്ടേറിയറ്റ് അസിസ്റ്റന്റ് ഉൾപ്പെടെയുള്ള ബിരുദതല പരീക്ഷകൾ.', en: 'Exams including Secretariat Assistant.' },
    icon: React.createElement(AcademicCapIcon, { className: "h-8 w-8 text-indigo-700" }),
    category: 'General',
    level: 'Preliminary'
  }
];

export const LDC_EXAM_CONTENT: ExamPageContent = {
  practiceTests: [
    { id: 'ldc_gk_1', title: 'Kerala History', questions: 20, duration: 20, subject: 'History', topic: 'Kerala' },
    { id: 'ldc_comp_hw', title: 'Information Technology', questions: 10, duration: 10, subject: 'Computer Science', topic: 'Hardware' }
  ],
  studyNotes: [{ id: 'sn_kh', title: 'Kerala History' }],
  previousPapers: [{ id: 'pp_ldc21', title: 'LDC 2021 Previous Paper' }]
};

export const EXAM_CONTENT_MAP: Record<string, ExamPageContent> = {
    'ldc_lgs': LDC_EXAM_CONTENT,
    'plus_two_prelims': LDC_EXAM_CONTENT,
    'degree_prelims': LDC_EXAM_CONTENT,
};

export const NAV_STRUCTURE: NavLink[] = [
  { nameKey: 'nav.home', target: 'dashboard' },
  { nameKey: 'nav.practice', children: [{ nameKey: 'nav.mockTests', target: 'mock_test_home' }, { nameKey: 'nav.quizzes', target: 'quiz_home' }] },
  { nameKey: 'nav.dailyFacts', children: [
      { nameKey: 'nav.currentAffairs', target: 'current_affairs' }, 
      { nameKey: 'nav.gk', target: 'gk' }, 
      { nameKey: 'nav.flashCards', target: 'flash_cards' },
      { nameKey: 'nav.pscLive', target: 'psc_live_updates' }
    ] 
  },
  { nameKey: 'nav.examHub', children: [{ nameKey: 'nav.examCalendar', target: 'exam_calendar' }, { nameKey: 'nav.previousPapers', target: 'previous_papers' }, { nameKey: 'nav.studyMaterials', target: 'study_material' }] },
  { nameKey: 'nav.bookstore', target: 'bookstore' }
];

export const MARCH_EXAMS_DATA: ExamCalendarEntry[] = [
  { slNo: 1, catNo: "021/2024", postName: "LDC (Various Departments)", department: "Various", examDate: "14-03-2026", syllabusLink: "#" },
  { slNo: 2, catNo: "115/2024", postName: "Civil Police Officer", department: "Police", examDate: "21-03-2026", syllabusLink: "#" },
  { slNo: 3, catNo: "442/2024", postName: "University Assistant", department: "Universities", examDate: "28-03-2026", syllabusLink: "#" }
];

export const APRIL_EXAMS_DATA: ExamCalendarEntry[] = [
  { slNo: 1, catNo: "005/2025", postName: "Last Grade Servants", department: "Various", examDate: "04-04-2026", syllabusLink: "#" },
  { slNo: 2, catNo: "189/2024", postName: "Beat Forest Officer", department: "Forest", examDate: "18-04-2026", syllabusLink: "#" },
  { slNo: 3, catNo: "312/2024", postName: "Sub Inspector of Police", department: "Police", examDate: "25-04-2026", syllabusLink: "#" }
];

export const MOCK_FLASHCARDS: FlashCard[] = [
    { id: 'fc1', front: 'കേരളത്തിലെ ഏറ്റവും നീളം കൂടിയ നദി?', back: 'പെരിയാർ (244 കി.മീ)', topic: 'Geography' },
    { id: 'fc2', front: 'കേരള നവോത്ഥാനത്തിന്റെ പിതാവ്?', back: 'ശ്രീനാരായണ ഗുരു', topic: 'History' },
    { id: 'fc3', front: 'ഇന്ത്യൻ ഭരണഘടനയുടെ ശില്പി?', back: 'ഡോ. ബി. ആർ. അംബേദ്കർ', topic: 'Constitution' },
    { id: 'fc4', front: 'കേരളത്തിൽ അവസാനം രൂപീകൃതമായ ജില്ല?', back: 'കാസർഗോഡ് (1984)', topic: 'General' },
    { id: 'fc5', front: 'അറബിക്കടലിന്റെ റാണി എന്നറിയപ്പെടുന്നത്?', back: 'കൊച്ചി', topic: 'Geography' }
];

export const MOCK_QUESTION_BANK: QuizQuestion[] = [];
export const QUIZ_CATEGORIES: QuizCategory[] = [];
export const MOCK_TESTS_DATA: MockTest[] = [];
export const MOCK_NOTIFICATIONS: Notification[] = [];
export const MOCK_PSC_UPDATES: PscUpdateItem[] = [];
export const MOCK_CURRENT_AFFAIRS: CurrentAffairsItem[] = [];
export const MOCK_GK: GkItem[] = [];
export const MOCK_QUESTION_PAPERS: QuestionPaper[] = [];
export const STUDY_MATERIALS_DATA: StudyMaterial[] = [];
export const TESTIMONIALS_DATA: Testimonial[] = [];
export const MOCK_BOOKS_DATA: Book[] = [];
export const SEPTEMBER_EXAMS_DATA: ExamCalendarEntry[] = MARCH_EXAMS_DATA; // Fallback
export const OCTOBER_EXAMS_DATA: ExamCalendarEntry[] = APRIL_EXAMS_DATA; // Fallback
