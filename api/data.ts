
import { readSheetData } from './_lib/sheets-service.js';
import { supabase } from './_lib/supabase-service.js';

const smartParseOptions = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    
    let clean = String(raw).trim();
    
    if (clean.startsWith('[') && clean.endsWith(']')) {
        const inner = clean.slice(1, -1).trim();
        try {
            return JSON.parse(clean.replace(/'/g, '"'));
        } catch (e) {
            if (inner.includes('|')) return inner.split('|').map(s => s.trim());
            if (inner.includes(',')) {
                return inner.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
            }
            return [inner];
        }
    }
    if (clean.includes('|')) return clean.split('|').map(s => s.trim());
    if (clean.includes(',')) return clean.split(',').map(s => s.trim());
    return [clean];
};

export default async function handler(req: any, res: any) {
    const { type, topic, subject, count, examId } = req.query;
    if (!type) return res.status(400).json({ error: 'Type is required' });

    let table = type.toLowerCase();
    if (table === 'questions') table = 'questionbank';
    if (table === 'books') table = 'bookstore';
    if (table === 'updates') table = 'liveupdates';
    if (table === 'affairs') table = 'currentaffairs';

    try {
        if (supabase) {
            let query = supabase.from(table).select('*');
            
            if (table === 'questionbank') {
                if (subject && subject !== 'mixed') {
                    query = query.or(`subject.ilike.%${subject}%,topic.ilike.%${subject}%`);
                } else if (topic && topic !== 'mixed') {
                    query = query.ilike('topic', `%${topic}%`);
                }
                const { data, error } = await query.limit(200);
                if (!error && data && data.length > 0) {
                    const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, parseInt(count as string) || 20);
                    return res.status(200).json(shuffled.map(q => ({
                        ...q,
                        options: smartParseOptions(q.options),
                        correctAnswerIndex: q.correct_answer_index
                    })));
                }
            } else if (table === 'settings') {
                const { data, error } = await query;
                if (!error && data && data.length > 0) {
                    const sMap = data.reduce((acc: any, curr: any) => { acc[curr.key] = curr.value; return acc; }, {});
                    return res.status(200).json(sMap);
                }
            } else if (table === 'syllabus' && examId) {
                const { data, error } = await query.eq('exam_id', examId);
                if (!error && data && data.length > 0) return res.status(200).json(data);
            } else {
                const { data, error } = await query.limit(100);
                if (!error && data && data.length > 0) return res.status(200).json(data);
            }
        }

        // Fallback Logic
        switch (type.toLowerCase()) {
            case 'settings':
                const sRows = await readSheetData('Settings!A2:B');
                const settings = sRows.reduce((acc: any, curr: any) => { acc[curr[0]] = curr[1]; return acc; }, {});
                if (!settings.subscription_model_active) settings.subscription_model_active = 'true';
                return res.status(200).json(settings);

            case 'exams':
                const eRows = await readSheetData('Exams!A2:H');
                return res.status(200).json(eRows.map(r => ({
                    id: r[0], title_ml: r[1], title_en: r[2], description_ml: r[3], category: r[5], level: r[6], icon_type: r[7]
                })));

            case 'books':
                const bRows = await readSheetData('Bookstore!A2:E');
                return res.status(200).json(bRows.map(r => ({ id: r[0], title: r[1], author: r[2], imageUrl: r[3], amazonLink: r[4] })));

            case 'syllabus':
                const sylRows = await readSheetData('Syllabus!A2:G');
                const filteredSyl = examId ? sylRows.filter(r => r[1] === examId) : sylRows;
                return res.status(200).json(filteredSyl.map(r => ({
                    id: r[0], exam_id: r[1], title: r[2], questions: parseInt(r[3]), duration: parseInt(r[4]), subject: r[5], topic: r[6]
                })));

            default:
                return res.status(200).json([]);
        }
    } catch (error: any) {
        return res.status(200).json([]); 
    }
}
