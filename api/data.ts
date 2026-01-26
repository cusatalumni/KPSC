
// Vercel Serverless Function: Data Hub
// Path: /api/data.ts

import { readSheetData } from './_lib/sheets-service.js';

const RANGES: Record<string, string> = {
    notifications: 'Notifications!A2:E',
    updates: 'LiveUpdates!A2:D',
    affairs: 'CurrentAffairs!A2:D',
    gk: 'GK!A2:C',
    books: 'Bookstore!A2:E'
};

export default async function handler(req: any, res: any) {
    const { type } = req.query;

    if (!type || !RANGES[type as string]) {
        return res.status(400).json({ error: 'Invalid data type requested.' });
    }

    try {
        const rows = await readSheetData(RANGES[type as string]);
        
        switch(type) {
            case 'notifications':
                return res.status(200).json(rows.map(r => ({ id: r[0], title: r[1], categoryNumber: r[2], lastDate: r[3], link: r[4] || '#' })));
            case 'updates':
                return res.status(200).json(rows.map(r => ({ title: r[0], url: r[1] || '#', section: r[2] || 'Update', published_date: r[3] })));
            case 'affairs':
                return res.status(200).json(rows.map(r => ({ id: r[0], title: r[1], source: r[2], date: r[3] })));
            case 'gk':
                return res.status(200).json(rows.map(r => ({ id: r[0], fact: r[1], category: r[2] || 'General' })));
            case 'books':
                return res.status(200).json(rows.map(r => ({ id: r[0], title: r[1], author: r[2], imageUrl: r[3], amazonLink: r[4] || '#' })));
            default:
                return res.status(404).json({ error: 'Not found' });
        }
    } catch (error) {
        console.error(`API Data Error (${type}):`, error);
        res.status(500).json({ error: 'Failed to fetch data from bank.' });
    }
}
