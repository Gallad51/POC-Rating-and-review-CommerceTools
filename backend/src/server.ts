import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint (required for Cloud Run)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'ratings-reviews-backend',
    version: '1.0.0'
  });
});

// API Routes
app.get('/api/ratings', (req, res) => {
  // Mock ratings data for POC
  res.json({
    ratings: [
      { id: 1, productId: 'prod-1', rating: 4.5, comment: 'Great product!', userId: 'user-1' },
      { id: 2, productId: 'prod-1', rating: 5.0, comment: 'Excellent quality', userId: 'user-2' }
    ],
    total: 2,
    averageRating: 4.75
  });
});

app.post('/api/ratings', (req, res) => {
  const { productId, rating, comment, userId } = req.body;
  
  // Basic validation
  if (!productId || !rating || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Mock response for POC
  res.status(201).json({
    id: Date.now(),
    productId,
    rating,
    comment,
    userId,
    createdAt: new Date().toISOString()
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Ratings & Reviews Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      ratings: '/api/ratings'
    }
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

export default app;