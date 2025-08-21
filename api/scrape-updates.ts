// Vercel Serverless Function
// Path: /api/scrape-updates.ts

import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.VITE_API_KEY as string });

// Define scopes for Google Sheets API
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Function to get Google Sheets API client
async function getSheetsClient() {
    const auth = new GoogleAuth({
        scopes: SCOPES,
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        },
    });
    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client as any });
}

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// --- Data Scraping Functions ---

async function scrapeKpscNotifications() {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Act as a web scraper. Go to "https://keralapsc.gov.in/index.php/notifications". Scrape the 5 most recent notifications. For each, extract: full title, category number, last date (DD-MM-YYYY), and direct URL. Return as a JSON array. Each object needs 'id', 'title', 'categoryNumber', 'lastDate', 'link'.`,
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
    const data = JSON.parse(response.text);
    return data.map((item: any) => [item.id, item.title, item.categoryNumber, item.lastDate, item.link]);
}

async function scrapePscLiveUpdates() {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Scrape the 10 most recent updates from keralapsc.gov.in (Ranked Lists, Latest Updates, Notifications). For each, provide title, full URL, section, and publication date (YYYY-MM-DD). Return as JSON array.`,
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
    const data = JSON.parse(response.text);
    return data.map((item: any) => [item.title, item.url, item.section, item.published_date]);
}

async function scrapeCurrentAffairs() {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate 5 recent, relevant current affairs topics for Kerala PSC exams in Malayalam. For each, provide a unique ID, a concise title, the source (e.g., 'മാതൃഭൂമി'), and today's date (YYYY-MM-DD). Return as JSON array.`,
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
    const data = JSON.parse(response.text);
    return data.map((item: any) => [item.id, item.title, item.source, item.date]);
}

async function scrapeGk() {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate 10 diverse General Knowledge facts in Malayalam suitable for PSC exams. For each, provide a unique ID, the fact itself, and a category (e.g., 'കേരളം', 'ഇന്ത്യ', 'ശാസ്ത്രം'). Return as a JSON array.`,
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
    const data = JSON.parse(response.text);
    return data.map((item: any) => [item.id, item.fact, item.category]);
}


// Main Handler
export default async function handler(req: any, res: any) {
    // Protect the endpoint with a secret
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const sheets = await getSheetsClient();
        console.log('Google Sheets client initialized.');

        const tasks = [
            { name: 'Notifications', scraper: scrapeKpscNotifications, range: 'Notifications!A2:E' },
            { name: 'LiveUpdates', scraper: scrapePscLiveUpdates, range: 'LiveUpdates!A2:D' },
            { name: 'CurrentAffairs', scraper: scrapeCurrentAffairs, range: 'CurrentAffairs!A2:D' },
            { name: 'GK', scraper: scrapeGk, range: 'GK!A2:C' },
        ];

        for (const task of tasks) {
            try {
                console.log(`Starting task: ${task.name}`);
                // 1. Clear existing data
                console.log(`Clearing sheet: ${task.range}`);
                await sheets.spreadsheets.values.clear({
                    spreadsheetId: SPREADSHEET_ID,
                    range: task.range,
                });
                console.log(`Sheet cleared: ${task.range}`);

                // 2. Scrape new data
                console.log(`Scraping new data for ${task.name}`);
                const newData = await task.scraper();
                console.log(`Scraped ${newData.length} new items for ${task.name}`);

                // 3. Write new data
                if (newData.length > 0) {
                    console.log(`Writing new data to sheet: ${task.name}`);
                    await sheets.spreadsheets.values.update({
                        spreadsheetId: SPREADSHEET_ID,
                        range: task.range.split('!')[0] + '!A2', // Start writing from row 2
                        valueInputOption: 'USER_ENTERED',
                        requestBody: { values: newData },
                    });
                     console.log(`Successfully wrote data for ${task.name}`);
                }
            } catch (scrapeError) {
                console.error(`Error processing task ${task.name}:`, scrapeError);
                // Continue to the next task even if one fails
            }
        }

        console.log('All scraping tasks completed.');
        res.status(200).json({ message: 'Scraping and update successful.' });

    } catch (error) {
        console.error('Failed to run scraping job:', error);
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
}