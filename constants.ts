
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
    id: 'fireman_exam',
    title: { ml: 'Fireman / Firewoman (ഫയർമാൻ)', en: 'Fireman / Firewoman' },
    description: { ml: 'ഫയർ ആന്റ് റെസ്ക്യൂ സർവീസിലെ പരീക്ഷകൾ.', en: 'Fire and Rescue services exams.' },
    icon: React.createElement(StarIcon, { className: "h-8 w-8 text-red-500" }),
    category: 'Special',
    level: 'Preliminary'
  },
  {
    id: 'lp_up_assistant',
    title: { ml: 'LP/UP Assistant (എൽ.പി/യു.പി അസിസ്റ്റന്റ്)', en: 'LP/UP Assistant' },
    description: { ml: 'വിദ്യാഭ്യാസ വകുപ്പിലെ അദ്ധ്യാപക തസ്തികകൾ.', en: 'Teaching posts in Education department.' },
    icon: React.createElement(AcademicCapIcon, { className: "h-8 w-8 text-purple-600" }),
    category: 'General',
    level: 'Main'
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
    // Fix: Added missing subject property for all LDC practice tests
    { id: 'ldc_gk', title: 'General Knowledge', questions: 20, duration: 20, subject: 'GK', topic: 'General Knowledge' },
    { id: 'ldc_ml', title: 'Malayalam Grammar', questions: 10, duration: 10, subject: 'Malayalam', topic: 'Malayalam Grammar' },
    { id: 'ldc_en', title: 'English Grammar', questions: 10, duration: 10, subject: 'English', topic: 'English Grammar' },
    { id: 'ldc_ma', title: 'Mental Ability', questions: 10, duration: 15, subject: 'Maths', topic: 'Mental Ability' },
    { id: 'ldc_sc', title: 'General Science', questions: 10, duration: 10, subject: 'Science', topic: 'General Science' },
  ],
  studyNotes: [{ id: 'sn_kh', title: 'Kerala History' }, { id: 'sn_ic', title: 'Indian Constitution' }],
  previousPapers: [{ id: 'pp_ldc21', title: 'LDC 2021 Previous Paper' }]
};

export const TEACHING_EXAM_CONTENT: ExamPageContent = {
  practiceTests: [
    // Fix: Added missing subject property for all Teaching practice tests
    { id: 'teach_psy', title: 'Psychology & Pedagogy', questions: 20, duration: 25, subject: 'Psychology', topic: 'Educational Psychology' },
    { id: 'teach_gk', title: 'General Knowledge', questions: 15, duration: 15, subject: 'GK', topic: 'General Knowledge' },
    { id: 'teach_ml', title: 'Malayalam', questions: 10, duration: 10, subject: 'Malayalam', topic: 'General' },
    { id: 'teach_en', title: 'English', questions: 10, duration: 10, subject: 'English', topic: 'General' },
  ],
  studyNotes: [{ id: 'sn_psy', title: 'Learning Theories' }],
  previousPapers: [{ id: 'pp_lpup22', title: 'LP/UP 2022 Paper' }]
};

export const STAFF_NURSE_CONTENT: ExamPageContent = {
  practiceTests: [
    // Fix: Added missing subject property for all Staff Nurse practice tests
    { id: 'sn_ns', title: 'Nursing Science', questions: 20, duration: 20, subject: 'Nursing', topic: 'Nursing Science' },
    { id: 'sn_an', title: 'Anatomy', questions: 10, duration: 10, subject: 'Science', topic: 'Anatomy' },
    { id: 'sn_gk', title: 'General Knowledge', questions: 10, duration: 10, subject: 'GK', topic: 'General Knowledge' },
  ],
  studyNotes: [{ id: 'sn_fn', title: 'Nursing Fundamentals' }],
  previousPapers: [{ id: 'pp_sn23', title: 'Staff Nurse 2023 Paper' }]
};

