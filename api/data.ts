
import { GoogleGenAI, Type } from "@google/genai";
import { readSheetData, findAndUpsertRow } from './_lib/sheets-service.js';

declare var process: any;
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export default async function handler(req: any, res: any) {
    const { type, topic, count, title, author } = req.query;

    try {
        switch (type) {
            case 'notifications':
                const nRows = await readSheetData('Notifications!A2:E');
                return res.status(200).json(nRows.map(r => ({ id: r[0], title: r[1], categoryNumber: r[2], lastDate: r[3], link: r[4] || '#' })));
            
            case 'updates':
                const uRows = await readSheetData('LiveUpdates!A2:D');
                return res.status(200).json(uRows.map(r => ({ title: r[0], url: r[1] || '#', section: r[2] || 'Update', published_date: r[3] })));

            case 'affairs':
                const aRows = await readSheetData('CurrentAffairs!A2:D');
                return res.status(200).json(aRows.map(r => ({ id: r[0], title: r[1], source: r[2], date: r[3] })));

            case 'gk':
                const gRows = await readSheetData('GK!A2:C');
                return res.status(200).json(gRows.map(r => ({ id: r[0], fact: r[1], category: r[2] || 'General' })));

            case 'books':
                const bRows = await readSheetData('Bookstore!A2:E');
                return res.status(200).json(bRows.map(r => ({ id: r[0], title: r[1], author: r[2], imageUrl: r[3], amazonLink: r[4] || '#' })));

            case 'questions':
                if (!topic) return res.status(400).json({ error: 'Topic required' });
                const qLimit = parseInt(count as string) || 10;
                const allQs = await readSheetData('QuestionBank!A2:G');
                const filtered = allQs.filter(r => r[1]?.toLowerCase() === (topic as string).toLowerCase());
                
                if (filtered.length >= qLimit) {
                    return res.status(200).json(filtered.slice(0, qLimit).map(r => ({
                        id: r[0], topic: r[1], question: r[2], options: JSON.parse(r[3]), correctAnswerIndex: parseInt(r[4]), subject: r[5], difficulty: r[6]
                    })));
                }
                return res.status(200).json([]);

            case 'study-material':
                if (!topic) return res.status(400).json({ error: 'Topic required' });
                const cache = await readSheetData('StudyMaterialsCache!A2:C');
                const cached = cache.find(r => r[0] === topic);
                if (cached) return res.status(200).json({ notes: cached[1] });
                
                const prompt = `Write Kerala PSC study notes in Malayalam for: "${topic}". Use Markdown.`;
                const aiRes = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
                const notes = aiRes.text || "";
                await findAndUpsertRow('StudyMaterialsCache', 0, topic as string, [topic, notes, new Date().toISOString()]);
                return res.status(200).json({ notes });

            case 'generate-cover':
                if (!title || !author) return res.status(400).json({ error: 'Meta required' });
                const imgResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: {
                        parts: [{ text: `A clean, professional, minimalistic academic book cover for a Kerala PSC guide titled "${title}" by author "${author}". Bold typography, deep indigo and gold professional colors, high resolution graphic design style, no realistic human faces, educational theme.` }]
                    },
                    config: {
                        imageConfig: {
                            aspectRatio: "3:4"
                        }
                    }
                });

                let base64Image = "";
                for (const part of imgResponse.candidates[0].content.parts) {
                    if (part.inlineData) {
                        base64Image = part.inlineData.data;
                        break;
                    }
                }

                if (!base64Image) {
                    throw new Error("No image was returned from the generative model.");
                }
                
                return res.status(200).json({ imageBase64: base64Image });

            default:
                return res.status(400).json({ error: 'Invalid type' });
        }
    } catch (error: any) {
        console.error("Data Hub Error:", error);
        res.status(500).json({ error: error.message });
    }
}
