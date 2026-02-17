
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
 */
const ensureArray = (raw: any): string[] => {
    if (!raw) return [];
    let processed = raw;
    if (Array.isArray(processed) && processed.length === 1 && typeof processed[0] === 'string') {
        processed = processed[0];
    }
    if (typeof processed === 'string') {
        let clean = processed.trim();
        if (clean.startsWith('"') && clean.endsWith('"')) clean = clean.slice(1, -1);
        clean = clean.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        try {
            const parsed = JSON.parse(clean);
            if (Array.isArray(parsed)) return parsed.map(String);
            if (typeof parsed === 'string') return ensureArray(parsed);
        } catch (e) {
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

export async function generateQuestionsForGaps(batchSizeOrTopic: number | string = 5) {
    if (!supabase) throw new Error("Supabase required.");
    
    let targetTopics: string[] = [];
    let countPerTopic = 5;

    if (typeof batchSizeOrTopic === 'string') {
        targetTopics = [batchSizeOrTopic];
        countPerTopic = 15;
    } else {
        const { data: sData } = await supabase.from('syllabus').select('topic, title');
        if (!sData) return { message: "No syllabus found." };
        
        const { data: qData } = await supabase.from('questionbank').select('topic');
        const counts: Record<string, number> = {};
        qData?.forEach(q => { const t = String(q.topic || '').toLowerCase().trim(); if (t) counts[t] = (counts[t] || 0) + 1; });

        const gaps = sData
            .map(s => ({ topic: s.topic || s.title, count: counts[String(s.topic || s.title).toLowerCase().trim()] || 0 }))
            .sort((a, b) => a.count - b.count);
        
        targetTopics = gaps.slice(0, batchSizeOrTopic as number).map(g => g.topic);
    }

    if (targetTopics.length === 0) return { message: "No topics identified." };

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: `Generate high-quality Kerala PSC MCQs for these topics: ${targetTopics.join(', ')}. 
            
            STRICT LANGUAGE RULES:
            1. ENGLISH SUBJECT: If the subject is 'English', keep it in English.
            2. TECHNICAL SUBJECTS: If the subject is Engineering, IT, Computer Science, Nursing, or any professional technical field, generate the question and options in ENGLISH only.
            3. GENERAL SUBJECTS: For History, Geography, Science, Malayalam, etc., generate in professional MALAYALAM.
            
            Return JSON array of objects with: topic, subject, question, options (array of 4 strings), correctAnswerIndex (1-4), explanation.`,
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
                correct_answer_index: parseInt(String(item.correctAnswerIndex || item.correct_answer_index || 1)), 
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
    return { message: "Process finished." };
}

export async function auditAndCorrectQuestions() {
    if (!supabase) throw new Error("Supabase required.");
    const { data: settings } = await supabase.from('settings').select('value').eq('key', 'last_audited_id').single();
    const lastId = parseInt(settings?.value || '0');
    const { data: questions } = await supabase.from('questionbank').select('*').gt('id', lastId).order('id', { ascending: true }).limit(40);
    if (!questions || questions.length === 0) return { message: "Audit complete.", nextId: 0, completed: true };

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `You are an expert Kerala PSC content auditor. Audit these questions for factual accuracy and grammar.
            
            CRITICAL LANGUAGE RULES:
            1. SUBJECT CHECK (ENGLISH/TECHNICAL): If the 'subject' is 'English', 'Engineering', 'IT', 'Computer Science', or 'Technical', you MUST keep the question and options in English. If it is currently in Malayalam, REVERT/RE-WRITE IT BACK TO ENGLISH.
            2. OTHERS: For all other general subjects, ensure the text is in professional Malayalam.
            3. CORRECTNESS: Verify the facts and ensure the 'correct_answer_index' (1-4) is accurate.
            4. EXPLANATION: Add a short, helpful explanation in the same language as the question.
            
            Maintain the JSON structure exactly. Data: ${JSON.stringify(questions)}`,
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
            const maxIdBatch = Math.max(...sanitized.map((q:any) => q.id));
            await Promise.all([
                upsertSupabaseData('settings', [{ key: 'last_audited_id', value: String(maxIdBatch) }], 'key'),
                findAndUpsertRow('Settings', 'last_audited_id', ['last_audited_id', String(maxIdBatch)])
            ]);
            return { message: `Audited up to ID ${maxIdBatch}. Incorrect language mappings for Technical/English subjects have been repaired.`, nextId: maxIdBatch + 1 };
        }
    } catch (e: any) { throw e; }
    return { message: "Batch processed." };
}

/**
 * Specifically finds questions in Technical/English subjects and ensures they are in English.
 */
export async function repairLanguageMismatches() {
    if (!supabase) throw new Error("Supabase required.");
    
    // Find questions in technical subjects
    const technicalSubjects = ['English', 'Engineering', 'IT', 'Computer Science', 'Technical', 'Nursing'];
    const { data: mismatches } = await supabase
        .from('questionbank')
        .select('*')
        .in('subject', technicalSubjects)
        .limit(30);

    if (!mismatches || mismatches.length === 0) return { message: "No language mismatches found in current batch." };

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `You are a technical content restorer. These questions belong to technical subjects but may have been incorrectly translated to Malayalam. 
            
            YOUR TASK:
            1. Restore the question and all options to professional English.
            2. Ensure the technical terminology is accurate.
            3. Keep the same 'id' and 'correct_answer_index'.
            4. Provide the explanation in English.
            
            Return JSON array of updated objects: ${JSON.stringify(mismatches)}`,
            config: { responseMimeType: "application/json" }
        });

        const repaired = JSON.parse(response.text || "[]");
        if (repaired.length > 0) {
            const sanitized = repaired.map((q: any) => ({
                ...q,
                options: ensureArray(q.options),
                correct_answer_index: parseInt(String(q.correct_answer_index || 1))
            }));
            await upsertSupabaseData('questionbank', sanitized);
            return { message: `Repaired ${repaired.length} technical questions. They are now back in English.` };
        }
    } catch (e: any) { throw e; }
    return { message: "Repair batch processed." };
}

