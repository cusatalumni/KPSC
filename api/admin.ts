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
    
    // Explicitly typed the sets as string sets to prevent 'unknown' issues in Array.from processing
    const validSubjects = new Set<string>(qbData.map(q => String(q.subject || '').trim()).filter(Boolean));
    const validTopics = new Set<string>(qbData.map(q => String(q.topic || '').trim()).filter(Boolean));
    
    // 2. Get all Syllabus entries
    const { data: syllabus } = await supabase.from('syllabus').select('*');
    if (!syllabus || syllabus.length === 0) return { message: "Syllabus table is empty." };
    
    let repairedCount = 0;
    const repairedItems = [];

    for (const item of syllabus) {
        let changed = false;
        let s = String(item.subject || '').trim();
        let t = String(item.topic || '').trim();

        // Match Subject
        if (s && !validSubjects.has(s)) {
            // Find fuzzy match or fallback to closest. Added explicit string type for vs.
            const match = Array.from(validSubjects).find((vs: string) => vs.toLowerCase() === s.toLowerCase() || vs.toLowerCase().includes(s.toLowerCase()));
            if (match) { s = match; changed = true; }
        }

        // Match Topic
        if (t && !validTopics.has(t)) {
            // Find fuzzy match or fallback to closest. Added explicit string type for vt.
            const match = Array.from(validTopics).find((vt: string) => vt.toLowerCase() === t.toLowerCase() || vt.toLowerCase().includes(t.toLowerCase()));
            if (match) { t = match; changed = true; }
        }

        if (changed) {
            const updated = { ...item, subject: s, topic: t };
            repairedItems.push(updated);
            repairedCount++;
            
            // Sync to Sheets too
            await findAndUpsertRow('Syllabus', String(item.id), [item.id, item.exam_id, item.title, item.questions, item.duration, s, t]);
        }
    }

    if (repairedCount > 0) {
        await upsertSupabaseData('syllabus', repairedItems);
        return { message: `Linking Audit Finished. Repaired ${repairedCount} syllabus entries to match Question Bank tags.` };
    }

    return { message: "Audit Finished. All syllabus entries are already correctly mapped to Question Bank tags." };
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
    const { action, sheet, id, resultData, setting, question, exam, syllabus, book } = req.body;

    // Public actions
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

    // Admin authorization
    try { await verifyAdmin(req); } catch (e: any) { return res.status(401).json({ error: e.message }); }

    try {
        switch (action) {
            case 'sync-all':
                if (!supabase) throw new Error("Supabase connection missing.");
                const [exs, snl, qbs, bks, syls, nfs, cas, gks, ups, smc] = await Promise.all([
                    readSheetData('Exams!A2:H'), readSheetData('Settings!A2:B'),
                    readSheetData('QuestionBank!A2:H'), readSheetData('Bookstore!A2:E'),
                    readSheetData('Syllabus!A2:G'), readSheetData('Notifications!A2:E'),
                    readSheetData('CurrentAffairs!A2:D'), readSheetData('GK!A2:C'),
                    readSheetData('LiveUpdates!A2:D'), readSheetData('StudyMaterialsCache!A2:C')
                ]);
                
                await Promise.all([
                    upsertSupabaseData('exams', exs.filter(r => r[0]).map(r => ({ id: String(r[0]), title_ml: r[1], title_en: r[2], description_ml: r[3], description_en: r[4], category: r[5], level: r[6], icon_type: r[7] }))),
                    upsertSupabaseData('settings', snl.filter(r => r[0]).map(r => ({ key: r[0], value: r[1] })), 'key'),
                    upsertSupabaseData('questionbank', qbs.filter(r => r[0] && !isNaN(parseInt(String(r[0])))).map(r => ({ id: parseInt(String(r[0])), topic: r[1], question: r[2], options: smartParseOptions(r[3]), correct_answer_index: r[4], subject: r[5], difficulty: r[6] }))),
                    upsertSupabaseData('bookstore', bks.filter(r => r[0]).map(r => ({ id: String(r[0]), title: r[1], author: r[2], imageUrl: r[3], amazonLink: r[4] }))),
                    upsertSupabaseData('syllabus', syls.filter(r => r[0]).map(r => ({ id: String(r[0]), exam_id: String(r[1]), title: r[2], questions: r[3], duration: r[4], subject: r[5], topic: r[6] }))),
                    upsertSupabaseData('notifications', nfs.filter(r => r[0]).map(r => ({ id: String(r[0]), title: r[1], categoryNumber: r[2], lastDate: r[3], link: r[4] }))),
                    upsertSupabaseData('currentaffairs', cas.filter(r => r[0]).map(r => ({ id: String(r[0]), title: r[1], source: r[2], date: r[3] }))),
                    upsertSupabaseData('gk', gks.filter(r => r[0]).map(r => ({ id: String(r[0]), fact: r[1], category: r[2] }))),
                    upsertSupabaseData('liveupdates', ups.filter(r => r[0]).map(r => ({ id: createNumericHash(String(r[1]) || String(r[0])), title: r[0], url: r[1], section: r[2], published_date: r[3] }))),
                    upsertSupabaseData('studymaterialscache', smc.filter(r => r[0]).map(r => ({ topic: r[0], content: r[1], last_updated: r[2] })), 'topic')
                ]);
                return res.status(200).json({ message: 'Master Push: Cloud Layers Synchronized.' });

            case 'clear-study-cache':
                await clearAndWriteSheetData('StudyMaterialsCache!A2:C', []);
                if (supabase) await supabase.from('studymaterialscache').delete().neq('topic', '');
                return res.status(200).json({ message: 'AI Cache Flushed Successfully.' });

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
