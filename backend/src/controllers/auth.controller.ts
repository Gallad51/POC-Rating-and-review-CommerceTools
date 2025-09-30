/**
 * Authentication Controller
 * Handles authentication-related operations
 * Note: This is a mock implementation for POC
 * In production, integrate with your actual auth provider
 */

import { Request, Response } from 'express';
import { generateToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../config/logger';

/**
 * Mock login endpoint for testing
 * POST /api/auth/login
 * 
 * In production, this should:
 * - Validate credentials against your user database
 * - Check user verification status
 * - Implement proper password hashing
 * - Add multi-factor authentication
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({
      success: false,
      error: 'User ID is required',
    });
    return;
  }

  logger.info('Mock login', { userId });

  // Generate JWT token
  const token = generateToken(userId);

  res.json({
    success: true,
    data: {
      token,
      expiresIn: '24h',
      userId,
    },
  });
});

/**
 * Verify token endpoint
 * GET /api/auth/verify
 */
export const verifyToken = asyncHandler(async (req: Request, res: Response) => {
  // If we reach here, the authenticate middleware has already validated the token
  res.json({
    success: true,
    data: {
      userId: req.user?.userId,
      isAuthenticated: true,
    },
  });
});
