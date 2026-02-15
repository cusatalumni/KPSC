
import React from 'react';
import type { Exam, Notification, StudyMaterial, ExamPageContent, Testimonial, Book, ExamCalendarEntry, QuizCategory, MockTest, PscUpdateItem, QuestionPaper, CurrentAffairsItem, GkItem, QuizQuestion, Page, NavLink } from './types';
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
  },
  {
    id: 'veo_exam',
    title: { ml: 'VEO (വില്ലേജ് എക്സ്റ്റൻഷൻ ഓഫീസർ)', en: 'Village Extension Officer' },
    description: { ml: 'ഗ്രാമവികസന വകുപ്പിലെ പ്രധാന പരീക്ഷ.', en: 'Key exam in Rural Development department.' },
    icon: React.createElement(GlobeAltIcon, { className: "h-8 w-8 text-emerald-600" }),
    category: 'General',
    level: 'Main'
  },
  {
    id: 'lp_up_assistant',
    title: { ml: 'LP/UP Assistant (എൽ.പി/യു.പി അസിസ്റ്റന്റ്)', en: 'LP/UP Assistant' },
    description: { ml: 'വിദ്യാഭ്യാസ വകുപ്പിലെ അദ്ധ്യാപക തസ്തികകൾ.', en: 'Teaching posts in Education department.' },
    icon: React.createElement(AcademicCapIcon, { className: "h-8 w-8 text-purple-600" }),
    category: 'General',
    level: 'Main'
  }
];

export const LDC_EXAM_CONTENT: ExamPageContent = {
  practiceTests: [
    { id: 'ldc_gk_1', title: 'Kerala History', questions: 20, duration: 20, subject: 'History', topic: 'Kerala' },
    { id: 'ldc_comp_hw', title: 'Information Technology', questions: 10, duration: 10, subject: 'Computer Science', topic: 'Hardware' },
    { id: 'ldc_comp_sw', title: 'Information Technology', questions: 10, duration: 10, subject: 'Computer Science', topic: 'Software' },
    { id: 'ldc_comp_cyber', title: 'Information Technology', questions: 10, duration: 10, subject: 'Computer Science', topic: 'Cyber Laws' },
    { id: 'ldc_ml_gr', title: 'Malayalam Grammar', questions: 10, duration: 10, subject: 'Malayalam', topic: 'Grammar' },
    { id: 'ldc_en_gr', title: 'English Grammar', questions: 10, duration: 10, subject: 'English', topic: 'Grammar' },
  ],
  studyNotes: [{ id: 'sn_kh', title: 'Kerala History' }, { id: 'sn_ic', title: 'Indian Constitution' }],
  previousPapers: [{ id: 'pp_ldc21', title: 'LDC 2021 Previous Paper' }]
};

export const EXAM_CONTENT_MAP: Record<string, ExamPageContent> = {
    'ldc_lgs': LDC_EXAM_CONTENT,
    'plus_two_prelims': LDC_EXAM_CONTENT,
    'degree_prelims': LDC_EXAM_CONTENT,
    'veo_exam': LDC_EXAM_CONTENT,
};

export const MOCK_QUESTION_BANK: QuizQuestion[] = [
  { id: 'h1', question: "വൈക്കം സത്യാഗ്രഹം നടന്ന വർഷം?", options: ['1924', '1925', '1930', '1921'], correctAnswerIndex: 0, topic: 'Kerala History', subject: 'History', difficulty: 'PSC Level' },
];

export const QUIZ_CATEGORIES: QuizCategory[] = [
  {
    id: 'ml_grammar',
    title: { ml: 'Malayalam Grammar', en: 'Malayalam Grammar' },
    description: { ml: 'മലയാള വ്യാകരണം.', en: 'Comprehensive Malayalam grammar.' },
    icon: React.createElement(BookOpenIcon, { className: "h-6 w-6 text-indigo-500" })
  },
  {
    id: 'computer_sci',
    title: { ml: 'Computer Science', en: 'Computer Science' },
    description: { ml: 'ഐടി, സോഫ്റ്റ്‌വെയർ, ഹാർഡ്‌വെയർ.', en: 'IT, Software, and Hardware basics.' },
    icon: React.createElement(LightBulbIcon, { className: "h-6 w-6 text-amber-500" })
  }
];

