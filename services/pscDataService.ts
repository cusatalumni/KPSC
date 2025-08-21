import type { Notification, PscUpdateItem, CurrentAffairsItem, GkItem, QuizQuestion, Book } from '../types';
import { MOCK_NOTIFICATIONS, MOCK_PSC_UPDATES, MOCK_CURRENT_AFFAIRS, MOCK_GK, MOCK_QUESTION_BANK, MOCK_BOOKS_DATA } from '../constants';

const isVercel = import.meta.env.PROD;

const fetchWithMockFallback = async <T>(apiPath: string, mockData: T): Promise<T> => {
    if (!isVercel) {
        console.log(`DEV MODE: Using mock data for ${apiPath}`);
        return new Promise(resolve => setTimeout(() => resolve(mockData), 500));
    }
    try {
        const response = await fetch(apiPath);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${apiPath}: ${response.statusText}`);
        }
        return await response.json() as T;
    } catch (error) {
        console.error(`Error fetching from ${apiPath}, falling back to mock data.`, error);
        return mockData;
    }
};

export const getNotifications = (): Promise<Notification[]> => {
    return fetchWithMockFallback('/api/get-notifications', MOCK_NOTIFICATIONS);
};

export const getLiveUpdates = (): Promise<PscUpdateItem[]> => {
    return fetchWithMockFallback('/api/get-live-updates', MOCK_PSC_UPDATES);
};

export const getCurrentAffairs = (): Promise<CurrentAffairsItem[]> => {
    return fetchWithMockFallback('/api/get-current-affairs', MOCK_CURRENT_AFFAIRS);
};

export const getGk = (): Promise<GkItem[]> => {
    return fetchWithMockFallback('/api/get-gk', MOCK_GK);
};

export const getBooks = (): Promise<Book[]> => {
    return fetchWithMockFallback('/api/get-books', MOCK_BOOKS_DATA);
};

export const getQuestionsForTest = (topic: string, count: number): Promise<QuizQuestion[]> => {
    const apiPath = `/api/get-questions?topic=${encodeURIComponent(topic)}&count=${count}`;
    const mockFiltered = MOCK_QUESTION_BANK.filter(q => q.topic.includes(topic.split(' - ')[1] || topic));
    const mockResult = mockFiltered.length > 0 ? mockFiltered.slice(0, count) : MOCK_QUESTION_BANK.slice(0, count);
    return fetchWithMockFallback(apiPath, mockResult);
};

export const getStudyMaterial = async (topic: string): Promise<{ notes: string }> => {
    if (!isVercel) {
        console.log(`DEV MODE: Using mock study material for ${topic}`);
        const mockNotes = `## ${topic}\n\n* ഇത് ഒരു മാതൃകാ പഠന മെറ്റീരിയലാണ്.\n* തത്സമയ ഉള്ളടക്കം AI ഉപയോഗിച്ച് സൃഷ്ടിക്കും.\n\n**പ്രധാന പോയിന്റുകൾ:**\n- പോയിന്റ് 1\n- പോയിന്റ് 2`;
        return new Promise(resolve => setTimeout(() => resolve({ notes: mockNotes }), 1000));
    }
    try {
        const response = await fetch(`/api/get-study-material?topic=${encodeURIComponent(topic)}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch study material: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching study material for ${topic}.`, error);
        throw error;
    }
};

export const generateBookCover = async (title: string, author: string): Promise<{ imageBase64: string }> => {
     if (!isVercel) {
        // Return a placeholder to avoid breaking the UI in local dev without an API key
        console.log(`DEV MODE: Using placeholder for book cover generation: ${title}`);
        return new Promise(resolve => setTimeout(() => resolve({ imageBase64: '' }), 1000));
    }
    try {
        const response = await fetch(`/api/generate-cover?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`);
        if (!response.ok) {
            throw new Error(`Failed to generate cover: ${response.statusText}`);
        }
        return await response.json();
    } catch(error) {
        console.error(`Error generating book cover for "${title}"`, error);
        throw error;
    }
};


// --- Admin Functions ---

const triggerScraper = async (apiPath: string, token: string | null): Promise<any> => {
    if (!token) {
        throw new Error("Authentication token not available.");
    }
    const response = await fetch(apiPath, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
};

export const triggerDailyScraper = (token: string | null) => {
    return triggerScraper('/api/run-daily-scraper', token);
};

export const triggerBookScraper = (token: string | null) => {
    return triggerScraper('/api/run-monthly-book-scraper', token);
};