
import type { Notification, PscUpdateItem, CurrentAffairsItem, GkItem, QuizQuestion, Book } from '../types';
import { MOCK_NOTIFICATIONS, MOCK_PSC_UPDATES, MOCK_CURRENT_AFFAIRS, MOCK_GK, MOCK_QUESTION_BANK, MOCK_BOOKS_DATA } from '../constants';

const isVercel = import.meta.env.PROD;

const fetchHub = async <T>(params: string, mockData: T): Promise<T> => {
    if (!isVercel) return new Promise(r => setTimeout(() => r(mockData), 300));
    try {
        const res = await fetch(`/api/data?${params}`);
        if (!res.ok) throw new Error("Fetch failed");
        return await res.json();
    } catch (e) {
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

// --- Admin ---
const adminReq = async (body: any, token: string | null) => {
    if (!token) throw new Error("No token");
    const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error("Admin action failed");
    return res.json();
};

export const triggerDailyScraper = (t: string | null) => adminReq({ action: 'run-daily' }, t);
export const triggerBookScraper = (t: string | null) => adminReq({ action: 'run-books' }, t);
export const syncCsvData = (sheet: string, data: string, t: string | null) => adminReq({ action: 'csv-update', sheet, data }, t);
