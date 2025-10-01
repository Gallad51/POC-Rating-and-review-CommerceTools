/**
 * Validation Middleware
 * Input validation and sanitization using express-validator
 */

import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { logger } from '../config/logger';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.warn('Validation failed', {
      errors: errors.array(),
      path: req.path,
      body: req.body,
    });

    res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((err) => ({
        field: err.type === 'field' ? err.path : undefined,
        message: err.msg,
      })),
    });
    return;
  }

  next();
};

/**
 * Validation rules for creating a review
 */
export const validateCreateReview = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: config.review.minRating, max: config.review.maxRating })
    .withMessage(`Rating must be between ${config.review.minRating} and ${config.review.maxRating}`),

  body('comment')
    .optional()
    .trim()
    .isString()
    .withMessage('Comment must be a string')
    .isLength({ max: config.review.maxCommentLength })
    .withMessage(`Comment must not exceed ${config.review.maxCommentLength} characters`)
    .customSanitizer((value) => {
      // Remove potential XSS attempts
      return value.replace(/<[^>]*>/g, '');
    }),

  body('authorName')
    .optional()
    .trim()
    .isString()
    .withMessage('Author name must be a string')
    .isLength({ max: config.review.maxAuthorNameLength })
    .withMessage(`Author name must not exceed ${config.review.maxAuthorNameLength} characters`)
    .customSanitizer((value) => {
      // Remove potential XSS attempts
      return value.replace(/<[^>]*>/g, '');
    }),

  handleValidationErrors,
];

/**
 * Validation rules for product ID parameter
 */
export const validateProductId = [
  param('productId')
    .trim()
    .notEmpty()
    .withMessage('Product ID is required')
    .isString()
    .withMessage('Product ID must be a string')
    .isLength({ max: 100 })
    .withMessage('Product ID is too long'),

  handleValidationErrors,
];

/**
 * Validation rules for pagination query parameters
 */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  handleValidationErrors,
];

/**
 * Validation rules for review filters
 */
export const validateReviewFilters = [
  query('rating')
    .optional()
    .isInt({ min: config.review.minRating, max: config.review.maxRating })
    .withMessage(`Rating must be between ${config.review.minRating} and ${config.review.maxRating}`)
    .toInt(),

  query('verified')
    .optional()
    .isBoolean()
    .withMessage('Verified must be a boolean')
    .toBoolean(),

  query('sortBy')
    .optional()
    .isIn(['date', 'rating', 'helpful'])
    .withMessage('Sort by must be one of: date, rating, helpful'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),

  handleValidationErrors,
];
