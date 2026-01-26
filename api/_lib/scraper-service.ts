// Path: /api/_lib/scraper-service.ts

import { GoogleGenAI, Type } from "@google/genai";
import { clearAndWriteSheetData, appendSheetData } from './sheets-service.js';

// Fix: Strictly use process.env.API_KEY and named parameter for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const AFFILIATE_TAG = 'tag=httpcodingonl-21';

// Local version of QUIZ_CATEGORY_TOPICS_ML
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

// --- Individual Scraping Functions ---

async function scrapeKpscNotifications() {
    // Use gemini-3-flash-preview for scraping tasks
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
    const prompt = `Act as a web scraper. Start by searching on amazon.in for "Kerala PSC exam preparation books". From the search results page, identify the top 12 most relevant, individual book listings. For each book, you must find its direct product detail page URL (it should look like 'https://www.amazon.in/dp/...' or contain '/dp/'). From the listing, extract: a unique ID, the book's title, the author's name, and a high-quality image URL. Finally, take the clean product URL and append the affiliate tracking code "${AFFILIATE_TAG}". Use '&' if the product URL already has a '?', otherwise use '?'. Return the final data as a JSON array.`;

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


// --- Main Orchestrator Functions ---

export async function runDailyUpdateScrapers() {
    console.log('Starting daily scraping tasks.');

    const dailyRefreshTasks = [
        { name: 'Notifications', scraper: scrapeKpscNotifications, range: 'Notifications!A2:E' },
        { name: 'LiveUpdates', scraper: scrapePscLiveUpdates, range: 'LiveUpdates!A2:D' },
        { name: 'CurrentAffairs', scraper: scrapeCurrentAffairs, range: 'CurrentAffairs!A2:D' },
        { name: 'GK', scraper: scrapeGk, range: 'GK!A2:C' },
    ];

    for (const task of dailyRefreshTasks) {
        try {
            console.log(`Starting daily refresh task: ${task.name}`);
            const newData = await task.scraper();
            await clearAndWriteSheetData(task.range, newData);
            console.log(`Successfully refreshed: ${task.name}`);
        } catch (scrapeError) {
            console.error(`Error processing task ${task.name}:`, scrapeError);
        }
    }

    try {
        console.log("Starting task: Enrich QuestionBank");
        const newQuestions = await generateNewQuestions();
        await appendSheetData('QuestionBank!A1', newQuestions);
        console.log(`Successfully appended ${newQuestions.length} new questions.`);
    } catch(e) {
        console.error("Error enriching QuestionBank:", e);
    }

    console.log('All daily scraping tasks completed.');
}


export async function runBookScraper() {
    console.log('Starting monthly task: Scrape Books');
    const range = 'Bookstore!A2:E';
    
    const newBookData = await scrapeAmazonBooks();
    await clearAndWriteSheetData(range, newBookData);
    
    console.log(`Successfully scraped and stored ${newBookData.length} books.`);
}