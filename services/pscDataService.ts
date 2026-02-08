
import type { Notification, PscUpdateItem, CurrentAffairsItem, GkItem, QuizQuestion, Book, Exam, ExamPageContent, PracticeTest } from '../types';
import { MOCK_NOTIFICATIONS, MOCK_PSC_UPDATES, MOCK_CURRENT_AFFAIRS, MOCK_GK, MOCK_QUESTION_BANK, MOCK_BOOKS_DATA, EXAMS_DATA, EXAM_CONTENT_MAP } from '../constants';
import React from 'react';
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
        if (!res.ok) {
            console.warn(`API responded with ${res.status} for ${params}`);
            return mockData;
        }
        const data = await res.json();
        return (data && (!Array.isArray(data) || data.length > 0)) ? data : mockData;
    } catch (e) {
        console.error("Fetch Hub Error:", e);
        return mockData;
    }
};

const adminReq = async (body: any, token: string | null = null) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/admin', { method: 'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Request Failed' }));
        throw new Error(err.message || `Error ${res.status}`);
    }
    return await res.json();
};

export const getExams = async (): Promise<Exam[]> => {
    const raw = await fetchHub('type=exams', []);
    if (!raw || raw.length === 0) return EXAMS_DATA;
    return raw.map((e: any) => ({
        id: e.id,
        title: { ml: e.title_ml, en: e.title_en || e.title_ml },
        description: { ml: e.description_ml, en: e.description_en || e.description_ml },
        category: e.category,
        level: e.level,
        icon: getIcon(e.icon_type)
    }));
};

export const getExamSyllabus = async (examId: string): Promise<PracticeTest[]> => {
    const data = await fetchHub(`type=syllabus&examId=${examId}`, []);
    return (data && data.length > 0) ? data : (EXAM_CONTENT_MAP[examId]?.practiceTests || []);
};

export const getSettings = () => fetchHub('type=settings', { subscription_model_active: 'true' });
export const updateSetting = (key: string, value: string, token: string | null) => adminReq({ action: 'update-setting', setting: { key, value } }, token);
export const clearStudyCache = (token: string | null) => adminReq({ action: 'clear-study-cache' }, token);

export const saveTestResult = (resultData: any) => adminReq({ action: 'save-result', resultData });
export const triggerDailyScraper = (token: string | null) => adminReq({ action: 'run-daily-scraper' }, token);
export const triggerBookScraper = (token: string | null) => adminReq({ action: 'run-book-scraper' }, token);
export const applyAffiliateTags = (token: string | null) => adminReq({ action: 'apply-affiliate-tags' }, token);
export const deleteBook = (id: string, token: string | null) => adminReq({ action: 'delete-row', sheet: 'Bookstore', id }, token);
export const updateBook = (book: any, token: string | null) => adminReq({ action: 'update-book', book }, token);
export const addQuestion = (question: any, token: string | null) => adminReq({ action: 'add-question', question }, token);
export const getNotifications = () => fetchHub('type=notifications', MOCK_NOTIFICATIONS);
export const getLiveUpdates = () => fetchHub('type=updates', MOCK_PSC_UPDATES);
export const getCurrentAffairs = () => fetchHub('type=affairs', MOCK_CURRENT_AFFAIRS);
export const getGk = () => fetchHub('type=gk', MOCK_GK);
export const getBooks = () => fetchHub('type=books', MOCK_BOOKS_DATA);

export const getQuestionsForTest = async (subject: string, topic: string, count: number): Promise<QuizQuestion[]> => {
    try {
        const res = await fetch(`/api/data?type=questions&subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}&count=${count}`);
        if (!res.ok) return MOCK_QUESTION_BANK.slice(0, count);
        const data = await res.json();
        if (!data || data.length === 0) {
            console.warn("No questions returned from Sheet. Check if QuestionBank tab has data.");
            return MOCK_QUESTION_BANK.slice(0, count);
        }
        return data;
    } catch (e) {
        return MOCK_QUESTION_BANK.slice(0, count);
    }
};

export const updateExam = (exam: any, token: string | null) => adminReq({ action: 'update-exam', exam }, token);
export const updateSyllabus = (syllabus: any, token: string | null) => adminReq({ action: 'update-syllabus', syllabus }, token);
export const deleteExam = (id: string, token: string | null) => adminReq({ action: 'delete-row', sheet: 'Exams', id }, token);
export const syncCsvData = (sheet: string, data: string, t: string | null, isAppend: boolean = false) => adminReq({ action: 'csv-update', sheet, data, mode: isAppend ? 'append' : 'replace' }, t);
export const testConnection = (token: string | null) => adminReq({ action: 'test-connection' }, token);
export const exportStaticExamsToSheet = (token: string | null, examsPayload: any[], syllabusPayload: any[]) => adminReq({ action: 'export-static', examsPayload, syllabusPayload }, token);

export const getStudyMaterial = async (topic: string): Promise<{ notes: string }> => {
    try {
        const response = await fetch('/api/study-material', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return { notes: data.notes || 'വിവരങ്ങൾ ലഭ്യമല്ല.' };
    } catch (error: any) {
        console.error("Service Error fetching study material:", error.message);
        return { notes: "ക്ഷമിക്കണം, ഈ വിഷയം ഇപ്പോൾ ലഭ്യമാക്കാൻ സാധിക്കുന്നില്ല." };
    }
};

export const getDetectedExams = async (): Promise<Exam[]> => [];
