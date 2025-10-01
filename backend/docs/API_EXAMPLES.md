# API Examples

Complete examples for using the Ratings & Reviews API.

## Table of Contents

- [Authentication Examples](#authentication-examples)
- [Review Examples](#review-examples)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Authentication Examples

### Using cURL

```bash
# Login to get JWT token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123"}'

# Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h",
    "userId": "user-123"
  }
}
```

### Using JavaScript

```javascript
// Login
async function login(userId) {
  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const data = await response.json();
  return data.data.token;
}

// Create review with authentication
async function createReviewWithAuth(productId, reviewData, userId) {
  const token = await login(userId);
  
  const response = await fetch(
    `http://localhost:8080/api/products/${productId}/reviews`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    }
  );
  
  return response.json();
}

// Usage
const review = await createReviewWithAuth(
  'prod-123',
  { rating: 5, comment: 'Great!' },
  'user-123'
);
```

## Review Examples

### Get Product Rating

```javascript
async function getProductRating(productId) {
  const response = await fetch(
    `http://localhost:8080/api/products/${productId}/rating`
  );
  return response.json();
}

const rating = await getProductRating('prod-123');
console.log(`Average: ${rating.data.averageRating}/5`);
console.log(`Total: ${rating.data.totalReviews} reviews`);
```

### Get Product Reviews with Filters

```javascript
async function getProductReviews(productId, filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });

  const response = await fetch(
    `http://localhost:8080/api/products/${productId}/reviews?${params}`
  );
  return response.json();
}

// Get 5-star verified reviews, sorted by date
const reviews = await getProductReviews('prod-123', {
  rating: 5,
  verified: true,
  sortBy: 'date',
  sortOrder: 'desc',
  page: 1,
  limit: 10
});
```

### React Component Example

```typescript
import React, { useState } from 'react';

function ReviewForm({ productId, token }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Submitting...');

    try {
      const response = await fetch(
        `http://localhost:8080/api/products/${productId}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ rating, comment }),
        }
      );

      if (response.ok) {
        setStatus('Review submitted!');
        setRating(5);
        setComment('');
      } else {
        const error = await response.json();
        setStatus(`Error: ${error.error}`);
      }
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
        {[1, 2, 3, 4, 5].map(n => (
          <option key={n} value={n}>{'⭐'.repeat(n)}</option>
        ))}
      </select>
      <textarea 
        value={comment} 
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        placeholder="Write your review..."
      />
      <button type="submit">Submit Review</button>
      {status && <p>{status}</p>}
    </form>
  );
}
```

## Error Handling

### Validation Errors (400)

```javascript
try {
  await createReview('prod-123', { rating: 6 }, token);
} catch (error) {
  // Response: 400 Bad Request
  // {
  //   "error": "Validation failed",
  //   "details": [{
  //     "field": "rating",
  //     "message": "Rating must be between 1 and 5"
  //   }]
  // }
}
```

### Authentication Errors (401)

```javascript
// Missing or invalid token
// Response: 401 Unauthorized
// { "error": "No authorization header provided" }
// { "error": "Invalid token" }
// { "error": "Token expired" }
```

### Rate Limiting (429)

```javascript
// Too many requests
// Response: 429 Too Many Requests
// { "error": "Too many requests, please try again later", "retryAfter": 60 }

// Handle rate limits with retry
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);
    if (response.status !== 429) return response;
    
    const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
  }
  throw new Error('Max retries exceeded');
}
```

## Rate Limiting

### Limits

- **General API**: 10 requests/minute per IP
- **Write Operations**: 5 requests/minute per IP  
- **Per User**: 100 requests/hour per authenticated user

### Best Practices

```javascript
// 1. Implement exponential backoff
async function withBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
        continue;
      }
      throw error;
    }
  }
}

// 2. Cache responses when possible
const cache = new Map();

async function getCachedRating(productId) {
  const key = `rating-${productId}`;
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const rating = await getProductRating(productId);
  cache.set(key, rating);
  
  // Clear after 5 minutes
  setTimeout(() => cache.delete(key), 5 * 60 * 1000);
  
  return rating;
}

// 3. Batch requests when possible
async function getMultipleRatings(productIds) {
  const delay = 100; // 100ms between requests
  const ratings = [];
  
  for (const productId of productIds) {
    ratings.push(await getProductRating(productId));
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  return ratings;
}
```
