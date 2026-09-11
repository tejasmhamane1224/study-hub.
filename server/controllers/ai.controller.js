const PDF = require('../models/PDF');
const PdfChunk = require('../models/PdfChunk');
const Chat = require('../models/Chat');
const aiService = require('../services/ai.service');

exports.getHistory = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const query = { user: req.user.id };
        if (chapterId === 'general') {
            query.chapter = { $exists: false };
        } else {
            query.chapter = chapterId;
        }

        const chat = await Chat.findOne(query);
        res.json(chat ? chat.messages : []);
    } catch (err) {
        console.error('History Error:', err);
        res.status(500).json({ msg: err.message || 'Error fetching history' });
    }
};

exports.askQuestion = async (req, res) => {
    try {
        const { question } = req.body;
        const pdf = await PDF.findOne({ chapter: req.params.chapterId, user: req.user.id });
        
        if (!pdf) return res.status(404).json({ msg: 'No PDF found for this chapter' });

        // Limit to first 8 chunks (~12000 chars) for lightning fast processing
        const chunks = await PdfChunk.find({ pdf: pdf._id }).sort('chunkIndex').limit(8);
        const documentText = chunks.map(c => c.textContent).join('\n');

        const prompt = `
You are an expert AI Tutor helping a student. Be CONCISE, direct, and fast in your response.

Context Document:
${documentText}

Student Question:
${question}

Provide a concise, highly accurate, and helpful answer based ONLY on the context document provided. Use short paragraphs and markdown.`;

        const answer = await aiService.generateResponse(prompt);

        // Save history
        let chat = await Chat.findOne({ user: req.user.id, chapter: req.params.chapterId });
        if (!chat) {
            chat = new Chat({ user: req.user.id, chapter: req.params.chapterId, messages: [] });
        }
        chat.messages.push({ role: 'user', content: question });
        chat.messages.push({ role: 'ai', content: answer });
        chat.updatedAt = Date.now();
        await chat.save();

        res.json({ answer });
    } catch (err) {
        console.error('AI Error:', err);
        res.status(500).json({ msg: err.message || 'Error generating AI response' });
    }
};

exports.generateQuiz = async (req, res) => {
    try {
        const pdf = await PDF.findOne({ chapter: req.params.chapterId, user: req.user.id });
        if (!pdf) return res.status(404).json({ msg: 'No PDF found' });

        const chunks = await PdfChunk.find({ pdf: pdf._id }).sort('chunkIndex').limit(15);
        const documentText = chunks.map(c => c.textContent).join('\n');

        const prompt = `
Generate a 5-question multiple choice quiz based on this text.

Context Text:
${documentText}

You MUST return the output EXACTLY as a valid JSON object with the following schema, and NO extra text or markdown formatting.
{
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0 
    }
  ]
}`;

        const quizText = await aiService.generateResponse(prompt);
        let quizData;
        try {
            // Strip any markdown code blocks if the AI ignored the instruction
            const cleaned = quizText.replace(/```json/g, '').replace(/```/g, '').trim();
            quizData = JSON.parse(cleaned);
        } catch (e) {
            console.error("Failed to parse quiz JSON:", quizText);
            throw new Error("AI did not return valid JSON for the quiz");
        }
        
        res.json(quizData);
    } catch (err) {
        console.error('Quiz Error:', err);
        res.status(500).json({ msg: err.message || 'Error generating quiz' });
    }
};

exports.generalChat = async (req, res) => {
    try {
        const { question } = req.body;
        
        // Fetch last 5 messages for context to keep prompt small and fast
        let chat = await Chat.findOne({ user: req.user.id, chapter: { $exists: false } });
        if (!chat) {
            chat = new Chat({ user: req.user.id, messages: [] });
        }

        const historyContext = chat.messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');

        const prompt = `You are STUDY HUB's expert AI Tutor. Be CONCISE and fast.
A student is asking you: ${question}

Recent conversation history:
${historyContext}

Provide a concise, helpful, and highly accurate answer using markdown formatting.`;

        const answer = await aiService.generateResponse(prompt);

        chat.messages.push({ role: 'user', content: question });
        chat.messages.push({ role: 'ai', content: answer });
        chat.updatedAt = Date.now();
        await chat.save();

        res.json({ answer });
    } catch (err) {
        console.error('General AI Error:', err);
        res.status(500).json({ msg: err.message || 'Error generating AI response' });
    }
};
