const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('./emailController');

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'This farmer is already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Send Welcome Email (Wait, we don't want to block the response if email fails)
    sendWelcomeEmail(fullName, email).catch(err => console.error('Silent Email Error:', err));

    // Create JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '5 days' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token, user: { fullName: user.fullName, email: user.email } });
      }
    );
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).json({ error: 'Database connection failed or Server Error', details: err.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  console.log('Login Attempt:', req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing Email or Password' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Incorrect Email or Password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect Email or Password' });
    }

    // Create JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '5 days' },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token, user: { fullName: user.fullName, email: user.email } });
      }
    );
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ error: 'Database connection failed or Server Error', details: err.message });
  }
};

// Get current user details
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('GetMe Error:', err.message);
    res.status(500).json({ error: 'Database connection failed or Server Error', details: err.message });
  }
};
