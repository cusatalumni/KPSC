// Vercel Serverless Function
// Path: /api/generate-cover.ts

import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.VITE_API_KEY;

if (!API_KEY) {
    throw new Error("VITE_API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

export default async function handler(req: any, res: any) {
    const { title, author } = req.query;

    if (!title || !author) {
        return res.status(400).json({ error: 'Title and author are required.' });
    }

    try {
        const prompt = `Create a professional and visually appealing book cover for a Kerala PSC exam preparation book. The cover should feature the book's title prominently and elegantly in Malayalam script: "${title}". The style should be clean, modern, and academic, suitable for an educational publication. Use abstract concepts or symbols related to learning, success, and Kerala for the background imagery. The text must be clear and correctly spelled.`;

        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '3:4', // Common book aspect ratio
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("Image generation failed, no images returned.");
        }

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        res.status(200).json({ imageBase64: base64ImageBytes });

    } catch (error) {
        console.error(`Error generating book cover for "${title}":`, error);
        res.status(500).json({ error: 'Failed to generate book cover image.' });
    }
}
