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
                if (inner.includes('|')) return inner.split('|').map(s => s.trim());
                if (inner.includes(',')) return inner.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                return [inner];
            }
        }
    }
    if (clean.includes('|')) return clean.split('|').map(s => s.trim());
    if (clean.includes(',')) return clean.split(',').map(s => s.trim());
    return [clean];
};

const smartRowSplitter = (row: any[]): any[] => {
    if (!row || row.length === 0) return [];
    if (row.length === 1 && String(row[0]).includes(',')) {
        return row[0].split(',').map((s: string) => s.trim().replace(/^['"]|['"]$/g, ''));
    }
    return row;
};

export default async function handler(req: any, res: any) {
    const { type, topic, subject, count, examId } = req.query;
    if (!type) return res.status(400).json({ error: 'Type is required' });

    const tType = type.toLowerCase();
    const sbTableMap: Record<string, string> = {
        'questions': 'questionbank',
        'books': 'bookstore',
        'updates': 'liveupdates',
        'affairs': 'currentaffairs',
        'exams': 'exams',
        'settings': 'settings',
        'gk': 'gk',
        'syllabus': 'syllabus',
        'notifications': 'notifications'
    };
    const sbTable = sbTableMap[tType] || tType;

    try {
        if (supabase) {
            let query = supabase.from(sbTable).select('*');
            
            if (sbTable === 'questionbank') {
                if (subject && subject !== 'mixed') query = query.or(`subject.ilike.%${subject}%,topic.ilike.%${subject}%`);
                else if (topic && topic !== 'mixed') query = query.ilike('topic', `%${topic}%`);
                const { data, error } = await query.limit(200);
                if (!error && data?.length) {
                    const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, parseInt(count as string) || 20);
                    return res.status(200).json(shuffled.map(q => ({
                        ...q, 
                        id: q.id,
                        options: smartParseOptions(q.options), 
                        correctAnswerIndex: q.correct_answer_index || 0,
                        subject: q.subject || 'General',
                        difficulty: q.difficulty || 'Moderate'
                    })));
                }
            } else if (sbTable === 'settings') {
                const { data, error } = await query;
                if (!error && data?.length) return res.status(200).json(data.reduce((acc: any, curr: any) => { acc[curr.key] = curr.value; return acc; }, {}));
            } else if (sbTable === 'exams') {
                const { data, error } = await query;
                if (!error && data?.length) return res.status(200).json(data.map(e => ({
                    id: String(e.id),
                    title_ml: e.title_ml, title_en: e.title_en,
                    description_ml: e.description_ml, description_en: e.description_en,
                    category: e.category, level: e.level, icon_type: e.icon_type
                })));
            } else if (sbTable === 'syllabus') {
                if (examId) query = query.eq('exam_id', String(examId));
                const { data, error } = await query;
                if (!error && data?.length) return res.status(200).json(data.map(i => ({ 
                    id: String(i.id), 
                    exam_id: String(i.exam_id),
                    title: i.title,
                    questions: i.questions,
                    duration: i.duration,
                    subject: i.subject,
                    topic: i.topic
                })));
            } else {
                const { data, error } = await query.limit(100);
                if (!error && data?.length) return res.status(200).json(data.map(i => (i.id ? { ...i, id: String(i.id) } : i)));
            }
        }

        // --- SHEETS FALLBACK ---
        switch (tType) {
            case 'settings':
                const sRows = await readSheetData('Settings!A2:B');
                return res.status(200).json(sRows.reduce((acc: any, curr: any) => { if(curr[0]) acc[curr[0]] = curr[1]; return acc; }, {}));
            case 'exams':
                const eRows = await readSheetData('Exams!A2:H');
                return res.status(200).json(eRows.filter(r => r[0]).map(r => {
                    const cols = smartRowSplitter(r);
                    return { id: String(cols[0]), title_ml: cols[1], title_en: cols[2], description_ml: cols[3], description_en: cols[4], category: cols[5], level: cols[6], icon_type: cols[7] };
                }));
            case 'syllabus':
                const sylRows = await readSheetData('Syllabus!A2:G');
                const filtered = sylRows.filter(r => {
                    if (!r[0]) return false;
                    const cols = smartRowSplitter(r);
                    return !examId || String(cols[1]).trim() === String(examId).trim();
                });
                return res.status(200).json(filtered.map(r => {
                    const cols = smartRowSplitter(r);
                    return { id: String(cols[0]), exam_id: String(cols[1]), title: cols[2], questions: parseInt(cols[3] || '20'), duration: parseInt(cols[4] || '20'), subject: cols[5], topic: cols[6] };
                }));
            default:
                const sheetName = type.charAt(0).toUpperCase() + type.slice(1);
                const genericRows = await readSheetData(`${sheetName}!A2:Z`);
                return res.status(200).json(genericRows.map(r => smartRowSplitter(r)));
        }
    } catch (error: any) {
        console.error(`Fetch Failure [${tType}]:`, error.message);
        return res.status(500).json({ error: error.message, type: tType });
    }
}