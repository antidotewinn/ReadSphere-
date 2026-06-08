const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const { sendOtpEmail } = require('../utils/email');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const otp = generateOTP();
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role === 'publisher' ? 'publisher' : 'reader',
      otp: { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      isVerified: true,
    });

    try { await sendOtpEmail(user.email, otp, user.name); } catch (e) { console.log('Email failed:', e.message); }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for the OTP.',
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId).select('+otp');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified.' });
    }

    if (!user.otp || user.otp.code !== otp || new Date() > user.otp.expiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Email verified successfully.',
      accessToken,
      refreshToken,
      user: user.toJSON(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      const otp = generateOTP();
      user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
      await user.save({ validateBeforeSave: false });
      await sendOtpEmail(user.email, otp, user.name);
      return res.status(403).json({
        success: false,
        message: 'Email not verified. A new OTP has been sent.',
        userId: user._id,
        requiresVerification: true,
      });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Login successful.',
      accessToken,
      refreshToken,
      user: user.toJSON(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/resend-otp
const resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Already verified.' });

    const otp = generateOTP();
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save({ validateBeforeSave: false });
    await sendOtpEmail(user.email, otp, user.name);

    res.json({ success: true, message: 'OTP resent successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/refresh-token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(401).json({ success: false, message: 'Refresh token required.' });

    const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, verifyOtp, login, resendOtp, refreshToken, logout, getMe };
