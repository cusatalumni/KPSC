
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
                return clean.slice(1, -1).split('|').map(s => s.trim());
            }
        }
    }
    return [clean];
};

function parseCSV(csv: string) {
    const lines = csv.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    const parseLine = (line: string) => {
        const values = [];
        let currentValue = '';
        let insideQuotes = false;
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"' && line[j+1] === '"') {
                currentValue += '"'; j++;
            } else if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                values.push(currentValue); currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue);
        return values;
    };

    const firstLine = parseLine(lines[0]);
    const headers = firstLine.map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map(line => {
        const values = parseLine(line);
        const row: any = {};
        headers.forEach((h, i) => { row[h] = values[i]?.trim() || ''; });
        return row;
    });
    return { headers, rows };
}

function createNumericHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
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
    const { action, sheet, id, resultData, setting, question, exam, syllabus, book, csv, targetTable } = req.body;

    if (action === 'save-result') {
        try {
            const resultId = resultData.id || Date.now();
            if (supabase) await upsertSupabaseData('results', [{ id: resultId, user_id: String(resultData.userId || 'guest'), user_email: String(resultData.userEmail || ''), test_title: String(resultData.testTitle || ''), score: resultData.score, total: resultData.total }]);
            await appendSheetData('Results!A1', [[resultId, resultData.userId, resultData.userEmail, resultData.testTitle, resultData.score, resultData.total, new Date().toISOString()]]);
            return res.status(200).json({ message: 'Saved' });
        } catch (e: any) { return res.status(500).json({ error: e.message }); }
    }

    try { await verifyAdmin(req); } catch (e: any) { return res.status(401).json({ error: e.message }); }

    try {
        switch (action) {
            case 'bulk-upload-questions': {
                // Wrap in block scope to avoid redeclaring variables
                if (!csv) throw new Error("CSV data required.");
                const qData = parseCSV(csv);
                const items = qData.rows.map(row => ({
                    id: parseInt(row.id || String(Date.now() + Math.random())),
                    topic: row.topic || '',
                    question: row.question || '',
                    options: smartParseOptions(row.options),
                    correct_answer_index: parseInt(row.correctanswerindex || row.answer || '1'),
                    subject: row.subject || 'General',
                    difficulty: row.difficulty || 'Moderate'
                }));
                await appendSheetData('QuestionBank!A1', items.map(it => [it.id, it.topic, it.question, JSON.stringify(it.options), it.correct_answer_index, it.subject, it.difficulty]));
                if (supabase) await upsertSupabaseData('questionbank', items);
                return res.status(200).json({ message: `Imported ${items.length} questions.` });
            }

            case 'bulk-upload-syllabus': {
                // Wrap in block scope to avoid redeclaring variables
                if (!csv) throw new Error("CSV data required.");
                const sData = parseCSV(csv);
                const sItems = sData.rows.map(row => ({
                    id: row.id || `syl_${Date.now()}_${Math.random()}`,
                    exam_id: row.exam_id || row.examid || '',
                    title: row.title || '',
                    questions: parseInt(row.questions || '20'),
                    duration: parseInt(row.duration || '20'),
                    subject: row.subject || '',
                    topic: row.topic || ''
                }));
                await appendSheetData('Syllabus!A1', sItems.map(it => [it.id, it.exam_id, it.title, it.questions, it.duration, it.subject, it.topic]));
                if (supabase) await upsertSupabaseData('syllabus', sItems);
                return res.status(200).json({ message: `Imported ${sItems.length} syllabus entries.` });
            }

            case 'sync-all': {
                // Wrap in block scope to avoid redeclaring variables
                if (!supabase) throw new Error("Supabase missing.");
                const [exs, snl, qbs, bks, syls, nfs, cas, gks, ups] = await Promise.all([
                    readSheetData('Exams!A2:H'), readSheetData('Settings!A2:B'),
                    readSheetData('QuestionBank!A2:H'), readSheetData('Bookstore!A2:E'),
                    readSheetData('Syllabus!A2:G'), readSheetData('Notifications!A2:E'),
                    readSheetData('CurrentAffairs!A2:D'), readSheetData('GK!A2:C'),
                    readSheetData('LiveUpdates!A2:D')
                ]);
                
                const normalizedQ = qbs.filter(r => r[0]).map(r => ({
                    id: parseInt(String(r[0])), topic: r[1], question: r[2], options: smartParseOptions(r[3]),
                    correct_answer_index: parseInt(String(r[4] || '1')), subject: r[5], difficulty: r[6]
                }));

                await Promise.all([
                    upsertSupabaseData('exams', exs.filter(r => r[0]).map(r => ({ id: String(r[0]), title_ml: r[1], title_en: r[2], description_ml: r[3], description_en: r[4], category: r[5], level: r[6], icon_type: r[7] }))),
                    upsertSupabaseData('settings', snl.filter(r => r[0]).map(r => ({ key: String(r[0]), value: String(r[1] || '') })), 'key'),
                    upsertSupabaseData('questionbank', normalizedQ),
                    upsertSupabaseData('bookstore', bks.filter(r => r[0]).map(r => ({ id: String(r[0]), title: r[1], author: r[2], imageUrl: r[3], amazonLink: r[4] }))),
                    upsertSupabaseData('syllabus', syls.filter(r => r[0]).map(r => ({ id: String(r[0]), exam_id: String(r[1]), title: r[2], questions: parseInt(r[3]), duration: parseInt(r[4]), subject: r[5], topic: r[6] }))),
                    upsertSupabaseData('notifications', nfs.filter(r => r[0]).map(r => ({ id: String(r[0]), title: r[1], categoryNumber: r[2], lastDate: r[3], link: r[4] }))),
                    upsertSupabaseData('currentaffairs', cas.filter(r => r[0]).map(r => ({ id: String(r[0]), title: r[1], source: r[2], date: r[3] }))),
                    upsertSupabaseData('gk', gks.filter(r => r[0]).map(r => ({ id: String(r[0]), fact: r[1], category: r[2] }))),
                    upsertSupabaseData('liveupdates', ups.filter(r => r[0]).map(r => ({ id: createNumericHash(String(r[1]) || String(r[0])), title: r[0], url: r[1], section: r[2], published_date: r[3] })))
                ]);
                return res.status(200).json({ message: 'Cloud Layers Fully Rebuilt.' });
            }

            case 'flush-data': {
                // Wrap in block scope to avoid redeclaring variables
                if (!targetTable) throw new Error("Table missing.");
                const tableToFlush = String(targetTable).toLowerCase();
                if (supabase) await supabase.from(tableToFlush).delete().neq('id', -1);
                const sheetMapping: Record<string, string> = { 'questionbank': 'QuestionBank', 'syllabus': 'Syllabus', 'results': 'Results', 'notifications': 'Notifications', 'liveupdates': 'LiveUpdates', 'bookstore': 'Bookstore', 'currentaffairs': 'CurrentAffairs', 'gk': 'GK' };
                if (sheetMapping[tableToFlush]) await clearAndWriteSheetData(`${sheetMapping[tableToFlush]}!A2:Z`, []);
                return res.status(200).json({ message: `Table ${tableToFlush} cleared.` });
            }

            case 'sync-syllabus-linking': {
                // Wrap in block scope to avoid redeclaring variables
                if (!supabase) throw new Error("Supabase required.");
                const { data: qData } = await supabase.from('questionbank').select('topic, subject');
                const counts: Record<string, number> = {};
                qData?.forEach(q => { const key = String(q.topic || q.subject).toLowerCase().trim(); counts[key] = (counts[key] || 0) + 1; });
                const { data: sData } = await supabase.from('syllabus').select('*');
                if (sData) {
                    const updates = sData.map(s => {
                        const topicKey = String(s.topic || s.title).toLowerCase().trim();
                        const subjectKey = String(s.subject).toLowerCase().trim();
                        const available = counts[topicKey] || counts[subjectKey] || 0;
                        return { ...s, questions: available > 0 ? available : s.questions };
                    });
                    await upsertSupabaseData('syllabus', updates);
                }
                return res.status(200).json({ message: "Syllabus updated with current question counts." });
            }

            case 'add-question': {
                // Wrap in block scope to avoid redeclaring variables
                const opts = smartParseOptions(question.options);
                const finalIdx = parseInt(String(question.correct_answer_index || '1'));
                const qId = question.id ? parseInt(question.id) : Date.now();
                await findAndUpsertRow('QuestionBank', String(qId), [qId, question.topic, question.question, JSON.stringify(opts), finalIdx, question.subject, question.difficulty]);
                if (supabase) await upsertSupabaseData('questionbank', [{ id: qId, topic: question.topic, question: question.question, options: opts, correct_answer_index: finalIdx, subject: question.subject, difficulty: question.difficulty }]);
                return res.status(200).json({ message: 'Question Saved (1-4 index).' });
            }

            case 'update-exam':
                await findAndUpsertRow('Exams', exam.id, [exam.id, exam.title_ml, exam.title_en || exam.title_ml, exam.description_ml, exam.description_ml, exam.category, exam.level, exam.icon_type]);
                if (supabase) await upsertSupabaseData('exams', [{ id: exam.id, title_ml: exam.title_ml, title_en: exam.title_en || exam.title_ml, description_ml: exam.description_ml, description_en: exam.description_ml, category: exam.category, level: exam.level, icon_type: exam.icon_type }]);
                return res.status(200).json({ message: 'Exam Registered.' });

            case 'update-syllabus': {
                // Wrap in block scope to avoid redeclaring variables
                const sylId = syllabus.id || `syl_${Date.now()}`;
                await findAndUpsertRow('Syllabus', String(sylId), [sylId, syllabus.exam_id, syllabus.title, syllabus.questions, syllabus.duration, syllabus.subject, syllabus.topic]);
                if (supabase) await upsertSupabaseData('syllabus', [{ id: String(sylId), exam_id: syllabus.exam_id, title: syllabus.title, questions: parseInt(syllabus.questions), duration: parseInt(syllabus.duration), subject: syllabus.subject, topic: syllabus.topic }]);
                return res.status(200).json({ message: 'Syllabus Updated.' });
            }

            case 'delete-row':
                await deleteRowById(sheet, id);
                if (supabase) await deleteSupabaseRow(sheet, id);
                return res.status(200).json({ message: 'Deleted.' });

            case 'test-connection': {
                // Wrap in block scope to avoid redeclaring variables
                let sS = false, sbS = false;
                try { await readSheetData('Settings!A1:A1'); sS = true; } catch (e) {}
                try { if (supabase) { const { error } = await supabase.from('settings').select('key').limit(1); sbS = !error; } } catch (e) {}
                return res.status(200).json({ status: { sheets: sS, supabase: sbS } });
            }

            case 'run-scraper-notifications': return res.status(200).json(await scrapeKpscNotifications());
            case 'run-scraper-updates': return res.status(200).json(await scrapePscLiveUpdates());
            case 'run-scraper-affairs': return res.status(200).json(await scrapeCurrentAffairs());
            case 'run-scraper-gk': return res.status(200).json(await scrapeGk());
            case 'run-scraper-questions': return res.status(200).json(await generateNewQuestions());
            case 'run-book-scraper': return res.status(200).json(await runBookScraper());

            default: return res.status(400).json({ error: 'Invalid Action' });
        }
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
}
