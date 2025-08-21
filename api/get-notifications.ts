// Vercel Serverless Function
// Path: /api/get-notifications.ts

import { readSheetData } from './_lib/sheets-service';

const RANGE = 'Notifications!A2:E'; // Assuming data is in columns A to E, starting from row 2

export default async function handler(req: any, res: any) {
    try {
        const rows = await readSheetData(RANGE);
        
        const notifications = rows.map(row => ({
            id: row[0] || '',
            title: row[1] || '',
            categoryNumber: row[2] || '',
            lastDate: row[3] || '',
            link: row[4] || '#',
        }));
        res.status(200).json(notifications);
        
    } catch (error) {
        console.error('The API returned an error: ' + error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
}