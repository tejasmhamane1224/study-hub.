const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pdfController = require('../controllers/pdf.controller');
const { upload } = require('../services/upload.service');

router.post('/upload/:chapterId', auth, upload.single('pdf'), pdfController.uploadPdf);

module.exports = router;
