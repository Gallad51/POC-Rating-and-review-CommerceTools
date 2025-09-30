# 🔧 Backend Service - Ratings & Reviews API

Secure middleware API for managing product ratings and reviews with CommerceTools integration.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Security](#security)
- [Testing](#testing)
- [Configuration](#configuration)
- [GDPR Compliance](#gdpr-compliance)

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based authentication for write operations
- 🛡️ **Rate Limiting** - Prevent abuse with configurable rate limits
- ✅ **Input Validation** - Comprehensive validation and sanitization
- 📊 **Structured Logging** - Winston-based logging with audit trails
- 🔒 **GDPR Compliant** - No personal information exposed
- 📖 **API Documentation** - Interactive Swagger/OpenAPI documentation
- 🧪 **Comprehensive Tests** - 87.89% code coverage with 51 tests
- 🚀 **Production Ready** - Error handling, monitoring, and security best practices

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/           # Configuration and environment
│   │   ├── index.ts      # Main configuration
│   │   ├── logger.ts     # Winston logger setup
│   │   └── swagger.ts    # OpenAPI specification
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.ts
│   │   └── review.controller.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.middleware.ts       # JWT authentication
│   │   ├── error.middleware.ts      # Error handling
│   │   ├── ratelimit.middleware.ts  # Rate limiting
│   │   └── validation.middleware.ts # Input validation
│   ├── routes/           # API routes
│   │   ├── auth.routes.ts
│   │   ├── review.routes.ts
│   │   └── index.ts
│   ├── services/         # Business logic
│   │   └── commercetools.service.ts
│   ├── types/            # TypeScript types
│   │   ├── auth.types.ts
│   │   ├── review.types.ts
│   │   └── commercetools.types.ts
│   ├── tests/            # Test setup
│   └── server.ts         # Express app
├── jest.config.js        # Jest configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

## 🚀 Quick Start

### Installation

```bash
cd backend
npm install
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run linting
npm run lint
```

### Docker

```bash
# Build image
docker build -t ratings-backend .

# Run container
docker run -p 8080:8080 \
  -e CTP_PROJECT_KEY=your-project \
  -e CTP_CLIENT_ID=your-client-id \
  -e CTP_CLIENT_SECRET=your-secret \
  ratings-backend
```

## 📖 API Documentation

Interactive API documentation is available at `/api-docs` when the server is running.

### Base URL

- Development: `http://localhost:8080`
- Production: Set via environment variables

### Endpoints

#### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-20T10:00:00.000Z",
  "service": "ratings-reviews-backend",
  "version": "1.0.0",
  "environment": "development"
}
```

#### Authentication

##### Login (Mock - for POC only)

```bash
POST /api/auth/login
Content-Type: application/json

{
  "userId": "user-123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h",
    "userId": "user-123"
  }
}
```

##### Verify Token

```bash
GET /api/auth/verify
Authorization: Bearer <token>
```

#### Product Ratings

##### Get Product Rating Summary

```bash
GET /api/products/:productId/rating
```

Response:
```json
{
  "success": true,
  "data": {
    "productId": "prod-123",
    "averageRating": 4.5,
    "totalReviews": 42,
    "ratingDistribution": {
      "1": 2,
      "2": 3,
      "3": 8,
      "4": 15,
      "5": 14
    }
  }
}
```

##### Get Product Reviews

```bash
GET /api/products/:productId/reviews?page=1&limit=10&rating=5&verified=true&sortBy=date&sortOrder=desc
```

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `rating` (optional): Filter by rating (1-5)
- `verified` (optional): Filter by verified purchases (true/false)
- `sortBy` (optional): Sort by field (date/rating/helpful)
- `sortOrder` (optional): Sort order (asc/desc)

Response:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review-123",
        "productId": "prod-123",
        "rating": 5,
        "comment": "Excellent product!",
        "authorName": "John D.",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "isVerifiedPurchase": true
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 10,
    "hasMore": true
  }
}
```

##### Create Review

```bash
POST /api/products/:productId/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Great product! Highly recommended.",
  "authorName": "John D."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "review-456",
    "productId": "prod-123",
    "rating": 5,
    "comment": "Great product! Highly recommended.",
    "authorName": "John D.",
    "createdAt": "2024-01-20T10:00:00.000Z",
    "isVerifiedPurchase": false
  }
}
```

## 🔐 Authentication

### JWT Token

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Example: Full Authentication Flow

```javascript
// 1. Login to get token
const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'user-123' })
});

const { data } = await loginResponse.json();
const token = data.token;

// 2. Use token for authenticated requests
const reviewResponse = await fetch('http://localhost:8080/api/products/prod-123/reviews', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    rating: 5,
    comment: 'Great product!'
  })
});
```

### Token Generation (for testing)

```typescript
import { generateToken } from './middleware/auth.middleware';

const token = generateToken('user-123');
console.log('JWT Token:', token);
```

## 🛡️ Security

### Rate Limiting

Protection against abuse and DDoS attacks:

- **General API**: 10 requests/minute per IP
- **Write Operations**: 5 requests/minute per IP
- **Per User**: 100 requests/hour per authenticated user

### Input Validation

All inputs are validated and sanitized:

```typescript
// Example: Create review validation
{
  rating: 1-5 (required),
  comment: max 1000 characters, XSS sanitized,
  authorName: max 100 characters, XSS sanitized
}
```

### CORS Configuration

Configurable CORS origins via environment variables:

```bash
CORS_ORIGIN=http://localhost:3000,https://your-domain.com
```

### Security Headers

Helmet.js provides security headers:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

### XSS Protection

All user inputs are sanitized to prevent XSS attacks:

```typescript
// HTML tags are stripped from comments and names
input: "<script>alert('xss')</script>Great product!"
output: "Great product!"
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.middleware.test.ts

# Run in watch mode
npm test -- --watch
```

### Test Structure

```typescript
// Example: Integration test
describe('POST /api/products/:productId/reviews', () => {
  const token = generateToken('test-user');

  it('should create review with valid data', async () => {
    const response = await request(app)
      .post('/api/products/test-product/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        rating: 5,
        comment: 'Excellent!',
        authorName: 'Test User'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
  });
});
```

### Test Coverage

Current coverage: **87.89%**

```
File                       | % Stmts | % Branch | % Funcs | % Lines
---------------------------|---------|----------|---------|--------
All files                  |   87.89 |    71.56 |   85.18 |   87.41
 controllers               |   97.72 |    76.92 |     100 |   97.72
 middleware                |   88.17 |       64 |   81.25 |    87.2
 routes                    |     100 |      100 |     100 |     100
 services                  |   92.94 |    89.28 |     100 |    92.5
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```bash
# Server Configuration
PORT=8080
NODE_ENV=development

# CommerceTools Configuration
CTP_PROJECT_KEY=your-project-key
CTP_CLIENT_ID=your-client-id
CTP_CLIENT_SECRET=your-client-secret
CTP_API_URL=https://api.europe-west1.gcp.commercetools.com
CTP_AUTH_URL=https://auth.europe-west1.gcp.commercetools.com
CTP_SCOPES=manage_project,view_products,manage_orders

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8080

# Logging
LOG_LEVEL=info
```

### Configuration Object

```typescript
// src/config/index.ts
export const config = {
  port: 8080,
  nodeEnv: 'development',
  commerceTools: {
    projectKey: 'your-project',
    clientId: 'your-client-id',
    clientSecret: 'your-secret',
    // ...
  },
  jwt: {
    secret: 'your-secret',
    expiresIn: '24h'
  },
  rateLimit: {
    windowMs: 60000,
    maxRequests: 10
  },
  review: {
    maxCommentLength: 1000,
    minRating: 1,
    maxRating: 5,
    maxAuthorNameLength: 100
  }
};
```

## 🔒 GDPR Compliance

### Data Minimization

Only essential data is stored and exposed:

```typescript
interface Review {
  id: string;              // Required
  productId: string;       // Required
  rating: number;          // Required (1-5)
  comment?: string;        // Optional, max 1000 chars
  authorName?: string;     // Optional, anonymized display name only
  createdAt: Date;         // Required
  isVerifiedPurchase?: boolean;
}
```

### Personal Data Protection

- ❌ No email addresses exposed
- ❌ No full names stored
- ❌ No personal identifiable information in responses
- ✅ Only anonymized display names (e.g., "John D.")
- ✅ All logs exclude personal data

### Audit Logs

All sensitive operations are logged:

```typescript
auditLogger.info('Review created', {
  reviewId: 'review-123',
  productId: 'prod-456',
  userId: 'user-789',
  rating: 5,
  ip: '192.168.1.1'
});
```

### Data Retention

Configure data retention policies in production:

```typescript
// Example: Automatically delete reviews older than 2 years
// Implement in production based on GDPR requirements
```

## 📊 Monitoring

### Health Checks

```bash
# Application health
curl http://localhost:8080/health

# CommerceTools connection health
curl http://localhost:8080/api/reviews/health
```

### Logs

Structured logging with Winston:

```typescript
// Application logs
logger.info('Message', { context: 'data' });
logger.warn('Warning', { context: 'data' });
logger.error('Error', { error, context: 'data' });

// Audit logs
auditLogger.info('Sensitive operation', {
  userId: 'user-123',
  action: 'create_review',
  ip: '192.168.1.1'
});
```

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] Set strong JWT secret
- [ ] Configure CommerceTools credentials
- [ ] Set appropriate rate limits
- [ ] Configure CORS origins
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure monitoring
- [ ] Set up error tracking
- [ ] Configure log aggregation
- [ ] Review security headers
- [ ] Test backup/restore procedures

### Performance Optimization

```typescript
// Enable compression
import compression from 'compression';
app.use(compression());

// Add caching headers
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  next();
});
```

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.
