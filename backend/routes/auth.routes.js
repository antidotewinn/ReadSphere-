const express = require('express');
const router = express.Router();
const { register, verifyOtp, login, resendOtp, refreshToken, logout, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/resend-otp', resendOtp);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
const passport = require('../config/passport');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/auth/login?error=google_failed` }),
  async (req, res) => {
    try {
      const user = req.user;
      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${user._id}`);
    } catch (err) {
      res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=google_failed`);
    }
  }
);
module.exports = router;
