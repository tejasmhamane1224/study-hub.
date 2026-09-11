const fs = require('fs');

let content = `const PDF = require('../models/PDF');
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

        const chunks = await PdfChunk.find({ pdf: pdf._id }).sort('chunkIndex');
        const documentText = chunks.map(c => c.textContent).join('\\n');

        const prompt = \`
You are an expert AI Tutor helping a student.
Context Document:
\${documentText.substring(0, 30000)}

Student Question:
\${question}

Provide a helpful, accurate, and encouraging answer based ONLY on the context document provided. Use markdown formatting.\`;

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
        const documentText = chunks.map(c => c.textContent).join('\\n');

        const prompt = \`
Generate a 3-question multiple choice quiz based on this text:
\${documentText}

Format as markdown with the question as a bold header, followed by a list of options, and indicate the correct answer clearly.\`;

        const quiz = await aiService.generateResponse(prompt);
        res.json({ quiz });
    } catch (err) {
        console.error('Quiz Error:', err);
        res.status(500).json({ msg: err.message || 'Error generating quiz' });
    }
};

exports.generalChat = async (req, res) => {
    try {
        const { question } = req.body;
        
        // Fetch last 10 messages for context
        let chat = await Chat.findOne({ user: req.user.id, chapter: { $exists: false } });
        if (!chat) {
            chat = new Chat({ user: req.user.id, messages: [] });
        }

        const historyContext = chat.messages.slice(-10).map(m => \`\${m.role}: \${m.content}\`).join('\\n');

        const prompt = \`You are STUDY HUB's expert AI Tutor. A student is asking you: \${question}

Recent conversation history:
\${historyContext}

Provide a helpful, accurate, and encouraging answer using markdown formatting.\`;

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
`;

fs.writeFileSync('c:/Users/TEJAS/OneDrive/Desktop/website 2/server/controllers/ai.controller.js', content);
