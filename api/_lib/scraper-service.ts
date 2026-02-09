
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

async function scrapeKpscNotifications() {
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
        return JSON.parse(response.text || "[]").map((item: any) => [item.id, item.title, item.categoryNumber, item.lastDate, item.link]);
    } catch (e: any) { 
        console.error("Notification Scrape Failed:", e.message); 
        throw e;
    }
}

async function scrapePscLiveUpdates() {
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
        return JSON.parse(response.text || "[]").map((item: any) => [item.title, item.url, item.section, item.published_date]);
    } catch (e: any) { throw e; }
}

async function scrapeCurrentAffairs() {
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
        return JSON.parse(response.text || "[]").map((item: any) => [item.id, item.title, item.source, item.date]);
    } catch (e: any) { throw e; }
}

async function scrapeGk() {
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
        return JSON.parse(response.text || "[]").map((item: any) => [item.id, item.fact, item.category]);
    } catch (e: any) { throw e; }
}

async function generateNewQuestions() {
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
        return JSON.parse(response.text || "[]").map((item: any) => [item.id, item.topic, item.question, JSON.stringify(item.options), item.correctAnswerIndex, 'General', 'Moderate', '']);
    } catch (e: any) { throw e; }
}

export async function runDailyUpdateScrapers() {
    const tasks = [
        { name: 'Notifications', scraper: scrapeKpscNotifications, range: 'Notifications!A2:E' },
        { name: 'LiveUpdates', scraper: scrapePscLiveUpdates, range: 'LiveUpdates!A2:D' },
        { name: 'CurrentAffairs', scraper: scrapeCurrentAffairs, range: 'CurrentAffairs!A2:D' },
        { name: 'GK', scraper: scrapeGk, range: 'GK!A2:C' },
        { name: 'Questions', scraper: generateNewQuestions, range: 'QuestionBank!A1', isAppend: true }
    ];
    const results = await Promise.allSettled(tasks.map(async (t) => {
        try {
            const data = await t.scraper();
            if (data && data.length > 0) {
                if (t.isAppend) await appendSheetData(t.range, data);
                else await clearAndWriteSheetData(t.range, data);
                return t.name;
            }
            return null;
        } catch (e: any) {
            console.error(`Task ${t.name} failed:`, e.message);
            throw e;
        }
    }));
    return { 
        success: results.filter(r => r.status === 'fulfilled' && (r as any).value).map(r => (r as any).value),
        errors: results.filter(r => r.status === 'rejected').map((r, i) => `${tasks[i].name}: ${(r as any).reason.message}`)
    };
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
