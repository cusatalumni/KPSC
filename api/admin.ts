
// Vercel Serverless Function: Admin Hub
// Path: /api/admin.ts

import { verifyAdmin } from "./_lib/clerk-auth.js";
import { runDailyUpdateScrapers, runBookScraper } from "./_lib/scraper-service.js";
import { clearAndWriteSheetData } from './_lib/sheets-service.js';

function parseCsv(csv: string): any[][] {
    return csv.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.split(',').map(cell => cell.trim().replace(/^"(.*)"$/, '$1')));
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    try {
        await verifyAdmin(req);
    } catch (error: any) {
        return res.status(401).json({ message: error.message || 'Unauthorized' });
    }

    const { action, sheet, data } = req.body;

    try {
        switch(action) {
            case 'run-daily':
                runDailyUpdateScrapers().catch(e => console.error("BG Daily Scrape Error:", e));
                return res.status(202).json({ message: 'Daily scraping started in background.' });
            case 'run-books':
                runBookScraper().catch(e => console.error("BG Book Scrape Error:", e));
                return res.status(202).json({ message: 'Book scraping started in background.' });
            case 'csv-update':
                if (!sheet || !data) return res.status(400).json({ message: 'Sheet and Data required.' });
                const values = parseCsv(data);
                await clearAndWriteSheetData(`${sheet}!A2:Z`, values);
                return res.status(200).json({ message: `Successfully updated ${sheet} with ${values.length} rows.` });
            default:
                return res.status(400).json({ message: 'Unknown action.' });
        }
    } catch (error: any) {
        res.status(500).json({ message: 'Admin Task Failed', error: error.message });
    }
}
