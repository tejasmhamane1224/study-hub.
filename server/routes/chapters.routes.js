const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chapter = require('../models/Chapter');
const Subject = require('../models/Subject');
const PDF = require('../models/PDF');

// @route GET api/chapters/subject/:subjectId
router.get('/subject/:subjectId', auth, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.subjectId);
    if (!subject) return res.status(404).json({ msg: 'Subject not found' });
    if (subject.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const chapters = await Chapter.find({ subject: req.params.subjectId }).sort({ createdAt: 1 });
    res.json(chapters);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

// @route GET api/chapters/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ msg: 'Chapter not found' });
    
    // Check auth via subject
    const subject = await Subject.findById(chapter.subject);
    if (subject.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    // Include PDF info if exists
    const pdf = await PDF.findOne({ chapter: chapter._id });

    res.json({ chapter, pdf });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

// @route PUT api/chapters/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ msg: 'Chapter not found' });
    
    const subject = await Subject.findById(chapter.subject);
    if (subject.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    if (req.body.completed !== undefined) {
      chapter.completed = req.body.completed;
    }
    if (req.body.quizScore !== undefined) {
      chapter.quizScore = req.body.quizScore;
    }
    
    await chapter.save();
    res.json(chapter);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

module.exports = router;
