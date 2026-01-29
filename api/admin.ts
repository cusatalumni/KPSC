
import { verifyAdmin } from "./_lib/clerk-auth.js";
import { runDailyUpdateScrapers, runBookScraper, generateCoverForBook } from "./_lib/scraper-service.js";
import { readSheetData, clearAndWriteSheetData, appendSheetData, deleteRowById } from './_lib/sheets-service.js';

declare var process: any;

const AFFILIATE_TAG = 'tag=malayalambooks-21';

/**
 * Enhanced CSV parser that handles quoted strings containing commas.
 */
function parseCsv(csv: string): any[][] {
    return csv.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            // Match quoted fields or non-comma sequences
            const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
            return matches ? matches.map(cell => cell.trim().replace(/^"(.*)"$/, '$1')) : [];
        });
}

/**
 * Ensures an Amazon link has the affiliate tag.
 */
function fixAffiliateLink(url: string): string {
    if (!url || typeof url !== 'string') return url;
    const trimmed = url.trim();
    if (trimmed.includes('amazon.in') && !trimmed.includes(AFFILIATE_TAG)) {
        return trimmed + (trimmed.includes('?') ? '&' : '?') + AFFILIATE_TAG;
    }
    return trimmed;
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
        try {
            await runDailyUpdateScrapers();
            return res.status(200).json({ message: 'Cron: Daily scraping successful.' });
        } catch (error: any) {
            console.error("Cron failed:", error);
            return res.status(500).json({ message: 'Cron job failed', error: error.message });
        }
    }

    if (req.method === 'POST') {
        try {
            await verifyAdmin(req);
        } catch (error: any) {
            return res.status(401).json({ message: error.message || 'Unauthorized' });
        }

        const { action, sheet, data, mode, id } = req.body;

        try {
            switch (action) {
                case 'run-daily':
                    runDailyUpdateScrapers().catch(console.error);
                    return res.status(202).json({ message: 'Scrapers started in background.' });
                case 'run-books':
                    runBookScraper().catch(console.error);
                    return res.status(202).json({ message: 'Book sync started in background.' });
                case 'delete-row':
                    if (!sheet || !id) return res.status(400).json({ message: 'Missing sheet or id' });
                    await deleteRowById(sheet, id);
                    return res.status(200).json({ message: 'Row deleted successfully.' });
                case 'fix-all-affiliates':
                    // Read all books, fix links, and write back
                    const currentBooks = await readSheetData('Bookstore!A2:E');
                    const fixedBooks = currentBooks.map(row => {
                        if (row.length >= 5) {
                            row[4] = fixAffiliateLink(row[4]);
                        }
                        return row;
                    });
                    await clearAndWriteSheetData('Bookstore!A2:E', fixedBooks);
                    return res.status(200).json({ message: `Successfully updated affiliate links for ${fixedBooks.length} books.` });
                case 'csv-update':
                    if (!sheet || !data) return res.status(400).json({ message: 'Missing params' });
                    
                    let rows = parseCsv(data);
                    
                    // Special processing for Bookstore
                    if (sheet === 'Bookstore') {
                        // Limit batch size to 10 for AI cover generation during CSV update to avoid lambda timeouts
                        const processedRows = [];
                        for (const row of rows) {
                            if (row.length >= 5) {
                                // 1. Fix Affiliate Link
                                row[4] = fixAffiliateLink(row[4]);
                                
                                // 2. Check if image URL is missing or looks like a placeholder
                                const title = row[1];
                                const author = row[2];
                                const currentImg = (row[3] || '').trim();
                                
                                if (!currentImg || currentImg === '' || currentImg.includes('via.placeholder.com')) {
                                    // Generate AI cover on the fly
                                    const aiCover = await generateCoverForBook(title, author);
                                    if (aiCover) row[3] = aiCover;
                                }
                            }
                            processedRows.push(row);
                        }
                        rows = processedRows;
                    }
                    
                    if (mode === 'append') {
                        await appendSheetData(`${sheet}!A1`, rows);
                        return res.status(200).json({ message: `Appended ${rows.length} rows to ${sheet}. AI covers generated where missing.` });
                    } else {
                        await clearAndWriteSheetData(`${sheet}!A2:Z2000`, rows);
                        return res.status(200).json({ message: `Updated ${sheet} with ${rows.length} rows. AI covers generated where missing.` });
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
