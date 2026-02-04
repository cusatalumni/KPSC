
import { verifyAdmin } from "./_lib/clerk-auth.js";
import { findAndUpsertRow, deleteRowById, appendSheetData, clearAndWriteSheetData, readSheetData } from './_lib/sheets-service.js';
import { runDailyUpdateScrapers, runBookScraper } from "./_lib/scraper-service.js";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { action, sheet, id, exam, syllabus, book, question, data, mode, resultData, examsPayload, syllabusPayload } = req.body;

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
                    // Try to read a small range to confirm credentials work
                    await readSheetData('Exams!A1:A1');
                    return res.status(200).json({ 
                        message: 'Google Sheets Connection Verified! You are ready to manage content.'
                    });
                } catch (e: any) {
                    console.error("Test Connection Fail:", e.message);
                    return res.status(500).json({ message: `Connection failed: ${e.message}` });
                }

            case 'export-static':
                if (!examsPayload || !syllabusPayload) {
                    throw new Error('Payload missing for export. Please refresh the page and try again.');
                }
                
                // Write static exams (A to H: id, ml, en, desc_ml, desc_en, cat, level, icon)
                const eRows = examsPayload.map((e: any) => [
                    e.id, 
                    e.title_ml, 
                    e.title_en || '', 
                    e.description_ml || '', 
                    e.description_en || '', 
                    e.category || 'General', 
                    e.level || 'Preliminary', 
                    e.icon_type || 'book'
                ]);
                await clearAndWriteSheetData('Exams!A2:H', eRows);
                
                // Write static syllabus (A to F: id, exam_id, title, questions, duration, topic)
                const sRows = syllabusPayload.map((s: any) => [
                    s.id, 
                    s.exam_id, 
                    s.title, 
                    s.questions, 
                    s.duration, 
                    s.topic
                ]);
                await clearAndWriteSheetData('Syllabus!A2:F', sRows);
                
                return res.status(200).json({ message: 'Default Exam and Syllabus data has been restored to your Google Sheet.' });

            case 'run-daily-scraper':
                await runDailyUpdateScrapers();
                return res.status(200).json({ message: 'Daily content scraper finished successfully.' });

            case 'run-book-scraper':
                await runBookScraper();
                return res.status(200).json({ message: 'Amazon bookstore sync finished successfully.' });

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
                const csvRows = data.split('\n')
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
                    await appendSheetData(`${sheet}!A1`, csvRows); 
                } else { 
                    await clearAndWriteSheetData(`${sheet}!A2`, csvRows); 
                }
                return res.status(200).json({ message: 'Bulk data imported successfully.' });

            default:
                return res.status(400).json({ message: 'Invalid action.' });
        }
    } catch (error: any) {
        console.error("Admin API Master Error:", error.message);
        return res.status(500).json({ message: `Server Error: ${error.message}` });
    }
}
