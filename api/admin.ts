
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
    syncAllFromSheetsToSupabase,
    repairLanguageMismatches
} from "./_lib/scraper-service.js";
import { auditAndCorrectQuestions } from "./_lib/audit-service.js";
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
    const { action, id, resultData, sheet, data, topic, setting } = req.body;

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
            case 'run-targeted-gap-fill': return res.status(200).json(await generateQuestionsForGaps(topic));
            case 'run-book-scraper': return res.status(200).json(await runBookScraper());
            case 'run-batch-qa': return res.status(200).json(await auditAndCorrectQuestions());
            case 'run-language-repair': return res.status(200).json(await repairLanguageMismatches());
            
            case 'run-all-gaps': {
                if (!supabase) throw new Error("Supabase required.");
                const { data: sData } = await supabase.from('syllabus').select('topic, title');
                const { data: qData } = await supabase.from('questionbank').select('topic');
                const counts: Record<string, number> = {};
                qData?.forEach(q => { const t = String(q.topic || '').toLowerCase().trim(); if (t) counts[t] = (counts[t] || 0) + 1; });
                const emptyTopics = (sData || []).filter(s => (counts[String(s.topic || s.title).toLowerCase().trim()] || 0) === 0).map(s => s.topic || s.title);
                if (emptyTopics.length === 0) return res.status(200).json({ message: "No empty topics found." });
                const batch = emptyTopics.slice(0, 5);
                for (const t of batch) { try { await generateQuestionsForGaps(t); } catch (err) {} }
                return res.status(200).json({ message: `Filled gaps for ${batch.length} topics.` });
            }

            case 'update-setting': {
                if (supabase) await upsertSupabaseData('settings', [setting], 'key');
                await findAndUpsertRow('Settings', setting.key, [setting.key, setting.value]);
                return res.status(200).json({ message: `Setting updated.` });
            }

            case 'reset-qa-audit': {
                if (supabase) await upsertSupabaseData('settings', [{ key: 'last_audited_id', value: '0' }], 'key');
                await findAndUpsertRow('Settings', 'last_audited_id', ['last_audited_id', '0']);
                return res.status(200).json({ message: 'QA Audit progress reset.' });
            }

            case 'get-audit-report': {
                if (!supabase) throw new Error("Supabase required.");
                
                // Fetch topics from both tables
                const { data: qData } = await supabase.from('questionbank').select('topic');
                const { data: sData } = await supabase.from('syllabus').select('id, topic, title');
                
                // 1. Calculate Topic Counts and Syllabus Gap Report
                const counts: Record<string, number> = {};
                qData?.forEach(q => { 
                    const t = String(q.topic || '').toLowerCase().trim(); 
                    if (t) counts[t] = (counts[t] || 0) + 1; 
                });
                
                const gapReport = (sData || []).map(s => {
                    const topicKey = String(s.topic || s.title).toLowerCase().trim();
                    return { 
                        id: s.id, 
                        topic: s.topic || s.title, 
                        count: counts[topicKey] || 0 
                    };
                });

                // 2. Calculate Orphans (Topics in QBank but NOT in Syllabus)
                const syllabusTopics = new Set((sData || []).map(s => String(s.topic || s.title).toLowerCase().trim()));
                const questionTopics = new Set(Object.keys(counts));
                
                const orphanTopics = Array.from(questionTopics).filter(qt => !syllabusTopics.has(qt));
                
                return res.status(200).json({
                    syllabusReport: gapReport,
                    orphanCount: orphanTopics.length,
                    orphanTopics: orphanTopics
                });
            }
            case 'delete-row': await deleteRowById(sheet, id); if (supabase) await deleteSupabaseRow(sheet, id); return res.status(200).json({ message: 'Item deleted.' });
            default: return res.status(400).json({ error: 'Invalid Action' });
        }
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
}
