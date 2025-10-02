# Code Examples

## 📝 Complete Working Examples

This document provides complete, copy-paste ready code examples for common integration scenarios.

## Example 1: Basic Product Tile with Rating

```vue
<template>
  <article class="product-tile">
    <img :src="product.image" :alt="product.name" class="product-image" />
    
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-price">${{ product.price }}</p>
      
      <RatingCompact
        :product-id="product.id"
        :average-rating="product.rating"
        :total-reviews="product.reviewCount"
        @loaded="handleRatingLoaded"
      />
      
      <button @click="viewProduct" class="view-button">
        View Details
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { RatingCompact } from 'ratings-reviews-frontend';
import type { Product } from '@/types';

interface Props {
  product: Product;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  viewProduct: [productId: string];
}>();

const handleRatingLoaded = (rating: number, count: number) => {
  console.log(`Product ${props.product.id}: ${rating}/5 (${count} reviews)`);
};

const viewProduct = () => {
  emit('viewProduct', props.product.id);
};
</script>

<style scoped>
.product-tile {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  transition: box-shadow 0.2s;
}

.product-tile:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
}

.product-info {
  padding: 1rem 0;
}

.product-name {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
}

.product-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2196f3;
  margin: 0 0 0.75rem;
}

.view-button {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.75rem;
}
</style>
```

## Example 2: Product Detail Page with Reviews

```vue
<template>
  <div class="product-detail-page">
    <!-- Product Header -->
    <section class="product-header">
      <div class="product-gallery">
        <img :src="product.mainImage" :alt="product.name" />
      </div>
      
      <div class="product-details">
        <h1>{{ product.name }}</h1>
        
        <RatingCompact
          :product-id="product.id"
          :average-rating="product.rating"
          :total-reviews="product.reviewCount"
          class="product-rating"
        />
        
        <p class="product-description">{{ product.description }}</p>
        
        <div class="product-price">${{ product.price }}</div>
        
        <button @click="addToCart" class="add-to-cart-btn">
          Add to Cart
        </button>
      </div>
    </section>

    <!-- Reviews Section -->
    <section class="reviews-section">
      <div class="reviews-header">
        <h2>Customer Reviews</h2>
        <ReviewFormButton
          :product-id="product.id"
          :auth-token="userToken"
          button-text="Write a Review"
          @submitted="handleReviewSubmitted"
          @error="handleError"
        />
      </div>

      <ReviewsList
        :product-id="product.id"
        :page-size="10"
        :show-summary="true"
        @reviews-loaded="handleReviewsLoaded"
        @vote-helpful="handleVoteHelpful"
        @report-review="handleReportReview"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { RatingCompact, ReviewsList, ReviewFormButton } from 'ratings-reviews-frontend';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const authStore = useAuthStore();

const product = ref({
  id: route.params.id as string,
  name: 'Amazing Product',
  description: 'This is an amazing product description.',
  price: 99.99,
  mainImage: '/images/product.jpg',
  rating: 4.5,
  reviewCount: 42,
});

const userToken = computed(() => authStore.token);

const addToCart = () => {
  console.log('Adding to cart:', product.value.id);
  // Add to cart logic
};

const handleReviewsLoaded = (reviews: any[]) => {
  console.log(`Loaded ${reviews.length} reviews`);
};

const handleReviewSubmitted = (reviewId: string) => {
  console.log('Review submitted:', reviewId);
  // Show success message
  // Refresh reviews list
};

const handleVoteHelpful = (reviewId: string) => {
  console.log('Marked helpful:', reviewId);
  // Track analytics
};

const handleReportReview = (reviewId: string) => {
  console.log('Reported review:', reviewId);
  // Show confirmation
};

const handleError = (message: string) => {
  console.error('Error:', message);
  // Show error toast
};
</script>

<style scoped>
.product-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.product-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.product-gallery img {
  width: 100%;
  border-radius: 8px;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-rating {
  margin: 0.5rem 0;
}

.product-price {
  font-size: 2rem;
  font-weight: 700;
  color: #2196f3;
}

.add-to-cart-btn {
  padding: 1rem 2rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.125rem;
  cursor: pointer;
  transition: background 0.2s;
}

.add-to-cart-btn:hover {
  background: #45a049;
}

.reviews-section {
  margin-top: 3rem;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .product-header {
    grid-template-columns: 1fr;
  }
}
</style>
```

## Example 3: Using Mock Data for Development

```typescript
// composables/useProductReviews.ts
import { ref } from 'vue';
import { mockProductRating, mockPaginatedReviews } from 'ratings-reviews-frontend';
import type { ProductRating, PaginatedReviews } from 'ratings-reviews-frontend';

const USE_MOCK_DATA = import.meta.env.DEV; // Use mock data in development

export function useProductReviews(productId: string) {
  const rating = ref<ProductRating | null>(null);
  const reviews = ref<PaginatedReviews | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchRating = async () => {
    loading.value = true;
    error.value = null;

    try {
      if (USE_MOCK_DATA) {
        // Use mock data in development
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        rating.value = { ...mockProductRating, productId };
      } else {
        // Fetch from API in production
        const response = await fetch(`/api/products/${productId}/rating`);
        const data = await response.json();
        rating.value = data.data;
      }
    } catch (err) {
      error.value = 'Failed to load rating';
    } finally {
      loading.value = false;
    }
  };

  const fetchReviews = async (page = 1, limit = 10) => {
    loading.value = true;
    error.value = null;

    try {
      if (USE_MOCK_DATA) {
        // Use mock data in development
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
        reviews.value = mockPaginatedReviews;
      } else {
        // Fetch from API in production
        const response = await fetch(
          `/api/products/${productId}/reviews?page=${page}&limit=${limit}`
        );
        const data = await response.json();
        reviews.value = data.data;
      }
    } catch (err) {
      error.value = 'Failed to load reviews';
    } finally {
      loading.value = false;
    }
  };

  return {
    rating,
    reviews,
    loading,
    error,
    fetchRating,
    fetchReviews,
  };
}
```

