const Book = require('../models/Book');
const Order = require('../models/Order');
const { generateSignedUrl } = require('../config/cloudinary');

// GET /api/books - public discovery
const getBooks = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort = 'newest', page = 1, limit = 12 } = req.query;

    const query = { status: 'published' };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      popular: { salesCount: -1 },
      rating: { 'ratings.average': -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Book.countDocuments(query);

    const books = await Book.find(query)
      .populate('publisher', 'name avatar')
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(Number(limit))
      .select('-pdfFile');

    res.json({
      success: true,
      data: books,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/books/:id - single book details
const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('publisher', 'name avatar bio')
      .select('-pdfFile.publicId');

    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });

    // Check if requesting user has purchased it
    let hasPurchased = false;
    if (req.user) {
      hasPurchased = req.user.purchasedBooks.includes(book._id.toString());
    }

    res.json({ success: true, data: { ...book.toObject(), hasPurchased } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/books/:id/read - serve signed PDF URL (protected)
const getBookReadUrl = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    const signedUrl = generateSignedUrl(book.pdfFile.publicId, 3600);
    res.json({ success: true, url: signedUrl, expiresIn: 3600 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/books/featured
const getFeaturedBooks = async (req, res) => {
  try {
    const books = await Book.find({ status: 'published', isFeatured: true })
      .populate('publisher', 'name')
      .select('-pdfFile')
      .limit(6);
    res.json({ success: true, data: books });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBooks, getBook, getBookReadUrl, getFeaturedBooks };
