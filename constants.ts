
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
    title: { ml: 'Degree Level Prelims (ഡിഗ്രി ലെവൽ പ്രിലിംസ്)', en: 'Degree Level Prelims' },
    description: { ml: 'സെക്രട്ടേറിയറ്റ് അസിസ്റ്റന്റ് ഉൾപ്പെടെയുള്ള പരീക്ഷകൾ.', en: 'Exams including Secretariat Assistant.' },
    icon: React.createElement(AcademicCapIcon, { className: "h-8 w-8 text-indigo-600" }),
    category: 'General',
    level: 'Preliminary'
  },
  {
    id: 'police_constable',
    title: { ml: 'Police Constable (പോലീസ് കോൺസ്റ്റബിൾ)', en: 'Police Constable' },
    description: { ml: 'യൂണിഫോം തസ്തികകളിലേക്കുള്ള പരീക്ഷകൾ.', en: 'Exams for uniform category posts.' },
    icon: React.createElement(ShieldCheckIcon, { className: "h-8 w-8 text-red-600" }),
    category: 'Special',
    level: 'Preliminary'
  }
];

export const MOCK_TESTS_DATA: MockTest[] = [
  {
    id: 'mt_mixed_01',
    examId: 'ldc_lgs',
    title: { ml: 'Full Mock Test (Mixed)', en: 'Full Mock Test (Mixed)' },
    description: { ml: 'എല്ലാ വിഷയങ്ങളും ഉൾപ്പെടുത്തിയ മാതൃകാ പരീക്ഷ.', en: 'Mock test covering all major subjects.' },
    questionsCount: 100,
    duration: 75,
    negativeMarking: 0.33,
    isPro: false
  },
  {
    id: 'mt_kerala_01',
    examId: 'ldc_lgs',
    title: { ml: 'Kerala History & Renaissance', en: 'Kerala History & Renaissance' },
    description: { ml: 'കേരള ചരിത്രവും നവോത്ഥാനവും.', en: 'Focus on Kerala History and Renaissance.' },
    questionsCount: 50,
    duration: 40,
    negativeMarking: 0.33,
    isPro: false
  },
  {
    id: 'mt_const_01',
    examId: 'degree_prelims',
    title: { ml: 'Indian Constitution & Polity', en: 'Indian Constitution & Polity' },
    description: { ml: 'ഭരണഘടനയും രാഷ്ട്രീയവും.', en: 'Comprehensive test on Constitution and Polity.' },
    questionsCount: 50,
    duration: 40,
    negativeMarking: 0.33,
    isPro: true
  }
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
    title: { ml: 'Kerala Renaissance (നവോത്ഥാനം)', en: 'Kerala Renaissance' },
    description: { ml: 'കേരള നവോത്ഥാന ചരിത്രം.', en: 'History of Kerala Social Reformation.' },
    icon: React.createElement(AcademicCapIcon, { className: "h-6 w-6 text-indigo-500" })
  },
  {
    id: 'kerala_geography',
    title: { ml: 'Kerala Geography (ഭൂമിശാസ്ത്രം)', en: 'Kerala Geography' },
    description: { ml: 'കേരളത്തിന്റെ ഭൂപ്രകൃതി.', en: 'Geographical features of Kerala.' },
    icon: React.createElement(GlobeAltIcon, { className: "h-6 w-6 text-green-500" })
  },
  {
    id: 'indian_constitution',
    title: { ml: 'Indian Constitution (ഭരണഘടന)', en: 'Indian Constitution' },
    description: { ml: 'ഇന്ത്യൻ ഭരണഘടനയും നിയമങ്ങളും.', en: 'Constitution of India and related laws.' },
    icon: React.createElement(ScaleIcon, { className: "h-6 w-6 text-blue-500" })
  },
  {
    id: 'indian_history',
    title: { ml: 'Indian History (ചരിത്രം)', en: 'Indian History' },
    description: { ml: 'ഇന്ത്യയുടെ പ്രാചീന - ആധുനിക ചരിത്രം.', en: 'Ancient, Medieval and Modern Indian History.' },
    icon: React.createElement(BookOpenIcon, { className: "h-6 w-6 text-orange-500" })
  },
  {
    id: 'science',
    title: { ml: 'Science (ശാസ്ത്രം)', en: 'Science' },
    description: { ml: 'ഭൗതികശാസ്ത്രം, രസതന്ത്രം, ജീവശാസ്ത്രം.', en: 'Physics, Chemistry and Biology basics.' },
    icon: React.createElement(BeakerIcon, { className: "h-6 w-6 text-purple-500" })
  },
  {
    id: 'english',
    title: { ml: 'English (ഇംഗ്ലീഷ്)', en: 'English Grammar' },
    description: { ml: 'ഇംഗ്ലീഷ് ഗ്രാമറും പദസമ്പത്തും.', en: 'Grammar, Vocabulary and Usage.' },
    icon: React.createElement(LightBulbIcon, { className: "h-6 w-6 text-indigo-400" })
  },
  {
    id: 'malayalam',
    title: { ml: 'Malayalam (മലയാളം)', en: 'Malayalam' },
    description: { ml: 'മലയാള വ്യാകരണം, സാഹിത്യം.', en: 'Malayalam Grammar and Literature.' },
    icon: React.createElement(BookOpenIcon, { className: "h-6 w-6 text-red-400" })
  },
  {
    id: 'aptitude_reasoning',
    title: { ml: 'Aptitude & Reasoning (ഗണിതം)', en: 'Aptitude & Reasoning' },
    description: { ml: 'ഗണിതവും ചിന്താശേഷിയും.', en: 'Mental Ability and Mathematics.' },
    icon: React.createElement(StarIcon, { className: "h-6 w-6 text-yellow-600" })
  },
  {
    id: 'current_affairs',
    title: { ml: 'Current Affairs (ആനുകാലികം)', en: 'Current Affairs' },
    description: { ml: 'ഏറ്റവും പുതിയ വാർത്തകൾ.', en: 'Latest news and updates.' },
    icon: React.createElement(ShieldCheckIcon, { className: "h-6 w-6 text-teal-500" })
  }
];

