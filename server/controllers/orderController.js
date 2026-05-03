const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');
// Place a new order
exports.placeOrder = async (req, res) => {
  try {
    const { productName, price, quantity, deliveryAddress } = req.body;

    const newOrder = new Order({
      user: req.user.id, // from authMiddleware
      productName,
      price,
      quantity,
      deliveryAddress,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Order Placement Error:', error.message);
    res.status(500).json({ error: 'Failed to place order', details: error.message });
  }
};

// Get current user's orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Fetch Orders Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
};

// Get all orders (for Delivery Dashboard)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'fullName email') // Fetch the farmer's name and email
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Fetch All Orders Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch all orders', details: error.message });
  }
};

// Pick up order and send OTP
exports.pickupOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Find the order and update status & OTP
    const order = await Order.findByIdAndUpdate(
      orderId, 
      { status: 'Out for Delivery', otp: otp },
      { new: true }
    ).populate('user', 'fullName email');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Email the OTP to the farmer
    const message = `
      Hi ${order.user.fullName || 'Farmer'},
      
      Good news! Your pesticide order is OUT FOR DELIVERY!
      
      Order Details:
      Product: ${order.productName}
      Quantity: ${order.quantity}
      Total: ${order.price}
      
      To receive your package from the delivery driver, please provide this secret OTP:
      
      Your OTP: ${otp}
      
      Thank you for using AgriSmart!
    `;

    try {
      await sendEmail({
        email: order.user.email,
        subject: `AgriSmart Delivery OTP - ${otp}`,
        message: message,
      });
      console.log("Email sent successfully to", order.user.email);
    } catch (emailErr) {
      console.warn("WARNING: Order picked up, but email failed to send (Likely bad Google App Password). OTP is:", otp);
      // We do NOT return an error here, because the database update was successful.
    }

    res.status(200).json({ success: true, message: 'Order picked up and OTP saved!', order, otp }); // Return OTP in response for testing if email fails
  } catch (error) {
    console.error('Pickup Order Error:', error.message);
    res.status(500).json({ error: 'Failed to pick up order', details: error.message });
  }
};

// Verify OTP and mark delivered
exports.verifyOTP = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { otp } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    order.status = 'Delivered';
    await order.save();

    res.status(200).json({ success: true, message: 'Order delivered successfully!' });
  } catch (error) {
    console.error('Verify OTP Error:', error.message);
    res.status(500).json({ error: 'Failed to verify OTP', details: error.message });
  }
};
