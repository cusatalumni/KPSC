
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

/**
 * Synchronizes all data from Google Sheets to Supabase production.
 * This is a non-destructive operation that upserts existing records.
 */
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
        { sheet: 'Bookstore', supabase: 'bookstore', map: (r: any) => ({ id: r[0], title: r[1], author: r[2], imageUrl: r[3], amazonLink: r[4] }) }
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
            console.error(`Sync error for ${table.sheet}:`, err.message);
            syncLogs.push(`Failed sync for ${table.supabase}: ${err.message}`);
        }
    }

    return { 
        message: "Production database sync completed.", 
        details: syncLogs.join(', ') 
    };
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
            return { message: `${items.length} GK facts generated and synced.` };
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
            return { message: `${items.length} Current Affairs items updated.` };
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
    const { data: qData } = await supabase.from('questionbank').select('topic');
    const counts: Record<string, number> = {};
    qData?.forEach(q => { const t = String(q.topic || '').toLowerCase().trim(); if (t) counts[t] = (counts[t] || 0) + 1; });

    const { data: sData } = await supabase.from('syllabus').select('*');
    if (!sData) return { message: "Syllabus is empty. No gaps to fill." };

    const gaps = sData.filter(s => (counts[String(s.topic || s.title).toLowerCase().trim()] || 0) < 5);
    if (gaps.length === 0) return { message: "No content gaps found. Content is balanced." };

    const targetTopics = gaps.slice(0, batchSize).map(g => g.topic || g.title);
    
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: `Generate 30 high-quality MCQ questions in Malayalam for topics: ${targetTopics.join(', ')}. Format: JSON array with 'topic', 'subject', 'question', 'options', 'correctAnswerIndex' (1-4).`,
            config: { responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const baseId = await getNextId('QuestionBank!A2:A', 40000);
            const sbData = items.map((item: any, idx: number) => ({ id: baseId + idx, topic: item.topic, question: item.question, options: item.options, correct_answer_index: item.correctAnswerIndex, subject: item.subject || 'General', difficulty: 'PSC Level' }));
            await upsertSupabaseData('questionbank', sbData);
            return { message: `Added ${items.length} new questions for identified syllabus gaps.` };
        }
    } catch (e: any) { throw e; }
    return { message: "Gap filler execution finished with no new data." };
}

export async function auditAndCorrectQuestions() {
    if (!supabase) throw new Error("Supabase is required for QA Audit.");
    
    // 1. Get the current cursor from Settings
    const { data: settings } = await supabase.from('settings').select('value').eq('key', 'last_audited_id').single();
    const lastId = parseInt(settings?.value || '0');

    // 2. Fetch the "next batch" of questions
    const { data: questions } = await supabase
        .from('questionbank')
        .select('*')
        .gt('id', lastId)
        .order('id', { ascending: true })
        .limit(30);

    if (!questions || questions.length === 0) {
        // Reset cursor to 0 if we hit the end
        await findAndUpsertRow('Settings', 'last_audited_id', ['last_audited_id', '0']);
        return { message: "No new questions found. Audit cursor reset to beginning." };
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
            
            // 3. Update cursor to the highest ID processed
            const maxId = Math.max(...questions.map(q => q.id));
            await findAndUpsertRow('Settings', 'last_audited_id', ['last_audited_id', String(maxId)]);
            
            return { message: `QA Audit complete. Processed questions up to ID ${maxId}.` };
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
