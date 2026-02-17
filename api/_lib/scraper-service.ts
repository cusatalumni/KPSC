
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

/**
 * Advanced unescaping and array normalization.
 * Fixes: ["\"[\\\"A\\\",\\\"B\\\"]\""] and other nested formats.
 */
const ensureArray = (raw: any): string[] => {
    if (!raw) return [];
    
    let processed = raw;
    
    // Handle array-wrapped stringified arrays
    if (Array.isArray(processed) && processed.length === 1 && typeof processed[0] === 'string') {
        processed = processed[0];
    }

    if (typeof processed === 'string') {
        let clean = processed.trim();
        
        // Remove outer quotes if they exist (e.g. ""[...]"" )
        if (clean.startsWith('"') && clean.endsWith('"')) {
            clean = clean.slice(1, -1);
        }
        
        // Unescape backslashes
        clean = clean.replace(/\\"/g, '"').replace(/\\\\/g, '\\');

        try {
            const parsed = JSON.parse(clean);
            if (Array.isArray(parsed)) return parsed.map(String);
            if (typeof parsed === 'string') return ensureArray(parsed); // Recurse for deeply nested
        } catch (e) {
            // If parse fails, handle pipe or comma strings
            if (clean.includes('|')) return clean.split('|').map(s => s.trim());
            if (clean.startsWith('[') && clean.endsWith(']')) {
                return clean.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, ''));
            }
        }
    }

    if (Array.isArray(processed)) return processed.map(String);
    return [String(processed)];
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

function constructAmazonImg(asin?: string): string {
    if (!asin || asin.length < 5) return "";
    return `https://images-na.ssl-images-amazon.com/images/P/${asin.toUpperCase()}.01._SCLZZZZZZZ_SX400_.jpg`;
}

export async function generateFlashcardsFromContent() {
    if (!supabase) throw new Error("Supabase required.");
    const [{ data: gk }, { data: questions }] = await Promise.all([
        supabase.from('gk').select('fact, category').limit(20),
        supabase.from('questionbank').select('question, options, correct_answer_index, topic').limit(20)
    ]);
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Generate 15 Flashcards in Malayalam based on: ${JSON.stringify({gk, questions})}. Return JSON array with 'front', 'back', 'topic'.`,
            config: { responseMimeType: "application/json" }
        });
        const newCards = JSON.parse(response.text || "[]");
        if (newCards.length > 0) {
            const baseId = await getNextId('Flashcards!A2:A', 9000);
            const formatted = newCards.map((c: any, idx: number) => ({ id: String(baseId + idx), front: c.front, back: c.back, topic: c.topic || 'General' }));
            await upsertSupabaseData('flashcards', formatted);
            await appendSheetData('Flashcards!A1', formatted.map((c: any) => [c.id, c.front, c.back, c.topic]));
            return { message: `Generated ${formatted.length} cards.` };
        }
    } catch (e: any) { throw e; }
}

export async function auditAndCorrectQuestions() {
    if (!supabase) throw new Error("Supabase required for Audit.");
    
    const { data: settings } = await supabase.from('settings').select('value').eq('key', 'last_audited_id').single();
    const lastId = parseInt(settings?.value || '0');
    
    const { data: questions } = await supabase.from('questionbank')
        .select('*')
        .gt('id', lastId)
        .order('id', { ascending: true })
        .limit(40);

    if (!questions || questions.length === 0) {
        return { message: "All questions have been audited! Reset cursor if you want to re-audit.", nextId: 0, completed: true };
    }

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Audit these PSC questions. 
            Tasks: 
            1. Fix Malayalam grammar.
            2. Verify facts.
            3. CRITICAL: Ensure 'options' is a pure array of 4 strings (NO extra escaping).
            4. Ensure 'correct_answer_index' is 1-4.
            Data: ${JSON.stringify(questions)}`,
            config: { responseMimeType: "application/json" }
        });

        const corrected = JSON.parse(response.text || "[]");
        if (corrected.length > 0) {
            const sanitized = corrected.map((q: any) => ({
                ...q,
                options: ensureArray(q.options),
                correct_answer_index: parseInt(String(q.correct_answer_index || 1))
            }));

            await upsertSupabaseData('questionbank', sanitized);
            for (const q of sanitized) {
                await findAndUpsertRow('QuestionBank', String(q.id), [q.id, q.topic, q.question, JSON.stringify(q.options), q.correct_answer_index, q.subject, q.difficulty, q.explanation || '']);
            }

            const maxIdBatch = Math.max(...sanitized.map((q:any) => q.id));
            await Promise.all([
                upsertSupabaseData('settings', [{ key: 'last_audited_id', value: String(maxIdBatch) }], 'key'),
                findAndUpsertRow('Settings', 'last_audited_id', ['last_audited_id', String(maxIdBatch)])
            ]);

            return { 
                message: `Success: Audited IDs up to ${maxIdBatch}.`, 
                nextId: maxIdBatch + 1,
                count: sanitized.length
            };
        }
    } catch (e: any) { throw e; }
    return { message: "Batch processed but no changes needed." };
}

