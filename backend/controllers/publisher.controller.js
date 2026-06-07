const Book = require('../models/Book');
const Order = require('../models/Order');
const { cloudinary } = require('../config/cloudinary');

// POST /api/publisher/books - upload new book
const uploadBook = async (req, res) => {
  try {
    const { title, author, description, price, category, tags, language } = req.body;

    if (!req.files || !req.files.coverImage || !req.files.pdfFile) {
      return res.status(400).json({ success: false, message: 'Cover image and PDF file are required.' });
    }

    const coverFile = req.files.coverImage[0];
    const pdfFile = req.files.pdfFile[0];

    const book = await Book.create({
      title,
      author,
      description,
      price: Number(price),
      category: category || 'other',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      language: language || 'English',
      publisher: req.user._id,
      coverImage: {
        url: coverFile.path,
        publicId: coverFile.filename,
      },
      pdfFile: {
        publicId: pdfFile.filename,
        originalName: pdfFile.originalname,
        size: pdfFile.size,
      },
      status: 'draft',
    });

    res.status(201).json({ success: true, message: 'Book uploaded successfully.', data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/publisher/books/:id/publish
const publishBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, publisher: req.user._id });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });

    book.status = 'published';
    book.publishedAt = new Date();
    await book.save();

    res.json({ success: true, message: 'Book published successfully.', data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/publisher/books - publisher's books
const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ publisher: req.user._id })
      .sort({ createdAt: -1 })
      .select('-pdfFile.publicId');
    res.json({ success: true, data: books });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/publisher/books/:id - update book
const updateBook = async (req, res) => {
  try {
    const allowed = ['title', 'author', 'description', 'price', 'category', 'tags', 'language'];
    const updates = {};
    allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, publisher: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    res.json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/publisher/books/:id
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, publisher: req.user._id });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(book.coverImage.publicId);
    await cloudinary.uploader.destroy(book.pdfFile.publicId, { resource_type: 'raw' });

    await book.deleteOne();
    res.json({ success: true, message: 'Book deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/publisher/dashboard
const getDashboard = async (req, res) => {
  try {
    const books = await Book.find({ publisher: req.user._id });
    const bookIds = books.map(b => b._id);

    const orders = await Order.find({ publisher: req.user._id, status: 'paid' });

    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
    const totalSales = orders.length;
    const totalBooks = books.length;
    const publishedBooks = books.filter(b => b.status === 'published').length;

    // Monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      { $match: { publisher: req.user._id, status: 'paid', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top books by revenue
    const topBooks = await Order.aggregate([
      { $match: { publisher: req.user._id, status: 'paid' } },
      { $group: { _id: '$book', revenue: { $sum: '$amount' }, sales: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' },
      { $project: { 'book.title': 1, 'book.coverImage': 1, revenue: 1, sales: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: { totalRevenue, totalSales, totalBooks, publishedBooks },
        monthlyRevenue,
        topBooks,
        recentOrders: await Order.find({ publisher: req.user._id, status: 'paid' })
          .populate('buyer', 'name email')
          .populate('book', 'title coverImage')
          .sort({ createdAt: -1 })
          .limit(10),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { uploadBook, publishBook, getMyBooks, updateBook, deleteBook, getDashboard };
