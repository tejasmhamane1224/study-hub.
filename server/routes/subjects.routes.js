const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');

// @route GET api/subjects
router.get('/', auth, async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(subjects);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

// @route POST api/subjects
router.post('/', auth, async (req, res) => {
  const { name, chapterCount } = req.body;
  try {
    const newSubject = new Subject({
      name,
      user: req.user.id
    });
    const subject = await newSubject.save();

    // Auto-generate chapters
    const count = parseInt(chapterCount) || 0;
    for (let i = 1; i <= count; i++) {
      const newChapter = new Chapter({
        title: `Chapter ${i}`,
        subject: subject._id
      });
      await newChapter.save();
    }

    res.json(subject);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

// @route DELETE api/subjects/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ msg: 'Subject not found' });
    if (subject.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
    
    await Chapter.deleteMany({ subject: req.params.id });
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Subject removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

module.exports = router;