export const KSEB_CONTENT: ExamPageContent = {
  practiceTests: [
    // Fix: Added missing subject property for all KSEB practice tests
    { id: 'ks_ee', title: 'Electrical Engineering', questions: 20, duration: 20, subject: 'Technical', topic: 'Electrical Engineering' },
    { id: 'ks_em', title: 'Engineering Maths', questions: 10, duration: 15, subject: 'Maths', topic: 'Engineering Mathematics' },
    { id: 'ks_gk', title: 'General Knowledge', questions: 10, duration: 10, subject: 'GK', topic: 'General Knowledge' },
  ],
  studyNotes: [{ id: 'sn_ps', title: 'Power Systems' }],
  previousPapers: [{ id: 'pp_se22', title: 'Sub Engineer 2022 Paper' }]
};

export const EXAM_CONTENT_MAP: Record<string, ExamPageContent> = {
    'ldc_lgs': LDC_EXAM_CONTENT,
    'plus_two_prelims': LDC_EXAM_CONTENT,
    'degree_prelims': LDC_EXAM_CONTENT,
    'veo_exam': LDC_EXAM_CONTENT,
    'fireman_exam': LDC_EXAM_CONTENT,
    'lp_up_assistant': TEACHING_EXAM_CONTENT,
    'staff_nurse': STAFF_NURSE_CONTENT,
    'kseb_sub_eng': KSEB_CONTENT,
};

