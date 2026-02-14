
import { verifyAdmin } from "./_lib/clerk-auth.js";
import { findAndUpsertRow, deleteRowById, appendSheetData, clearAndWriteSheetData, readSheetData } from './_lib/sheets-service.js';
import { 
    runDailyUpdateScrapers, 
    runBookScraper, 
    scrapeKpscNotifications, 
    scrapePscLiveUpdates, 
    scrapeCurrentAffairs, 
    scrapeGk, 
    generateNewQuestions 
} from "./_lib/scraper-service.js";
import { supabase, upsertSupabaseData, deleteSupabaseRow } from "./_lib/supabase-service.js";

const smartParseOptions = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    
    let clean = String(raw).trim();
    
    // Handle standard CSV double-double quote escaping: "" -> "
    // and manual backslash escaping: \" -> "
    clean = clean.replace(/""/g, '"').replace(/\\"/g, '"');
    
    if (clean.startsWith('[') && clean.endsWith(']')) {
        try { 
            return JSON.parse(clean); 
        } catch (e) {
            try { 
                // Attempt to fix common JSON syntax errors
                const fixed = clean.replace(/'/g, '"');
                return JSON.parse(fixed); 
            } catch (e2) {
                // Last resort split
                const inner = clean.slice(1, -1).trim();
                if (inner.includes('|')) return inner.split('|').map(s => s.trim());
                return inner.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
            }
        }
    }
    return [clean];
};

function createNumericHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

/**
 * Enhanced CSV Parser that handles missing headers and quoted fields
 */
function parseCSV(csv: string) {
    const lines = csv.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    // Function to parse a single line correctly
    const parseLine = (line: string) => {
        const values = [];
        let currentValue = '';
        let insideQuotes = false;
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"' && line[j+1] === '"') {
                currentValue += '"';
                j++;
            } else if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                values.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue);
        return values;
    };

    const firstLineValues = parseLine(lines[0]);
    const standardHeaders = ['id', 'topic', 'question', 'options', 'correctanswerindex', 'subject', 'difficulty'];
    
    // Check if the first line is actually a header
    const isHeader = firstLineValues.some(val => 
        standardHeaders.includes(val.toLowerCase().trim()) || 
        val.toLowerCase().includes('question')
    );

    let headers: string[] = [];
    let startIdx = 0;

    if (isHeader) {
        headers = firstLineValues.map(h => h.trim().toLowerCase());
        startIdx = 1;
    } else {
        // Use default standard order if no header detected
        headers = standardHeaders;
        startIdx = 0;
    }

    const rows = [];
    for (let i = startIdx; i < lines.length; i++) {
        const values = parseLine(lines[i]);
        const row: any = {};
        headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || '';
        });
        rows.push(row);
    }

    return { headers, rows };
}

