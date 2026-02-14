import { readSheetData } from './_lib/sheets-service.js';
import { supabase } from './_lib/supabase-service.js';

const smartParseOptions = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    let clean = String(raw).trim();
    if (clean.startsWith('[') && clean.endsWith(']')) {
        try { return JSON.parse(clean); } catch (e) {
            try { return JSON.parse(clean.replace(/'/g, '"')); } catch (e2) {
                const inner = clean.slice(1, -1).trim();
                return inner.split('|').map(s => s.trim());
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
        'exams': 'exams',
        'questions': 'questionbank',
        'books': 'bookstore',
        'updates': 'liveupdates',
        'affairs': 'currentaffairs',
        'gk': 'gk',
        'syllabus': 'syllabus',
        'notifications': 'notifications',
        'settings': 'settings'
    };
    
    const tableName = tableMap[tType] || tType;
    const limitCount = parseInt(count as string) || 20;

    try {
        // 1. ATTEMPT SUPABASE
        if (supabase) {
            try {
                let query = supabase.from(tableName).select('*');
                
                if (tableName === 'syllabus' && examId) {
                    query = query.eq('exam_id', String(examId));
                }
                
                if (tableName === 'questionbank') {
                    // Optimized logic for subject/topic matching
                    if (subject && subject !== 'mixed' && subject !== 'General') {
                        query = query.or(`subject.ilike.%${subject}%,topic.ilike.%${subject}%,subject.ilike.%${subject.substring(0,3)}%`);
                    } else if (topic && topic !== 'mixed') {
                        query = query.ilike('topic', `%${topic}%`);
                    }
                    query = query.limit(100);
                }

                const { data, error } = await query;
                
                if (!error && data && data.length > 0) {
                    if (tableName === 'questionbank') {
                        const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, limitCount);
                        return res.status(200).json(shuffled.map(q => ({
                            ...q,
                            options: smartParseOptions(q.options),
                            correctAnswerIndex: parseInt(String(q.correct_answer_index || 0))
                        })));
                    }
                    if (tableName === 'settings') {
                        return res.status(200).json(data.reduce((acc: any, curr: any) => { acc[curr.key] = curr.value; return acc; }, {}));
                    }
                    if (tableName === 'exams') {
                        return res.status(200).json(data.map(e => ({
                            id: String(e.id), title_ml: e.title_ml, title_en: e.title_en || e.title_ml, description_ml: e.description_ml, description_en: e.description_en || e.description_ml, category: e.category, level: e.level, icon_type: e.icon_type
                        })));
                    }
                    return res.status(200).json(data.map(item => ({ ...item, id: item.id ? String(item.id) : undefined })));
                }

                // If QuestionBank query returned nothing, try to get ANY questions as a fallback
                if (tableName === 'questionbank') {
                    const { data: fallbackData } = await supabase.from('questionbank').select('*').limit(limitCount);
                    if (fallbackData && fallbackData.length > 0) {
                        return res.status(200).json(fallbackData.map(q => ({
                            ...q,
                            options: smartParseOptions(q.options),
                            correctAnswerIndex: parseInt(String(q.correct_answer_index || 0))
                        })));
                    }
                }
            } catch (sbErr) { console.error(sbErr); }
        }

        // 2. FALLBACK TO GOOGLE SHEETS
        const sheetName = type.charAt(0).toUpperCase() + type.slice(1);
        switch (tType) {
            case 'settings':
                const sRows = await readSheetData('Settings!A2:B');
                return res.status(200).json(sRows.reduce((acc: any, curr: any) => { if(curr[0]) acc[curr[0]] = curr[1]; return acc; }, {}));
            case 'exams':
                const eRows = await readSheetData('Exams!A2:H');
                return res.status(200).json(eRows.filter(r => r[0]).map(r => ({
                    id: String(r[0]), title_ml: r[1], title_en: r[2], description_ml: r[3], description_en: r[4], category: r[5], level: r[6], icon_type: r[7]
                })));
            case 'syllabus':
                const sylRows = await readSheetData('Syllabus!A2:G');
                return res.status(200).json(sylRows.filter(r => r[0] && (!examId || String(r[1]) === String(examId))).map(r => ({
                    id: String(r[0]), exam_id: String(r[1]), title: r[2], questions: parseInt(r[3] || '20'), duration: parseInt(r[4] || '20'), subject: r[5], topic: r[6]
                })));
            case 'questions':
                const qRows = await readSheetData('QuestionBank!A2:H');
                let filteredQ = qRows.filter(r => r[0] && (!subject || subject === 'mixed' || subject === 'General' || String(r[5]).toLowerCase().includes(String(subject).toLowerCase())));
                
                // If specific subject filter resulted in 0 questions, ignore filter and take general pool
                if (filteredQ.length === 0) filteredQ = qRows.filter(r => r[0]);

                const shuffledQ = filteredQ.sort(() => 0.5 - Math.random()).slice(0, limitCount);
                return res.status(200).json(shuffledQ.map(r => ({
                    id: String(r[0]), topic: r[1], question: r[2], options: smartParseOptions(r[3]), correctAnswerIndex: parseInt(r[4] || '0'), subject: r[5], difficulty: r[6]
                })));
            default:
                const genericRows = await readSheetData(`${sheetName}!A2:Z`);
                return res.status(200).json(genericRows);
        }
    } catch (error: any) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}