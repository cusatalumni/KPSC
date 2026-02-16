
import { GoogleGenAI, Type } from "@google/genai";
import { clearAndWriteSheetData, appendSheetData, readSheetData, findAndUpsertRow } from './sheets-service.js';
import { supabase, upsertSupabaseData } from './supabase-service.js';

declare var process: any;
const AFFILIATE_TAG = 'tag=malayalambooks-21';

function getAi() {
    const key = process.env.API_KEY || process.env.GOOGLE_API_KEY;
    if (!key || key.trim() === "") {
        throw new Error("API_KEY missing.");
    }
    return new GoogleGenAI({ apiKey: key.trim() });
}

function createNumericHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

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

async function getNextId(sheetRange: string, startFrom: number = 1000): Promise<number> {
    try {
        const rows = await readSheetData(sheetRange);
        if (!rows || rows.length === 0) return startFrom;
        const ids = rows.map(r => parseInt(String(r[0]))).filter(id => !isNaN(id));
        return ids.length > 0 ? Math.max(...ids) + 1 : startFrom;
    } catch (e) { return startFrom; }
}

export function formatAffiliateLink(link: string, asin?: string): string {
    if (asin && asin.length > 5) return `https://www.amazon.in/dp/${asin}?${AFFILIATE_TAG}`;
    if (!link || !link.includes('amazon.in')) return link;
    let cleanLink = link.split('?')[0]; 
    return `${cleanLink}?${AFFILIATE_TAG}`;
}

export async function generateFlashcardsFromContent() {
    if (!supabase) throw new Error("Supabase required for Flashcard generation.");
    
    const [{ data: gk }, { data: questions }] = await Promise.all([
        supabase.from('gk').select('fact, category').limit(20),
        supabase.from('questionbank').select('question, options, correct_answer_index, topic').limit(20)
    ]);

    const sourceData = { gk, questions };
    
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Transform this data into high-quality PSC Flashcards. 
            For GK facts, create a question for 'front' and the fact detail for 'back'. 
            For QuestionBank, use the question for 'front' and the correct option text for 'back'.
            Return JSON array of objects with 'front', 'back', and 'topic'.
            Data to process: ${JSON.stringify(sourceData)}`,
            config: { responseMimeType: "application/json" }
        });

        const newCards = JSON.parse(response.text || "[]");
        if (newCards.length > 0) {
            const baseId = await getNextId('Flashcards!A2:A', 9000);
            const formatted = newCards.map((c: any, idx: number) => ({
                id: String(baseId + idx),
                front: c.front,
                back: c.back,
                topic: c.topic || 'General'
            }));

            await upsertSupabaseData('flashcards', formatted);
            const sheetRows = formatted.map((c: any) => [c.id, c.front, c.back, c.topic]);
            await appendSheetData('Flashcards!A1', sheetRows);

            return { message: `Generated ${formatted.length} new flashcards.` };
        }
    } catch (e: any) { throw e; }
    return { message: "No new flashcards could be generated." };
}

export async function syncAllFromSheetsToSupabase() {
    if (!supabase) throw new Error("Supabase connection is not available.");
    const syncLogs: string[] = [];
    const tables = [
        { sheet: 'Exams', supabase: 'exams', map: (r: any) => ({ id: r[0], title_ml: r[1], title_en: r[2], description_ml: r[3], description_en: r[4], category: r[5], level: r[6], icon_type: r[7] }) },
        { sheet: 'Syllabus', supabase: 'syllabus', map: (r: any) => ({ id: r[0], exam_id: r[1], title: r[2], questions: parseInt(r[3] || '0'), duration: parseInt(r[4] || '0'), subject: r[5], topic: r[6] }) },
        { sheet: 'QuestionBank', supabase: 'questionbank', map: (r: any) => ({ id: parseInt(r[0]), topic: r[1], question: r[2], options: smartParseOptions(r[3]), correct_answer_index: parseInt(r[4] || '1'), subject: r[5], difficulty: r[6] }) },
        { sheet: 'GK', supabase: 'gk', map: (r: any) => ({ id: r[0], fact: r[1], category: r[2] }) },
        { sheet: 'CurrentAffairs', supabase: 'currentaffairs', map: (r: any) => ({ id: r[0], title: r[1], source: r[2], date: r[3] }) },
        { sheet: 'Notifications', supabase: 'notifications', map: (r: any) => ({ id: r[0], title: r[1], categoryNumber: r[2], lastDate: r[3], link: r[4] }) },
        { sheet: 'Bookstore', supabase: 'bookstore', map: (r: any) => ({ id: r[0], title: r[1], author: r[2], imageUrl: r[3], amazonLink: r[4] }) },
        { sheet: 'Flashcards', supabase: 'flashcards', map: (r: any) => ({ id: r[0], front: r[1], back: r[2], topic: r[3] }) }
    ];

    for (const table of tables) {
        try {
            const rows = await readSheetData(`${table.sheet}!A2:Z`);
            if (rows && rows.length > 0) {
                const dataToUpsert = rows.filter(r => r[0]).map(table.map);
                if (dataToUpsert.length > 0) {
                    await upsertSupabaseData(table.supabase, dataToUpsert);
                    syncLogs.push(`Synced ${dataToUpsert.length} rows for ${table.supabase}`);
                }
            }
        } catch (err: any) {
            syncLogs.push(`Failed sync for ${table.supabase}: ${err.message}`);
        }
    }
    return { message: "Database sync completed.", details: syncLogs.join(', ') };
}

export async function scrapeGkFacts() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "Generate 10 unique Kerala PSC GK facts in Malayalam. Focus on history and geography. Return JSON array with 'fact' and 'category'.",
            config: { responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const baseId = await getNextId('GK!A2:A', 5000);
            const sbData = items.map((it: any, idx: number) => ({ id: String(baseId + idx), fact: it.fact, category: it.category }));
            await upsertSupabaseData('gk', sbData);
            return { message: `${items.length} GK facts generated.` };
        }
    } catch (e: any) { throw e; }
}

export async function scrapeCurrentAffairs() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "Research 10 latest Kerala and National current affairs for competitive exams. Return JSON array with 'title', 'source', 'date'.",
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const baseId = await getNextId('CurrentAffairs!A2:A', 8000);
            const sbData = items.map((it: any, idx: number) => ({ id: String(baseId + idx), title: it.title, source: it.source, date: it.date }));
            await upsertSupabaseData('currentaffairs', sbData);
            return { message: `${items.length} Current Affairs updated.` };
        }
    } catch (e: any) { throw e; }
}

export async function scrapeKpscNotifications() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Research 5 latest active job notifications from keralapsc.gov.in. Return JSON array with 'title', 'categoryNumber', 'lastDate', 'link'.`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const baseId = await getNextId('Notifications!A2:A', 1000);
        const items = JSON.parse(response.text || "[]");
        const sbData = items.map((item: any, idx: number) => ({ id: String(baseId + idx), title: item.title, categoryNumber: item.categoryNumber, lastDate: item.lastDate, link: item.link }));
        await upsertSupabaseData('notifications', sbData);
        return { message: `${items.length} notifications scraped.` };
    } catch (e: any) { throw e; }
}

