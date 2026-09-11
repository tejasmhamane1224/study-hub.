const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const aiController = require('../controllers/ai.controller');

router.post('/ask/:chapterId', auth, aiController.askQuestion);
router.post('/quiz/:chapterId', auth, aiController.generateQuiz);
router.post('/chat', auth, aiController.generalChat);
router.get('/history/:chapterId', auth, aiController.getHistory);

module.exports = router;
