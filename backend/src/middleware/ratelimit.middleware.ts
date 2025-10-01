/**
 * Rate Limiting Middleware
 * Protects against abuse and DDoS attacks
 */

import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { logger } from '../config/logger';

/**
 * General rate limiter for all API endpoints
 * 10 requests per minute per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      error: 'Too many requests, please try again later',
      retryAfter: config.rateLimit.windowMs / 1000,
    });
  },
});

/**
 * Stricter rate limiter for write operations (POST, PUT, DELETE)
 * 5 requests per minute per IP
 */
export const writeRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: Math.floor(config.rateLimit.maxRequests / 2),
  message: 'Too many write requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    logger.warn('Write rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      error: 'Too many write requests, please try again later',
      retryAfter: config.rateLimit.windowMs / 1000,
    });
  },
});

/**
 * User-specific rate limiter (requires authentication)
 * 100 requests per hour per user
 */
export const userRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: 'Too many requests for this user, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.userId || req.ip || 'unknown';
  },
  handler: (req, res) => {
    logger.warn('User rate limit exceeded', {
      userId: req.user?.userId,
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      error: 'Too many requests for your account, please try again later',
      retryAfter: 3600, // 1 hour in seconds
    });
  },
});
