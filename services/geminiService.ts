
import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion, Notification, PscUpdateItem } from '../types';
import { MOCK_NOTIFICATIONS, MOCK_PSC_UPDATES } from "../constants";

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
            contents: `Generate a JSON array of 5 recent, realistic-looking notifications from the official Kerala PSC website (keralapsc.gov.in). Use today's date and recent past dates. Each object in the array should have an 'id' (a unique string), 'title' in Malayalam, 'date' (in DD-MM-YYYY format), 'category' (one of 'പുതിയ വിജ്ഞാപനം', 'ഷോർട്ട് ലിസ്റ്റ്', 'റാങ്ക് ലിസ്റ്റ്', 'പരീക്ഷാ കലണ്ടർ'), and 'link' (use '#'). The titles and dates should be varied and plausible for a government exam portal.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            date: { type: Type.STRING },
                            category: { type: Type.STRING },
                            link: { type: Type.STRING },
                        },
                        required: ["id", "title", "date", "category", "link"]
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
