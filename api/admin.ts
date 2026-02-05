
import { verifyAdmin } from "./_lib/clerk-auth.js";
import { findAndUpsertRow, deleteRowById, appendSheetData, clearAndWriteSheetData, readSheetData } from './_lib/sheets-service.js';
import { runDailyUpdateScrapers, runBookScraper } from "./_lib/scraper-service.js";

/**
 * Robust CSV line parser that respects quoted fields.
 * Handles: field1,"field,with,comma",field3
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
    
    // Cleanup: Remove surrounding single/double quotes from result fields
    return result.map(f => f.replace(/^['"]|['"]$/g, '').trim());
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { action, sheet, id, exam, syllabus, book, question, data, mode, resultData, examsPayload, syllabusPayload } = req.body;

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

            case 'run-daily-scraper':
                try {
                    const result = await runDailyUpdateScrapers();
                    if (result.successCount > 0) {
                        return res.status(200).json({ message: `Updated ${result.successCount} sections. ${result.errors.length > 0 ? 'Errors: ' + result.errors.join(', ') : ''}` });
                    }
                    return res.status(500).json({ message: `Scraper failed. Issues: ${result.errors.join(', ')}` });
                } catch (e: any) { return res.status(500).json({ message: `System Error: ${e.message}` }); }

            case 'run-book-scraper':
                try {
                    const success = await runBookScraper();
                    if (success) return res.status(200).json({ message: 'Amazon Sync successful!' });
                    return res.status(500).json({ message: 'Sync failed or no data found.' });
                } catch (e: any) { return res.status(500).json({ message: `Sync Error: ${e.message}` }); }

            case 'csv-update':
                if (!data) throw new Error('No data provided');
                
                const lines = data.split('\n').filter((l: string) => l.trim() !== '');
                const rows = lines.map((line: string) => {
                    const parts = parseCsvLine(line);
                    
                    // Specific formatting for QuestionBank
                    if (sheet === 'QuestionBank') {
                        // Expected input: Topic, Question, Opt1|Opt2|Opt3|Opt4, CorrectIdx, Subject, Difficulty
                        // User example had SlNo at start: 412,Kerala History...
                        // We need to map this to: [id, topic, question, options_json, correct_idx, subject, difficulty]
                        
                        let topic = parts[1] || '';
                        let questionText = parts[2] || '';
                        let optionsRaw = parts[3] || '';
                        let correctIdx = parts[4] || '0';
                        let subject = parts[5] || '';
                        let difficulty = parts[6] || 'Moderate';

                        // If options are like [A,B,C,D], clean them up
                        let optionsArray = optionsRaw.replace(/[\[\]']/g, '').split('|').map((o:string) => o.trim());
                        if (optionsArray.length < 2) {
                            // Try splitting by comma if pipe failed
                            optionsArray = optionsRaw.replace(/[\[\]']/g, '').split(',').map((o:string) => o.trim());
                        }

                        return [
                            parts[0] || `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                            topic,
                            questionText,
                            JSON.stringify(optionsArray),
                            correctIdx,
                            subject,
                            difficulty
                        ];
                    }
                    return parts;
                });
                
                const range = mode === 'append' ? `${sheet}!A1` : `${sheet}!A2`;
                if (mode === 'append') {
                    await appendSheetData(range, rows);
                } else {
                    await clearAndWriteSheetData(`${sheet}!A2:G`, rows);
                }
                return res.status(200).json({ message: `${rows.length} rows processed in ${sheet}.` });

            case 'delete-row':
                await deleteRowById(sheet, id);
                return res.status(200).json({ message: 'Deleted.' });

            case 'update-exam':
                const examRow = [exam.id, exam.title_ml, exam.title_en || '', exam.description_ml || '', exam.description_en || '', exam.category || 'General', exam.level || 'Preliminary', exam.icon_type || 'book'];
                await findAndUpsertRow('Exams', exam.id, examRow);
                return res.status(200).json({ message: 'Exam saved.' });

            default:
                return res.status(400).json({ message: 'Invalid action.' });
        }
    } catch (error: any) {
        console.error("Admin API Error:", error.message);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
}
