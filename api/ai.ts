
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'AI API Key is not configured on the server.' });
    }

    const { prompt, model = 'gemini-3-flash-preview', responseSchema } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const config: any = {
            responseMimeType: responseSchema ? "application/json" : "text/plain",
        };

        if (responseSchema) {
            config.responseSchema = responseSchema;
        }

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config
        });

        const text = response.text || "";
        
        if (responseSchema) {
            try {
                return res.status(200).json(JSON.parse(text));
            } catch (e) {
                return res.status(500).json({ error: 'Failed to parse AI response as JSON', raw: text });
            }
        }

        return res.status(200).json({ text });

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return res.status(500).json({ error: error.message || 'An error occurred during AI generation' });
    }
}
