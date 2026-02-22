
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
    id: 'hsst_physics',
    title: { ml: 'HSST Physics', en: 'HSST Physics' },
    description: { ml: 'HSST Physics പരീക്ഷയ്ക്കുള്ള മോക്ക് ടെസ്റ്റുകളും മൈക്രോ ടെസ്റ്റുകളും.', en: 'Mock tests and micro tests for HSST Physics.' },
    icon: React.createElement(BookOpenIcon, { className: "h-8 w-8 text-indigo-500" }),
    category: 'Higher Secondary',
    level: 'Main'
  },
  {
    id: 'hsst_chemistry',
    title: { ml: 'HSST Chemistry', en: 'HSST Chemistry' },
    description: { ml: 'HSST Chemistry പരീക്ഷയ്ക്കുള്ള മോക്ക് ടെസ്റ്റുകളും മൈക്രോ ടെസ്റ്റുകളും.', en: 'Mock tests and micro tests for HSST Chemistry.' },
    icon: React.createElement(BeakerIcon, { className: "h-8 w-8 text-cyan-500" }),
    category: 'Higher Secondary',
    level: 'Main'
  },
  {
    id: 'pharmacist_siddha',
    title: { ml: 'Pharmacist Gr II (Siddha)', en: 'Pharmacist Gr II (Siddha)' },
    description: { ml: 'സിദ്ധ ഫാർമസിസ്റ്റ് പരീക്ഷയ്ക്കുള്ള മോക്ക് ടെസ്റ്റുകളും മൈക്രോ ടെസ്റ്റുകളും.', en: 'Mock tests and micro tests for Siddha Pharmacist.' },
    icon: React.createElement(ShieldCheckIcon, { className: "h-8 w-8 text-emerald-500" }),
    category: 'Medical',
    level: 'Main'
  },
  {
    id: 'pharmacist_homoeopathy',
    title: { ml: 'Pharmacist Gr II (Homoeopathy)', en: 'Pharmacist Gr II (Homoeopathy)' },
    description: { ml: 'ഹോമിയോപ്പതി ഫാർമസിസ്റ്റ് പരീക്ഷയ്ക്കുള്ള മോക്ക് ടെസ്റ്റുകളും മൈക്രോ ടെസ്റ്റുകളും.', en: 'Mock tests and micro tests for Homoeopathy Pharmacist.' },
    icon: React.createElement(AcademicCapIcon, { className: "h-8 w-8 text-rose-500" }),
    category: 'Medical',
    level: 'Main'
  }
];

