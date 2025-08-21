
import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion, Notification, PscUpdateItem, QuestionPaper } from '../types';
import { MOCK_NOTIFICATIONS, MOCK_PSC_UPDATES, MOCK_QUESTION_PAPERS } from "../constants";

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.warn("VITE_API_KEY environment variable not set. Using mocked data for all API calls.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const MOCKED_QUESTION: QuizQuestion = {
    question: "കേരളത്തിലെ ഏറ്റവും വലിയ നദി ഏതാണ്?",
    options: ["പെരിയാർ", "ഭാരതപ്പുഴ", "പമ്പ", "ചാലിയാർ"],
    correctAnswerIndex: 0,
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
        return parsedJson as QuizQuestion;
    } else {
        console.error("Received malformed JSON from Gemini API for quiz, falling back to mock.", parsedJson);
        return MOCKED_QUESTION;
    }

  } catch (error) {
    console.error("Error fetching question from Gemini API:", error);
    return MOCKED_QUESTION;
  }
};

export const getLatestNotifications = async (): Promise<Notification[]> => {
    if (!ai) {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_NOTIFICATIONS), 1000));
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Act as a web scraper. Go to the URL "https://keralapsc.gov.in/index.php/notifications". Scrape the 5 most recent notifications listed on that page. For each notification, extract the following details: the full notification title, the category number (e.g., "265/2025"), the last date for application (in "DD-MM-YYYY" format), and the direct URL link to the notification details or PDF. Return the result as a JSON array of objects. Each object needs an 'id' (unique string), 'title', 'categoryNumber', 'lastDate', and 'link'.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            categoryNumber: { type: Type.STRING },
                            lastDate: { type: Type.STRING },
                            link: { type: Type.STRING },
                        },
                        required: ["id", "title", "categoryNumber", "lastDate", "link"]
                    }
                }
            }
        });

        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString);

        if (Array.isArray(parsedJson) && parsedJson.length > 0) {
            return parsedJson as Notification[];
        } else {
            console.error("Received empty or malformed JSON from Gemini API for notifications, falling back to mock.", parsedJson);
            return MOCK_NOTIFICATIONS;
        }

    } catch (error) {
        console.error("Error fetching notifications from Gemini API:", error);
        return MOCK_NOTIFICATIONS;
    }
};

export const getPscUpdates = async (): Promise<PscUpdateItem[]> => {
    if (!ai) {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_PSC_UPDATES), 1000));
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Act as a web scraper. Fetch the 10 most recent updates from keralapsc.gov.in. Check the "Ranked Lists", "Latest Updates", and "Notifications" sections. For each item, provide its title, the full direct URL, the section it was found in (e.g., 'Ranked Lists'), and the publication date in 'YYYY-MM-DD' format. Return the result as a JSON array.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            url: { type: Type.STRING },
                            section: { type: Type.STRING },
                            published_date: { type: Type.STRING }
                        },
                        required: ["title", "url", "section", "published_date"]
                    }
                }
            }
        });
        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString);
        if (Array.isArray(parsedJson) && parsedJson.length > 0) {
            return parsedJson as PscUpdateItem[];
        } else {
            console.error("Received empty/malformed JSON from Gemini for PSC updates, falling back to mock.", parsedJson);
            return MOCK_PSC_UPDATES;
        }
    } catch (error) {
        console.error("Error fetching PSC updates from Gemini API:", error);
        return MOCK_PSC_UPDATES;
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


export const getMockTestQuestions = async (topic: string, count: number): Promise<QuizQuestion[]> => {
    if (!ai) {
        // Return a list of mocked questions if API is not available
        return new Promise(resolve => setTimeout(() => resolve(Array(count).fill(MOCKED_QUESTION).map((q, i) => ({...q, question: `${q.question} (${i+1})`}))), 1000));
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a JSON array of ${count} unique multiple-choice questions in Malayalam suitable for a Kerala PSC exam on the topic "${topic}". Each question object must have 'question' (string), 'options' (an array of 4 strings), and 'correctAnswerIndex' (a 0-based integer). Ensure questions are relevant and distinct.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswerIndex: { type: Type.INTEGER }
                        },
                        required: ["question", "options", "correctAnswerIndex"]
                    }
                }
            }
        });

        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString);

        if (Array.isArray(parsedJson) && parsedJson.length > 0) {
            return parsedJson as QuizQuestion[];
        } else {
             console.error("Received malformed JSON from Gemini API for mock test, falling back to mock.", parsedJson);
             return Array(count).fill(MOCKED_QUESTION);
        }

    } catch (error) {
        console.error("Error fetching mock test from Gemini API:", error);
        return Array(count).fill(MOCKED_QUESTION);
    }
};