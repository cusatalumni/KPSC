
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

// Content for LDC / LGS
export const LDC_EXAM_CONTENT: ExamPageContent = {
  practiceTests: [
    { id: 'ldc_pt1', title: 'General Knowledge', questions: 50, duration: 45 },
    { id: 'ldc_pt2', title: 'Mental Ability', questions: 20, duration: 20 },
    { id: 'ldc_pt3', title: 'General English', questions: 20, duration: 15 },
  ],
  studyNotes: [
    { id: 'ldc_sn1', title: 'Kerala History (കേരള ചരിത്രം)' },
    { id: 'ldc_sn2', title: 'Indian Constitution (ഭരണഘടന)' },
  ],
  previousPapers: [
    { id: 'ldc_pp1', title: 'LDC 2021 All Districts' },
    { id: 'ldc_pp2', title: 'LGS 2021 Previous Paper' },
  ]
};

// Content for Staff Nurse Gr II
export const STAFF_NURSE_CONTENT: ExamPageContent = {
  practiceTests: [
    { id: 'sn_pt1', title: 'Nursing Science (നഴ്സിംഗ് സയൻസ്)', questions: 60, duration: 50 },
    { id: 'sn_pt2', title: 'Anatomy & Physiology', questions: 20, duration: 20 },
    { id: 'sn_pt3', title: 'Community Health Nursing', questions: 20, duration: 20 },
  ],
  studyNotes: [
    { id: 'sn_sn1', title: 'Nursing Fundamentals (നഴ്സിംഗ് അടിസ്ഥാനങ്ങൾ)' },
    { id: 'sn_sn2', title: 'Infection Control Protocols' },
    { id: 'sn_sn3', title: 'Florence Nightingale History' },
  ],
  previousPapers: [
    { id: 'sn_pp1', title: 'Staff Nurse Gr II 2023 Official Paper' },
    { id: 'sn_pp2', title: 'Nursing Science 2021 Mains' },
  ]
};

// Content for KSEB Sub Engineer
export const KSEB_CONTENT: ExamPageContent = {
  practiceTests: [
    { id: 'ks_pt1', title: 'Electrical Engineering', questions: 80, duration: 60 },
    { id: 'ks_pt2', title: 'Electronics & Circuits', questions: 20, duration: 15 },
  ],
  studyNotes: [
    { id: 'ks_sn1', title: 'Power Systems Fundamentals' },
    { id: 'ks_sn2', title: 'KSEB Safety Regulations' },
  ],
  previousPapers: [
    { id: 'ks_pp1', title: 'Sub Engineer 2022 KSEB' },
  ]
};

// Mapping of Exam IDs to their specific content
export const EXAM_CONTENT_MAP: Record<string, ExamPageContent> = {
    'ldc_lgs': LDC_EXAM_CONTENT,
    'staff_nurse': STAFF_NURSE_CONTENT,
    'kseb_sub_eng': KSEB_CONTENT,
    'degree_prelims': LDC_EXAM_CONTENT, // Fallback to LDC if specific not defined
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
    { id: '1', question: 'Father of Kerala Renaissance?', options: ['Sree Narayana Guru', 'Ayyankali', 'Chattampi Swamikal', 'Kumaran Asan'], correctAnswerIndex: 0, topic: 'Kerala Renaissance', subject: 'GK', difficulty: 'PSC Level' },
];

export const MOCK_QUESTION_PAPERS: QuestionPaper[] = [
    { title: "LDC 2021 Previous Paper", url: "#", date: "2021" }
];