export const MOCK_TESTS_DATA: MockTest[] = [
  { id: 'hsst_phy_full_1', examId: 'hsst_physics', title: { ml: 'HSST Physics Full Mock Test 1', en: 'HSST Physics Full Mock Test 1' }, description: { ml: 'Complete Syllabus (Classical + Quantum + Electrodynamics + Modern Physics)', en: 'Complete Syllabus (Classical + Quantum + Electrodynamics + Modern Physics)' }, questionsCount: 100, duration: 120, negativeMarking: 0.33, isPro: false },
  { id: 'hsst_phy_full_2', examId: 'hsst_physics', title: { ml: 'HSST Physics Full Mock Test 2', en: 'HSST Physics Full Mock Test 2' }, description: { ml: 'Focus on Electronics, Microprocessor & Mathematical Methods', en: 'Focus on Electronics, Microprocessor & Mathematical Methods' }, questionsCount: 100, duration: 120, negativeMarking: 0.33, isPro: true },
  { id: 'hsst_phy_full_3', examId: 'hsst_physics', title: { ml: 'HSST Physics Full Mock Test 3', en: 'HSST Physics Full Mock Test 3' }, description: { ml: 'Previous Year Pattern + Renaissance & GK Section', en: 'Previous Year Pattern + Renaissance & GK Section' }, questionsCount: 100, duration: 120, negativeMarking: 0.33, isPro: true },
  
  { id: 'hsst_chem_full_1', examId: 'hsst_chemistry', title: { ml: 'HSST Chemistry Full Mock Test 1', en: 'HSST Chemistry Full Mock Test 1' }, description: { ml: 'Inorganic + Organic Full Coverage', en: 'Inorganic + Organic Full Coverage' }, questionsCount: 100, duration: 120, negativeMarking: 0.33, isPro: false },
  { id: 'hsst_chem_full_2', examId: 'hsst_chemistry', title: { ml: 'HSST Chemistry Full Mock Test 2', en: 'HSST Chemistry Full Mock Test 2' }, description: { ml: 'Physical Chemistry + Advanced Inorganic', en: 'Physical Chemistry + Advanced Inorganic' }, questionsCount: 100, duration: 120, negativeMarking: 0.33, isPro: true },
  { id: 'hsst_chem_full_3', examId: 'hsst_chemistry', title: { ml: 'HSST Chemistry Full Mock Test 3', en: 'HSST Chemistry Full Mock Test 3' }, description: { ml: 'Mixed Modules + GK/Renaissance', en: 'Mixed Modules + GK/Renaissance' }, questionsCount: 100, duration: 120, negativeMarking: 0.33, isPro: true },

  { id: 'pharm_sid_full_1', examId: 'pharmacist_siddha', title: { ml: 'Siddha Pharmacist Full Mock Test 1', en: 'Siddha Pharmacist Full Mock Test 1' }, description: { ml: 'Fundamentals + Pharmacology + Toxicology', en: 'Fundamentals + Pharmacology + Toxicology' }, questionsCount: 100, duration: 120, negativeMarking: 0.33, isPro: false },
  { id: 'pharm_sid_full_2', examId: 'pharmacist_siddha', title: { ml: 'Siddha Pharmacist Full Mock Test 2', en: 'Siddha Pharmacist Full Mock Test 2' }, description: { ml: 'Anatomy, Physiology + Pharmacy & Formulations', en: 'Anatomy, Physiology + Pharmacy & Formulations' }, questionsCount: 100, duration: 120, negativeMarking: 0.33, isPro: true },
  { id: 'pharm_sid_full_3', examId: 'pharmacist_siddha', title: { ml: 'Siddha Pharmacist Full Mock Test 3', en: 'Siddha Pharmacist Full Mock Test 3' }, description: { ml: 'Siddha Specific Drugs + Dispensing', en: 'Siddha Specific Drugs + Dispensing' }, questionsCount: 100, duration: 120, negativeMarking: 0.33, isPro: true },

  { id: 'pharm_hom_full_1', examId: 'pharmacist_homoeopathy', title: { ml: 'Homoeopathy Pharmacist Full Mock Test 1', en: 'Homoeopathy Pharmacist Full Mock Test 1' }, description: { ml: 'Pharmacy Basics + Anatomy & Physiology', en: 'Pharmacy Basics + Anatomy & Physiology' }, questionsCount: 100, duration: 120, negativeMarking: 0.33, isPro: false },
  { id: 'pharm_hom_full_2', examId: 'pharmacist_homoeopathy', title: { ml: 'Homoeopathy Pharmacist Full Mock Test 2', en: 'Homoeopathy Pharmacist Full Mock Test 2' }, description: { ml: 'Pharmacognosy + Proving + Posology', en: 'Pharmacognosy + Proving + Posology' }, questionsCount: 100, duration: 120, negativeMarking: 0.33, isPro: true },
  { id: 'pharm_hom_full_3', examId: 'pharmacist_homoeopathy', title: { ml: 'Homoeopathy Pharmacist Full Mock Test 3', en: 'Homoeopathy Pharmacist Full Mock Test 3' }, description: { ml: 'Materia Medica & Dispensing Focus', en: 'Materia Medica & Dispensing Focus' }, questionsCount: 100, duration: 120, negativeMarking: 0.33, isPro: true }
];

