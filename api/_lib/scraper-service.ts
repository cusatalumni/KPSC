
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

function handleAiError(e: any, taskName: string): string {
    const msg = e.message || '';
    if (msg.includes('leaked') || msg.includes('403')) {
        return `${taskName}: API Key BLOCKED/LEAKED. Please generate a NEW key at aistudio.google.com and update Vercel.`;
    }
    return `${taskName}: ${msg}`;
}

async function scrapeKpscNotifications() {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Search for the latest official job notifications on keralapsc.gov.in (Gazette date 2024/2025). Return as JSON array with 'id', 'title', 'categoryNumber', 'lastDate', 'link'. Ensure titles are descriptive.`,
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
        contents: `Find the 15 newest announcements from keralapsc.gov.in including rank lists, shortlists, and exam dates. Return as JSON array with 'title', 'url', 'section', and 'published_date'. Use official links.`,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY items: {
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
    // Focused on the last 14 days to ensure no obsolete data
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Research exactly 20 the most important news items for Kerala PSC from the LAST 14 DAYS ONLY. Do not include news older than 2 weeks. Categories: National, Kerala, International, Sports, Awards. Return as a JSON array with 'id', 'title' (in Malayalam), 'source', 'date'. Ensure the date is within the last 14 days.`,
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
        contents: `Provide 30 high-quality GK facts for Kerala PSC in Malayalam. Mix of Renaissance, Geography, Indian Constitution, IT, and Sports. Ensure they are relevant for 2024/2025 exams. Return as JSON array with 'id', 'fact', 'category'.`,
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
    const prompt = `Generate 20 MCQ questions in Malayalam for Kerala PSC Exams based on latest trends. Return 'id', 'topic', 'question', 'options' (array of 4), 'correctAnswerIndex'.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', contents: prompt,
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

async function scrapeAmazonBooks() {
    const ai = getAi();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: `Search for top 25 Kerala PSC preparation books on Amazon.in. Return JSON array with 'id', 'title', 'author', 'amazonLink'.`,
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
        if (items.length === 0) return [];
        return items.map((item: any) => {
            let link = item.amazonLink || '';
            if (link.includes('amazon.in') && !link.includes('tag=')) link += (link.includes('?') ? '&' : '?') + AFFILIATE_TAG;
            return [item.id || `b_${Date.now()}`, item.title, item.author, "", link];
        });
    } catch (e: any) {
        throw new Error(handleAiError(e, 'Amazon Sync'));
    }
}

export async function runDailyUpdateScrapers() {
    const tasks = [
        { name: 'Notifications', scraper: scrapeKpscNotifications, range: 'Notifications!A2:E' },
        { name: 'LiveUpdates', scraper: scrapePscLiveUpdates, range: 'LiveUpdates!A2:D' },
        { name: 'CurrentAffairs', scraper: scrapeCurrentAffairs, range: 'CurrentAffairs!A2:D' },
        { name: 'GK', scraper: scrapeGk, range: 'GK!A2:C' },
    ];

    let successCount = 0;
    let errors = [];

    for (const task of tasks) {
        try {
            const newData = await task.scraper();
            if (newData && newData.length > 0) {
                // clearAndWriteSheetData ensures we wipe the old data and replace with fresh 14-day news
                await clearAndWriteSheetData(task.range, newData);
                successCount++;
            }
        } catch (e: any) {
            errors.push(handleAiError(e, task.name));
        }
    }

    try {
        const newQuestions = await generateNewQuestions();
        if (newQuestions.length > 0) await appendSheetData('QuestionBank!A1', newQuestions);
    } catch (e: any) {
        console.error("Auto-Question Engine failed: ", e.message);
    }

    return { successCount, totalTasks: tasks.length, errors };
}

export async function runBookScraper() {
    const newBookData = await scrapeAmazonBooks();
    if (newBookData.length > 0) {
        await clearAndWriteSheetData('Bookstore!A2:E', newBookData);
        return true;
    }
    return false;
}
