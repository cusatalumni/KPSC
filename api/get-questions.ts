// Vercel Serverless Function
// Path: /api/get-questions.ts

import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.VITE_API_KEY as string });

const READ_SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const WRITE_SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getSheetsClient(scopes: string[]) {
    const auth = new GoogleAuth({
        scopes,
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        },
    });
    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client as any });
}

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = 'QuestionBank!A2:E'; // id, topic, question, options, correctAnswerIndex

// Function to shuffle an array
function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function generateAndStoreMissingQuestions(topic: string, count: number) {
    console.log(`Generating ${count} missing questions for topic: ${topic}`);
    try {
        const prompt = `Generate a JSON array of exactly ${count} unique multiple-choice questions in Malayalam suitable for a Kerala PSC exam on the specific topic "${topic}".
        Each question object must have 'id' (a unique uuid string), 'topic' (must be exactly "${topic}"), 'question' (string), 'options' (an array of 4 strings), and 'correctAnswerIndex' (a 0-based integer).`;

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
        const newQuestions = JSON.parse(response.text);
        const valuesToAppend = newQuestions.map((item: any) => [item.id, item.topic, item.question, JSON.stringify(item.options), item.correctAnswerIndex]);

        if (valuesToAppend.length > 0) {
            const sheets = await getSheetsClient(WRITE_SCOPES);
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'QuestionBank!A1',
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: valuesToAppend },
            });
            console.log(`Successfully appended ${valuesToAppend.length} new questions for topic "${topic}".`);
        }
    } catch (error) {
        console.error(`Failed to generate and store questions for topic "${topic}":`, error);
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
        const sheets = await getSheetsClient(READ_SCOPES);
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values || [];
        const allQuestions = rows.map(row => {
            try {
                return {
                    id: row[0] || '', topic: row[1] || '', question: row[2] || '',
                    options: JSON.parse(row[3] || '[]'),
                    correctAnswerIndex: parseInt(row[4], 10),
                }
            } catch(e) { return null; }
        }).filter(q => q !== null && typeof q.correctAnswerIndex === 'number');

        const filteredQuestions = allQuestions.filter(q => q && q.topic === requestedTopic);
        
        const shuffled = shuffleArray(filteredQuestions);
        const result = shuffled.slice(0, requestedCount);
        
        // --- Dual-Mode Logic ---
        const questionsFound = result.length;
        if (questionsFound < requestedCount) {
            const questionsToGenerate = requestedCount - questionsFound;
            // Respond immediately with what we have
            res.status(200).json(result);
            // Then, trigger the background generation
            generateAndStoreMissingQuestions(requestedTopic, questionsToGenerate);
        } else {
            // We have enough questions, just respond
            res.status(200).json(result);
        }

    } catch (error) {
        console.error('The API returned an error: ' + error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
}