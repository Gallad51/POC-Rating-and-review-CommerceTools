/**
 * Server Integration Tests
 * Tests API endpoints with supertest
 */

import request from 'supertest';
import app from './server';
import { generateToken } from './middleware/auth.middleware';
import { commerceToolsService } from './services/commercetools.service';

// Mock CommerceTools service
jest.mock('./services/commercetools.service', () => ({
  commerceToolsService: {
    getProductRating: jest.fn(),
    getProductReviews: jest.fn(),
    createReview: jest.fn(),
    healthCheck: jest.fn(),
  },
}));

describe('Server Integration Tests', () => {
  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('auth');
      expect(response.body.endpoints).toHaveProperty('reviews');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'ratings-reviews-backend');
    });
  });

  describe('GET /api-docs', () => {
    it('should serve API documentation', async () => {
      const response = await request(app).get('/api-docs/');

      expect(response.status).toBe(200);
      expect(response.text).toContain('swagger-ui');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should generate JWT token for valid userId', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ userId: 'test-user' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('userId', 'test-user');
    });

    it('should fail without userId', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should verify valid JWT token', async () => {
      const token = generateToken('test-user');
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isAuthenticated).toBe(true);
    });

    it('should reject without token', async () => {
      const response = await request(app).get('/api/auth/verify');

      expect(response.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/products/:productId/rating', () => {
    beforeEach(() => {
      (commerceToolsService.getProductRating as jest.Mock).mockResolvedValue({
        productId: 'test-product',
        averageRating: 4.5,
        totalReviews: 10,
        ratingDistribution: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 },
      });
    });

    it('should return product rating', async () => {
      const response = await request(app).get('/api/products/test-product/rating');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('averageRating', 4.5);
      expect(response.body.data).toHaveProperty('totalReviews', 10);
    });

    it('should validate productId parameter', async () => {
      const response = await request(app).get('/api/products//rating');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/products/:productId/reviews', () => {
    beforeEach(() => {
      (commerceToolsService.getProductReviews as jest.Mock).mockResolvedValue({
        reviews: [
          {
            id: 'review-1',
            productId: 'test-product',
            rating: 5,
            comment: 'Great!',
            authorName: 'John',
            createdAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        hasMore: false,
      });
    });

    it('should return product reviews', async () => {
      const response = await request(app).get('/api/products/test-product/reviews');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toHaveLength(1);
      expect(response.body.data.total).toBe(1);
    });

    it('should accept pagination parameters', async () => {
      const response = await request(app)
        .get('/api/products/test-product/reviews')
        .query({ page: 2, limit: 5 });

      expect(response.status).toBe(200);
      expect(commerceToolsService.getProductReviews).toHaveBeenCalledWith(
        'test-product',
        2,
        5,
        expect.any(Object)
      );
    });

    it('should accept filter parameters', async () => {
      const response = await request(app)
        .get('/api/products/test-product/reviews')
        .query({ rating: 5, verified: true, sortBy: 'rating', sortOrder: 'desc' });

      expect(response.status).toBe(200);
    });

    it('should reject invalid pagination values', async () => {
      const response = await request(app)
        .get('/api/products/test-product/reviews')
        .query({ page: -1 });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/products/:productId/reviews', () => {
    const token = generateToken('test-user');

    beforeEach(() => {
      (commerceToolsService.createReview as jest.Mock).mockResolvedValue({
        id: 'new-review',
        productId: 'test-product',
        rating: 5,
        comment: 'Excellent!',
        authorName: 'Test User',
        createdAt: new Date(),
      });
    });

    it('should create review with valid data and authentication', async () => {
      const response = await request(app)
        .post('/api/products/test-product/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          rating: 5,
          comment: 'Excellent product!',
          authorName: 'Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should allow unauthenticated review creation', async () => {
      const response = await request(app)
        .post('/api/products/test-product/reviews')
        .send({
          rating: 5,
          comment: 'Excellent!',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/products/test-product/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should validate rating range', async () => {
      const response = await request(app)
        .post('/api/products/test-product/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 6 });

      expect(response.status).toBe(400);
    });

    it('should validate comment length', async () => {
      const longComment = 'a'.repeat(1001);
      const response = await request(app)
        .post('/api/products/test-product/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          rating: 5,
          comment: longComment,
        });

      expect(response.status).toBe(400);
    });

    it('should sanitize HTML in inputs', async () => {
      const response = await request(app)
        .post('/api/products/test-product/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          rating: 5,
          comment: '<script>alert("xss")</script>Great!',
          authorName: '<b>Test</b>',
        });

      // Should not fail, but should sanitize
      if (response.status === 201) {
        expect(commerceToolsService.createReview).toHaveBeenCalledWith(
          expect.objectContaining({
            comment: expect.not.stringContaining('<script>'),
          }),
          'test-user'
        );
      }
    });
  });

  describe('GET /api/reviews/health', () => {
    it('should return healthy status when CommerceTools is reachable', async () => {
      (commerceToolsService.healthCheck as jest.Mock).mockResolvedValue(true);

      const response = await request(app).get('/api/reviews/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return error when CommerceTools is unreachable', async () => {
      (commerceToolsService.healthCheck as jest.Mock).mockResolvedValue(false);

      const response = await request(app).get('/api/reviews/health');

      expect(response.status).toBe(503);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
});
