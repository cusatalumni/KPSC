
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
 * CORE AUDIT LOGIC: Realignment and Answer Verification
 */
export async function auditAndCorrectQuestions() {
    if (!supabase) throw new Error("Supabase required for auditing.");
    
    // 1. Get current progress
    const { data: settings } = await supabase.from('settings').select('value').eq('key', 'last_audited_id').single();
    const lastId = parseInt(settings?.value || '0');
    
    // 2. Fetch next batch
    const { data: questions, error: qErr } = await supabase
        .from('questionbank')
        .select('*')
        .gt('id', lastId)
        .order('id', { ascending: true })
        .limit(50);

    if (qErr) throw qErr;
    if (!questions || questions.length === 0) return { message: "QA Audit complete. All records verified.", completed: true };

    const batchMaxId = Math.max(...questions.map(q => q.id));

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `You are a Kerala PSC Quality Controller. Audit these questions for accuracy, language (Malayalam/English mix), and correct syllabus mapping.
            
            Strictly follow this JSON format:
            {
              "correctedQuestions": [
                { "id": original_id, "topic": "string", "subject": "string", "question": "string", "options": ["A","B","C","D"], "correct_answer_index": 1-4, "explanation": "string" }
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
                subject: q.subject, 
                difficulty: 'PSC Level', 
                explanation: q.explanation || ''
            }));
            
            // Upsert to Supabase
            await upsertSupabaseData('questionbank', sanitized);
            
            // Mirror to Sheets
            for (const q of sanitized) {
                await findAndUpsertRow('QuestionBank', String(q.id), [
                    q.id, q.topic, q.question, JSON.stringify(q.options), q.correct_answer_index, q.subject, 'PSC Level', q.explanation
                ]);
            }
        }

        // 3. ALWAYS Update Cursor to move past this batch, even if no changes were made
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