export const STUDY_MATERIALS_DATA: StudyMaterial[] = [
    { id: '1', title: 'Kerala History' },
    { id: '2', title: 'Indian Constitution' }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  { id: '1', name: 'രാഹുൽ ആർ.', role: 'LDC 2021 ബാച്ച് വിജയി', avatarUrl: 'https://picsum.photos/seed/winner1/200', quote: 'ഈ പ്ലാറ്റ്‌ഫോം എന്റെ പഠനത്തെ വളരെ ലളിതമാക്കി. പ്രത്യേകിച്ച് ഡെയ്‌ലി അപ്‌ഡേറ്റുകൾ പരീക്ഷാ സമയത്ത് എന്നെ ഒരുപാട് സഹായിച്ചു.' },
  { id: '2', name: 'അഞ്ജലി കൃഷ്ണ', role: 'സെക്രട്ടേറിയറ്റ് അസിസ്റ്റന്റ് റാങ്ക് ഹോൾഡർ', avatarUrl: 'https://picsum.photos/seed/winner2/200', quote: 'മോക്ക് ടെസ്റ്റുകൾ പരീക്ഷാ പേടി മാറ്റാൻ വളരെയധികം സഹായിച്ചു. കൃത്യമായ സമയക്രമീകരണത്തിൽ പരിശീലിക്കാൻ സാധിച്ചു.' },
  { id: '3', name: 'അഭിലാഷ് കെ.', role: 'KSEB സബ് എൻജിനീയർ (Rank 4)', avatarUrl: 'https://picsum.photos/seed/winner3/200', quote: 'ടെക്നിക്കൽ പരീക്ഷകൾക്ക് വേണ്ടിയുള്ള ക്വിസുകൾ എന്റെ ആത്മവിശ്വാസം വർധിപ്പിച്ചു.' },
  { id: '4', name: 'രേഷ്മ എം.ആർ.', role: 'സ്റ്റാഫ് നഴ്സ് ഗ്രേഡ് II വിജയി', avatarUrl: 'https://picsum.photos/seed/winner4/200', quote: 'നഴ്സിംഗ് വിഷയങ്ങളിലെ നോട്ട്സുകൾ വളരെ കൃത്യമാണ്.' }
];

export const MOCK_BOOKS_DATA: Book[] = [
  { id: 'b1', title: 'Kerala PSC LDC Rank File (Malayalam Edition)', author: 'Lakshya Publications', imageUrl: 'https://m.media-amazon.com/images/I/81x1sVlXWJL._SY466_.jpg', amazonLink: 'https://www.amazon.in/dp/B0CYX5W3C3?tag=malayalambooks-21' },
  { id: 'b2', title: 'Nursing Science Rank File', author: 'Talent Academy', imageUrl: 'https://m.media-amazon.com/images/I/61kM2a+zIHL._SY466_.jpg', amazonLink: 'https://www.amazon.in/dp/B0D5N4G8D9?tag=malayalambooks-21' },
  { id: 'b3', title: 'Electrical Engineering for PSC', author: 'Rank Master', imageUrl: 'https://m.media-amazon.com/images/I/71iTOsKa8QL._SY466_.jpg', amazonLink: 'https://www.amazon.in/dp/B09BD45BBP?tag=malayalambooks-21' }
];

export const SEPTEMBER_EXAMS_DATA: ExamCalendarEntry[] = [];
export const OCTOBER_EXAMS_DATA: ExamCalendarEntry[] = [];

export const NAV_STRUCTURE: NavLink[] = [
  { nameKey: 'nav.home', target: 'dashboard' },
  {
    nameKey: 'nav.practice',
    children: [
      { nameKey: 'nav.mockTests', target: 'mock_test_home' },
      { nameKey: 'nav.quizzes', target: 'quiz_home' },
    ]
  },
  {
    nameKey: 'nav.examHub',
    children: [
      { nameKey: 'nav.pscLive', target: 'psc_live_updates' },
      { nameKey: 'nav.examCalendar', target: 'exam_calendar' },
      { nameKey: 'nav.previousPapers', target: 'previous_papers' },
      { nameKey: 'dashboard.notifications.title', target: 'psc_live_updates' },
    ]
  },
  {
    nameKey: 'nav.resources',
    children: [
      { nameKey: 'nav.currentAffairs', target: 'current_affairs' },
      { nameKey: 'nav.gk', target: 'gk' },
      { nameKey: 'nav.studyMaterials', target: 'study_material' },
      { nameKey: 'nav.sitemap', target: 'sitemap' },
    ]
  },
  { nameKey: 'nav.bookstore', target: 'bookstore' }
];

