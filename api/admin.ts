
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
    repairLanguageMismatches,
    backfillExplanations,
    bulkUploadQuestions
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
    const { action, id, resultData, sheet, data, topic, setting, questions, rowData } = req.body;

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
                let sheetsStatus: any = { ok: false, error: null };
                let supabaseStatus: any = { ok: false, error: null };
                
                try { 
                    await readSheetData('Settings!A1:A1'); 
                    sheetsStatus.ok = true; 
                } catch (e: any) { 
                    sheetsStatus.error = e.message || "Failed to access spreadsheet";
                }

                if (supabase) {
                    try { 
                        const { error } = await supabase.from('settings').select('key').limit(1); 
                        if (error) throw error;
                        supabaseStatus.ok = true; 
                    } catch (e: any) { 
                        supabaseStatus.error = e.message || "Failed to query Supabase table";
                    }
                } else {
                    supabaseStatus.error = "SUPABASE_URL or KEY is missing from server env";
                }

                return res.status(200).json({ status: { sheets: sheetsStatus.ok, supabase: supabaseStatus.ok, sheetsErr: sheetsStatus.error, supabaseErr: supabaseStatus.error } });
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
            case 'run-explanation-repair': return res.status(200).json(await backfillExplanations());
            case 'upload-questions': return res.status(200).json(await bulkUploadQuestions(questions));
            
            case 'save-row': {
                const tableName = sheet.toLowerCase();
                if (supabase) await upsertSupabaseData(tableName, [rowData]);
                let sheetValues: any[] = [];
                if (tableName === 'exams') {
                    sheetValues = [rowData.id, rowData.title_ml, rowData.title_en, rowData.description_ml, rowData.description_en, rowData.category, rowData.level, rowData.icon_type];
                } else if (tableName === 'bookstore') {
                    sheetValues = [rowData.id, rowData.title, rowData.author, rowData.imageUrl, rowData.amazonLink];
                }
                await findAndUpsertRow(sheet, rowData.id, sheetValues);
                return res.status(200).json({ message: `${sheet} entry updated.` });
            }

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

            case 'get-audit-report': {
                if (!supabase) throw new Error("Supabase required.");
                const { data: qData } = await supabase.from('questionbank').select('topic, subject');
                const { data: sData } = await supabase.from('syllabus').select('id, topic, title');
                const counts: Record<string, number> = {};
                let unclassifiedCount = 0;
                qData?.forEach(q => { 
                    const t = String(q.topic || '').toLowerCase().trim(); 
                    if (t) counts[t] = (counts[t] || 0) + 1; 
                    const s = String(q.subject || '').toLowerCase().trim();
                    if (s === 'other' || s.includes('manual') || s === '' || s === 'null') unclassifiedCount++;
                });
                const gapReport = (sData || []).map(s => {
                    const topicKey = String(s.topic || s.title).toLowerCase().trim();
                    return { id: s.id, topic: s.topic || s.title, count: counts[topicKey] || 0 };
                });
                return res.status(200).json({ syllabusReport: gapReport, unclassifiedCount });
            }
            case 'delete-row': await deleteRowById(sheet, id); if (supabase) await deleteSupabaseRow(sheet, id); return res.status(200).json({ message: 'Item deleted.' });
            default: return res.status(400).json({ error: 'Invalid Action' });
        }
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
}
