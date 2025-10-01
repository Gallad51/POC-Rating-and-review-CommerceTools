/**
 * Authentication Routes
 * Mock authentication endpoints for POC
 */

import { Router } from 'express';
import { login, verifyToken } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { apiRateLimiter } from '../middleware/ratelimit.middleware';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Mock login endpoint (generates JWT for testing)
 * @access  Public
 * @body    userId - User identifier
 */
router.post('/login', apiRateLimiter, login);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Private
 */
router.get('/verify', apiRateLimiter, authenticate, verifyToken);

export default router;