export const LDC_EXAM_CONTENT: ExamPageContent = {
  practiceTests: [
    { id: 'pt1', title: 'History (ചരിത്രം)', questions: 20, duration: 15 },
    { id: 'pt2', title: 'Geography (ഭൂമിശാസ്ത്രം)', questions: 20, duration: 15 },
    { id: 'pt3', title: 'Malayalam (മലയാളം)', questions: 10, duration: 10 },
    { id: 'pt4', title: 'English (ഇംഗ്ലീഷ്)', questions: 10, duration: 10 }
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
  { id: '2', name: 'അഞ്ജലി കൃഷ്ണ', role: 'സെക്രട്ടേറിയറ്റ് അസിസ്റ്റന്റ് റാങ്ക് ഹോൾഡർ', avatarUrl: 'https://picsum.photos/seed/winner2/200', quote: 'മോക്ക് ടെസ്റ്റുകൾ പരീക്ഷാ പേടി മാറ്റാൻ വളരെയധികം സഹായിച്ചു. കൃത്യമായ സമയക്രമീകരണത്തിൽ പരിശീലിക്കാൻ സാധിച്ചു.' }
];

export const MOCK_BOOKS_DATA: Book[] = [
  { id: 'b1', title: 'Kerala PSC LDC Rank File (Malayalam Edition)', author: 'Lakshya Publications', imageUrl: 'https://m.media-amazon.com/images/I/81x1sVlXWJL._SY466_.jpg', amazonLink: 'https://www.amazon.in/dp/B0CYX5W3C3?tag=malayalambooks-21' }
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
