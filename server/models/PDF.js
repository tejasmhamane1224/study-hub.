const mongoose = require('mongoose');

const PDFSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String, required: true },
  filepath: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
  },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PDF', PDFSchema);
