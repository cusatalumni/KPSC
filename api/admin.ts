
import { verifyAdmin } from "./_lib/clerk-auth.js";
import { findAndUpsertRow, deleteRowById, appendSheetData, clearAndWriteSheetData, readSheetData } from './_lib/sheets-service.js';
import { runDailyUpdateScrapers, runBookScraper } from "./_lib/scraper-service.js";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { action, sheet, id, exam, syllabus, book, question, data, mode, resultData } = req.body;

    // Handle results saving separately (accessible to non-admins)
    if (action === 'save-result') {
        try {
            const timestamp = new Date().toISOString();
            const resRow = [
                resultData.id || `res_${Date.now()}`, 
                resultData.userId || 'guest', 
                resultData.userEmail || 'guest@example.com', 
                resultData.testTitle, 
                resultData.score, 
                resultData.total, 
                timestamp
            ];
            await appendSheetData('Results!A1', [resRow]);
            return res.status(200).json({ message: 'Result saved.' });
        } catch (e: any) { 
            console.error("Result save error:", e.message);
            return res.status(500).json({ message: `Failed to save result: ${e.message}` }); 
        }
    }

    // Verify Admin for all other actions
    try {
        await verifyAdmin(req);
    } catch (error: any) {
        return res.status(401).json({ message: error.message || 'Unauthorized access.' });
    }

    try {
        switch (action) {
            case 'test-connection':
                try {
                    // Try to read one cell to verify identity
                    const test = await readSheetData('Exams!A1:A1');
                    return res.status(200).json({ 
                        message: 'Google Sheets Identity Verified Successfully!', 
                        data: test 
                    });
                } catch (e: any) {
                    console.error("Test connection failed:", e.message);
                    return res.status(500).json({ message: `Identity verification failed: ${e.message}. Tip: Check if service account is shared with the sheet as Editor.` });
                }

            case 'run-daily-scraper':
                await runDailyUpdateScrapers();
                return res.status(200).json({ message: 'System content updated successfully.' });

            case 'run-book-scraper':
                await runBookScraper();
                return res.status(200).json({ message: 'Bookstore inventory synced with Amazon.' });

            case 'update-exam':
                const examRow = [
                    exam.id, 
                    exam.title_ml, 
                    exam.title_en || '', 
                    exam.description_ml || '', 
                    exam.description_en || '', 
                    exam.category || 'General', 
                    exam.level || 'Preliminary', 
                    exam.icon_type || 'book'
                ];
                await findAndUpsertRow('Exams', exam.id, examRow);
                return res.status(200).json({ message: 'Exam information saved.' });

            case 'update-syllabus':
                const sylRow = [
                    syllabus.id, 
                    syllabus.exam_id, 
                    syllabus.title, 
                    syllabus.questions, 
                    syllabus.duration, 
                    syllabus.topic
                ];
                await findAndUpsertRow('Syllabus', syllabus.id, sylRow);
                return res.status(200).json({ message: 'Syllabus topic updated.' });

            case 'update-book':
                const bRow = [
                    book.id || `b_${Date.now()}`, 
                    book.title, 
                    book.author || '', 
                    book.imageUrl || '', 
                    book.link
                ];
                await findAndUpsertRow('Bookstore', book.id || bRow[0], bRow);
                return res.status(200).json({ message: 'Book details saved.' });

            case 'delete-row':
                if (!sheet || !id) throw new Error('Target sheet and ID are required.');
                await deleteRowById(sheet, id);
                return res.status(200).json({ message: `Entry removed from ${sheet}.` });

            case 'csv-update':
                const rows = data.split('\n')
                    .filter((l:string) => l.trim() !== '')
                    .map((line: string) => {
                        const parts = line.split(',').map(p => p.trim());
                        if (sheet === 'QuestionBank') {
                            const opts = parts[2] ? JSON.stringify(parts[2].split('|')) : '[]';
                            return [`q_bulk_${Date.now()}_${Math.random()}`, parts[0], parts[1], opts, parts[3], parts[4], parts[5]];
                        }
                        return parts;
                    });
                
                if (mode === 'append') { 
                    await appendSheetData(`${sheet}!A1`, rows); 
                } else { 
                    await clearAndWriteSheetData(`${sheet}!A2`, rows); 
                }
                return res.status(200).json({ message: 'Bulk data imported.' });

            default:
                return res.status(400).json({ message: 'Invalid action.' });
        }
    } catch (error: any) {
        console.error("Admin API Master Error:", error.message);
        return res.status(500).json({ message: error.message });
    }
}