export async function generateQuestionsForGaps(batchSize: number = 5) {
    if (!supabase) throw new Error("Supabase required.");
    const { data: sData } = await supabase.from('syllabus').select('*');
    if (!sData) return { message: "No syllabus found." };

    const { data: qCountData } = await supabase.rpc('get_topic_counts'); 
    // Fallback if RPC not available: manually count or just pick empty ones
    const topics = sData.slice(0, batchSize).map(s => s.topic || s.title);

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: `Generate 25 PSC MCQs in Malayalam for topics: ${topics.join(', ')}. Return JSON array with topic, subject, question, options (4 strings), correctAnswerIndex (1-4), explanation.`,
            config: { responseMimeType: "application/json" }
        });

        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const { data: maxIdRow } = await supabase.from('questionbank').select('id').order('id', { ascending: false }).limit(1).single();
            let currentId = (maxIdRow?.id || 50000) + 1;

            const sbData = items.map((item: any) => ({
                id: currentId++, 
                topic: item.topic, 
                question: item.question, 
                options: ensureArray(item.options), 
                correct_answer_index: parseInt(String(item.correctAnswerIndex || 1)), 
                subject: item.subject || 'General', 
                difficulty: 'PSC Level',
                explanation: item.explanation || ''
            }));

            await upsertSupabaseData('questionbank', sbData);
            const sheetRows = sbData.map(q => [q.id, q.topic, q.question, JSON.stringify(q.options), q.correct_answer_index, q.subject, q.difficulty, q.explanation]);
            await appendSheetData('QuestionBank!A1', sheetRows);

            return { message: `Added ${sbData.length} new questions.` };
        }
    } catch (e: any) { throw e; }
}

export async function runDailyUpdateScrapers() {
    await scrapeKpscNotifications();
    await scrapePscLiveUpdates();
    await scrapeCurrentAffairs();
    await scrapeGkFacts();
    await generateQuestionsForGaps(3);
    return { message: "Sync Finished." };
}

export async function syncAllFromSheetsToSupabase() {
    if (!supabase) throw new Error("No Supabase.");
    const tables = [
        { sheet: 'Exams', supabase: 'exams', map: (r: any) => ({ id: r[0], title_ml: r[1], title_en: r[2], description_ml: r[3], description_en: r[4], category: r[5], level: r[6], icon_type: r[7] }) },
        { sheet: 'Syllabus', supabase: 'syllabus', map: (r: any) => ({ id: r[0], exam_id: r[1], title: r[2], questions: parseInt(r[3] || '0'), duration: parseInt(r[4] || '0'), subject: r[5], topic: r[6] }) },
        { sheet: 'QuestionBank', supabase: 'questionbank', map: (r: any) => ({ id: parseInt(r[0]), topic: r[1], question: r[2], options: ensureArray(r[3]), correct_answer_index: parseInt(r[4] || '1'), subject: r[5], difficulty: r[6], explanation: r[7] }) },
        { sheet: 'Bookstore', supabase: 'bookstore', map: (r: any) => ({ id: r[0], title: r[1], author: r[2], imageUrl: r[3], amazonLink: r[4] }) }
    ];
    for (const t of tables) {
        const rows = await readSheetData(`${t.sheet}!A2:Z`);
        if (rows?.length) await upsertSupabaseData(t.supabase, rows.filter(r => r[0]).map(t.map));
    }
    return { message: "Sync Done." };
}

