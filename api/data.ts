
import { readSheetData } from './_lib/sheets-service.js';

export default async function handler(req: any, res: any) {
    const { type, topic, count, examId } = req.query;

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
                const sRows = await readSheetData('Syllabus!A2:F');
                return res.status(200).json(sRows.filter(r => r[1] === examId).map(r => ({
                    id: r[0], exam_id: r[1], title: r[2], 
                    questions: parseInt(r[3] || '20'), 
                    duration: parseInt(r[4] || '20'), 
                    topic: r[5]
                })));

            case 'questions':
                if (!topic) return res.status(400).json({ error: 'Topic is required' });
                const qLimit = parseInt(count as string) || 20;
                const allQs = await readSheetData('QuestionBank!A2:G');

                const searchTopic = (topic as string).toLowerCase().trim();
                const cleanTopic = searchTopic.replace(/^(topic|subject):/i, '').trim();

                const filtered = allQs.filter(r => {
                    const rowTopic = (r[1] || '').toLowerCase().trim();
                    const rowSubject = (r[5] || '').toLowerCase().trim();
                    // Match if topic contains search string or vice-versa
                    return rowTopic.includes(cleanTopic) || 
                           rowSubject.includes(cleanTopic) || 
                           cleanTopic.includes(rowTopic);
                }).map(r => {
                    let options = [];
                    try {
                        const raw = r[3] || '[]';
                        options = raw.startsWith('[') ? JSON.parse(raw) : raw.split(',').map((o:any)=>o.trim());
                    } catch(e) { options = ["A", "B", "C", "D"]; }
                    return { 
                        id: r[0], topic: r[1], question: r[2], options: options, 
                        correctAnswerIndex: parseInt(r[4] || '0'), subject: r[5], difficulty: r[6] 
                    };
                });
                
                // Shuffle and take requested count
                const shuffled = filtered.sort(() => 0.5 - Math.random()).slice(0, qLimit);
                return res.status(200).json(shuffled);

            case 'books':
                const bRows = await readSheetData('Bookstore!A2:E');
                return res.status(200).json(bRows.map(r => ({ id: r[0], title: r[1], author: r[2], imageUrl: r[3], amazonLink: r[4] })));

            case 'notifications':
                const nRows = await readSheetData('Notifications!A2:E');
                return res.status(200).json(nRows.map(r => ({ id: r[0], title: r[1], categoryNumber: r[2], lastDate: r[3], link: r[4] })));

            default:
                return res.status(400).json({ error: 'Invalid type' });
        }
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
