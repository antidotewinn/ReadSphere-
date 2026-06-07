const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

module.exports = router;
