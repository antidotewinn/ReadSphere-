const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for cover images
const coverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ebook-platform/covers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 600, height: 900, crop: 'fill', quality: 'auto' }],
  },
});

// Storage for PDF books (stored as raw resource)
const bookStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ebook-platform/books',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
  },
});

const uploadCover = multer({
  storage: coverStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadBook = multer({
  storage: bookStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  },
});

const generateSignedUrl = (publicId, expiresInSeconds = 3600) => {
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    type: 'upload',
    secure: true,
  });
};
module.exports = { cloudinary, uploadCover, uploadBook, generateSignedUrl };
