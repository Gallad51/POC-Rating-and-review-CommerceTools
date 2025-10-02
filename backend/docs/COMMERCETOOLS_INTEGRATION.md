# CommerceTools Integration Implementation

## Overview

The backend now includes a full integration with CommerceTools API, with automatic fallback to mock mode when credentials are not available.

## Key Features

### Dual Mode Operation

The service automatically detects whether to use:

1. **Real API Mode**: When valid CommerceTools credentials are configured
2. **Mock Mode**: When credentials are missing or in test environment

### Implementation Details

#### Service Architecture

The `CommerceToolsService` class (`backend/src/services/commercetools.service.ts`) now includes:

- **Client Initialization**: Automatic setup of CommerceTools SDK client with OAuth2 authentication
- **Mode Detection**: Smart detection of available credentials and environment
- **Dual Implementations**: Separate methods for API and mock operations
- **Error Handling**: Graceful fallback and error recovery

#### Supported Operations

All operations work in both modes:

1. **Get Product Rating**: Fetches aggregated rating and distribution
2. **Get Product Reviews**: Paginated reviews with filtering and sorting
3. **Create Review**: Creates new reviews with validation
4. **Health Check**: Verifies API connection (real connection test in API mode)

#### API Integration Features

- OAuth2 client credentials flow for authentication
- Automatic token refresh via SDK middleware
- Query building for filtering and pagination
- Error handling with specific error types (duplicate reviews, validation errors)
- Logging of all API operations

### Configuration

The service uses environment variables from `backend/src/config/index.ts`:

```typescript
commerceTools: {
  projectKey: process.env.CTP_PROJECT_KEY,
  clientId: process.env.CTP_CLIENT_ID,
  clientSecret: process.env.CTP_CLIENT_SECRET,
  apiUrl: process.env.CTP_API_URL,
  authUrl: process.env.CTP_AUTH_URL,
  scopes: process.env.CTP_SCOPES?.split(','),
}
```

### E2E Testing

#### Test Suite

New E2E test suite (`backend/src/services/commercetools.e2e.test.ts`) includes:

- **Health Check Tests**: Verify API connectivity
- **Product Rating Tests**: Validate rating calculations and distributions
- **Product Reviews Tests**: Test pagination, filtering, and sorting
- **Create Review Tests**: Validate review creation and duplicate prevention
- **Error Handling Tests**: Test graceful error handling

#### Running E2E Tests

Tests automatically skip if credentials are not available.

**With npm:**
```bash
cd backend
npm run test:e2e
```

**With environment variables:**
```bash
export CTP_PROJECT_KEY=your-project-key
export CTP_CLIENT_ID=your-client-id
export CTP_CLIENT_SECRET=your-client-secret
export TEST_PRODUCT_ID=your-test-product-id  # Optional
cd backend
npm run test:e2e
```

**With script:**
```bash
cd backend
CTP_PROJECT_KEY=xxx CTP_CLIENT_ID=xxx CTP_CLIENT_SECRET=xxx bash scripts/run-e2e-tests.sh
```

#### Test Requirements

For E2E tests to run against real API:

1. Valid CommerceTools credentials must be set
2. A test product must exist in your project
3. Appropriate scopes must be configured (`view_products`, `manage_project`)

### Mode Detection Logic

The service determines which mode to use:

```typescript
private shouldUseMockMode(): boolean {
  // Use mock if credentials missing
  if (!projectKey || !clientId || !clientSecret) {
    return true;
  }
  
  // Use mock in test environment
  if (config.nodeEnv === 'test') {
    return true;
  }
  
  return false;
}
```

### Benefits

1. **Development Friendly**: Works without credentials for local development
2. **Production Ready**: Full API integration when credentials are available
3. **Test Friendly**: Automatically uses mocks in test environment
4. **Zero Downtime**: Graceful fallback if API is unavailable
5. **Transparent**: Same interface regardless of mode

## Usage Examples

### In Development (No Credentials)

```typescript
// Service automatically uses mock mode
const rating = await commerceToolsService.getProductRating('product-123');
// Returns mock data
```

### In Production (With Credentials)

```bash
# Set credentials in environment
export CTP_PROJECT_KEY=your-project
export CTP_CLIENT_ID=your-client-id
export CTP_CLIENT_SECRET=your-secret

# Start server
npm start
```

```typescript
// Service automatically uses real API
const rating = await commerceToolsService.getProductRating('product-123');
// Returns data from CommerceTools API
```

### Mode Logging

The service logs its mode at initialization:

```
info: CommerceTools service initialized in MOCK mode
// or
info: CommerceTools service initialized in REAL API mode
info: CommerceTools API client initialized successfully
```

## API Operations

### Get Product Rating

**Mock Mode**: Returns calculated rating from mock storage

**API Mode**: Queries CommerceTools for reviews and calculates:
- Average rating
- Total review count
- Rating distribution (1-5 stars)

### Get Product Reviews

**Mock Mode**: Returns paginated mock reviews with filtering

**API Mode**: Queries CommerceTools with:
- Pagination (offset/limit)
- Filtering by rating
- Sorting by date or rating
- Filtering by verified purchases (post-fetch)

### Create Review

**Mock Mode**: Stores in memory with duplicate detection

**API Mode**: Creates review via CommerceTools API with:
- Duplicate detection via `uniquenessValue`
- Full validation
- Automatic timestamps
- Review versioning

### Health Check

**Mock Mode**: Returns `true` if service is initialized

**API Mode**: Makes actual API call to verify connectivity

## Error Handling

The service handles various error scenarios:

1. **Missing Credentials**: Automatic fallback to mock mode
2. **API Connection Errors**: Logged and returned as failures
3. **Duplicate Reviews**: Specific error message
4. **Validation Errors**: Clear error messages
5. **Network Errors**: Graceful handling with retries (via SDK)

## Security Notes

- Client credentials are never logged
- API client uses secure OAuth2 flow
- Scopes are properly restricted
- No credentials in mock mode

## Future Enhancements

Possible improvements:

1. Product existence validation
2. Review moderation workflows
3. Batch operations for bulk imports
4. Caching layer for frequently accessed data
5. Webhooks for real-time updates
6. Advanced analytics queries

## Testing Strategy

### Unit Tests
- Test mock mode operations
- Test validation logic
- Test error handling

### Integration Tests  
- Test with mocked CommerceTools SDK
- Test mode switching logic
- Test fallback scenarios

### E2E Tests
- Test against real CommerceTools API
- Test full workflows
- Test error scenarios

## Documentation

- [CommerceTools Setup Guide](../../../docs/COMMERCETOOLS_SETUP.md)
- [API Documentation](../docs/API_EXAMPLES.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)

## Support

For issues with the integration:

1. Check logs for mode indication
2. Verify credentials are set correctly
3. Check CommerceTools API status
4. Review error messages in logs
5. Run E2E tests to validate setup
