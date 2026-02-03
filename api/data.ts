
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
                const nRows = await readSheetData('Notifications!A2:E');
                return res.status(200).json(nRows.map(r => ({ 
                    id: r[0], title: r[1], categoryNumber: r[2], lastDate: r[3], link: r[4] || '#' 
                })));
            
            case 'updates':
                const uRows = await readSheetData('LiveUpdates!A2:D');
                return res.status(200).json(uRows.map(r => ({ 
                    title: r[0], url: r[1] || '#', section: r[2] || 'Update', published_date: r[3] 
                })));

            case 'questions':
                if (!topic) return res.status(400).json({ error: 'Topic is required' });
                const qLimit = parseInt(count as string) || 10;
                const allQs = await readSheetData('QuestionBank!A2:G');

                const requestedTopic = (topic as string).toLowerCase().trim();
                const cleanInputTopic = requestedTopic.replace(/^(topic|subject):/i, '').trim();

                const filtered = allQs.filter(r => {
                    const rowTopic = (r[1] || '').toLowerCase().trim();
                    const rowSubject = (r[5] || '').toLowerCase().trim();
                    const cleanRowTopic = rowTopic.replace(/^(topic|subject):/i, '').trim();
                    
                    return cleanRowTopic === cleanInputTopic || 
                           rowTopic === requestedTopic ||
                           rowSubject === cleanInputTopic ||
                           rowTopic.includes(cleanInputTopic);
                }).map(r => {
                    let options = [];
                    try { 
                        options = JSON.parse(r[3] || '[]'); 
                        if (!Array.isArray(options)) throw new Error();
                    } catch(e) { 
                        options = [r[3] || "A", "B", "C", "D"]; 
                    }
                    return { 
                        id: r[0], topic: r[1], question: r[2], options: options, 
                        correctAnswerIndex: parseInt(r[4] || '0'), subject: r[5], difficulty: r[6] 
                    };
                });
                
                return res.status(200).json(filtered.sort(() => 0.5 - Math.random()).slice(0, qLimit));

            case 'books':
                const bRows = await readSheetData('Bookstore!A2:E');
                return res.status(200).json(bRows.map(r => ({ 
                    id: r[0], title: r[1], author: r[2], imageUrl: r[3], amazonLink: r[4] 
                })));

            case 'affairs':
                const aRows = await readSheetData('CurrentAffairs!A2:D');
                return res.status(200).json(aRows.map(r => ({ id: r[0], title: r[1], source: r[2], date: r[3] })));

            case 'gk':
                const gRows = await readSheetData('GK!A2:C');
                return res.status(200).json(gRows.map(r => ({ id: r[0], fact: r[1], category: r[2] })));

            default:
                return res.status(400).json({ error: 'Invalid type requested' });
        }
    } catch (error: any) {
        console.error(`API Handler Error [${type}]:`, error.message);
        // Return 500 but keep it friendly. On production, you might want to return mock data as fallback.
        return res.status(500).json({ 
            error: 'Database connection failed', 
            details: error.message,
            help: 'Check if Google Sheet is shared with your service account email.'
        });
    }
}