export const HSST_PHYSICS_CONTENT: ExamPageContent = {
  practiceTests: [
    { id: 'hsst_phy_m1', title: 'Classical Mechanics: Newtonian & Lagrangian Formulation', questions: 20, duration: 20, subject: 'Physics', topic: 'Classical Mechanics' },
    { id: 'hsst_phy_m2', title: 'Classical Mechanics: Hamiltonian & Phase Space', questions: 20, duration: 20, subject: 'Physics', topic: 'Classical Mechanics' },
    { id: 'hsst_phy_m3', title: 'Mathematical Methods: Fourier Series, Transforms & Special Functions', questions: 20, duration: 20, subject: 'Physics', topic: 'Mathematical Methods' },
    { id: 'hsst_phy_m4', title: 'Mathematical Methods: Group Theory & Symmetry', questions: 20, duration: 20, subject: 'Physics', topic: 'Mathematical Methods' },
    { id: 'hsst_phy_m5', title: 'Electronics: Analog (Op-amps, Filters, Amplifiers)', questions: 20, duration: 20, subject: 'Physics', topic: 'Electronics' },
    { id: 'hsst_phy_m6', title: 'Electronics: Digital & Microprocessor 8085 Basics', questions: 20, duration: 20, subject: 'Physics', topic: 'Electronics' },
    { id: 'hsst_phy_m7', title: 'Quantum Mechanics: Schrödinger Equation & Particle in Box', questions: 20, duration: 20, subject: 'Physics', topic: 'Quantum Mechanics' },
    { id: 'hsst_phy_m8', title: 'Quantum Mechanics: Hydrogen Atom & Angular Momentum', questions: 20, duration: 20, subject: 'Physics', topic: 'Quantum Mechanics' },
    { id: 'hsst_phy_m9', title: 'Electrodynamics: Maxwell\'s Equations & EM Waves', questions: 20, duration: 20, subject: 'Physics', topic: 'Electrodynamics' },
    { id: 'hsst_phy_m10', title: 'Statistical Physics: Ensembles & Partition Function', questions: 20, duration: 20, subject: 'Physics', topic: 'Statistical Physics' },
    { id: 'hsst_phy_m11', title: 'Spectroscopy: Rotational, Vibrational, NMR', questions: 20, duration: 20, subject: 'Physics', topic: 'Spectroscopy' },
    { id: 'hsst_phy_m12', title: 'Condensed Matter: Crystal Structure & Band Theory', questions: 20, duration: 20, subject: 'Physics', topic: 'Condensed Matter' },
    { id: 'hsst_phy_m13', title: 'Nuclear Physics: Models & Reactions', questions: 20, duration: 20, subject: 'Physics', topic: 'Nuclear Physics' },
    { id: 'hsst_phy_m14', title: 'Particle Physics: Quarks & Standard Model', questions: 20, duration: 20, subject: 'Physics', topic: 'Particle Physics' }
  ],
  studyNotes: [],
  previousPapers: []
};

export const HSST_CHEMISTRY_CONTENT: ExamPageContent = {
  practiceTests: [
    { id: 'hsst_chem_m1', title: 'Inorganic Chemistry 1: Structure, Bonding & Periodicity', questions: 20, duration: 20, subject: 'Chemistry', topic: 'Inorganic Chemistry' },
    { id: 'hsst_chem_m2', title: 'Inorganic Chemistry 1: s-block & p-block Elements', questions: 20, duration: 20, subject: 'Chemistry', topic: 'Inorganic Chemistry' },
    { id: 'hsst_chem_m3', title: 'Inorganic Chemistry 2: Coordination Chemistry (CFT, LFT, MOT)', questions: 20, duration: 20, subject: 'Chemistry', topic: 'Inorganic Chemistry' },
    { id: 'hsst_chem_m4', title: 'Inorganic Chemistry 2: Organometallics & Bioinorganic', questions: 20, duration: 20, subject: 'Chemistry', topic: 'Inorganic Chemistry' },
    { id: 'hsst_chem_m5', title: 'Inorganic Chemistry 3: Nuclear Reactions & Models', questions: 20, duration: 20, subject: 'Chemistry', topic: 'Inorganic Chemistry' },
    { id: 'hsst_chem_m6', title: 'Inorganic Chemistry 3: Advanced Materials (Solid Electrolytes, Pigments)', questions: 20, duration: 20, subject: 'Chemistry', topic: 'Inorganic Chemistry' },
    { id: 'hsst_chem_m7', title: 'Organic Chemistry 1: Stereochemistry & Chirality', questions: 20, duration: 20, subject: 'Chemistry', topic: 'Organic Chemistry' },
    { id: 'hsst_chem_m8', title: 'Organic Chemistry 1: Reaction Mechanisms (Addition, Substitution)', questions: 20, duration: 20, subject: 'Chemistry', topic: 'Organic Chemistry' },
    { id: 'hsst_chem_m9', title: 'Organic Chemistry 2: Elimination & Rearrangements (Hoffmann, Beckmann etc.)', questions: 20, duration: 20, subject: 'Chemistry', topic: 'Organic Chemistry' },
    { id: 'hsst_chem_m10', title: 'Organic Chemistry 3: Spectroscopy & Photochemistry', questions: 20, duration: 20, subject: 'Chemistry', topic: 'Organic Chemistry' },
    { id: 'hsst_chem_m11', title: 'Physical Chemistry 1: Thermodynamics & Phase Equilibria', questions: 20, duration: 20, subject: 'Chemistry', topic: 'Physical Chemistry' },
    { id: 'hsst_chem_m12', title: 'Physical Chemistry 1: Kinetics & Catalysis', questions: 20, duration: 20, subject: 'Chemistry', topic: 'Physical Chemistry' }
  ],
  studyNotes: [],
  previousPapers: []
};

