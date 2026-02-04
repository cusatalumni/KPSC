
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
        const data = await res.json();
        if (Array.isArray(data) && data.length === 0) return mockData;
        return data;
    } catch (e) {
        console.warn(`Data fetch for ${params} failed, using local mock data.`, e);
        return mockData;
    }
};

const adminReq = async (body: any, token: string | null = null) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/admin', { method: 'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Administrative request failed');
    }
    return await res.json();
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
    if (data.length === 0) return EXAM_CONTENT_MAP[examId]?.practiceTests || [];
    return data;
};

export const saveTestResult = (resultData: any) => adminReq({ action: 'save-result', resultData });
export const triggerDailyScraper = (token: string | null) => adminReq({ action: 'run-daily-scraper' }, token);
export const triggerBookScraper = (token: string | null) => adminReq({ action: 'run-book-scraper' }, token);
export const deleteBook = (id: string, token: string | null) => adminReq({ action: 'delete-row', sheet: 'Bookstore', id }, token);
export const updateBook = (book: any, token: string | null) => adminReq({ action: 'update-book', book }, token);
export const addQuestion = (question: any, token: string | null) => adminReq({ action: 'add-question', question }, token);
export const getNotifications = () => fetchHub('type=notifications', MOCK_NOTIFICATIONS);
export const getLiveUpdates = () => fetchHub('type=updates', MOCK_PSC_UPDATES);
export const getCurrentAffairs = () => fetchHub('type=affairs', MOCK_CURRENT_AFFAIRS);
export const getGk = () => fetchHub('type=gk', MOCK_GK);
export const getBooks = () => fetchHub('type=books', MOCK_BOOKS_DATA);
export const getQuestionsForTest = (topic: string, count: number) => fetchHub(`type=questions&topic=${encodeURIComponent(topic)}&count=${count}`, MOCK_QUESTION_BANK.slice(0, count));
export const updateExam = (exam: any, token: string | null) => adminReq({ action: 'update-exam', exam }, token);
export const updateSyllabus = (syllabus: any, token: string | null) => adminReq({ action: 'update-syllabus', syllabus }, token);
export const deleteExam = (id: string, token: string | null) => adminReq({ action: 'delete-row', sheet: 'Exams', id }, token);
export const syncCsvData = (sheet: string, data: string, t: string | null, isAppend: boolean = false) => adminReq({ action: 'csv-update', sheet, data, mode: isAppend ? 'append' : 'replace' }, t);
export const fixAllAffiliates = (token: string | null) => adminReq({ action: 'fix-affiliates' }, token);
export const testConnection = (token: string | null) => adminReq({ action: 'test-connection' }, token);

export const getStudyMaterial = async (topic: string): Promise<{ notes: string }> => {
    try {
        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: `Generate detailed study notes in Malayalam for the Kerala PSC exam topic: "${topic}". Use markdown formatting.`,
                model: 'gemini-3-flash-preview',
            }),
        });
        if (!response.ok) throw new Error('AI generation failed');
        const data = await response.json();
        return { notes: data.text || 'വിവരങ്ങൾ ലഭ്യമല്ല.' };
    } catch (error) {
        return { notes: "പഠന സാമഗ്രികൾ തയ്യാറാക്കുന്നതിൽ സാങ്കേതിക തകരാർ സംഭവിച്ചു." };
    }
};

export const getDetectedExams = async (): Promise<Exam[]> => [];
export const exportStaticExamsToSheet = (token: string | null, examsPayload: any[], syllabusPayload: any[]) => 
    adminReq({ action: 'export-static', examsPayload, syllabusPayload }, token);
