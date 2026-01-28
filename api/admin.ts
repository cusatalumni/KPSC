
import { verifyAdmin } from "./_lib/clerk-auth.js";
import { runDailyUpdateScrapers, runBookScraper } from "./_lib/scraper-service.js";
import { clearAndWriteSheetData, appendSheetData } from './_lib/sheets-service.js';

declare var process: any;

function parseCsv(csv: string): any[][] {
    return csv.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.split(',').map(cell => cell.trim().replace(/^"(.*)"$/, '$1')));
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    // 1. Check if it's a Vercel Cron Job
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
        try {
            console.log("Cron job triggered: Running daily scrapers...");
            await runDailyUpdateScrapers();
            return res.status(200).json({ message: 'Cron: Daily scraping successful.' });
        } catch (error: any) {
            console.error("Cron failed:", error);
            return res.status(500).json({ message: 'Cron job failed', error: error.message });
        }
    }

    // 2. If not a cron, verify as Admin via Clerk (Dashboard Actions)
    if (req.method === 'POST') {
        try {
            await verifyAdmin(req);
        } catch (error: any) {
            return res.status(401).json({ message: error.message || 'Unauthorized' });
        }

        const { action, sheet, data, mode } = req.body;

        try {
            switch (action) {
                case 'run-daily':
                    runDailyUpdateScrapers().catch(console.error);
                    return res.status(202).json({ message: 'Scrapers started in background.' });
                case 'run-books':
                    runBookScraper().catch(console.error);
                    return res.status(202).json({ message: 'Book sync started in background.' });
                case 'csv-update':
                    if (!sheet || !data) return res.status(400).json({ message: 'Missing params' });
                    const rows = parseCsv(data);
                    
                    if (mode === 'append') {
                        await appendSheetData(`${sheet}!A1`, rows);
                        return res.status(200).json({ message: `Appended ${rows.length} rows to ${sheet}.` });
                    } else {
                        await clearAndWriteSheetData(`${sheet}!A2:Z`, rows);
                        return res.status(200).json({ message: `Updated ${sheet} with ${rows.length} rows (replaced old data).` });
                    }
                default:
                    return res.status(400).json({ message: 'Unknown action' });
            }
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

    return res.status(401).json({ message: 'Unauthorized access' });
}