export async function runDailyUpdateScrapers() {
    await scrapeKpscNotifications();
    await scrapePscLiveUpdates();
    await scrapeCurrentAffairs();
    await scrapeGkFacts();
    await generateQuestionsForGaps(3);
    return { message: "Daily Update Routine Finished." };
}

export async function syncAllFromSheetsToSupabase() {
    if (!supabase) throw new Error("No Supabase.");
    const tables = [
        { sheet: 'Exams', supabase: 'exams', map: (r: any) => ({ id: r[0], title_ml: r[1], title_en: r[2], description_ml: r[3], description_en: r[4], category: r[5], level: r[6], icon_type: r[7] }) },
        { sheet: 'Syllabus', supabase: 'syllabus', map: (r: any) => ({ id: r[0], exam_id: r[1], title: r[2], questions: parseInt(r[3] || '0'), duration: parseInt(r[4] || '0'), subject: r[5], topic: r[6] }) },
        { sheet: 'QuestionBank', supabase: 'questionbank', map: (r: any) => ({ id: parseInt(r[0]), topic: r[1], question: r[2], options: ensureArray(r[3]), correct_answer_index: parseInt(r[4] || '1'), subject: r[5], difficulty: r[6], explanation: r[7] }) }
    ];
    for (const t of tables) {
        const rows = await readSheetData(`${t.sheet}!A2:Z`);
        if (rows?.length) await upsertSupabaseData(t.supabase, rows.filter(r => r[0]).map(t.map));
    }
    return { message: "Sync complete." };
}

export async function scrapeGkFacts() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "10 Malayalam PSC facts. JSON: {fact, category}",
            config: { responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const baseId = await getNextId('GK!A2:A', 5000);
            const sbData = items.map((it: any, idx: number) => ({ id: String(baseId + idx), fact: it.fact, category: it.category }));
            await upsertSupabaseData('gk', sbData);
            await appendSheetData('GK!A1', sbData.map(it => [it.id, it.fact, it.category]));
            return { message: `GK synced.` };
        }
    } catch (e: any) { throw e; }
}

