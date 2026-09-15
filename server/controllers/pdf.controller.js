const Chapter = require('../models/Chapter');
const Subject = require('../models/Subject');
const PDF = require('../models/PDF');
const PdfChunk = require('../models/PdfChunk');
const uploadService = require('../services/upload.service');
const aiService = require('../services/ai.service');
const axios = require('axios');
const fs = require('fs');

async function extractPdfTextFromBuffer(buffer) {
    // 1. Primary extractor: pdf-parse 1.1.1 (standard stable Node.js library)
    try {
        const pdf = require('pdf-parse');
        if (typeof pdf === 'function') {
            const data = await pdf(buffer);
            if (data && data.text && data.text.trim().length > 0) {
                return data.text.trim();
            }
        }
    } catch (parseErr) {
        console.warn('Standard pdf-parse warning:', parseErr.message);
    }

    // 2. Fallback stream parser: extract text streams from PDF buffer directly
    try {
        const raw = buffer.toString('latin1');
        const textParts = [];
        // Match literal text inside parentheses in PDF content streams (e.g. (Hello World) Tj)
        const matches = raw.match(/\(([^()]{2,})\)/g);
        if (matches && matches.length > 0) {
            for (const m of matches) {
                const cleaned = m.slice(1, -1).replace(/\\[nrtbf\\()]/g, ' ').trim();
                if (cleaned.length > 1 && /[a-zA-Z0-9]/.test(cleaned)) {
                    textParts.push(cleaned);
                }
            }
            if (textParts.length > 0) {
                return textParts.join(' ');
            }
        }
    } catch (fallbackErr) {
        console.warn('Fallback stream parser warning:', fallbackErr.message);
    }

    return '';
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
