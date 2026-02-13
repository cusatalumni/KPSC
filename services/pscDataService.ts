import type { Exam, PracticeTest, FeedbackData, QuizQuestion } from '../types';
import { EXAMS_DATA, EXAM_CONTENT_MAP, MOCK_NOTIFICATIONS, MOCK_PSC_UPDATES, MOCK_CURRENT_AFFAIRS, MOCK_GK, MOCK_BOOKS_DATA, MOCK_QUESTION_BANK } from '../constants';
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
        'book': BookOpenIcon, 'shield': ShieldCheckIcon, 'cap': AcademicCapIcon,
        'beaker': BeakerIcon, 'light': LightBulbIcon, 'star': StarIcon, 'globe': GlobeAltIcon
    };
    const IconComp = icons[String(type || 'book').toLowerCase()] || BookOpenIcon;
    return React.createElement(IconComp, { className: "h-8 w-8 text-indigo-500" });
};

const fetchWithTimeout = async (url: string, timeout = 4000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (e) {
        clearTimeout(id);
        throw e;
    }
};

/**
 * Fetches all exams with a strict timeout and fallback to hardcoded data.
 */
export const getExams = async (): Promise<{ exams: Exam[], source: 'database' | 'static' }> => {
    try {
        const res = await fetchWithTimeout('/api/data?type=exams');
        if (res.ok) {
            const raw = await res.json();
            if (Array.isArray(raw) && raw.length > 0) {
                const formatted: Exam[] = raw.map((e: any) => ({
                    id: String(e.id),
                    title: { 
                        ml: e.title_ml || e.titleMl, 
                        en: e.title_en || e.titleEn || e.title_ml || e.titleMl 
                    },
                    description: { 
                        ml: e.description_ml || e.descriptionMl, 
                        en: e.description_en || e.descriptionEn || e.description_ml || e.descriptionMl 
                    },
                    category: e.category || 'General',
                    level: e.level || 'Preliminary',
                    icon: getIcon(e.icon_type || e.iconType)
                }));
                return { exams: formatted, source: 'database' };
            }
        }
    } catch (e) {
        console.warn("Database fetch failed or timed out, using fallback data.");
    }
    
    return { exams: EXAMS_DATA, source: 'static' };
};

export const getExamSyllabus = async (examId: string): Promise<PracticeTest[]> => {
    const fallback = EXAM_CONTENT_MAP[examId]?.practiceTests || [];
    try {
        const res = await fetchWithTimeout(`/api/data?type=syllabus&examId=${examId}`);
        if (res.ok) {
            const data = await res.json();
            return Array.isArray(data) && data.length > 0 ? data : fallback;
        }
    } catch (e) {}
    return fallback;
};

export const getSettings = async () => {
    try {
        const res = await fetchWithTimeout('/api/data?type=settings');
        if (res.ok) return await res.json();
    } catch (e) {}
    return { subscription_model_active: 'true', paypal_client_id: 'sb' };
};

export const updateSetting = async (key: string, value: string, token: string | null) => {
    const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'update-setting', setting: { key, value } })
    });
    return res.json();
};

export const getQuestionsForTest = async (subject: string, topic: string, count: number): Promise<QuizQuestion[]> => {
    const fallback = MOCK_QUESTION_BANK.slice(0, count);
    try {
        const res = await fetchWithTimeout(`/api/data?type=questions&subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}&count=${count}`, 8000);
        if (res.ok) {
            const data = await res.json();
            return (Array.isArray(data) && data.length > 0) ? data : fallback;
        }
    } catch (e) {}
    return fallback;
};

// Generic fetch helpers
const fetchHub = async <T>(params: string, mockData: T): Promise<T> => {
    try {
        const res = await fetchWithTimeout(`/api/data?${params}`);
        if (!res.ok) return mockData;
        const data = await res.json();
        return (data && (!Array.isArray(data) || data.length > 0)) ? data : mockData;
    } catch (e) { return mockData; }
};

export const getNotifications = () => fetchHub('type=notifications', MOCK_NOTIFICATIONS);
export const getLiveUpdates = () => fetchHub('type=updates', MOCK_PSC_UPDATES);
export const getCurrentAffairs = () => fetchHub('type=affairs', MOCK_CURRENT_AFFAIRS);
export const getGk = () => fetchHub('type=gk', MOCK_GK);
export const getBooks = () => fetchHub('type=books', MOCK_BOOKS_DATA);

export const submitFeedback = (feedbackData: FeedbackData) => fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'submit-feedback', feedback: feedbackData })
});

export const saveTestResult = (resultData: any) => fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save-result', resultData })
});

export const testConnection = async (token: string | null) => {
    const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'test-connection' })
    });
    return res.json();
};

export const clearStudyCache = (token: string | null) => fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ action: 'clear-study-cache' })
});

export const getStudyMaterial = async (topic: string): Promise<{ notes: string }> => {
    const res = await fetch('/api/study-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
    });
    return res.json();
};

export const getDetectedExams = async (): Promise<Exam[]> => [];
