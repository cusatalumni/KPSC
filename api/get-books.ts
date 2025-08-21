// Vercel Serverless Function
// Path: /api/get-books.ts

import { readSheetData } from './_lib/sheets-service.js';

const RANGE = 'Bookstore!A2:E'; // id, title, author, imageUrl, amazonLink

export default async function handler(req: any, res: any) {
    try {
        const rows = await readSheetData(RANGE);
        
        const books = rows.map(row => ({
            id: row[0] || '',
            title: row[1] || '',
            author: row[2] || '',
            imageUrl: row[3] || '',
            amazonLink: row[4] || '#',
        }));
        res.status(200).json(books);
        
    } catch (error) {
        console.error('The API returned an error: ' + error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
}