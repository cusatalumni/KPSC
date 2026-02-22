
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
    id: '10th_level',
    title: { ml: '10th Level (LGS, Office Attendant)', en: '10th Level (LGS, Office Attendant)' },
    description: { ml: 'LGS, Office Attendant, Peon തുടങ്ങിയ പത്താം ക്ലാസ്സ് തലത്തിലുള്ള പരീക്ഷകൾ.', en: '10th level exams including LGS, Office Attendant, Peon.' },
    icon: React.createElement(BookOpenIcon, { className: "h-8 w-8 text-indigo-500" }),
    category: '10th Level',
    level: 'Preliminary & Main'
  },
  {
    id: 'plus_two_level',
    title: { ml: 'Plus Two Level (LDC, VEO)', en: 'Plus Two Level (LDC, VEO)' },
    description: { ml: 'LDC, VEO, Fireman തുടങ്ങിയ പ്ലസ് ടു തലത്തിലുള്ള പരീക്ഷകൾ.', en: 'Plus Two level exams including LDC, VEO, Fireman.' },
    icon: React.createElement(AcademicCapIcon, { className: "h-8 w-8 text-blue-500" }),
    category: 'Plus Two Level',
    level: 'Preliminary & Main'
  },
  {
    id: 'degree_level',
    title: { ml: 'Degree Level (University Asst, SI)', en: 'Degree Level (University Asst, SI)' },
    description: { ml: 'University Assistant, Secretariat Assistant, SI തുടങ്ങിയ ഡിഗ്രി തലത്തിലുള്ള പരീക്ഷകൾ.', en: 'Degree level exams including University Assistant, Secretariat Assistant, SI.' },
    icon: React.createElement(ShieldCheckIcon, { className: "h-8 w-8 text-emerald-500" }),
    category: 'Degree Level',
    level: 'Preliminary & Main'
  },
  {
    id: 'police_security',
    title: { ml: 'Police / Security (CPO)', en: 'Police / Security (CPO)' },
    description: { ml: 'CPO, Women Police Constable തുടങ്ങിയ പോലീസ് പരീക്ഷകൾ.', en: 'Police exams including CPO, Women Police Constable.' },
    icon: React.createElement(ShieldCheckIcon, { className: "h-8 w-8 text-rose-500" }),
    category: 'Police',
    level: 'Preliminary & Main'
  },
  {
    id: 'kas',
    title: { ml: 'KAS (Kerala Administrative Service)', en: 'KAS (Kerala Administrative Service)' },
    description: { ml: 'KAS Officer പരീക്ഷകൾക്കുള്ള പരിശീലനം.', en: 'Training for KAS Officer exams.' },
    icon: React.createElement(StarIcon, { className: "h-8 w-8 text-amber-500" }),
    category: 'KAS',
    level: 'Preliminary & Main'
  },
  {
    id: 'health_teaching',
    title: { ml: 'Health & Teaching (Staff Nurse, HST)', en: 'Health & Teaching (Staff Nurse, HST)' },
    description: { ml: 'Staff Nurse, Pharmacist, HST തുടങ്ങിയ പരീക്ഷകൾ.', en: 'Exams like Staff Nurse, Pharmacist, HST.' },
    icon: React.createElement(BeakerIcon, { className: "h-8 w-8 text-cyan-500" }),
    category: 'Health & Teaching',
    level: 'Main'
  },
  {
    id: 'technical_engg',
    title: { ml: 'Technical / Engineering (AE, Overseer)', en: 'Technical / Engineering (AE, Overseer)' },
    description: { ml: 'Assistant Engineer, Overseer തുടങ്ങിയ സാങ്കേതിക പരീക്ഷകൾ.', en: 'Technical exams like Assistant Engineer, Overseer.' },
    icon: React.createElement(GlobeAltIcon, { className: "h-8 w-8 text-teal-500" }),
    category: 'Technical',
    level: 'Main'
  }
];

