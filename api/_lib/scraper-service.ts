
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
    if (!key) {
        console.error("CRITICAL: API_KEY is missing from environment variables.");
        throw new Error("API_KEY missing for Scraper");
    }
    return new GoogleGenAI({ apiKey: key });
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
    // Improved prompt for better search grounding and structured response
    const prompt = `Use Google Search to find the 25 most popular and latest Kerala PSC preparation books currently listed on Amazon.in. 
    Focus on Rank Files, Question Banks, and Subject-wise guides from publishers like Talent Academy, Lakshya, and DC Books.
    For each book, identify its unique ID (use ASIN if possible), full title, author name, and the direct Amazon product link. 
    Construct the URL format strictly as: https://www.amazon.in/dp/[ASIN]?tag=malayalambooks-21
    Return the result ONLY as a JSON array of objects.`;

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
                        type: Type.OBJECT, 
                        properties: {
                            id: { type: Type.STRING, description: "ASIN or Unique Identifier" }, 
                            title: { type: Type.STRING, description: "Full book title" }, 
                            author: { type: Type.STRING, description: "Author or Publisher" },
                            amazonLink: { type: Type.STRING, description: "Full Amazon India URL with tag" },
                        }, 
                        required: ["id", "title", "author", "amazonLink"]
                    }
                }
            }
        });
        
        let textResponse = response.text || "[]";
        
        // Basic cleanup in case AI includes Markdown blocks
        if (textResponse.includes('```json')) {
            textResponse = textResponse.split('```json')[1].split('```')[0].trim();
        } else if (textResponse.includes('```')) {
            textResponse = textResponse.split('```')[1].split('```')[0].trim();
        }

        const items = JSON.parse(textResponse);
        
        return items.map((item: any) => {
            let link = item.amazonLink || '';
            // Defensive tag injection if AI forgot it
            if (link.includes('amazon.in') && !link.includes('tag=')) {
                link += (link.includes('?') ? '&' : '?') + AFFILIATE_TAG;
            }
            return [
                item.id || `b_${Math.random().toString(36).substr(2, 9)}`, 
                item.title, 
                item.author, 
                "", // Image URL column (empty to trigger procedural fallback)
                link
            ];
        });
    } catch (e: any) {
        console.error("Scrape Amazon Books logic error:", e.message);
        throw new Error(`Failed to scrape Amazon: ${e.message}`);
    }
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
            console.error(`Scraper task ${task.name} failed:`, e.message);
        }
    }

    try {
        const newQuestions = await generateNewQuestions();
        await appendSheetData('QuestionBank!A1', newQuestions);
    } catch (e: any) {
        console.error("Question generation failed:", e.message);
    }
}

export async function runBookScraper() {
    try {
        const newBookData = await scrapeAmazonBooks();
        if (newBookData && newBookData.length > 0) {
            await clearAndWriteSheetData('Bookstore!A2:E', newBookData);
        } else {
            console.warn("No book data was returned from the scraper.");
        }
    } catch (e: any) {
        console.error("Book Scraper main task failed:", e.message);
        throw e;
    }
}
