
import { GoogleGenAI, Type } from "@google/genai";
import { readSheetData, findAndUpsertRow } from './sheets-service.js';
import { supabase, upsertSupabaseData } from './supabase-service.js';

declare var process: any;
const AFFILIATE_TAG = 'tag=malayalambooks-21';

function getAi() {
    const key = process.env.API_KEY || process.env.GOOGLE_API_KEY;
    if (!key || key.trim() === "") throw new Error("API_KEY missing.");
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

const ensureArray = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(String);
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(String) : [String(raw)];
    } catch {
        return [String(raw)];
    }
};

/**
 * GENERATION LOGIC: Strictly uses Syllabus Table for Mappings
 */
export async function generateQuestionsForGaps(batchSizeOrTopic: number | string = 5) {
    if (!supabase) throw new Error("Supabase required.");
    
    let targetMappings: { topic: string, subject: string }[] = [];

    if (typeof batchSizeOrTopic === 'string') {
        const cleanSearch = batchSizeOrTopic.trim();
        // Robust search: Check topic, title, or id columns
        const { data: mappings, error } = await supabase
            .from('syllabus')
            .select('topic, subject, title, id')
            .or(`topic.ilike.%${cleanSearch}%,title.ilike.%${cleanSearch}%,id.eq.${cleanSearch}`)
            .limit(1);

        if (mappings && mappings.length > 0) {
            const m = mappings[0];
            // Prefer 'topic' field for the prompt, fallback to 'title'
            targetMappings = [{ 
                topic: m.topic || m.title || cleanSearch, 
                subject: m.subject || 'General' 
            }];
        } else {
            throw new Error(`The requested area "${cleanSearch}" is not currently mapped to any exam in your Syllabus. Please add it to the Syllabus first.`);
        }
    } else {
        const { data: sData } = await supabase.from('syllabus').select('topic, subject, title');
        if (!sData || sData.length === 0) return { message: "No syllabus mappings found." };
        
        const { data: qData } = await supabase.from('questionbank').select('topic');
        const counts: Record<string, number> = {};
        qData?.forEach(q => { const t = String(q.topic || '').toLowerCase().trim(); if (t) counts[t] = (counts[t] || 0) + 1; });

        const gaps = sData
            .map(s => ({ 
                topic: s.topic || s.title, 
                subject: s.subject || 'General', 
                count: counts[String(s.topic || s.title).toLowerCase().trim()] || 0 
            }))
            .sort((a, b) => a.count - b.count);
        
        targetMappings = gaps.slice(0, batchSizeOrTopic as number);
    }

    if (targetMappings.length === 0) return { message: "No topics identified for generation." };

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: `Generate 5 high-quality PSC MCQs in Malayalam for these specific syllabus topics: 
            ${targetMappings.map(m => `${m.subject} -> ${m.topic}`).join(', ')}.
            
            Technical subjects (IT, Engineering) should be in English. 
            Ensure correct_answer_index is accurate (1-4).
            
            Return JSON array: {topic, subject, question, options, correctAnswerIndex, explanation}`,
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
                subject: item.subject, 
                difficulty: 'PSC Level', 
                explanation: item.explanation || ''
            }));
            await upsertSupabaseData('questionbank', sbData);
            return { message: `Successfully generated ${sbData.length} questions for "${targetMappings[0].topic}".` };
        }
    } catch (e: any) { throw e; }
    return { message: "No questions could be generated at this time." };
}

export async function runDailyUpdateScrapers() {
    await Promise.all([scrapeKpscNotifications(), scrapePscLiveUpdates(), scrapeCurrentAffairs(), scrapeGkFacts()]);
    await generateQuestionsForGaps(5);
    return { message: "Daily Update Routine Finished." };
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
            await upsertSupabaseData('gk', items.map((it: any) => ({ fact: it.fact, category: it.category })));
        }
    } catch (e: any) { throw e; }
}

export async function scrapeCurrentAffairs() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "10 Latest CA items for Kerala Exams. JSON: {title, source, date}",
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            await upsertSupabaseData('currentaffairs', items.map((it: any) => ({ title: it.title, source: it.source, date: it.date })));
        }
    } catch (e: any) { throw e; }
}

export async function scrapeKpscNotifications() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `5 newest jobs from keralapsc.gov.in. JSON: title, categoryNumber, lastDate, link`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) await upsertSupabaseData('notifications', items);
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
        }
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
            const finalItems = items.map((it: any) => ({ 
                title: it.title, author: it.author, 
                imageUrl: it.asin ? `https://images-na.ssl-images-amazon.com/images/P/${it.asin.toUpperCase()}.01._SCLZZZZZZZ_SX400_.jpg` : "", 
                amazonLink: it.amazonLink + (it.amazonLink.includes('?') ? '&' : '?') + AFFILIATE_TAG 
            }));
            await upsertSupabaseData('bookstore', finalItems);
        }
    } catch (e: any) { throw e; }
}

export async function repairLanguageMismatches() {
    if (!supabase) throw new Error("Supabase required.");
    const technicalSubjects = ['English', 'Engineering', 'IT', 'Computer Science', 'Technical', 'Nursing'];
    const { data: mismatches } = await supabase.from('questionbank').select('*').in('subject', technicalSubjects).limit(30);
    if (!mismatches || mismatches.length === 0) return { message: "No mismatches found." };

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Restore these technical questions to professional ENGLISH. Data: ${JSON.stringify(mismatches)}`,
            config: { responseMimeType: "application/json" }
        });
        const repaired = JSON.parse(response.text || "[]");
        if (repaired.length > 0) await upsertSupabaseData('questionbank', repaired);
    } catch (e: any) { throw e; }
    return { message: "Language repair batch finished." };
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
