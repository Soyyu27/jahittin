const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.static(path.join(__dirname,'public')));

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files untuk uploads
app.use('/uploads', express.static('uploads'));

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const designRoutes = require('./routes/designs');
const categoryRoutes = require('./routes/categories');


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/categories', categoryRoutes);


// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal server error' 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 Server Running Successfully!     ║
╠════════════════════════════════════════╣
║   Port: ${PORT}                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
║   URL: http://localhost:${PORT}           ║
╚════════════════════════════════════════╝
  `);
});