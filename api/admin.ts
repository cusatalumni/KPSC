
import { verifyAdmin } from "./_lib/clerk-auth.js";
import { findAndUpsertRow, deleteRowById, appendSheetData, readSheetData } from './_lib/sheets-service.js';
import { 
    runDailyUpdateScrapers, 
    runBookScraper, 
    scrapeKpscNotifications, 
    scrapePscLiveUpdates, 
    scrapeGkFacts,
    scrapeCurrentAffairs,
    generateQuestionsForGaps,
    auditAndCorrectQuestions,
    syncAllFromSheetsToSupabase,
    generateFlashcardsFromContent
} from "./_lib/scraper-service.js";
import { supabase, upsertSupabaseData, deleteSupabaseRow } from "./_lib/supabase-service.js";

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
    const { action, id, resultData, sheet, data } = req.body;

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
            case 'test-connection': {
                let sheetsOk = false;
                let supabaseOk = !!supabase;
                try { await readSheetData('Settings!A1:A1'); sheetsOk = true; } catch (e) { sheetsOk = false; }
                if (supabaseOk) {
                    try { const { error } = await supabase!.from('settings').select('key').limit(1); if (error) supabaseOk = false; }
                    catch (e) { supabaseOk = false; }
                }
                return res.status(200).json({ status: { sheets: sheetsOk, supabase: supabaseOk } });
            }
            case 'rebuild-db': return res.status(200).json(await syncAllFromSheetsToSupabase());
            case 'run-daily-sync': return res.status(200).json(await runDailyUpdateScrapers());
            case 'run-gk-scraper': return res.status(200).json(await scrapeGkFacts());
            case 'run-ca-scraper': return res.status(200).json(await scrapeCurrentAffairs());
            case 'run-scraper-notifications': return res.status(200).json(await scrapeKpscNotifications());
            case 'run-scraper-updates': return res.status(200).json(await scrapePscLiveUpdates());
            case 'run-gap-filler': return res.status(200).json(await generateQuestionsForGaps(8));
            case 'run-book-scraper': return res.status(200).json(await runBookScraper());
            case 'run-batch-qa': return res.status(200).json(await auditAndCorrectQuestions());
            case 'run-flashcard-generator': return res.status(200).json(await generateFlashcardsFromContent());
            
            case 'save-question': 
                if (supabase) await upsertSupabaseData('questionbank', [data]);
                await appendSheetData('QuestionBank!A1', [[data.id, data.topic, data.question, JSON.stringify(data.options), data.correct_answer_index, data.subject, data.difficulty]]);
                return res.status(200).json({ message: 'Question saved to bank.' });

            case 'bulk-upload-questions':
                if (supabase) await upsertSupabaseData('questionbank', data);
                const sheetRows = data.map((q:any) => [q.id, q.topic, q.question, JSON.stringify(q.options), q.correct_answer_index, q.subject, q.difficulty]);
                await appendSheetData('QuestionBank!A1', sheetRows);
                return res.status(200).json({ message: `Bulk upload successful. Processed ${data.length} questions.` });

            case 'get-audit-report': {
                if (!supabase) throw new Error("Supabase required for audit report.");
                const { data: qData } = await supabase.from('questionbank').select('topic');
                const counts: Record<string, number> = {};
                qData?.forEach(q => { const t = String(q.topic || '').toLowerCase().trim(); if (t) counts[t] = (counts[t] || 0) + 1; });
                const { data: sData } = await supabase.from('syllabus').select('*');
                return res.status(200).json(sData?.map(s => ({ id: s.id, topic: s.topic, count: counts[String(s.topic).toLowerCase().trim()] || 0 })) || []);
            }
            case 'delete-row': await deleteRowById(sheet, id); if (supabase) await deleteSupabaseRow(sheet, id); return res.status(200).json({ message: 'Item deleted.' });
            default: return res.status(400).json({ error: 'Invalid Action' });
        }
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
}
