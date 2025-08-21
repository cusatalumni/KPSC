import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion, QuestionPaper } from '../types';
import { MOCK_QUESTION_PAPERS } from "../constants";

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.warn("VITE_API_KEY environment variable not set. Using mocked data for some API calls.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const MOCKED_QUESTION: QuizQuestion = {
    question: "കേരളത്തിലെ ഏറ്റവും വലിയ നദി ഏതാണ്?",
    options: ["പെരിയാർ", "ഭാരതപ്പുഴ", "പമ്പ", "ചാലിയാർ"],
    correctAnswerIndex: 0,
    topic: "പൊതുവിജ്ഞാനം"
};


export const getDailyQuestion = async (): Promise<QuizQuestion> => {
  if (!ai) {
    return new Promise(resolve => setTimeout(() => resolve(MOCKED_QUESTION), 1000));
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a single multiple-choice question in Malayalam suitable for a Kerala PSC general knowledge paper. The topic can be Kerala history, Indian politics, general science, or geography. Provide 4 options and indicate the correct answer index (0-based).",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: "The question text in Malayalam."
            },
            options: {
              type: Type.ARRAY,
              description: "An array of 4 possible answers in Malayalam.",
              items: {
                type: Type.STRING
              }
            },
            correctAnswerIndex: {
              type: Type.INTEGER,
              description: "The 0-based index of the correct answer in the options array."
            }
          },
          required: ["question", "options", "correctAnswerIndex"]
        }
      }
    });

    const jsonString = response.text.trim();
    const parsedJson = JSON.parse(jsonString);

    if (parsedJson.options && parsedJson.options.length === 4 && typeof parsedJson.correctAnswerIndex === 'number') {
        return { ...parsedJson, topic: "Daily Question" } as QuizQuestion;
    } else {
        console.error("Received malformed JSON from Gemini API for quiz, falling back to mock.", parsedJson);
        return MOCKED_QUESTION;
    }

  } catch (error) {
    console.error("Error fetching question from Gemini API:", error);
    return MOCKED_QUESTION;
  }
};


export const searchPreviousPapers = async (query: string): Promise<QuestionPaper[]> => {
    if (!ai) {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_QUESTION_PAPERS), 1000));
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
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
        
        const jsonString = response.text.trim();
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
