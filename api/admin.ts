
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
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ message: 'Unauthorized' });
        try {
            const result = await runDailyUpdateScrapers();
            return res.status(200).json({ message: 'Cron Success', result });
        } catch (e: any) { return res.status(500).json({ error: e.message }); }
    }

    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    const { action, sheet, id, data, mode, resultData, setting } = req.body;

    if (action === 'save-result') {
        try {
            const row = [resultData.id || `res_${Date.now()}`, resultData.userId || 'guest', resultData.userEmail || 'guest@example.com', resultData.testTitle, resultData.score, resultData.total, new Date().toISOString()];
            await appendSheetData('Results!A1', [row]);
            if (supabase) {
                await supabase.from('results').upsert([{
                    id: String(row[0]), user_id: String(row[1]), user_email: String(row[2]), test_title: String(row[3]), score: parseFloat(String(row[4] || '0')), total: parseInt(String(row[5] || '0'))
                }]);
            }
            return res.status(200).json({ message: 'Saved' });
        } catch (e: any) { return res.status(500).json({ error: e.message }); }
    }

    try { await verifyAdmin(req); } catch (e: any) { return res.status(401).json({ message: e.message }); }

    try {
        switch (action) {
            case 'update-setting':
                await findAndUpsertRow('Settings', setting.key, [setting.key, setting.value]);
                if (supabase) await upsertSupabaseData('settings', [{ key: String(setting.key), value: String(setting.value) }]);
                return res.status(200).json({ message: 'Setting updated' });

            case 'csv-update':
                const lines = data.split('\n').filter((l: string) => l.trim() !== '');
                const sheetRows = lines.map((line: string) => {
                    const parts = parseCsvLine(line);
                    const currentSheet = sheet.toLowerCase();

                    if (currentSheet === 'questionbank') {
                        if (parts.length < 3) return null;
                        
                        // Clean up the options part
                        let optsRaw = (parts[3] || '').trim();
                        // Strip brackets if present
                        if (optsRaw.startsWith('[') && optsRaw.endsWith(']')) {
                            optsRaw = optsRaw.slice(1, -1).trim();
                        }
                        
                        let opts: string[] = [];
                        if (optsRaw.includes('|')) {
                            opts = optsRaw.split('|').map(o => o.trim().replace(/^['"]|['"]$/g, ''));
                        } else if (optsRaw.includes(',')) {
                            opts = optsRaw.split(',').map(o => o.trim().replace(/^['"]|['"]$/g, ''));
                        } else {
                            opts = [optsRaw];
                        }

                        if (opts.length < 2) opts = ["A", "B", "C", "D"];
                        const cleanId = parts[0] || `q_${Date.now()}_${Math.random().toString(36).substr(2,5)}`;
                        return [cleanId, parts[1] || 'General', parts[2] || '', JSON.stringify(opts), parts[4] || '0', parts[5] || 'GK', parts[6] || 'Moderate'];
                    }

                    if (currentSheet === 'syllabus') {
                        const examId = parts[1] || 'general';
                        const topic = parts[6] || parts[2] || 'general';
                        const cleanId = parts[0] || `syl_${slugify(examId)}_${slugify(topic)}`;
                        return [cleanId, examId, parts[2] || topic, parts[3] || '20', parts[4] || '20', parts[5] || 'General', topic];
                    }
                    return parts;
                }).filter((r: any) => r !== null);

                if (sheetRows.length === 0) return res.status(400).json({ message: 'No valid data' });

                if (mode === 'append') await appendSheetData(`${sheet}!A1`, sheetRows);
                else await clearAndWriteSheetData(`${sheet}!A2:G`, sheetRows);

                if (supabase) {
                    const supabaseRows = sheetRows.map(r => {
                        const currentSheet = sheet.toLowerCase();
                        if (currentSheet === 'questionbank') {
                            return { id: String(r[0]), topic: String(r[1]), question: String(r[2]), options: JSON.parse(r[3]), correct_answer_index: parseInt(r[4] || '0'), subject: String(r[5]), difficulty: String(r[6]) };
                        } else if (currentSheet === 'syllabus') {
                            return { 
                                id: String(r[0]), 
                                exam_id: String(r[1]), 
                                title: String(r[2]), 
                                questions: parseInt(String(r[3] || '20')), 
                                duration: parseInt(String(r[4] || '20')), 
                                subject: String(r[5]), 
                                topic: String(r[6]) 
                            };
                        }
                        return null;
                    }).filter(Boolean);
                    if (supabaseRows.length > 0) await upsertSupabaseData(sheet.toLowerCase(), supabaseRows);
                }
                return res.status(200).json({ message: `Imported ${sheetRows.length} rows to ${sheet}` });

            case 'delete-row':
                await deleteRowById(sheet, id);
                if (supabase) await deleteSupabaseRow(sheet.toLowerCase(), id);
                return res.status(200).json({ message: 'Deleted' });

            case 'run-daily-scraper':
                const scrRes = await runDailyUpdateScrapers();
                return res.status(200).json({ message: 'Scraper finished', result: scrRes });

            default:
                return res.status(400).json({ message: 'Invalid action' });
        }
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
}