export async function scrapeCurrentAffairs() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "10 Latest CA items. JSON: {title, source, date}",
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const baseId = await getNextId('CurrentAffairs!A2:A', 8000);
            const sbData = items.map((it: any, idx: number) => ({ id: String(baseId + idx), title: it.title, source: it.source, date: it.date }));
            await upsertSupabaseData('currentaffairs', sbData);
            await appendSheetData('CurrentAffairs!A1', sbData.map(it => [it.id, it.title, it.source, it.date]));
            return { message: `CA synced.` };
        }
    } catch (e: any) { throw e; }
}

export async function scrapeKpscNotifications() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `5 jobs from keralapsc.gov.in. JSON: title, categoryNumber, lastDate, link`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const baseId = await getNextId('Notifications!A2:A', 1000);
        const items = JSON.parse(response.text || "[]");
        const sbData = items.map((item: any, idx: number) => ({ id: String(baseId + idx), title: item.title, categoryNumber: item.categoryNumber, lastDate: item.lastDate, link: item.link }));
        await upsertSupabaseData('notifications', sbData);
        await appendSheetData('Notifications!A1', sbData.map(it => [it.id, it.title, it.categoryNumber, it.lastDate, it.link]));
        return { message: `Jobs synced.` };
    } catch (e: any) { throw e; }
}

export async function runBookScraper() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: `8 PSC guides on Amazon.in. JSON: title, author, asin, amazonLink`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const baseId = await getNextId('Bookstore!A2:A', 3000);
            const finalItems = items.map((it: any, idx: number) => ({ id: String(baseId + idx), title: it.title, author: it.author, imageUrl: constructAmazonImg(it.asin), amazonLink: formatAffiliateLink(it.amazonLink, it.asin) }));
            await upsertSupabaseData('bookstore', finalItems);
            await appendSheetData('Bookstore!A1', finalItems.map(it => [it.id, it.title, it.author, it.imageUrl, it.amazonLink]));
        }
    } catch (e: any) { throw e; }
}

export async function scrapePscLiveUpdates() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `5 results from keralapsc.gov.in. JSON: title, url, section, published_date`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const sbData = items.map((it: any) => ({ id: createNumericHash(it.url || it.title), title: it.title, url: it.url, section: it.section, published_date: it.published_date }));
            await upsertSupabaseData('liveupdates', sbData);
            await appendSheetData('LiveUpdates!A1', sbData.map(it => [it.title, it.url, it.section, it.published_date]));
        }
    } catch (e: any) { throw e; }
}

export async function generateFlashcardsFromContent() {
    if (!supabase) throw new Error("Supabase required.");
    const { data: gkData } = await supabase.from('gk').select('*').limit(20);
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Create 10 PSC Flashcards in Malayalam based on: ${JSON.stringify(gkData)}. JSON array of objects: {front, back, topic}`,
            config: { responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const baseId = await getNextId('FlashCards!A2:A', 7000);
            const sbData = items.map((it: any, idx: number) => ({ id: String(baseId + idx), front: it.front, back: it.back, topic: it.topic || 'General' }));
            await upsertSupabaseData('flashcards', sbData);
            await appendSheetData('FlashCards!A1', sbData.map(it => [it.id, it.front, it.back, it.topic]));
            return { message: `Generated ${sbData.length} flashcards.` };
        }
    } catch (e: any) { throw e; }
    return { message: "None generated." };
}

export async function auditAndCorrectBooks() {
    if (!supabase) throw new Error("Supabase required.");
    const { data: books } = await supabase.from('bookstore').select('*');
    if (!books || books.length === 0) return { message: "No books." };
    const updated = books.map(book => {
        let link = book.amazonLink || '';
        if (link && !link.includes(AFFILIATE_TAG)) link = formatAffiliateLink(link);
        return { ...book, amazonLink: link };
    });
    await upsertSupabaseData('bookstore', updated);
    return { message: `Audited ${updated.length} books.` };
}
