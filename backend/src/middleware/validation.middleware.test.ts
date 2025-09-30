/**
 * Validation Middleware Tests
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { handleValidationErrors } from './validation.middleware';

// Mock express-validator
jest.mock('express-validator', () => ({
  ...jest.requireActual('express-validator'),
  validationResult: jest.fn(),
}));

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      path: '/test',
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('handleValidationErrors', () => {
    it('should proceed when no validation errors', () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      });

      handleValidationErrors(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 400 with validation errors', () => {
      const errors = [
        { type: 'field', path: 'rating', msg: 'Rating is required' },
        { type: 'field', path: 'productId', msg: 'Product ID is required' },
      ];

      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => false,
        array: () => errors,
      });

      handleValidationErrors(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({ message: 'Rating is required' }),
          expect.objectContaining({ message: 'Product ID is required' }),
        ]),
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
