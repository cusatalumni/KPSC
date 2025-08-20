
import React from 'react';
import type { Exam, Notification, StudyMaterial, ExamPageContent, Testimonial, Book, ExamCalendarEntry, QuizCategory, MockTest, User } from './types';
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
  { name: 'ഡാഷ്ബോർഡ്', target: 'dashboard' },
  { name: 'കോഴ്സുകൾ', target: 'dashboard' },
  { name: 'ക്വിസുകൾ', target: 'quiz_home' },
  { name: 'മോക്ക് ടെസ്റ്റുകൾ', target: 'mock_test_home' },
  { name: 'പുസ്തകശാല', target: 'bookstore' },
  { name: 'പരീക്ഷാ കലണ്ടർ', target: 'exam_calendar' },
];

export const EXAMS_DATA: Exam[] = [
  {
    id: 'ldc',
    title: 'LDC ക്ലർക്ക്',
    description: 'ലോവർ ഡിവിഷൻ ക്ലർക്ക് പരീക്ഷയ്ക്കുള്ള സമഗ്രമായ പരിശീലനം.',
    icon: React.createElement(BookOpenIcon, { className: "h-8 w-8 text-sky-500" })
  },
  {
    id: 'lgs',
    title: 'LGS',
    description: 'ലാസ്റ്റ് ഗ്രേഡ് സർവന്റ്സ് പരീക്ഷയിൽ ഉന്നത വിജയം നേടാം.',
    icon: React.createElement(StarIcon, { className: "h-8 w-8 text-amber-500" })
  },
  {
    id: 'kerala_police',
    title: 'പോലീസ് കോൺസ്റ്റബിൾ',
    description: 'കായികക്ഷമതാ പരീക്ഷയിലും എഴുത്തുപരീക്ഷയിലും സമ്പൂർണ്ണ പരിശീലനം.',
    icon: React.createElement(BookOpenIcon, { className: "h-8 w-8 text-slate-500" })
  },
  {
    id: 'fireman',
    title: 'ഫയർമാൻ',
    description: 'ഫയർമാൻ ആകാനുള്ള നിങ്ങളുടെ സ്വപ്നം ഞങ്ങൾ സാക്ഷാത്കരിക്കും.',
    icon: React.createElement(StarIcon, { className: "h-8 w-8 text-red-500" })
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'അസിസ്റ്റന്റ് പ്രൊഫസർ - വിജ്ഞാപനം',
    date: '25-07-2024',
    category: 'പുതിയ വിജ്ഞാപനം',
    link: '#',
  },
  {
    id: '2',
    title: 'വില്ലേജ് ഫീൽഡ് അസിസ്റ്റന്റ് - ഷോർട്ട് ലിസ്റ്റ്',
    date: '24-07-2024',
    category: 'ഷോർട്ട് ലിസ്റ്റ്',
    link: '#',
  },
  {
    id: '3',
    title: 'ഹൈസ്കൂൾ ടീച്ചർ (ഗണിതം) - റാങ്ക് ലിസ്റ്റ്',
    date: '22-07-2024',
    category: 'റാങ്ക് ലിസ്റ്റ്',
    link: '#',
  },
   {
    id: '4',
    title: 'പോലീസ് കോൺസ്റ്റബിൾ - പരീക്ഷാ തീയതി',
    date: '20-07-2024',
    category: 'പരീക്ഷാ കലണ്ടർ',
    link: '#',
  },
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
];

export const QUIZ_CATEGORIES: QuizCategory[] = [
  { id: 'gk', title: 'പൊതുവിജ്ഞാനം', description: 'ചരിത്രം, ഭൂമിശാസ്ത്രം, തുടങ്ങിയവ.', icon: React.createElement(SparklesIcon, { className: "h-8 w-8 text-amber-500" }) },
  { id: 'ca', title: 'ആനുകാലിക സംഭവങ്ങൾ', description: 'ഏറ്റവും പുതിയ വാർത്തകൾ.', icon: React.createElement(NewspaperIcon, { className: "h-8 w-8 text-sky-500" }) },
  { id: 'ms', title: 'മലയാള സാഹിത്യം', description: 'എഴുത്തുകാരും കൃതികളും.', icon: React.createElement(AcademicCapIcon, { className: "h-8 w-8 text-slate-500" }), isPro: true },
  { id: 'sc', title: 'ജനപ്രിയ ശാസ്ത്രം', description: 'അടിസ്ഥാന ശാസ്ത്ര തത്വങ്ങൾ.', icon: React.createElement(BeakerIcon, { className: "h-8 w-8 text-green-500" }) },
  { id: 'en', title: 'English Grammar', description: 'വ്യാകരണ നിയമങ്ങളും പ്രയോഗങ്ങളും.', icon: React.createElement(ChatBubbleLeftRightIcon, { className: "h-8 w-8 text-red-500" }) },
  { id: 'kh', title: 'കേരള ചരിത്രം', description: 'കേരളത്തിന്റെ ഇന്നലെകൾ.', icon: React.createElement(BookOpenIcon, { className: "h-8 w-8 text-amber-600" }) },
  { id: 'ih', title: 'ഇന്ത്യൻ ചരിത്രം', description: 'സ്വാതന്ത്ര്യ സമരവും മറ്റും.', icon: React.createElement(ScaleIcon, { className: "h-8 w-8 text-sky-600" }), isPro: true },
  { id: 'gp', title: 'ഭൂമിശാസ്ത്രം', description: 'ലോകവും ഇന്ത്യയും.', icon: React.createElement(GlobeAltIcon, { className: "h-8 w-8 text-slate-600" }) },
];


export const MOCK_TESTS_DATA: MockTest[] = [
  { id: 'ldc-mt-1', examId: 'ldc', title: 'LDC ഫുൾ മോക്ക് ടെസ്റ്റ് #1', description: 'പുതിയ സിലബസ് പ്രകാരമുള്ള 100 ചോദ്യങ്ങൾ ഉൾക്കൊള്ളുന്ന സമ്പൂർണ്ണ മോക്ക് ടെസ്റ്റ്.', questionsCount: 100, duration: 75, isPro: true },
  { id: 'lgs-mt-1', examId: 'lgs', title: 'LGS ഫുൾ മോക്ക് ടെസ്റ്റ് #1', description: 'LGS പരീക്ഷയ്ക്കായി തയ്യാറാക്കിയ 100 ചോദ്യങ്ങളുടെ മാതൃകാ പരീക്ഷ.', questionsCount: 100, duration: 75, isPro: true },
  { id: 'police-mt-1', examId: 'kerala_police', title: 'പോലീസ് കോൺസ്റ്റബിൾ മോക്ക് ടെസ്റ്റ്', description: 'കായികക്ഷമതാ പരീക്ഷയ്ക്ക് മുൻപുള്ള നിങ്ങളുടെ അറിവ് പരീക്ഷിക്കുക.', questionsCount: 100, duration: 75, isPro: true },
  { id: 'ldc-mt-2', examId: 'ldc', title: 'LDC ഫുൾ മോക്ക് ടെസ്റ്റ് #2', description: 'നിങ്ങളുടെ തയ്യാറെടുപ്പുകൾ അടുത്ത ഘട്ടത്തിലേക്ക് കൊണ്ടുപോകാൻ സഹായിക്കുന്ന 100 ചോദ്യങ്ങൾ.', questionsCount: 100, duration: 75, isPro: true },
];

export const LOGGED_IN_USER: User = {
  id: 'usr_12345',
  name: 'അനൂപ്',
  email: 'anoop@example.com',
  subscription: 'free',
};


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
