
import { readSheetData } from './_lib/sheets-service.js';

export default async function handler(req: any, res: any) {
    const { type, topic, count, examId } = req.query;

    try {
        switch (type) {
            case 'exams':
                const eRows = await readSheetData('Exams!A2:H');
                if (!eRows || eRows.length === 0) return res.status(200).json([]);
                return res.status(200).json(eRows.map(r => ({
                    id: r[0], title_ml: r[1], title_en: r[2], 
                    description_ml: r[3], description_en: r[4], 
                    category: r[5], level: r[6], icon_type: r[7]
                })));

            case 'syllabus':
                const sRows = await readSheetData('Syllabus!A2:F');
                if (!sRows) return res.status(200).json([]);
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
                let nRows = await readSheetData('Notifications!A2:E');
                if (!nRows) return res.status(200).json([]);
                return res.status(200).json(nRows.map(r => ({ id: r[0], title: r[1], categoryNumber: r[2], lastDate: r[3], link: r[4] || '#' })));
            
            case 'updates':
                let uRows = await readSheetData('LiveUpdates!A2:D');
                if (!uRows) return res.status(200).json([]);
                return res.status(200).json(uRows.map(r => ({ title: r[0], url: r[1] || '#', section: r[2] || 'Update', published_date: r[3] })));

            case 'questions':
                if (!topic) return res.status(200).json([]);
                const qLimit = parseInt(count as string) || 10;
                let allQs = [];
                try {
                    allQs = await readSheetData('QuestionBank!A2:G');
                } catch (e) {
                    console.error("Sheet read error for Questions:", e);
                    return res.status(200).json([]);
                }
                
                if (!allQs || allQs.length === 0) return res.status(200).json([]);

                const cleanTopic = (topic as string).toLowerCase()
                    .replace(/^(topic|subject|exam):/i, '')
                    .trim();

                const filtered = allQs.filter(r => {
                    const rowTopic = (r[1] || '').toLowerCase()
                        .replace(/^(topic|subject|exam):/i, '')
                        .trim();
                    const rowSubject = (r[5] || '').toLowerCase().trim();
                    const rowQuestion = (r[2] || '').toLowerCase();

                    return rowTopic.includes(cleanTopic) || 
                           cleanTopic.includes(rowTopic) ||
                           rowSubject.includes(cleanTopic) ||
                           (cleanTopic.length > 3 && rowQuestion.includes(cleanTopic));
                }).map(r => {
                    let options = [];
                    try { options = JSON.parse(r[3] || '[]'); } catch(e) { options = [r[3] || "Option A", "Option B", "Option C", "Option D"]; }
                    return { 
                        id: r[0], 
                        topic: r[1], 
                        question: r[2], 
                        options: options, 
                        correctAnswerIndex: parseInt(r[4] || '0'), 
                        subject: r[5], 
                        difficulty: r[6] 
                    };
                });
                
                const finalQuestions = filtered.sort(() => 0.5 - Math.random());
                return res.status(200).json(finalQuestions.slice(0, qLimit));

            case 'books':
                const bRows = await readSheetData('Bookstore!A2:E');
                if (!bRows || bRows.length === 0) return res.status(200).json([]);
                return res.status(200).json(bRows.map(r => ({ 
                    id: r[0], 
                    title: r[1], 
                    author: r[2], 
                    imageUrl: r[3], 
                    amazonLink: r[4] 
                })));

            case 'affairs':
                const aRows = await readSheetData('CurrentAffairs!A2:D');
                if (!aRows) return res.status(200).json([]);
                return res.status(200).json(aRows.map(r => ({ id: r[0], title: r[1], source: r[2], date: r[3] })));

            case 'gk':
                const gRows = await readSheetData('GK!A2:C');
                if (!gRows) return res.status(200).json([]);
                return res.status(200).json(gRows.map(r => ({ id: r[0], fact: r[1], category: r[2] })));

            default:
                return res.status(400).json({ error: 'Invalid type requested' });
        }
    } catch (error: any) {
        console.error(`API Runtime Error [${type}]:`, error.message);
        return res.status(200).json([]); // Always return empty array on data error
    }
}