export const MOCK_TESTS_DATA: MockTest[] = [
  { 
    id: 'mock_10th_1', 
    examId: '10th_level', 
    title: { ml: '10th Level Prelims Model #1', en: '10th Level Prelims Model #1' }, 
    description: { ml: 'LGS, Office Attendant മാതൃകയിലുള്ള 100 ചോദ്യങ്ങൾ.', en: '100 Qs in LGS, Office Attendant model.' }, 
    questionsCount: 100, 
    duration: 75, 
    negativeMarking: 0.33, 
    isPro: false 
  },
  { 
    id: 'mock_plus_two_1', 
    examId: 'plus_two_level', 
    title: { ml: 'Plus Two Level (LDC) Model #1', en: 'Plus Two Level (LDC) Model #1' }, 
    description: { ml: 'LDC പരീക്ഷയുടെ അതേ മാതൃകയിൽ 100 ചോദ്യങ്ങൾ.', en: '100 Questions in exact LDC model.' }, 
    questionsCount: 100, 
    duration: 75, 
    negativeMarking: 0.33, 
    isPro: false 
  },
  { 
    id: 'mock_degree_1', 
    examId: 'degree_level', 
    title: { ml: 'Degree Level Prelims Model #1', en: 'Degree Level Prelims Model #1' }, 
    description: { ml: 'University Assistant, SI മാതൃകയിലുള്ള 100 ചോദ്യങ്ങൾ.', en: '100 Qs in University Assistant, SI model.' }, 
    questionsCount: 100, 
    duration: 75, 
    negativeMarking: 0.33, 
    isPro: true 
  }
];

const COMMON_10TH_SYLLABUS = [
    { id: '10th_full', title: 'Full Length Model Exam', questions: 100, duration: 75, subject: 'Mixed', topic: 'Full Syllabus' },
    { id: '10th_gk', title: 'General Knowledge', questions: 20, duration: 20, subject: 'General Knowledge', topic: 'Static GK' },
    { id: '10th_kerala', title: 'Kerala History & Geography', questions: 20, duration: 20, subject: 'Kerala History', topic: 'Kerala' },
    { id: '10th_science', title: 'General Science', questions: 20, duration: 20, subject: 'General Science / Science & Tech', topic: 'Science' },
    { id: '10th_math', title: 'Quantitative Aptitude', questions: 20, duration: 20, subject: 'Quantitative Aptitude', topic: 'Maths' }
];

const COMMON_12TH_SYLLABUS = [
    { id: '12th_full', title: 'Full Length Model Exam', questions: 100, duration: 75, subject: 'Mixed', topic: 'Full Syllabus' },
    { id: '12th_eng', title: 'General English', questions: 20, duration: 20, subject: 'English', topic: 'Grammar & Vocab' },
    { id: '12th_mal', title: 'Regional Language (Malayalam)', questions: 20, duration: 20, subject: 'Malayalam', topic: 'Grammar & Vocab' },
    { id: '12th_const', title: 'Indian Constitution', questions: 20, duration: 20, subject: 'Indian Polity / Constitution', topic: 'Constitution' },
    { id: '12th_it', title: 'Computer Science / IT', questions: 20, duration: 20, subject: 'Computer Science / IT / Cyber Laws', topic: 'IT' }
];

const COMMON_DEGREE_SYLLABUS = [
    { id: 'deg_full', title: 'Full Length Model Exam', questions: 100, duration: 75, subject: 'Mixed', topic: 'Full Syllabus' },
    { id: 'deg_hist', title: 'Indian History', questions: 20, duration: 20, subject: 'Indian History', topic: 'History' },
    { id: 'deg_geo', title: 'Indian Geography', questions: 20, duration: 20, subject: 'Indian Geography', topic: 'Geography' },
    { id: 'deg_eco', title: 'Indian Economy', questions: 20, duration: 20, subject: 'Indian Economy', topic: 'Economy' },
    { id: 'deg_reasoning', title: 'Reasoning & Mental Ability', questions: 20, duration: 20, subject: 'Reasoning / Mental Ability', topic: 'Reasoning' }
];

const POLICE_SYLLABUS = [
    { id: 'pol_full', title: 'Full Length Model Exam', questions: 100, duration: 75, subject: 'Mixed', topic: 'Full Syllabus' },
    { id: 'pol_const', title: 'Indian Constitution', questions: 20, duration: 20, subject: 'Indian Polity / Constitution', topic: 'Constitution' },
    { id: 'pol_kerala', title: 'Kerala Renaissance', questions: 20, duration: 20, subject: 'Kerala History / Renaissance', topic: 'Renaissance' },
    { id: 'pol_ca', title: 'Current Affairs', questions: 20, duration: 20, subject: 'Current Affairs', topic: 'Current Affairs' }
];

const KAS_SYLLABUS = [
    { id: 'kas_full', title: 'Full Length Model Exam', questions: 100, duration: 75, subject: 'Mixed', topic: 'Full Syllabus' },
    { id: 'kas_hist', title: 'History (India & Kerala)', questions: 20, duration: 20, subject: 'Indian History', topic: 'History' },
    { id: 'kas_geo', title: 'Geography (World, India, Kerala)', questions: 20, duration: 20, subject: 'Indian Geography', topic: 'Geography' },
    { id: 'kas_eco', title: 'Economy & Planning', questions: 20, duration: 20, subject: 'Indian Economy', topic: 'Economy' },
    { id: 'kas_pol', title: 'Polity & Governance', questions: 20, duration: 20, subject: 'Indian Polity / Constitution', topic: 'Polity' },
    { id: 'kas_sci', title: 'Science & Technology', questions: 20, duration: 20, subject: 'General Science / Science & Tech', topic: 'Science' }
];

