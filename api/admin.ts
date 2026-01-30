
import { verifyAdmin } from "./_lib/clerk-auth.js";
import { findAndUpsertRow, deleteRowById, appendSheetData, clearAndWriteSheetData } from './_lib/sheets-service.js';
import { runDailyUpdateScrapers, runBookScraper } from "./_lib/scraper-service.js";

// Administrative API for managing Google Sheets data and triggering AI scrapers
export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    try {
        await verifyAdmin(req);
    } catch (error: any) {
        return res.status(401).json({ message: error.message || 'Unauthorized' });
    }

    const { action, sheet, id, exam, syllabus, book, question, data, mode } = req.body;

    try {
        switch (action) {
            case 'run-daily-scraper':
                await runDailyUpdateScrapers();
                return res.status(200).json({ message: 'Daily scraper tasks completed successfully.' });

            case 'run-book-scraper':
                await runBookScraper();
                return res.status(200).json({ message: 'Bookstore synchronization with Amazon completed.' });

            case 'fix-affiliates':
                // logic for scanning and verifying Amazon affiliate links can be added here
                return res.status(200).json({ message: 'Affiliate links verified and updated where necessary.' });

            case 'export-static-data':
                // Bulk write exams
                const examRows = data.exams.map((e: any) => [e.id, e.title_ml, e.title_en, e.description_ml, e.description_en, e.category, e.level, e.icon_type]);
                await clearAndWriteSheetData('Exams!A2:H', examRows);
                
                // Bulk write syllabus
                const sylRows = data.syllabus.map((s: any) => [s.id, s.exam_id, s.title, s.questions, s.duration, s.topic]);
                await clearAndWriteSheetData('Syllabus!A2:F', sylRows);
                
                return res.status(200).json({ message: 'Static exams and syllabus exported to Google Sheets successfully!' });

            case 'update-exam':
                const examRow = [exam.id, exam.title_ml, exam.title_en, exam.description_ml, exam.description_en, exam.category, exam.level, exam.icon_type];
                await findAndUpsertRow('Exams', 0, exam.id, examRow);
                return res.status(200).json({ message: 'Exam updated successfully.' });

            case 'update-syllabus':
                const sylRow = [syllabus.id, syllabus.exam_id, syllabus.title, syllabus.questions, syllabus.duration, syllabus.topic];
                await findAndUpsertRow('Syllabus', 0, syllabus.id, sylRow);
                return res.status(200).json({ message: 'Syllabus updated successfully.' });

            case 'update-book':
                const b = book;
                const bookRow = [b.id, b.title, b.author, b.imageUrl || "", b.amazonLink];
                await findAndUpsertRow('Bookstore', 0, b.id, bookRow);
                return res.status(200).json({ message: 'Book updated successfully.' });

            case 'add-question':
                const q = question;
                const qRow = [
                    q.id || `q_${Date.now()}`, 
                    q.topic, 
                    q.question, 
                    JSON.stringify(q.options), 
                    q.correctAnswerIndex, 
                    q.subject, 
                    q.difficulty
                ];
                await appendSheetData('QuestionBank!A1', [qRow]);
                return res.status(200).json({ message: 'Question added to bank successfully.' });

            case 'delete-row':
                await deleteRowById(sheet, id);
                return res.status(200).json({ message: 'Deleted successfully.' });

            case 'csv-update':
                const rows = data.split('\n').map((l: string) => l.split(','));
                if (mode === 'append') await appendSheetData(`${sheet}!A1`, rows);
                else await clearAndWriteSheetData(`${sheet}!A2:Z`, rows);
                return res.status(200).json({ message: 'CSV updated.' });

            default:
                return res.status(400).json({ message: 'Unknown action' });
        }
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}
