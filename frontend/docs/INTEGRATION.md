# Integration Guide - Web Components for Ratings & Reviews

## 🎯 Overview

This guide provides comprehensive instructions for integrating the **native Web Components** for Ratings & Reviews into any website. These components work with **any framework or plain HTML** - no Vue.js required!

## 📦 Installation Methods

### Method 1: Direct Download (Recommended for Most Use Cases)

1. Download the `ratings-reviews-components.es.js` (or `.umd.js` or `.iife.js`) from the releases
2. Place it in your website's static assets directory
3. Include it in your HTML

```html
<script type="module" src="/path/to/ratings-reviews-components.es.js"></script>
```

### Method 2: NPM Package

```bash
npm install ratings-reviews-frontend
```

Then import in your JavaScript:

```javascript
import 'ratings-reviews-frontend';
// Or specify the exact file:
import 'ratings-reviews-frontend/dist/ratings-reviews-components.es.js';
```

### Method 3: CDN (Browser)

```html
<script type="module" src="https://unpkg.com/ratings-reviews-frontend/dist/ratings-reviews-components.es.js"></script>
```

## 🚀 Quick Integration Examples

### Example 1: Plain HTML Website

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Product Page</title>
</head>
<body>
  <h1>Amazing Product</h1>
  
  <!-- Rating display -->
  <rating-compact 
    product-id="prod-123"
    auto-fetch="true"
  ></rating-compact>
  
  <!-- Reviews list -->
  <reviews-list 
    product-id="prod-123"
    page-size="10"
  ></reviews-list>
  
  <!-- Write review button -->
  <review-form-button 
    product-id="prod-123"
    button-text="Write a Review"
  ></review-form-button>

  <!-- Load the Web Components -->
  <script type="module" src="/js/ratings-reviews-components.es.js"></script>
</body>
</html>
```

### Example 2: React Integration

Web Components work seamlessly in React:

```jsx
import React from 'react';

export function ProductPage({ productId }) {
  return (
    <div>
      <h1>Product Details</h1>
      
      {/* Use Web Components directly in JSX */}
      <rating-compact 
        product-id={productId}
        auto-fetch="true"
      />
      
      <reviews-list 
        product-id={productId}
        page-size={10}
      />
      
      <review-form-button 
        product-id={productId}
        button-text="Add Your Review"
      />
    </div>
  );
}
```

Note: Make sure to import the Web Components in your main entry file:

```javascript
// index.js or App.js
import 'ratings-reviews-frontend/dist/ratings-reviews-components.es.js';
```

### Example 3: Angular Integration

```typescript
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import 'ratings-reviews-frontend/dist/ratings-reviews-components.es.js';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // ... other config
})
export class AppModule { }
```

```html
<!-- product.component.html -->
<div>
  <h1>Product Details</h1>
  
  <rating-compact 
    [attr.product-id]="productId"
    auto-fetch="true">
  </rating-compact>
  
  <reviews-list 
    [attr.product-id]="productId"
    [attr.page-size]="10">
  </reviews-list>
  
  <review-form-button 
    [attr.product-id]="productId"
    button-text="Write Review">
  </review-form-button>
</div>
```

### Example 4: Vue.js Integration

```vue
<template>
  <div>
    <h1>Product Details</h1>
    
    <rating-compact 
      :product-id="productId"
      auto-fetch="true"
    />
    
    <reviews-list 
      :product-id="productId"
      :page-size="10"
    />
    
    <review-form-button 
      :product-id="productId"
      button-text="Write Review"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Import Web Components in main.ts or App.vue
import 'ratings-reviews-frontend/dist/ratings-reviews-components.es.js';

const productId = ref('prod-123');
</script>
```

## 📋 Component Reference

### `<rating-compact>` Component

Compact rating display perfect for product lists and tiles.

**Attributes:**

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `product-id` | String | Yes | - | Product identifier |
| `auto-fetch` | String | No | `"false"` | Automatically fetch rating from API |
| `average-rating` | String | No | - | Pre-set average rating (0-5) |
| `total-reviews` | String | No | - | Pre-set total review count |
| `empty-text` | String | No | `"No reviews yet"` | Text shown when no reviews |
| `compact` | String | No | `"false"` | Show minimal version |

**Example:**

```html
<!-- Fetch from API -->
<rating-compact 
  product-id="prod-123"
  auto-fetch="true"
></rating-compact>

<!-- With preset values -->
<rating-compact 
  product-id="prod-123"
  average-rating="4.5"
  total-reviews="42"
></rating-compact>
```

### `<reviews-list>` Component

Full reviews display with filtering, sorting, and pagination.

**Attributes:**

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `product-id` | String | Yes | - | Product identifier |
| `page-size` | String | No | `"10"` | Reviews per page |
| `sort-by` | String | No | `"newest"` | Default sort: `newest`, `helpful`, `highest`, `lowest` |

**Example:**

```html
<reviews-list 
  product-id="prod-123"
  page-size="5"
  sort-by="helpful"
></reviews-list>
```

### `<review-form-button>` Component

Button that opens a modal form for submitting reviews.

**Attributes:**

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `product-id` | String | Yes | - | Product identifier |
| `button-text` | String | No | `"Write a Review"` | Button label text |
| `user-token` | String | No | - | Authentication token |

**Example:**

```html
<review-form-button 
  product-id="prod-123"
  button-text="Share Your Experience"
></review-form-button>
```

## 🎨 Styling and Theming

Web Components use Shadow DOM, which encapsulates styles. However, you can still customize the appearance using CSS custom properties (CSS variables).

### Available CSS Variables

The components expose these CSS variables that you can override:

```css
rating-compact {
  --rating-star-color: #ffc107;
  --rating-star-empty-color: #e0e0e0;
  --rating-text-color: #333;
  --rating-count-color: #666;
}

reviews-list {
  --reviews-primary-color: #667eea;
  --reviews-text-color: #333;
  --reviews-border-color: #e0e0e0;
  --reviews-star-color: #ffc107;
}

review-form-button {
  --button-bg-color: #667eea;
  --button-text-color: white;
  --button-hover-bg: #5568d3;
}
```

### Example Customization

```html
<style>
  rating-compact {
    --rating-star-color: #ff6b6b;
    --rating-text-color: #2d3748;
  }
  
  review-form-button {
    --button-bg-color: #48bb78;
    --button-hover-bg: #38a169;
  }
</style>

<rating-compact product-id="prod-123"></rating-compact>
<review-form-button product-id="prod-123"></review-form-button>
```

## 🔌 API Configuration

### Environment Variables

The components automatically connect to the backend API. Configure the API endpoint:

**For Development:**
```bash
# .env file
VITE_API_BASE_URL=http://localhost:8080
```

**For Production:**

Set the environment variable on your hosting platform:
```bash
VITE_API_BASE_URL=https://your-api.example.com
```

### CORS Configuration

Ensure your backend API has CORS enabled for the domains where you'll use the Web Components:

```javascript
// Backend CORS config example
app.use(cors({
  origin: [
    'https://your-website.com',
    'http://localhost:5173'
  ]
}));
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
