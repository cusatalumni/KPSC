
import { GoogleGenAI, Type } from "@google/genai";
import type { QuestionPaper } from '../types';
import { MOCK_QUESTION_PAPERS } from "../constants";

// In the browser (frontend), we must use import.meta.env.VITE_API_KEY.
// process.env is only available in the backend (Vercel Functions).
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

export const searchPreviousPapers = async (query: string): Promise<QuestionPaper[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Act as a web scraper. Search for Kerala PSC previous question papers matching the query "${query}". Scrape the following official URLs: 
            1. https://keralapsc.gov.in/index.php/previous-question-papers
            2. https://keralapsc.gov.in/index.php/answerkey_onlineexams
            3. https://keralapsc.gov.in/index.php/answerkey_omrexams
            4. https://keralapsc.gov.in/question-paper-descriptive-exam
            
            Return a JSON array of the top 5 most relevant results. Each object in the array must have a 'title' (the name of the paper), 'url' (the direct link), and 'date' (the year or full date if available).`,
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
             console.error("Received non-array JSON from Gemini API for papers search, falling back to mock.", parsedJson);
             return MOCK_QUESTION_PAPERS;
        }

    } catch (error) {
        console.error("Error fetching papers from Gemini API:", error);
        return MOCK_QUESTION_PAPERS;
    }
}
