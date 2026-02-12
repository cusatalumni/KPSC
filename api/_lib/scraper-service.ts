import { GoogleGenAI, Type } from "@google/genai";
import { clearAndWriteSheetData, appendSheetData, readSheetData } from './sheets-service.js';
import { upsertSupabaseData } from './supabase-service.js';

declare var process: any;
const AFFILIATE_TAG = 'tag=malayalambooks-21';

function getAi() {
    const key = process.env.API_KEY || process.env.GOOGLE_API_KEY;
    if (!key || key.trim() === "") {
        throw new Error("API_KEY missing.");
    }
    return new GoogleGenAI({ apiKey: key.trim() });
}

function createNumericHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

async function getNextId(sheetRange: string, startFrom: number = 1000): Promise<number> {
    try {
        const rows = await readSheetData(sheetRange);
        if (!rows || rows.length === 0) return startFrom;
        const ids = rows.map(r => parseInt(String(r[0]))).filter(id => !isNaN(id));
        return ids.length > 0 ? Math.max(...ids) + 1 : startFrom;
    } catch (e) { return startFrom; }
}

export async function scrapeKpscNotifications() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Research 5 latest job notifications from keralapsc.gov.in (2024-2025). Return as JSON array with 'title', 'categoryNumber', 'lastDate', 'link'.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT, properties: {
                            title: { type: Type.STRING },
                            categoryNumber: { type: Type.STRING }, lastDate: { type: Type.STRING },
                            link: { type: Type.STRING },
                        }, required: ["title", "categoryNumber", "lastDate", "link"]
                    }
                }
            }
        });
        
        const baseId = await getNextId('Notifications!A2:A', 1000);
        const items = JSON.parse(response.text || "[]");
        
        const sheetData = items.map((item: any, idx: number) => [String(baseId + idx), item.title, item.categoryNumber, item.lastDate, item.link]);
        const sbData = items.map((item: any, idx: number) => ({ id: String(baseId + idx), title: item.title, categoryNumber: item.categoryNumber, lastDate: item.lastDate, link: item.link }));
        
        await appendSheetData('Notifications!A1', sheetData);
        await upsertSupabaseData('notifications', sbData);
        return { message: `${items.length} notifications synced.` };
    } catch (e: any) { throw e; }
}

