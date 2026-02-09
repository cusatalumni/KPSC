
import { GoogleGenAI, Type } from "@google/genai";
import { clearAndWriteSheetData, appendSheetData, readSheetData } from './sheets-service.js';

declare var process: any;
const AFFILIATE_TAG = 'tag=malayalambooks-21';

function getAi() {
    const key = process.env.API_KEY || process.env.GOOGLE_API_KEY;
    if (!key || key.trim() === "") {
        throw new Error("API_KEY missing: Please add your Gemini API Key to Vercel environment variables as 'API_KEY'.");
    }
    return new GoogleGenAI({ apiKey: key.trim() });
}

/**
 * Helper to get the next numeric ID from a sheet to ensure continuity
 */
async function getNextId(sheetRange: string, startFrom: number = 1000): Promise<number> {
    try {
        const rows = await readSheetData(sheetRange);
        if (!rows || rows.length === 0) return startFrom;
        // Parse all IDs and find the max
        const ids = rows.map(r => parseInt(String(r[0]))).filter(id => !isNaN(id));
        return ids.length > 0 ? Math.max(...ids) + 1 : startFrom;
    } catch (e) {
        return startFrom;
    }
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
        
        const nextId = await getNextId('Notifications!A2:A');
        const newData = JSON.parse(response.text || "[]").map((item: any, idx: number) => [
            String(nextId + idx), item.title, item.categoryNumber, item.lastDate, item.link
        ]);
        
        await appendSheetData('Notifications!A1', newData);
        return { message: `${newData.length} notifications appended.` };
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
        const newData = JSON.parse(response.text || "[]").map((item: any) => [item.title, item.url, item.section, item.published_date]);
        const existing = await readSheetData('LiveUpdates!A2:D');
        const combined = [...newData, ...existing].slice(0, 30); // Keep last 30
        await clearAndWriteSheetData('LiveUpdates!A2:D', combined);
        return { message: "Live Updates synced." };
    } catch (e: any) { throw e; }
}

export async function scrapeCurrentAffairs() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Research 10 important Malayalam current affairs for Kerala PSC from this week. Return JSON array with 'title', 'source', 'date' (YYYY-MM-DD).`,
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

        // 14-day retention logic
        const existingRows = await readSheetData('CurrentAffairs!A2:D');
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const filteredExisting = existingRows.filter(row => {
            const rowDate = new Date(row[3]);
            return !isNaN(rowDate.getTime()) && rowDate >= twoWeeksAgo;
        });

        const nextId = await getNextId('CurrentAffairs!A2:A', 5000);
        const newData = JSON.parse(response.text || "[]").map((item: any, idx: number) => [
            String(nextId + idx), item.title, item.source, item.date
        ]);

        const finalData = [...newData, ...filteredExisting];
        await clearAndWriteSheetData('CurrentAffairs!A2:D', finalData);
        
        return { message: `Current Affairs: ${newData.length} added, older than 14 days removed.` };
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
        
        const nextId = await getNextId('GK!A2:A', 8000);
        const newData = JSON.parse(response.text || "[]").map((item: any, idx: number) => [
            String(nextId + idx), item.fact, item.category
        ]);
        
        await appendSheetData('GK!A1', newData);
        return { message: `${newData.length} GK facts appended.` };
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
        
        const nextId = await getNextId('QuestionBank!A2:A', 20000);
        const newData = JSON.parse(response.text || "[]").map((item: any, idx: number) => [
            nextId + idx, item.topic, item.question, JSON.stringify(item.options), item.correctAnswerIndex, 'General', 'Moderate', ''
        ]);
        
        await appendSheetData('QuestionBank!A1', newData);
        return { message: `${newData.length} questions appended.` };
    } catch (e: any) { throw e; }
}

export async function runDailyUpdateScrapers() {
    await scrapeKpscNotifications();
    await scrapeCurrentAffairs();
    await scrapeGk();
    return { message: "Sync Finished (Append Mode)." };
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
        const nextId = await getNextId('Bookstore!A2:A', 3000);
        
        const newData = items.map((item: any, idx: number) => {
            let link = item.amazonLink || '';
            if (link.includes('amazon.in') && !link.includes('tag=')) link += (link.includes('?') ? '&' : '?') + AFFILIATE_TAG;
            return [String(nextId + idx), item.title, item.author, "", link];
        });
        
        const existingTitles = new Set(existing.map(r => r[1].toLowerCase()));
        const uniqueNew = newData.filter(r => !existingTitles.has(r[1].toLowerCase()));
        
        if (uniqueNew.length > 0) {
            await appendSheetData('Bookstore!A1', uniqueNew);
        }
        return true;
    }
    return false;
}
