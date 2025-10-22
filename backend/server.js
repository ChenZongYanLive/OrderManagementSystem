import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import orderRoutes from './routes/orderRoutes.js';
import importRoutes from './routes/importRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/import', importRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Order Management System API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/orders`);
  console.log(`   - GET  /api/orders/:id`);
  console.log(`   - POST /api/orders`);
  console.log(`   - PUT  /api/orders/:id`);
  console.log(`   - DELETE /api/orders/:id`);
  console.log(`   - GET  /api/orders/statistics`);
  console.log(`   - POST /api/import/upload`);
  console.log(`   - GET  /api/import/logs`);
});
