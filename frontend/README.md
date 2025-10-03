# Web Components for Ratings & Reviews

## 📦 Native HTML Web Components - No Framework Required!

This package provides **native HTML Web Components** for displaying and managing product ratings and reviews. These components work in **any website** regardless of the framework you're using (React, Angular, Vue, vanilla HTML, etc.). Built with TypeScript, fully accessible, and optimized for microfrontend architecture.

## ✨ Why Web Components?

- **Framework-agnostic**: Works with any JavaScript framework or plain HTML
- **No dependencies**: No need to install Vue.js or any other framework
- **Easy integration**: Just include the script and use HTML tags
- **Encapsulated**: Styles and behavior are isolated using Shadow DOM
- **Native browser support**: Uses standard Web Components APIs

## 🚀 Quick Start

### Step 1: Include the Script

Add this to your HTML page:

```html
<script type="module" src="path/to/ratings-reviews-components.es.js"></script>
```

Or via CDN (Cloud Run hosted):

```html
<script type="module" src="https://ratings-reviews-frontend-[YOUR-ENV].run.app/ratings-reviews-components.es.js"></script>
```

> **Note**: Replace `[YOUR-ENV]` with your deployment environment. For PR previews, this will be automatically provided in the PR comment. For production, use your production Cloud Run URL.

### Step 2: Use the Components in Your HTML

```html
<!DOCTYPE html>
<html>
<body>
  <!-- Compact rating display for product tiles -->
  <rating-compact
    product-id="prod-123"
    auto-fetch="true"
  ></rating-compact>

  <!-- Full reviews list for product detail page -->
  <reviews-list
    product-id="prod-123"
    page-size="10"
  ></reviews-list>

  <!-- Review submission button with modal form -->
  <review-form-button
    product-id="prod-123"
    button-text="Write a Review"
  ></review-form-button>

  <script type="module" src="path/to/ratings-reviews-components.es.js"></script>
</body>
</html>
```

That's it! No build step, no framework installation, no complex setup.

## 📚 Components

### 1. `<rating-compact>`

Compact rating display suitable for product tiles in PLP (Product List Page).

**Attributes:**
- `product-id` - Product identifier (required)
- `auto-fetch` - Automatically fetch rating data from API
- `average-rating` - Pre-set average rating (0-5)
- `total-reviews` - Pre-set total review count
- `empty-text` - Custom text for no reviews state
- **`size`** - Size variant: `small`, `medium` (default), `large`
- **`theme`** - Theme variant: `light` (default), `dark`, `primary`, `secondary`
- **`display`** - Display style: `inline` (default), `block`, `minimal`
- **`show-rating`** - Show/hide rating number (default: `true`)
- **`show-count`** - Show/hide review count (default: `true`)
- **`star-style`** - Star style: `filled` (default), `outlined`
- **`rounding`** - Star rounding behavior: `floor`, `ceil`, `round`, `half` (default)
- **`star-color`** - Custom color for filled stars (CSS color)
- **`star-empty-color`** - Custom color for empty stars (CSS color)
- **`star-half-color`** - Custom color for half stars (CSS color)
- **`star-icon`** - Custom icon for filled stars (default: `★`)
- **`star-empty-icon`** - Custom icon for empty stars (default: `☆`)
- **`star-half-icon`** - Custom icon for half stars (default: `★`)

**Example:**
```html
<!-- Basic usage -->
<rating-compact product-id="prod-123" auto-fetch="true"></rating-compact>

<!-- With variants -->
<rating-compact 
  product-id="prod-123" 
  size="large" 
  theme="primary"
  display="block"
></rating-compact>

<!-- Custom rounding behavior -->
<rating-compact 
  average-rating="4.6"
  rounding="floor"
></rating-compact>

<!-- Custom colors and icons -->
<rating-compact 
  product-id="prod-123"
  star-color="#ff0000"
  star-icon="❤️"
  star-empty-icon="🤍"
></rating-compact>
```

### 2. `<reviews-list>`

Complete reviews display with rating summary, filters, sorting, and pagination for PDP.

