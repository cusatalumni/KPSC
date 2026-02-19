
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
    
    // Fetch items that need manual classification, are tagged as 'Other', or are completely blank/null
    const { data: questions, error: qErr } = await supabase
        .from('questionbank')
        .select('*')
        .or('subject.ilike.other,subject.ilike.%manual%,subject.eq.,subject.is.null')
        .limit(50);

    if (qErr) throw qErr;
    if (!questions || questions.length === 0) return { message: "No 'Other' or blank subjects found. Classification is up to date.", completed: true };

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `You are a Subject Classifier for Kerala PSC. Re-categorize the following questions.
            
            STRICT RULES:
            1. Analyze the 'question' and 'topic' text.
            2. Map it to exactly ONE subject from this list: [${APPROVED_SUBJECTS.join(', ')}]
            3. Do not modify the question text or options. Just fix the 'subject' field.
            
            JSON format:
            {
              "classified": [
                { "id": original_id, "subject": "Official Subject Name" }
              ]
            }
            
            Data: ${JSON.stringify(questions.map(q => ({ id: q.id, question: q.question, topic: q.topic, subject: q.subject })))}`,
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
                return {
                    ...original,
                    options: ensureArray(original.options),
                    subject: upd.subject
                };
            });
            
            await upsertSupabaseData('questionbank', finalData);
            
            for (const q of finalData) {
                await findAndUpsertRow('QuestionBank', String(q.id), [
                    q.id, q.topic, q.question, JSON.stringify(q.options), q.correct_answer_index, q.subject, q.difficulty, q.explanation
                ]);
            }
        }
        
        return { 
            message: `Successfully re-classified ${updates.length} unmapped questions.`, 
            changesCount: updates.length 
        };

    } catch (e: any) { 
        console.error("Fast Audit Error:", e.message);
        throw e; 
    }
}
