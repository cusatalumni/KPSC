
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

function getAi() {
    const key = process.env.API_KEY;
    if (!key) throw new Error("API_KEY missing");
    return new GoogleGenAI({ apiKey: key });
}

async function scrapeKpscNotifications() {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as a web scraper. Go to "https://keralapsc.gov.in/index.php/notifications". Scrape the 10 most recent notifications. Return as a JSON array. Each object needs 'id', 'title', 'categoryNumber', 'lastDate', 'link'.`,
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
        contents: `Scrape the 15 most recent updates from keralapsc.gov.in. provide title, full URL, section, and publication date (YYYY-MM-DD). Return as JSON array.`,
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
        contents: `Generate 10 recent current affairs topics for Kerala PSC in Malayalam. provide id, title, source, and date (YYYY-MM-DD). Return as JSON array.`,
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
        contents: `Generate 25 diverse GK facts in Malayalam for PSC exams. provide id, fact, and category. Return as JSON array.`,
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
    const prompt = `Generate a JSON array of 20 unique multiple-choice questions in Malayalam for Kerala PSC. topics: ${topics.join(', ')}. return objects with 'id', 'topic', 'question', 'options' (array of 4), 'correctAnswerIndex' (0-3).`;

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
    const prompt = `Search for top 30 Kerala PSC preparation books on Amazon.in. Return JSON array. fields: id, title, author, amazonLink.`;

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
    
    const items = JSON.parse(response.text || "[]");
    return items.map((item: any) => [item.id, item.title, item.author, "", item.amazonLink]);
}

export async function runDailyUpdateScrapers() {
    const tasks = [
        { name: 'Notifications', scraper: scrapeKpscNotifications, range: 'Notifications!A2:E' },
        { name: 'LiveUpdates', scraper: scrapePscLiveUpdates, range: 'LiveUpdates!A2:D' },
        { name: 'CurrentAffairs', scraper: scrapeCurrentAffairs, range: 'CurrentAffairs!A2:D' },
        { name: 'GK', scraper: scrapeGk, range: 'GK!A2:C' },
    ];

    for (const task of tasks) {
        try {
            const newData = await task.scraper();
            await clearAndWriteSheetData(task.range, newData);
        } catch (e: any) {
            console.error(`Task ${task.name} failed:`, e.message);
        }
    }

    try {
        const newQuestions = await generateNewQuestions();
        await appendSheetData('QuestionBank!A1', newQuestions);
    } catch (e: any) {
        console.error("Questions failed:", e.message);
    }
}

export async function runBookScraper() {
    const newBookData = await scrapeAmazonBooks();
    await clearAndWriteSheetData('Bookstore!A2:E', newBookData);
}
