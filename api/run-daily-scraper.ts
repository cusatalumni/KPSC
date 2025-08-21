// Vercel Serverless Function - Admin Trigger
// Path: /api/run-daily-scraper.ts

import { verifyAdmin } from "./_lib/clerk-auth";
import { runDailyUpdateScrapers } from "./_lib/scraper-service";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        await verifyAdmin(req);
    } catch (error: any) {
        return res.status(401).json({ message: error.message || 'Unauthorized' });
    }

    try {
        // Do not await this, so the request can return immediately
        runDailyUpdateScrapers().catch(err => {
            console.error("Error during background daily scraper execution:", err);
        });
        
        // Respond to the admin immediately that the job has started
        res.status(202).json({ message: 'Daily scraping job started successfully in the background.' });

    } catch (error: any) {
        console.error('Failed to start daily scraping job:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}