export const PHARMACIST_SIDDHA_CONTENT: ExamPageContent = {
  practiceTests: [
    { id: 'pharm_sid_m1', title: 'Fundamentals of Siddha: Three Humoral Theory (Vali, Azhal, Iyam)', questions: 20, duration: 20, subject: 'Siddha', topic: 'Fundamentals' },
    { id: 'pharm_sid_m2', title: 'Fundamentals of Siddha: Seven Physical Constituents (Udal Kattugal)', questions: 20, duration: 20, subject: 'Siddha', topic: 'Fundamentals' },
    { id: 'pharm_sid_m3', title: 'Anatomy & Physiology: Nervous System & Siddha Concepts (Dasavayu, Dasanadi)', questions: 20, duration: 20, subject: 'Siddha', topic: 'Anatomy & Physiology' },
    { id: 'pharm_sid_m4', title: 'Basic Pharmacology: Thogai Charakkugal & Dispensing', questions: 20, duration: 20, subject: 'Siddha', topic: 'Pharmacology' },
    { id: 'pharm_sid_m5', title: 'Pharmacy & Pharmacognosy: Crude Drugs (Laxatives, Cardiotonics)', questions: 20, duration: 20, subject: 'Siddha', topic: 'Pharmacy' },
    { id: 'pharm_sid_m6', title: 'Siddha Pharmacology 1: Properties & Classifications of Drugs', questions: 20, duration: 20, subject: 'Siddha', topic: 'Pharmacology' },
    { id: 'pharm_sid_m7', title: 'Siddha Pharmacology 2: Internal & External Medicines Relation to Panchabotham', questions: 20, duration: 20, subject: 'Siddha', topic: 'Pharmacology' },
    { id: 'pharm_sid_m8', title: 'Siddha Pharmaceuticals: Formulations & Quality Control', questions: 20, duration: 20, subject: 'Siddha', topic: 'Pharmaceuticals' },
    { id: 'pharm_sid_m9', title: 'Siddha Toxicology 1: Toxic Substances & Antidotes', questions: 20, duration: 20, subject: 'Siddha', topic: 'Toxicology' },
    { id: 'pharm_sid_m10', title: 'Siddha Toxicology 2: Poison Management & Safety', questions: 20, duration: 20, subject: 'Siddha', topic: 'Toxicology' }
  ],
  studyNotes: [],
  previousPapers: []
};

export const PHARMACIST_HOMOEOPATHY_CONTENT: ExamPageContent = {
  practiceTests: [
    { id: 'pharm_hom_m1', title: 'Homoeopathic Pharmacy Basics: Philosophy, History & Pioneers', questions: 20, duration: 20, subject: 'Homoeopathy', topic: 'Pharmacy Basics' },
    { id: 'pharm_hom_m2', title: 'Homoeopathic Pharmacopoeia: HPUS/HPI Monographs & Sources', questions: 20, duration: 20, subject: 'Homoeopathy', topic: 'Pharmacopoeia' },
    { id: 'pharm_hom_m3', title: 'Pharmacognosy: Drug Substances (Botany, Zoology Identification)', questions: 20, duration: 20, subject: 'Homoeopathy', topic: 'Pharmacognosy' },
    { id: 'pharm_hom_m4', title: 'Drug Proving: Prover Selection & Pathogenetic Properties', questions: 20, duration: 20, subject: 'Homoeopathy', topic: 'Drug Proving' },
    { id: 'pharm_hom_m5', title: 'Posology & Administration: Routes, Potentization, Dosing', questions: 20, duration: 20, subject: 'Homoeopathy', topic: 'Posology' },
    { id: 'pharm_hom_m6', title: 'Anatomy: Skeletal, Muscular, Respiratory Systems', questions: 20, duration: 20, subject: 'Homoeopathy', topic: 'Anatomy' },
    { id: 'pharm_hom_m7', title: 'Physiology: Blood Composition & Functions', questions: 20, duration: 20, subject: 'Homoeopathy', topic: 'Physiology' },
    { id: 'pharm_hom_m8', title: 'First Aid & Hygiene: Vital Signs, ABC of Life Support', questions: 20, duration: 20, subject: 'Homoeopathy', topic: 'First Aid' },
    { id: 'pharm_hom_m9', title: 'Community Health: Personal & Hospital Hygiene', questions: 20, duration: 20, subject: 'Homoeopathy', topic: 'Community Health' },
    { id: 'pharm_hom_m10', title: 'Materia Medica Basics: Common Remedies & Indications', questions: 20, duration: 20, subject: 'Homoeopathy', topic: 'Materia Medica' }
  ],
  studyNotes: [],
  previousPapers: []
};

