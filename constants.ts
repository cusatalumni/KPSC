import React from 'react';
import type { Exam, Notification, StudyMaterial, ExamPageContent, Testimonial, Book, ExamCalendarEntry, QuizCategory, MockTest, PscUpdateItem, QuestionPaper, CurrentAffairsItem, GkItem, QuizQuestion } from './types';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { StarIcon } from './components/icons/StarIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { NewspaperIcon } from './components/icons/NewspaperIcon';
import { AcademicCapIcon } from './components/icons/AcademicCapIcon';
import { BeakerIcon } from './components/icons/BeakerIcon';
import { ChatBubbleLeftRightIcon } from './components/icons/ChatBubbleLeftRightIcon';
import { ScaleIcon } from './components/icons/ScaleIcon';
import { GlobeAltIcon } from './components/icons/GlobeAltIcon';

export const NAV_LINKS = [
  { nameKey: 'nav.home', target: 'dashboard' },
  { nameKey: 'nav.courses', target: 'dashboard' },
  { nameKey: 'nav.quizzes', target: 'quiz_home' },
  { nameKey: 'nav.mockTests', target: 'mock_test_home' },
  { nameKey: 'nav.currentAffairs', target: 'current_affairs' },
  { nameKey: 'nav.gk', target: 'gk' },
  { nameKey: 'nav.previousPapers', target: 'previous_papers'},
  { nameKey: 'nav.pscLive', target: 'psc_live_updates'},
  { nameKey: 'nav.bookstore', target: 'bookstore' },
  { nameKey: 'nav.examCalendar', target: 'exam_calendar' },
];

export const EXAMS_DATA: Exam[] = [
  {
    id: 'ldc',
    title: { ml: 'LDC ക്ലർക്ക്', en: 'LDC Clerk' },
    description: { ml: 'ലോവർ ഡിവിഷൻ ക്ലർക്ക് പരീക്ഷയ്ക്കുള്ള സമഗ്രമായ പരിശീലനം.', en: 'Comprehensive coaching for Lower Division Clerk exam.' },
    icon: React.createElement(BookOpenIcon, { className: "h-8 w-8 text-indigo-500" })
  },
  {
    id: 'lgs',
    title: { ml: 'LGS', en: 'Last Grade Servants' },
    description: { ml: 'ലാസ്റ്റ് ഗ്രേഡ് സർവന്റ്സ് പരീക്ഷയിൽ ഉന്നത വിജയം നേടാം.', en: 'Achieve top ranks in the Last Grade Servants exam.' },
    icon: React.createElement(StarIcon, { className: "h-8 w-8 text-teal-500" })
  },
  {
    id: 'kerala_police',
    title: { ml: 'പോലീസ് കോൺസ്റ്റബിൾ', en: 'Police Constable' },
    description: { ml: 'കായികക്ഷമതാ പരീക്ഷയിലും എഴുത്തുപരീക്ഷയിലും സമ്പൂർണ്ണ പരിശീലനം.', en: 'Complete training for physical and written exams.' },
    icon: React.createElement(BookOpenIcon, { className: "h-8 w-8 text-slate-500" })
  },
  {
    id: 'fireman',
    title: { ml: 'ഫയർമാൻ', en: 'Fireman' },
    description: { ml: 'ഫയർമാൻ ആകാനുള്ള നിങ്ങളുടെ സ്വപ്നം ഞങ്ങൾ സാക്ഷാത്കരിക്കും.', en: 'We help you achieve your dream of becoming a fireman.' },
    icon: React.createElement(StarIcon, { className: "h-8 w-8 text-red-500" })
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Deputy Superintendent of Police (Trainee) - Kerala Police Service',
    categoryNumber: '265/2025',
    lastDate: '10-09-2025',
    link: '#',
  },
  {
    id: '2',
    title: 'Village Field Assistant - Revenue Department',
    categoryNumber: '123/2025',
    lastDate: '05-09-2025',
    link: '#',
  },
];

export const MOCK_PSC_UPDATES: PscUpdateItem[] = [
    {
        title: 'RANKED LIST - STATISTICAL ASSISTANT GR II - ERNAKULAM',
        url: '#',
        section: 'Ranked Lists',
        published_date: '2024-07-29',
    },
    {
        title: 'SHORT LIST - JUNIOR INSTRUCTOR - INDUSTRIAL TRAINING',
        url: '#',
        section: 'Short Lists',
        published_date: '2024-07-29',
    },
];

