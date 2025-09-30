/**
 * Main Server Application
 * Express server with CommerceTools integration for ratings and reviews
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { config, validateConfig } from './config';
import { logger } from './config/logger';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Validate configuration
try {
  validateConfig();
} catch (error: any) {
  logger.error('Configuration validation failed', { error: error.message });
  if (config.nodeEnv === 'production') {
    process.exit(1);
  }
}

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Ratings & Reviews API Documentation',
}));

// Health check endpoint (required for Cloud Run)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'ratings-reviews-backend',
    version: '1.0.0',
    environment: config.nodeEnv,
  });
});

// Default route with API information
app.get('/', (req, res) => {
  res.json({
    message: 'Ratings & Reviews Backend API',
    version: '1.0.0',
    environment: config.nodeEnv,
    documentation: '/api-docs',
    endpoints: {
      health: '/health',
      docs: '/api-docs',
      auth: {
        login: 'POST /api/auth/login',
        verify: 'GET /api/auth/verify',
      },
      reviews: {
        rating: 'GET /api/products/:productId/rating',
        list: 'GET /api/products/:productId/reviews',
        create: 'POST /api/products/:productId/reviews',
        health: 'GET /api/reviews/health',
      },
    },
  });
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(config.port, '0.0.0.0', () => {
  logger.info(`Server started`, {
    port: config.port,
    environment: config.nodeEnv,
    documentation: `http://localhost:${config.port}/api-docs`,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;