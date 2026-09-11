const Chapter = require('../models/Chapter');
const Subject = require('../models/Subject');
const PDF = require('../models/PDF');
const PdfChunk = require('../models/PdfChunk');
const uploadService = require('../services/upload.service');
const aiService = require('../services/ai.service');
const pdfParsePackage = require('pdf-parse');
const axios = require('axios');

const fs = require('fs');

async function extractPdfTextFromPath(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);

        if (pdfParsePackage.PDFParse) {
            const uint8Array = new Uint8Array(dataBuffer);
            const parser = new pdfParsePackage.PDFParse(uint8Array);
            await parser.load();
            const textResult = await parser.getText();
            return typeof textResult === 'string' ? textResult : (textResult.text || '');
        } else if (typeof pdfParsePackage === 'function') {
            const data = await pdfParsePackage(dataBuffer);
            return data.text || '';
        } else {
            throw new Error('Unsupported pdf-parse library format');
        }
    } catch (err) {
        throw new Error('Failed to extract PDF text: ' + err.message);
    }
}

exports.uploadPdf = async (req, res) => {
    console.log(`[POST] /api/pdf/upload/${req.params.chapterId}`);
    try {
        const chapter = await Chapter.findById(req.params.chapterId);
        if (!chapter) return res.status(404).json({ msg: 'Chapter not found' });
        
        const subject = await Subject.findById(chapter.subject);
        if (subject.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

        const fileUrl = req.file.path; // Cloudinary URL
        const publicId = req.file.filename;

        // Clean up old PDF
        const oldPdfs = await PDF.find({ chapter: chapter._id });
        for (const oldPdf of oldPdfs) {
            await PdfChunk.deleteMany({ pdf: oldPdf._id });
            await uploadService.deleteFile(oldPdf.publicId); // Delete from Cloudinary
            await PDF.findByIdAndDelete(oldPdf._id);
        }

        const newPDF = new PDF({
            title: req.file.originalname,
            filename: req.file.filename,
            filepath: fileUrl,
            publicId: publicId,
            chapter: chapter._id,
            user: req.user.id
        });
        await newPDF.save();

        // Extract text
        const text = await extractPdfTextFromPath(fileUrl);
        const chunkSize = 1500;
        const chunks = [];
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

        res.json(newPDF);
    } catch (err) {
        console.error('PDF Upload Error:', err);
        res.status(500).json({ msg: err.message || 'Server Error' });
    }
};
