/**
 * Test Setup
 * Global configuration for Jest tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '8080';
process.env.JWT_SECRET = 'test-secret';
process.env.CTP_PROJECT_KEY = 'test-project';
process.env.CTP_CLIENT_ID = 'test-client-id';
process.env.CTP_CLIENT_SECRET = 'test-client-secret';
process.env.RATE_LIMIT_MAX_REQUESTS = '1000'; // High limit for tests

// Silence logs during tests
jest.mock('../config/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  auditLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));
