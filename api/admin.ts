
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
    if (clean.startsWith('[') && clean.endsWith(']')) {
        try { return JSON.parse(clean); } catch (e) {
            try { return JSON.parse(clean.replace(/'/g, '"')); } catch (e2) {
                const inner = clean.slice(1, -1).trim();
                if (inner.includes('|')) return inner.split('|').map(s => s.trim());
                if (inner.includes(',')) return inner.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                return [inner];
            }
        }
    }
    if (clean.includes('|')) return clean.split('|').map(s => s.trim());
    if (clean.includes(',')) return clean.split(',').map(s => s.trim());
    return [clean];
};

function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let currentField = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i+1] === '"') { currentField += '"'; i++; }
            else inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(currentField.trim());
            currentField = '';
        } else currentField += char;
    }
    result.push(currentField.trim());
    return result.map(f => f.replace(/^['"]|['"]$/g, '').trim());
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
    const { action, sheet, id, data, mode, resultData, setting, question, exam, syllabus, book } = req.body;

    if (action === 'save-result') {
        try {
            const resultId = resultData.id || Date.now();
            const row = [resultId, resultData.userId || 'guest', resultData.userEmail || 'guest@example.com', resultData.testTitle, resultData.score, resultData.total, new Date().toISOString()];
            await appendSheetData('Results!A1', [row]);
            if (supabase) {
                await supabase.from('results').upsert([{
                    id: String(row[0]), user_id: String(row[1]), user_email: String(row[2]), test_title: String(row[3]), score: parseFloat(String(row[4] || '0')), total: parseInt(String(row[5] || '0'))
                }]);
            }
            return res.status(200).json({ message: 'Saved' });
        } catch (e: any) { return res.status(500).json({ error: e.message }); }
    }

    try { await verifyAdmin(req); } catch (e: any) { return res.status(401).json({ error: e.message || 'Unauthorized Access' }); }

    try {
        switch (action) {
            case 'sync-all':
                if (!supabase) throw new Error("Supabase not linked");
                const [exs, snl, qbs, bks, syls] = await Promise.all([
                    readSheetData('Exams!A2:H'), readSheetData('Settings!A2:B'),
                    readSheetData('QuestionBank!A2:H'), readSheetData('Bookstore!A2:E'),
                    readSheetData('Syllabus!A2:G')
                ]);
                
                await Promise.all([
                    upsertSupabaseData('exams', exs.filter(r => r[0]).map(r => ({ 
                        id: String(r[0]), title_ml: r[1], title_en: r[2], description_ml: r[3], description_en: r[4], category: r[5], level: r[6], icon_type: r[7] 
                    }))),
                    upsertSupabaseData('settings', snl.filter(r => r[0]).map(r => ({ key: r[0], value: r[1] })), 'key'),
                    upsertSupabaseData('questionbank', qbs.filter(r => r[0] && !isNaN(parseInt(r[0]))).map(r => ({ 
                        id: parseInt(r[0]), topic: r[1], question: r[2], options: smartParseOptions(r[3]), correct_answer_index: parseInt(r[4] || '0'), subject: r[5], difficulty: r[6] 
                    }))),
                    upsertSupabaseData('bookstore', bks.filter(r => r[0]).map(r => ({ 
                        id: String(r[0]), title: r[1], author: r[2], imageUrl: r[3], amazonLink: r[4] 
                    }))),
                    upsertSupabaseData('syllabus', syls.filter(r => r[0] && !isNaN(parseInt(r[0]))).map(r => ({ 
                        id: parseInt(r[0]), exam_id: String(r[1]), title: r[2], questions: parseInt(r[3] || '20'), duration: parseInt(r[4] || '20'), subject: r[5], topic: r[6] 
                    })))
                ]);
                return res.status(200).json({ message: 'Global Cloud Sync Completed (Schema Verified)' });

            case 'update-exam':
                const examRow = [exam.id, exam.title_ml, exam.title_en, exam.description_ml, exam.description_en, exam.category, exam.level, exam.icon_type];
                await findAndUpsertRow('Exams', exam.id, examRow);
                if (supabase) await upsertSupabaseData('exams', [{ id: String(exam.id), title_ml: exam.title_ml, title_en: exam.title_en, description_ml: exam.description_ml, description_en: exam.description_en, category: exam.category, level: exam.level, icon_type: exam.icon_type }]);
                return res.status(200).json({ message: 'Updated' });

            case 'update-book':
                const bRow = [book.id, book.title, book.author, book.imageUrl, book.amazonLink];
                await findAndUpsertRow('Bookstore', book.id, bRow);
                if (supabase) await upsertSupabaseData('bookstore', [{ id: String(book.id), title: book.title, author: book.author, imageUrl: book.imageUrl, amazonLink: book.amazonLink }]);
                return res.status(200).json({ message: 'Updated' });

            case 'update-syllabus':
                const sylRow = [syllabus.id, syllabus.exam_id, syllabus.title, syllabus.questions, syllabus.duration, syllabus.subject, syllabus.topic];
                await findAndUpsertRow('Syllabus', syllabus.id, sylRow);
                if (supabase) await upsertSupabaseData('syllabus', [{ id: parseInt(syllabus.id), exam_id: String(syllabus.exam_id), title: syllabus.title, questions: parseInt(syllabus.questions), duration: parseInt(syllabus.duration), subject: syllabus.subject, topic: syllabus.topic }]);
                return res.status(200).json({ message: 'Updated' });

            case 'add-question':
                const qId = question.id ? parseInt(question.id) : Date.now();
                const qRow = [qId, question.topic, question.question, JSON.stringify(smartParseOptions(question.options)), question.correct_answer_index, question.subject, question.difficulty];
                await findAndUpsertRow('QuestionBank', String(qId), qRow);
                if (supabase) await upsertSupabaseData('questionbank', [{ id: qId, topic: question.topic, question: question.question, options: smartParseOptions(question.options), correct_answer_index: parseInt(question.correct_answer_index), subject: question.subject, difficulty: question.difficulty }]);
                return res.status(200).json({ message: 'Saved' });

            case 'csv-update':
                const currentSheet = (sheet || '').toLowerCase();
                const lines = (data || '').split('\n').filter((l: string) => l.trim() !== '');
                if (!lines.length) return res.status(400).json({ error: 'No data' });
                const rows = lines.map((line: string, index: number) => {
                    const parts = parseCsvLine(line);
                    if (currentSheet === 'questionbank') return [parseInt(parts[0]) || (Date.now() + index), parts[1], parts[2], JSON.stringify(smartParseOptions(parts[3])), parts[4], parts[5], parts[6]];
                    if (currentSheet === 'syllabus') return [parseInt(parts[0]) || (Date.now() + index + 5000), parts[1], parts[2], parts[3], parts[4], parts[5], parts[6]];
                    return parts;
                });
                if (mode === 'append') await appendSheetData(`${sheet}!A1`, rows);
                else await clearAndWriteSheetData(`${sheet}!A2:H`, rows);
                return res.status(200).json({ message: 'Sync Finished' });

            case 'delete-row':
                await deleteRowById(sheet, id);
                if (supabase) await deleteSupabaseRow(sheet.toLowerCase(), id);
                return res.status(200).json({ message: 'Deleted' });

            case 'test-connection':
                let sS = { ok: false }; let sbS = { ok: false };
                try { await readSheetData('Settings!A1:B2'); sS.ok = true; } catch (e) {}
                try { if (supabase) { const { error } = await supabase.from('settings').select('key').limit(1); if (!error) sbS.ok = true; } } catch (e) {}
                return res.status(200).json({ status: { sheets: sS.ok, supabase: sbS.ok } });

            case 'run-scraper-notifications': return res.status(200).json(await scrapeKpscNotifications());
            case 'run-scraper-updates': return res.status(200).json(await scrapePscLiveUpdates());
            case 'run-scraper-affairs': return res.status(200).json(await scrapeCurrentAffairs());
            case 'run-scraper-gk': return res.status(200).json(await scrapeGk());
            case 'run-scraper-questions': return res.status(200).json(await generateNewQuestions());
            case 'run-book-scraper': await runBookScraper(); return res.status(200).json({ message: 'Success' });
            case 'clear-study-cache': await clearAndWriteSheetData('StudyMaterialsCache!A2:C', []); return res.status(200).json({ message: 'Cleared' });
            default: return res.status(400).json({ error: 'Invalid' });
        }
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
}
