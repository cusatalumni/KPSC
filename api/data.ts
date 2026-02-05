
import { readSheetData } from './_lib/sheets-service.js';

/**
 * Smartly parses question options from various string formats
 */
const parseOptions = (raw: string): string[] => {
    if (!raw) return [];
    let clean = raw.trim();
    
    // 1. Try standard JSON parsing
    try {
        if (clean.startsWith('[') && clean.endsWith(']')) {
            return JSON.parse(clean);
        }
    } catch (e) {
        // If it fails, it might be using single quotes like ['a', 'b']
        try {
            return JSON.parse(clean.replace(/'/g, '"'));
        } catch (e2) {
            // Still fails, strip brackets and proceed to split
            clean = clean.substring(1, clean.length - 1);
        }
    }

    // 2. Try Pipe Separation
    if (clean.includes('|')) {
        return clean.split('|').map(s => s.trim());
    }

    // 3. Try Comma Separation (handling quotes)
    if (clean.includes(',')) {
        // Regex to split by comma but ignore commas inside quotes
        const parts = clean.match(/(".*?"|'.*?'|[^,]+)/g);
        if (parts) {
            return parts.map(s => s.trim().replace(/^["']|["']$/g, ''));
        }
    }

    // 4. Fallback: single value
    return [clean];
};

export default async function handler(req: any, res: any) {
    const { type, topic, subject, count, examId } = req.query;

    try {
        switch (type) {
            case 'exams':
                const eRows = await readSheetData('Exams!A2:H');
                return res.status(200).json(eRows.map(r => ({
                    id: r[0], title_ml: r[1], title_en: r[2], 
                    description_ml: r[3], description_en: r[4], 
                    category: r[5], level: r[6], icon_type: r[7]
                })));

            case 'syllabus':
                const sRows = await readSheetData('Syllabus!A2:G');
                return res.status(200).json(sRows.filter(r => r[1] === examId).map(r => ({
                    id: r[0], exam_id: r[1], title: r[2], 
                    questions: parseInt(r[3] || '20'), 
                    duration: parseInt(r[4] || '20'), 
                    subject: r[5] || '',
                    topic: r[6] || ''
                })));

            case 'questions':
                const qLimit = parseInt(count as string) || 20;
                let allQs = [];
                try {
                    allQs = await readSheetData('QuestionBank!A2:G');
                } catch (e) { 
                    console.error("Question fetch error:", e); 
                    return res.status(200).json([]);
                }

                const filterSubject = (subject as string || '').toLowerCase().trim();
                const filterTopic = (topic as string || '').toLowerCase().trim();

                const filtered = allQs.filter(r => {
                    if (!r || r.length < 3) return false;
                    const rowTopic = (r[1] || '').toLowerCase().trim();
                    const rowSubject = (r[5] || '').toLowerCase().trim();
                    const isSubjectMatch = !filterSubject || filterSubject === 'mixed' || rowSubject === filterSubject;
                    const isTopicMatch = !filterTopic || filterTopic === 'mixed' || rowTopic === filterTopic;
                    return isSubjectMatch && isTopicMatch;
                }).map(r => {
                    let options = parseOptions(r[3] || '');
                    
                    // Always ensure we have exactly 4 items for the UI
                    while (options.length < 4) {
                        options.push(`Option ${String.fromCharCode(65 + options.length)}`);
                    }

                    return { 
                        id: r[0], 
                        topic: r[1], 
                        question: r[2], 
                        options: options.slice(0, 4), 
                        correctAnswerIndex: parseInt(r[4] || '0'), 
                        subject: r[5], 
                        difficulty: r[6] 
                    };
                });
                
                return res.status(200).json(filtered.sort(() => 0.5 - Math.random()).slice(0, qLimit));

            case 'books':
                const bRows = await readSheetData('Bookstore!A2:E');
                return res.status(200).json(bRows.map(r => ({ id: r[0], title: r[1], author: r[2], imageUrl: r[3], amazonLink: r[4] })));

            case 'notifications':
                const nRows = await readSheetData('Notifications!A2:E');
                return res.status(200).json(nRows.map(r => ({ id: r[0], title: r[1], categoryNumber: r[2], lastDate: r[3], link: r[4] })));

            case 'updates':
                const uRows = await readSheetData('LiveUpdates!A2:D');
                return res.status(200).json(uRows.map(r => ({ title: r[0], url: r[1], section: r[2], published_date: r[3] })));

            case 'affairs':
                const aRows = await readSheetData('CurrentAffairs!A2:D');
                return res.status(200).json(aRows.map(r => ({ id: r[0], title: r[1], source: r[2], date: r[3] })));

            case 'gk':
                const gRows = await readSheetData('GK!A2:C');
                return res.status(200).json(gRows.map(r => ({ id: r[0], fact: r[1], category: r[2] })));

            default:
                return res.status(400).json({ error: 'Invalid type' });
        }
    } catch (error: any) {
        console.error("Data API Error:", error.message);
        return res.status(200).json([]); 
    }
}
