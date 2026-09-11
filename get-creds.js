const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/focusfriend');
  const User = require('./backend/models/User');
  const Subject = require('./backend/models/Subject');
  const Chapter = require('./backend/models/Chapter');

  const user = await User.findOne();
  if (!user) return console.log('No user');

  const payload = { user: { id: user.id } };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'focus_friend_jwt_secret_key_2026', { expiresIn: 360000 });

  const subject = await Subject.findOne({ user: user._id });
  if (!subject) return console.log('No subject');

  const chapter = await Chapter.findOne({ subject: subject._id });
  if (!chapter) return console.log('No chapter');

  console.log(`Token: ${token}`);
  console.log(`ChapterID: ${chapter._id}`);
  
  process.exit(0);
}
run();
