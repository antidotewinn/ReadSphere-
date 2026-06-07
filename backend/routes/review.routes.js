const express = require('express');
const router = express.Router();
const { getBookReviews, createReview, deleteReview } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/:bookId', getBookReviews);
router.post('/:bookId', protect, createReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
