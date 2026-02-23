
import type { QuestionPaper } from '../types';
import { MOCK_QUESTION_PAPERS } from "../constants";
import { Type } from "@google/genai";

/**
 * Searches for previous papers by calling our secure internal backend.
 * Uses real-time Google Search with strict rules against URL pattern guessing.
 */
export const searchPreviousPapers = async (query: string): Promise<{ papers: QuestionPaper[], sources: any[] }> => {
    try {
        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: `You are a Kerala PSC Document Retrieval Specialist. Search for the official PDF download links for: "${query}".
                
                CRITICAL INSTRUCTIONS:
                1. STRICT SOURCE: Only provide links from keralapsc.gov.in.
                2. NO HALLUCINATION: DO NOT guess or construct URL patterns like '/sites/default/files/question_paper/'. 
                3. REAL PATHS: Kerala PSC uses date-based paths (e.g., /2018-08/175-2016.pdf). Only return the EXACT URL found in the search grounding results.
                4. FALLBACK: If the direct .pdf URL is not visible in search snippets, return the URL of the official PSC results/download page where the link is hosted.
                
                Return a JSON array of objects:
                - 'title': Clear name (e.g. TRADESMAN - AUTOMOBILE MECHANIC).
                - 'url': The ACTUAL official PDF link or Hosting Page URL.
                - 'year': Exam Year.
                - 'category': "OMR Question", "Descriptive", "Answer Key".
                - 'isDirectPdf': boolean (true if the link ends in .pdf).`,
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
                            category: { type: Type.STRING },
                            isDirectPdf: { type: Type.BOOLEAN }
                        },
                        required: ["title", "url", "year", "category", "isDirectPdf"]
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