export const MOCK_CURRENT_AFFAIRS: CurrentAffairsItem[] = [
    { id: '1', title: 'സംസ്ഥാന ബജറ്റ് 2025: പ്രധാന പ്രഖ്യാപനങ്ങൾ', source: 'മാതൃഭൂമി', date: '2025-08-01'},
    { id: '2', title: 'പുതിയ ദേശീയ വിദ്യാഭ്യാസ നയം: കേരളത്തിലെ സ്വാധീനം', source: 'മനോരമ', date: '2025-08-01'},
];

export const MOCK_GK: GkItem[] = [
    { id: '1', fact: 'കേരളത്തിലെ ഏറ്റവും വലിയ ശുദ്ധജല തടാകം ശാസ്താംകോട്ട കായലാണ്.', category: 'കേരളം'},
    { id: '2', fact: 'ഇന്ത്യയുടെ ദേശീയ പതാക രൂപകൽപ്പന ചെയ്തത് പിംഗലി വെങ്കയ്യയാണ്.', category: 'ഇന്ത്യ'},
];

export const MOCK_QUESTION_PAPERS: QuestionPaper[] = [
    {
        title: "LOWER DIVISION CLERK (SR FROM ST ONLY) - VARIOUS",
        url: "#",
        date: "2024"
    },
    {
        title: "BEAT FOREST OFFICER (PART I - DIRECT) - FOREST",
        url: "#",
        date: "2024"
    }
];


export const STUDY_MATERIALS_DATA: StudyMaterial[] = [
    { id: '1', title: 'പ്രധാനപ്പെട്ട GK ചോദ്യങ്ങൾ PDF', link: '#' },
    { id: '2', title: 'കറന്റ് അഫയേഴ്സ് - ജൂലൈ 2024', link: '#' },
    { id: '3', title: 'കേരള നവോത്ഥാനം - പ്രധാന നോട്ടുകൾ', link: '#' },
    { id: '4', title: 'ഇന്ത്യൻ ഭരണഘടന - ചോദ്യങ്ങൾ', link: '#' },
];


export const LDC_EXAM_CONTENT: ExamPageContent = {
  practiceTests: [
    { id: 'pt1', title: 'ചരിത്രം', questions: 20, duration: 15 },
    { id: 'pt2', title: 'ഭൂമിശാസ്ത്രം', questions: 20, duration: 15 },
    { id: 'pt3', title: 'ഇന്ത്യൻ ഭരണഘടന', questions: 25, duration: 20 },
    { id: 'pt4', title: 'ലഘുഗണിതം', questions: 15, duration: 25 },
  ],
  studyNotes: [
    { id: 'sn1', title: 'കേരള നവോത്ഥാന നായകർ PDF', link: '#' },
    { id: 'sn2', title: 'പ്രധാനപ്പെട്ട ആർട്ടിക്കിളുകൾ', link: '#' },
    { id: 'sn3', title: 'മലയാളം ഒറ്റപ്പദങ്ങൾ', link: '#' },
  ],
  previousPapers: [
    { id: 'pp1', title: 'LDC 2020 ചോദ്യപേപ്പർ', link: '#' },
    { id: 'pp2', title: 'LDC 2017 ചോദ്യപേപ്പർ', link: '#' },
  ]
};

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: '1',
    name: 'അനൂപ് കൃഷ്ണൻ',
    role: 'LDC ക്ലർക്ക്, റവന്യൂ വകുപ്പ്',
    avatarUrl: 'https://picsum.photos/seed/anoop/200',
    quote: 'ഈ ആപ്പിലെ മോക്ക് ടെസ്റ്റുകൾ യഥാർത്ഥ പരീക്ഷയ്ക്ക് തയ്യാറെടുക്കാൻ എന്നെ ഒരുപാട് സഹായിച്ചു. ചോദ്യങ്ങളുടെ നിലവാരം വളരെ മികച്ചതായിരുന്നു.'
  },
  {
    id: '2',
    name: 'ലക്ഷ്മി പ്രിയ',
    role: 'അസിസ്റ്റന്റ്, സെക്രട്ടേറിയറ്റ്',
    avatarUrl: 'https://picsum.photos/seed/lakshmi/200',
    quote: 'ദിവസേനയുള്ള ക്വിസുകളും പഠന സാമഗ്രികളും എന്റെ പഠനം വളരെ എളുപ്പമാക്കി. ഒഴിവുസമയങ്ങളിൽ പോലും പഠിക്കാൻ സാധിച്ചു. നന്ദി!'
  },
  {
    id: '3',
    name: 'മുഹമ്മദ്‌ ഷാഫി',
    role: 'പോലീസ് കോൺസ്റ്റബിൾ',
    avatarUrl: 'https://picsum.photos/seed/shafi/200',
    quote: 'മുൻവർഷത്തെ ചോദ്യപേപ്പറുകൾ വിശകലനം ചെയ്തത് പരീക്ഷാ രീതി മനസ്സിലാക്കാൻ ഉപകരിച്ചു. എല്ലാവർക്കും ഞാൻ ഈ ആപ്പ് ശുപാർശ ചെയ്യുന്നു.'
  }
];

