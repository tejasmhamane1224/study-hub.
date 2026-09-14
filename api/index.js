const express = require('express');
const cors = require('cors');
const connectDB = require('../server/config/db');

const app = express();

// Database connection middleware for Serverless functions
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection failed on request:', err.message);
    res.status(500).json({ 
      msg: 'Database connection failed. Please ensure MONGODB_URI is configured correctly in Vercel with Network Access 0.0.0.0/0.',
      error: err.message 
    });
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define Routes
app.use('/api/auth', require('../server/routes/auth.routes'));
app.use('/api/subjects', require('../server/routes/subjects.routes'));
app.use('/api/chapters', require('../server/routes/chapters.routes'));
app.use('/api/pdf', require('../server/routes/pdf.routes'));
app.use('/api/ai', require('../server/routes/ai.routes'));
app.use('/api/dashboard', require('../server/routes/dashboard.routes'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Express Error:', err);
  res.status(500).json({ msg: err.message || 'Server Error' });
});

module.exports = app;
