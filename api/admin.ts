
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
                return inner.split('|').map(s => s.trim());
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
 * Intelligent Audit: Fixes Syllabus subject/topic based on actual data in QuestionBank.
 */
async function auditAndRepairSyllabus() {
    if (!supabase) throw new Error("Supabase required for audit.");
    
    // 1. Get all unique tags from QuestionBank
    const { data: qbData } = await supabase.from('questionbank').select('subject, topic');
    if (!qbData || qbData.length === 0) return { message: "Question Bank is empty." };
    
    const validSubjects = new Set<string>(qbData.map(q => String(q.subject || '').trim()).filter(Boolean));
    const validTopics = new Set<string>(qbData.map(q => String(q.topic || '').trim()).filter(Boolean));
    
    // 2. Get all Syllabus entries
    // Fixed: Removed invalid self-reference 'await syllabus ?' which caused usage before declaration error.
    const { data: syllabus } = await supabase.from('syllabus').select('*');
    if (!syllabus || syllabus.length === 0) return { message: "Syllabus table is empty." };
    
    let repairedCount = 0;
    const repairedItems = [];

    for (const item of syllabus) {
        let changed = false;
        let s = String(item.subject || '').trim();
        let t = String(item.topic || '').trim();

        if (s && !validSubjects.has(s)) {
            const match = Array.from(validSubjects).find((vs: string) => vs.toLowerCase() === s.toLowerCase() || vs.toLowerCase().includes(s.toLowerCase()));
            if (match) { s = match; changed = true; }
        }

        if (t && !validTopics.has(t)) {
            const match = Array.from(validTopics).find((vt: string) => vt.toLowerCase() === t.toLowerCase() || vt.toLowerCase().includes(t.toLowerCase()));
            if (match) { t = match; changed = true; }
        }

        if (changed) {
            const updated = { ...item, subject: s, topic: t };
            repairedItems.push(updated);
            repairedCount++;
            await findAndUpsertRow('Syllabus', String(item.id), [item.id, item.exam_id, item.title, item.questions, item.duration, s, t]);
        }
    }

    if (repairedCount > 0) {
        await upsertSupabaseData('syllabus', repairedItems);
        return { message: `Linking Audit Finished. Repaired ${repairedCount} syllabus entries to match Question Bank tags.` };
    }
    return { message: "Audit Finished. All syllabus entries are already correctly mapped to Question Bank tags." };
}

/**
 * Parses CSV string into an array of objects
 */
function parseCSV(csv: string) {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(',').map(h => h.trim());

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const obj: any = {};
        const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split by comma but respect quotes
        
        for (let j = 0; j < headers.length; j++) {
            let val = currentline[j]?.trim();
            if (val?.startsWith('"') && val?.endsWith('"')) val = val.substring(1, val.length - 1);
            obj[headers[j]] = val;
        }
        result.push(obj);
    }
    return result;
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
                const parsed = parseCSV(csv);
                const baseId = Date.now();
                const sheetRows = parsed.map((q, idx) => [
                    q.id || (baseId + idx),
                    q.topic,
                    q.question,
                    q.options,
                    q.correctAnswerIndex,
                    q.subject,
                    q.difficulty || 'Moderate'
                ]);
                const sbItems = parsed.map((q, idx) => ({
                    id: parseInt(String(q.id || (baseId + idx))),
                    topic: q.topic,
                    question: q.question,
                    options: smartParseOptions(q.options),
                    correct_answer_index: parseInt(String(q.correctAnswerIndex)),
                    subject: q.subject,
                    difficulty: q.difficulty || 'Moderate'
                }));
                
                await appendSheetData('QuestionBank!A1', sheetRows);
                if (supabase) await upsertSupabaseData('questionbank', sbItems);
                return res.status(200).json({ message: `${parsed.length} questions imported successfully.` });

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

            case 'sync-syllabus-linking': 
                return res.status(200).json(await auditAndRepairSyllabus());

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
