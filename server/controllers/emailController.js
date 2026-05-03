const sendEmail = require('../utils/sendEmail');

// @desc    Send feedback & report email
// @route   POST /api/email/feedback
// @access  Private
exports.sendFeedbackEmail = async (req, res) => {
  console.log('DEBUG: Received Feedback Request:', req.body);
  try {
    const { feedbackText, farmerName, scanData } = req.body;
    
    // We send it to the admin (which is also the EMAIL_USER in this case, tummaalaharshithanandini@gmail.com)
    const adminEmail = process.env.EMAIL_USER;

    const message = `
      AgriSmart Report & Feedback
      ---------------------------
      Farmer Name: ${farmerName || 'Chinnappa'}
      
      Feedback:
      "${feedbackText}"
      
      ${scanData ? `
      Recent Scan Results:
      - Detected: ${scanData.diseaseName} (${scanData.cropType})
      - Confidence: ${scanData.confidence}%
      - Recommended Solution: ${scanData.treatments?.[0]?.title || 'Consult Expert'}
      ` : `
      Recent Scan Results:
      - (No recent scan data attached)
      `}
    `;

    await sendEmail({
      email: adminEmail,
      subject: `AgriSmart Report & Feedback - ${farmerName || 'Chinnappa'}`,
      message: message,
    });

    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email Sending Error:', error);
    res.status(500).json({ success: false, message: 'Email could not be sent' });
  }
};

// @desc    Send order notification email
// @route   POST /api/email/order
// @access  Private
exports.sendOrderEmail = async (req, res) => {
  try {
    const { productName, price, quantity, deliveryAddress } = req.body;
    
    const adminEmail = process.env.EMAIL_USER;

    const message = `
      New Pesticide Order Received!
      -----------------------------
      A new order has been placed on AgriSmart!
      
      Product: ${productName}
      Quantity: ${quantity} Acres
      Total Price: ${price}
      
      Delivery Address: 
      ${deliveryAddress}
    `;

    await sendEmail({
      email: adminEmail,
      subject: 'New Pesticide Order - AgriSmart Shop',
      message: message,
    });

    res.status(200).json({ success: true, message: 'Order notification sent' });
  } catch (error) {
    console.error('Order Email Error:', error);
    res.status(500).json({ success: false, message: 'Order notification could not be sent' });
  }
};
// @desc    Send welcome & verification email to farmer
// @route   Internal Call during Registration
exports.sendWelcomeEmail = async (fullName, email) => {
  console.log('DEBUG: Sending Welcome Email to:', email);
  try {
    const message = `
      Welcome to AgriSmart AI, ${fullName}!
      ------------------------------------
      Your agricultural account is now active.
      
      You can now:
      - Scan your crops for AI diagnosis.
      - Order pesticides directly from our dashboard.
      - Track your deliveries with secure OTP codes.
      
      We are glad to have you on board!
      
      AgriSmart Support Team
    `;

    await sendEmail({
      email: email,
      subject: 'Welcome to AgriSmart AI - Registration Successful',
      message: message,
    });

    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Welcome Email Error:', error);
    return false;
  }
};
