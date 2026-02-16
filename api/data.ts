
import { readSheetData } from './_lib/sheets-service.js';
import { supabase } from './_lib/supabase-service.js';

const smartParseOptions = (raw: any): string[] => {
    if (!raw) return [];
    
    // Recursive function to unwrap multiple layers of JSON strings
    const unwrap = (val: any): any => {
        if (Array.isArray(val)) {
            // Check if it's an array with one string that looks like an array
            if (val.length === 1 && typeof val[0] === 'string' && val[0].startsWith('[')) {
                return unwrap(val[0]);
            }
            return val;
        }
        if (typeof val === 'string') {
            const trimmed = val.trim();
            if (trimmed.startsWith('[') || trimmed.startsWith('"[')) {
                try {
                    // Try parsing. If it's something like ""[\"A\"]"", it might need two parses.
                    let cleaned = trimmed;
                    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
                        cleaned = cleaned.slice(1, -1).replace(/\\"/g, '"');
                    }
                    const parsed = JSON.parse(cleaned);
                    return unwrap(parsed);
                } catch (e) {
                    return trimmed;
                }
            }
        }
        return val;
    };

    const final = unwrap(raw);
    
    if (Array.isArray(final)) return final.map(String);
    
    // Fallback for string-based data in Sheets
    if (typeof final === 'string') {
        if (final.includes('|')) return final.split('|').map(s => s.trim());
        return [final];
    }
    
    return [];
};

export default async function handler(req: any, res: any) {
    const { type, examId, subject, topic, count, offset, limit } = req.query;
    if (!type) return res.status(400).json({ error: 'Type required' });

    const tType = type.toLowerCase();
    const tableMap: Record<string, string> = {
        'exams': 'exams', 'questions': 'questionbank', 'books': 'bookstore',
        'updates': 'liveupdates', 'affairs': 'currentaffairs', 'gk': 'gk',
        'syllabus': 'syllabus', 'notifications': 'notifications', 'settings': 'settings',
        'subscriptions': 'subscriptions', 'flash_cards': 'flashcards'
    };
    
    const tableName = tableMap[tType] || tType;
    
    // Determine dynamic range
    const offsetCount = parseInt(offset as string) || 0;
    let limitCount = parseInt(limit as string) || parseInt(count as string);

    if (isNaN(limitCount)) {
        if (tableName === 'exams') limitCount = 100;
        else if (tableName === 'gk' || tableName === 'currentaffairs' || tableName === 'flashcards') limitCount = 20; 
        else if (tableName === 'bookstore') limitCount = 20;
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
            
            // Apply Pagination Range
            query = query.range(offsetCount, offsetCount + limitCount - 1);

            if (tableName === 'subscriptions' || tableName === 'currentaffairs' || tableName === 'gk' || tableName === 'notifications' || tableName === 'flashcards' || tableName === 'bookstore') {
                query = query.order('id', { ascending: false });
            }

            const { data, error } = await query;
            if (!error && data && data.length > 0) {
                if (tableName === 'questionbank') {
                    return res.status(200).json(data.sort(() => 0.5 - Math.random()).map(q => ({
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
            const paginatedRows = rows.slice(offsetCount, offsetCount + limitCount);
            
            if (tType === 'questions') {
                 return res.status(200).json(paginatedRows.map((r, i) => ({
                    id: String(r[0] || (offsetCount + i)), topic: r[1], question: r[2], options: smartParseOptions(r[3]), 
                    correctAnswerIndex: parseInt(String(r[4] || '1')), 
                    subject: r[5], difficulty: r[6]
                })));
            }
            return res.status(200).json(paginatedRows);
        } catch (sheetErr: any) {
            console.error("Sheets Fallback Failed:", sheetErr.message);
            return res.status(200).json([]);
        }

    } catch (error: any) { 
        console.error("Data API Error:", error.message);
        return res.status(500).json({ error: "Database Request Failed" }); 
    }
}
