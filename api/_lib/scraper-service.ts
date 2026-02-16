
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

export async function checkAndFixAllAffiliateLinks() {
    if (!supabase) throw new Error("Supabase required for link audit.");
    const { data: books, error } = await supabase.from('bookstore').select('*');
    if (error || !books) return { message: "No books found to audit." };

    const fixed = books.map(b => ({
        ...b,
        amazonLink: formatAffiliateLink(b.amazonLink)
    }));

    await upsertSupabaseData('bookstore', fixed);
    return { message: `Verified ${books.length} links. All tagged correctly.` };
}

export async function auditAndCorrectQuestions() {
    if (!supabase) throw new Error("Supabase is required for Audit.");
    const { data: questions, error } = await supabase.from('questionbank').select('*').limit(20).order('id', { ascending: false });
    if (error || !questions || questions.length === 0) return { message: "No questions found to audit." };

    try {
        const ai = getAi();
        const prompt = `Review these 20 Kerala PSC questions in Malayalam. Ensure 'correct_answer_index' (1-4) is correct. Return JSON array with original IDs. Data: ${JSON.stringify(questions)}`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.INTEGER }, topic: { type: Type.STRING }, subject: { type: Type.STRING },
                            question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correct_answer_index: { type: Type.INTEGER }
                        },
                        required: ["id", "topic", "subject", "question", "options", "correct_answer_index"]
                    }
                }
            }
        });
        const correctedItems = JSON.parse(response.text || "[]");
        if (correctedItems.length > 0) {
            await upsertSupabaseData('questionbank', correctedItems);
            return { message: `Audited ${correctedItems.length} questions.` };
        }
    } catch (e: any) { throw e; }
    return { message: "Audit completed." };
}

export async function scrapeKpscNotifications() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Research 5 latest job notifications from keralapsc.gov.in. Return JSON array with 'title', 'categoryNumber', 'lastDate', 'link'.`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const baseId = await getNextId('Notifications!A2:A', 1000);
        const items = JSON.parse(response.text || "[]");
        const sbData = items.map((item: any, idx: number) => ({ id: String(baseId + idx), title: item.title, categoryNumber: item.categoryNumber, lastDate: item.lastDate, link: item.link }));
        await upsertSupabaseData('notifications', sbData);
        return { message: `${items.length} notifications synced.` };
    } catch (e: any) { throw e; }
}

export async function scrapePscLiveUpdates() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Find 5 latest announcements from keralapsc.gov.in. Return JSON array with 'title', 'url', 'section', 'published_date'.`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const sbData = items.map((it: any) => ({ id: createNumericHash(it.url || it.title), title: it.title, url: it.url, section: it.section, published_date: it.published_date }));
            await upsertSupabaseData('liveupdates', sbData);
        }
        return { message: `${items.length} updates found.` };
    } catch (e: any) { throw e; }
}

export async function generateQuestionsForGaps(batchSize: number = 8) {
    if (!supabase) throw new Error("Supabase required.");
    const { data: qData } = await supabase.from('questionbank').select('topic');
    const counts: Record<string, number> = {};
    qData?.forEach(q => { const t = String(q.topic || '').toLowerCase().trim(); if (t) counts[t] = (counts[t] || 0) + 1; });

    const { data: sData } = await supabase.from('syllabus').select('*');
    if (!sData) return { message: "Syllabus empty." };

    const gaps = sData.filter(s => (counts[String(s.topic || s.title).toLowerCase().trim()] || 0) < 5);
    if (gaps.length === 0) return { message: "No gaps found." };

    const targetTopics = gaps.slice(0, batchSize).map(g => g.topic || g.title);
    
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: `Generate 25 high-quality PSC MCQ questions in Malayalam for: ${targetTopics.join(', ')}. Return JSON array with 'topic', 'subject', 'question', 'options', 'correctAnswerIndex' (1-4).`,
            config: { responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const baseId = await getNextId('QuestionBank!A2:A', 30000);
            const sbData = items.map((item: any, idx: number) => ({ id: baseId + idx, topic: item.topic, question: item.question, options: item.options, correct_answer_index: item.correctAnswerIndex, subject: item.subject || 'General', difficulty: 'PSC Level' }));
            await upsertSupabaseData('questionbank', sbData);
            return { message: `Added ${items.length} questions for ${targetTopics.length} topics.` };
        }
    } catch (e: any) { throw e; }
    return { message: "No questions generated." };
}

export async function runDailyUpdateScrapers() {
    await scrapeKpscNotifications();
    await scrapePscLiveUpdates();
    // Efficiently fill gaps for 8 topics in one go
    await generateQuestionsForGaps(8);
    return { message: "Daily Routine Finished." };
}

export async function runBookScraper() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: `Search for top 10 Kerala PSC rank files on Amazon.in. Return JSON array with 'title', 'author', 'asin', 'amazonLink'.`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const baseId = await getNextId('Bookstore!A2:A', 3000);
            const finalItems = items.map((it: any, idx: number) => ({ id: String(baseId + idx), title: it.title, author: it.author, imageUrl: it.asin ? `https://images-na.ssl-images-amazon.com/images/P/${it.asin}.01._SCLZZZZZZZ_SX300_.jpg` : "", amazonLink: formatAffiliateLink(it.amazonLink, it.asin) }));
            await upsertSupabaseData('bookstore', finalItems);
            return { message: `${finalItems.length} books synced.` };
        }
        return { message: "No new books." };
    } catch (e: any) { throw e; }
}
