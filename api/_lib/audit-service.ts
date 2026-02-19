
import { GoogleGenAI, Type } from "@google/genai";
import { findAndUpsertRow } from './sheets-service.js';
import { supabase, upsertSupabaseData } from './supabase-service.js';

declare var process: any;

function getAi() {
    const key = process.env.API_KEY || process.env.GOOGLE_API_KEY;
    if (!key || key.trim() === "") throw new Error("API_KEY missing.");
    return new GoogleGenAI({ apiKey: key.trim() });
}

const ensureArray = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(String);
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(String) : [String(raw)];
    } catch {
        return String(raw).split('|').map(s => s.trim());
    }
};

/**
 * Normalizes subject names based on content keywords.
 */
const normalizeSubjectLocal = (subject: string, topic: string, question: string): string => {
    const s = String(subject || '').toLowerCase().trim();
    const t = String(topic || '').toLowerCase().trim();
    const q = String(question || '').toLowerCase().trim();
    const full = `${s} ${t} ${q}`;

    // Priority mapping based on keyword detection for items labeled 'Other'
    if (full.includes('math') || full.includes('arithmetic') || full.includes('ഗണിതം')) return "Quantitative Aptitude";
    if (full.includes('reasoning') || full.includes('logic') || full.includes('mental')) return "Reasoning / Mental Ability";
    if (full.includes('it') || full.includes('computer') || full.includes('cyber')) return "Computer Science / IT / Cyber Laws";
    if (full.includes('english') || full.includes('ഇംഗ്ലീഷ്')) return "English";
    if (full.includes('malayalam') || full.includes('മലയാളം')) return "Malayalam";
    if (full.includes('polity') || full.includes('const') || full.includes('ഭരണഘടന') || full.includes('article')) return "Indian Polity / Constitution";
    if (full.includes('renaissance') || full.includes('നവോത്ഥാനം')) return "Kerala History / Renaissance";
    if (full.includes('current affairs') || full.includes('ആനുകാലികം')) return "Current Affairs";
    
    // Direct mapping table
    const map: Record<string, string> = {
        "arts": "Arts, Culture & Sports",
        "sports": "Arts, Culture & Sports",
        "biology": "Biology / Life Science",
        "life science": "Biology / Life Science",
        "chemistry": "Chemistry",
        "physics": "Physics",
        "current affairs": "Current Affairs",
        "psychology": "Educational Psychology / Pedagogy",
        "electrical": "Electrical Engineering",
        "environment": "Environment",
        "gk": "General Knowledge",
        "static gk": "General Knowledge / Static GK",
        "science": "General Science / Science & Tech",
        "economy": "Indian Economy",
        "indian geo": "Indian Geography",
        "indian history": "Indian History",
        "kerala geography": "Kerala Geography",
        "kerala history": "Kerala History",
        "malayalam": "Malayalam",
        "nursing": "Nursing Science / Health Care",
        "social science": "Social Science / Sociology"
    };

    for (const key in map) {
        if (s.includes(key)) return map[key];
    }

    const blacklist = ['other', 'manual check', 'unknown', 'n/a', 'none', '', 'null', 'undefined'];
    if (blacklist.includes(s)) return "General Knowledge";

    return subject;
};

/**
 * CORE AUDIT LOGIC: Realignment and Answer Verification
 */
export async function auditAndCorrectQuestions() {
    if (!supabase) throw new Error("Supabase required for auditing.");
    
    const { data: settings } = await supabase.from('settings').select('value').eq('key', 'last_audited_id').single();
    const lastId = parseInt(settings?.value || '0');
    
    const { data: questions, error: qErr } = await supabase
        .from('questionbank')
        .select('*')
        .gt('id', lastId)
        .order('id', { ascending: true })
        .limit(20);

    if (qErr) throw qErr;
    if (!questions || questions.length === 0) return { message: "QA Audit complete. All records verified.", completed: true };

    const batchMaxId = Math.max(...questions.map(q => q.id));

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `You are a Kerala PSC Quality Controller. Audit these questions for accuracy and syllabus mapping.
            
            CRITICAL RULES:
            1. DO NOT USE "Other", "Manual Check", or "Unknown" as a subject.
            2. Analyze each question text and map it to exactly ONE of these official approved subjects:
               [Arts, Culture & Sports, Biology / Life Science, Chemistry, Computer Science / IT / Cyber Laws, Current Affairs, Educational Psychology / Pedagogy, Electrical Engineering, English, Environment, General Knowledge, General Knowledge / Static GK, General Science / Science & Tech, Indian Economy, Indian Geography, Indian History, Indian Polity / Constitution, Kerala Geography, Kerala History, Kerala History / Renaissance, Kerala Specific GK, Malayalam, Nursing Science / Health Care, Physics, Quantitative Aptitude, Reasoning / Mental Ability, Social Science / Sociology]
            3. Ensure the question language is appropriate (Malayalam or English).
            
            Strictly follow this JSON format:
            {
              "correctedQuestions": [
                { "id": original_id, "topic": "string", "subject": "Official Subject Name", "question": "string", "options": ["A","B","C","D"], "correct_answer_index": 1-4, "explanation": "string" }
              ]
            }
            
            Data to Audit: ${JSON.stringify(questions)}`,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        correctedQuestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.INTEGER },
                                    topic: { type: Type.STRING },
                                    subject: { type: Type.STRING },
                                    question: { type: Type.STRING },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    correct_answer_index: { type: Type.INTEGER },
                                    explanation: { type: Type.STRING }
                                },
                                required: ["id", "topic", "subject", "question", "options", "correct_answer_index", "explanation"]
                            }
                        }
                    }
                }
            }
        });

        const result = JSON.parse(response.text || "{}");
        const corrected = result.correctedQuestions || [];

        if (corrected.length > 0) {
            const sanitized = corrected.map((q: any) => ({
                id: q.id, 
                topic: q.topic, 
                question: q.question, 
                options: ensureArray(q.options),
                correct_answer_index: parseInt(String(q.correct_answer_index || 1)),
                subject: normalizeSubjectLocal(q.subject, q.topic, q.question), 
                difficulty: 'PSC Level', 
                explanation: q.explanation || ''
            }));
            
            await upsertSupabaseData('questionbank', sanitized);
            
            for (const q of sanitized) {
                await findAndUpsertRow('QuestionBank', String(q.id), [
                    q.id, q.topic, q.question, JSON.stringify(q.options), q.correct_answer_index, q.subject, 'PSC Level', q.explanation
                ]);
            }
        }

        const nextCursorValue = String(batchMaxId);
        await upsertSupabaseData('settings', [{ key: 'last_audited_id', value: nextCursorValue }], 'key');
        await findAndUpsertRow('Settings', 'last_audited_id', ['last_audited_id', nextCursorValue]);
        
        return { 
            message: `Batch processed. Verified up to ID: ${batchMaxId}.`, 
            nextId: batchMaxId,
            changesCount: corrected.length 
        };

    } catch (e: any) { 
        console.error("Audit Logic Error:", e.message);
        throw e; 
    }
}
