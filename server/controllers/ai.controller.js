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
            // Increased from 8 chunks to 60 chunks (~90,000 characters) for comprehensive document understanding
            const chunks = await PdfChunk.find({ pdf: pdf._id }).sort('chunkIndex').limit(60);
            documentText = chunks.map(c => c.textContent).join('\n\n');
        }

        // Fetch recent conversation history so the student can ask follow-up questions
        let chat = await Chat.findOne({ user: req.user.id, chapter: req.params.chapterId });
        if (!chat) {
            chat = new Chat({ user: req.user.id, chapter: req.params.chapterId, messages: [] });
        }
        const recentHistory = chat.messages.slice(-15).map(m => `${m.role === 'user' ? 'Student' : 'AI Tutor'}: ${m.content}`).join('\n\n');

        const prompt = `You are STUDY HUB's expert academic AI Tutor.
Your mission is to help the student achieve deep conceptual mastery, ace their exams, and understand complex ideas clearly.

${documentText ? `=== CHAPTER STUDY MATERIAL ===\n${documentText}\n==============================\n` : ''}

${recentHistory ? `=== CONVERSATION HISTORY ===\n${recentHistory}\n============================\n` : ''}

Student Question:
${question}

Instructions:
1. Base your answer primarily on the chapter study material if available, supplementing with authoritative academic knowledge.
2. Provide a thorough, well-structured, and clear explanation. Do not artificially truncate your explanation unless the student explicitly asks for a short summary.
3. Use clean Markdown formatting with subheadings, bullet points, and code blocks where applicable.
4. Format all mathematical equations using LaTeX syntax ($...$ for inline formulas and $$...$$ for display equations) so they render with KaTeX.`;

        const answer = await aiService.generateResponse(prompt);

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
            // Increased from 15 chunks to 60 chunks to test concepts across the entire chapter
            const chunks = await PdfChunk.find({ pdf: pdf._id }).sort('chunkIndex').limit(60);
            documentText = chunks.map(c => c.textContent).join('\n\n');
        }

        const prompt = `Generate a 5-question multiple choice practice quiz based on this study text to test active recall and deep comprehension.
${documentText ? `=== Context Text ===\n${documentText}\n====================\n` : 'Context: General Chapter Study Material\n'}

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
                    question: "Which learning strategy yields the highest retention according to cognitive science?",
                    options: ["Passive rereading", "Active recall & self-quizzing", "Highlighting text in color", "Cramming the night before"],
                    correctIndex: 1
                },
                {
                    question: "What is the standard focus duration in the Pomodoro Technique?",
                    options: ["10 minutes", "25 minutes", "60 minutes", "90 minutes"],
                    correctIndex: 1
                },
                {
                    question: "How does spaced repetition prevent memory degradation?",
                    options: ["It resets the forgetting curve at optimal intervals", "It removes the need to sleep", "It eliminates all cognitive load", "It bypasses short-term memory entirely"],
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
        
        // Increased context window from 5 to 25 messages for continuous conversational memory
        let chat = await Chat.findOne({ user: req.user.id, chapter: { $exists: false } });
        if (!chat) {
            chat = new Chat({ user: req.user.id, messages: [] });
        }

        const historyContext = chat.messages.slice(-25).map(m => `${m.role === 'user' ? 'Student' : 'AI Tutor'}: ${m.content}`).join('\n\n');

        const prompt = `You are STUDY HUB's expert academic AI Tutor.
Provide thorough, in-depth, and well-explained guidance. When complex topics, proofs, formulas, or code implementations are requested, provide complete step-by-step breakdowns with intuitive examples.

${historyContext ? `=== Conversation History ===\n${historyContext}\n============================\n` : ''}

Student Question:
${question}

Format guidelines:
- Use clean Markdown with headers and bullet points.
- Format all mathematical equations using LaTeX ($...$ for inline, $$...$$ for display blocks).
- Provide complete code blocks with syntax highlighting where relevant.`;

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

exports.generateSummaryVideo = async (req, res) => {
    try {
        let pdf = await PDF.findOne({ chapter: req.params.chapterId, user: req.user.id });
        if (!pdf) {
            pdf = await PDF.findOne({ chapter: req.params.chapterId });
        }

        let documentText = '';
        if (pdf) {
            const chunks = await PdfChunk.find({ pdf: pdf._id }).sort('chunkIndex').limit(60);
            documentText = chunks.map(c => c.textContent).join('\n\n');
        }

        const prompt = `Analyze the following academic text and generate a structured 3D video storyboard for a cinematic, space-themed summary presentation.
${documentText ? "=== Context Text ===\n" + documentText + "\n====================\n" : "Context: General Chapter Study Material\n"}

You MUST return the output EXACTLY as a valid JSON object with the following schema, and NO extra conversational text, markdown, or backticks. 
CRITICAL RULES FOR VIDEO PACING:
1. Break the summary down into MANY short, fast-paced scenes (generate between 8 to 15 scenes). 
2. Each scene must have a very short `voiceScript` (1 to 2 sentences MAXIMUM) so the slides change frequently to match the flow of the narration.
3. Accurately estimate the `duration` in seconds based on the voiceScript length (assume 2.5 words per second).
Schema:
{
  "scenes": [
    {
      "duration": 5, // duration in seconds, integer
      "voiceScript": "Narration text for this scene...",
      "keyPoint": "Short text floating in 3D (3-6 words max)",
      "visualMode": "galaxy" // one of: galaxy, particles, wireframe, nebula
    }
  ]
}`;

        const videoJsonText = await aiService.generateResponse(prompt);
        let videoData = null;
        try {
            let cleaned = videoJsonText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleaned = jsonMatch[0];
            }
            videoData = JSON.parse(cleaned);
        } catch (e) {
            console.error("Failed to parse video JSON:", videoJsonText);
            videoData = {
                scenes: [
                    {
                        duration: 8,
                        voiceScript: "Welcome to the summary of this chapter. Let's explore the key concepts together in this cosmic journey.",
                        keyPoint: "Chapter Overview",
                        visualMode: "galaxy"
                    }
                ]
            };
        }

        // Cache it in the Chapter model
        const Chapter = require('../models/Chapter');
        await Chapter.findByIdAndUpdate(req.params.chapterId, { summaryVideo: videoData });

        res.json({ summaryVideo: videoData });
    } catch (err) {
        console.error('Summary Video Error:', err);
        res.status(500).json({ msg: err.message || 'Error generating summary video' });
    }
};
