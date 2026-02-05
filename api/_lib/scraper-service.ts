
import { GoogleGenAI, Type } from "@google/genai";
import { clearAndWriteSheetData, appendSheetData } from './sheets-service.js';

declare var process: any;
const AFFILIATE_TAG = 'tag=malayalambooks-21';

const QUIZ_CATEGORY_TOPICS_ML = [
    'പൊതുവിജ്ഞാനം',
    'ആനുകാലിക സംഭവങ്ങൾ',
    'മലയാള സാഹിത്യം',
    'ജനപ്രിയ ശാസ്ത്രം',
    'English Grammar',
    'കേരള ചരിത്രം',
    'ഇന്ത്യൻ ചരിത്രം',
    'ഭൂമിശാസ്ത്രം',
];

/**
 * Robust AI initialization.
 * Checks for API_KEY in multiple common environment variable patterns.
 */
function getAi() {
    const key = process.env.API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_API_KEY;
    if (!key) {
        console.error("ENVIRONMENT ERROR: API_KEY is missing in Vercel/Process env.");
        throw new Error("API_KEY missing for Scraper. Please check Vercel Environment Variables.");
    }
    return new GoogleGenAI({ apiKey: key.trim() });
}

async function scrapeKpscNotifications() {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as a web scraper for keralapsc.gov.in notifications. Extract 10 items. Return as JSON array with 'id', 'title', 'categoryNumber', 'lastDate', 'link'.`,
        config: {
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
        contents: `Fetch latest 15 updates from keralapsc.gov.in. Provide title, url, section, and date (YYYY-MM-DD). Return as JSON array.`,
        config: {
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
        contents: `Generate 10 current affairs for Kerala PSC in Malayalam. Provide id, title, source, and date (YYYY-MM-DD). Return as JSON array.`,
        config: {
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
        contents: `Generate 25 diverse GK facts in Malayalam for PSC. provide id, fact, and category. Return as JSON array.`,
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
    const topics = QUIZ_CATEGORY_TOPICS_ML;
    const prompt = `Generate 20 MCQ questions in Malayalam for Kerala PSC. topics: ${topics.join(', ')}. return 'id', 'topic', 'question', 'options' (array of 4), 'correctAnswerIndex'.`;

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
    const prompt = `Search for top 25 Kerala PSC preparation books on Amazon.in. Return as JSON array of objects with id, title, author, and amazonLink.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: prompt,
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
        
        let rawJson = (response.text || "[]").trim();
        const items = JSON.parse(rawJson);
        
        if (!Array.isArray(items) || items.length === 0) {
            console.warn("AI returned zero books. Sync skipped to protect existing data.");
            return [];
        }

        return items.map((item: any) => {
            let link = item.amazonLink || '';
            if (link.includes('amazon.in') && !link.includes('tag=')) {
                link += (link.includes('?') ? '&' : '?') + AFFILIATE_TAG;
            }
            return [item.id || `b_${Date.now()}`, item.title, item.author, "", link];
        });
    } catch (e: any) {
        console.error("Amazon Scraper failed:", e.message);
        throw new Error(`Amazon Sync Error: ${e.message}`);
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
                await clearAndWriteSheetData(task.range, newData);
                successCount++;
            } else {
                console.warn(`Scraper ${task.name} returned no data.`);
            }
        } catch (e: any) {
            console.error(`Task ${task.name} failed:`, e.message);
            errors.push(`${task.name}: ${e.message}`);
        }
    }

    try {
        const newQuestions = await generateNewQuestions();
        if (newQuestions.length > 0) {
            await appendSheetData('QuestionBank!A1', newQuestions);
        }
    } catch (e: any) {
        console.error("Question Generation failed:", e.message);
        errors.push(`Questions: ${e.message}`);
    }

    if (successCount === 0 && errors.length > 0) {
        throw new Error(`Scraper failed completely. Issues: ${errors.join(', ')}`);
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
