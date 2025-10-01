/**
 * Review Controller
 * Handles HTTP requests for review-related operations
 */

import { Request, Response } from 'express';
import { commerceToolsService } from '../services/commercetools.service';
import { logger, auditLogger } from '../config/logger';
import { AppError, asyncHandler } from '../middleware/error.middleware';

/**
 * Get product rating summary
 * GET /api/products/:productId/rating
 */
export const getProductRating = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;

    logger.info('Getting product rating', { productId });

    const rating = await commerceToolsService.getProductRating(productId);

    res.json({
      success: true,
      data: rating,
    });
  }
);

/**
 * Get product reviews (paginated)
 * GET /api/products/:productId/reviews
 */
export const getProductReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const filters = {
      rating: req.query.rating ? parseInt(req.query.rating as string) : undefined,
      verified: req.query.verified === 'true' ? true : req.query.verified === 'false' ? false : undefined,
      sortBy: req.query.sortBy as 'date' | 'rating' | 'helpful' | undefined,
      sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
    };

    logger.info('Getting product reviews', { productId, page, limit, filters });

    const reviews = await commerceToolsService.getProductReviews(
      productId,
      page,
      limit,
      filters
    );

    res.json({
      success: true,
      data: reviews,
    });
  }
);

/**
 * Create a new review
 * POST /api/products/:productId/reviews
 * Requires authentication
 */
export const createReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { rating, comment, authorName } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    logger.info('Creating review', { productId, userId });

    const review = await commerceToolsService.createReview(
      {
        productId,
        rating,
        comment,
        authorName,
      },
      userId
    );

    auditLogger.info('Review created', {
      reviewId: review.id,
      productId,
      userId,
      rating,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  }
);

/**
 * Health check for reviews system
 * GET /api/reviews/health
 */
export const reviewHealthCheck = asyncHandler(
  async (req: Request, res: Response) => {
    const isHealthy = await commerceToolsService.healthCheck();

    if (!isHealthy) {
      throw new AppError('CommerceTools connection failed', 503);
    }

    res.json({
      success: true,
      message: 'Reviews system is healthy',
      timestamp: new Date().toISOString(),
    });
  }
);
