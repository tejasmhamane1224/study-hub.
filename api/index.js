const express = require('express');
const cors = require('cors');
const connectDB = require('../server/config/db');

const app = express();

// Connect Database
connectDB();

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
