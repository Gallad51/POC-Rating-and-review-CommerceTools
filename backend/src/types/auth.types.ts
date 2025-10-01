/**
 * Authentication and authorization type definitions
 */

export interface AuthenticatedUser {
  userId: string;
  email?: string; // Not exposed in responses
  name?: string;
  isVerified?: boolean;
}

export interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}
