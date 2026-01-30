
import { GoogleGenAI, Type } from "@google/genai";
import { readSheetData } from './_lib/sheets-service.js';

export default async function handler(req: any, res: any) {
    const { type, topic, count, examId } = req.query;

    try {
        switch (type) {
            case 'exams':
                const eRows = await readSheetData('Exams!A2:H').catch(() => []);
                return res.status(200).json(eRows.map(r => ({
                    id: r[0], title_ml: r[1], title_en: r[2], 
                    description_ml: r[3], description_en: r[4], 
                    category: r[5], level: r[6], icon_type: r[7]
                })));

            case 'syllabus':
                const sRows = await readSheetData('Syllabus!A2:F').catch(() => []);
                const filteredSyllabus = sRows
                    .filter(r => r[1] === examId)
                    .map(r => ({
                        id: r[0], exam_id: r[1], title: r[2], 
                        questions: parseInt(r[3] || '20'), 
                        duration: parseInt(r[4] || '20'), 
                        topic: r[5]
                    }));
                return res.status(200).json(filteredSyllabus);

            case 'notifications':
                let nRows = await readSheetData('Notifications!A2:E').catch(() => []);
                return res.status(200).json(nRows.map(r => ({ id: r[0], title: r[1], categoryNumber: r[2], lastDate: r[3], link: r[4] || '#' })));
            
            case 'updates':
                let uRows = await readSheetData('LiveUpdates!A2:D').catch(() => []);
                return res.status(200).json(uRows.map(r => ({ title: r[0], url: r[1] || '#', section: r[2] || 'Update', published_date: r[3] })));

            case 'questions':
                if (!topic) return res.status(400).json({ error: 'Topic required' });
                const qLimit = parseInt(count as string) || 10;
                const allQs = await readSheetData('QuestionBank!A2:G').catch(() => []);
                const filtered = allQs.filter(r => (r[1] || '').toLowerCase().includes((topic as string).toLowerCase()))
                    .map(r => ({ id: r[0], topic: r[1], question: r[2], options: JSON.parse(r[3] || '[]'), correctAnswerIndex: parseInt(r[4] || '0'), subject: r[5], difficulty: r[6] }));
                return res.status(200).json(filtered.slice(0, qLimit));

            default:
                return res.status(400).json({ error: 'Invalid type' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
