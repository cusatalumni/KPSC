
import { GoogleGenAI, Type } from "@google/genai";
import { findAndUpsertRow } from './sheets-service.js';
import { supabase, upsertSupabaseData } from './supabase-service.js';

declare var process: any;

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
        return String(raw).split('|').map(s => s.trim());
    }
};

/**
 * Normalizes subject names to strictly follow the Official Approved List.
 */
const normalizeSubjectLocal = (subject: string): string => {
    const s = String(subject || '').toLowerCase().trim();
    
    // Exact Map (Key: Lowercase Input, Value: Official Approved Name)
    const map: Record<string, string> = {
        "arts": "Arts, Culture & Sports",
        "sports": "Arts, Culture & Sports",
        "culture": "Arts, Culture & Sports",
        "biology": "Biology / Life Science",
        "life science": "Biology / Life Science",
        "chemistry": "Chemistry",
        "it": "Computer Science / IT / Cyber Laws",
        "computer": "Computer Science / IT / Cyber Laws",
        "cyber": "Computer Science / IT / Cyber Laws",
        "current affairs": "Current Affairs",
        "psychology": "Educational Psychology / Pedagogy",
        "pedagogy": "Educational Psychology / Pedagogy",
        "electrical": "Electrical Engineering",
        "english": "English",
        "environment": "Environment",
        "gk": "General Knowledge",
        "general knowledge": "General Knowledge",
        "static gk": "General Knowledge / Static GK",
        "science": "General Science / Science & Tech",
        "science & tech": "General Science / Science & Tech",
        "economy": "Indian Economy",
        "indian geo": "Indian Geography",
        "indian history": "Indian History",
        "constitution": "Indian Polity / Constitution",
        "polity": "Indian Polity / Constitution",
        "kerala geography": "Kerala Geography",
        "kerala history": "Kerala History",
        "renaissance": "Kerala History / Renaissance",
        "kerala specific gk": "Kerala Specific GK",
        "malayalam": "Malayalam",
        "nursing": "Nursing Science / Health Care",
        "health": "Nursing Science / Health Care",
        "physics": "Physics",
        "aptitude": "Quantitative Aptitude",
        "math": "Quantitative Aptitude",
        "maths": "Quantitative Aptitude",
        "arithmetic": "Quantitative Aptitude",
        "reasoning": "Reasoning / Mental Ability",
        "mental ability": "Reasoning / Mental Ability",
        "social science": "Social Science / Sociology",
        "sociology": "Social Science / Sociology"
    };

    return map[s] || subject;
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
                subject: normalizeSubjectLocal(q.subject), 
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
