# Integration Guide - Vue.js Ratings & Reviews Components

## 🎯 Overview

This guide provides comprehensive instructions for integrating the Vue.js Ratings & Reviews components into your application.

## 📦 Installation Methods

### Method 1: NPM Package (Recommended)

```bash
npm install ratings-reviews-frontend
```

### Method 2: Local Development

```bash
cd frontend
npm install
npm run dev
```

### Method 3: CDN (Browser)

```html
<link rel="stylesheet" href="https://unpkg.com/ratings-reviews-frontend/dist/ratings-reviews-frontend.css">
<script type="module">
  import { RatingCompact } from 'https://unpkg.com/ratings-reviews-frontend/dist/ratings-reviews.es.js';
  // Use components
</script>
```

## 🚀 Quick Integration Examples

### Example 1: Product List Page (PLP)

Display compact ratings on product tiles:

```vue
<template>
  <div class="product-grid">
    <div v-for="product in products" :key="product.id" class="product-card">
      <img :src="product.image" :alt="product.name" />
      <h3>{{ product.name }}</h3>
      <p>{{ product.price }}</p>
      
      <!-- Compact rating display -->
      <RatingCompact
        :product-id="product.id"
        :average-rating="product.rating"
        :total-reviews="product.reviewCount"
      />
    </div>
  </div>
</template>

<script setup>
import { RatingCompact } from 'ratings-reviews-frontend';

const products = ref([
  { id: 'prod-1', name: 'Product 1', price: '$99', rating: 4.5, reviewCount: 42 },
  // ... more products
]);
</script>
```

### Example 2: Product Detail Page (PDP)

Full reviews display with rating summary:

```vue
<template>
  <div class="product-detail">
    <div class="product-info">
      <h1>{{ product.name }}</h1>
      <p>{{ product.description }}</p>
      <button @click="addToCart">Add to Cart</button>
    </div>

    <!-- Compact rating in header -->
    <RatingCompact
      :product-id="product.id"
      :average-rating="product.rating"
      :total-reviews="product.reviewCount"
    />

    <!-- Full reviews section -->
    <section id="reviews">
      <ReviewsList
        :product-id="product.id"
        :page-size="10"
        :show-summary="true"
        @reviews-loaded="handleReviewsLoaded"
      />
    </section>

    <!-- Review form button -->
    <ReviewFormButton
      :product-id="product.id"
      :auth-token="userToken"
      @submitted="handleReviewSubmitted"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RatingCompact, ReviewsList, ReviewFormButton } from 'ratings-reviews-frontend';

const product = ref({
  id: 'prod-123',
  name: 'Amazing Product',
  rating: 4.5,
  reviewCount: 42,
});

const userToken = ref('user-jwt-token');

const handleReviewsLoaded = (reviews) => {
  console.log(`Loaded ${reviews.length} reviews`);
};

const handleReviewSubmitted = (reviewId) => {
  console.log('Review submitted:', reviewId);
  // Refresh reviews list
};
</script>
```

### Example 3: Vue 3 Composition API

Using composables for direct API access:

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { useReviewsApi } from 'ratings-reviews-frontend';

const productId = 'prod-123';
const { loading, error, getProductRating, getProductReviews } = useReviewsApi();

const rating = ref(null);
const reviews = ref([]);

onMounted(async () => {
  // Fetch rating
  rating.value = await getProductRating(productId);
  
  // Fetch reviews
  const result = await getProductReviews(productId, 1, 10);
  if (result) {
    reviews.value = result.reviews;
  }
});
</script>

<template>
  <div>
    <div v-if="loading === 'loading'">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <p>Rating: {{ rating?.averageRating }} / 5</p>
      <ul>
        <li v-for="review in reviews" :key="review.id">
          {{ review.comment }}
        </li>
      </ul>
    </div>
  </div>
</template>
```

## 🌐 Web Components Integration

For use in non-Vue applications:

### Step 1: Convert to Web Components

```typescript
// custom-elements.ts
import { defineCustomElement } from 'vue';
import RatingCompact from './components/RatingCompact.vue';
import ReviewsList from './components/ReviewsList.vue';
import ReviewFormButton from './components/ReviewFormButton.vue';

// Define custom elements
const RatingCompactElement = defineCustomElement(RatingCompact);
const ReviewsListElement = defineCustomElement(ReviewsList);
const ReviewFormButtonElement = defineCustomElement(ReviewFormButton);

// Register custom elements
customElements.define('rating-compact', RatingCompactElement);
customElements.define('reviews-list', ReviewsListElement);
customElements.define('review-form-button', ReviewFormButtonElement);
```

### Step 2: Use in HTML

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/dist/ratings-reviews-frontend.css">
</head>
<body>
  <!-- Use as web components -->
  <rating-compact
    product-id="prod-123"
    average-rating="4.5"
    total-reviews="42"
  ></rating-compact>

  <reviews-list
    product-id="prod-123"
    page-size="10"
  ></reviews-list>

  <review-form-button
    product-id="prod-123"
  ></review-form-button>

  <script type="module" src="/dist/custom-elements.js"></script>
</body>
</html>
```

