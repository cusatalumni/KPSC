
import { readSheetData, findAndUpsertRow } from './_lib/sheets-service.js';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    try {
        // 1. Check Cache first
        const cacheRows = await readSheetData('StudyMaterialsCache!A2:C');
        const cachedItem = cacheRows.find((r: any) => r[0].toLowerCase() === topic.toLowerCase());

        if (cachedItem) {
            console.log(`Cache Hit for topic: ${topic}`);
            return res.status(200).json({ notes: cachedItem[1], cached: true });
        }

        // 2. Cache Miss - Generate via Gemini
        console.log(`Cache Miss for topic: ${topic}. Generating via AI...`);
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error('AI API Key missing');

        const ai = new GoogleGenAI({ apiKey });
        const aiResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate extremely detailed study notes in Malayalam for the Kerala PSC topic: "${topic}". 
            Use Markdown formatting with headings (#, ##), bullet points, and bold text for important facts. 
            Keep it structured and helpful for a student.`,
        });

        const content = aiResponse.text || "വിവരങ്ങൾ ലഭ്യമല്ല.";

        // 3. Save to Cache for next time
        const timestamp = new Date().toISOString();
        await findAndUpsertRow('StudyMaterialsCache', topic, [topic, content, timestamp]);

        return res.status(200).json({ notes: content, cached: false });

    } catch (error: any) {
        console.error("Study Material Handler Error:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
