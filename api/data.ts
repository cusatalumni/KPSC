
import { readSheetData } from './_lib/sheets-service.js';
import { supabase } from './_lib/supabase-service.js';

const smartParseOptions = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    let clean = String(raw).trim();
    if (clean.startsWith('[') && clean.endsWith(']')) {
        try { 
            return JSON.parse(clean); 
        } catch (e) {
            try {
                return JSON.parse(clean.replace(/'/g, '"'));
            } catch (e2) {
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
        'syllabus': 'syllabus'
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
                        ...q, options: smartParseOptions(q.options), correctAnswerIndex: q.correct_answer_index
                    })));
                }
            } else if (sbTable === 'settings') {
                const { data, error } = await query;
                if (!error && data?.length) return res.status(200).json(data.reduce((acc: any, curr: any) => { acc[curr.key] = curr.value; return acc; }, {}));
            } else if (sbTable === 'syllabus' && examId) {
                const { data, error } = await query.eq('exam_id', examId);
                if (!error && data?.length) return res.status(200).json(data);
            } else {
                const { data, error } = await query.limit(100);
                if (!error && data?.length) return res.status(200).json(data);
            }
        }

        switch (tType) {
            case 'settings':
                const sRows = await readSheetData('Settings!A2:B');
                return res.status(200).json(sRows.reduce((acc: any, curr: any) => { acc[curr[0]] = curr[1]; return acc; }, {}));
            case 'exams':
                const eRows = await readSheetData('Exams!A2:H');
                return res.status(200).json(eRows.filter(r => r[0]).map(r => ({ id: String(r[0]), title_ml: r[1], title_en: r[2], description_ml: r[3], description_en: r[4], category: r[5], level: r[6], icon_type: r[7] })));
            case 'books':
                const bRows = await readSheetData('Bookstore!A2:E');
                return res.status(200).json(bRows.filter(r => r[0]).map(r => ({ id: String(r[0]), title: r[1], author: r[2], imageUrl: r[3], amazonLink: r[4] })));
            case 'updates':
                const uRows = await readSheetData('LiveUpdates!A2:D');
                return res.status(200).json(uRows.map(r => ({ title: r[0], url: r[1], section: r[2], published_date: r[3] })));
            case 'affairs':
                const aRows = await readSheetData('CurrentAffairs!A2:D');
                return res.status(200).json(aRows.filter(r => r[0]).map(r => ({ id: String(r[0]), title: r[1], source: r[2], date: r[3] })));
            case 'gk':
                const gRows = await readSheetData('GK!A2:C');
                return res.status(200).json(gRows.filter(r => r[0]).map(r => ({ id: String(r[0]), fact: r[1], category: r[2] })));
            case 'syllabus':
                const sylRows = await readSheetData('Syllabus!A2:G');
                const filtered = examId ? sylRows.filter(r => String(r[1]) === String(examId)) : sylRows;
                return res.status(200).json(filtered.filter(r => r[0]).map(r => ({ id: r[0], exam_id: r[1], title: r[2], questions: parseInt(r[3]), duration: parseInt(r[4]), subject: r[5], topic: r[6] })));
            case 'questions':
                const allQs = await readSheetData('QuestionBank!A2:G');
                const filteredQs = allQs.filter(r => {
                    if (!r[0]) return false;
                    const rowTopic = (r[1] || '').toLowerCase();
                    const rowSub = (r[5] || '').toLowerCase();
                    const fSub = (subject as string || '').toLowerCase();
                    const fTop = (topic as string || '').toLowerCase();
                    return (!fSub || fSub === 'mixed' || rowSub.includes(fSub)) && (!fTop || fTop === 'mixed' || rowTopic.includes(fTop));
                }).map(r => ({ id: r[0], topic: r[1], question: r[2], options: smartParseOptions(r[3]), correctAnswerIndex: parseInt(r[4]||'0'), subject: r[5], difficulty: r[6] }));
                return res.status(200).json(filteredQs.sort(() => 0.5 - Math.random()).slice(0, parseInt(count as string) || 20));
            default:
                return res.status(200).json(await readSheetData(`${type.charAt(0).toUpperCase() + type.slice(1)}!A2:Z`));
        }
    } catch (error: any) {
        return res.status(500).json({ error: error.message, type: tType });
    }
}
