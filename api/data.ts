
import { readSheetData } from './_lib/sheets-service.js';
import { supabase } from './_lib/supabase-service.js';

const smartParseOptions = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    
    let clean = String(raw).trim();
    
    // Handle cases like [Option 1 | Option 2] or ['Opt 1', 'Opt 2']
    if (clean.startsWith('[') && clean.endsWith(']')) {
        const inner = clean.slice(1, -1).trim();
        
        // Try JSON parsing first (fixing common single quote issue)
        try {
            return JSON.parse(clean.replace(/'/g, '"'));
        } catch (e) {
            // If JSON fails, check for delimiters inside brackets
            if (inner.includes('|')) return inner.split('|').map(s => s.trim());
            if (inner.includes(',')) {
                // Remove potential quotes around individual items if splitting by comma
                return inner.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
            }
            return [inner];
        }
    }
    
    // Handle raw delimited strings without brackets
    if (clean.includes('|')) return clean.split('|').map(s => s.trim());
    if (clean.includes(',')) return clean.split(',').map(s => s.trim());
    
    return [clean];
};

export default async function handler(req: any, res: any) {
    const { type, topic, subject, count, examId } = req.query;
    if (!type) return res.status(400).json({ error: 'Type is required' });

    let table = type.toLowerCase();
    if (table === 'questions') table = 'questionbank';

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
                if (!error && data) {
                    const sMap = data.reduce((acc: any, curr: any) => { acc[curr.key] = curr.value; return acc; }, {});
                    if (Object.keys(sMap).length > 0) return res.status(200).json(sMap);
                }
            } else if (table === 'syllabus' && examId) {
                const { data, error } = await query.eq('exam_id', examId);
                if (!error && data && data.length > 0) return res.status(200).json(data);
            } else {
                const { data, error } = await query.limit(100);
                if (!error && data && data.length > 0) return res.status(200).json(data);
            }
        }

        switch (type.toLowerCase()) {
            case 'settings':
                const sRows = await readSheetData('Settings!A2:B');
                const settings = sRows.reduce((acc: any, curr: any) => { acc[curr[0]] = curr[1]; return acc; }, {});
                if (!settings.subscription_model_active) settings.subscription_model_active = 'true';
                return res.status(200).json(settings);

            case 'questions':
                const allQs = await readSheetData('QuestionBank!A2:G');
                const filtered = allQs.filter(r => {
                    const rowTopic = (r[1] || '').toLowerCase();
                    const rowSub = (r[5] || '').toLowerCase();
                    const fSub = (subject as string || '').toLowerCase();
                    const fTop = (topic as string || '').toLowerCase();
                    return (!fSub || fSub === 'mixed' || rowSub.includes(fSub)) && (!fTop || fTop === 'mixed' || rowTopic.includes(fTop));
                }).map(r => ({ 
                    id: r[0], 
                    topic: r[1], 
                    question: r[2], 
                    options: smartParseOptions(r[3]), 
                    correctAnswerIndex: parseInt(r[4]||'0'), 
                    subject: r[5], 
                    difficulty: r[6] 
                }));
                return res.status(200).json(filtered.sort(() => 0.5 - Math.random()).slice(0, parseInt(count as string) || 20));

            default:
                return res.status(400).json({ error: 'Invalid type' });
        }
    } catch (error: any) {
        return res.status(500).json({ error: error.message }); 
    }
}