export const BOOKSTORE_DATA: Book[] = [
  { id: '1', title: 'LDC റാങ്ക് ഫയൽ', author: 'Lakshya Publications', imageUrl: 'https://m.media-amazon.com/images/I/81g0dn6S4LL._SY466_.jpg', amazonLink: 'https://www.amazon.in/dp/B0CK13J51N?tag=httpcodingonl-21' },
  { id: '2', title: 'PSC ബുള്ളറ്റിൻ ചോദ്യബാങ്ക്', author: 'Talent Academy', imageUrl: 'https://m.media-amazon.com/images/I/61kM2a+zIHL._SY466_.jpg', amazonLink: 'https://www.amazon.in/dp/B0D5N4G8D9?tag=httpcodingonl-21' },
  { id: '3', title: 'ഇന്ത്യൻ ഭരണഘടന', author: 'M Laxmikanth (Malayalam)', imageUrl: 'https://m.media-amazon.com/images/I/71iTOsKa8QL._SY466_.jpg', amazonLink: 'https://www.amazon.in/dp/B09BD45BBP?tag=httpcodingonl-21' },
  { id: '4', title: 'കേരള ചരിത്രം', author: 'E. Sreedhara Menon', imageUrl: 'https://m.media-amazon.com/images/I/71N-T5DUaWL._SY466_.jpg', amazonLink: 'https://www.amazon.in/dp/8126484351?tag=httpcodingonl-21' },
  { id: '5', title: 'LGS റാങ്ക് ഫയൽ (Latest)', author: 'Veto Publications', imageUrl: 'https://m.media-amazon.com/images/I/71q5218FjML._SY466_.jpg', amazonLink: 'https://www.amazon.in/dp/B0D3754271?tag=httpcodingonl-21' },
  { id: '6', title: 'Comprehensive Guide to PSC English', author: 'V. K. Sujith Kumar', imageUrl: 'https://m.media-amazon.com/images/I/61s+iK-p5SL._SY466_.jpg', amazonLink: 'https://www.amazon.in/dp/B084M1942G?tag=httpcodingonl-21' },
  { id: '7', title: 'മനോരമ ഇയർബുക്ക് 2024', author: 'Manorama Publications', imageUrl: 'https://m.media-amazon.com/images/I/71P4a+2Yv-L._SY466_.jpg', amazonLink: 'https://www.amazon.in/dp/B0CPJ15NDR?tag=httpcodingonl-21' },
  { id: '8', title: 'മാതൃഭൂമി ഇയർബുക്ക് പ്ലസ് 2024', author: 'Mathrubhumi', imageUrl: 'https://m.media-amazon.com/images/I/81L7-K9+j-L._SY466_.jpg', amazonLink: 'https://www.amazon.in/dp/B0CNGB19J4?tag=httpcodingonl-21' },
  { id: '9', title: 'Lucent\'s സാമാന്യ വിജ്ഞാനം', author: 'Lucent Publications', imageUrl: 'https://m.media-amazon.com/images/I/61YZ-NMC6rL._SY466_.jpg', amazonLink: 'https://www.amazon.in/dp/939019233X?tag=httpcodingonl-21' },
];

