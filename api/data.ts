
import { GoogleGenAI, Type } from "@google/genai";
import { readSheetData, findAndUpsertRow, appendSheetData } from './_lib/sheets-service.js';

declare var process: any;
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Resiliently parses a string that looks like a JS/JSON array.
 * Handles single quotes and missing brackets.
 */
function resilientParseOptions(str: string): string[] {
    if (!str) return [];
    try {
        // First, try standard JSON parse
        return JSON.parse(str);
    } catch (e) {
        try {
            // Handle common CSV format: ['a', 'b', 'c']
            // Convert single quotes to double quotes for JSON compliance
            const normalized = str.replace(/'/g, '"');
            return JSON.parse(normalized);
        } catch (e2) {
            // Last resort: regex split
            return str.replace(/[\[\]']/g, '').split(',').map(s => s.trim());
        }
    }
}

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
                const searchTopic = (topic as string).toLowerCase();
                
                // Read all questions from the bank
                const allQsFromSheet = await readSheetData('QuestionBank!A2:G');
                
                // Map all rows to standard objects
                const mappedAllQs = allQsFromSheet.map(r => ({
                    id: r[0], 
                    topic: r[1] || 'General', 
                    question: r[2], 
                    options: resilientParseOptions(r[3] || '[]'), 
                    correctAnswerIndex: parseInt(r[4] || '0'), 
                    subject: r[5] || 'GK', 
                    difficulty: r[6] || 'PSC Level'
                })).filter(q => q.question && q.options.length > 0);

                // Check for "Mixed" mode or general mock tests
                const isMixed = searchTopic.includes('mixed') || 
                                searchTopic.includes('mock') || 
                                searchTopic.includes('full') ||
                                searchTopic.includes('exam');

                let filtered: any[] = [];

                if (isMixed) {
                    // Pull a random sample from the ENTIRE sheet
                    filtered = mappedAllQs.sort(() => 0.5 - Math.random()).slice(0, qLimit);
                } else {
                    // Pull specific topics with fuzzy matching
                    filtered = mappedAllQs.filter(q => {
                        const rowTopic = q.topic.toLowerCase();
                        return rowTopic.includes(searchTopic) || searchTopic.includes(rowTopic);
                    });
                }

                // If we found enough questions in the sheet, return them
                if (filtered.length >= qLimit) {
                    return res.status(200).json(filtered.slice(0, qLimit).sort(() => 0.5 - Math.random()));
                }

                // Fallback to AI generation for the missing portion
                const currentFoundCount = filtered.length;
                const remainingCount = qLimit - currentFoundCount;
                
                console.log(`Found ${currentFoundCount} for "${topic}". Generating ${remainingCount} via AI.`);

                const aiResponse = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: `Generate a JSON array of ${remainingCount} unique multiple-choice questions in Malayalam for the topic: "${topic}". 
                    These are for Kerala PSC exams. If the topic is "Mixed", generate a variety of questions from History, Science, Maths, and Malayalam.
                    Return as JSON array. Fields: id (uuid), topic (use "${topic}"), question (string), options (array of 4 strings), correctAnswerIndex (0-3), subject (GK/Maths/English/Malayalam), difficulty (PSC Level).`,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    topic: { type: Type.STRING },
                                    question: { type: Type.STRING },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    correctAnswerIndex: { type: Type.INTEGER },
                                    subject: { type: Type.STRING },
                                    difficulty: { type: Type.STRING }
                                },
                                required: ["id", "topic", "question", "options", "correctAnswerIndex"]
                            }
                        }
                    }
                });

                const aiQs = JSON.parse(aiResponse.text || "[]");
                
                // Background save AI questions to sheet for future use
                const rowsToAppend = aiQs.map((q: any) => [
                    q.id, q.topic, q.question, JSON.stringify(q.options), q.correctAnswerIndex, q.subject || 'GK', q.difficulty || 'PSC Level'
                ]);
                appendSheetData('QuestionBank!A1', rowsToAppend).catch(e => console.error("Auto-append failed", e));

                const combined = [...filtered, ...aiQs].sort(() => 0.5 - Math.random());
                return res.status(200).json(combined.slice(0, qLimit));

            case 'study-material':
                if (!topic) return res.status(400).json({ error: 'Topic required' });
                const cache = await readSheetData('StudyMaterialsCache!A2:C');
                const cached = cache.find(r => r[0] === topic);
                if (cached) return res.status(200).json({ notes: cached[1] });
                
                const prompt = `Write Kerala PSC study notes in Malayalam for: "${topic}". Use Markdown. Ensure it is detailed, accurate and formatted for easy reading.`;
                const aiRes = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
                const notes = aiRes.text || "";
                await findAndUpsertRow('StudyMaterialsCache', 0, topic as string, [topic, notes, new Date().toISOString()]);
                return res.status(200).json({ notes });

            default:
                return res.status(400).json({ error: 'Invalid type' });
        }
    } catch (error: any) {
        console.error("Data Hub Error:", error);
        res.status(500).json({ error: error.message });
    }
}
