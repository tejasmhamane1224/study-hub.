const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');

exports.getStats = async (req, res) => {
    try {
        const subjects = await Subject.find({ user: req.user.id });
        const subjectIds = subjects.map(s => s._id);
        
        const chapters = await Chapter.find({ subject: { $in: subjectIds } });
        
        const completedChapters = chapters.filter(c => c.isCompleted).length;
        const totalChapters = chapters.length;
        
        const completionPercentage = totalChapters === 0 ? 0 : Math.round((completedChapters / totalChapters) * 100);

        res.json({
            totalSubjects: subjects.length,
            totalChapters,
            completedChapters,
            completionPercentage
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};
