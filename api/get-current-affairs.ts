// Vercel Serverless Function
// Path: /api/get-current-affairs.ts

import { readSheetData } from './_lib/sheets-service';

const RANGE = 'CurrentAffairs!A2:D';

export default async function handler(req: any, res: any) {
    try {
        const rows = await readSheetData(RANGE);

        const items = rows.map(row => ({
            id: row[0] || '',
            title: row[1] || '',
            source: row[2] || '',
            date: row[3] || '',
        }));
        res.status(200).json(items);
        
    } catch (error) {
        console.error('The API returned an error: ' + error);
        res.status(500).json({ error: 'Failed to fetch current affairs' });
    }
}