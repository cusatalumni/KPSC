
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
        switch (action) {
            case 'run-daily':
                runDailyUpdateScrapers().catch(console.error);
                return res.status(202).json({ message: 'Scrapers started.' });
            case 'run-books':
                runBookScraper().catch(console.error);
                return res.status(202).json({ message: 'Book sync started.' });
            case 'csv-update':
                if (!sheet || !data) return res.status(400).json({ message: 'Missing params' });
                const rows = parseCsv(data);
                await clearAndWriteSheetData(`${sheet}!A2:Z`, rows);
                return res.status(200).json({ message: `Updated ${sheet} with ${rows.length} rows.` });
            default:
                return res.status(400).json({ message: 'Unknown action' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
