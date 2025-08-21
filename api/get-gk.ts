// Vercel Serverless Function
// Path: /api/get-gk.ts

import { readSheetData } from './_lib/sheets-service';

const RANGE = 'GK!A2:C';

export default async function handler(req: any, res: any) {
    try {
        const rows = await readSheetData(RANGE);
        
        const items = rows.map(row => ({
            id: row[0] || '',
            fact: row[1] || '',
            category: row[2] || 'General',
        }));
        res.status(200).json(items);
       
    } catch (error) {
        console.error('The API returned an error: ' + error);
        res.status(500).json({ error: 'Failed to fetch GK data' });
    }
}