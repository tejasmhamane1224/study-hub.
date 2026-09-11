require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/subjects', require('./routes/subjects.routes'));
app.use('/api/chapters', require('./routes/chapters.routes'));
app.use('/api/pdf', require('./routes/pdf.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Express Error:', err);
  res.status(500).json({ msg: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} with PID ${process.pid}`));
