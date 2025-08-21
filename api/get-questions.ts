// Vercel Serverless Function
// Path: /api/get-questions.ts

import { GoogleGenAI, Type } from "@google/genai";
import { readSheetData, appendSheetData } from './_lib/sheets-service';

// Define a local type to avoid frontend dependency issues
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  topic: string;
}

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.VITE_API_KEY as string });

const RANGE = 'QuestionBank!A2:E'; // id, topic, question, options, correctAnswerIndex

// Function to shuffle an array
function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function generateAndStoreQuestions(topic: string, count: number): Promise<QuizQuestion[]> {
    console.log(`Generating ${count} new questions for topic: ${topic}`);
    try {
        const prompt = `Generate a JSON array of exactly ${count} unique, high-quality multiple-choice questions in Malayalam suitable for a Kerala PSC exam on the specific topic "${topic}".
        Each question object must have 'id' (a unique uuid string), 'topic' (must be exactly "${topic}"), 'question' (string), 'options' (an array of 4 strings), and 'correctAnswerIndex' (a 0-based integer). Ensure questions are relevant, distinct, and challenging.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            id: { type: Type.STRING }, topic: { type: Type.STRING },
                            question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswerIndex: { type: Type.INTEGER }
                        }, required: ["id", "topic", "question", "options", "correctAnswerIndex"]
                    }
                }
            }
        });
        const newQuestionsRaw = JSON.parse(response.text);

        const valuesToAppend = newQuestionsRaw.map((item: any) => [item.id, item.topic, item.question, JSON.stringify(item.options), item.correctAnswerIndex]);

        await appendSheetData('QuestionBank!A1', valuesToAppend);
        console.log(`Successfully generated and stored ${valuesToAppend.length} new questions for topic "${topic}".`);
        
        // Return the questions in the correct format for the frontend
        return newQuestionsRaw.map((item: any): QuizQuestion => ({
            topic: item.topic,
            question: item.question,
            options: item.options,
            correctAnswerIndex: parseInt(item.correctAnswerIndex, 10),
        }));

    } catch (error) {
        console.error(`Failed to generate and store questions for topic "${topic}":`, error);
        return []; // Return empty array on failure
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
        const rows = await readSheetData(RANGE);
        
        const allQuestions: QuizQuestion[] = rows.map(row => {
            try {
                return {
                    topic: row[1] || '', 
                    question: row[2] || '',
                    options: JSON.parse(row[3] || '[]'),
                    correctAnswerIndex: parseInt(row[4], 10),
                }
            } catch(e) { return null; }
        }).filter((q): q is QuizQuestion => q !== null && typeof q.correctAnswerIndex === 'number');

        let filteredQuestions = allQuestions.filter(q => q && q.topic === requestedTopic);
        
        const questionsFound = filteredQuestions.length;
        if (questionsFound < requestedCount) {
            const questionsToGenerate = requestedCount - questionsFound;
            const newlyGeneratedQuestions = await generateAndStoreQuestions(requestedTopic, questionsToGenerate);
            filteredQuestions = [...filteredQuestions, ...newlyGeneratedQuestions];
        }

        const shuffled = shuffleArray(filteredQuestions);
        const result = shuffled.slice(0, requestedCount);
        
        res.status(200).json(result);

    } catch (error) {
        console.error('The API returned an error: ' + error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
}