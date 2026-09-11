const mongoose = require('mongoose');

const PdfChunkSchema = new mongoose.Schema({
  pdf: { type: mongoose.Schema.Types.ObjectId, ref: 'PDF', required: true },
  chunkIndex: { type: Number, required: true },
  textContent: { type: String, required: true }
});

module.exports = mongoose.model('PdfChunk', PdfChunkSchema);
