
// Vercel Serverless Function
// Path: /api/update-from-csv.ts

import { verifyAdmin } from "./_lib/clerk-auth.js";
import { clearAndWriteSheetData } from './_lib/sheets-service.js';

/**
 * Parses a simple CSV string into a 2D array.
 * Note: This is a basic implementation. For production, consider 'csv-parse' library.
 */
function parseCsv(csv: string): any[][] {
    return csv.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            // Very basic comma split, handle quotes if needed
            return line.split(',').map(cell => cell.trim().replace(/^"(.*)"$/, '$1'));
        });
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        await verifyAdmin(req);
    } catch (error: any) {
        return res.status(401).json({ message: error.message || 'Unauthorized' });
    }

    const { sheet, data } = req.body;

    if (!sheet || !data) {
        return res.status(400).json({ message: 'Sheet name and data are required.' });
    }

    try {
        const values = parseCsv(data);
        const range = `${sheet}!A2:Z`; // Start writing from the second row to preserve headers
        
        await clearAndWriteSheetData(range, values);
        
        res.status(200).json({ message: `Successfully updated ${sheet} with ${values.length} rows.` });

    } catch (error: any) {
        console.error('Failed to update from CSV:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
