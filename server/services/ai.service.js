const { GoogleGenAI } = require('@google/genai');

const aiService = {
    generateResponse: async (prompt, systemInstruction = null) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        const ai = new GoogleGenAI({ apiKey });
        const config = {
            maxOutputTokens: 8192, // Maximum output token limit for comprehensive in-depth responses
            temperature: 0.7
        };
        if (systemInstruction) {
            config.systemInstruction = systemInstruction;
        }

        // Verified active production models for current Gemini API
        const modelsToTry = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.5-flash'];
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: prompt,
                    config: config
                });
                if (response && response.text) {
                    return response.text;
                }
            } catch (err) {
                console.warn(`Model ${modelName} failed:`, err.message);
                lastError = err;
            }
        }

        throw lastError || new Error('Failed to generate response from Gemini AI');
    }
};

module.exports = aiService;
