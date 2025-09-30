/**
 * Swagger/OpenAPI Configuration
 * API documentation setup
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Ratings & Reviews API',
    version: '1.0.0',
    description: `
      Secure middleware API for managing product ratings and reviews with CommerceTools integration.
      
      ## Features
      - 🔐 JWT Authentication
      - 🛡️ Rate Limiting
      - ✅ Input Validation
      - 🔒 GDPR Compliant
      - 📊 Comprehensive Logging
      
      ## Authentication
      Most write operations require authentication. Include the JWT token in the Authorization header:
      \`\`\`
      Authorization: Bearer <your-jwt-token>
      \`\`\`
      
      ## Rate Limits
      - General API: 10 requests/minute per IP
      - Write operations: 5 requests/minute per IP
      - Per user: 100 requests/hour
    `,
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Development server',
    },
    {
      url: 'https://your-production-url.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Review: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique review identifier',
            example: 'review-123',
          },
          productId: {
            type: 'string',
            description: 'Product identifier',
            example: 'prod-456',
          },
          rating: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            description: 'Rating value (1-5)',
            example: 4,
          },
          comment: {
            type: 'string',
            maxLength: 1000,
            description: 'Review comment (max 1000 characters)',
            example: 'Great product! Highly recommended.',
          },
          authorName: {
            type: 'string',
            maxLength: 100,
            description: 'Anonymized author display name',
            example: 'John D.',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Review creation timestamp',
          },
          isVerifiedPurchase: {
            type: 'boolean',
            description: 'Whether this is a verified purchase',
            example: true,
          },
        },
      },
      ReviewInput: {
        type: 'object',
        required: ['rating'],
        properties: {
          rating: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            description: 'Rating value (1-5)',
            example: 5,
          },
          comment: {
            type: 'string',
            maxLength: 1000,
            description: 'Review comment (optional, max 1000 characters)',
            example: 'Excellent quality and fast delivery!',
          },
          authorName: {
            type: 'string',
            maxLength: 100,
            description: 'Author display name (optional, max 100 characters)',
            example: 'Jane S.',
          },
        },
      },
      ProductRating: {
        type: 'object',
        properties: {
          productId: {
            type: 'string',
            description: 'Product identifier',
            example: 'prod-456',
          },
          averageRating: {
            type: 'number',
            description: 'Average rating (0-5)',
            example: 4.3,
          },
          totalReviews: {
            type: 'integer',
            description: 'Total number of reviews',
            example: 42,
          },
          ratingDistribution: {
            type: 'object',
            properties: {
              1: { type: 'integer', example: 2 },
              2: { type: 'integer', example: 3 },
              3: { type: 'integer', example: 8 },
              4: { type: 'integer', example: 15 },
              5: { type: 'integer', example: 14 },
            },
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
            example: 'Validation failed',
          },
          details: {
            type: 'array',
            description: 'Detailed error information',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  example: 'rating',
                },
                message: {
                  type: 'string',
                  example: 'Rating must be between 1 and 5',
                },
              },
            },
          },
        },
      },
    },
  },
  security: [],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
