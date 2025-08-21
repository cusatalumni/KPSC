// Vercel Serverless Function
// Path: /api/get-live-updates.ts

import { readSheetData } from './_lib/sheets-service';

const RANGE = 'LiveUpdates!A2:D';

export default async function handler(req: any, res: any) {
    try {
        const rows = await readSheetData(RANGE);
        
        const updates = rows.map(row => ({
            title: row[0] || '',
            url: row[1] || '#',
            section: row[2] || 'Update',
            published_date: row[3] || '',
        }));
        res.status(200).json(updates);
       
    } catch (error) {
        console.error('The API returned an error: ' + error);
        res.status(500).json({ error: 'Failed to fetch live updates' });
    }
}