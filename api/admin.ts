
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
    // Handle JSON strings with single or double quotes
    if (clean.startsWith('[') && clean.endsWith(']')) {
        try { 
            // Replace single quotes with double quotes for valid JSON
            const normalized = clean.replace(/'/g, '"');
            return JSON.parse(normalized); 
        } catch (e) {
            const inner = clean.slice(1, -1).trim();
            if (inner.includes('|')) return inner.split('|').map(s => s.trim());
            if (inner.includes(',')) return inner.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
            return [inner];
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
                    upsertSupabaseData('exams', exs.map(r => ({ id: String(r[0]), title_ml: r[1], title_en: r[2], description_ml: r[3], description_en: r[4], category: r[5], level: r[6], icon_type: r[7] }))),
                    upsertSupabaseData('settings', snl.map(r => ({ key: r[0], value: r[1] })), 'key'),
                    upsertSupabaseData('questionbank', qbs.map(r => ({ 
                        id: parseInt(r[0]), topic: r[1], question: r[2], 
                        options: smartParseOptions(r[3]), 
                        correct_answer_index: parseInt(r[4] || '0'), 
                        subject: r[5], difficulty: r[6], explanation: r[7] || '' 
                    }))),
                    upsertSupabaseData('bookstore', bks.map(r => ({ id: String(r[0]), title: r[1], author: r[2], image_url: r[3], amazon_link: r[4] }))),
                    upsertSupabaseData('syllabus', syls.map(r => ({ id: parseInt(r[0]), exam_id: String(r[1]), title: r[2], questions: parseInt(r[3] || '20'), duration: parseInt(r[4] || '20'), subject: r[5], topic: r[6] })))
                ]);
                return res.status(200).json({ message: 'Global Cloud Sync Completed (Sheets → Supabase)' });

            case 'update-exam':
                const examRow = [exam.id, exam.title_ml, exam.title_en, exam.description_ml, exam.description_en, exam.category, exam.level, exam.icon_type];
                await findAndUpsertRow('Exams', exam.id, examRow);
                if (supabase) await upsertSupabaseData('exams', [{ id: String(exam.id), title_ml: exam.title_ml, title_en: exam.title_en, description_ml: exam.description_ml, description_en: exam.description_en, category: exam.category, level: exam.level, icon_type: exam.icon_type }]);
                return res.status(200).json({ message: 'Exam entry updated' });

            case 'update-book':
                const bRow = [book.id, book.title, book.author, book.imageUrl, book.amazonLink];
                await findAndUpsertRow('Bookstore', book.id, bRow);
                if (supabase) await upsertSupabaseData('bookstore', [{ id: String(book.id), title: book.title, author: book.author, image_url: book.imageUrl, amazon_link: book.amazonLink }]);
                return res.status(200).json({ message: 'Book updated' });

            case 'update-syllabus':
                const sylRow = [syllabus.id, syllabus.exam_id, syllabus.title, syllabus.questions, syllabus.duration, syllabus.subject, syllabus.topic];
                await findAndUpsertRow('Syllabus', syllabus.id, sylRow);
                if (supabase) await upsertSupabaseData('syllabus', [{ id: parseInt(syllabus.id), exam_id: String(syllabus.exam_id), title: syllabus.title, questions: parseInt(syllabus.questions), duration: parseInt(syllabus.duration), subject: syllabus.subject, topic: syllabus.topic }]);
                return res.status(200).json({ message: 'Syllabus updated' });

            case 'add-question':
                const qId = question.id ? parseInt(question.id) : Date.now();
                const opts = smartParseOptions(question.options);
                const qRow = [qId, question.topic, question.question, JSON.stringify(opts), question.correctAnswerIndex, question.subject, question.difficulty, question.explanation || ''];
                await findAndUpsertRow('QuestionBank', String(qId), qRow);
                if (supabase) {
                    await upsertSupabaseData('questionbank', [{ id: qId, topic: question.topic, question: question.question, options: opts, correct_answer_index: parseInt(question.correctAnswerIndex), subject: question.subject, difficulty: question.difficulty, explanation: question.explanation || '' }]);
                }
                return res.status(200).json({ message: 'Question committed' });

            case 'csv-update':
                const currentSheet = (sheet || '').toLowerCase();
                const lines = (data || '').split('\n').filter((l: string) => l.trim() !== '');
                if (!lines.length) return res.status(400).json({ error: 'No data provided' });

                const sheetRows = lines.map((line: string, index: number) => {
                    const parts = parseCsvLine(line);
                    if (currentSheet === 'questionbank') {
                        const opts = smartParseOptions(parts[3]);
                        const rowId = parseInt(parts[0]) || (Date.now() + index);
                        return [rowId, parts[1] || 'General', parts[2] || '', JSON.stringify(opts), parts[4] || '0', parts[5] || 'GK', parts[6] || 'Moderate', parts[7] || ''];
                    }
                    if (currentSheet === 'syllabus') {
                        const rowId = parseInt(parts[0]) || (Date.now() + index + 1000);
                        return [rowId, parts[1] || 'general', parts[2] || 'Topic', parts[3] || '20', parts[4] || '20', parts[5] || 'General', parts[6] || 'General'];
                    }
                    if (currentSheet === 'bookstore') {
                        const rowId = parts[0] || `b_${Date.now() + index}`;
                        return [rowId, parts[1] || 'Title', parts[2] || 'Author', parts[3] || '', parts[4] || ''];
                    }
                    return parts;
                });

                if (mode === 'append') await appendSheetData(`${sheet}!A1`, sheetRows);
                else await clearAndWriteSheetData(`${sheet}!A2:H`, sheetRows);

                if (supabase) {
                    const sbTable = currentSheet === 'questionbank' ? 'questionbank' : currentSheet;
                    const supabaseRows = sheetRows.map(r => {
                        if (currentSheet === 'questionbank') return { id: parseInt(String(r[0])), topic: String(r[1]), question: String(r[2]), options: JSON.parse(r[3]), correct_answer_index: parseInt(r[4] || '0'), subject: String(r[5]), difficulty: String(r[6]), explanation: String(r[7] || '') };
                        if (currentSheet === 'syllabus') return { id: parseInt(String(r[0])), exam_id: String(r[1]), title: String(r[2]), questions: parseInt(r[3] || '20'), duration: parseInt(r[4] || '20'), subject: String(r[5]), topic: String(r[6]) };
                        if (currentSheet === 'bookstore') return { id: String(r[0]), title: String(r[1]), author: String(r[2]), image_url: String(r[3]), amazon_link: String(r[4]) };
                        return null;
                    }).filter(Boolean);
                    if (supabaseRows.length > 0) await upsertSupabaseData(sbTable, supabaseRows as any[]);
                }
                return res.status(200).json({ message: 'Sync Finished' });

            case 'delete-row':
                await deleteRowById(sheet, id);
                if (supabase) await deleteSupabaseRow(sheet.toLowerCase(), id);
                return res.status(200).json({ message: 'Removed' });

            case 'update-setting':
                await findAndUpsertRow('Settings', setting.key, [setting.key, setting.value]);
                if (supabase) await upsertSupabaseData('settings', [{ key: String(setting.key), value: String(setting.value) }], 'key');
                return res.status(200).json({ message: 'Setting updated' });

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
            case 'run-book-scraper': await runBookScraper(); return res.status(200).json({ message: 'Books synced' });
            case 'clear-study-cache': await clearAndWriteSheetData('StudyMaterialsCache!A2:C', []); return res.status(200).json({ message: 'Cache cleared' });

            default: return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
}
