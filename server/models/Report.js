const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  cropType: {
    type: String,
    required: true,
  },
  diseaseName: {
    type: String,
    required: true,
  },
  remedy: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Report', reportSchema);