export async function scrapeGkFacts() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "10 PSC facts in Malayalam. JSON: fact, category.",
            config: { responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const baseId = await getNextId('GK!A2:A', 5000);
            const sbData = items.map((it: any, idx: number) => ({ id: String(baseId + idx), fact: it.fact, category: it.category }));
            await upsertSupabaseData('gk', sbData);
            await appendSheetData('GK!A1', sbData.map(it => [it.id, it.fact, it.category]));
            return { message: `Added ${items.length} facts.` };
        }
    } catch (e: any) { throw e; }
}

export async function scrapeCurrentAffairs() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "10 CA items. JSON: title, source, date.",
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const baseId = await getNextId('CurrentAffairs!A2:A', 8000);
            const sbData = items.map((it: any, idx: number) => ({ id: String(baseId + idx), title: it.title, source: it.source, date: it.date }));
            await upsertSupabaseData('currentaffairs', sbData);
            await appendSheetData('CurrentAffairs!A1', sbData.map(it => [it.id, it.title, it.source, it.date]));
            return { message: `Updated CA.` };
        }
    } catch (e: any) { throw e; }
}

export async function scrapeKpscNotifications() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `5 jobs from keralapsc.gov.in. JSON: title, categoryNumber, lastDate, link.`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const baseId = await getNextId('Notifications!A2:A', 1000);
        const items = JSON.parse(response.text || "[]");
        const sbData = items.map((item: any, idx: number) => ({ id: String(baseId + idx), title: item.title, categoryNumber: item.categoryNumber, lastDate: item.lastDate, link: item.link }));
        await upsertSupabaseData('notifications', sbData);
        await appendSheetData('Notifications!A1', sbData.map(it => [it.id, it.title, it.categoryNumber, it.lastDate, it.link]));
        return { message: `Updated Notifications.` };
    } catch (e: any) { throw e; }
}

export async function runBookScraper() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: `Find 8 Kerala PSC guides on Amazon.in. JSON: title, author, asin, amazonLink.`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const baseId = await getNextId('Bookstore!A2:A', 3000);
            const finalItems = items.map((it: any, idx: number) => ({ id: String(baseId + idx), title: it.title, author: it.author, imageUrl: constructAmazonImg(it.asin), amazonLink: formatAffiliateLink(it.amazonLink, it.asin) }));
            await upsertSupabaseData('bookstore', finalItems);
            await appendSheetData('Bookstore!A1', finalItems.map(it => [it.id, it.title, it.author, it.imageUrl, it.amazonLink]));
            return { message: `Synced Books.` };
        }
    } catch (e: any) { throw e; }
}

export async function scrapePscLiveUpdates() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `5 results from keralapsc.gov.in. JSON: title, url, section, published_date.`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const sbData = items.map((it: any) => ({ id: createNumericHash(it.url || it.title), title: it.title, url: it.url, section: it.section, published_date: it.published_date }));
            await upsertSupabaseData('liveupdates', sbData);
            await appendSheetData('LiveUpdates!A1', sbData.map(it => [it.title, it.url, it.section, it.published_date]));
        }
        return { message: `Synced Updates.` };
    } catch (e: any) { throw e; }
}

export async function auditAndCorrectBooks() {
    if (!supabase) throw new Error("No Supabase.");
    const { data: books } = await supabase.from('bookstore').select('*');
    if (!books?.length) return { message: "No books." };
    const repair = books.filter(b => !b.imageUrl || b.imageUrl.length < 10 || b.imageUrl.includes('NO IMG')).slice(0, 5);
    if (!repair.length) return { message: "Books OK." };
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Find Amazon images for: ${JSON.stringify(repair)}. JSON array: id, title, author, imageUrl, amazonLink.`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const corrected = JSON.parse(response.text || "[]");
        if (corrected.length) {
            await upsertSupabaseData('bookstore', corrected);
            return { message: `Repaired ${corrected.length} books.` };
        }
    } catch (e) { throw e; }
}
