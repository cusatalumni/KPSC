
import { GoogleGenAI, Type } from "@google/genai";
import { clearAndWriteSheetData, appendSheetData } from './sheets-service.js';

declare var process: any;
const AFFILIATE_TAG = 'tag=malayalambooks-21';

function getAi() {
    const key = process.env.API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) throw new Error("API_KEY missing.");
    return new GoogleGenAI({ apiKey: key.trim() });
}

async function scrapeKpscNotifications() {
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
}

async function scrapePscLiveUpdates() {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Find 10 latest announcements (rank lists/exam dates) from keralapsc.gov.in official announcements page. Return as JSON array with 'title', 'url', 'section', and 'published_date'.`,
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
}

async function scrapeCurrentAffairs() {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Research 15 important Malayalam news items suitable for Kerala PSC exams from this week. Return as JSON array with 'id', 'title', 'source', 'date'.`,
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
}

async function scrapeGk() {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate 20 high-quality GK facts about Kerala Geography and History in Malayalam for PSC students. Return as JSON array with 'id', 'fact', 'category'.`,
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
}

async function generateNewQuestions() {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: `Generate 15 MCQ questions in Malayalam about Indian Constitution and Kerala Renaissance. Return 'id', 'topic', 'question', 'options' (array of 4), 'correctAnswerIndex'.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: {
                        id: { type: Type.STRING }, topic: { type: Type.STRING },
                        question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswerIndex: { type: Type.INTEGER }
                    }, required: ["id", "topic", "question", "options", "correctAnswerIndex"]
                }
            }
        }
    });
    return JSON.parse(response.text || "[]").map((item: any) => [item.id, item.topic, item.question, JSON.stringify(item.options), item.correctAnswerIndex, 'Mixed', 'Moderate']);
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
        const data = await t.scraper();
        if (data?.length) {
            if (t.isAppend) await appendSheetData(t.range, data);
            else await clearAndWriteSheetData(t.range, data);
            return t.name;
        }
        throw new Error("Empty data");
    }));
    return { 
        success: results.filter(r => r.status === 'fulfilled').map(r => (r as any).value),
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