export default async function handler(req: any, res: any) {
    if (req.method === 'GET') {
        const authHeader = req.headers.authorization;
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: 'Unauthorized' });
        try {
            const result = await runDailyUpdateScrapers();
            return res.status(200).json({ message: 'Cron Success', result });
        } catch (e: any) { return res.status(500).json({ error: e.message }); }
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const { action, sheet, id, resultData, setting, question, exam, syllabus, book, csv } = req.body;

    if (action === 'save-result') {
        try {
            const resultId = resultData.id || Date.now();
            if (supabase) {
                await upsertSupabaseData('results', [{
                    id: resultId, user_id: String(resultData.userId || 'guest'), user_email: String(resultData.userEmail || ''), test_title: String(resultData.testTitle || ''), score: resultData.score, total: resultData.total
                }]);
            }
            await appendSheetData('Results!A1', [[resultId, resultData.userId, resultData.userEmail, resultData.testTitle, resultData.score, resultData.total, new Date().toISOString()]]);
            return res.status(200).json({ message: 'Saved' });
        } catch (e: any) { return res.status(500).json({ error: e.message }); }
    }

    try { await verifyAdmin(req); } catch (e: any) { return res.status(401).json({ error: e.message }); }

    try {
        switch (action) {
            case 'bulk-upload-questions':
                if (!csv) throw new Error("CSV data is required.");
                const { rows } = parseCSV(csv);
                if (rows.length === 0) throw new Error("No valid data found in CSV.");

                const baseTime = Date.now();
                
                const sbItems = rows.map((row, idx) => {
                    const qId = parseInt(row.id || (baseTime + idx));
                    const optionsArr = smartParseOptions(row.options);
                    
                    return {
                        id: qId,
                        topic: row.topic || '',
                        question: row.question || '',
                        options: optionsArr,
                        correct_answer_index: parseInt(row.correctanswerindex || row.answer || '0'),
                        subject: row.subject || 'General',
                        difficulty: row.difficulty || 'Moderate'
                    };
                });

                const sheetRows = sbItems.map(item => [
                    item.id,
                    item.topic,
                    item.question,
                    JSON.stringify(item.options),
                    item.correct_answer_index,
                    item.subject,
                    item.difficulty
                ]);
                
                // Save to both
                await appendSheetData('QuestionBank!A1', sheetRows);
                if (supabase) await upsertSupabaseData('questionbank', sbItems);
                
                return res.status(200).json({ message: `Successfully imported ${sbItems.length} questions to Sheets and Cloud.` });

            case 'update-syllabus':
                const sylId = syllabus.id || `syl_${Date.now()}`;
                await findAndUpsertRow('Syllabus', String(sylId), [sylId, syllabus.exam_id, syllabus.title, syllabus.questions, syllabus.duration, syllabus.subject, syllabus.topic]);
                if (supabase) await upsertSupabaseData('syllabus', [{ id: String(sylId), exam_id: syllabus.exam_id, title: syllabus.title, questions: syllabus.questions, duration: syllabus.duration, subject: syllabus.subject, topic: syllabus.topic }]);
                return res.status(200).json({ message: 'Syllabus Updated.' });

            case 'update-book':
                const bId = book.id || `book_${Date.now()}`;
                await findAndUpsertRow('Bookstore', String(bId), [bId, book.title, book.author, book.imageUrl, book.amazonLink]);
                if (supabase) await upsertSupabaseData('bookstore', [{ id: String(bId), title: book.title, author: book.author, imageUrl: book.imageUrl, amazonLink: book.amazonLink }]);
                return res.status(200).json({ message: 'Bookstore Entry Updated.' });

            case 'sync-all':
                if (!supabase) throw new Error("Supabase connection missing.");
                const [exs, snl, qbs, bks, syls, nfs, cas, gks, ups] = await Promise.all([
                    readSheetData('Exams!A2:H'), readSheetData('Settings!A2:B'),
                    readSheetData('QuestionBank!A2:H'), readSheetData('Bookstore!A2:E'),
                    readSheetData('Syllabus!A2:G'), readSheetData('Notifications!A2:E'),
                    readSheetData('CurrentAffairs!A2:D'), readSheetData('GK!A2:C'),
                    readSheetData('LiveUpdates!A2:D')
                ]);
                
                await Promise.all([
                    upsertSupabaseData('exams', exs.filter(r => r[0]).map(r => ({ id: String(r[0]), title_ml: r[1], title_en: r[2], description_ml: r[3], description_en: r[4], category: r[5], level: r[6], icon_type: r[7] }))),
                    upsertSupabaseData('settings', snl.filter(r => r[0]).map(r => ({ key: r[0], value: r[1] })), 'key'),
                    upsertSupabaseData('questionbank', qbs.filter(r => r[0]).map(r => ({ id: parseInt(String(r[0])), topic: r[1], question: r[2], options: smartParseOptions(r[3]), correct_answer_index: r[4], subject: r[5], difficulty: r[6] }))),
                    upsertSupabaseData('bookstore', bks.filter(r => r[0]).map(r => ({ id: String(r[0]), title: r[1], author: r[2], imageUrl: r[3], amazonLink: r[4] }))),
                    upsertSupabaseData('syllabus', syls.filter(r => r[0]).map(r => ({ id: String(r[0]), exam_id: String(r[1]), title: r[2], questions: r[3], duration: r[4], subject: r[5], topic: r[6] }))),
                    upsertSupabaseData('notifications', nfs.filter(r => r[0]).map(r => ({ id: String(r[0]), title: r[1], categoryNumber: r[2], lastDate: r[3], link: r[4] }))),
                    upsertSupabaseData('currentaffairs', cas.filter(r => r[0]).map(r => ({ id: String(r[0]), title: r[1], source: r[2], date: r[3] }))),
                    upsertSupabaseData('gk', gks.filter(r => r[0]).map(r => ({ id: String(r[0]), fact: r[1], category: r[2] }))),
                    upsertSupabaseData('liveupdates', ups.filter(r => r[0]).map(r => ({ id: createNumericHash(String(r[1]) || String(r[0])), title: r[0], url: r[1], section: r[2], published_date: r[3] })))
                ]);
                return res.status(200).json({ message: 'Cloud Layers Fully Synchronized.' });

            case 'clear-study-cache':
                await clearAndWriteSheetData('StudyMaterialsCache!A2:C', []);
                if (supabase) await supabase.from('studymaterialscache').delete().neq('topic', '');
                return res.status(200).json({ message: 'AI Cache Flushed.' });

            case 'update-exam':
                await findAndUpsertRow('Exams', exam.id, [exam.id, exam.title_ml, exam.title_en, exam.description_ml, exam.description_en, exam.category, exam.level, exam.icon_type]);
                if (supabase) await upsertSupabaseData('exams', [{ id: String(exam.id), title_ml: exam.title_ml, title_en: exam.title_en, description_ml: exam.description_ml, description_en: exam.description_en, category: exam.category, level: exam.level, icon_type: exam.icon_type }]);
                return res.status(200).json({ message: 'Exam Updated.' });

            case 'update-setting':
                await findAndUpsertRow('Settings', setting.key, [setting.key, setting.value]);
                if (supabase) await upsertSupabaseData('settings', [{ key: setting.key, value: setting.value }], 'key');
                return res.status(200).json({ message: 'Setting Updated.' });

            case 'add-question':
                const qId = question.id ? parseInt(question.id) : Date.now();
                await findAndUpsertRow('QuestionBank', String(qId), [qId, question.topic, question.question, JSON.stringify(smartParseOptions(question.options)), question.correct_answer_index, question.subject, question.difficulty]);
                if (supabase) await upsertSupabaseData('questionbank', [{ id: qId, topic: question.topic, question: question.question, options: smartParseOptions(question.options), correct_answer_index: question.correct_answer_index, subject: question.subject, difficulty: question.difficulty }]);
                return res.status(200).json({ message: 'Question Saved.' });

            case 'delete-row':
                await deleteRowById(sheet, id);
                if (supabase) await deleteSupabaseRow(sheet, id);
                return res.status(200).json({ message: 'Row Deleted.' });

            case 'test-connection':
                let sS = false, sbS = false;
                try { await readSheetData('Settings!A1:A1'); sS = true; } catch (e) {}
                try { if (supabase) { const { error } = await supabase.from('settings').select('key').limit(1); sbS = !error; } } catch (e) {}
                return res.status(200).json({ status: { sheets: sS, supabase: sbS } });

            case 'run-scraper-notifications': return res.status(200).json(await scrapeKpscNotifications());
            case 'run-scraper-updates': return res.status(200).json(await scrapePscLiveUpdates());
            case 'run-scraper-affairs': return res.status(200).json(await scrapeCurrentAffairs());
            case 'run-scraper-gk': return res.status(200).json(await scrapeGk());
            case 'run-scraper-questions': return res.status(200).json(await generateNewQuestions());
            case 'run-book-scraper': await runBookScraper(); return res.status(200).json({ message: 'Success' });
            default: return res.status(400).json({ error: 'Invalid Action' });
        }
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
}
