
import type { QuestionPaper } from '../types';
import { MOCK_QUESTION_PAPERS } from "../constants";
import { Type } from "@google/genai";

/**
 * Searches for previous papers by calling our secure internal backend.
 * Uses real-time Google Search targeted at official Kerala PSC archive pages.
 */
export const searchPreviousPapers = async (query: string): Promise<{ papers: QuestionPaper[], sources: any[] }> => {
    try {
        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: `You are a Kerala PSC document specialist. Search for official PDF download links for: "${query}".
                
                STRICT SEARCH SOURCES:
                You MUST prioritize results from these specific official URLs:
                1. https://www.keralapsc.gov.in/previous-question-papers
                2. https://www.keralapsc.gov.in/question-paper-descriptive-exam
                3. https://www.keralapsc.gov.in/answerkey_omrexams
                4. https://www.keralapsc.gov.in/index.php/answerkey_onlineexams
                
                Return a JSON array of objects representing the most relevant question papers or answer keys. 
                Each object MUST have:
                1. 'title': Clear name (e.g., LDC 2021 OMR Exam).
                2. 'url': The direct .pdf download link.
                3. 'year': The year of the exam.
                4. 'size': Approximate file size if known, else 'Official PDF'.
                5. 'category': One of: "OMR Question", "Descriptive", "OMR Answer Key", "Online Exam Key".`,
                model: 'gemini-3-flash-preview',
                useSearch: true,
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            url: { type: Type.STRING },
                            year: { type: Type.STRING },
                            size: { type: Type.STRING },
                            category: { type: Type.STRING }
                        },
                        required: ["title", "url", "year", "category"]
                    }
                }
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Backend AI request failed');
        }

        const result = await response.json();
        
        return {
            papers: Array.isArray(result.data) ? result.data : MOCK_QUESTION_PAPERS,
            sources: result.sources || []
        };

    } catch (error) {
        console.error("Error fetching papers from backend AI:", error);
        return { papers: MOCK_QUESTION_PAPERS, sources: [] };
    }
};