export async function generateQuestionsForGaps(batchSize: number = 8) {
    if (!supabase) throw new Error("Supabase required for Gap Audit.");
    
    // 1. Audit current coverage
    const { data: qData } = await supabase.from('questionbank').select('topic');
    const counts: Record<string, number> = {};
    qData?.forEach(q => { const t = String(q.topic || '').toLowerCase().trim(); if (t) counts[t] = (counts[t] || 0) + 1; });

    const { data: sData } = await supabase.from('syllabus').select('*');
    if (!sData) return { message: "Syllabus is empty. No topics to check." };

    const gaps = sData.filter(s => (counts[String(s.topic || s.title).toLowerCase().trim()] || 0) < 5);
    if (gaps.length === 0) return { message: "No content gaps found. Data is balanced." };

    const targetTopics = gaps.slice(0, batchSize).map(g => g.topic || g.title);
    
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: `Generate 30 high-quality MCQ questions in Malayalam for PSC exams. 
            Target topics: ${targetTopics.join(', ')}. 
            Format: JSON array of objects with 'topic', 'subject', 'question', 'options' (array of 4), 'correctAnswerIndex' (1-4).`,
            config: { responseMimeType: "application/json" }
        });

        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            // 2. Determine safe starting ID
            const { data: maxIdRow } = await supabase.from('questionbank').select('id').order('id', { ascending: false }).limit(1).single();
            let currentId = (maxIdRow?.id || 40000) + 1;

            const sbData = items.map((item: any) => {
                const row = { 
                    id: currentId++, 
                    topic: item.topic, 
                    question: item.question, 
                    options: item.options, 
                    correct_answer_index: item.correctAnswerIndex || item.correct_answer_index || 1, 
                    subject: item.subject || 'General', 
                    difficulty: 'PSC Level' 
                };
                return row;
            });

            // 3. Save to Supabase
            await upsertSupabaseData('questionbank', sbData);
            
            // 4. Mirror to Google Sheets to ensure persistence
            const sheetRows = sbData.map(q => [
                q.id, 
                q.topic, 
                q.question, 
                JSON.stringify(q.options), 
                q.correct_answer_index, 
                q.subject, 
                q.difficulty
            ]);
            await appendSheetData('QuestionBank!A1', sheetRows);

            return { message: `Successfully added ${sbData.length} new questions to Database and Sheets for topics: ${targetTopics.join(', ')}.` };
        }
    } catch (e: any) { 
        console.error("Gap Filler Error:", e.message);
        throw e; 
    }
    return { message: "AI processing completed but no data was generated." };
}

