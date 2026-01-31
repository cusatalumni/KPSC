
import type { QuestionPaper } from '../types';
import { MOCK_QUESTION_PAPERS } from "../constants";
import { Type } from "@google/genai";

/**
 * Searches for previous papers by calling our secure internal backend.
 * The API key is handled on the server side to prevent exposure.
 */
export const searchPreviousPapers = async (query: string): Promise<QuestionPaper[]> => {
    try {
        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: `Search for Kerala PSC previous question papers matching the query "${query}". 
                Target official sources like keralapsc.gov.in. 
                Return a JSON array of the top 5 most relevant results. 
                Each object must have 'title', 'url', and 'date'.`,
                model: 'gemini-3-flash-preview',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            url: { type: Type.STRING },
                            date: { type: Type.STRING }
                        },
                        required: ["title", "url", "date"]
                    }
                }
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Backend AI request failed');
        }

        const data = await response.json();
        
        if (Array.isArray(data)) {
            return data as QuestionPaper[];
        }
        
        return MOCK_QUESTION_PAPERS;

    } catch (error) {
        console.error("Error fetching papers from backend AI:", error);
        return MOCK_QUESTION_PAPERS;
    }
};