export const QUIZ_CATEGORIES: QuizCategory[] = [
  { id: 'gk', title: { ml: 'പൊതുവിജ്ഞാനം', en: 'General Knowledge' }, description: { ml: 'ചരിത്രം, ഭൂമിശാസ്ത്രം, തുടങ്ങിയവ.', en: 'History, Geography, etc.' }, icon: React.createElement(SparklesIcon, { className: "h-8 w-8 text-indigo-500" }) },
  { id: 'ca', title: { ml: 'ആനുകാലിക സംഭവങ്ങൾ', en: 'Current Affairs' }, description: { ml: 'ഏറ്റവും പുതിയ വാർത്തകൾ.', en: 'The latest news and events.' }, icon: React.createElement(NewspaperIcon, { className: "h-8 w-8 text-teal-500" }) },
  { id: 'ms', title: { ml: 'മലയാള സാഹിത്യം', en: 'Malayalam Literature' }, description: { ml: 'എഴുത്തുകാരും കൃതികളും.', en: 'Authors and their works.' }, icon: React.createElement(AcademicCapIcon, { className: "h-8 w-8 text-slate-500" }), isPro: true },
  { id: 'sc', title: { ml: 'ജനപ്രിയ ശാസ്ത്രം', en: 'Popular Science' }, description: { ml: 'അടിസ്ഥാന ശാസ്ത്ര തത്വങ്ങൾ.', en: 'Basic scientific principles.' }, icon: React.createElement(BeakerIcon, { className: "h-8 w-8 text-green-500" }) },
  { id: 'en', title: { ml: 'English Grammar', en: 'English Grammar' }, description: { ml: 'വ്യാകരണ നിയമങ്ങളും പ്രയോഗങ്ങളും.', en: 'Grammar rules and usage.' }, icon: React.createElement(ChatBubbleLeftRightIcon, { className: "h-8 w-8 text-red-500" }) },
  { id: 'kh', title: { ml: 'കേരള ചരിത്രം', en: 'Kerala History' }, description: { ml: 'കേരളത്തിന്റെ ഇന്നലെകൾ.', en: 'The history of Kerala.' }, icon: React.createElement(BookOpenIcon, { className: "h-8 w-8 text-indigo-600" }) },
  { id: 'ih', title: { ml: 'ഇന്ത്യൻ ചരിത്രം', en: 'Indian History' }, description: { ml: 'സ്വാതന്ത്ര്യ സമരവും മറ്റും.', en: 'Freedom struggle and more.' }, icon: React.createElement(ScaleIcon, { className: "h-8 w-8 text-teal-600" }), isPro: true },
  { id: 'gp', title: { ml: 'ഭൂമിശാസ്ത്രം', en: 'Geography' }, description: { ml: 'ലോകവും ഇന്ത്യയും.', en: 'World and Indian geography.' }, icon: React.createElement(GlobeAltIcon, { className: "h-8 w-8 text-slate-600" }) },
];


export const MOCK_TESTS_DATA: MockTest[] = [
  { id: 'ldc-mt-1', examId: 'ldc', title: { ml: 'LDC ഫുൾ മോക്ക് ടെസ്റ്റ് #1', en: 'LDC Full Mock Test #1' }, description: { ml: 'പുതിയ സിലബസ് പ്രകാരമുള്ള 100 ചോദ്യങ്ങൾ ഉൾക്കൊള്ളുന്ന സമ്പൂർണ്ണ മോക്ക് ടെസ്റ്റ്.', en: 'A complete mock test with 100 questions as per the new syllabus.' }, questionsCount: 100, duration: 75, isPro: true },
  { id: 'lgs-mt-1', examId: 'lgs', title: { ml: 'LGS ഫുൾ മോക്ക് ടെസ്റ്റ് #1', en: 'LGS Full Mock Test #1' }, description: { ml: 'LGS പരീക്ഷയ്ക്കായി തയ്യാറാക്കിയ 100 ചോദ്യങ്ങളുടെ മാതൃകാ പരീക്ഷ.', en: 'A model exam with 100 questions prepared for the LGS exam.' }, questionsCount: 100, duration: 75, isPro: true },
  { id: 'police-mt-1', examId: 'kerala_police', title: { ml: 'പോലീസ് കോൺസ്റ്റബിൾ മോക്ക് ടെസ്റ്റ്', en: 'Police Constable Mock Test' }, description: { ml: 'കായികക്ഷമതാ പരീക്ഷയ്ക്ക് മുൻപുള്ള നിങ്ങളുടെ അറിവ് പരീക്ഷിക്കുക.', en: 'Test your knowledge before the physical efficiency test.' }, questionsCount: 100, duration: 75, isPro: true },
  { id: 'ldc-mt-2', examId: 'ldc', title: { ml: 'LDC ഫുൾ മോക്ക് ടെസ്റ്റ് #2', en: 'LDC Full Mock Test #2' }, description: { ml: 'നിങ്ങളുടെ തയ്യാറെടുപ്പുകൾ അടുത്ത ഘട്ടത്തിലേക്ക് കൊണ്ടുപോകാൻ സഹായിക്കുന്ന 100 ചോദ്യങ്ങൾ.', en: '100 questions to help take your preparation to the next level.' }, questionsCount: 100, duration: 75, isPro: true },
];

