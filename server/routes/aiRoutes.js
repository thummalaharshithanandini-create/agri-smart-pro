const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Route for predicting crop disease
router.post('/predict', aiController.predictDisease);

module.exports = router;