export async function scrapePscLiveUpdates() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Find 5 latest announcements from keralapsc.gov.in. Return as JSON array with 'title', 'url', 'section', and 'published_date'.`,
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
        const items = JSON.parse(response.text || "[]");
        const existing = await readSheetData('LiveUpdates!A2:D');
        const existingUrls = new Set(existing.map(r => String(r[1]).trim()));
        const uniqueNewItems = items.filter((it: any) => !existingUrls.has(it.url.trim()));
        
        if (uniqueNewItems.length > 0) {
            const combined = [...uniqueNewItems.map((it:any) => [it.title, it.url, it.section, it.published_date]), ...existing].slice(0, 50);
            await clearAndWriteSheetData('LiveUpdates!A2:D', combined);
            
            const sbData = uniqueNewItems.map((it: any) => ({
                id: createNumericHash(it.url || it.title),
                title: it.title,
                url: it.url,
                section: it.section,
                published_date: it.published_date
            }));
            await upsertSupabaseData('liveupdates', sbData);
        }
        return { message: `${uniqueNewItems.length} new updates found.` };
    } catch (e: any) { throw e; }
}

export async function scrapeCurrentAffairs() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Research 10 important Malayalam current affairs for Kerala PSC from this week. Return JSON array with 'title', 'source', 'date'.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            title: { type: Type.STRING },
                            source: { type: Type.STRING }, date: { type: Type.STRING }
                        }, required: ["title", "source", "date"]
                    }
                }
            }
        });
        const items = JSON.parse(response.text || "[]");
        const baseId = await getNextId('CurrentAffairs!A2:A', 5000);
        const sheetData = items.map((item: any, idx: number) => [String(baseId + idx), item.title, item.source, item.date]);
        const sbData = items.map((item: any, idx: number) => ({ id: String(baseId + idx), title: item.title, source: item.source, date: item.date }));
        await appendSheetData('CurrentAffairs!A1', sheetData);
        await upsertSupabaseData('currentaffairs', sbData);
        return { message: `Current Affairs synced.` };
    } catch (e: any) { throw e; }
}

export async function scrapeGk() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate 10 unique GK facts about Kerala in Malayalam. Return JSON array with 'fact', 'category'.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            fact: { type: Type.STRING },
                            category: { type: Type.STRING }
                        }, required: ["fact", "category"]
                    }
                }
            }
        });
        const baseId = await getNextId('GK!A2:A', 8000);
        const items = JSON.parse(response.text || "[]");
        const sheetData = items.map((item: any, idx: number) => [String(baseId + idx), item.fact, item.category]);
        const sbData = items.map((item: any, idx: number) => ({ id: String(baseId + idx), fact: item.fact, category: item.category }));
        await appendSheetData('GK!A1', sheetData);
        await upsertSupabaseData('gk', sbData);
        return { message: `GK facts synced.` };
    } catch (e: any) { throw e; }
}

export async function generateNewQuestions() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: `Generate 10 MCQ questions in Malayalam for Kerala PSC. Return 'topic', 'question', 'options' (4), 'correctAnswerIndex'.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            topic: { type: Type.STRING },
                            question: { type: Type.STRING }, 
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswerIndex: { type: Type.INTEGER }
                        }, required: ["topic", "question", "options", "correctAnswerIndex"]
                    }
                }
            }
        });
        const baseId = await getNextId('QuestionBank!A2:A', 20000);
        const items = JSON.parse(response.text || "[]");
        const sheetData = items.map((item: any, idx: number) => [baseId + idx, item.topic, item.question, JSON.stringify(item.options), item.correctAnswerIndex, 'General', 'Moderate', '']);
        const sbData = items.map((item: any, idx: number) => ({ 
            id: baseId + idx, topic: item.topic, question: item.question, options: item.options, correct_answer_index: item.correctAnswerIndex, subject: 'General', difficulty: 'Moderate'
        }));
        await appendSheetData('QuestionBank!A1', sheetData);
        await upsertSupabaseData('questionbank', sbData);
        return { message: `${items.length} questions injected.` };
    } catch (e: any) { throw e; }
}

export async function runDailyUpdateScrapers() {
    await scrapeKpscNotifications();
    await scrapeCurrentAffairs();
    await scrapeGk();
    return { message: "Daily Protocols Finished." };
}

export async function runBookScraper() {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: `Search for top 10 latest Kerala PSC rank files on Amazon.in. Return JSON array with 'title', 'author', 'amazonLink'.`,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: {
                        title: { type: Type.STRING }, author: { type: Type.STRING }, amazonLink: { type: Type.STRING },
                    }, required: ["title", "author", "amazonLink"]
                }
            }
        }
    });
    const items = JSON.parse(response.text || "[]");
    if (items.length) {
        const existing = await readSheetData('Bookstore!A2:E');
        const baseId = await getNextId('Bookstore!A2:A', 3000);
        const existingTitles = new Set(existing.map(r => String(r[1]).toLowerCase().trim()));
        const uniqueNew = items.filter(it => !existingTitles.has(it.title.toLowerCase().trim()));
        
        if (uniqueNew.length > 0) {
            const sheetData = uniqueNew.map((it, idx) => [String(baseId + idx), it.title, it.author, "", it.amazonLink]);
            await appendSheetData('Bookstore!A1', sheetData);
            await upsertSupabaseData('bookstore', uniqueNew.map((it, idx) => ({ id: String(baseId + idx), title: it.title, author: it.author, imageUrl: "", amazonLink: it.amazonLink })));
        }
        return true;
    }
    return false;
}