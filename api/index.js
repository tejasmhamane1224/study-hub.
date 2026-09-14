const express = require('express');
const cors = require('cors');
const connectDB = require('../server/config/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    res.status(500).json({ msg: 'Database Error: ' + err.message });
  }
});

app.use('/api/auth', require('../server/routes/auth.routes'));
app.use('/api/subjects', require('../server/routes/subjects.routes'));
app.use('/api/chapters', require('../server/routes/chapters.routes'));
app.use('/api/pdf', require('../server/routes/pdf.routes'));
app.use('/api/ai', require('../server/routes/ai.routes'));
app.use('/api/dashboard', require('../server/routes/dashboard.routes'));

app.use((err, req, res, next) => {
  console.error('Unhandled Express Error:', err);
  res.status(500).json({ msg: err.message || 'Server Error' });
});

// Instead of just exporting app, export a standard Vercel handler
module.exports = async (req, res) => {
  try {
    return await app(req, res);
  } catch (err) {
    console.error('Fatal Serverless Error:', err);
    res.status(500).json({ msg: 'Fatal Serverless Error', error: err.message });
  }
};
