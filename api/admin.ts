
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
                    await readSheetData('Exams!A1:A1');
                    return res.status(200).json({ 
                        message: 'Google Sheets Connection Verified! You are ready to manage content.'
                    });
                } catch (e: any) {
                    console.error("Test Connection Fail:", e.message);
                    return res.status(500).json({ message: `Connection failed: ${e.message}` });
                }

            case 'export-static':
                if (!examsPayload || !syllabusPayload) throw new Error('Payload missing for export.');
                const eRows = examsPayload.map((e: any) => [
                    e.id, e.title_ml, e.title_en || '', e.description_ml || '', 
                    e.description_en || '', e.category || 'General', e.level || 'Preliminary', e.icon_type || 'book'
                ]);
                await clearAndWriteSheetData('Exams!A2:H', eRows);
                const sRows = syllabusPayload.map((s: any) => [
                    s.id, s.exam_id, s.title, s.questions, s.duration, s.subject || '', s.topic || ''
                ]);
                await clearAndWriteSheetData('Syllabus!A2:G', sRows);
                return res.status(200).json({ message: 'Defaults restored!' });

            case 'run-daily-scraper':
                try {
                    const result = await runDailyUpdateScrapers();
                    if (result.successCount > 0) {
                        return res.status(200).json({ message: `Updated ${result.successCount} of ${result.totalTasks} sections. ${result.errors.length > 0 ? 'Failed: ' + result.errors.join(', ') : ''}` });
                    } else {
                        return res.status(500).json({ message: `Failed to update any section. Issues: ${result.errors.join(', ') || 'No data found'}` });
                    }
                } catch (e: any) {
                    return res.status(500).json({ message: `System Error: ${e.message}` });
                }

            case 'run-book-scraper':
                try {
                    const success = await runBookScraper();
                    if (success) return res.status(200).json({ message: 'Amazon Bookstore Sync successful!' });
                    return res.status(500).json({ message: 'Sync failed or no new books found.' });
                } catch (e: any) {
                    return res.status(500).json({ message: `Book Sync Error: ${e.message}` });
                }

            case 'apply-affiliate-tags':
                const books = await readSheetData('Bookstore!A2:E');
                const tag = 'tag=malayalambooks-21';
                const updatedBooks = books.map(row => {
                    let link = row[4] || '';
                    if (link && !link.includes(tag)) {
                        link += (link.includes('?') ? '&' : '?') + tag;
                    }
                    row[4] = link;
                    return row;
                });
                await clearAndWriteSheetData('Bookstore!A2:E', updatedBooks);
                return res.status(200).json({ message: 'Affiliate tags applied.' });

            case 'add-question':
                const qRow = [question.id || `q_${Date.now()}`, question.topic, question.question, JSON.stringify(question.options), question.correctAnswerIndex, question.subject, question.difficulty || 'Moderate'];
                await appendSheetData('QuestionBank!A1', [qRow]);
                return res.status(200).json({ message: 'Question added.' });

            case 'update-exam':
                const examRow = [exam.id, exam.title_ml, exam.title_en || '', exam.description_ml || '', exam.description_en || '', exam.category || 'General', exam.level || 'Preliminary', exam.icon_type || 'book'];
                await findAndUpsertRow('Exams', exam.id, examRow);
                return res.status(200).json({ message: 'Exam saved.' });

            case 'update-syllabus':
                const sylRow = [syllabus.id, syllabus.exam_id, syllabus.title, syllabus.questions, syllabus.duration, syllabus.subject || '', syllabus.topic || ''];
                await findAndUpsertRow('Syllabus', syllabus.id, sylRow);
                return res.status(200).json({ message: 'Syllabus updated.' });

            case 'update-book':
                const bRow = [book.id || `b_${Date.now()}`, book.title, book.author || '', book.imageUrl || '', book.link];
                await findAndUpsertRow('Bookstore', book.id || bRow[0], bRow);
                return res.status(200).json({ message: 'Book saved.' });

            case 'delete-row':
                if (!sheet || !id) throw new Error('Params missing.');
                await deleteRowById(sheet, id);
                return res.status(200).json({ message: 'Deleted.' });

            case 'csv-update':
                const csvRows = data.split('\n').filter((l:string) => l.trim() !== '').map((line: string) => line.split(',').map(p => p.trim()));
                if (mode === 'append') await appendSheetData(`${sheet}!A1`, csvRows);
                else await clearAndWriteSheetData(`${sheet}!A2`, csvRows);
                return res.status(200).json({ message: 'Imported.' });

            default:
                return res.status(400).json({ message: 'Invalid action.' });
        }
    } catch (error: any) {
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
}
