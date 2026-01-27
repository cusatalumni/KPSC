// Vercel Serverless Function - Cron Job
// Path: /api/scrape-updates.ts

import { runDailyUpdateScrapers } from "./_lib/scraper-service.js";

export default async function handler(req: any, res: any) {
    // Protect the endpoint with a secret
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        await runDailyUpdateScrapers();
        res.status(200).json({ message: 'Daily scraping and update successful.' });
    } catch (error) {
        console.error('Failed to run daily scraping cron job:', error);
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
}