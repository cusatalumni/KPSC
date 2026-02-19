
import { readSheetData } from './_lib/sheets-service.js';
import { supabase } from './_lib/supabase-service.js';

/**
 * Enhanced option parser that unwraps multiple layers of stringification.
 */
const smartParseOptions = (raw: any): string[] => {
    if (!raw) return [];
    
    const unwrap = (val: any): any => {
        if (Array.isArray(val)) {
            if (val.length === 1 && typeof val[0] === 'string' && val[0].startsWith('[')) {
                return unwrap(val[0]);
            }
            return val;
        }
        if (typeof val === 'string') {
            const trimmed = val.trim();
            if (trimmed.startsWith('[') || trimmed.startsWith('"[')) {
                try {
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
    if (typeof final === 'string') {
        if (final.includes('|')) return final.split('|').map(s => s.trim());
        return [final];
    }
    return [];
};

/**
 * Normalizes subject names to strictly follow the Official Approved List.
 * Remaps generic terms like 'Maths', 'Logic', 'Renaissance', etc.
 */
const normalizeSubject = (subject: string, topic: string): string => {
    const s = String(subject || '').toLowerCase().trim();
    const t = String(topic || '').toLowerCase().trim();
    const full = `${s} ${t}`;

    // 1. Specific Keyword Mapping for the Approved List
    if (full.includes('renaissance') || full.includes('നവോത്ഥാനം')) return "Kerala History / Renaissance";
    if (full.includes('kerala hist') || full.includes('കേരള ചരിത്രം')) return "Kerala History";
    if (full.includes('kerala geo') || full.includes('കേരള ഭൂമിശാസ്ത്രം')) return "Kerala Geography";
    if (full.includes('kerala gk') || full.includes('കേരള സംബന്ധിയായ')) return "Kerala Specific GK";
    if (full.includes('indian hist') || full.includes('ഇന്ത്യൻ ചരിത്രം')) return "Indian History";
    if (full.includes('indian geo') || full.includes('ഇന്ത്യൻ ഭൂമിശാസ്ത്രം')) return "Indian Geography";
    if (full.includes('polity') || full.includes('const') || full.includes('ഭരണഘടന')) return "Indian Polity / Constitution";
    if (full.includes('economy') || full.includes('സാമ്പത്തിക')) return "Indian Economy";
    
    if (full.includes('biology') || full.includes('ജീവശാസ്ത്രം') || full.includes('life science')) return "Biology / Life Science";
    if (full.includes('chemistry') || full.includes('രസതന്ത്രം')) return "Chemistry";
    if (full.includes('physics') || full.includes('ഭൗതികശാസ്ത്രം')) return "Physics";
    if (full.includes('gen science') || full.includes('ശാസ്ത്രം') || full.includes('tech')) return "General Science / Science & Tech";
    
    if (full.includes('math') || full.includes('arithmetic') || full.includes('ഗണിതം')) return "Quantitative Aptitude";
    if (full.includes('reasoning') || full.includes('logic') || full.includes('mental')) return "Reasoning / Mental Ability";
    
    if (full.includes('it') || full.includes('computer') || full.includes('cyber')) return "Computer Science / IT / Cyber Laws";
    if (full.includes('english') || full.includes('ഇംഗ്ലീഷ്')) return "English";
    if (full.includes('malayalam') || full.includes('മലയാളം')) return "Malayalam";
    
    if (full.includes('arts') || full.includes('sports') || full.includes('culture') || full.includes('കായികം')) return "Arts, Culture & Sports";
    if (full.includes('nursing') || full.includes('health') || full.includes('മെഡിക്കൽ')) return "Nursing Science / Health Care";
    if (full.includes('electrical') || full.includes('എഞ്ചിനീയറിംഗ്')) return "Electrical Engineering";
    if (full.includes('psychology') || full.includes('pedagogy') || full.includes('ബോധന')) return "Educational Psychology / Pedagogy";
    if (full.includes('environment') || full.includes('പരിസ്ഥിതി')) return "Environment";
    if (full.includes('social science') || full.includes('sociology') || full.includes('സമൂഹ')) return "Social Science / Sociology";
    if (full.includes('current') || full.includes('ആനുകാലികം')) return "Current Affairs";

    // 2. Fallbacks for Static GK
    if (full.includes('gk') || full.includes('static')) return "General Knowledge / Static GK";
    
    // 3. Blacklist / Unknown catch-all
    const blacklist = ['other', 'manual check', 'unknown', 'n/a', 'none', '', 'null', 'undefined', 'manual correction required'];
    if (blacklist.includes(s)) {
        return "General Knowledge";
    }

    // Default to Title Case
    return subject.charAt(0).toUpperCase() + subject.slice(1);
};

/**
 * Shuffles an array in place using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

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
            
            query = query.range(offsetCount, offsetCount + limitCount - 1);

            if (tableName === 'subscriptions' || tableName === 'currentaffairs' || tableName === 'gk' || tableName === 'notifications' || tableName === 'flashcards' || tableName === 'bookstore') {
                query = query.order('id', { ascending: false });
            }

            const { data, error } = await query;
            if (!error && data && data.length > 0) {
                if (tableName === 'questionbank') {
                    const processedQuestions = data.map(q => {
                        const originalOptions = smartParseOptions(q.options);
                        if (originalOptions.length === 0) return { ...q, options: [], correctAnswerIndex: 1, subject: normalizeSubject(q.subject, q.topic) };
                        const originalCorrectIdx = Math.max(0, Math.min(parseInt(String(q.correct_answer_index || '1')) - 1, originalOptions.length - 1));
                        const correctText = originalOptions[originalCorrectIdx];
                        const shuffled = shuffleArray(originalOptions);
                        const newCorrectIdx = shuffled.indexOf(correctText) + 1;

                        return {
                            ...q,
                            options: shuffled,
                            correctAnswerIndex: newCorrectIdx || 1,
                            subject: normalizeSubject(q.subject, q.topic)
                        };
                    });

                    return res.status(200).json(processedQuestions.sort(() => 0.5 - Math.random()));
                }
                return res.status(200).json(data);
            }
        }

        // Sheets Fallback
        const sheetName = type.charAt(0).toUpperCase() + type.slice(1);
        try {
            const rows = await readSheetData(`${sheetName}!A2:Z`);
            const paginatedRows = rows.slice(offsetCount, offsetCount + limitCount);
            
            if (tType === 'questions') {
                 return res.status(200).json(paginatedRows.map((r, i) => {
                    const originalOptions = smartParseOptions(r[3]);
                    const originalCorrectIdx = Math.max(0, Math.min(parseInt(String(r[4] || '1')) - 1, originalOptions.length - 1));
                    const correctText = originalOptions[originalCorrectIdx];
                    const shuffled = shuffleArray(originalOptions);
                    const newCorrectIdx = shuffled.indexOf(correctText) + 1;

                    return {
                        id: String(r[0] || (offsetCount + i)), 
                        topic: r[1], 
                        question: r[2], 
                        options: shuffled, 
                        correctAnswerIndex: newCorrectIdx || 1, 
                        subject: normalizeSubject(r[5], r[1]), 
                        difficulty: r[6]
                    };
                 }).sort(() => 0.5 - Math.random()));
            }
            return res.status(200).json(paginatedRows);
        } catch (sheetErr: any) {
            return res.status(200).json([]);
        }

    } catch (error: any) { 
        return res.status(500).json({ error: "Database Request Failed" }); 
    }
}
