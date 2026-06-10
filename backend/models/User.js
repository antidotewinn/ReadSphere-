const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['reader', 'publisher', 'admin'],
    default: 'reader',
  },
  isPublisher: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    maxlength: 500,
    default: '',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    code: String,
    expiresAt: Date,
  },
  refreshToken: {
    type: String,
    select: false,
  },
  purchasedBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
  }],
  readingProgress: [{
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    currentPage: { type: Number, default: 1 },
    bookmarks: [Number],
    lastReadAt: { type: Date, default: Date.now },
  }],
  earnings: {
    type: Number,
    default: 0,
  },
  stripeAccountId: String,
  googleId: {
  type: String,
  sparse: true,
},
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
