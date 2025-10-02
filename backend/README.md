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
- [Deployment](#deployment)
- [CI/CD](#cicd)
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

> **Note**: For CommerceTools credentials setup, see [../docs/COMMERCETOOLS_SETUP.md](../docs/COMMERCETOOLS_SETUP.md)

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
Content-Type: application/json

{
  "rating": 5,
  "comment": "Great product! Highly recommended.",
  "authorName": "John D."
}
```

**Note**: For POC purposes, authentication is disabled. The backend uses mock authentication to allow anonymous review submissions. For production deployment, replace `mockAuth` with `authenticate` middleware in `src/routes/review.routes.ts`.

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

### CommerceTools Integration

This backend integrates with CommerceTools API for product ratings and reviews.

📖 **[Complete CommerceTools Setup Guide](../docs/COMMERCETOOLS_SETUP.md)**

The guide provides:
- Step-by-step trial account creation
- API client setup with proper scopes
- Credential configuration options
- Testing and troubleshooting

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

**Quick start**: `cp .env.example .env` and edit with your credentials.

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

## 🚀 Deployment

### Prerequisites

Before deploying, ensure you have:

1. **Google Cloud Platform Account**
   - Project created with billing enabled
   - Required APIs enabled (Cloud Run, Container Registry)
   - Service account with appropriate permissions

2. **CommerceTools Account** (Production only)
   - Project created
   - API client with credentials

3. **GitHub Repository Secrets** (for CI/CD)
   - `GCP_SA_KEY` - Service account JSON key
   - `GCP_PROJECT_ID` - Your GCP project ID
   - Production secrets (optional): `CTP_PROJECT_KEY`, `CTP_CLIENT_ID`, `CTP_CLIENT_SECRET`, `JWT_SECRET`

### Quick Deploy

```bash
# Using Google Cloud Run
gcloud run deploy ratings-reviews-backend \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated
```

### Deployment Options

1. **CI/CD via GitHub Actions** (Recommended)
   - Automatic preview deployments for every PR
   - Automatic cleanup when PR is closed
   - See [CI/CD section](#cicd) below

2. **Manual Deployment**
   - Using `gcloud` CLI
   - Using Docker + Cloud Run
   - See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions

3. **Container Deployment**
   - Docker image available
   - Compatible with any container orchestration platform
   - Cloud Run, Kubernetes, ECS, etc.

### Required Environment Variables

**Minimum for Preview/Development:**
- `NODE_ENV` - Environment name (preview/development/production)
- `PORT` - Server port (auto-set by Cloud Run)

**Required for Production:**
- `CTP_PROJECT_KEY` - CommerceTools project key
- `CTP_CLIENT_ID` - CommerceTools client ID  
- `CTP_CLIENT_SECRET` - CommerceTools client secret
- `JWT_SECRET` - Strong random secret (min 32 characters)

**Optional:**
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per minute (default: 10)
- `CORS_ORIGIN` - Allowed origins (default: *)
- `LOG_LEVEL` - Logging level (default: info)

### Complete Deployment Guide

For comprehensive deployment instructions including:
- Step-by-step GCP setup
- GitHub Actions configuration
- Secret management
- Environment variables
- Monitoring setup
- Troubleshooting

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

## 🔄 CI/CD

This project includes automated CI/CD via GitHub Actions.

### Preview Deployments

**Automatic on every Pull Request:**

1. **Triggered by**: Opening, updating, or reopening a PR
2. **What happens**:
   - ✅ Code checkout
   - ✅ Install dependencies
   - ✅ Run tests (npm test)
   - ✅ Build application (npm run build)
   - ✅ Build Docker image
   - ✅ Push to Google Container Registry
   - ✅ Deploy to Cloud Run (preview environment)
   - ✅ Run health checks
   - ✅ Comment PR with deployment URLs

3. **Environment naming**: `pr-{number}-{branch-name}`
   - Backend: `ratings-reviews-backend-pr-123-feature-name`
   - Accessible at: `https://ratings-reviews-backend-pr-123-*.run.app`

4. **Auto-cleanup**: Preview environments are automatically deleted when PR is closed

### Required GitHub Secrets

Configure in **Settings > Secrets and variables > Actions**:

| Secret | Description | Required |
|--------|-------------|----------|
| `GCP_SA_KEY` | Service account JSON key | ✅ Yes |
| `GCP_PROJECT_ID` | Google Cloud project ID | ✅ Yes |

### Optional Repository Variables

Configure in **Settings > Secrets and variables > Actions > Variables**:

| Variable | Description | Default |
|----------|-------------|---------|
| `GCP_REGION` | Deployment region | `europe-west1` |

### Workflow Files

- **`.github/workflows/pr-preview.yml`** - PR preview deployments
- **`.github/workflows/pr-cleanup.yml`** - Cleanup on PR close

### CI/CD Features

✅ **Automatic Testing** - All tests run before deployment  
✅ **Isolated Environments** - Each PR gets its own environment  
✅ **Public URLs** - Direct access to preview deployments  
✅ **Health Checks** - Verifies deployment before marking success  
✅ **Auto Cleanup** - No manual cleanup needed  
✅ **Cost Efficient** - Scales to zero when not in use  

### Example PR Comment

After successful deployment, GitHub Actions posts:

```markdown
## 🚀 Preview Deployment Ready!

Your PR has been deployed to preview environments:

| Service | URL | Status |
|---------|-----|--------|
| 🔧 **Backend API** | https://backend-url.run.app | ✅ |

### Quick Links:
- 📊 [Backend Health](https://backend-url.run.app/health)
- 🔍 [API Documentation](https://backend-url.run.app/api-docs)
- 📈 [Test Endpoint](https://backend-url.run.app/api/products/test-product-1/rating)
```

### Local Development vs CI/CD

| Feature | Local Dev | CI/CD Preview | Production |
|---------|-----------|---------------|------------|
| CommerceTools | Mock | Mock | Real |
| Authentication | Mock JWT | Mock JWT | Real JWT |
| Environment | `development` | `preview` | `production` |
| Tests | Manual | Automatic | Automatic |
| Secrets | `.env` file | GitHub Secrets | Secret Manager |

### Customizing CI/CD

To modify the CI/CD workflow:

1. Edit `.github/workflows/pr-preview.yml`
2. Available options:
   - Change deployment region
   - Adjust resource limits (memory, CPU)
   - Add additional test steps
   - Configure custom environment variables
   - Add deployment notifications

Example customization:

```yaml
- name: Deploy backend to Cloud Run
  run: |
    gcloud run deploy ${{ steps.env.outputs.backend_service }} \
      --image gcr.io/${{ env.PROJECT_ID }}/backend:${{ steps.env.outputs.env_name }} \
      --memory 1Gi \              # Increase memory
      --cpu 2 \                   # Increase CPU
      --min-instances 1 \         # Keep warm
      --set-env-vars "CUSTOM_VAR=value"
```

For more details, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

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

## 📚 Additional Documentation

- **[CommerceTools Setup Guide](../docs/COMMERCETOOLS_SETUP.md)** - Integration guide
  - Trial account creation
  - API client setup
  - Configuration options
  - Troubleshooting

- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Complete deployment guide
  - Prerequisites and GCP setup
  - CI/CD configuration
  - Environment variables reference
  - Manual deployment instructions
  - Troubleshooting guide

- **[API_EXAMPLES.md](docs/API_EXAMPLES.md)** - Code examples
  - cURL commands
  - JavaScript/TypeScript examples
  - React component examples
  - Error handling patterns

- **[SECURITY_GDPR_CHECKLIST.md](docs/SECURITY_GDPR_CHECKLIST.md)** - Security checklist
  - 60+ security checkpoints
  - GDPR compliance requirements
  - Pre-production checklist
  - Security incident response

- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Implementation details
  - Complete feature list
  - Technical metrics
  - Architecture decisions
  - Next steps

- **JSON Schemas** - Data validation schemas
  - `docs/review-schema.json`
  - `docs/review-response-schema.json`
  - `docs/rating-response-schema.json`

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.
