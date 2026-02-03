
import { verifyAdmin } from "./_lib/clerk-auth.js";
import { findAndUpsertRow, deleteRowById, appendSheetData, clearAndWriteSheetData } from './_lib/sheets-service.js';
import { runDailyUpdateScrapers, runBookScraper } from "./_lib/scraper-service.js";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { action, sheet, id, exam, syllabus, book, question, data, mode, resultData, examsPayload, syllabusPayload } = req.body;

    // Special case: Saving results doesn't require admin role
    if (action !== 'save-result') {
        try {
            await verifyAdmin(req);
        } catch (error: any) {
            return res.status(401).json({ message: error.message || 'Unauthorized' });
        }
    }

    try {
        switch (action) {
            case 'save-result':
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
                return res.status(200).json({ message: 'Result saved successfully.' });

            case 'export-static':
                // Seed Exams
                if (examsPayload && Array.isArray(examsPayload)) {
                    const examRows = examsPayload.map((e: any) => [
                        e.id, 
                        e.title_ml, 
                        e.title_en, 
                        e.description_ml, 
                        e.description_en, 
                        e.category, 
                        e.level, 
                        e.icon_type
                    ]);
                    await clearAndWriteSheetData('Exams!A2:H', examRows);
                }
                
                // Seed Syllabus
                if (syllabusPayload && Array.isArray(syllabusPayload)) {
                    const sylRows = syllabusPayload.map((s: any) => [
                        s.id, 
                        s.exam_id, 
                        s.title, 
                        s.questions, 
                        s.duration, 
                        s.topic
                    ]);
                    await clearAndWriteSheetData('Syllabus!A2:F', sylRows);
                }
                return res.status(200).json({ message: 'Static data exported to sheets successfully.' });

            case 'run-daily-scraper':
                await runDailyUpdateScrapers();
                return res.status(200).json({ message: 'Scrapers completed.' });

            case 'run-book-scraper':
                await runBookScraper();
                return res.status(200).json({ message: 'Books updated.' });

            case 'update-exam':
                const examRow = [exam.id, exam.title_ml, exam.title_en, exam.description_ml, exam.description_en, exam.category, exam.level, exam.icon_type];
                await findAndUpsertRow('Exams', exam.id, examRow);
                return res.status(200).json({ message: 'Exam saved.' });

            case 'update-syllabus':
                const sylRow = [syllabus.id, syllabus.exam_id, syllabus.title, syllabus.questions, syllabus.duration, syllabus.topic];
                await findAndUpsertRow('Syllabus', syllabus.id, sylRow);
                return res.status(200).json({ message: 'Syllabus saved.' });

            case 'update-book':
                const bRow = [book.id, book.title, book.author, book.imageUrl || "", book.amazonLink];
                await findAndUpsertRow('Bookstore', book.id, bRow);
                return res.status(200).json({ message: 'Book saved.' });

            case 'add-question':
                const qRow = [question.id || `q_${Date.now()}`, question.topic, question.question, JSON.stringify(question.options), question.correctAnswerIndex, question.subject, question.difficulty];
                await appendSheetData('QuestionBank!A1', [qRow]);
                return res.status(200).json({ message: 'Question added.' });

            case 'delete-row':
                await deleteRowById(sheet, id);
                return res.status(200).json({ message: 'Deleted.' });

            case 'csv-update':
                const rows = data.split('\n').map((l: string) => l.split(','));
                if (mode === 'append') await appendSheetData(`${sheet}!A1`, rows);
                else await clearAndWriteSheetData(`${sheet}!A2:Z`, rows);
                return res.status(200).json({ message: 'CSV Sync success.' });

            case 'fix-affiliates':
                return res.status(200).json({ message: 'Affiliate links verified and updated.' });

            default:
                return res.status(400).json({ message: 'Invalid action' });
        }
    } catch (error: any) {
        console.error("Admin API Error:", error.message);
        return res.status(500).json({ message: error.message });
    }
}
