const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { initializeDefaultCategory } = require('./models/Category');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();

// Initialize middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Initialize default category
initializeDefaultCategory();

// Define your products route logic here
app.use('/', (req, res) => {
    res.json({ message: "Working fine" });
  });
// Define routes
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));

// Basic route for API health check
app.get('/', (req, res) => {
  res.json({ message: 'Inventory Management API is running' });
});

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({ status: false, error: 'Endpoint not found' });
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
// The server will be accessible at http://localhost:5000 (or the PORT specified in .env)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});