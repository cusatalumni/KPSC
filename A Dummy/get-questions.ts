// Vercel Serverless Function
// Path: /api/get-questions.ts

import { GoogleGenAI, Type } from "@google/genai";
import { readSheetData, appendSheetData } from './_lib/sheets-service.js';

// Range: id, topic, question, options (JSON), correctAnswerIndex, subject, difficulty
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

// Fix: Strictly use process.env.API_KEY and named parameter for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

async function generateAndStoreQuestions(topic: string, count: number): Promise<QuizQuestion[]> {
    console.log(`[REDUCING AI USE] Generating only deficit: ${count} for ${topic}`);
    try {
        const prompt = `Generate a JSON array of exactly ${count} high-quality Kerala PSC multiple-choice questions in Malayalam for the specific topic: "${topic}".
        Use official PSC pattern.
        Include metadata: subject (choose from: History, Geography, Indian Constitution, Quantitative Aptitude, Logical Reasoning, English, Malayalam), and difficulty (Easy, Moderate, PSC Level).
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
        
        const generated = JSON.parse(response.text || "[]");
        
        // Save to Database (Google Sheets) for future users
        const valuesToAppend = generated.map((q: any) => [
            q.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            topic,
            q.question,
            JSON.stringify(q.options),
            q.correctAnswerIndex,
            q.subject,
            q.difficulty
        ]);

        await appendSheetData('QuestionBank!A1', valuesToAppend);
        return generated;

    } catch (error) {
        console.error(`Gemini Generation failure:`, error);
        return [];
    }
}

export default async function handler(req: any, res: any) {
    const { topic, count } = req.query;
    const requestedCount = parseInt(count as string, 10) || 10;
    const requestedTopic = (topic as string || '').trim();

    if (!requestedTopic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        // 1. Fetch ALL questions from database
        const rows = await readSheetData(RANGE);
        
        // 2. Filter for matching topic
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
        }).filter((q): q is QuizQuestion => q !== null && q.topic.toLowerCase() === requestedTopic.toLowerCase());

        // 3. Check if we have enough
        if (dbQuestions.length >= requestedCount) {
            console.log(`[DATABASE HIT] Found ${dbQuestions.length} questions in bank for ${requestedTopic}.`);
            return res.status(200).json(shuffleArray(dbQuestions).slice(0, requestedCount));
        }

        // 4. Fallback: Generate only the missing number of questions
        const deficit = requestedCount - dbQuestions.length;
        const newOnes = await generateAndStoreQuestions(requestedTopic, deficit);
        
        const finalResults = shuffleArray([...dbQuestions, ...newOnes]).slice(0, requestedCount);
        res.status(200).json(finalResults);

    } catch (error) {
        console.error('Question Retrieval API Error: ' + error);
        res.status(500).json({ error: 'Failed to retrieve questions from bank.' });
    }
}