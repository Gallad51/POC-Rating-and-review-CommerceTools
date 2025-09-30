/**
 * Error Handling Middleware
 * Centralized error handling with proper logging
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal server error';

  // Log error
  if (statusCode >= 500) {
    logger.error('Server error', {
      error: err,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      userId: req.user?.userId,
    });
  } else {
    logger.warn('Client error', {
      error: message,
      statusCode,
      path: req.path,
      method: req.method,
    });
  }

  // Don't expose internal errors in production
  const response: any = {
    error: statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.warn('Route not found', {
    path: req.path,
    method: req.method,
  });

  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
};

/**
 * Async handler wrapper to catch promise rejections
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
