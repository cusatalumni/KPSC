// Vercel Serverless Function
// Path: /api/get-study-material.ts

import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.VITE_API_KEY;

if (!API_KEY) {
    throw new Error("VITE_API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

export default async function handler(req: any, res: any) {
    const { topic } = req.query;

    if (!topic || typeof topic !== 'string') {
        return res.status(400).json({ error: 'Topic is required and must be a string.' });
    }

    try {
        const prompt = `Act as an expert teacher preparing students for the Kerala PSC exams.
        Write comprehensive, well-structured, and easy-to-understand study notes in Malayalam on the topic: "${topic}".
        The notes must be suitable for exam preparation.
        Use Markdown for formatting. This includes using headings (#, ##), lists (* or -), and bold text (**text**).`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const studyNotes = response.text;
        res.status(200).json({ notes: studyNotes });

    } catch (error) {
        console.error(`Error generating study material for topic "${topic}":`, error);
        res.status(500).json({ error: 'Failed to generate study material.' });
    }
}