export const QUIZ_CATEGORIES: QuizCategory[] = [
  {
    id: 'mixed',
    title: { ml: 'Mixed (എല്ലാം കലർന്നവ)', en: 'Mixed Questions' },
    description: { ml: 'എല്ലാ വിഷയങ്ങളിൽ നിന്നുമുള്ള ചോദ്യങ്ങൾ.', en: 'Questions from all categories combined.' },
    icon: React.createElement(StarIcon, { className: "h-6 w-6 text-yellow-500" })
  },
  {
    id: 'kerala_renaissance',
    title: { ml: 'Kerala Renaissance', en: 'Kerala Renaissance' },
    description: { ml: 'കേരള നവോത്ഥാനം.', en: 'Social Reformation in Kerala.' },
    icon: React.createElement(AcademicCapIcon, { className: "h-6 w-6 text-indigo-500" })
  },
  {
    id: 'kerala_geography',
    title: { ml: 'Kerala Geography', en: 'Kerala Geography' },
    description: { ml: 'കേരള ഭൂമിശാസ്ത്രം.', en: 'Geography of Kerala.' },
    icon: React.createElement(GlobeAltIcon, { className: "h-6 w-6 text-green-500" })
  },
  {
    id: 'indian_constitution',
    title: { ml: 'Indian Constitution', en: 'Indian Constitution' },
    description: { ml: 'ഇന്ത്യൻ ഭരണഘടന.', en: 'Constitution of India.' },
    icon: React.createElement(ScaleIcon, { className: "h-6 w-6 text-blue-500" })
  },
  {
    id: 'indian_history',
    title: { ml: 'Indian History', en: 'Indian History' },
    description: { ml: 'ഇന്ത്യൻ ചരിത്രം.', en: 'History of India.' },
    icon: React.createElement(BookOpenIcon, { className: "h-6 w-6 text-orange-500" })
  },
  {
    id: 'economy',
    title: { ml: 'Economy', en: 'Economy' },
    description: { ml: 'സാമ്പത്തിക ശാസ്ത്രം.', en: 'Indian Economy basics.' },
    icon: React.createElement(ScaleIcon, { className: "h-6 w-6 text-teal-500" })
  },
  {
    id: 'kerala_history',
    title: { ml: 'Kerala History', en: 'Kerala History' },
    description: { ml: 'കേരള ചരിത്രം.', en: 'History of Kerala.' },
    icon: React.createElement(BookOpenIcon, { className: "h-6 w-6 text-red-500" })
  },
  {
    id: 'kerala_culture',
    title: { ml: 'Kerala Culture', en: 'Kerala Culture' },
    description: { ml: 'കേരള സംസ്കാരം.', en: 'Culture and heritage of Kerala.' },
    icon: React.createElement(StarIcon, { className: "h-6 w-6 text-pink-500" })
  },
  {
    id: 'indian_geography',
    title: { ml: 'Indian Geography', en: 'Indian Geography' },
    description: { ml: 'ഇന്ത്യൻ ഭൂമിശാസ്ത്രം.', en: 'Geography of India.' },
    icon: React.createElement(GlobeAltIcon, { className: "h-6 w-6 text-cyan-500" })
  },
  {
    id: 'science',
    title: { ml: 'Science', en: 'Science' },
    description: { ml: 'ശാസ്ത്രം.', en: 'Physics, Chemistry, Biology.' },
    icon: React.createElement(BeakerIcon, { className: "h-6 w-6 text-purple-500" })
  },
  {
    id: 'current_affairs_cat',
    title: { ml: 'Current Affairs', en: 'Current Affairs' },
    description: { ml: 'ആനുകാലികം.', en: 'Latest events and news.' },
    icon: React.createElement(ShieldCheckIcon, { className: "h-6 w-6 text-teal-600" })
  },
  {
    id: 'aptitude_reasoning',
    title: { ml: 'Aptitude & Reasoning', en: 'Aptitude & Reasoning' },
    description: { ml: 'ഗണിതവും ചിന്താശേഷിയും.', en: 'Mathematics and logical reasoning.' },
    icon: React.createElement(LightBulbIcon, { className: "h-6 w-6 text-amber-500" })
  },
  {
    id: 'english_malayalam',
    title: { ml: 'English & Malayalam', en: 'Languages' },
    description: { ml: 'ഭാഷാ പഠനം.', en: 'English and Malayalam grammar.' },
    icon: React.createElement(BookOpenIcon, { className: "h-6 w-6 text-indigo-400" })
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