**Attributes:**
- `product-id` - Product identifier (required)
- `page-size` - Number of reviews per page (default: 10)
- `sort-by` - Default sort order (newest, helpful, highest, lowest)
- **`layout`** - Layout variant: `default`, `compact`, `grid`
- **`theme`** - Theme variant: `light` (default), `dark`
- **`show-summary`** - Show/hide rating summary (default: `true`)
- **`show-filters`** - Show/hide filter controls (default: `true`)
- **`show-sorting`** - Show/hide sort dropdown (default: `true`)
- **`show-pagination`** - Show/hide pagination (default: `true`)
- **`card-style`** - Card style: `elevated` (default), `flat`, `bordered`

**Example:**
```html
<!-- Basic usage -->
<reviews-list product-id="prod-123" page-size="5"></reviews-list>

<!-- With variants for sidebar -->
<reviews-list 
  product-id="prod-123" 
  layout="compact"
  show-filters="false"
  card-style="flat"
></reviews-list>
```

### 3. `<review-form-button>`

Button that opens a modal form for submitting new reviews with GDPR compliance.

**Attributes:**
- `product-id` - Product identifier (required)
- `button-text` - Button label text (default: "Write a Review")
- `user-token` - Authentication token
- **`size`** - Button size: `small`, `medium` (default), `large`
- **`variant`** - Button variant: `primary` (default), `secondary`, `outline`, `ghost`
- **`position`** - Button alignment: `left` (default), `center`, `right`
- **`full-width`** - Make button full width (default: `false`)
- **`show-icon`** - Show/hide icon (default: `true`)

**Example:**
```html
<!-- Basic usage -->
<review-form-button product-id="prod-123"></review-form-button>

<!-- With variants -->
<review-form-button 
  product-id="prod-123"
  variant="outline"
  size="large"
  position="center"
></review-form-button>
```

## 🎨 Customizable Variants

All components support multiple variants to adapt to different design contexts:

- **Size variants**: `small`, `medium`, `large` - adapt to different UI densities
- **Theme variants**: `light`, `dark`, `primary`, `secondary` - match your brand colors
- **Layout variants**: Different layouts for various page contexts (list, grid, compact)
- **Display variants**: Control which information is shown or hidden

These variants make the components flexible enough for use in:
- Product listing pages (PLPs)
- Product detail pages (PDPs)
- Shopping carts
- Wishlists
- Admin panels
- Mobile apps
- Any other context!
- `product-id` - Product identifier (required)
- `button-text` - Custom button text (default: "Write a Review")
- `user-token` - Authentication token for user (if required)

**Example:**
```html
<review-form-button product-id="prod-123" button-text="Add Review"></review-form-button>
```

## 🔧 Development

### Run Development Server

```bash
npm run dev
```

Opens interactive demo at `http://localhost:5173`

### Build

#### For Production (Web Components)
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

Builds the Web Components bundle to `dist/` directory.

**Output files:**
- `ratings-reviews-components.es.js` - ES module format
- `ratings-reviews-components.umd.js` - UMD format (for older browsers)
- `ratings-reviews-components.iife.js` - IIFE format (can be loaded with script tag)

#### For Legacy Vue.js Library Mode
```bash
npm run build:lib
```
Builds the original Vue.js components as a library (for Vue.js projects).

### Run Tests

```bash
npm test
```

### Environment Variables

For production deployment, the frontend server proxies API requests to the backend:

- `BACKEND_URL` - Backend service URL (default: `http://localhost:8080`)
- `PORT` - Server port (default: `8080`)

## 🌐 Live Demo

After building:

```bash
npm run build
npm start
```

Then visit `http://localhost:8080` to see the Web Components demo.

## 🔌 Integration Examples

### In Plain HTML

```html
<!DOCTYPE html>
<html>
<body>
  <rating-compact product-id="prod-123"></rating-compact>
  <script type="module" src="./ratings-reviews-components.es.js"></script>
</body>
</html>
```

### In React

```jsx
export function ProductRating({ productId }) {
  return (
    <rating-compact 
      product-id={productId}
      auto-fetch="true"
    />
  );
}
```

### In Angular

```html
<rating-compact 
  [attr.product-id]="productId"
  auto-fetch="true">
</rating-compact>
```

### In Vue.js

```vue
<template>
  <rating-compact 
    :product-id="productId"
    auto-fetch="true"
  />
</template>
```

## 📖 Full Documentation

See [INTEGRATION.md](./docs/INTEGRATION.md) for complete integration guide and component API documentation.

## 📝 License

MIT
