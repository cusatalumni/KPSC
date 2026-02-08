
import { GoogleGenAI, Type } from "@google/genai";
import { clearAndWriteSheetData, appendSheetData } from './sheets-service.js';

declare var process: any;
const AFFILIATE_TAG = 'tag=malayalambooks-21';

function getAi() {
    const key = process.env.API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_API_KEY;
    if (!key) {
        throw new Error("API_KEY missing. Please add it to Vercel Environment Variables.");
    }
    return new GoogleGenAI({ apiKey: key.trim() });
}

async function scrapeKpscNotifications() {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Search for 10 latest job notifications on keralapsc.gov.in (2024-2025). Return as JSON array with 'id', 'title', 'categoryNumber', 'lastDate', 'link'.`,
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
    const data = JSON.parse(response.text || "[]");
    return data.map((item: any) => [item.id, item.title, item.categoryNumber, item.lastDate, item.link]);
}

async function scrapePscLiveUpdates() {
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
    const data = JSON.parse(response.text || "[]");
    return data.map((item: any) => [item.title, item.url, item.section, item.published_date]);
}

async function scrapeCurrentAffairs() {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Research 15 important Malayalam news items for Kerala PSC from the last 7 days. Return as JSON array with 'id', 'title', 'source', 'date'.`,
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
    const data = JSON.parse(response.text || "[]");
    return data.map((item: any) => [item.id, item.title, item.source, item.date]);
}

async function scrapeGk() {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide 20 GK facts for Kerala PSC in Malayalam. Return as JSON array with 'id', 'fact', 'category'.`,
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
    const data = JSON.parse(response.text || "[]");
    return data.map((item: any) => [item.id, item.fact, item.category]);
}

async function generateNewQuestions() {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: `Generate 15 MCQ questions in Malayalam for Kerala PSC. Return 'id', 'topic', 'question', 'options' (array of 4), 'correctAnswerIndex'.`,
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
    const data = JSON.parse(response.text || "[]");
    return data.map((item: any) => [item.id, item.topic, item.question, JSON.stringify(item.options), item.correctAnswerIndex, 'Mixed', 'Moderate']);
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
                if (t.isAppend) {
                    await appendSheetData(t.range, data);
                } else {
                    await clearAndWriteSheetData(t.range, data);
                }
                return t.name;
            }
            throw new Error("No data returned");
        } catch (err: any) {
            console.error(`Scraper Task ${t.name} failed:`, err.message);
            throw err;
        }
    }));

    const success = results.filter(r => r.status === 'fulfilled').map(r => (r as any).value);
    const errors = results.filter(r => r.status === 'rejected').map((r, i) => `${tasks[i].name}: ${(r as any).reason.message}`);

    return { 
        successCount: success.length, 
        totalTasks: tasks.length, 
        success, 
        errors 
    };
}

export async function runBookScraper() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: `Search for top 15 Kerala PSC books on Amazon.in. Return JSON array with 'id', 'title', 'author', 'amazonLink'.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY, 
                    items: {
                        type: Type.OBJECT, properties: {
                            id: { type: Type.STRING }, title: { type: Type.STRING }, 
                            author: { type: Type.STRING }, amazonLink: { type: Type.STRING },
                        }, required: ["id", "title", "author", "amazonLink"]
                    }
                }
            }
        });
        
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const rows = items.map((item: any) => {
                let link = item.amazonLink || '';
                if (link.includes('amazon.in') && !link.includes('tag=')) {
                    link += (link.includes('?') ? '&' : '?') + AFFILIATE_TAG;
                }
                return [item.id || `b_${Date.now()}`, item.title, item.author, "", link];
            });
            await clearAndWriteSheetData('Bookstore!A2:E', rows);
            return true;
        }
        return false;
    } catch (e: any) {
        console.error("Book Scraper Failed:", e.message);
        throw new Error(`Book Sync failed: ${e.message}`);
    }
}
