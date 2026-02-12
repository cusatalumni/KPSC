import { readSheetData, findAndUpsertRow } from './_lib/sheets-service.js';
import { supabase, upsertSupabaseData } from './_lib/supabase-service.js';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    try {
        // 1. Check Supabase Cache first
        if (supabase) {
            const { data: cachedSb } = await supabase
                .from('studymaterialscache')
                .select('content')
                .eq('topic', topic)
                .single();
            if (cachedSb) return res.status(200).json({ notes: cachedSb.content, cached: true, source: 'supabase' });
        }

        // 2. Fallback to Sheets Cache
        const cacheRows = await readSheetData('StudyMaterialsCache!A2:C');
        const cachedItem = cacheRows.find((r: any) => String(r[0] || '').toLowerCase() === topic.toLowerCase());

        if (cachedItem) {
            // Also update Supabase if missing
            if (supabase) await upsertSupabaseData('studymaterialscache', [{ topic: cachedItem[0], content: cachedItem[1], last_updated: cachedItem[2] }], 'topic');
            return res.status(200).json({ notes: cachedItem[1], cached: true, source: 'sheets' });
        }

        // 3. Cache Miss - Generate via AI
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error('AI API Key missing');

        const ai = new GoogleGenAI({ apiKey });
        const aiResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate extremely detailed study notes in Malayalam for the Kerala PSC topic: "${topic}". 
            Use Markdown formatting with headings (#, ##), bullet points, and bold text for important facts. 
            Keep it structured and helpful for a student.`,
        });

        const content = aiResponse.text || "വിവരങ്ങൾ ലഭ്യമല്ല.";
        const timestamp = new Date().toISOString();

        // 4. Save to both Cache layers
        await Promise.all([
            findAndUpsertRow('StudyMaterialsCache', topic, [topic, content, timestamp]),
            supabase ? upsertSupabaseData('studymaterialscache', [{ topic, content, last_updated: timestamp }], 'topic') : Promise.resolve()
        ]);

        return res.status(200).json({ notes: content, cached: false });

    } catch (error: any) {
        console.error("Study Material Handler Error:", error.message);
        return res.status(500).json({ error: error.message });
    }
}