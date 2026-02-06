
import { verifyAdmin } from "./_lib/clerk-auth.js";
import { findAndUpsertRow, deleteRowById, appendSheetData, clearAndWriteSheetData, readSheetData } from './_lib/sheets-service.js';
import { runDailyUpdateScrapers, runBookScraper } from "./_lib/scraper-service.js";

/**
 * Robust CSV line parser that respects quoted fields.
 */
function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(currentField.trim());
            currentField = '';
        } else {
            currentField += char;
        }
    }
    result.push(currentField.trim());
    return result.map(f => f.replace(/^['"]|['"]$/g, '').trim());
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { action, sheet, id, exam, syllabus, book, question, data, mode, resultData, examsPayload, syllabusPayload } = req.body;

    // Save result (public action)
    if (action === 'save-result') {
        try {
            const timestamp = new Date().toISOString();
            const resRow = [resultData.id || `res_${Date.now()}`, resultData.userId || 'guest', resultData.userEmail || 'guest@example.com', resultData.testTitle, resultData.score, resultData.total, timestamp];
            await appendSheetData('Results!A1', [resRow]);
            return res.status(200).json({ message: 'Result saved.' });
        } catch (e: any) { 
            return res.status(500).json({ message: `Failed to save result: ${e.message}` }); 
        }
    }

    // Secure other actions
    try {
        await verifyAdmin(req);
    } catch (error: any) {
        return res.status(401).json({ message: error.message || 'Unauthorized.' });
    }

    try {
        switch (action) {
            case 'test-connection':
                await readSheetData('Exams!A1:A1');
                return res.status(200).json({ message: 'Google Sheets Connection Verified!' });

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
                return res.status(200).json({ message: 'Defaults restored successfully!' });

            case 'apply-affiliate-tags':
                const books = await readSheetData('Bookstore!A2:E');
                const tag = 'tag=malayalambooks-21';
                const updatedBooks = books.map(row => {
                    let link = row[4] || '';
                    if (link && !link.includes(tag)) {
                        link += (link.includes('?') ? '&' : '?') + tag;
                    }
                    return [row[0], row[1], row[2], row[3], link];
                });
                await clearAndWriteSheetData('Bookstore!A2:E', updatedBooks);
                return res.status(200).json({ message: 'Affiliate tags applied to all books.' });

            case 'run-daily-scraper':
                try {
                    const result = await runDailyUpdateScrapers();
                    if (result.successCount > 0) {
                        return res.status(200).json({ message: `Updated ${result.successCount} sections. ${result.errors.length > 0 ? 'Note: ' + result.errors.join(', ') : ''}` });
                    }
                    return res.status(500).json({ message: `Scraper failed. Issues: ${result.errors.join(', ')}` });
                } catch (e: any) { 
                    return res.status(500).json({ message: `System Error: ${e.message}` }); 
                }

            case 'run-book-scraper':
                try {
                    const success = await runBookScraper();
                    if (success) return res.status(200).json({ message: 'Amazon Sync successful!' });
                    return res.status(500).json({ message: 'Sync failed or no data found.' });
                } catch (e: any) { 
                    return res.status(500).json({ message: `Sync Error: ${e.message}` }); 
                }

            case 'csv-update':
                if (!data) throw new Error('No data provided');
                const lines = data.split('\n').filter((l: string) => l.trim() !== '');
                const rows = lines.map((line: string) => {
                    const parts = parseCsvLine(line);
                    if (sheet === 'QuestionBank') {
                        let optionsRaw = parts[3] || '';
                        let optionsArray = optionsRaw.replace(/[\[\]']/g, '').split('|').map((o:string) => o.trim());
                        if (optionsArray.length < 2) optionsArray = optionsRaw.replace(/[\[\]']/g, '').split(',').map((o:string) => o.trim());
                        return [
                            parts[0] || `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                            parts[1] || '', parts[2] || '', JSON.stringify(optionsArray), parts[4] || '0', parts[5] || '', parts[6] || 'Moderate'
                        ];
                    }
                    return parts;
                });
                if (mode === 'append') await appendSheetData(`${sheet}!A1`, rows);
                else await clearAndWriteSheetData(`${sheet}!A2:G`, rows);
                return res.status(200).json({ message: `${rows.length} rows processed in ${sheet}.` });

            case 'delete-row':
                await deleteRowById(sheet, id);
                return res.status(200).json({ message: 'Deleted successfully.' });

            case 'update-exam':
                const examRow = [exam.id, exam.title_ml, exam.title_en || '', exam.description_ml || '', exam.description_en || '', exam.category || 'General', exam.level || 'Preliminary', exam.icon_type || 'book'];
                await findAndUpsertRow('Exams', exam.id, examRow);
                return res.status(200).json({ message: 'Exam saved.' });

            case 'update-syllabus':
                const sylRow = [syllabus.id, syllabus.exam_id, syllabus.title, syllabus.questions, syllabus.duration, syllabus.subject || '', syllabus.topic || ''];
                await findAndUpsertRow('Syllabus', syllabus.id, sylRow);
                return res.status(200).json({ message: 'Syllabus updated.' });

            default:
                return res.status(400).json({ message: `Invalid action: ${action}` });
        }
    } catch (error: any) {
        console.error("Admin API Error:", error.message);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
}
