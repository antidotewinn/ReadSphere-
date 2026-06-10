const express = require('express');
const router = express.Router();
const { uploadBook, publishBook, getMyBooks, updateBook, deleteBook, getDashboard } = require('../controllers/publisher.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { cloudinary } = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Single storage that handles both cover and PDF
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.fieldname === 'coverImage') {
      return {
        folder: 'ebook-platform/covers',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 600, height: 900, crop: 'fill', quality: 'auto' }],
      };
    }
    if (file.fieldname === 'pdfFile') {
      return {
        folder: 'ebook-platform/books',
        resource_type: 'raw',
        allowed_formats: ['pdf'],
      };
    }
  },
});

const upload = multer({ storage }).fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 },
]);

router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/books', getMyBooks);
router.post('/books', upload, uploadBook);
router.put('/books/:id', updateBook);
router.put('/books/:id/publish', publishBook);
router.delete('/books/:id', deleteBook);

module.exports = router;