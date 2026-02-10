
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

// Session cache to prevent redundant API calls and loading loops
let examsCache: Exam[] | null = null;

const getIcon = (type: string) => {
    const icons: Record<string, any> = {
        'book': BookOpenIcon, 'shield': ShieldCheckIcon, 'cap': AcademicCapIcon,
        'beaker': BeakerIcon, 'light': LightBulbIcon, 'star': StarIcon, 'globe': GlobeAltIcon
    };
    const IconComp = icons[type?.toLowerCase()] || BookOpenIcon;
    return React.createElement(IconComp, { className: "h-8 w-8 text-indigo-500" });
};

const fetchHub = async <T>(params: string, mockData: T): Promise<T> => {
    try {
        const res = await fetch(`/api/data?${params}`);
        if (!res.ok) return mockData;
        const data = await res.json();
        return (data && (!Array.isArray(data) || data.length > 0)) ? data : mockData;
    } catch (e) { return mockData; }
};

export const getExams = async (): Promise<{ exams: Exam[], source: 'database' | 'static' }> => {
    if (examsCache) return { exams: examsCache, source: 'database' };
    try {
        const res = await fetch('/api/data?type=exams');
        if (res.ok) {
            const raw = await res.json();
            if (Array.isArray(raw) && raw.length > 0) {
                examsCache = raw.map((e: any) => ({
                    id: String(e.id),
                    title: { ml: e.title_ml, en: e.title_en || e.title_ml },
                    description: { ml: e.description_ml, en: e.description_en || e.description_ml },
                    category: e.category || 'General',
                    level: e.level || 'Preliminary',
                    icon: getIcon(e.icon_type)
                }));
                return { exams: examsCache!, source: 'database' };
            }
        }
    } catch (e) {}
    return { exams: EXAMS_DATA, source: 'static' };
};

export const getExamById = async (id: string): Promise<Exam | null> => {
    const { exams } = await getExams();
    return exams.find(e => String(e.id) === String(id)) || null;
};

export const getExamSyllabus = async (examId: string): Promise<PracticeTest[]> => {
    const data = await fetchHub(`type=syllabus&examId=${examId}`, []);
    return (data && data.length > 0) ? data : (EXAM_CONTENT_MAP[examId]?.practiceTests || []);
};

export const getSettings = async () => fetchHub('type=settings', { subscription_model_active: 'true' });
export const updateSetting = async (key: string, value: string, token: string | null) => {
    const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'update-setting', setting: { key, value } })
    });
    return res.json();
};

export const clearStudyCache = (token: string | null) => fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ action: 'clear-study-cache' })
});

export const saveTestResult = (resultData: any) => fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save-result', resultData })
});

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
        return (data && data.length > 0) ? data : MOCK_QUESTION_BANK.slice(0, count);
    } catch (e) { return MOCK_QUESTION_BANK.slice(0, count); }
};

export const testConnection = async (token: string | null) => {
    const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'test-connection' })
    });
    return res.json();
};

export const getStudyMaterial = async (topic: string): Promise<{ notes: string }> => {
    const res = await fetch('/api/study-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
    });
    return res.json();
};

export const getDetectedExams = async (): Promise<Exam[]> => [];
