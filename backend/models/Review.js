const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
}, {
  timestamps: true,
});

reviewSchema.index({ book: 1, reviewer: 1 }, { unique: true });

// Update book rating after save/remove
reviewSchema.statics.calcAverageRating = async function (bookId) {
  const stats = await this.aggregate([
    { $match: { book: bookId } },
    { $group: { _id: '$book', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const Book = require('./Book');
  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      'ratings.average': Math.round(stats[0].avgRating * 10) / 10,
      'ratings.count': stats[0].count,
    });
  } else {
    await Book.findByIdAndUpdate(bookId, { 'ratings.average': 0, 'ratings.count': 0 });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.book);
});

reviewSchema.post('remove', function () {
  this.constructor.calcAverageRating(this.book);
});

module.exports = mongoose.model('Review', reviewSchema);
