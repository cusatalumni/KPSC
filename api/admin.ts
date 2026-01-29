
import { verifyAdmin } from "./_lib/clerk-auth.js";
import { runDailyUpdateScrapers, runBookScraper } from "./_lib/scraper-service.js";
import { readSheetData, clearAndWriteSheetData, appendSheetData, deleteRowById, findAndUpsertRow } from './_lib/sheets-service.js';

declare var process: any;

const AFFILIATE_TAG = 'tag=malayalambooks-21';

function parseCsv(csv: string): any[][] {
    return csv.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
            return matches ? matches.map(cell => cell.trim().replace(/^"(.*)"$/, '$1')) : [];
        });
}

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

        const { action, sheet, data, mode, id, bookData, qData } = req.body;

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
                case 'update-book':
                    if (!bookData || !bookData.id) return res.status(400).json({ message: 'Missing book data' });
                    
                    const rowToUpdate = [
                        bookData.id,
                        bookData.title,
                        bookData.author,
                        (bookData.imageUrl || '').trim(),
                        fixAffiliateLink(bookData.amazonLink)
                    ];
                    
                    await findAndUpsertRow('Bookstore', 0, bookData.id, rowToUpdate);
                    return res.status(200).json({ message: 'Book updated successfully.' });

                case 'add-question':
                    if (!qData || !qData.question) return res.status(400).json({ message: 'Missing question data' });
                    const qId = qData.id || `q_${Date.now()}`;
                    const qRow = [
                        qId,
                        qData.topic,
                        qData.question,
                        JSON.stringify(qData.options),
                        qData.correctAnswerIndex,
                        qData.subject,
                        qData.difficulty
                    ];
                    await appendSheetData('QuestionBank!A1', [qRow]);
                    return res.status(200).json({ message: 'Question added to bank successfully.' });

                case 'fix-all-affiliates':
                    const currentBooksAff = await readSheetData('Bookstore!A2:E');
                    const fixedBooksAff = currentBooksAff.map(row => {
                        if (row.length >= 5) {
                            row[4] = fixAffiliateLink(row[4]);
                        }
                        return row;
                    });
                    await clearAndWriteSheetData('Bookstore!A2:E', fixedBooksAff);
                    return res.status(200).json({ message: `Successfully updated affiliate links.` });
                
                case 'csv-update':
                    if (!sheet || !data) return res.status(400).json({ message: 'Missing params' });
                    let rows = parseCsv(data);
                    
                    if (sheet === 'Bookstore') {
                        rows = rows.map(row => {
                            if (row.length >= 5) row[4] = fixAffiliateLink(row[4]);
                            return row;
                        });
                    }
                    
                    if (mode === 'append') {
                        await appendSheetData(`${sheet}!A1`, rows);
                        return res.status(200).json({ message: `Appended ${rows.length} rows.` });
                    } else {
                        await clearAndWriteSheetData(`${sheet}!A2:Z2000`, rows);
                        return res.status(200).json({ message: `Updated ${sheet} successfully.` });
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
