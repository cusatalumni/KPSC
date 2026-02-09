
import { verifyAdmin } from "./_lib/clerk-auth.js";
import { findAndUpsertRow, deleteRowById, appendSheetData, clearAndWriteSheetData, readSheetData } from './_lib/sheets-service.js';
import { runDailyUpdateScrapers, runBookScraper } from "./_lib/scraper-service.js";
import { supabase, upsertSupabaseData, deleteSupabaseRow } from "./_lib/supabase-service.js";

function slugify(text: string): string {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^\w\u0d00-\u0d7f]+/g, '')
        .replace(/--+/g, '_')
        .trim();
}

function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let currentField = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
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
    const { action, sheet, id, data, mode, resultData, setting, question, exam } = req.body;

    // save-result is public
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

    // Security Check for Admin actions
    try { 
        await verifyAdmin(req); 
    } catch (e: any) { 
        return res.status(401).json({ error: e.message || 'Unauthorized Access' }); 
    }

    try {
        switch (action) {
            case 'test-connection':
                let sheetsStatus = { ok: false, error: null as string | null };
                let supabaseStatus = { ok: false, error: null as string | null };
                
                try {
                    await readSheetData('Settings!A1:B2');
                    sheetsStatus.ok = true;
                } catch (e: any) { sheetsStatus.error = e.message; }
                
                try {
                    if (supabase) {
                        const { error } = await supabase.from('settings').select('key').limit(1);
                        if (error) throw error;
                        supabaseStatus.ok = true;
                    } else { supabaseStatus.error = "Supabase env missing"; }
                } catch (e: any) { supabaseStatus.error = e.message; }
                
                return res.status(200).json({ 
                    status: { sheets: sheetsStatus.ok, supabase: supabaseStatus.ok },
                    details: { sheets: sheetsStatus.error, supabase: supabaseStatus.error }
                });

            case 'update-setting':
                await findAndUpsertRow('Settings', setting.key, [setting.key, setting.value]);
                if (supabase) await upsertSupabaseData('settings', [{ key: String(setting.key), value: String(setting.value) }]);
                return res.status(200).json({ message: 'Setting updated' });

            case 'update-exam':
                const examRow = [exam.id, exam.title_ml, exam.title_en, exam.description_ml, exam.description_en, exam.category, exam.level, exam.icon_type];
                await findAndUpsertRow('Exams', exam.id, examRow);
                if (supabase) await upsertSupabaseData('exams', [{
                    id: exam.id, title_ml: exam.title_ml, title_en: exam.title_en, description_ml: exam.description_ml,
                    description_en: exam.description_en, category: exam.category, level: exam.level, icon_type: exam.icon_type
                }]);
                return res.status(200).json({ message: 'Exam configuration updated' });

            case 'add-question':
                // Use numeric-only ID for bigint columns
                const qId = question.id || Date.now();
                const qRow = [qId, question.topic, question.question, JSON.stringify(question.options), question.correctAnswerIndex, question.subject, question.difficulty, question.explanation || ''];
                await appendSheetData('QuestionBank!A1', [qRow]);
                if (supabase) {
                    await upsertSupabaseData('questionbank', [{
                        id: qId, topic: question.topic, question: question.question, options: question.options, 
                        correct_answer_index: question.correctAnswerIndex, subject: question.subject, difficulty: question.difficulty,
                        explanation: question.explanation || ''
                    }]);
                }
                return res.status(200).json({ message: 'Question committed successfully' });

            case 'csv-update':
                const currentSheet = (sheet || '').toLowerCase();
                const lines = (data || '').split('\n').filter((l: string) => l.trim() !== '');
                if (!lines.length) return res.status(400).json({ error: 'No data provided' });

                const sheetRows = lines.map((line: string, index: number) => {
                    const parts = parseCsvLine(line);
                    if (currentSheet === 'questionbank') {
                        let optsRaw = (parts[3] || '').trim().replace(/^\[|\]$/g, '');
                        let opts = optsRaw.includes('|') ? optsRaw.split('|').map(o => o.trim()) : optsRaw.split(',').map(o => o.trim());
                        if (opts.length < 2) opts = ["A", "B", "C", "D"];
                        // Use unique numeric ID
                        const rowId = parseInt(parts[0]) || (Date.now() + index);
                        return [rowId, parts[1] || 'General', parts[2] || '', JSON.stringify(opts), parts[4] || '0', parts[5] || 'GK', parts[6] || 'Moderate', parts[7] || ''];
                    }
                    if (currentSheet === 'syllabus') {
                        const examId = parts[1] || 'general';
                        const topic = parts[6] || parts[2] || 'general';
                        const rowId = parseInt(parts[0]) || (Date.now() + index + 1000);
                        return [rowId, examId, parts[2] || topic, parts[3] || '20', parts[4] || '20', parts[5] || 'General', topic];
                    }
                    return parts;
                });

                if (mode === 'append') await appendSheetData(`${sheet}!A1`, sheetRows);
                else await clearAndWriteSheetData(`${sheet}!A2:H`, sheetRows);

                if (supabase) {
                    const supabaseRows = sheetRows.map(r => {
                        if (currentSheet === 'questionbank') return { id: r[0], topic: String(r[1]), question: String(r[2]), options: JSON.parse(r[3]), correct_answer_index: parseInt(r[4] || '0'), subject: String(r[5]), difficulty: String(r[6]), explanation: String(r[7] || '') };
                        if (currentSheet === 'syllabus') return { id: r[0], exam_id: String(r[1]), title: String(r[2]), questions: parseInt(r[3] || '20'), duration: parseInt(r[4] || '20'), subject: String(r[5]), topic: String(r[6]) };
                        return null;
                    }).filter(Boolean);
                    if (supabaseRows.length > 0) await upsertSupabaseData(currentSheet, supabaseRows);
                }
                return res.status(200).json({ message: 'Sync Success' });

            case 'delete-row':
                await deleteRowById(sheet, id);
                if (supabase) await deleteSupabaseRow(sheet.toLowerCase(), id);
                return res.status(200).json({ message: 'Resource removed' });

            case 'run-daily-scraper':
                const resDaily = await runDailyUpdateScrapers();
                return res.status(200).json({ message: 'Global automation sequence finished', result: resDaily });

            case 'run-book-scraper':
                await runBookScraper();
                return res.status(200).json({ message: 'Amazon catalog synced' });

            case 'clear-study-cache':
                await clearAndWriteSheetData('StudyMaterialsCache!A2:C', []);
                return res.status(200).json({ message: 'AI processing cache cleared' });

            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (e: any) { 
        console.error(`Admin API Failure:`, e.message);
        return res.status(500).json({ error: e.message || 'Critical Infrastructure Error' }); 
    }
}