### Step 3: React Integration

```jsx
import { useEffect, useRef } from 'react';

function ProductRating({ productId, rating, reviewCount }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.productId = productId;
      ref.current.averageRating = rating;
      ref.current.totalReviews = reviewCount;
    }
  }, [productId, rating, reviewCount]);

  return <rating-compact ref={ref}></rating-compact>;
}
```

## 🎨 Styling and Theming

### Custom CSS Variables

```css
:root {
  /* Colors */
  --rating-star-color: #ffc107;
  --rating-star-empty: #e0e0e0;
  --rating-text-color: #333;
  --rating-bg-color: #fff;
  
  /* Spacing */
  --rating-gap: 0.5rem;
  --rating-padding: 1rem;
  
  /* Typography */
  --rating-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --rating-font-size: 1rem;
}
```

### Component-Specific Styling

```css
/* Override RatingCompact styles */
.rating-compact {
  --star-color: #ff9800;
  font-size: 0.875rem;
}

/* Override ReviewsList styles */
.reviews-list {
  --primary-color: #2196f3;
  --border-radius: 12px;
}

/* Override ReviewFormButton styles */
.review-form-button {
  --button-bg: #4caf50;
  --button-text: #fff;
}
```

## 🔌 API Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=https://your-api.example.com
```

### Runtime Configuration

```typescript
// Configure API base URL at runtime
import { useReviewsApi } from 'ratings-reviews-frontend';

const api = useReviewsApi();
// API calls will use the configured base URL
```

## 📡 Backend API Integration

The components expect the following API endpoints:

### GET /api/products/:productId/rating

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

### GET /api/products/:productId/reviews

Query parameters: `page`, `limit`, `rating`, `verified`, `sortBy`, `sortOrder`

Response:
```json
{
  "success": true,
  "data": {
    "reviews": [...],
    "total": 42,
    "page": 1,
    "limit": 10,
    "hasMore": true
  }
}
```

### POST /api/products/:productId/reviews

Request body:
```json
{
  "rating": 5,
  "comment": "Great product!",
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
    "comment": "Great product!",
    "authorName": "John D.",
    "createdAt": "2024-01-20T10:00:00Z",
    "isVerifiedPurchase": false
  }
}
```

## 🧪 Testing Your Integration

### Unit Testing

```typescript
import { mount } from '@vue/test-utils';
import { RatingCompact } from 'ratings-reviews-frontend';

describe('Integration Test', () => {
  it('renders rating in product card', () => {
    const wrapper = mount(RatingCompact, {
      props: {
        productId: 'prod-123',
        averageRating: 4.5,
        totalReviews: 42,
      },
    });

    expect(wrapper.text()).toContain('4.5');
    expect(wrapper.text()).toContain('42');
  });
});
```

### E2E Testing with Playwright

```typescript
import { test, expect } from '@playwright/test';

test('reviews component displays correctly', async ({ page }) => {
  await page.goto('/product/prod-123');
  
  // Check rating display
  await expect(page.locator('.rating-compact')).toBeVisible();
  await expect(page.locator('.rating-compact__rating')).toContainText('4.5');
  
  // Open review form
  await page.click('text=Write a Review');
  await expect(page.locator('.review-modal')).toBeVisible();
  
  // Fill and submit review
  await page.click('.review-form__star-btn:nth-child(5)'); // 5 stars
  await page.fill('textarea', 'Great product!');
  await page.check('input[type="checkbox"]'); // GDPR consent
  await page.click('button[type="submit"]');
});
```

## 🐛 Troubleshooting

### Issue: Components not rendering

**Solution**: Ensure Vue 3 is properly installed and components are imported correctly.

```typescript
// Correct import
import { RatingCompact } from 'ratings-reviews-frontend';

// Incorrect
import RatingCompact from 'ratings-reviews-frontend'; // Missing named export
```

### Issue: Styles not applied

**Solution**: Import the CSS file in your main entry point:

```typescript
// main.ts
import 'ratings-reviews-frontend/dist/ratings-reviews-frontend.css';
```

### Issue: API calls failing

**Solution**: Check CORS configuration and API base URL:

```typescript
// Verify API base URL
console.log(import.meta.env.VITE_API_BASE_URL);

// Check browser console for CORS errors
// Configure backend CORS to allow your domain
```

### Issue: TypeScript errors

**Solution**: Ensure TypeScript definitions are available:

```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

## 📚 Additional Resources

- [Component API Documentation](./docs/COMPONENTS.md)
- [Backend API Documentation](../backend/README.md)
- [Accessibility Guidelines](./docs/ACCESSIBILITY.md)
- [Performance Optimization](./docs/PERFORMANCE.md)

## 💬 Support

For issues and questions:
- GitHub Issues: https://github.com/Gallad51/POC-Rating-and-review-CommerceTools/issues
- Documentation: https://github.com/Gallad51/POC-Rating-and-review-CommerceTools

## 📝 Examples Repository

Find more examples at: https://github.com/Gallad51/POC-Rating-and-review-CommerceTools/tree/main/frontend/examples
