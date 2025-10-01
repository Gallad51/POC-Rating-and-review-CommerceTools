/**
 * Authentication Middleware Tests
 */

import { Request, Response } from 'express';
import { authenticate, optionalAuth, generateToken } from './auth.middleware';

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      path: '/test',
      method: 'GET',
      ip: '127.0.0.1',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('authenticate', () => {
    it('should fail when no authorization header is provided', () => {
      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'No authorization header provided',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should fail with invalid authorization format', () => {
      mockRequest.headers = { authorization: 'InvalidFormat' };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid authorization format. Use: Bearer <token>',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should fail with invalid token', () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should succeed with valid token', () => {
      const token = generateToken('test-user-id');
      mockRequest.headers = { authorization: `Bearer ${token}` };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.userId).toBe('test-user-id');
    });
  });

  describe('optionalAuth', () => {
    it('should proceed without authentication when no header is provided', () => {
      optionalAuth(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
    });

    it('should validate token when header is provided', () => {
      const token = generateToken('test-user-id');
      mockRequest.headers = { authorization: `Bearer ${token}` };

      optionalAuth(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user?.userId).toBe('test-user-id');
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken('test-user-id');
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });
});
