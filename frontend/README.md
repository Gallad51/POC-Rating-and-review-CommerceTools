# Vue.js Components Documentation

## 📦 Ratings & Reviews Microfrontend Components

This package provides Vue.js 3 components for displaying and managing product ratings and reviews. Built with TypeScript, fully accessible, and optimized for microfrontend architecture.

## 🚀 Quick Start

### Installation

```bash
npm install ratings-reviews-frontend
```

### Basic Usage

```vue
<script setup>
import { RatingCompact, ReviewsList, ReviewFormButton } from 'ratings-reviews-frontend';
</script>

<template>
  <div>
    <!-- Compact rating display for product tiles -->
    <RatingCompact
      product-id="prod-123"
      :average-rating="4.5"
      :total-reviews="42"
    />

    <!-- Full reviews list for product detail page -->
    <ReviewsList
      product-id="prod-123"
      :page-size="10"
    />

    <!-- Review submission button with modal form -->
    <ReviewFormButton
      product-id="prod-123"
      @submitted="handleReviewSubmitted"
    />
  </div>
</template>
```

## 📚 Components

### 1. RatingCompact

Compact rating display suitable for product tiles in PLP (Product List Page).

[View full component documentation](#ratingcompact-component)

### 2. ReviewsList

Complete reviews display with rating summary, filters, sorting, and pagination for PDP.

[View full component documentation](#reviewslist-component)

### 3. ReviewFormButton

Button that opens a modal form for submitting new reviews with GDPR compliance.

[View full component documentation](#reviewformbutton-component)

## 🔧 Development

### Run Development Server

```bash
npm run dev
```

Opens interactive demo at `http://localhost:5173`

### Build

#### For Docker/Production (Demo App)
```bash
npm run build
```
Builds the Vue.js demo application to `dist/`.

#### For Library Distribution
```bash
npm run build:lib
```
Creates ES and UMD modules in `dist/` for NPM distribution.

### Backend Integration

The demo server proxies API requests to the backend service:

- Frontend requests: `/api/products/:productId/rating`
- Backend URL configured via `BACKEND_URL` environment variable
- Server proxies to: `${BACKEND_URL}/api/products/:productId/rating`

**Environment Variables**:
- `BACKEND_URL`: Backend service URL (e.g., `https://backend-service.run.app`)
- `PORT`: Server port (default: 8080)

**API Endpoints** (proxied):
- `GET /api/products/:productId/rating` - Get rating summary
- `GET /api/products/:productId/reviews` - Get paginated reviews
- `POST /api/products/:productId/reviews` - Submit new review
```
Builds the Vue.js demo application to `dist/` directory.

#### For NPM Package (Library Mode)
```bash
npm run build:lib
```
Builds the components as a library (ES/UMD modules).

### Run Tests

```bash
npm test
```

### Environment Variables

For production deployment, the frontend server proxies API requests to the backend:

- `BACKEND_URL` - Backend service URL (default: `http://localhost:8080`)
- `PORT` - Server port (default: `8080`)

## 📖 Full Documentation

See [COMPONENTS.md](./docs/COMPONENTS.md) for complete component API documentation.

## 🌐 Demo

Access the live demo application at: `http://localhost:5173` (after running `npm run dev`)

## 📝 License

MIT
