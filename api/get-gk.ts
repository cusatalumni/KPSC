// Vercel Serverless Function
// Path: /api/get-gk.ts

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
const RANGE = 'GK!A2:C';

export default async function handler(req: any, res: any) {
    try {
        const sheets = await getSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values;
        if (rows && rows.length) {
            const items = rows.map(row => ({
                id: row[0] || '',
                fact: row[1] || '',
                category: row[2] || 'General',
            }));
            res.status(200).json(items);
        } else {
            res.status(200).json([]);
        }
    } catch (error) {
        console.error('The API returned an error: ' + error);
        res.status(500).json({ error: 'Failed to fetch GK data' });
    }
}
