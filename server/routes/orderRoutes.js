const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getAllOrders, pickupOrder, verifyOTP } = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/orders/place
// @desc    Place a new pesticide order
// @access  Private
router.post('/place', authMiddleware, placeOrder);

// @route   GET /api/orders/history
// @desc    Get logged in farmer's order history
// @access  Private
router.get('/history', authMiddleware, getMyOrders);
// @route   GET /api/orders/all
// @desc    Get all orders (for Delivery Dashboard)
// @access  Private
router.get('/all', authMiddleware, getAllOrders);

// @route   POST /api/orders/:id/pickup
// @desc    Pick up an order and send OTP
// @access  Private
router.post('/:id/pickup', authMiddleware, pickupOrder);

// @route   POST /api/orders/:id/verify
// @desc    Verify OTP and mark as Delivered
// @access  Private
router.post('/:id/verify', authMiddleware, verifyOTP);

module.exports = router;
