
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

function formatAffiliateLink(link: string, asin?: string): string {
    if (asin) return `https://www.amazon.in/dp/${asin}?${AFFILIATE_TAG}`;
    if (!link || !link.includes('amazon.in')) return link;
    let cleanLink = link.split('?')[0]; 
    return `${cleanLink}?${AFFILIATE_TAG}`;
}

export async function auditAndCorrectQuestions() {
    if (!supabase) throw new Error("Supabase is required for Audit.");

    const { data: questions, error } = await supabase
        .from('questionbank')
        .select('*')
        .limit(20)
        .order('id', { ascending: false });

    if (error || !questions || questions.length === 0) {
        return { message: "No questions found to audit." };
    }

    try {
        const ai = getAi();
        const prompt = `You are a Senior Kerala PSC Content Expert. Review the following 20 MCQ questions in Malayalam.
        Your tasks:
        1. Verify if 'correct_answer_index' (1-4) matches the correct option.
        2. Refine vague topic names to granular parts (e.g. "IT • Cyber Laws").
        Data: ${JSON.stringify(questions)}
        Return ONLY a JSON array with original IDs.`;

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
                            id: { type: Type.INTEGER },
                            topic: { type: Type.STRING },
                            subject: { type: Type.STRING },
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
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
            for (const item of correctedItems) {
                await findAndUpsertRow('QuestionBank', String(item.id), [
                    item.id, item.topic, item.question, JSON.stringify(item.options), 
                    item.correct_answer_index, item.subject, 'PSC Level'
                ]);
            }
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
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT, properties: {
                            title: { type: Type.STRING },
                            categoryNumber: { type: Type.STRING }, lastDate: { type: Type.STRING },
                            link: { type: Type.STRING },
                        }, required: ["title", "categoryNumber", "lastDate", "link"]
                    }
                }
            }
        });
        const baseId = await getNextId('Notifications!A2:A', 1000);
        const items = JSON.parse(response.text || "[]");
        const sheetData = items.map((item: any, idx: number) => [String(baseId + idx), item.title, item.categoryNumber, item.lastDate, item.link]);
        const sbData = items.map((item: any, idx: number) => ({ id: String(baseId + idx), title: item.title, categoryNumber: item.categoryNumber, lastDate: item.lastDate, link: item.link }));
        await appendSheetData('Notifications!A1', sheetData);
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
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            title: { type: Type.STRING }, url: { type: Type.STRING },
                            section: { type: Type.STRING }, published_date: { type: Type.STRING }
                        }, required: ["title", "url", "section", "published_date"]
                    }
                }
            }
        });
        const items = JSON.parse(response.text || "[]");
        const existing = await readSheetData('LiveUpdates!A2:D');
        const existingUrls = new Set(existing.map(r => String(r[1]).trim()));
        const uniqueNewItems = items.filter((it: any) => !existingUrls.has(it.url.trim()));
        if (uniqueNewItems.length > 0) {
            const combined = [...uniqueNewItems.map((it:any) => [it.title, it.url, it.section, it.published_date]), ...existing].slice(0, 50);
            await clearAndWriteSheetData('LiveUpdates!A2:D', combined);
            const sbData = uniqueNewItems.map((it: any) => ({ id: createNumericHash(it.url || it.title), title: it.title, url: it.url, section: it.section, published_date: it.published_date }));
            await upsertSupabaseData('liveupdates', sbData);
        }
        return { message: `${uniqueNewItems.length} updates found.` };
    } catch (e: any) { throw e; }
}

export async function scrapeCurrentAffairs() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Research 10 Malayalam current affairs for Kerala PSC. Return JSON array with 'title', 'source', 'date'.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            title: { type: Type.STRING },
                            source: { type: Type.STRING }, date: { type: Type.STRING }
                        }, required: ["title", "source", "date"]
                    }
                }
            }
        });
        const items = JSON.parse(response.text || "[]");
        const baseId = await getNextId('CurrentAffairs!A2:A', 5000);
        const sheetData = items.map((item: any, idx: number) => [String(baseId + idx), item.title, item.source, item.date]);
        const sbData = items.map((item: any, idx: number) => ({ id: String(baseId + idx), title: item.title, source: item.source, date: item.date }));
        await appendSheetData('CurrentAffairs!A1', sheetData);
        await upsertSupabaseData('currentaffairs', sbData);
        return { message: `Current Affairs synced.` };
    } catch (e: any) { throw e; }
}

export async function scrapeGk() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate 10 GK facts about Kerala in Malayalam. Return JSON array with 'fact', 'category'.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: { fact: { type: Type.STRING }, category: { type: Type.STRING } }, 
                        required: ["fact", "category"]
                    }
                }
            }
        });
        const baseId = await getNextId('GK!A2:A', 8000);
        const items = JSON.parse(response.text || "[]");
        const sheetData = items.map((item: any, idx: number) => [String(baseId + idx), item.fact, item.category]);
        const sbData = items.map((item: any, idx: number) => ({ id: String(baseId + idx), fact: item.fact, category: item.category }));
        await appendSheetData('GK!A1', sheetData);
        await upsertSupabaseData('gk', sbData);
        return { message: `GK synced.` };
    } catch (e: any) { throw e; }
}

