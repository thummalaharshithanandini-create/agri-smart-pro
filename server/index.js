const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables at the very top
dotenv.config();

const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const emailRoutes = require('./routes/emailRoutes');

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins in production
app.use(express.json());

// API Routes
app.use('/api', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/email', emailRoutes);

// --- DEPLOYMENT LOGIC START ---
const __dirname_root = path.resolve();
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app's build folder
  app.use(express.static(path.join(__dirname_root, '../client/dist')));

  // Handle any requests that don't match the ones above by returning index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname_root, '../client/dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running successfully...');
  });
}
// --- DEPLOYMENT LOGIC END ---

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

console.log('Attempting to connect to MongoDB...');
mongoose.connect(`${MONGO_URI}`)
  .then(() => {
    console.log('✅ SUCCESS: AgriSmart Brain is Connected to MongoDB Atlas!');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

app.listen(PORT, () => {
  console.log(`🚀 Server is live on Port ${PORT}`);
});
