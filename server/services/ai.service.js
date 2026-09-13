const { GoogleGenAI } = require('@google/genai');

const aiService = {
    generateResponse: async (prompt, systemInstruction = null) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        const ai = new GoogleGenAI({ apiKey });
        const config = {};
        if (systemInstruction) {
            config.systemInstruction = systemInstruction;
        }

        const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: prompt,
                    config: config
                });
                return response.text;
            } catch (err) {
                console.warn(`Model ${modelName} failed:`, err.message);
                lastError = err;
            }
        }

        throw lastError || new Error('Failed to generate response from Gemini AI');
    }
};

module.exports = aiService;
