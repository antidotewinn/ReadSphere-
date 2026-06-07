const express = require('express');
const router = express.Router();
const { getBooks, getBook, getBookReadUrl, getFeaturedBooks } = require('../controllers/book.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', getBooks);
router.get('/featured', getFeaturedBooks);
router.get('/:id', (req, res, next) => {
  // Optionally attach user if token present
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return protect(req, res, next);
  }
  next();
}, getBook);
router.get('/:id/read', getBookReadUrl);

module.exports = router;
