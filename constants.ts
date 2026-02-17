
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
    title: { ml: 'LDC / LGS Full Syllabus', en: 'LDC / LGS Full Syllabus' },
    description: { ml: '10-ാം ക്ലാസ്സ് തലത്തിലുള്ള എല്ലാ പരീക്ഷകൾക്കും വേണ്ടിയുള്ള പരിശീലനം.', en: 'Full training for all 10th level exams.' },
    icon: React.createElement(BookOpenIcon, { className: "h-8 w-8 text-indigo-500" }),
    category: 'General',
    level: 'Preliminary'
  },
  {
    id: 'university_assistant',
    title: { ml: 'University Assistant / Sub Inspector', en: 'University Assistant / SI' },
    description: { ml: 'ഡിഗ്രി ലെവൽ മെയിൻ പരീക്ഷകൾക്ക് വേണ്ടിയുള്ള പ്രത്യേക പരിശീലനം.', en: 'Special training for Degree Level Main exams.' },
    icon: React.createElement(AcademicCapIcon, { className: "h-8 w-8 text-indigo-700" }),
    category: 'General',
    level: 'Main'
  },
  {
    id: 'plus_two_prelims',
    title: { ml: 'Plus Two Level Prelims (CPO / Excise)', en: 'Plus Two Level Prelims' },
    description: { ml: 'സിവിൽ പോലീസ് ഓഫീസർ, എക്സൈസ് ഇൻസ്പെക്ടർ തുടങ്ങിയ പരീക്ഷകൾ.', en: 'CPO, Excise Inspector and related exams.' },
    icon: React.createElement(ShieldCheckIcon, { className: "h-8 w-8 text-indigo-600" }),
    category: 'General',
    level: 'Preliminary'
  }
];

export const MOCK_TESTS_DATA: MockTest[] = [
  { 
    id: 'mock_ldc_full_1', 
    examId: 'ldc_lgs', 
    title: { ml: 'LDC Model Exam 2025 #1', en: 'LDC Model Exam 2025 #1' }, 
    description: { ml: 'KPSC സിലബസ് പ്രകാരമുള്ള 100 ചോദ്യങ്ങൾ, 75 മിനിറ്റ്.', en: '100 Qs as per KPSC syllabus, 75 Minutes.' }, 
    questionsCount: 100, 
    duration: 75, 
    negativeMarking: 0.33, 
    isPro: false 
  },
  { 
    id: 'mock_ua_full_1', 
    examId: 'university_assistant', 
    title: { ml: 'University Assistant Main Model #1', en: 'University Assistant Main Model #1' }, 
    description: { ml: 'ഡിഗ്രി ലെവൽ മെയിൻ പരീക്ഷയുടെ അതേ മാതൃകയിൽ 100 ചോദ്യങ്ങൾ.', en: '100 Questions in exact Degree Level Main model.' }, 
    questionsCount: 100, 
    duration: 75, 
    negativeMarking: 0.33, 
    isPro: true 
  },
  { 
    id: 'mock_cpo_full_1', 
    examId: 'plus_two_prelims', 
    title: { ml: 'CPO / Constable Model Exam', en: 'CPO / Constable Model Exam' }, 
    description: { ml: 'പ്ലസ് ടു ലെവൽ പ്രിലിംസ് മാതൃകാ പരീക്ഷ (100 Qs).', en: 'Plus Two Level Prelims Model Exam (100 Qs).' }, 
    questionsCount: 100, 
    duration: 75, 
    negativeMarking: 0.33, 
    isPro: true 
  },
  { 
    id: 'mock_lgs_full_1', 
    examId: 'ldc_lgs', 
    title: { ml: 'LGS Model Exam 2025', en: 'LGS Model Exam 2025' }, 
    description: { ml: 'ലസ്റ്റ് ഗ്രേഡ് സർവന്റ്സ് പരീക്ഷയുടെ അതേ സിലബസ്.', en: 'Exact syllabus for Last Grade Servants exam.' }, 
    questionsCount: 100, 
    duration: 75, 
    negativeMarking: 0.33, 
    isPro: false 
  }
];

export const LDC_EXAM_CONTENT: ExamPageContent = {
  practiceTests: [
    { id: 'ldc_full_mod', title: 'Full Length Model Exam', questions: 100, duration: 75, subject: 'Mixed', topic: 'Full Syllabus' },
    { id: 'ldc_gk_1', title: 'Kerala Geography', questions: 20, duration: 20, subject: 'Geography', topic: 'Kerala' }
  ],
  studyNotes: [],
  previousPapers: []
};

