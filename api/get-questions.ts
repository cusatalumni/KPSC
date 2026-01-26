
// Vercel Serverless Function
// Path: /api/get-questions.ts

import { GoogleGenAI, Type } from "@google/genai";
import { readSheetData, appendSheetData } from './_lib/sheets-service.js';

// Define the structure of a question in the sheet
// Columns: id, topic, question, options (JSON), correctAnswerIndex, subject, difficulty
const RANGE = 'QuestionBank!A2:G'; 

interface QuizQuestion {
  id?: string;
  topic: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  subject: string;
  difficulty: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.VITE_API_KEY as string });

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function generateAndStoreQuestions(topic: string, count: number): Promise<QuizQuestion[]> {
    console.log(`[DB MISS] Generating ${count} new questions for: ${topic}`);
    try {
        const prompt = `Generate a JSON array of exactly ${count} high-quality Kerala PSC multiple-choice questions in Malayalam for the topic "${topic}".
        Include metadata: subject (History/Geography/Maths/English/Malayalam/Constitution), and difficulty (Easy/Moderate/PSC Level).
        Format: {id, topic, question, options, correctAnswerIndex, subject, difficulty}.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            id: { type: Type.STRING }, topic: { type: Type.STRING },
                            question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswerIndex: { type: Type.INTEGER },
                            subject: { type: Type.STRING },
                            difficulty: { type: Type.STRING }
                        }, required: ["id", "topic", "question", "options", "correctAnswerIndex", "subject", "difficulty"]
                    }
                }
            }
        });
        
        const generated = JSON.parse(response.text);
        
        // Prepare for Google Sheets insertion
        const valuesToAppend = generated.map((q: any) => [
            q.id || `gen_${Date.now()}_${Math.random()}`,
            q.topic,
            q.question,
            JSON.stringify(q.options),
            q.correctAnswerIndex,
            q.subject,
            q.difficulty
        ]);

        await appendSheetData('QuestionBank!A1', valuesToAppend);
        return generated;

    } catch (error) {
        console.error(`Generation failure:`, error);
        return [];
    }
}

export default async function handler(req: any, res: any) {
    const { topic, count } = req.query;
    const requestedCount = parseInt(count as string, 10) || 10;
    const requestedTopic = topic as string || '';

    if (!requestedTopic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        // 1. Fetch from Database (Google Sheets)
        const rows = await readSheetData(RANGE);
        
        const dbQuestions: QuizQuestion[] = rows.map(row => {
            try {
                return {
                    id: row[0],
                    topic: row[1],
                    question: row[2],
                    options: JSON.parse(row[3]),
                    correctAnswerIndex: parseInt(row[4], 10),
                    subject: row[5] || 'General',
                    difficulty: row[6] || 'Moderate'
                }
            } catch(e) { return null; }
        }).filter((q): q is QuizQuestion => q !== null && q.topic === requestedTopic);

        // 2. Check if we have enough questions
        if (dbQuestions.length >= requestedCount) {
            console.log(`[DB HIT] Serving ${requestedCount} questions from QuestionBank for: ${requestedTopic}`);
            return res.status(200).json(shuffleArray(dbQuestions).slice(0, requestedCount));
        }

        // 3. Fallback: Generate only the deficit if allowed, or just the whole batch
        // Since we want to REDUCE AI use, we only fill the gap.
        const deficit = requestedCount - dbQuestions.length;
        const newOnes = await generateAndStoreQuestions(requestedTopic, deficit);
        
        const finalResults = shuffleArray([...dbQuestions, ...newOnes]).slice(0, requestedCount);
        res.status(200).json(finalResults);

    } catch (error) {
        console.error('API Error: ' + error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
}
