
import { readSheetData } from './_lib/sheets-service.js';
import { supabase } from './_lib/supabase-service.js';

const smartParseOptions = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    let clean = String(raw).trim();
    if (clean.startsWith('[') && clean.endsWith(']')) {
        try { return JSON.parse(clean); } catch (e) {
            try { return JSON.parse(clean.replace(/'/g, '"')); } catch (e2) {
                return clean.slice(1, -1).split('|').map(s => s.trim());
            }
        }
    }
    return [clean];
};

export default async function handler(req: any, res: any) {
    const { type, examId, subject, topic, count } = req.query;
    if (!type) return res.status(400).json({ error: 'Type required' });

    const tType = type.toLowerCase();
    const tableMap: Record<string, string> = {
        'exams': 'exams', 'questions': 'questionbank', 'books': 'bookstore',
        'updates': 'liveupdates', 'affairs': 'currentaffairs', 'gk': 'gk',
        'syllabus': 'syllabus', 'notifications': 'notifications', 'settings': 'settings',
        'subscriptions': 'subscriptions', 'flash_cards': 'flashcards'
    };
    
    const tableName = tableMap[tType] || tType;
    
    // Determine dynamic limit: Increase pool for GK/Affairs for better randomization
    let limitCount = parseInt(count as string);
    if (isNaN(limitCount)) {
        if (tableName === 'exams') limitCount = 100;
        else if (tableName === 'gk' || tableName === 'currentaffairs') limitCount = 60; 
        else if (tableName === 'flashcards') limitCount = 50;
        else limitCount = 20;
    }

    try {
        if (supabase) {
            let query = supabase.from(tableName).select('*');
            if (tableName === 'syllabus' && examId) query = query.eq('exam_id', String(examId));
            if (tableName === 'questionbank') {
                if (subject && subject !== 'mixed' && subject !== 'General') {
                    query = query.or(`subject.ilike.%${subject}%,topic.ilike.%${subject}%`);
                } else if (topic && topic !== 'mixed') {
                    query = query.ilike('topic', `%${topic}%`);
                }
            }
            
            query = query.limit(limitCount);

            if (tableName === 'subscriptions') {
                query = query.order('last_updated', { ascending: false });
            }
            
            // Randomize results for GK/Affairs if we are getting a pool for the widget
            if (tableName === 'gk' || tableName === 'currentaffairs') {
                query = query.order('id', { ascending: false });
            }

            const { data, error } = await query;
            if (!error && data && data.length > 0) {
                if (tableName === 'questionbank') {
                    return res.status(200).json(data.sort(() => 0.5 - Math.random()).slice(0, limitCount).map(q => ({
                        ...q, options: smartParseOptions(q.options), correctAnswerIndex: parseInt(String(q.correct_answer_index || '1'))
                    })));
                }
                return res.status(200).json(data);
            }
        }

        // Fallback to Google Sheets
        const sheetName = type.charAt(0).toUpperCase() + type.slice(1);
        try {
            const rows = await readSheetData(`${sheetName}!A2:Z`);
            if (tType === 'questions') {
                 return res.status(200).json(rows.slice(0, limitCount).map((r, i) => ({
                    id: String(r[0] || i), topic: r[1], question: r[2], options: smartParseOptions(r[3]), 
                    correctAnswerIndex: parseInt(String(r[4] || '1')), 
                    subject: r[5], difficulty: r[6]
                })));
            }
            return res.status(200).json(rows.slice(0, limitCount));
        } catch (sheetErr: any) {
            console.error("Sheets Fallback Failed:", sheetErr.message);
            return res.status(200).json([]); // Return empty rather than 500 to keep UI alive
        }

    } catch (error: any) { 
        console.error("Data API Error:", error.message);
        return res.status(500).json({ error: "Database Request Failed" }); 
    }
}
