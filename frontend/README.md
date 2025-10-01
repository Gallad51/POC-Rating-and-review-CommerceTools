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

```bash
npm run build
```

### Run Tests

```bash
npm test
```

## 📖 Full Documentation

See [COMPONENTS.md](./docs/COMPONENTS.md) for complete component API documentation.

## 🌐 Demo

Access the live demo application at: `http://localhost:5173` (after running `npm run dev`)

## 📝 License

MIT
