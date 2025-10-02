# Web Components Examples

This directory contains simple examples demonstrating how to use the Ratings & Reviews Web Components in various scenarios.

## Examples

### 1. simple-example.html

A minimal example showing how to integrate all three components into a basic product page.

**To view:**
```bash
# From the frontend directory
npm run build
# Then open examples/simple-example.html in your browser
# Or serve it with any HTTP server:
npx serve .
# Visit http://localhost:3000/examples/simple-example.html
```

## Key Takeaways

1. **No framework required** - Just include the script tag
2. **No build step** - Use directly in HTML
3. **Self-contained** - All styles and functionality included
4. **Easy to customize** - Simple HTML attributes control behavior

## Integration Steps

```html
<!-- 1. Include the Web Components script -->
<script type="module" src="path/to/ratings-reviews-components.es.js"></script>

<!-- 2. Use the components anywhere in your HTML -->
<rating-compact product-id="your-product-id"></rating-compact>
<reviews-list product-id="your-product-id"></reviews-list>
<review-form-button product-id="your-product-id"></review-form-button>
```

That's it! No Vue.js, no complex setup, just HTML tags.