export const LOCK_MOCK_TESTS_DATA: MockTest[] = [
  {
    id: 'mt_ldc_01',
    examId: 'ldc_lgs',
    title: { ml: 'LDC Model Test 01', en: 'LDC Model Test 01' },
    description: { ml: 'എൽ.ഡി.സി സിലബസ് പ്രകാരമുള്ള മാതൃകാ പരീക്ഷ.', en: 'Mock test based on LDC syllabus.' },
    questionsCount: 100,
    duration: 75,
    negativeMarking: 0.33,
    isPro: false
  }
];

export const MOCK_TESTS_DATA = LOCK_MOCK_TESTS_DATA;
export const MOCK_NOTIFICATIONS: Notification[] = [{ id: '1', title: 'LDC - Various Departments', categoryNumber: '207/2025', lastDate: '25-09-2025', link: '#' }];
export const MOCK_PSC_UPDATES: PscUpdateItem[] = [{ title: 'RANK LIST - LDC ERNAKULAM', url: '#', section: 'Ranked Lists', published_date: '2025-08-20' }];
export const MOCK_CURRENT_AFFAIRS: CurrentAffairsItem[] = [{ id: '1', title: 'Kerala Budget 2025', source: 'Official', date: '2025-08-15'}];
export const MOCK_GK: GkItem[] = [{ id: '1', fact: 'Periyar is the longest river in Kerala.', category: 'Geography'}];
export const MOCK_QUESTION_PAPERS: QuestionPaper[] = [{ title: "LDC 2021 Previous Paper", url: "#", date: "2021" }];
export const STUDY_MATERIALS_DATA: StudyMaterial[] = [{ id: '1', title: 'Kerala History' }, { id: '2', title: 'Indian Constitution' }];
export const TESTIMONIALS_DATA: Testimonial[] = [
  { id: '1', name: 'രാഹുൽ ആർ.', role: 'LDC 2021 ബാച്ച് വിജയി', avatarUrl: 'https://picsum.photos/seed/winner1/200', quote: 'ഈ പ്ലാറ്റ്‌ഫോം എന്റെ പഠനത്തെ വളരെ ലളിതമാക്കി.' }
];
export const MOCK_BOOKS_DATA: Book[] = [
  { id: 'b1', title: 'Kerala PSC LDC Rank File', author: 'Lakshya Publications', imageUrl: 'https://m.media-amazon.com/images/I/81x1sVlXWJL._SY466_.jpg', amazonLink: '#' }
];
export const SEPTEMBER_EXAMS_DATA: ExamCalendarEntry[] = [];
export const OCTOBER_EXAMS_DATA: ExamCalendarEntry[] = [];
export const NAV_STRUCTURE: NavLink[] = [
  { nameKey: 'nav.home', target: 'dashboard' },
  { nameKey: 'nav.practice', children: [{ nameKey: 'nav.mockTests', target: 'mock_test_home' }, { nameKey: 'nav.quizzes', target: 'quiz_home' }] },
  { nameKey: 'nav.examHub', children: [{ nameKey: 'nav.pscLive', target: 'psc_live_updates' }, { nameKey: 'nav.examCalendar', target: 'exam_calendar' }, { nameKey: 'nav.previousPapers', target: 'previous_papers' }] },
  { nameKey: 'nav.resources', children: [{ nameKey: 'nav.currentAffairs', target: 'current_affairs' }, { nameKey: 'nav.gk', target: 'gk' }, { nameKey: 'nav.studyMaterials', target: 'study_material' }] },
  { nameKey: 'nav.bookstore', target: 'bookstore' }
];
