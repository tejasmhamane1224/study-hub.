const Chapter = require('../models/Chapter');
const Subject = require('../models/Subject');
const PDF = require('../models/PDF');
const PdfChunk = require('../models/PdfChunk');
const uploadService = require('../services/upload.service');
const aiService = require('../services/ai.service');
const axios = require('axios');
const fs = require('fs');

async function extractPdfTextFromBuffer(buffer) {
    try {
        if (typeof global.DOMMatrix === 'undefined') {
            global.DOMMatrix = class DOMMatrix {
                constructor() { this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0; }
            };
        }
        const pdfParsePackage = require('pdf-parse');
        const uint8Array = new Uint8Array(buffer);

        if (pdfParsePackage.PDFParse) {
            const parser = new pdfParsePackage.PDFParse(uint8Array);
            await parser.load();
            const textResult = await parser.getText();
            if (typeof textResult === 'string') return textResult;
            if (textResult && typeof textResult.text === 'string') return textResult.text;
            return '';
        } else if (typeof pdfParsePackage === 'function') {
            const data = await pdfParsePackage(buffer);
            return data.text || '';
        } else {
            throw new Error('Unsupported pdf-parse library format');
        }
    } catch (err) {
        console.error('PDF Text Extraction Error:', err);
        throw new Error('Failed to extract text from PDF: ' + err.message);
    }
}

exports.uploadPdf = async (req, res) => {
    console.log(`[POST] /api/pdf/upload/${req.params.chapterId}`);
    try {
        const chapter = await Chapter.findById(req.params.chapterId);
        if (!chapter) return res.status(404).json({ msg: 'Chapter not found' });
        
        const subject = await Subject.findById(chapter.subject);
        if (!subject || subject.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ msg: 'No file uploaded or file buffer is empty' });
        }

        const fileName = req.file.originalname || 'document.pdf';
        const publicId = Date.now().toString() + '-' + Math.round(Math.random() * 1E6);

        // Clean up any previously uploaded PDFs for this chapter
        const oldPdfs = await PDF.find({ chapter: chapter._id });
        for (const oldPdf of oldPdfs) {
            await PdfChunk.deleteMany({ pdf: oldPdf._id });
            await PDF.findByIdAndDelete(oldPdf._id);
        }

        const newPDF = new PDF({
            title: fileName,
            filename: fileName,
            filepath: 'memory://' + fileName,
            publicId: publicId,
            chapter: chapter._id,
            user: req.user.id
        });
        await newPDF.save();

        // Extract text directly from in-memory buffer
        const text = await extractPdfTextFromBuffer(req.file.buffer);
        const chunkSize = 1500;
        const chunks = [];
        
        if (text && text.trim().length > 0) {
            for (let i = 0; i < text.length; i += chunkSize) {
                chunks.push({
                    pdf: newPDF._id,
                    chunkIndex: Math.floor(i / chunkSize),
                    textContent: text.substring(i, i + chunkSize)
                });
            }
            if (chunks.length > 0) {
                await PdfChunk.insertMany(chunks);
            }
        } else {
            // If the PDF had no text (e.g. image-only), add a friendly fallback chunk so AI Tutor still functions
            chunks.push({
                pdf: newPDF._id,
                chunkIndex: 0,
                textContent: `[Uploaded document: ${fileName} - Note: This document appears to contain scanned pages or minimal selectable text. The AI Tutor will provide general guidance based on the chapter title: ${chapter.name || 'Chapter'}].`
            });
            await PdfChunk.insertMany(chunks);
        }

        res.json({
            ...newPDF.toObject(),
            chunksCreated: chunks.length,
            msg: 'PDF uploaded and parsed successfully!'
        });
    } catch (err) {
        console.error('PDF Upload Error:', err);
        res.status(500).json({ msg: err.message || 'Server Error' });
    }
};
