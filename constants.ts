
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
    id: 'staff_nurse',
    title: { ml: 'Staff Nurse Gr II (സ്റ്റാഫ് നഴ്സ്)', en: 'Staff Nurse Gr II' },
    description: { ml: 'ആരോഗ്യ വകുപ്പിലെ നഴ്സിംഗ് തസ്തികകളിലേക്കുള്ള പരീക്ഷ.', en: 'Nursing post exams in Health Department.' },
    icon: React.createElement(BeakerIcon, { className: "h-8 w-8 text-amber-600" }),
    category: 'Technical',
    level: 'Main'
  },
  {
    id: 'kseb_sub_eng',
    title: { ml: 'KSEB Sub Engineer (സബ് എൻജിനീയർ)', en: 'KSEB Sub Engineer' },
    description: { ml: 'കെ.എസ്.ഇ.ബി ഇലക്ട്രിക്കൽ വിഭാഗം പരീക്ഷകൾ.', en: 'KSEB Electrical Engineering exams.' },
    icon: React.createElement(LightBulbIcon, { className: "h-8 w-8 text-amber-500" }),
    category: 'Technical',
    level: 'Main'
  }
];

export const LDC_EXAM_CONTENT: ExamPageContent = {
  practiceTests: [
    { id: 'ldc_gk', title: 'General Knowledge', questions: 20, duration: 20, topic: 'Subject:GK' },
    { id: 'ldc_ml', title: 'Malayalam Grammar', questions: 10, duration: 10, topic: 'Topic:Malayalam Grammar' },
    { id: 'ldc_en', title: 'English Grammar', questions: 10, duration: 10, topic: 'Topic:English Grammar' },
    { id: 'ldc_ma', title: 'Mental Ability', questions: 10, duration: 15, topic: 'Topic:Mental Ability' },
    { id: 'ldc_sc', title: 'General Science', questions: 10, duration: 10, topic: 'Subject:Science' },
  ],
  studyNotes: [{ id: 'sn_kh', title: 'Kerala History' }, { id: 'sn_ic', title: 'Indian Constitution' }],
  previousPapers: [{ id: 'pp_ldc21', title: 'LDC 2021 Previous Paper' }]
};

export const STAFF_NURSE_CONTENT: ExamPageContent = {
  practiceTests: [
    { id: 'sn_ns', title: 'Nursing Science', questions: 20, duration: 20, topic: 'Topic:Nursing Science' },
    { id: 'sn_an', title: 'Anatomy', questions: 10, duration: 10, topic: 'Topic:Anatomy' },
  ],
  studyNotes: [{ id: 'sn_fn', title: 'Nursing Fundamentals' }],
  previousPapers: [{ id: 'pp_sn23', title: 'Staff Nurse 2023 Paper' }]
};

export const KSEB_CONTENT: ExamPageContent = {
  practiceTests: [
    { id: 'ks_ee', title: 'Electrical Engineering', questions: 20, duration: 20, topic: 'Subject:Technical' },
    { id: 'ks_em', title: 'Engineering Maths', questions: 10, duration: 15, topic: 'Topic:Engineering Mathematics' },
  ],
  studyNotes: [{ id: 'sn_ps', title: 'Power Systems' }],
  previousPapers: [{ id: 'pp_se22', title: 'Sub Engineer 2022 Paper' }]
};

export const EXAM_CONTENT_MAP: Record<string, ExamPageContent> = {
    'ldc_lgs': LDC_EXAM_CONTENT,
    'plus_two_prelims': LDC_EXAM_CONTENT,
    'degree_prelims': LDC_EXAM_CONTENT,
    'staff_nurse': STAFF_NURSE_CONTENT,
    'kseb_sub_eng': KSEB_CONTENT,
};

