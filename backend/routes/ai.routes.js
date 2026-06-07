const express = require('express');
const router = express.Router();
const multer = require('multer');
const { generateSummary, chatWithPDF, extractPDFText } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

// Store PDF in memory for processing
const upload = multer({ storage: multer.memoryStorage() });

// Routes
router.post('/summary', protect, upload.single('pdf'), generateSummary);
router.post('/extract', protect, upload.single('pdf'), extractPDFText);
router.post('/chat', protect, chatWithPDF);

module.exports = router;