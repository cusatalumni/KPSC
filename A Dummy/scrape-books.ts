// Vercel Serverless Function - Cron Job
// Path: /api/scrape-books.ts

import { runBookScraper } from "./_lib/scraper-service.js";

export default async function handler(req: any, res: any) {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        await runBookScraper();
        res.status(200).json({ message: 'Book scraping successful.' });

    } catch (error) {
        console.error('Failed to run book scraping job:', error);
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
}