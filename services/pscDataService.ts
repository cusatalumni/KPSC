
import type { Notification, PscUpdateItem, CurrentAffairsItem, GkItem, QuizQuestion, Book } from '../types';
import { MOCK_NOTIFICATIONS, MOCK_PSC_UPDATES, MOCK_CURRENT_AFFAIRS, MOCK_GK, MOCK_QUESTION_BANK, MOCK_BOOKS_DATA } from '../constants';

const isProd = (() => {
    try {
        return (import.meta as any).env?.PROD || 
               (window as any).process?.env?.NODE_ENV === 'production' || 
               (window as any).process?.env?.VITE_USER_NODE_ENV === 'production' ||
               false;
    } catch (e) {
        return false;
    }
})();

const fetchHub = async <T>(params: string, mockData: T): Promise<T> => {
    if (!isProd) return new Promise(r => setTimeout(() => r(mockData), 300));
    try {
        const res = await fetch(`/api/data?${params}`);
        if (!res.ok) throw new Error("Fetch failed");
        return await res.json();
    } catch (e) {
        console.warn(`Fetch to /api/data?${params} failed, falling back to mock data.`, e);
        return mockData;
    }
};

export const getNotifications = () => fetchHub('type=notifications', MOCK_NOTIFICATIONS);
export const getLiveUpdates = () => fetchHub('type=updates', MOCK_PSC_UPDATES);
export const getCurrentAffairs = () => fetchHub('type=affairs', MOCK_CURRENT_AFFAIRS);
export const getGk = () => fetchHub('type=gk', MOCK_GK);
export const getBooks = () => fetchHub('type=books', MOCK_BOOKS_DATA);

export const getQuestionsForTest = (topic: string, count: number) => 
    fetchHub(`type=questions&topic=${encodeURIComponent(topic)}&count=${count}`, MOCK_QUESTION_BANK.slice(0, count));

export const getStudyMaterial = (topic: string) => 
    fetchHub(`type=study-material&topic=${encodeURIComponent(topic)}`, { notes: "# Studying " + topic });

export const generateBookCover = (title: string, author: string) => 
    fetchHub(`type=generate-cover&title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`, { imageBase64: "" });

const adminReq = async (body: any, token: string | null) => {
    if (!token) throw new Error("Authentication token missing. Please sign in again.");
    const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Admin action failed with status ${res.status}`);
    return data;
};

export const triggerDailyScraper = (t: string | null) => adminReq({ action: 'run-daily' }, t);
export const triggerBookScraper = (t: string | null) => adminReq({ action: 'run-books' }, t);
export const deleteBook = (id: string, t: string | null) => adminReq({ action: 'delete-row', sheet: 'Bookstore', id }, t);
export const syncCsvData = (sheet: string, data: string, t: string | null, isAppend: boolean = false) => 
    adminReq({ action: 'csv-update', sheet, data, mode: isAppend ? 'append' : 'replace' }, t);
