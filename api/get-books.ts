// Vercel Serverless Function
// Path: /api/get-books.ts

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
const RANGE = 'Bookstore!A2:E'; // id, title, author, imageUrl, amazonLink

export default async function handler(req: any, res: any) {
    try {
        const sheets = await getSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values;
        if (rows && rows.length) {
            const books = rows.map(row => ({
                id: row[0] || '',
                title: row[1] || '',
                author: row[2] || '',
                imageUrl: row[3] || '',
                amazonLink: row[4] || '#',
            }));
            res.status(200).json(books);
        } else {
            res.status(200).json([]);
        }
    } catch (error) {
        console.error('The API returned an error: ' + error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
}
