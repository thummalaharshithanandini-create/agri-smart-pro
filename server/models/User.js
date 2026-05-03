const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: 'Unknown Farm',
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
