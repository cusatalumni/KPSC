
import type { Notification, PscUpdateItem, CurrentAffairsItem, GkItem, QuizQuestion, Book } from '../types';
import { MOCK_NOTIFICATIONS, MOCK_PSC_UPDATES, MOCK_CURRENT_AFFAIRS, MOCK_GK, MOCK_QUESTION_BANK, MOCK_BOOKS_DATA } from '../constants';

const isVercel = import.meta.env.PROD;
const API_KEY_AVAILABLE = !!import.meta.env.VITE_API_KEY;

const fetchWithMockFallback = async <T>(apiPath: string, mockData: T): Promise<T> => {
    if (!isVercel) {
        return new Promise(resolve => setTimeout(() => resolve(mockData), 300));
    }
    try {
        const response = await fetch(apiPath);
        if (!response.ok) throw new Error(`Failed to fetch ${apiPath}`);
        return await response.json() as T;
    } catch (error) {
        console.error(`Error fetching ${apiPath}, using mock.`, error);
        return mockData;
    }
};

export const getNotifications = () => fetchWithMockFallback('/api/data?type=notifications', MOCK_NOTIFICATIONS);
export const getLiveUpdates = () => fetchWithMockFallback('/api/data?type=updates', MOCK_PSC_UPDATES);
export const getCurrentAffairs = () => fetchWithMockFallback('/api/data?type=affairs', MOCK_CURRENT_AFFAIRS);
export const getGk = () => fetchWithMockFallback('/api/data?type=gk', MOCK_GK);
export const getBooks = () => fetchWithMockFallback('/api/data?type=books', MOCK_BOOKS_DATA);

export const getQuestionsForTest = (topic: string, count: number): Promise<QuizQuestion[]> => {
    return fetchWithMockFallback(`/api/get-questions?topic=${encodeURIComponent(topic)}&count=${count}`, MOCK_QUESTION_BANK.slice(0, count));
};

export const getStudyMaterial = async (topic: string): Promise<{ notes: string }> => {
    const res = await fetch(`/api/get-study-material?topic=${encodeURIComponent(topic)}`);
    return await res.json();
};

export const generateBookCover = async (title: string, author: string) => {
    const res = await fetch(`/api/generate-cover?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`);
    return await res.json();
};

// --- Admin ---

const adminAction = async (payload: any, token: string | null) => {
    if (!token) throw new Error("Auth token missing.");
    const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).message || "Action failed");
    return res.json();
};

export const triggerDailyScraper = (token: string | null) => adminAction({ action: 'run-daily' }, token);
export const triggerBookScraper = (token: string | null) => adminAction({ action: 'run-books' }, token);
export const syncCsvData = (sheet: string, data: string, token: string | null) => adminAction({ action: 'csv-update', sheet, data }, token);
