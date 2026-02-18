
import { GoogleGenAI } from "@google/genai";
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
 * Ensures NO ORPHAN TOPICS remain after the batch is processed.
 */
export async function auditAndCorrectQuestions() {
    if (!supabase) throw new Error("Supabase required for auditing.");
    
    const { data: settings } = await supabase.from('settings').select('value').eq('key', 'last_audited_id').single();
    const lastId = parseInt(settings?.value || '0');
    
    // 1. Fetch data for context
    const [qRes, sRes, eRes] = await Promise.all([
        supabase.from('questionbank').select('*').gt('id', lastId).order('id', { ascending: true }).limit(25),
        supabase.from('syllabus').select('topic, subject, exam_id'),
        supabase.from('exams').select('id, title_en')
    ]);

    const questions = qRes.data;
    if (!questions || questions.length === 0) return { message: "QA Audit complete. All records verified.", completed: true };

    const existingSyllabus = sRes.data || [];
    const validExams = eRes.data || [];

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `As a Kerala PSC Data Integrity Expert, audit these questions.
            
            REFERENCE:
            - Valid Exams: ${JSON.stringify(validExams)}
            - Existing Syllabus Mappings: ${JSON.stringify(existingSyllabus.slice(0, 100))}

            STRICT AUDIT RULES:
            1. VERIFY ANSWER: Ensure 'correct_answer_index' (1-4) is 100% accurate.
            2. SYLLABUS ALIGNMENT: 
               - Every question must belong to a 'topic'.
               - If the topic is not in 'Existing Syllabus Mappings', suggest a NEW mapping in 'newSyllabusItems'.
               - DO NOT add 'exam_id' to the question object itself. Only use it in 'newSyllabusItems'.
            3. LANGUAGE: English for IT/Technical/Nursing, Malayalam for general.
            4. EXPLANATION: Add helpful PSC-style explanation.
            
            Data to audit: ${JSON.stringify(questions)}
            
            Return JSON:
            {
                "correctedQuestions": [
                  {"id": number, "topic": "string", "question": "string", "options": [], "correct_answer_index": number, "subject": "string", "difficulty": "string", "explanation": "string"}
                ],
                "newSyllabusItems": [
                  {"exam_id": "string", "subject": "string", "topic": "string", "title": "string"}
                ]
            }`,
            config: { responseMimeType: "application/json" }
        });

        const result = JSON.parse(response.text || "{}");
        const { correctedQuestions = [], newSyllabusItems = [] } = result;

        // 1. Sync new syllabus mappings first
        if (newSyllabusItems.length > 0) {
            const syllabusToInsert = newSyllabusItems.map((item: any) => ({
                id: `auto_${createNumericHash(item.topic)}`,
                exam_id: item.exam_id,
                subject: item.subject,
                topic: item.topic,
                title: item.title || item.topic,
                questions: 0,
                duration: 20
            }));
            await upsertSupabaseData('syllabus', syllabusToInsert);
            for (const s of syllabusToInsert) {
                await findAndUpsertRow('Syllabus', s.id, [s.id, s.exam_id, s.title, s.questions, s.duration, s.subject, s.topic]);
            }
        }

        // 2. Save corrected questions - ONLY valid columns
        if (correctedQuestions.length > 0) {
            const sanitized = correctedQuestions.map((q: any) => ({
                id: q.id,
                topic: q.topic,
                question: q.question,
                options: ensureArray(q.options),
                correct_answer_index: parseInt(String(q.correct_answer_index || 1)),
                subject: q.subject,
                difficulty: q.difficulty || 'PSC Level',
                explanation: q.explanation || ''
            }));
            
            await upsertSupabaseData('questionbank', sanitized);
            
            const maxIdBatch = Math.max(...sanitized.map((q:any) => q.id));
            await upsertSupabaseData('settings', [{ key: 'last_audited_id', value: String(maxIdBatch) }], 'key');
            
            return { 
                message: `Verified ${sanitized.length} questions. Added ${newSyllabusItems.length} new mappings. Cursor: ${maxIdBatch}`, 
                nextId: maxIdBatch + 1 
            };
        }
    } catch (e: any) { throw e; }
    return { message: "Audit batch processed." };
}
