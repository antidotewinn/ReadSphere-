const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');

// GET /api/reader/library
const getLibrary = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'purchasedBooks',
        select: '-pdfFile.publicId',
        populate: { path: 'publisher', select: 'name' },
      });

    const progressMap = {};
    user.readingProgress.forEach(p => {
      progressMap[p.book.toString()] = p;
    });

    const library = user.purchasedBooks.map(book => ({
      ...book.toObject(),
      progress: progressMap[book._id.toString()] || { currentPage: 1, bookmarks: [] },
    }));

    res.json({ success: true, data: library });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/reader/progress/:bookId
const updateReadingProgress = async (req, res) => {
  try {
    const { currentPage, bookmarks } = req.body;
    const { bookId } = req.params;

    const user = await User.findById(req.user._id);
    const progressIndex = user.readingProgress.findIndex(p => p.book.toString() === bookId);

    const progressData = {
      book: bookId,
      currentPage: currentPage || 1,
      bookmarks: bookmarks || [],
      lastReadAt: new Date(),
    };

    if (progressIndex > -1) {
      user.readingProgress[progressIndex] = { ...user.readingProgress[progressIndex].toObject(), ...progressData };
    } else {
      user.readingProgress.push(progressData);
    }

    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Progress saved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reader/progress/:bookId
const getReadingProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const progress = user.readingProgress.find(p => p.book.toString() === req.params.bookId);
    res.json({ success: true, data: progress || { currentPage: 1, bookmarks: [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reader/orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id, status: 'paid' })
      .populate('book', 'title coverImage author price')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getLibrary, updateReadingProgress, getReadingProgress, getOrders };
