const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const aiController = require('../controllers/ai.controller');

router.post('/ask/:chapterId', auth, aiController.askQuestion);
router.post('/chat/:chapterId', auth, aiController.askQuestion);
router.post('/quiz/:chapterId', auth, aiController.generateQuiz);
router.post('/generate/:chapterId', auth, aiController.generateQuiz);
router.post('/chat', auth, aiController.generalChat);
router.get('/history/:chapterId', auth, aiController.getHistory);
router.post('/summary-video/:chapterId', auth, aiController.generateSummaryVideo);

module.exports = router;
