const Review = require('../models/Review');
const Order = require('../models/Order');

// GET /api/reviews/:bookId
const getBookReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/reviews/:bookId
const createReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    // Must have purchased the book
    const hasPurchased = req.user.purchasedBooks.includes(req.params.bookId);
    if (!hasPurchased) {
      return res.status(403).json({ success: false, message: 'You must purchase this book before reviewing.' });
    }

    const existing = await Review.findOne({ book: req.params.bookId, reviewer: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this book.' });
    }

    const review = await Review.create({
      book: req.params.bookId,
      reviewer: req.user._id,
      rating,
      title,
      comment,
    });

    await review.populate('reviewer', 'name avatar');
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/reviews/:reviewId
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.reviewId, reviewer: req.user._id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    await review.remove();
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBookReviews, createReview, deleteReview };
