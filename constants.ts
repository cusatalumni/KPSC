
import React from 'react';
import type { Exam, Notification, StudyMaterial, ExamPageContent, Testimonial, Book, ExamCalendarEntry, QuizCategory, MockTest, PscUpdateItem, QuestionPaper } from './types';
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
  { name: 'ഹോം', target: 'dashboard' },
  { name: 'കോഴ്സുകൾ', target: 'dashboard' },
  { name: 'ക്വിസുകൾ', target: 'quiz_home' },
  { name: 'മോക്ക് ടെസ്റ്റുകൾ', target: 'mock_test_home' },
  { name: 'ചോദ്യപേപ്പറുകൾ', target: 'previous_papers'},
  { name: 'PSC Live', target: 'psc_live_updates'},
  { name: 'പുസ്തകശാല', target: 'bookstore' },
  { name: 'പരീക്ഷാ കലണ്ടർ', target: 'exam_calendar' },
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
  {
    id: '3',
    title: 'High School Teacher (Mathematics) - Education Department',
    categoryNumber: '321/2025',
    lastDate: '01-09-2025',
    link: '#',
  },
   {
    id: '4',
    title: 'Police Constable - Examination Date Announced',
    categoryNumber: '456/2024',
    lastDate: 'N/A',
    link: '#',
  },
];

export const MOCK_PSC_UPDATES: PscUpdateItem[] = [
    {
        title: 'RANKED LIST - STATISTICAL ASSISTANT GR II - STATISTICAL ASSISTANT GR II/STATISTICAL INVESTIGATOR GR II/COMPUTER OPERATOR GR II - ECONOMICS AND STATISTICS - ERNAKULAM',
        url: 'https://www.keralapsc.gov.in/ranked-list/ranked-list-statistical-assistant-gr-ii-statistical-assistant-gr-iistatistical',
        section: 'Ranked Lists',
        published_date: '2024-07-29',
    },
    {
        title: 'SHORT LIST - JUNIOR INSTRUCTOR (INTERIOR DECORATION AND DESIGNING) - INDUSTRIAL TRAINING DEPARTMENT',
        url: 'https://www.keralapsc.gov.in/short-list/short-list-junior-instructor-interior-decoration-and-designing-industrial-training',
        section: 'Short Lists',
        published_date: '2024-07-29',
    },
    {
        title: 'ADDENDUM NOTIFICATION - I GRADE DRAFTSMAN/ I GRADE OVERSEER (CIVIL) (SR FOR ST ONLY) IN LOCAL SELF GOVERNMENT DEPARTMENT',
        url: 'https://www.keralapsc.gov.in/addendum-notification/addendum-notification-i-grade-draftsman-i-grade-overseer-civil-sr-st-only',
        section: 'Notifications',
        published_date: '2024-07-26',
    },
];

export const MOCK_QUESTION_PAPERS: QuestionPaper[] = [
    {
        title: "LOWER DIVISION CLERK (SR FROM ST ONLY) - VARIOUS",
        url: "https://www.keralapsc.gov.in/question-paper-and-answer-key/lower-division-clerk-sr-st-only-various-0",
        date: "2024"
    },
    {
        title: "BEAT FOREST OFFICER (PART I - DIRECT) (CATEGORY NO. 207/2023) - FOREST",
        url: "https://www.keralapsc.gov.in/question-paper-and-answer-key/beat-forest-officer-part-i-direct-category-no-2072023-forest-0",
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