export const OCTOBER_EXAMS_DATA: ExamCalendarEntry[] = [
  { slNo: '1', catNo: '093/2023', postName: 'Confidential Assistant Gr II (Main Examination)', department: 'KERALA WATER AUTHORITY', examDate: '06/10/2025', syllabusLink: '#'},
  { slNo: '2', catNo: '446/2023', postName: 'ASSISTANT TIME KEEPER - DIRECT RECRUITMENT', department: 'PRINTING DEPARTMENT', examDate: '07/10/2025', syllabusLink: '#'},
  { slNo: '6', catNo: '319/2024', postName: 'TRAINING INSTRUCTOR-SURVEYOR - DIRECT RECRUITMENT', department: 'SCHEDULED CASTE DEVELOPMENT', examDate: '09/10/2025', syllabusLink: '#'},
  { slNo: '7', catNo: '044/2024', postName: 'TREATMENT ORGANISER GR.II - DIRECT RECRUITMENT', department: 'HEALTH SERVICES', examDate: '11/10/2025', syllabusLink: '#'},
  { slNo: '13', catNo: '753/2024', postName: 'ASSISTANT PROFESSOR IN CARDIOLOGY', department: 'MEDICAL EDUCATION', examDate: '14/10/2025', syllabusLink: '#'},
  { slNo: '19', catNo: '090/2025', postName: 'ASSISTANT PROFESSOR IN BIOCHEMISTRY', department: 'MEDICAL EDUCATION', examDate: '14/10/2025', syllabusLink: '#'},
  { slNo: '25', catNo: '134/2023', postName: 'STORE KEEPER - DIRECT RECRUITMENT (Main Examination)', department: 'KERALA STATE POULTRY DEVELOPMENT CORPORATION LTD.', examDate: '16/10/2025', syllabusLink: '#'},
  { slNo: '29', catNo: '001/2025', postName: 'KAS OFFICER JR TIME SCALE TRAINEE - STREAM I', department: 'KERALA ADMINISTRATIVE SERVICE', examDate: '17/10/2025 & 18/10/2025', syllabusLink: '#'},
  { slNo: '32', catNo: '176/2024', postName: 'LD TYPIST/CLERK-TYPIST/TYPIST CLERK(EX-SERVICEMEN ONLY)', department: 'NCC / SAINIK WELFARE', examDate: '22/10/2025', syllabusLink: '#'},
  { slNo: '41', catNo: '546/2024', postName: 'OFFICE ASSISTANT-NCA-SC', department: 'KERALA TOURISM DEVELOPMENT CORPORATION LIMITED', examDate: '22/10/2025', syllabusLink: '#'},
  { slNo: '83', catNo: '468/2024', postName: 'JUNIOR GEOPHYSICIST - DIRECT RECRUITMENT', department: 'GROUND WATER', examDate: '24/10/2025', syllabusLink: '#'},
  { slNo: '88', catNo: '141/2024', postName: 'LIVESTOCK INSPECTOR GRII/POULTRY ASST./MILK RECORDER/STOREKEEPER', department: 'ANIMAL HUSBANDRY', examDate: '27/10/2025', syllabusLink: '#'},
  { slNo: '130', catNo: '385/2024', postName: 'WORK SUPERINTENDENT - DIRECT RECRUITMENT', department: 'SOIL SURVEY AND SOIL CONSERVATION DEPARTMENT', examDate: '28/10/2025', syllabusLink: '#'},
  { slNo: '132', catNo: '192/2024', postName: 'DIVISIONAL ACCOUNTS OFFICER (IN-SERVICE QUOTA)', department: 'KERALA STATE ELECTRICITY BOARD', examDate: '30/10/2025 & 31/10/2025', syllabusLink: '#'},
];

