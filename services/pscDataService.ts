import type { Notification, PscUpdateItem, CurrentAffairsItem, GkItem, QuizQuestion, Book, Exam, ExamPageContent, PracticeTest, FeedbackData } from '../types';
import { MOCK_NOTIFICATIONS, MOCK_PSC_UPDATES, MOCK_CURRENT_AFFAIRS, MOCK_GK, MOCK_QUESTION_BANK, MOCK_BOOKS_DATA, EXAMS_DATA, EXAM_CONTENT_MAP } from '../constants';
import React from 'react';
import { BookOpenIcon } from '../components/icons/BookOpenIcon';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { AcademicCapIcon } from '../components/icons/AcademicCapIcon';
import { BeakerIcon } from '../components/icons/BeakerIcon';
import { LightBulbIcon } from '../components/icons/LightBulbIcon';
import { StarIcon } from '../components/icons/StarIcon';
import { GlobeAltIcon } from '../components/icons/GlobeAltIcon';

// Session cache and promise handling to prevent redundant/hanging API calls
let examsCache: Exam[] | null = null;
let examsSource: 'database' | 'static' = 'static';
let pendingExamsPromise: Promise<{ exams: Exam[], source: 'database' | 'static' }> | null = null;

const getIcon = (type: string) => {
    const icons: Record<string, any> = {
        'book': BookOpenIcon, 'shield': ShieldCheckIcon, 'cap': AcademicCapIcon,
        'beaker': BeakerIcon, 'light': LightBulbIcon, 'star': StarIcon, 'globe': GlobeAltIcon
    };
    const IconComp = icons[type?.toLowerCase()] || BookOpenIcon;
    return React.createElement(IconComp, { className: "h-8 w-8 text-indigo-500" });
};

const fetchWithTimeout = async (url: string, timeout = 5000) => {
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

const fetchHub = async <T>(params: string, mockData: T): Promise<T> => {
    try {
        const res = await fetchWithTimeout(`/api/data?${params}`, 8000);
        if (!res.ok) return mockData;
        const data = await res.json();
        return (data && (!Array.isArray(data) || data.length > 0)) ? data : mockData;
    } catch (e) { 
        console.warn(`FetchHub failed for ${params}, using mock fallback.`);
        return mockData; 
    }
};

export const getExams = async (): Promise<{ exams: Exam[], source: 'database' | 'static' }> => {
    // 1. Return from cache if available
    if (examsCache) return { exams: examsCache, source: examsSource };
    
    // 2. Return the existing promise if a fetch is already in progress
    if (pendingExamsPromise) return pendingExamsPromise;

    // 3. Create a new promise and store it globally to handle concurrent requests
    pendingExamsPromise = (async () => {
        try {
            const res = await fetchWithTimeout('/api/data?type=exams', 5000);
            if (res.ok) {
                const raw = await res.json();
                if (Array.isArray(raw) && raw.length > 0) {
                    examsCache = raw.map((e: any) => ({
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
                    examsSource = 'database';
                    return { exams: examsCache!, source: 'database' };
                }
            }
        } catch (e) {
            console.error("API Error fetching exams, falling back to static:", e);
        }
        
        // Final fallback if API fails or returns no data
        examsCache = EXAMS_DATA;
        examsSource = 'static';
        return { exams: EXAMS_DATA, source: 'static' };
    })();

    const result = await pendingExamsPromise;
    pendingExamsPromise = null; // Clean up after completion
    return result;
};

export const getExamById = async (id: string): Promise<Exam | null> => {
    const { exams } = await getExams();
    const cleanId = String(id).trim().toLowerCase();
    return exams.find(e => String(e.id).trim().toLowerCase() === cleanId) || null;
};

export const submitFeedback = (feedbackData: FeedbackData) => fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'submit-feedback', feedback: feedbackData })
});

export const getExamSyllabus = async (examId: string): Promise<PracticeTest[]> => {
    const fallback = (EXAM_CONTENT_MAP[examId]?.practiceTests || []);
    try {
        const data = await fetchHub(`type=syllabus&examId=${examId}`, fallback);
        return Array.isArray(data) ? data : fallback;
    } catch (e) {
        return fallback;
    }
};

export const getSettings = async () => fetchHub('type=settings', { subscription_model_active: 'true', paypal_client_id: 'sb' });

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
    const fallback = MOCK_QUESTION_BANK.slice(0, count);
    try {
        const res = await fetchWithTimeout(`/api/data?type=questions&subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}&count=${count}`, 10000);
        if (!res.ok) return fallback;
        const data = await res.json();
        return (Array.isArray(data) && data.length > 0) ? data : fallback;
    } catch (e) { 
        console.warn("Question fetch failed/timed out, using fallback.");
        return fallback; 
    }
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