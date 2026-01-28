
import { GoogleGenAI, Type } from "@google/genai";
import { clearAndWriteSheetData, appendSheetData } from './sheets-service.js';

declare var process: any;
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
// Updated tracking ID as requested
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

async function scrapeKpscNotifications() {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as a web scraper. Go to "https://keralapsc.gov.in/index.php/notifications". Scrape the 10 most recent notifications. For each, extract: full title, category number, last date (DD-MM-YYYY), and direct URL. Return as a JSON array. Each object needs 'id', 'title', 'categoryNumber', 'lastDate', 'link'.`,
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
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Scrape the 15 most recent updates from keralapsc.gov.in (Ranked Lists, Latest Updates, Notifications). For each, provide title, full URL, section, and publication date (YYYY-MM-DD). Return as JSON array.`,
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
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate 10 recent, relevant current affairs topics for Kerala PSC exams in Malayalam. For each, provide a unique ID, a concise title, the source (e.g., 'മാതൃഭൂമി'), and today's date (YYYY-MM-DD). Return as JSON array.`,
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
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate 25 diverse General Knowledge facts in Malayalam suitable for PSC exams. For each, provide a unique ID, the fact itself, and a category (e.g., 'കേരളം', 'ഇന്ത്യ', 'ശാസ്ത്രം'). Return as JSON array.`,
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
    const topics = QUIZ_CATEGORY_TOPICS_ML;
    const prompt = `Generate a JSON array of ${topics.length * 2} unique multiple-choice questions in Malayalam suitable for a Kerala PSC exam. 
    Distribute them among the following topics: ${topics.join(', ')}.
    Each question object must have 'id' (a unique uuid string), 'topic' (the Malayalam topic string from the list), 'question' (string), 'options' (an array of 4 strings), and 'correctAnswerIndex' (a 0-based integer). Ensure questions are relevant and distinct.`;

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
    return data.map((item: any) => [item.id, item.topic, item.question, JSON.stringify(item.options), item.correctAnswerIndex]);
}

async function scrapeAmazonBooks() {
    const prompt = `Act as a web scraper specializing in book discovery. Search amazon.in for at least 20 of the current best-selling "Kerala PSC exam preparation books". 
    Ensure you include a diverse mix of:
    1. LDC Rank Files (Talent, Lakshya, DC Books)
    2. LGS Rank Files
    3. Degree Level Preliminary & Mains guides
    4. KAS (Kerala Administrative Service) preparation books
    5. Subject-specific books (GK, English Grammar, Malayalam, Maths)
    6. Previous Year Question Papers compilations
    
    For each book, return a JSON array with 'id' (unique string), 'title' (full book title), 'author' (publisher or author name), 'imageUrl' (valid product image URL), and 'amazonLink'. 
    CRITICAL: For 'amazonLink', ensure it is a valid amazon.in product URL and append exactly "&${AFFILIATE_TAG}" to the end.`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: {
                        id: { type: Type.STRING }, title: { type: Type.STRING }, author: { type: Type.STRING },
                        imageUrl: { type: Type.STRING }, amazonLink: { type: Type.STRING },
                    }, required: ["id", "title", "author", "imageUrl", "amazonLink"]
                }
            }
        }
    });
    const data = JSON.parse(response.text || "[]");
    return data.map((item: any) => [item.id, item.title, item.author, item.imageUrl, item.amazonLink]);
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
        } catch (e) { console.error(`Task ${task.name} failed:`, e); }
    }

    try {
        const newQuestions = await generateNewQuestions();
        await appendSheetData('QuestionBank!A1', newQuestions);
    } catch(e) { console.error("Question enrichment failed:", e); }
}

export async function runBookScraper() {
    const newBookData = await scrapeAmazonBooks();
    await clearAndWriteSheetData('Bookstore!A2:E', newBookData);
}