export const MOCK_QUESTION_BANK: QuizQuestion[] = [
  // --- MALAYALAM ---
  { id: 'm1', question: "'സന്ധ്യാവന്ദനം' പിരിച്ചെഴുതുക?", options: ['സന്ധ്യ + വന്ദനം', 'സന്ധി + വന്ദനം', 'സന്ധ്യ + അവന്ദനം', 'സന്ധ്യ + വന്നനം'], correctAnswerIndex: 0, topic: 'Malayalam Grammar', subject: 'Malayalam', difficulty: 'PSC Level' },
  { id: 'm2', question: "'അനുജൻ' എന്ന വാക്കിന്റെ സ്ത്രീലിംഗ രൂപം?", options: ['അനുജത്തി', 'അനുജ', 'അനുജി', 'പെങ്ങളുട്ടി'], correctAnswerIndex: 0, topic: 'Malayalam Grammar', subject: 'Malayalam', difficulty: 'Easy' },
  { id: 'm3', question: "'ഓണവില്ല്' ഏത് ജില്ലയുമായി ബന്ധപ്പെട്ടിരിക്കുന്നു?", options: ['തിരുവനന്തപുരം', 'കൊല്ലം', 'കോട്ടയം', 'കണ്ണൂർ'], correctAnswerIndex: 0, topic: 'Malayalam Vocabulary', subject: 'Malayalam', difficulty: 'PSC Level' },

  // --- ENGLISH ---
  { id: 'e1', question: "Antonym of 'Abundant'?", options: ['Scarce', 'Rich', 'Full', 'Plenty'], correctAnswerIndex: 0, topic: 'Vocabulary', subject: 'English', difficulty: 'PSC Level' },
  { id: 'e2', question: "He is ______ M.A holder.", options: ['a', 'an', 'the', 'no article'], correctAnswerIndex: 1, topic: 'English Grammar', subject: 'English', difficulty: 'Easy' },
  { id: 'e3', question: "Identify the correctly spelled word?", options: ['Maintenance', 'Maintainance', 'Maintenence', 'Mentainance'], correctAnswerIndex: 0, topic: 'Vocabulary', subject: 'English', difficulty: 'PSC Level' },

  // --- MATHS ---
  { id: 'ma1', question: "2, 4, 8, 16, ___ അടുത്ത സംഖ്യ ഏത്?", options: ['32', '24', '20', '64'], correctAnswerIndex: 0, topic: 'Mental Ability', subject: 'Maths', difficulty: 'Easy' },
  { id: 'ma2', question: "ഒരു ക്ലോക്കിൽ 3 മണി ആകുമ്പോൾ മിനിറ്റ് സൂചിയും മണിക്കൂർ സൂചിയും തമ്മിലുള്ള കോണളവ്?", options: ['90 ഡിഗ്രി', '180 ഡിഗ്രി', '45 ഡിഗ്രി', '60 ഡിഗ്രി'], correctAnswerIndex: 0, topic: 'Mental Ability', subject: 'Maths', difficulty: 'PSC Level' },
  { id: 'ma3', question: "60-ന്റെ 20 ശതമാനം എത്ര?", options: ['12', '10', '20', '15'], correctAnswerIndex: 0, topic: 'Arithmetic', subject: 'Maths', difficulty: 'Easy' },

  // --- HISTORY ---
  { id: 'h1', question: "വൈക്കം സത്യാഗ്രഹം നടന്ന വർഷം?", options: ['1924', '1925', '1930', '1921'], correctAnswerIndex: 0, topic: 'Kerala History', subject: 'GK', difficulty: 'PSC Level' },
  { id: 'h2', question: "ഇന്ത്യൻ നാഷണൽ കോൺഗ്രസ് സ്ഥാപിച്ചത് ആര്?", options: ['എ.ഒ. ഹ്യൂം', 'ഗാന്ധിജി', 'നെഹ്‌റു', 'തിലക്'], correctAnswerIndex: 0, topic: 'Indian History', subject: 'GK', difficulty: 'PSC Level' },
  { id: 'h3', question: "കേരള സിംഹം എന്നറിയപ്പെടുന്നത് ആര്?", options: ['പഴശ്ശിരാജ', 'വേലുത്തമ്പി ദളവ', 'കുഞ്ഞാലി മരക്കാർ', 'അയ്യങ്കാലി'], correctAnswerIndex: 0, topic: 'Kerala History', subject: 'GK', difficulty: 'PSC Level' },

  // --- CONSTITUTION ---
  { id: 'c1', question: "ഇന്ത്യൻ ഭരണഘടനയുടെ ശില്പി?", options: ['ബി.ആർ. അംബേദ്കർ', 'നെഹ്‌റു', 'രാജേന്ദ്ര പ്രസാദ്', 'പട്ടേൽ'], correctAnswerIndex: 0, topic: 'Indian Constitution', subject: 'GK', difficulty: 'Easy' },
  { id: 'c2', question: "വിവരാവകാശ നിയമം നിലവിൽ വന്ന വർഷം?", options: ['2005', '2000', '2010', '1995'], correctAnswerIndex: 0, topic: 'Indian Constitution', subject: 'GK', difficulty: 'PSC Level' },

  // --- SCIENCE ---
  { id: 's1', question: "മനുഷ്യ ശരീരത്തിലെ ഏറ്റവും വലിയ ഗ്രന്ഥി?", options: ['കരൾ', 'ആമാശയം', 'ആഗ്നേയഗ്രന്ഥി', 'തൈറോയ്ഡ്'], correctAnswerIndex: 0, topic: 'Biology', subject: 'Science', difficulty: 'PSC Level' },
  { id: 's2', question: "വെള്ളത്തിന്റെ തിളനില എത്ര?", options: ['100 ഡിഗ്രി സെൽഷ്യസ്', '0 ഡിഗ്രി സെൽഷ്യസ്', '50 ഡിഗ്രി സെൽഷ്യസ്', '200 ഡിഗ്രി സെൽഷ്യസ്'], correctAnswerIndex: 0, topic: 'Physics', subject: 'Science', difficulty: 'Easy' },

  // --- TECHNICAL ---
  { id: 't1', question: "What is the unit of electric current?", options: ['Ampere', 'Volt', 'Ohm', 'Watt'], correctAnswerIndex: 0, topic: 'Calculus', subject: 'Technical', difficulty: 'PSC Level' },
  { id: 't2', question: "Integral of sin(x) dx is?", options: ['-cos(x)', 'cos(x)', 'tan(x)', 'sec(x)'], correctAnswerIndex: 0, topic: 'Calculus', subject: 'Technical', difficulty: 'PSC Level' },
  { id: 't3', question: "Which material has the highest thermal conductivity?", options: ['Silver', 'Copper', 'Gold', 'Iron'], correctAnswerIndex: 0, topic: 'Strength of Materials', subject: 'Technical', difficulty: 'PSC Level' }
];

