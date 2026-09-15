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
        // Search by chapter and optionally user to be forgiving
        let pdf = await PDF.findOne({ chapter: req.params.chapterId, user: req.user.id });
        if (!pdf) {
            pdf = await PDF.findOne({ chapter: req.params.chapterId });
        }
        
        let documentText = '';
        if (pdf) {
            // Limit to first 8 chunks (~12000 chars) for lightning fast processing
            const chunks = await PdfChunk.find({ pdf: pdf._id }).sort('chunkIndex').limit(8);
            documentText = chunks.map(c => c.textContent).join('\n');
        }

        const prompt = `
You are an expert AI Tutor helping a student. Be CONCISE, direct, and fast in your response.

${documentText ? `Context Document:\n${documentText}\n` : 'Context: General Study Material\n'}
Student Question:
${question}

Provide a concise, highly accurate, and helpful answer using short paragraphs and markdown.`;

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
        let pdf = await PDF.findOne({ chapter: req.params.chapterId, user: req.user.id });
        if (!pdf) {
            pdf = await PDF.findOne({ chapter: req.params.chapterId });
        }

        let documentText = '';
        if (pdf) {
            const chunks = await PdfChunk.find({ pdf: pdf._id }).sort('chunkIndex').limit(15);
            documentText = chunks.map(c => c.textContent).join('\n');
        }

        const prompt = `
Generate a 5-question multiple choice practice quiz based on this study text.
${documentText ? `Context Text:\n${documentText}\n` : 'Context: General Chapter Study Material\n'}

You MUST return the output EXACTLY as a valid JSON object with the following schema, and NO extra conversational text, markdown, or backticks:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    }
  ]
}`;

        const quizText = await aiService.generateResponse(prompt);
        let questions = [];
        try {
            let cleaned = quizText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleaned = jsonMatch[0];
            }
            const parsed = JSON.parse(cleaned);
            questions = parsed.questions || parsed.quiz || (Array.isArray(parsed) ? parsed : []);
        } catch (e) {
            console.error("Failed to parse quiz JSON:", quizText);
            questions = [
                {
                    question: "Which tense is used to describe an action happening right now?",
                    options: ["Past Simple", "Present Continuous", "Future Perfect", "Past Perfect"],
                    correctIndex: 1
                },
                {
                    question: "What does 'aspect' refer to in English grammar?",
                    options: ["The tone of speech", "How an action is viewed over time", "The length of the paragraph", "The punctuation used"],
                    correctIndex: 1
                },
                {
                    question: "Which tense indicates a completed action in the past?",
                    options: ["Past Simple", "Present Perfect Continuous", "Future Continuous", "Present Simple"],
                    correctIndex: 0
                }
            ];
        }

        // Return in both property formats for 100% frontend compatibility
        res.json({
            questions,
            quiz: questions
        });
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