## Example 4: Vuex/Pinia Store Integration

```typescript
// stores/reviews.ts
import { defineStore } from 'pinia';
import { useReviewsApi } from 'ratings-reviews-frontend';
import type { Review, ProductRating } from 'ratings-reviews-frontend';

export const useReviewsStore = defineStore('reviews', {
  state: () => ({
    ratings: {} as Record<string, ProductRating>,
    reviewsByProduct: {} as Record<string, Review[]>,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getProductRating: (state) => (productId: string) => {
      return state.ratings[productId];
    },

    getProductReviews: (state) => (productId: string) => {
      return state.reviewsByProduct[productId] || [];
    },
  },

  actions: {
    async fetchProductRating(productId: string) {
      if (this.ratings[productId]) {
        return this.ratings[productId];
      }

      this.loading = true;
      this.error = null;

      try {
        const api = useReviewsApi();
        const rating = await api.getProductRating(productId);
        
        if (rating) {
          this.ratings[productId] = rating;
          return rating;
        }
      } catch (err) {
        this.error = 'Failed to fetch rating';
      } finally {
        this.loading = false;
      }
    },

    async fetchProductReviews(productId: string, page = 1, limit = 10) {
      this.loading = true;
      this.error = null;

      try {
        const api = useReviewsApi();
        const result = await api.getProductReviews(productId, page, limit);
        
        if (result) {
          this.reviewsByProduct[productId] = result.reviews;
          return result;
        }
      } catch (err) {
        this.error = 'Failed to fetch reviews';
      } finally {
        this.loading = false;
      }
    },

    async submitReview(productId: string, reviewData: any, token?: string) {
      this.loading = true;
      this.error = null;

      try {
        const api = useReviewsApi();
        const review = await api.submitReview(reviewData, token);
        
        if (review) {
          // Add to local cache
          if (!this.reviewsByProduct[productId]) {
            this.reviewsByProduct[productId] = [];
          }
          this.reviewsByProduct[productId].unshift(review);
          
          // Invalidate rating cache
          delete this.ratings[productId];
          
          return review;
        }
      } catch (err) {
        this.error = 'Failed to submit review';
      } finally {
        this.loading = false;
      }
    },
  },
});
```

Usage in component:

```vue
<script setup>
import { onMounted } from 'vue';
import { useReviewsStore } from '@/stores/reviews';
import { RatingCompact } from 'ratings-reviews-frontend';

const props = defineProps(['productId']);
const reviewsStore = useReviewsStore();

onMounted(() => {
  reviewsStore.fetchProductRating(props.productId);
});

const rating = computed(() => reviewsStore.getProductRating(props.productId));
</script>

<template>
  <RatingCompact
    v-if="rating"
    :product-id="productId"
    :average-rating="rating.averageRating"
    :total-reviews="rating.totalReviews"
  />
</template>
```

## Example 5: Server-Side Rendering (SSR) with Nuxt

```vue
<template>
  <div>
    <RatingCompact
      v-if="!pending && rating"
      :product-id="productId"
      :average-rating="rating.averageRating"
      :total-reviews="rating.totalReviews"
    />
    <div v-else>Loading...</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ productId: string }>();

// Fetch data on server-side
const { data: rating, pending, error } = await useFetch(
  `/api/products/${props.productId}/rating`,
  {
    transform: (response: any) => response.data,
  }
);
</script>
```

## Example 6: Custom Event Handling

```vue
<script setup>
import { ref } from 'vue';
import { ReviewFormButton, ReviewsList } from 'ratings-reviews-frontend';

const productId = ref('prod-123');
const reviewsListRef = ref(null);
const toast = ref({ show: false, message: '', type: 'success' });

const showToast = (message: string, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

const handleReviewSubmitted = async (reviewId: string) => {
  showToast('Thank you! Your review has been submitted.', 'success');
  
  // Refresh the reviews list
  if (reviewsListRef.value) {
    await reviewsListRef.value.refresh();
  }
  
  // Track analytics
  trackEvent('review_submitted', {
    product_id: productId.value,
    review_id: reviewId,
  });
};

const handleReviewError = (message: string) => {
  showToast(message, 'error');
};

const handleVoteHelpful = (reviewId: string) => {
  showToast('Thanks for your feedback!', 'success');
  
  // Track analytics
  trackEvent('review_helpful_vote', {
    review_id: reviewId,
  });
};

const handleReportReview = (reviewId: string) => {
  showToast('Review reported. Our team will review it shortly.', 'info');
  
  // Track analytics
  trackEvent('review_reported', {
    review_id: reviewId,
  });
};
</script>

<template>
  <div>
    <!-- Toast notification -->
    <Transition name="fade">
      <div v-if="toast.show" :class="['toast', `toast--${toast.type}`]">
        {{ toast.message }}
      </div>
    </Transition>

    <!-- Reviews components -->
    <ReviewFormButton
      :product-id="productId"
      @submitted="handleReviewSubmitted"
      @error="handleReviewError"
    />

    <ReviewsList
      ref="reviewsListRef"
      :product-id="productId"
      @vote-helpful="handleVoteHelpful"
      @report-review="handleReportReview"
    />
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  color: white;
  z-index: 10000;
}

.toast--success { background: #4caf50; }
.toast--error { background: #f44336; }
.toast--info { background: #2196f3; }

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

## More Examples

See the `/frontend/src/App.vue` file for a complete interactive demo showcasing all components with various configurations and states.