export const QUIZ_CATEGORIES: QuizCategory[] = [
  {
    id: 'ml_grammar',
    title: { ml: 'Malayalam Grammar', en: 'Malayalam Grammar' },
    description: { ml: 'മലയാള വ്യാകരണം.', en: 'Comprehensive Malayalam grammar.' },
    icon: React.createElement(BookOpenIcon, { className: "h-6 w-6 text-indigo-500" })
  },
  {
    id: 'mental_ability',
    title: { ml: 'Mental Ability', en: 'Mental Ability' },
    description: { ml: 'ഗണിതവും ചിന്താശേഷിയും.', en: 'Quantitative Aptitude and Mental Ability.' },
    icon: React.createElement(LightBulbIcon, { className: "h-6 w-6 text-amber-500" })
  },
  {
    id: 'indian_const',
    title: { ml: 'Indian Constitution', en: 'Indian Constitution' },
    description: { ml: 'ഇന്ത്യൻ ഭരണഘടന.', en: 'Articles, Parts, and Amendments.' },
    icon: React.createElement(ScaleIcon, { className: "h-6 w-6 text-rose-500" })
  },
  {
    id: 'kerala_hist',
    title: { ml: 'Kerala History', en: 'Kerala History' },
    description: { ml: 'കേരള ചരിത്രം.', en: 'From early times to modern Kerala.' },
    icon: React.createElement(AcademicCapIcon, { className: "h-6 w-6 text-emerald-500" })
  }
];

export const LOCK_MOCK_TESTS_DATA: MockTest[] = [
  {
    id: 'mt_mixed_01',
    examId: 'ldc_lgs',
    title: { ml: 'Full Mock Test (Mixed)', en: 'Full Mock Test (Mixed)' },
    description: { ml: 'എല്ലാ വിഷയങ്ങളും ഉൾപ്പെടുത്തിയ മാതൃകാ പരീക്ഷ.', en: 'Mock test covering all major subjects.' },
    questionsCount: 100,
    duration: 75,
    negativeMarking: 0.33,
    isPro: false
  }
];

export const MOCK_TESTS_DATA = LOCK_MOCK_TESTS_DATA;

// Standard mock responses for widgets
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
