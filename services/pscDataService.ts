import type { Notification, PscUpdateItem, CurrentAffairsItem, GkItem, QuizQuestion } from '../types';
import { MOCK_NOTIFICATIONS, MOCK_PSC_UPDATES, MOCK_CURRENT_AFFAIRS, MOCK_GK, MOCK_QUESTION_BANK } from '../constants';

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

export const getQuestionsForTest = (topic: string, count: number): Promise<QuizQuestion[]> => {
    const apiPath = `/api/get-questions?topic=${encodeURIComponent(topic)}&count=${count}`;
    const mockFiltered = MOCK_QUESTION_BANK.filter(q => q.topic.includes(topic.split(' - ')[1] || topic));
    const mockResult = mockFiltered.length > 0 ? mockFiltered.slice(0, count) : MOCK_QUESTION_BANK.slice(0, count);
    return fetchWithMockFallback(apiPath, mockResult);
};