const { GoogleGenAI } = require('@google/genai');

const aiService = {
    generateResponse: async (prompt, systemInstruction = null) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        const ai = new GoogleGenAI({ apiKey });
        const config = {
            maxOutputTokens: 2500, // Balanced for comprehensive high-speed answers without timeout
            temperature: 0.7
        };
        if (systemInstruction) {
            config.systemInstruction = systemInstruction;
        }

        // Ordered by response speed and highest live availability
        const modelsToTry = [
            'gemini-3.5-flash-lite', // Fastest active model (~1.5s), lowest latency, high throughput
            'gemini-3.6-flash',      // Deep multimodal reasoning
            'gemini-3.5-flash'       // Reliable fallback
        ];
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

        // Extract clean error message if available
        let cleanMsg = lastError?.message || 'Failed to generate response from Gemini AI';
        try {
            if (cleanMsg.includes('503') || cleanMsg.includes('UNAVAILABLE') || cleanMsg.includes('high demand')) {
                cleanMsg = 'The AI model is momentarily experiencing high server traffic. Please try again in a few moments.';
            }
        } catch (_) {}

        throw new Error(cleanMsg);
    }
};

module.exports = aiService;
