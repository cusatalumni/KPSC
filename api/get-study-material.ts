// Vercel Serverless Function
// Path: /api/get-study-material.ts

import { GoogleGenAI } from "@google/genai";
import { readSheetData, findAndUpsertRow } from './_lib/sheets-service.js';

const API_KEY = process.env.VITE_API_KEY;
if (!API_KEY) {
    throw new Error("VITE_API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const CACHE_SHEET_NAME = 'StudyMaterialsCache';
const CACHE_RANGE = 'StudyMaterialsCache!A2:C'; // topic, content, lastGenerated
const CACHE_DURATION_DAYS = 7;

async function generateNewMaterial(topic: string): Promise<string> {
    console.log(`Generating new study material for topic: ${topic}`);
    const prompt = `Act as an expert teacher preparing students for the Kerala PSC exams.
    Write comprehensive, well-structured, and easy-to-understand study notes in Malayalam on the topic: "${topic}".
    The notes must be suitable for exam preparation.
    Use Markdown for formatting. This includes using headings (#, ##), lists (* or -), and bold text (**text**).`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
}

export default async function handler(req: any, res: any) {
    const { topic } = req.query;

    if (!topic || typeof topic !== 'string') {
        return res.status(400).json({ error: 'Topic is required and must be a string.' });
    }

    try {
        const cachedRows = await readSheetData(CACHE_RANGE);
        const cachedItem = cachedRows.find(row => row[0] === topic);

        if (cachedItem) {
            const content = cachedItem[1];
            const lastGenerated = new Date(cachedItem[2]);
            const now = new Date();
            const ageInDays = (now.getTime() - lastGenerated.getTime()) / (1000 * 3600 * 24);

            if (ageInDays < CACHE_DURATION_DAYS) {
                console.log(`Serving cached material for topic: ${topic}`);
                return res.status(200).json({ notes: content });
            }
        }

        // If not cached or cache is stale, generate new material
        const newContent = await generateNewMaterial(topic);
        const newTimestamp = new Date().toISOString();
        
        // Upsert the new content into the cache
        await findAndUpsertRow(CACHE_SHEET_NAME, 0, topic, [topic, newContent, newTimestamp]);
        
        res.status(200).json({ notes: newContent });

    } catch (error) {
        console.error(`Error processing study material for topic "${topic}":`, error);
        res.status(500).json({ error: 'Failed to process study material.' });
    }
}