export const SEPTEMBER_EXAMS_DATA: ExamCalendarEntry[] = [
  { slNo: '1', catNo: '346/2024', postName: 'DIVISIONAL ACCOUNTS OFFICER - NCA FOR : MUSLIM', department: 'KERALA WATER AUTHORITY', examDate: '01/09/2025 & 02/09/2025', syllabusLink: '#'},
  { slNo: '19', catNo: '596/2024', postName: 'LABORATORY TECHNICIAN-DIRECT RECRUITMENT', department: 'MEAT PRODUCTS OF INDIA LIMITED', examDate: '10/09/2025', syllabusLink: '#'},
  { slNo: '21', catNo: '443/2024', postName: 'EXCISE INSPECTOR (TRAINEE) (EXCISE) - NCA FOR : SIUC NADAR', department: 'EXCISE', examDate: '11/09/2025', syllabusLink: '#'},
  { slNo: '26', catNo: '432/2024', postName: 'ASSISTANT - DIRECT RECRUITMENT', department: 'KERALA FINANCIAL CORPORATION', examDate: '13/09/2025', syllabusLink: '#'},
  { slNo: '28', catNo: '503/2024', postName: 'CLERK (TAMIL AND MALAYALAM KNOWING)-NCA FOR : DHEEVARA (Preliminary Examination)', department: 'VARIOUS', examDate: '15/09/2025', syllabusLink: '#'},
  { slNo: '29', catNo: '586/2024', postName: 'CARETAKER (FEMALE)- DIRECT RECRUITMENT', department: 'WOMEN AND CHILD DEVELOPMENT', examDate: '16/09/2025', syllabusLink: '#'},
  { slNo: '34', catNo: '088/2024', postName: 'OVERSEER GRADE III / DRAFTSMAN GRADE III (CIVIL)/ TRACER/WORK SUPERINTENT', department: 'HARBOUR ENGINEERING', examDate: '17/09/2025', syllabusLink: '#'},
  { slNo: '36', catNo: '587/2024', postName: 'TECHNOLOGIST- PART I(GENERAL CATEGORY)-DIRECT RECRUITMENT', department: 'MATSYAFED', examDate: '18/09/2025', syllabusLink: '#'},
  { slNo: '40', catNo: '085/2024', postName: 'DUFFEDAR - DIRECT RECRUITMENT', department: 'ENQUIRY COMMISSIONER AND SPECIAL JUDGE', examDate: '20/09/2025', syllabusLink: '#'},
  { slNo: '68', catNo: '514/2024', postName: 'TRADESMAN-POLYMER TECHNOLOGY', department: 'TECHNICAL EDUCATION DEPARTMENT', examDate: '22/09/2025', syllabusLink: '#'},
  { slNo: '69', catNo: '033/2024', postName: 'OVERSEER GRADE III (KERALA WATER AUTHORITY) - DIRECT RECRUITMENT', department: 'KERALA WATER AUTHORITY', examDate: '23/09/2025', syllabusLink: '#'},
  { slNo: '72', catNo: '022/2024', postName: 'ASSISTANT GR.II - DIRECT RECRUITMENT NCA FOR : MUSLIM', department: 'KERALA STATE HOUSING BOARD', examDate: '24/09/2025', syllabusLink: '#'},
  { slNo: '75', catNo: '449/2024', postName: 'FIELD OFFICER NCA FOR : SIUC NADAR', department: 'KERALA FOREST DEVELOPMENT CORPORATION LIMITED', examDate: '25/09/2025', syllabusLink: '#'},
  { slNo: '90', catNo: '576/2024', postName: 'ASSISTANT / AUDITOR--DIRECT RECRUITMENT', department: 'GOVT SECRETARIAT/KPSC/ADVOCATE GENERALS OFFICE etc.', examDate: '27/09/2025', syllabusLink: '#'},
];

