const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentGateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'free'],
    default: 'razorpay',
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  paidAt: Date,
}, {
  timestamps: true,
});

orderSchema.index({ buyer: 1, book: 1 }, { unique: true });
orderSchema.index({ publisher: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
