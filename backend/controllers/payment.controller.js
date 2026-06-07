const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Book = require('../models/Book');
const User = require('../models/User');
const { sendPurchaseConfirmationEmail } = require('../utils/email');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
const createOrder = async (req, res) => {
  try {
    const { bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book || book.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    // Check if already purchased
    if (req.user.purchasedBooks.includes(bookId)) {
      return res.status(400).json({ success: false, message: 'You already own this book.' });
    }

    // Free book handling
    if (book.price === 0) {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { purchasedBooks: bookId } });
      await Book.findByIdAndUpdate(bookId, { $inc: { salesCount: 1 } });
      await Order.create({
        buyer: req.user._id,
        book: bookId,
        publisher: book.publisher,
        amount: 0,
        status: 'paid',
        paymentGateway: 'free',
        paidAt: new Date(),
      });
      return res.json({ success: true, message: 'Free book added to your library.', free: true });
    }

    // Create Razorpay order (amount in paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(book.price * 100),
      currency: 'INR',
      receipt: `book_${bookId}_user_${req.user._id}`,
      notes: { bookId: bookId.toString(), userId: req.user._id.toString() },
    });

    // Save pending order
    await Order.create({
      buyer: req.user._id,
      book: bookId,
      publisher: book.publisher,
      amount: book.price,
      status: 'pending',
      paymentGateway: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
    });

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      book: { title: book.title, coverImage: book.coverImage.url },
    });
  }  catch (err) {
    console.error('Payment Error:', err);
    res.status(500).json({ success: false, message: err.message });
  
  }
};

// POST /api/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Signature verification
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed.' });
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id }).populate('book');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Update order
    order.status = 'paid';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paidAt = new Date();
    await order.save();

    // Grant access to user
    await User.findByIdAndUpdate(order.buyer, {
      $addToSet: { purchasedBooks: order.book._id },
    });

    // Update book stats
    await Book.findByIdAndUpdate(order.book._id, {
      $inc: { salesCount: 1, revenue: order.amount },
    });

    // Update publisher earnings
    await User.findByIdAndUpdate(order.publisher, {
      $inc: { earnings: order.amount * 0.8 }, // 80% to publisher
    });

    // Send confirmation email
    const buyer = await User.findById(order.buyer);
    await sendPurchaseConfirmationEmail(buyer.email, buyer.name, order.book.title, order.amount);

    res.json({ success: true, message: 'Payment verified. Book added to your library.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, verifyPayment };