export const MOCK_QUESTION_BANK: QuizQuestion[] = [
    // LDC Clerk Topics
    { topic: "LDC ക്ലർക്ക് - ചരിത്രം", question: "കേരളത്തിലെ ഏറ്റവും വലിയ നദി ഏതാണ്?", options: ["പെരിയാർ", "ഭാരതപ്പുഴ", "പമ്പ", "ചാലിയാർ"], correctAnswerIndex: 0 },
    { topic: "LDC ക്ലർക്ക് - ചരിത്രം", question: "ഇന്ത്യയുടെ ദേശീയ പതാക രൂപകൽപ്പന ചെയ്തത് ആര്?", options: ["മഹാത്മാ ഗാന്ധി", "പിംഗലി വെങ്കയ്യ", "സർദാർ പട്ടേൽ", "ജവഹർലാൽ നെഹ്‌റു"], correctAnswerIndex: 1 },
    { topic: "LDC ക്ലർക്ക് - ഭൂമിശാസ്ത്രം", question: "സൈലന്റ് വാലി ദേശീയോദ്യാനം ഏത് ജില്ലയിലാണ്?", options: ["ഇടുക്കി", "വയനാട്", "പാലക്കാട്", "മലപ്പുറം"], correctAnswerIndex: 2 },
    { topic: "LDC ക്ലർക്ക് - ഇന്ത്യൻ ഭരണഘടന", question: "ഇന്ത്യൻ ഭരണഘടനയുടെ ശില്പി എന്നറിയപ്പെടുന്നത് ആര്?", options: ["ജവഹർലാൽ നെഹ്‌റു", "ഡോ. ബി.ആർ. അംബേദ്കർ", "സർദാർ വല്ലഭായ് പട്ടേൽ", "രാജേന്ദ്ര പ്രസാദ്"], correctAnswerIndex: 1 },

    // Quiz Category Topics
    { topic: "പൊതുവിജ്ഞാനം", question: "ലോകത്തിലെ ഏറ്റവും ഉയരം കൂടിയ കൊടുമുടി ഏതാണ്?", options: ["കെ2", "കാഞ്ചൻജംഗ", "എവറസ്റ്റ്", "നന്ദാദേവി"], correctAnswerIndex: 2 },
    { topic: "പൊതുവിജ്ഞാനം", question: "കേരളത്തിലെ ആദ്യത്തെ മുഖ്യമന്ത്രി ആരായിരുന്നു?", options: ["പട്ടം താണുപിള്ള", "സി. അച്യുതമേനോൻ", "ഇ.എം.എസ്. നമ്പൂതിരിപ്പാട്", "ആർ. ശങ്കർ"], correctAnswerIndex: 2 },
    { topic: "ആനുകാലിക സംഭവങ്ങൾ", question: "2024-ലെ ഒളിമ്പിക്സ് നടന്നത് എവിടെയാണ്?", options: ["ടോക്കിയോ", "പാരിസ്", "ലോസ് ഏഞ്ചൽസ്", "ലണ്ടൻ"], correctAnswerIndex: 1 },
    { topic: "മലയാള സാഹിത്യം", question: "'രണ്ടാമൂഴം' എന്ന പ്രശസ്ത നോവൽ രചിച്ചതാര്?", options: ["തകഴി ശിവശങ്കരപ്പിള്ള", "വൈക്കം മുഹമ്മദ് ബഷീർ", "ഒ.വി. വിജയൻ", "എം.ടി. വാസുദേവൻ നായർ"], correctAnswerIndex: 3 },
    { topic: "ജനപ്രിയ ശാസ്ത്രം", question: "ശബ്ദത്തിന്റെ വേഗത ഏറ്റവും കൂടുതലുള്ള മാധ്യമം ഏത്?", options: ["വായു", "ജലം", "ശൂന്യത", "ഖരം"], correctAnswerIndex: 3 },
    { topic: "English Grammar", question: "Choose the correct sentence: ", options: ["He is senior than me.", "He is senior to me.", "He is senior of me.", "He is senior with me."], correctAnswerIndex: 1 },
    { topic: "കേരള ചരിത്രം", question: "മാമാങ്കം നടന്നിരുന്നത് ഏത് നദിയുടെ തീരത്തായിരുന്നു?", options: ["പെരിയാർ", "പമ്പ", "ഭാരതപ്പുഴ", "ചാലിയാർ"], correctAnswerIndex: 2 },
    { topic: "ഇന്ത്യൻ ചരിത്രം", question: "ബംഗാൾ വിഭജനം നടന്ന വർഷം?", options: ["1905", "1911", "1919", "1947"], correctAnswerIndex: 0 },
    { topic: "ഭൂമിശാസ്ത്രം", question: "സൗരയൂഥത്തിലെ ഏറ്റവും വലിയ ഗ്രഹം ഏതാണ്?", options: ["ഭൂമി", "ചൊവ്വ", "വ്യാഴം", "ശനി"], correctAnswerIndex: 2 },
    
    // Mock Test Topics
    { topic: "LDC ഫുൾ മോക്ക് ടെസ്റ്റ് #1", question: "താഴെ പറയുന്നവയിൽ ഇന്ത്യയുടെ അയൽരാജ്യമല്ലാത്തത് ഏത്?", options: ["നേപ്പാൾ", "ചൈന", "തായ്‌ലൻഡ്", "ഭൂട്ടാൻ"], correctAnswerIndex: 2 },
    { topic: "LDC ഫുൾ മോക്ക് ടെസ്റ്റ് #1", question: "കേരള നിയമസഭയിലെ ആകെ അംഗങ്ങളുടെ എണ്ണം?", options: ["140", "141", "100", "20"], correctAnswerIndex: 0 },
    { topic: "LDC ഫുൾ മോക്ക് ടെസ്റ്റ് #1", question: "ഒന്നാം സ്വാതന്ത്ര്യ സമരം നടന്ന വർഷം?", options: ["1857", "1947", "1885", "1900"], correctAnswerIndex: 0 },
    { topic: "LDC ഫുൾ മോക്ക് ടെസ്റ്റ് #1", question: "Who wrote 'Gitanjali'?", options: ["Rabindranath Tagore", "Mahatma Gandhi", "Jawaharlal Nehru", "Sarojini Naidu"], correctAnswerIndex: 0 },
    { topic: "LGS ഫുൾ മോക്ക് ടെസ്റ്റ് #1", question: "കേരളത്തിലെ ഏറ്റവും തെക്കേ അറ്റത്തുള്ള ജില്ല ഏത്?", options: ["കൊല്ലം", "പത്തനംതിട്ട", "തിരുവനന്തപുരം", "ആലപ്പുഴ"], correctAnswerIndex: 2 },
    { topic: "LGS ഫുൾ മോക്ക് ടെസ്റ്റ് #1", question: "ഇന്ത്യയുടെ ദേശീയ മൃഗം ഏതാണ്?", options: ["സിംഹം", "കടുവ", "ആന", "പുലി"], correctAnswerIndex: 1 },
    { topic: "പോലീസ് കോൺസ്റ്റബിൾ മോക്ക് ടെസ്റ്റ്", question: "ഇന്ത്യൻ പീനൽ കോഡ് (IPC) നിലവിൽ വന്ന വർഷം?", options: ["1860", "1861", "1862", "1950"], correctAnswerIndex: 0 },
    { topic: "പോലീസ് കോൺസ്റ്റബിൾ മോക്ക് ടെസ്റ്റ്", question: " കേരള പോലീസിന്റെ ആപ്തവാക്യം എന്താണ്?", options: ["സേവനം, സുരക്ഷ, സാഹോദര്യം", "മൃദുഭാവേ, ദൃഢകൃത്യേ", "സത്യമേവ ജയതേ", "ജനമൈത്രി സുരക്ഷ"], correctAnswerIndex: 1 },
    
    // More questions for variety
    { topic: "പൊതുവിജ്ഞാനം", question: "ജപ്പാനിലെ നാണയം ഏതാണ്?", options: ["യെൻ", "യുവാൻ", "വോൺ", "രൂപ"], correctAnswerIndex: 0 },
    { topic: "കേരള ചരിത്രം", question: "കുണ്ടറ വിളംബരം നടത്തിയത് ആരാണ്?", options: ["പഴശ്ശിരാജ", "വേലുത്തമ്പി ദളവ", "ശക്തൻ തമ്പുരാൻ", "മാർത്താണ്ഡവർമ്മ"], correctAnswerIndex: 1 },
    { topic: "ഇന്ത്യൻ ഭരണഘടന", question: "മൗലികാവകാശങ്ങൾ ഭരണഘടനയുടെ ഏത് ഭാഗത്താണ് ഉൾപ്പെടുത്തിയിരിക്കുന്നത്?", options: ["ഭാഗം I", "ഭാഗം II", "ഭാഗം III", "ഭാഗം IV"], correctAnswerIndex: 2 },
    { topic: "English Grammar", question: "A group of lions is called a ____.", options: ["herd", "flock", "pride", "pack"], correctAnswerIndex: 2 },
    { topic: "ജനപ്രിയ ശാസ്ത്രം", question: "മനുഷ്യ ശരീരത്തിലെ ഏറ്റവും വലിയ അവയവം ഏതാണ്?", options: ["ഹൃദയം", "കരൾ", "തലച്ചോറ്", "ത്വക്ക്"], correctAnswerIndex: 3 },
    { topic: "LDC ഫുൾ മോക്ക് ടെസ്റ്റ് #2", question: "ഗുരുവായൂർ സത്യാഗ്രഹത്തിന് നേതൃത്വം നൽകിയത് ആരായിരുന്നു?", options: ["എ.കെ. ഗോപാലൻ", "കെ. കേളപ്പൻ", "മന്നത്ത് പത്മനാഭൻ", "ടി.കെ. മാധവൻ"], correctAnswerIndex: 1 },
    { topic: "LDC ഫുൾ മോക്ക് ടെസ്റ്റ് #2", question: "ഇന്ത്യയിലെ ഏറ്റവും നീളം കൂടിയ നദി ഏതാണ്?", options: ["ഗംഗ", "യമുന", "ഗോദാവരി", "ബ്രഹ്മപുത്ര"], correctAnswerIndex: 0 }
];
