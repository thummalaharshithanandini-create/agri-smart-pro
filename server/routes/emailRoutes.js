const express = require('express');
const router = express.Router();
const { sendFeedbackEmail, sendOrderEmail } = require('../controllers/emailController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/feedback', authMiddleware, sendFeedbackEmail);
router.post('/order', authMiddleware, sendOrderEmail);

module.exports = router;
