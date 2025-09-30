/**
 * Review Routes
 * Defines all routes related to product reviews and ratings
 */

import { Router } from 'express';
import {
  getProductRating,
  getProductReviews,
  createReview,
  reviewHealthCheck,
} from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { apiRateLimiter, writeRateLimiter, userRateLimiter } from '../middleware/ratelimit.middleware';
import {
  validateProductId,
  validatePagination,
  validateReviewFilters,
  validateCreateReview,
} from '../middleware/validation.middleware';

const router = Router();

/**
 * @route   GET /api/reviews/health
 * @desc    Health check for reviews system
 * @access  Public
 */
router.get('/health', reviewHealthCheck);

/**
 * @route   GET /api/products/:productId/rating
 * @desc    Get product rating summary (average, total, distribution)
 * @access  Public
 */
router.get(
  '/:productId/rating',
  apiRateLimiter,
  validateProductId,
  getProductRating
);

/**
 * @route   GET /api/products/:productId/reviews
 * @desc    Get paginated product reviews with filtering and sorting
 * @access  Public
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 100)
 * @query   rating - Filter by rating (1-5)
 * @query   verified - Filter by verified purchases (true/false)
 * @query   sortBy - Sort by field (date/rating/helpful)
 * @query   sortOrder - Sort order (asc/desc)
 */
router.get(
  '/:productId/reviews',
  apiRateLimiter,
  validateProductId,
  validatePagination,
  validateReviewFilters,
  getProductReviews
);

/**
 * @route   POST /api/products/:productId/reviews
 * @desc    Create a new review for a product
 * @access  Private (requires authentication)
 * @body    rating - Rating value (1-5)
 * @body    comment - Review comment (optional, max 1000 chars)
 * @body    authorName - Author display name (optional, max 100 chars)
 */
router.post(
  '/:productId/reviews',
  writeRateLimiter,
  userRateLimiter,
  authenticate,
  validateProductId,
  validateCreateReview,
  createReview
);

export default router;
