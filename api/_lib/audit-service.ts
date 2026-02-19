
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
        return [String(raw)];
    }
};

const APPROVED_SUBJECTS = [
    "Arts, Culture & Sports", "Biology / Life Science", "Chemistry", "Computer Science / IT / Cyber Laws",
    "Current Affairs", "Educational Psychology / Pedagogy", "Electrical Engineering", "English",
    "Environment", "General Knowledge", "General Knowledge / Static GK", "General Science / Science & Tech",
    "Indian Economy", "Indian Geography", "Indian History", "Indian Polity / Constitution",
    "Kerala Geography", "Kerala History", "Kerala History / Renaissance", "Kerala Specific GK",
    "Malayalam", "Nursing Science / Health Care", "Physics", "Quantitative Aptitude",
    "Reasoning / Mental Ability", "Social Science / Sociology"
];

/**
 * CORE AUDIT LOGIC: Fast Re-classification of "Other" subjects
 */
export async function auditAndCorrectQuestions() {
    if (!supabase) throw new Error("Supabase required for auditing.");
    
    // FETCH CONDITION: Only target unclassified or manually tagged items for speed
    const { data: questions, error: qErr } = await supabase
        .from('questionbank')
        .select('id, question, topic, subject, options, correct_answer_index, difficulty, explanation')
        .or('subject.ilike.other,subject.ilike.%manual%,subject.eq.,subject.is.null')
        .limit(50); // Batch size for processing

    if (qErr) throw qErr;
    if (!questions || questions.length === 0) return { message: "No 'Other' or blank subjects found. Classification complete.", completed: true };

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `As a PSC Data Architect, your ONLY task is to categorize these questions into a valid subject.
            
            RULES:
            1. Look at 'question' and 'topic'.
            2. Choose the best matching subject from: [${APPROVED_SUBJECTS.join(', ')}]
            3. Do NOT change question text, options, or answers.
            4. Only provide the correct 'subject' mapping.
            
            Return JSON array:
            {
              "classified": [
                { "id": ID, "subject": "Subject Name" }
              ]
            }
            
            Data to process: ${JSON.stringify(questions.map(q => ({ id: q.id, question: q.question, topic: q.topic })))}`,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        classified: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.INTEGER },
                                    subject: { type: Type.STRING }
                                },
                                required: ["id", "subject"]
                            }
                        }
                    }
                }
            }
        });

        const result = JSON.parse(response.text || "{}");
        const updates = result.classified || [];

        if (updates.length > 0) {
            const finalData = updates.map((upd: any) => {
                const original = questions.find(q => q.id === upd.id);
                if (!original) return null;
                return {
                    ...original,
                    options: ensureArray(original.options),
                    subject: upd.subject
                };
            }).filter(Boolean);
            
            // 1. Update Supabase (Fast batch)
            await upsertSupabaseData('questionbank', finalData);
            
            // 2. Sync to Sheets (Required to maintain sheet accuracy)
            for (const q of finalData) {
                await findAndUpsertRow('QuestionBank', String(q.id), [
                    q.id, q.topic, q.question, JSON.stringify(q.options), q.correct_answer_index, q.subject, q.difficulty, q.explanation
                ]);
            }
        }
        
        return { 
            message: `Processed ${updates.length} items. All mapped to official subjects.`, 
            changesCount: updates.length 
        };

    } catch (e: any) { 
        console.error("Fast Audit Error:", e.message);
        throw e; 
    }
}