const HEALTH_TEACHING_SYLLABUS = [
    { id: 'ht_full', title: 'Full Length Model Exam', questions: 100, duration: 75, subject: 'Mixed', topic: 'Full Syllabus' },
    { id: 'ht_nurse', title: 'Nursing Science', questions: 20, duration: 20, subject: 'Nursing Science / Health Care', topic: 'Nursing' },
    { id: 'ht_bio', title: 'Biology / Life Science', questions: 20, duration: 20, subject: 'Biology / Life Science', topic: 'Biology' },
    { id: 'ht_pedagogy', title: 'Educational Psychology', questions: 20, duration: 20, subject: 'Educational Psychology / Pedagogy', topic: 'Pedagogy' }
];

const TECH_ENGG_SYLLABUS = [
    { id: 'te_full', title: 'Full Length Model Exam', questions: 100, duration: 75, subject: 'Mixed', topic: 'Full Syllabus' },
    { id: 'te_ee', title: 'Electrical Engineering', questions: 20, duration: 20, subject: 'Electrical Engineering', topic: 'Electrical' },
    { id: 'te_math', title: 'Quantitative Aptitude', questions: 20, duration: 20, subject: 'Quantitative Aptitude', topic: 'Maths' },
    { id: 'te_it', title: 'Computer Science / IT', questions: 20, duration: 20, subject: 'Computer Science / IT / Cyber Laws', topic: 'IT' }
];

export const EXAM_CONTENT_MAP: Record<string, ExamPageContent> = {
    '10th_level': { practiceTests: COMMON_10TH_SYLLABUS, studyNotes: [], previousPapers: [] },
    'plus_two_level': { practiceTests: COMMON_12TH_SYLLABUS, studyNotes: [], previousPapers: [] },
    'degree_level': { practiceTests: COMMON_DEGREE_SYLLABUS, studyNotes: [], previousPapers: [] },
    'police_security': { practiceTests: POLICE_SYLLABUS, studyNotes: [], previousPapers: [] },
    'kas': { practiceTests: KAS_SYLLABUS, studyNotes: [], previousPapers: [] },
    'health_teaching': { practiceTests: HEALTH_TEACHING_SYLLABUS, studyNotes: [], previousPapers: [] },
    'technical_engg': { practiceTests: TECH_ENGG_SYLLABUS, studyNotes: [], previousPapers: [] },
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
    { title: 'TRADESMAN – AUTOMOBILE MECHANIC – TECHNICAL EDUCATION', url: 'https://keralapsc.gov.in/sites/default/files/2018-08/175-2016.pdf', year: '2016', category: 'OMR Question' },
    { title: 'TRADESMAN – SM LAB – TECHNICAL EDUCATION', url: 'https://keralapsc.gov.in/previous-question-papers', year: '2016', category: 'OMR Question' },
    { title: 'UP SCHOOL ASSISTANT – KANNADA MEDIUM – EDUCATION', url: 'https://keralapsc.gov.in/previous-question-papers', year: '2016', category: 'OMR Question' },
    { title: 'PLUMBER / PLUMBER-CUM-OPERATOR – IMS', url: 'https://keralapsc.gov.in/previous-question-papers', year: '2016', category: 'OMR Question' },
    { title: 'UP SCHOOL ASSISTANT – MALAYALAM MEDIUM – EDUCATION', url: 'https://keralapsc.gov.in/previous-question-papers', year: '2016', category: 'OMR Question' },
    { title: 'LECTURER IN CIVIL ENGINEERING – GOVT POLYTECHNICS', url: 'https://keralapsc.gov.in/previous-question-papers', year: '2016', category: 'OMR Question' },
    { title: 'TRADESMAN – REFRIGERATION AND AIR CONDITIONING', url: 'https://keralapsc.gov.in/previous-question-papers', year: '2016', category: 'OMR Question' },
    { title: 'LABORATORY TECHNICIAN GR II – ANIMAL HUSBANDRY', url: 'https://keralapsc.gov.in/previous-question-papers', year: '2016', category: 'OMR Question' },
    { title: 'LECTURER IN ELECTRICAL & ELECTRONICS ENGINEERING', url: 'https://keralapsc.gov.in/previous-question-papers', year: '2016', category: 'OMR Question' },
    { title: 'PHARMACIST GR II – IMS / MEDICAL EDUCATION', url: 'https://keralapsc.gov.in/previous-question-papers', year: '2016', category: 'OMR Question' }
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