export const EXAM_CONTENT_MAP: Record<string, ExamPageContent> = {
    'hsst_physics': HSST_PHYSICS_CONTENT,
    'hsst_chemistry': HSST_CHEMISTRY_CONTENT,
    'pharmacist_siddha': PHARMACIST_SIDDHA_CONTENT,
    'pharmacist_homoeopathy': PHARMACIST_HOMOEOPATHY_CONTENT,
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
    { id: 'fc1', front: 'കേരളത്തിലെ ഏറ്റവും നീളം കൂടിയ നദി ഏതാണ്?', back: 'പെരിയാർ (244 കി.മീ)', topic: 'Geography', explanation: 'ഇടുക്കി ജില്ലയിലെ ശിവഗിരി മലകളിൽ നിന്നാണ് പെരിയാർ ഉത്ഭവിക്കുന്നത്. ഇത് കേരളത്തിലെ ഏറ്റവും വലിയ നദിയുമാണ്.' },
    { id: 'fc2', front: 'കേരള നവോത്ഥാനത്തിന്റെ പിതാവ് എന്നറിയപ്പെടുന്നത് ആരാണ്?', back: 'ശ്രീനാരായണ ഗുരു', topic: 'History', explanation: 'കേരളത്തിലെ സാമൂഹിക അസമത്വങ്ങൾക്കെതിരെ പോരാടിയ പ്രധാന നവോത്ഥാന നായകനാണ് ശ്രീനാരായണ ഗുരു. 1888-ലെ അരുവിപ്പുറം പ്രതിഷ്ഠ അദ്ദേഹത്തിന്റെ പ്രധാന സംഭാവനകളിലൊന്നാണ്.' },
    { id: 'fc3', front: 'ഇന്ത്യൻ ഭരണഘടനയുടെ ശില്പി ആരാണ്?', back: 'ഡോ. ബി. ആർ. അംബേദ്കർ', topic: 'Constitution', explanation: 'ഇന്ത്യൻ ഭരണഘടനാ ഡ്രാഫ്റ്റിംഗ് കമ്മിറ്റിയുടെ ചെയർമാനായിരുന്നു ഡോ. ബി. ആർ. അംബേദ്കർ. സ്വതന്ത്ര ഇന്ത്യയുടെ ആദ്യത്തെ നിയമമന്ത്രി കൂടിയായിരുന്നു അദ്ദേഹം.' },
    { id: 'fc4', front: 'കേരളത്തിൽ അവസാനം രൂപീകൃതമായ ജില്ല ഏതാണ്?', back: 'കാസർഗോഡ് (1984)', topic: 'General', explanation: '1984 മെയ് 24-നാണ് കാസർഗോഡ് ജില്ല രൂപീകൃതമായത്. കണ്ണൂർ ജില്ല വിഭജിച്ചാണ് ഇത് രൂപീകരിച്ചത്.' },
    { id: 'fc5', front: 'അറബിക്കടലിന്റെ റാണി എന്നറിയപ്പെടുന്ന നഗരം ഏതാണ്?', back: 'കൊച്ചി', topic: 'Geography', explanation: 'പുരാതന കാലം മുതൽ ഒരു പ്രധാന സുഗന്ധവ്യഞ്ജന വ്യാപാര കേന്ദ്രമായിരുന്നതിനാലാണ് കൊച്ചിയെ അറബിക്കടലിന്റെ റാണി എന്ന് വിളിക്കുന്നത്.' }
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
