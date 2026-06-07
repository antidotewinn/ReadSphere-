const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200,
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coverImage: {
    url: { type: String, required: true },
    publicId: String,
  },
  pdfFile: {
    publicId: { type: String, required: true },
    originalName: String,
    size: Number,
  },
  category: {
    type: String,
    enum: ['fiction', 'non-fiction', 'science', 'technology', 'history', 'biography', 'self-help', 'romance', 'thriller', 'fantasy', 'children', 'other'],
    default: 'other',
  },
  tags: [String],
  language: {
    type: String,
    default: 'English',
  },
  pageCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'suspended'],
    default: 'draft',
  },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  salesCount: {
    type: Number,
    default: 0,
  },
  revenue: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  publishedAt: Date,
}, {
  timestamps: true,
});

// Indexes for search and filter
bookSchema.index({ title: 'text', author: 'text', description: 'text', tags: 'text' });
bookSchema.index({ status: 1, category: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ 'ratings.average': -1 });
bookSchema.index({ salesCount: -1 });
bookSchema.index({ publisher: 1 });

module.exports = mongoose.model('Book', bookSchema);
