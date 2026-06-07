const express = require('express');
const router = express.Router();
const { getLibrary, updateReadingProgress, getReadingProgress, getOrders } = require('../controllers/reader.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/library', getLibrary);
router.get('/orders', getOrders);
router.get('/progress/:bookId', getReadingProgress);
router.put('/progress/:bookId', updateReadingProgress);

module.exports = router;