export async function auditAndCorrectQuestions() {
    if (!supabase) throw new Error("Supabase is required for QA Audit.");
    
    const { data: settings } = await supabase.from('settings').select('value').eq('key', 'last_audited_id').single();
    const lastId = parseInt(settings?.value || '0');
    
    const { data: questions } = await supabase.from('questionbank')
        .select('*')
        .gt('id', lastId)
        .order('id', { ascending: true })
        .limit(90);

    if (!questions || questions.length === 0) {
        await upsertSupabaseData('settings', [{ key: 'last_audited_id', value: '0' }], 'key');
        await findAndUpsertRow('Settings', 'last_audited_id', ['last_audited_id', '0']);
        return { message: "Reached end of Question Bank. Audit cursor reset to beginning." };
    }

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Audit these questions for Malayalam grammar and PSC standards. Ensure options are logical. Return corrected JSON array. Data: ${JSON.stringify(questions)}`,
            config: { responseMimeType: "application/json" }
        });

        const corrected = JSON.parse(response.text || "[]");
        if (corrected.length > 0) {
            await upsertSupabaseData('questionbank', corrected);
            const maxIdBatch = Math.max(...questions.map(q => q.id));
            
            await Promise.all([
                upsertSupabaseData('settings', [{ key: 'last_audited_id', value: String(maxIdBatch) }], 'key'),
                findAndUpsertRow('Settings', 'last_audited_id', ['last_audited_id', String(maxIdBatch)])
            ]);

            return { message: `QA Audit complete for batch. Next audit will start after ID ${maxIdBatch}.` };
        }
    } catch (e: any) { throw e; }
    return { message: "Audit batch finished with no changes." };
}

export async function runDailyUpdateScrapers() {
    await scrapeKpscNotifications();
    await scrapePscLiveUpdates();
    await scrapeCurrentAffairs();
    await scrapeGkFacts();
    await generateQuestionsForGaps(5);
    await generateFlashcardsFromContent();
    return { message: "Complete Daily Routine Finished." };
}

export async function runBookScraper() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: `Find 8 top PSC rank files on Amazon.in. Return JSON array with 'title', 'author', 'asin', 'amazonLink'.`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const baseId = await getNextId('Bookstore!A2:A', 3000);
            const finalItems = items.map((it: any, idx: number) => ({ id: String(baseId + idx), title: it.title, author: it.author, imageUrl: it.asin ? `https://images-na.ssl-images-amazon.com/images/P/${it.asin}.01._SCLZZZZZZZ_SX300_.jpg` : "", amazonLink: formatAffiliateLink(it.amazonLink, it.asin) }));
            await upsertSupabaseData('bookstore', finalItems);
            return { message: `${finalItems.length} books synced.` };
        }
        return { message: "No new books found." };
    } catch (e: any) { throw e; }
}

export async function scrapePscLiveUpdates() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Find 5 latest results/notices from keralapsc.gov.in. Return JSON array with 'title', 'url', 'section', 'published_date'.`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const sbData = items.map((it: any) => ({ id: createNumericHash(it.url || it.title), title: it.title, url: it.url, section: it.section, published_date: it.published_date }));
            await upsertSupabaseData('liveupdates', sbData);
        }
        return { message: `${items.length} updates synced.` };
    } catch (e: any) { throw e; }
}