export async function generateQuestionsForGaps(batchSize: number = 3) {
    if (!supabase) throw new Error("Supabase required for Gap Audit.");
    
    // 1. Audit current counts
    const { data: qData } = await supabase.from('questionbank').select('topic, subject');
    const counts: Record<string, number> = {};
    qData?.forEach(q => { 
        const topicKey = String(q.topic || '').toLowerCase().trim();
        if (topicKey) counts[topicKey] = (counts[topicKey] || 0) + 1;
    });

    // 2. Find syllabus topics with low questions
    const { data: sData } = await supabase.from('syllabus').select('*');
    if (!sData) return { message: "Syllabus is empty." };

    const gaps = sData.filter(s => (counts[String(s.topic || s.title).toLowerCase().trim()] || 0) < 5);
    if (gaps.length === 0) return { message: "No gaps found! All topics have adequate questions." };

    // 3. Select target topics based on batch size to stay within limits
    const targetTopics = gaps.slice(0, batchSize).map(g => g.topic || g.title);
    
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: `You are a Senior Kerala PSC Teacher. Generate exactly 15 high-quality, exam-standard MCQ questions in Malayalam for the following syllabus topics: ${targetTopics.join(', ')}. 
            
            Format requirements:
            - Focus on facts often asked in LDC, VEO, and Degree Level exams.
            - Ensure options are challenging and plausible.
            - Return JSON array with 'topic', 'subject', 'question', 'options' (Array of 4), 'correctAnswerIndex' (1-4).`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            topic: { type: Type.STRING }, subject: { type: Type.STRING },
                            question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswerIndex: { type: Type.INTEGER }
                        }, required: ["topic", "question", "options", "correctAnswerIndex"]
                    }
                }
            }
        });

        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const baseId = await getNextId('QuestionBank!A2:A', 30000);
            const sheetData = items.map((item: any, idx: number) => [baseId + idx, item.topic, item.question, JSON.stringify(item.options), item.correctAnswerIndex, item.subject || 'General', 'PSC Level', '']);
            const sbData = items.map((item: any, idx: number) => ({ id: baseId + idx, topic: item.topic, question: item.question, options: item.options, correct_answer_index: item.correctAnswerIndex, subject: item.subject || 'General', difficulty: 'PSC Level' }));

            await appendSheetData('QuestionBank!A1', sheetData);
            await upsertSupabaseData('questionbank', sbData);
            return { message: `Gap Filler Success: Added ${items.length} questions for [${targetTopics.join(', ')}].` };
        }
    } catch (e: any) { throw e; }
    return { message: "Gap filler ran but no questions were produced." };
}

export async function runDailyUpdateScrapers() {
    // 1. Scrape News (Search Grounding)
    await scrapeKpscNotifications();
    await scrapeCurrentAffairs();
    await scrapeGk();
    
    // 2. Automatic Gap Filler (Incremental growth)
    // Batch size of 3 is safe for free tier RPM/TPM limits
    await generateQuestionsForGaps(3);
    
    return { message: "Daily Protocols and Gap-Filler Finished." };
}

export async function runBookScraper() {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: `Search for top 10 Kerala PSC rank files on Amazon.in. Return JSON array with 'title', 'author', 'asin', 'amazonLink'.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: { title: { type: Type.STRING }, author: { type: Type.STRING }, asin: { type: Type.STRING }, amazonLink: { type: Type.STRING } }, 
                        required: ["title", "author", "amazonLink"]
                    }
                }
            }
        });
        const items = JSON.parse(response.text || "[]");
        if (items.length > 0) {
            const existing = await readSheetData('Bookstore!A2:E');
            const baseId = await getNextId('Bookstore!A2:A', 3000);
            const existingTitles = new Set(existing.map(r => String(r[1]).toLowerCase().trim()));
            const uniqueNew = items.filter((it: any) => !existingTitles.has(it.title.toLowerCase().trim()));
            if (uniqueNew.length > 0) {
                const finalItems = uniqueNew.map((it: any, idx: number) => ({ id: String(baseId + idx), title: it.title, author: it.author, imageUrl: it.asin ? `https://images-na.ssl-images-amazon.com/images/P/${it.asin}.01._SCLZZZZZZZ_SX300_.jpg` : "", amazonLink: formatAffiliateLink(it.amazonLink, it.asin) }));
                await appendSheetData('Bookstore!A1', finalItems.map(it => [it.id, it.title, it.author, it.imageUrl, it.amazonLink]));
                await upsertSupabaseData('bookstore', finalItems);
                return { message: `${finalItems.length} books synced.` };
            }
        }
        return { message: "No new books." };
    } catch (e: any) { throw e; }


}
