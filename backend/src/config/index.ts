/**
 * Application configuration
 * Loads and validates environment variables
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CommerceTools configuration
  commerceTools: {
    projectKey: process.env.CTP_PROJECT_KEY || '',
    clientId: process.env.CTP_CLIENT_ID || '',
    clientSecret: process.env.CTP_CLIENT_SECRET || '',
    apiUrl: process.env.CTP_API_URL || 'https://api.europe-west1.gcp.commercetools.com',
    authUrl: process.env.CTP_AUTH_URL || 'https://auth.europe-west1.gcp.commercetools.com',
    scopes: process.env.CTP_SCOPES?.split(',') || [
      'manage_project',
      'view_products',
      'manage_orders',
    ],
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10),
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:8080'],
    credentials: true,
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Review validation rules
  review: {
    maxCommentLength: 1000,
    minRating: 1,
    maxRating: 5,
    maxAuthorNameLength: 100,
  },
};

// Validate required configuration
export function validateConfig(): void {
  const requiredEnvVars = [
    'CTP_PROJECT_KEY',
    'CTP_CLIENT_ID',
    'CTP_CLIENT_SECRET',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}
