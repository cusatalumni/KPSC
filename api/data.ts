
import { GoogleGenAI, Type } from "@google/genai";
import { readSheetData, findAndUpsertRow, appendSheetData } from './_lib/sheets-service.js';

declare var process: any;
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function resilientParseOptions(str: string): string[] {
    if (!str) return [];
    try {
        return JSON.parse(str);
    } catch (e) {
        try {
            const normalized = str.replace(/'/g, '"');
            return JSON.parse(normalized);
        } catch (e2) {
            return str.replace(/[\[\]']/g, '').split(',').map(s => s.trim());
        }
    }
}

function normalizeText(text: string): string {
    return text.trim().toLowerCase().replace(/[?.,!]/g, '');
}

export default async function handler(req: any, res: any) {
    const { type, topic, count } = req.query;

    try {
        switch (type) {
            case 'notifications':
                let nRows = await readSheetData('Notifications!A2:E').catch(() => []);
                if (nRows.length === 0) {
                    const aiRes = await ai.models.generateContent({
                        model: 'gemini-3-flash-preview',
                        contents: "Generate 5 recent Kerala PSC notification-like entries in Malayalam. Fields: id, title, categoryNumber, lastDate (DD-MM-YYYY), link.",
                        config: { responseMimeType: "application/json" }
                    });
                    const parsed = JSON.parse(aiRes.text || "[]");
                    return res.status(200).json(parsed);
                }
                return res.status(200).json(nRows.map(r => ({ id: r[0], title: r[1], categoryNumber: r[2], lastDate: r[3], link: r[4] || '#' })));
            
            case 'updates':
                let uRows = await readSheetData('LiveUpdates!A2:D').catch(() => []);
                if (uRows.length === 0) {
                    const aiRes = await ai.models.generateContent({
                        model: 'gemini-3-flash-preview',
                        contents: "Generate 5 recent Kerala PSC ranked list updates in Malayalam. Fields: title, url, section, published_date (YYYY-MM-DD).",
                        config: { responseMimeType: "application/json" }
                    });
                    const parsed = JSON.parse(aiRes.text || "[]");
                    return res.status(200).json(parsed);
                }
                return res.status(200).json(uRows.map(r => ({ title: r[0], url: r[1] || '#', section: r[2] || 'Update', published_date: r[3] })));

            case 'affairs':
                let aRows = await readSheetData('CurrentAffairs!A2:D').catch(() => []);
                if (aRows.length === 0) {
                    const aiRes = await ai.models.generateContent({
                        model: 'gemini-3-flash-preview',
                        contents: "Generate 5 most important current affairs for Kerala PSC today in Malayalam. Fields: id, title, source, date.",
                        config: { responseMimeType: "application/json" }
                    });
                    const parsed = JSON.parse(aiRes.text || "[]");
                    return res.status(200).json(parsed);
                }
                return res.status(200).json(aRows.map(r => ({ id: r[0], title: r[1], source: r[2], date: r[3] })));

            case 'gk':
                let gRows = await readSheetData('GK!A2:C').catch(() => []);
                if (gRows.length === 0) {
                    const aiRes = await ai.models.generateContent({
                        model: 'gemini-3-flash-preview',
                        contents: "Generate 10 essential GK facts for Kerala PSC in Malayalam. Fields: id, fact, category.",
                        config: { responseMimeType: "application/json" }
                    });
                    const parsed = JSON.parse(aiRes.text || "[]");
                    return res.status(200).json(parsed);
                }
                return res.status(200).json(gRows.map(r => ({ id: r[0], fact: r[1], category: r[2] || 'General' })));

            case 'books':
                const bRows = await readSheetData('Bookstore!A2:E').catch(() => []);
                return res.status(200).json(bRows.map(r => ({ id: r[0], title: r[1], author: r[2], imageUrl: r[3], amazonLink: r[4] || '#' })));

            case 'questions':
                if (!topic) return res.status(400).json({ error: 'Topic required' });
                const qLimit = parseInt(count as string) || 10;
                const searchTopic = (topic as string).toLowerCase();
                const allQsFromSheet = await readSheetData('QuestionBank!A2:G').catch(() => []);
                
                const uniqueSheetQs = new Map();
                allQsFromSheet.forEach(r => {
                    if (!r[2]) return;
                    const normalized = normalizeText(r[2]);
                    if (!uniqueSheetQs.has(normalized)) {
                        uniqueSheetQs.set(normalized, {
                            id: r[0], topic: r[1] || 'General', question: r[2], 
                            options: resilientParseOptions(r[3] || '[]'), correctAnswerIndex: parseInt(r[4] || '0'), 
                            subject: r[5] || 'GK', difficulty: r[6] || 'PSC Level'
                        });
                    }
                });

                const mappedAllQs = Array.from(uniqueSheetQs.values());
                const isMixed = searchTopic.includes('mixed') || searchTopic.includes('mock');

                let filtered = isMixed ? mappedAllQs.sort(() => 0.5 - Math.random()).slice(0, qLimit) : mappedAllQs.filter(q => q.topic.toLowerCase().includes(searchTopic));

                if (filtered.length >= qLimit) {
                    return res.status(200).json(filtered.slice(0, qLimit).sort(() => 0.5 - Math.random()));
                }

                const aiResponse = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: `Generate ${qLimit - filtered.length} unique MCQs in Malayalam for topic: "${topic}". JSON fields: id, topic, question, options, correctAnswerIndex.`,
                    config: { responseMimeType: "application/json" }
                });

                const aiQs = JSON.parse(aiResponse.text || "[]");
                const finalResult = [...filtered, ...aiQs].slice(0, qLimit);
                return res.status(200).json(finalResult);

            case 'study-material':
                if (!topic) return res.status(400).json({ error: 'Topic required' });
                const aiResStudy = await ai.models.generateContent({ 
                    model: 'gemini-3-flash-preview', 
                    contents: `Write detailed Kerala PSC study notes in Malayalam for: "${topic}". Use Markdown. Accurate points only.` 
                });
                return res.status(200).json({ notes: aiResStudy.text || "" });

            default:
                return res.status(400).json({ error: 'Invalid type' });
        }
    } catch (error: any) {
        console.error("Data Hub Error:", error);
        res.status(500).json({ error: error.message });
    }
}
