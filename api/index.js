// Polyfill DOMMatrix for PDF parsing in Node/Serverless environment
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {
    constructor() {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
    }
  };
}

let app;

module.exports = async (req, res) => {
  try {
    if (!app) {
      const express = require('express');
      const cors = require('cors');
      const connectDB = require('../server/config/db');

      app = express();

      app.use(cors());
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));

      app.use(async (request, response, next) => {
        try {
          await connectDB();
          next();
        } catch (err) {
          console.error('Database connection failed:', err.message);
          response.status(500).json({ msg: 'Database Error: ' + err.message });
        }
      });

      app.use('/api/auth', require('../server/routes/auth.routes'));
      app.use('/api/subjects', require('../server/routes/subjects.routes'));
      app.use('/api/chapters', require('../server/routes/chapters.routes'));
      app.use('/api/pdf', require('../server/routes/pdf.routes'));
      app.use('/api/ai', require('../server/routes/ai.routes'));
      app.use('/api/dashboard', require('../server/routes/dashboard.routes'));

      app.use((err, request, response, next) => {
        console.error('Unhandled Express Error:', err);
        response.status(500).json({ msg: err.message || 'Server Error' });
      });
    }

    return app(req, res);
  } catch (err) {
    console.error('Fatal Serverless Initialization Error:', err);
    res.status(500).json({ 
      msg: 'Fatal Serverless Error', 
      error: err.message,
      stack: err.stack
    });
  }
};
