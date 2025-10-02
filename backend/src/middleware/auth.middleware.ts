/**
 * Authentication Middleware
 * Validates JWT tokens and attaches user information to requests
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger, auditLogger } from '../config/logger';
import type { JWTPayload, AuthenticatedUser } from '../types/auth.types';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Authenticate user from JWT token in Authorization header
 * Token format: "Bearer <token>"
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'No authorization header provided' });
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ error: 'Invalid authorization format. Use: Bearer <token>' });
      return;
    }

    const token = parts[1];

    // Verify and decode JWT
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    // Attach user to request
    req.user = {
      userId: decoded.userId,
    };

    auditLogger.info('User authenticated', {
      userId: decoded.userId,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });

    next();
  } catch (error: any) {
    logger.warn('Authentication failed', { error: error.message, path: req.path });

    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired' });
      return;
    }

    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Optional authentication - does not fail if no token provided
 * Useful for endpoints that work for both authenticated and anonymous users
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next();
    return;
  }

  // If header is present, validate it
  authenticate(req, res, next);
};

/**
 * Mock authentication for POC - always allows requests with demo user
 * For production, use the real authenticate middleware
 */
export const mockAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Attach a mock user to request for POC purposes
  req.user = {
    userId: 'demo-user-' + Date.now(),
  };

  logger.info('Mock authentication - demo mode enabled', {
    userId: req.user.userId,
    path: req.path,
    method: req.method,
  });

  next();
};

/**
 * Example: Generate JWT token (for testing purposes)
 * In production, this would be handled by your authentication service
 */
export const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );
};
