const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const passport = require('./config/passport');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
app.set('trust proxy', 1);

// Connect Database
connectDB();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use(globalLimiter);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth.routes'));
app.use('/api/books', require('./routes/book.routes'));
app.use('/api/publisher', require('./routes/publisher.routes'));
app.use('/api/reader', require('./routes/reader.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

// Health check
app.get('/api/debug-users', async (req, res) => {
  const User = require('./models/User');
  const users = await User.find();
  res.json({ count: users.length, users: users.map(u => ({ id: u._id, email: u.email, isVerified: u.isVerified, googleId: u.googleId })) });
});
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'eBook Platform API is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));

module.exports = app;
