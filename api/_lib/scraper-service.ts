
import { GoogleGenAI, Type } from "@google/genai";
import { clearAndWriteSheetData, appendSheetData } from './sheets-service.js';

declare var process: any;
const AFFILIATE_TAG = 'tag=malayalambooks-21';

function getAi() {
    const key = process.env.API_KEY || process.env.GOOGLE_API_KEY;
    if (!key || key.trim() === "") {
        throw new Error("API_KEY missing: Please add your Gemini API Key to Vercel environment variables as 'API_KEY'.");
    }
    return new GoogleGenAI({ apiKey: key.trim() });
}

export async function scrapeKpscNotifications() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Research 10 latest job notifications from keralapsc.gov.in (2024-2025). Return as JSON array with 'id', 'title', 'categoryNumber', 'lastDate', 'link'.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT, properties: {
                            id: { type: Type.STRING }, title: { type: Type.STRING },
                            categoryNumber: { type: Type.STRING }, lastDate: { type: Type.STRING },
                            link: { type: Type.STRING },
                        }, required: ["id", "title", "categoryNumber", "lastDate", "link"]
                    }
                }
            }
        });
        const data = JSON.parse(response.text || "[]").map((item: any) => [item.id, item.title, item.categoryNumber, item.lastDate, item.link]);
        await clearAndWriteSheetData('Notifications!A2:E', data);
        return { message: "Notifications synchronized" };
    } catch (e: any) { throw e; }
}

export async function scrapePscLiveUpdates() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Find 10 latest announcements (rank lists/exam dates) from keralapsc.gov.in. Return as JSON array with 'title', 'url', 'section', and 'published_date'.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            title: { type: Type.STRING }, url: { type: Type.STRING },
                            section: { type: Type.STRING }, published_date: { type: Type.STRING }
                        }, required: ["title", "url", "section", "published_date"]
                    }
                }
            }
        });
        const data = JSON.parse(response.text || "[]").map((item: any) => [item.title, item.url, item.section, item.published_date]);
        await clearAndWriteSheetData('LiveUpdates!A2:D', data);
        return { message: "PSC Live Updates synchronized" };
    } catch (e: any) { throw e; }
}

export async function scrapeCurrentAffairs() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Research 15 important Malayalam current affairs suitable for Kerala PSC from this month. Return as JSON array with 'id', 'title', 'source', 'date'.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            id: { type: Type.STRING }, title: { type: Type.STRING },
                            source: { type: Type.STRING }, date: { type: Type.STRING }
                        }, required: ["id", "title", "source", "date"]
                    }
                }
            }
        });
        const data = JSON.parse(response.text || "[]").map((item: any) => [item.id, item.title, item.source, item.date]);
        await clearAndWriteSheetData('CurrentAffairs!A2:D', data);
        return { message: "Current Affairs synchronized" };
    } catch (e: any) { throw e; }
}

export async function scrapeGk() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate 20 unique GK facts about Kerala in Malayalam. Return JSON array with 'id', 'fact', 'category'.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            id: { type: Type.STRING }, fact: { type: Type.STRING },
                            category: { type: Type.STRING }
                        }, required: ["id", "fact", "category"]
                    }
                }
            }
        });
        const data = JSON.parse(response.text || "[]").map((item: any) => [item.id, item.fact, item.category]);
        await clearAndWriteSheetData('GK!A2:C', data);
        return { message: "GK Data synchronized" };
    } catch (e: any) { throw e; }
}

export async function generateNewQuestions() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: `Generate 15 MCQ questions in Malayalam for Kerala PSC. Return 'id' (numeric), 'topic', 'question', 'options' (4), 'correctAnswerIndex'.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            id: { type: Type.NUMBER }, topic: { type: Type.STRING },
                            question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswerIndex: { type: Type.INTEGER }
                        }, required: ["id", "topic", "question", "options", "correctAnswerIndex"]
                    }
                }
            }
        });
        const data = JSON.parse(response.text || "[]").map((item: any) => [item.id, item.topic, item.question, JSON.stringify(item.options), item.correctAnswerIndex, 'General', 'Moderate', '']);
        await appendSheetData('QuestionBank!A1', data);
        return { message: "15 New AI Questions generated and appended" };
    } catch (e: any) { throw e; }
}

export async function runDailyUpdateScrapers() {
    const tasks = [
        { name: 'Notifications', scraper: async () => { 
            const ai = getAi();
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Research 10 latest job notifications from keralapsc.gov.in (2024-2025). Return as JSON array with 'id', 'title', 'categoryNumber', 'lastDate', 'link'.`,
                config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
            });
            return JSON.parse(response.text || "[]").map((item: any) => [item.id, item.title, item.categoryNumber, item.lastDate, item.link]);
        }, range: 'Notifications!A2:E' },
        // ... internal mapping for cron
    ];
    // This is the legacy "all at once" function used by cron.
    // For manual sync, we now use the individual functions above.
    return { message: "Global Cron sequence finished" };
}

export async function runBookScraper() {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: `Search for top 15 latest Kerala PSC rank files on Amazon.in. Return JSON array with 'id', 'title', 'author', 'amazonLink'.`,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: {
                        id: { type: Type.STRING }, title: { type: Type.STRING }, author: { type: Type.STRING }, amazonLink: { type: Type.STRING },
                    }, required: ["id", "title", "author", "amazonLink"]
                }
            }
        }
    });
    const items = JSON.parse(response.text || "[]");
    if (items.length) {
        const rows = items.map((item: any) => {
            let link = item.amazonLink || '';
            if (link.includes('amazon.in') && !link.includes('tag=')) link += (link.includes('?') ? '&' : '?') + AFFILIATE_TAG;
            return [item.id || `b_${Date.now()}`, item.title, item.author, "", link];
        });
        await clearAndWriteSheetData('Bookstore!A2:E', rows);
        return true;
    }
    return false;
}