export const EXAM_CONTENT_MAP: Record<string, ExamPageContent> = {
    'ldc_lgs': LDC_EXAM_CONTENT,
    'university_assistant': LDC_EXAM_CONTENT,
    'plus_two_prelims': LDC_EXAM_CONTENT,
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

export const STUDY_SUBJECTS: StudyMaterial[] = [
    { id: 'hist', title: 'ചരിത്രം', subject: 'History', icon: React.createElement(BookOpenIcon, { className: "h-6 w-6 text-rose-500" }) },
    { id: 'const', title: 'ഭരണഘടന', subject: 'Constitution', icon: React.createElement(ScaleIcon, { className: "h-6 w-6 text-indigo-500" }) },
    { id: 'sci', title: 'ശാസ്ത്രം', subject: 'Science', icon: React.createElement(BeakerIcon, { className: "h-6 w-6 text-cyan-500" }) },
    { id: 'geo', title: 'ഭൂമിശാസ്ത്രം', subject: 'Geography', icon: React.createElement(GlobeAltIcon, { className: "h-6 w-6 text-emerald-500" }) },
    { id: 'math', title: 'ഗണിതം', subject: 'Maths', icon: React.createElement(ClipboardListIcon, { className: "h-6 w-6 text-amber-500" }) },
    { id: 'mal', title: 'മലയാളം', subject: 'Malayalam', icon: React.createElement(LightBulbIcon, { className: "h-6 w-6 text-orange-500" }) },
    { id: 'eng', title: 'ഇംഗ്ലീഷ്', subject: 'English', icon: React.createElement(AcademicCapIcon, { className: "h-6 w-6 text-blue-500" }) },
    { id: 'it', title: 'ഐ.ടി', subject: 'IT', icon: React.createElement(ShieldCheckIcon, { className: "h-6 w-6 text-teal-500" }) }
];

export const MOCK_QUESTION_PAPERS: QuestionPaper[] = [
    { title: 'LDC 2021 (Phase 1)', url: 'https://keralapsc.gov.in/sites/default/files/question_paper/021_2021.pdf', date: '20-02-2021', year: '2021', size: '1.2 MB' },
    { title: 'University Assistant 2023', url: 'https://keralapsc.gov.in/sites/default/files/question_paper/ua_2023.pdf', date: '15-06-2023', year: '2023', size: '2.4 MB' },
    { title: 'LGS 2021 (Various)', url: 'https://keralapsc.gov.in/sites/default/files/question_paper/lgs_2021.pdf', date: '12-03-2021', year: '2021', size: '0.8 MB' },
    { title: 'Secretariat Assistant 2018', url: 'https://keralapsc.gov.in/sites/default/files/question_paper/sa_2018.pdf', date: '13-10-2018', year: '2018', size: '3.1 MB' },
    { title: 'CPO / Constable 2022', url: 'https://keralapsc.gov.in/sites/default/files/question_paper/cpo_2022.pdf', date: '04-11-2022', year: '2022', size: '1.5 MB' }
];

export const QUIZ_CATEGORIES: QuizCategory[] = [
  { id: 'kerala_renaissance', title: { ml: 'നവോത്ഥാനം', en: 'Kerala Renaissance' }, description: { ml: 'കേരളത്തിലെ നവോത്ഥാന നായകരെയും സമരങ്ങളെയും കുറിച്ചുള്ള ചോദ്യങ്ങൾ.', en: 'Questions about Kerala renaissance leaders and movements.' }, icon: React.createElement(StarIcon, { className: "h-6 w-6 text-indigo-500" }) },
  { id: 'indian_constitution', title: { ml: 'ഭരണഘടന', en: 'Indian Constitution' }, description: { ml: 'ഇന്ത്യൻ ഭരണഘടനയുടെ പ്രസക്ത ഭാഗങ്ങളെക്കുറിച്ചുള്ള ക്വിസ്.', en: 'Quiz on essential parts of the Indian Constitution.' }, icon: React.createElement(ScaleIcon, { className: "h-6 w-6 text-amber-600" }) },
  { id: 'kerala_history', title: { ml: 'കേരള ചരിത്രം', en: 'Kerala History' }, description: { ml: 'ചരിത്രപ്രധാനമായ സംഭവങ്ങളും ഭരണാധികാരികളും.', en: 'Historical events and rulers of Kerala.' }, icon: React.createElement(BookOpenIcon, { className: "h-6 w-6 text-rose-600" }) },
  { id: 'science', title: { ml: 'ശാസ്ത്രം', en: 'General Science' }, description: { ml: 'ഭൗതികശാസ്ത്രം, രസതന്ത്രം, ജീവശാസ്ത്രം.', en: 'Physics, Chemistry, and Biology essentials.' }, icon: React.createElement(BeakerIcon, { className: "h-6 w-6 text-cyan-600" }) },
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
export const MOCK_NOTIFICATIONS: Notification[] = [];
export const MOCK_PSC_UPDATES: PscUpdateItem[] = [];
export const MOCK_CURRENT_AFFAIRS: CurrentAffairsItem[] = [];
export const MOCK_GK: GkItem[] = [];
export const STUDY_MATERIALS_DATA: StudyMaterial[] = [];
export const TESTIMONIALS_DATA: Testimonial[] = [];
export const MOCK_BOOKS_DATA: Book[] = [];
export const SEPTEMBER_EXAMS_DATA: ExamCalendarEntry[] = MARCH_EXAMS_DATA; // Fallback
export const OCTOBER_EXAMS_DATA: ExamCalendarEntry[] = APRIL_EXAMS_DATA; // Fallback
