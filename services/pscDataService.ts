
import type { Notification, PscUpdateItem, CurrentAffairsItem, GkItem, QuizQuestion, Book, Exam, ExamPageContent, PracticeTest } from '../types';
import { MOCK_NOTIFICATIONS, MOCK_PSC_UPDATES, MOCK_CURRENT_AFFAIRS, MOCK_GK, MOCK_QUESTION_BANK, MOCK_BOOKS_DATA, EXAMS_DATA, EXAM_CONTENT_MAP } from '../constants';
import React from 'react';
import { BellIcon } from '../components/icons/BellIcon';
import { BookOpenIcon } from '../components/icons/BookOpenIcon';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { AcademicCapIcon } from '../components/icons/AcademicCapIcon';
import { BeakerIcon } from '../components/icons/BeakerIcon';
import { LightBulbIcon } from '../components/icons/LightBulbIcon';
import { StarIcon } from '../components/icons/StarIcon';
import { GlobeAltIcon } from '../components/icons/GlobeAltIcon';

const getIcon = (type: string) => {
    const icons: Record<string, any> = {
        'book': BookOpenIcon,
        'shield': ShieldCheckIcon,
        'cap': AcademicCapIcon,
        'beaker': BeakerIcon,
        'light': LightBulbIcon,
        'star': StarIcon,
        'globe': GlobeAltIcon
    };
    const IconComp = icons[type] || BookOpenIcon;
    return React.createElement(IconComp, { className: "h-8 w-8 text-indigo-500" });
};

const fetchHub = async <T>(params: string, mockData: T): Promise<T> => {
    try {
        const res = await fetch(`/api/data?${params}`);
        if (!res.ok) throw new Error("API Fetch failed");
        return await res.json();
    } catch (e) {
        console.warn(`Data fetch for ${params} failed, using local mock data.`, e);
        return mockData;
    }
};

export const getExams = async (): Promise<Exam[]> => {
    const raw = await fetchHub('type=exams', []);
    if (raw.length === 0) return EXAMS_DATA;
    return raw.map((e: any) => ({
        id: e.id,
        title: { ml: e.title_ml, en: e.title_en },
        description: { ml: e.description_ml, en: e.description_en },
        category: e.category,
        level: e.level,
        icon: getIcon(e.icon_type)
    }));
};

export const getExamSyllabus = async (examId: string): Promise<PracticeTest[]> => {
    const data = await fetchHub(`type=syllabus&examId=${examId}`, []);
    // Fallback to local map if sheet is empty
    if (data.length === 0) return EXAM_CONTENT_MAP[examId]?.practiceTests || [];
    return data;
};

const adminReq = async (body: any, token: string | null) => {
    if (!token) throw new Error("Authentication token missing.");
    const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Administrative request failed');
    }
    return await res.json();
};

// Administrative functions used by the Admin Panel
// Fix: Added missing exports required by AdminPage.tsx

export const triggerDailyScraper = (token: string | null) => adminReq({ action: 'run-daily-scraper' }, token);
export const triggerBookScraper = (token: string | null) => adminReq({ action: 'run-book-scraper' }, token);
export const fixAllAffiliates = (token: string | null) => adminReq({ action: 'fix-affiliates' }, token);
export const deleteBook = (id: string, token: string | null) => adminReq({ action: 'delete-row', sheet: 'Bookstore', id }, token);
export const updateBook = (book: any, token: string | null) => adminReq({ action: 'update-book', book }, token);
export const addQuestion = (question: any, token: string | null) => adminReq({ action: 'add-question', question }, token);

// New function to export everything to sheet
export const exportStaticExamsToSheet = async (token: string | null) => {
    const payload = {
        exams: EXAMS_DATA.map(e => ({
            id: e.id,
            title_ml: e.title.ml,
            title_en: e.title.en,
            description_ml: e.description.ml,
            description_en: e.description.en,
            category: e.category,
            level: e.level,
            icon_type: 'book' // default
        })),
        syllabus: Object.entries(EXAM_CONTENT_MAP).flatMap(([examId, content]) => 
            content.practiceTests.map(p => ({
                id: p.id,
                exam_id: examId,
                title: p.title,
                questions: p.questions,
                duration: p.duration,
                topic: p.topic
            }))
        )
    };
    return adminReq({ action: 'export-static-data', data: payload }, token);
};

export const getNotifications = () => fetchHub('type=notifications', MOCK_NOTIFICATIONS);
export const getDetectedExams = async (): Promise<Exam[]> => {
    const notifications = await getNotifications();
    return notifications.map(n => ({
        id: `dynamic_${n.id}`,
        title: { ml: n.title, en: n.title },
        description: { ml: `Category: ${n.categoryNumber}`, en: `Category: ${n.categoryNumber}` },
        icon: React.createElement(BellIcon, { className: "h-8 w-8 text-rose-500" }),
        category: 'Special',
        level: 'Preliminary'
    }));
};

export const getLiveUpdates = () => fetchHub('type=updates', MOCK_PSC_UPDATES);
export const getCurrentAffairs = () => fetchHub('type=affairs', MOCK_CURRENT_AFFAIRS);
export const getGk = () => fetchHub('type=gk', MOCK_GK);
export const getBooks = () => fetchHub('type=books', MOCK_BOOKS_DATA);
export const getQuestionsForTest = (topic: string, count: number) => fetchHub(`type=questions&topic=${encodeURIComponent(topic)}&count=${count}`, MOCK_QUESTION_BANK.slice(0, count));
export const getQuestionsForSubject = (subject: string, count: number) => fetchHub(`type=questions&subject=${encodeURIComponent(subject)}&count=${count}`, MOCK_QUESTION_BANK.slice(0, count));
export const getStudyMaterial = (topic: string) => fetchHub(`type=study-material&topic=${encodeURIComponent(topic)}`, { notes: "# Studying " + topic });

export const updateExam = (exam: any, token: string | null) => adminReq({ action: 'update-exam', exam }, token);
export const updateSyllabus = (syllabus: any, token: string | null) => adminReq({ action: 'update-syllabus', syllabus }, token);
export const deleteExam = (id: string, token: string | null) => adminReq({ action: 'delete-row', sheet: 'Exams', id }, token);
export const syncCsvData = (sheet: string, data: string, t: string | null, isAppend: boolean = false) => adminReq({ action: 'csv-update', sheet, data, mode: isAppend ? 'append' : 'replace' }, t);