export const MOCK_QUESTION_BANK: QuizQuestion[] = [
  // --- GK / HISTORY ---
  { id: 'h1', question: "വൈക്കം സത്യാഗ്രഹം നടന്ന വർഷം?", options: ['1924', '1925', '1930', '1921'], correctAnswerIndex: 0, topic: 'Kerala History', subject: 'GK', difficulty: 'PSC Level' },
  { id: 'h2', question: "ഇന്ത്യൻ നാഷണൽ കോൺഗ്രസ് സ്ഥാപിച്ചത് ആര്?", options: ['എ.ഓ. ഹ്യൂം', 'ഗാന്ധിജി', 'നെഹ്‌റു', 'തിലക്'], correctAnswerIndex: 0, topic: 'Indian History', subject: 'GK', difficulty: 'PSC Level' },
  { id: 'h3', question: "കേരള സിംഹം എന്നറിയപ്പെടുന്നത് ആര്?", options: ['പഴശ്ശിരാജ', 'വേലുത്തമ്പി ദളവ', 'കുഞ്ഞാലി മരക്കാർ', 'അയ്യങ്കാലി'], correctAnswerIndex: 0, topic: 'Kerala History', subject: 'GK', difficulty: 'PSC Level' },
  { id: 'c1', question: "ഇന്ത്യൻ ഭരണഘടനയുടെ ശില്പി?", options: ['ബി.ആർ. അംബേദ്കർ', 'നെഹ്‌റു', 'രാജേന്ദ്ര പ്രസാദ്', 'പട്ടേൽ'], correctAnswerIndex: 0, topic: 'Indian Constitution', subject: 'GK', difficulty: 'Easy' },
  
  // --- MALAYALAM ---
  { id: 'm1', question: "'സന്ധ്യാവന്ദനം' പിരിച്ചെഴുതുക?", options: ['സന്ധ്യ + വന്ദനം', 'സന്ധി + വന്ദനം', 'സന്ധ്യ + അവന്ദനം', 'സന്ധ്യ + വന്നനം'], correctAnswerIndex: 0, topic: 'Malayalam Grammar', subject: 'Malayalam', difficulty: 'PSC Level' },
  { id: 'm2', question: "'അനുജൻ' എന്ന വാക്കിന്റെ സ്ത്രീലിംഗ രൂപം?", options: ['അനുജത്തി', 'അനുജ', 'അനുജി', 'പെങ്ങളുട്ടി'], correctAnswerIndex: 0, topic: 'Malayalam Grammar', subject: 'Malayalam', difficulty: 'Easy' },
  
  // --- ENGLISH ---
  { id: 'e1', question: "Antonym of 'Abundant'?", options: ['Scarce', 'Rich', 'Full', 'Plenty'], correctAnswerIndex: 0, topic: 'English Vocabulary', subject: 'English', difficulty: 'PSC Level' },
  { id: 'e2', question: "He is ______ M.A holder.", options: ['a', 'an', 'the', 'no article'], correctAnswerIndex: 1, topic: 'English Grammar', subject: 'English', difficulty: 'Easy' },
  
  // --- MATHS ---
  { id: 'ma1', question: "2, 4, 8, 16, ___ അടുത്ത സംഖ്യ ഏത്?", options: ['32', '24', '20', '64'], correctAnswerIndex: 0, topic: 'Mental Ability', subject: 'Maths', difficulty: 'Easy' },
  { id: 'ma2', question: "ഒരു ക്ലോക്കിൽ 3 മണി ആകുമ്പോൾ മിനിറ്റ് സൂചിയും മണിക്കൂർ സൂചിയും തമ്മിലുള്ള കോണളവ്?", options: ['90 ഡിഗ്രി', '180 ഡിഗ്രി', '45 ഡിഗ്രി', '60 ഡിഗ്രി'], correctAnswerIndex: 0, topic: 'Mental Ability', subject: 'Maths', difficulty: 'PSC Level' },
  
  // --- SCIENCE ---
  { id: 's1', question: "മനുഷ്യ ശരീരത്തിലെ ഏറ്റവും വലിയ ഗ്രന്ഥി?", options: ['കരൾ', 'ആമാശയം', 'ആഗ്നേയഗ്രന്ഥി', 'തൈറോയ്ഡ്'], correctAnswerIndex: 0, topic: 'Biology', subject: 'Science', difficulty: 'PSC Level' },
  { id: 's2', question: "വെള്ളത്തിന്റെ തിളനില എത്ര?", options: ['100 ഡിഗ്രി സെൽഷ്യസ്', '0 ഡിഗ്രി സെൽഷ്യസ്', '50 ഡിഗ്രി സെൽഷ്യസ്', '200 ഡിഗ്രി സെൽഷ്യസ്'], correctAnswerIndex: 0, topic: 'Physics', subject: 'Science', difficulty: 'Easy' },

  // --- TECHNICAL ---
  { id: 't1', question: "What is the unit of electric current?", options: ['Ampere', 'Volt', 'Ohm', 'Watt'], correctAnswerIndex: 0, topic: 'Electrical Basics', subject: 'Technical', difficulty: 'PSC Level' },
  { id: 't2', question: "Integral of sin(x) dx is?", options: ['-cos(x)', 'cos(x)', 'tan(x)', 'sec(x)'], correctAnswerIndex: 0, topic: 'Engineering Mathematics', subject: 'Technical', difficulty: 'PSC Level' }
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
    id: 'mt_ldc_01',
    examId: 'ldc_lgs',
    title: { ml: 'LDC Model Test 01', en: 'LDC Model Test 01' },
    description: { ml: 'എൽ.ഡി.സി സിലബസ് പ്രകാരമുള്ള മാതൃകാ പരീക്ഷ.', en: 'Mock test based on LDC syllabus.' },
    questionsCount: 100,
    duration: 75,
    negativeMarking: 0.33,
    isPro: false
  },
  {
    id: 'mt_lpup_01',
    examId: 'lp_up_assistant',
    title: { ml: 'LP/UP Assistant Mock', en: 'LP/UP Assistant Mock' },
    description: { ml: 'സൈക്കോളജി ഉൾപ്പെടെയുള്ള മോക്ക് ടെസ്റ്റ്.', en: 'Mock test including Psychology section.' },
    questionsCount: 100,
    duration: 75,
    negativeMarking: 0.33,
    isPro: false
  },
  {
    id: 'mt_mixed_01',
    examId: 'ldc_lgs',
    title: { ml: 'Full Mock Test (Mixed)', en: 'Full Mock Test (Mixed)' },
    description: { ml: 'എല്ലാ വിഷയങ്ങളും ഉൾപ്പെടുത്തിയ മാതൃകാ പരീക്ഷ.', en: 'Mock test covering all major subjects.' },
    questionsCount: 50,
    duration: 45,
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
