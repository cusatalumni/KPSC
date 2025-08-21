// Vercel Serverless Function
// Path: /api/get-questions.ts

import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

async function getSheetsClient() {
    const auth = new GoogleAuth({
        scopes: SCOPES,
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


export default async function handler(req: any, res: any) {
    const { topic, count } = req.query;
    const requestedCount = parseInt(count as string, 10) || 10;
    const requestedTopic = topic as string || '';

    if (!requestedTopic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        const sheets = await getSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values;
        if (rows && rows.length) {
            let questions = rows.map(row => {
                try {
                    return {
                        id: row[0] || '',
                        topic: row[1] || '',
                        question: row[2] || '',
                        // Options are stored as a JSON string, so we need to parse them
                        options: JSON.parse(row[3] || '[]'),
                        correctAnswerIndex: parseInt(row[4], 10),
                    }
                } catch(e) {
                    console.error("Failed to parse row:", row, e);
                    return null;
                }
            }).filter(q => q !== null && typeof q.correctAnswerIndex === 'number');

            // Filter by topic
            // The topic from the frontend might be "Exam Title - Topic", so we check if the question topic is included
            const filteredQuestions = questions.filter(q => 
                q && q.topic && requestedTopic.includes(q.topic)
            );

            // Shuffle and take the requested number of questions
            const shuffled = shuffleArray(filteredQuestions);
            const result = shuffled.slice(0, requestedCount);
            
            res.status(200).json(result);

        } else {
            res.status(200).json([]);
        }
    } catch (error) {
        console.error('The API returned an error: ' + error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
}