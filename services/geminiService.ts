
import { GoogleGenAI, Type } from "@google/genai";
import type { QuestionPaper } from '../types';
import { MOCK_QUESTION_PAPERS } from "../constants";

// Function to safely get or create the AI instance
const getAiInstance = () => {
    const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY;
    if (!apiKey) {
        console.warn("Gemini API Key missing. Using mock data.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const searchPreviousPapers = async (query: string): Promise<QuestionPaper[]> => {
    try {
        const ai = getAiInstance();
        if (!ai) return MOCK_QUESTION_PAPERS;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Search for Kerala PSC previous question papers matching the query "${query}". 
            Target official sources like keralapsc.gov.in. 
            Return a JSON array of the top 5 most relevant results. 
            Each object must have 'title', 'url', and 'date'.`,
            config: {
                responseMimeType: "application/json",
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
            }
        });
        
        const jsonString = response.text?.trim() || "[]";
        const parsedJson = JSON.parse(jsonString);

        if (Array.isArray(parsedJson)) {
            return parsedJson as QuestionPaper[];
        } else {
             return MOCK_QUESTION_PAPERS;
        }

    } catch (error) {
        console.error("Error fetching papers from Gemini API:", error);
        return MOCK_QUESTION_PAPERS;
    }
}
