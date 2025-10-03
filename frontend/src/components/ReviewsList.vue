<template>
  <div 
    class="reviews-list" 
    :class="[
      `reviews-list--${props.layout}`,
      `reviews-list--${props.theme}`,
      { 'reviews-list--loading': isLoading }
    ]"
  >
    <!-- Header with rating summary -->
    <div class="reviews-list__header">
      <h2 class="reviews-list__title">Customer Reviews</h2>
      
      <div v-if="!isLoading && !hasError && productRating" class="reviews-list__summary">
        <div class="reviews-list__summary-rating">
          <span class="reviews-list__avg-rating" aria-label="`Average rating: ${productRating.averageRating} out of 5`">
            {{ productRating.averageRating.toFixed(1) }}
          </span>
          <div class="reviews-list__stars" aria-hidden="true">
            <span
              v-for="star in 5"
              :key="star"
              class="reviews-list__star"
              :class="{
                'reviews-list__star--full': star <= Math.floor(productRating.averageRating),
                'reviews-list__star--half': star === Math.ceil(productRating.averageRating) && productRating.averageRating % 1 !== 0,
                'reviews-list__star--empty': star > Math.ceil(productRating.averageRating)
              }"
            >
              {{ star <= Math.floor(productRating.averageRating) ? '★' : (star === Math.ceil(productRating.averageRating) && productRating.averageRating % 1 !== 0 ? '★' : '☆') }}
            </span>
          </div>
          <span class="reviews-list__total">{{ productRating.totalReviews }} reviews</span>
        </div>

        <!-- Rating distribution bars -->
        <div class="reviews-list__distribution">
          <div 
            v-for="rating in [5, 4, 3, 2, 1]" 
            :key="rating"
            class="reviews-list__distribution-row"
          >
            <button
              class="reviews-list__distribution-label"
              :aria-label="`Filter by ${rating} stars`"
              @click="filterByRating(rating)"
            >
              {{ rating }} <span aria-hidden="true">★</span>
            </button>
            <div class="reviews-list__distribution-bar">
              <div 
                class="reviews-list__distribution-fill"
                :style="{ width: getDistributionPercent(rating) + '%' }"
                :aria-label="`${productRating.ratingDistribution[rating]} reviews`"
              ></div>
            </div>
            <span class="reviews-list__distribution-count">{{ productRating.ratingDistribution[rating] }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and sorting -->
    <div v-if="props.showFilters || props.showSorting" class="reviews-list__controls">
      <div v-if="props.showFilters" class="reviews-list__filters">
        <button
          :class="['reviews-list__filter-btn', { 'reviews-list__filter-btn--active': !currentFilters.rating }]"
          @click="clearRatingFilter"
          aria-label="Show all ratings"
        >
          All
        </button>
        <button
          :class="['reviews-list__filter-btn', { 'reviews-list__filter-btn--active': currentFilters.verified }]"
          @click="toggleVerifiedFilter"
          aria-label="Show only verified purchases"
        >
          <span aria-hidden="true">✓</span> Verified
        </button>
      </div>

      <div v-if="props.showSorting" class="reviews-list__sort">
        <label for="sort-select" class="reviews-list__sort-label">Sort by:</label>
        <select
          id="sort-select"
          v-model="sortBy"
          class="reviews-list__sort-select"
          @change="handleSortChange"
        >
          <option value="date-desc">Most Recent</option>
          <option value="date-asc">Oldest First</option>
          <option value="rating-desc">Highest Rating</option>
          <option value="rating-asc">Lowest Rating</option>
          <option value="helpful-desc">Most Helpful</option>
        </select>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="reviews-list__loading" aria-live="polite" aria-busy="true">
      <div class="reviews-list__skeleton" v-for="i in 3" :key="i">
        <div class="reviews-list__skeleton-header"></div>
        <div class="reviews-list__skeleton-body"></div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="hasError" class="reviews-list__error" role="alert">
      <p>⚠️ {{ errorMessage }}</p>
      <button class="reviews-list__retry-btn" @click="loadReviews">Retry</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="reviews.length === 0" class="reviews-list__empty" role="status">
      <p>{{ emptyText }}</p>
    </div>

    <!-- Reviews list -->
    <div v-else class="reviews-list__items" role="list">
      <article 
        v-for="review in reviews"
        :key="review.id"
        class="review-card"
        :class="`review-card--${props.cardStyle}`"
        role="listitem"
      >
        <div class="review-card__header">
          <div class="review-card__stars" :aria-label="`${review.rating} out of 5 stars`" role="img">
            <span v-for="star in 5" :key="star" :class="{ 'review-card__star--filled': star <= review.rating }" aria-hidden="true">
              {{ star <= review.rating ? '★' : '☆' }}
            </span>
          </div>
          <div class="review-card__meta">
            <span class="review-card__author">{{ review.authorName || 'Anonymous' }}</span>
            <span v-if="review.isVerifiedPurchase" class="review-card__verified" aria-label="Verified purchase">
              <span aria-hidden="true">✓</span> Verified Purchase
            </span>
          </div>
        </div>

        <p v-if="review.comment" class="review-card__comment">{{ review.comment }}</p>

        <div class="review-card__footer">
          <time class="review-card__date" :datetime="review.createdAt.toString()">
            {{ formatDate(review.createdAt) }}
          </time>

          <div class="review-card__actions">
            <button
              class="review-card__action-btn"
              :class="{ 'review-card__action-btn--active': votedReviews.has(review.id) }"
              :aria-label="`Mark review as helpful (${review.helpfulCount || 0} people found this helpful)`"
              @click="voteHelpful(review.id)"
            >
              <span aria-hidden="true">👍</span> Helpful ({{ review.helpfulCount || 0 }})
            </button>
            <button
              class="review-card__action-btn"
              :aria-label="`Report review`"
              @click="reportReview(review.id)"
            >
              <span aria-hidden="true">⚠️</span> Report
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- Pagination -->
    <div v-if="props.showPagination && pagination.total > pagination.limit" class="reviews-list__pagination">
      <button
        class="reviews-list__page-btn"
        :disabled="pagination.page === 1"
        @click="goToPage(pagination.page - 1)"
        aria-label="Previous page"
      >
        ← Previous
      </button>
      
      <span class="reviews-list__page-info" aria-live="polite">
        Page {{ pagination.page }} of {{ totalPages }}
      </span>

      <button
        class="reviews-list__page-btn"
        :disabled="!pagination.hasMore"
        @click="goToPage(pagination.page + 1)"
        aria-label="Next page"
      >
        Next →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useReviewsApi } from '@/composables/useReviewsApi';
import type { Review, ProductRating, ReviewFilters } from '@/types/review.types';

interface Props {
  /** Product ID to fetch reviews for */
  productId: string;
  /** Number of reviews per page */
  pageSize?: number;
  /** Custom text for empty state */
  emptyText?: string;
  /** Whether to show rating summary */
  showSummary?: boolean;
  /** Initial filters */
  initialFilters?: ReviewFilters;
  /** Layout variant: default, compact, grid */
  layout?: 'default' | 'compact' | 'grid';
  /** Theme variant: light, dark */
  theme?: 'light' | 'dark';
  /** Show/hide filters */
  showFilters?: boolean;
  /** Show/hide sorting */
  showSorting?: boolean;
  /** Show/hide pagination */
  showPagination?: boolean;
  /** Card style: elevated, flat, bordered */
  cardStyle?: 'elevated' | 'flat' | 'bordered';
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
  emptyText: 'No reviews yet. Be the first to review!',
  showSummary: true,
  initialFilters: () => ({ sortBy: 'date', sortOrder: 'desc' }),
  layout: 'default',
  theme: 'light',
  showFilters: true,
  showSorting: true,
  showPagination: true,
  cardStyle: 'elevated',
});

const emit = defineEmits<{
  reviewsLoaded: [reviews: Review[]];
  error: [message: string];
  voteHelpful: [reviewId: string];
  reportReview: [reviewId: string];
}>();

const { loading, error, getProductRating, getProductReviews } = useReviewsApi();

const reviews = ref<Review[]>([]);
const productRating = ref<ProductRating | null>(null);
const pagination = ref({
  page: 1,
  limit: props.pageSize,
  total: 0,
  hasMore: false,
});

const currentFilters = ref<ReviewFilters>(props.initialFilters);
const sortBy = ref('date-desc');
const votedReviews = ref<Set<string>>(new Set());

const isLoading = computed(() => loading.value === 'loading');
const hasError = computed(() => loading.value === 'error' && error.value !== null);
const errorMessage = computed(() => error.value || 'Failed to load reviews');

const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit));

const loadRatingSummary = async () => {
  const rating = await getProductRating(props.productId);
  if (rating) {
    productRating.value = rating;
  }
};

const loadReviews = async () => {
  const result = await getProductReviews(
    props.productId,
    pagination.value.page,
    pagination.value.limit,
    currentFilters.value
  );

  if (result) {
    reviews.value = result.reviews;
    pagination.value = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      hasMore: result.hasMore,
    };
    emit('reviewsLoaded', result.reviews);
  } else if (error.value) {
    emit('error', error.value);
  }
};

const getDistributionPercent = (rating: number): number => {
  if (!productRating.value || productRating.value.totalReviews === 0) return 0;
  return (productRating.value.ratingDistribution[rating as 1 | 2 | 3 | 4 | 5] / productRating.value.totalReviews) * 100;
};

const filterByRating = (rating: number) => {
  if (currentFilters.value.rating === rating) {
    clearRatingFilter();
  } else {
    currentFilters.value.rating = rating;
    pagination.value.page = 1;
    loadReviews();
  }
};

const clearRatingFilter = () => {
  currentFilters.value.rating = undefined;
  pagination.value.page = 1;
  loadReviews();
};

const toggleVerifiedFilter = () => {
  currentFilters.value.verified = !currentFilters.value.verified;
  pagination.value.page = 1;
  loadReviews();
};

const handleSortChange = () => {
  const [sortField, order] = sortBy.value.split('-');
  currentFilters.value.sortBy = sortField as 'date' | 'rating' | 'helpful';
  currentFilters.value.sortOrder = order as 'asc' | 'desc';
  pagination.value.page = 1;
  loadReviews();
};

const goToPage = (page: number) => {
  pagination.value.page = page;
  loadReviews();
  // Scroll to top of reviews
  const element = document.querySelector('.reviews-list');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const voteHelpful = (reviewId: string) => {
  if (!votedReviews.value.has(reviewId)) {
    votedReviews.value.add(reviewId);
    // In a real implementation, this would call an API
    emit('voteHelpful', reviewId);
    
    // Update local review helpfulCount
    const review = reviews.value.find(r => r.id === reviewId);
    if (review) {
      review.helpfulCount = (review.helpfulCount || 0) + 1;
    }
  }
};

const reportReview = (reviewId: string) => {
  emit('reportReview', reviewId);
  // In a real implementation, this would show a modal or call an API
  alert('Thank you for reporting. Our team will review this.');
};

const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
};

watch(() => props.productId, () => {
  pagination.value.page = 1;
  loadRatingSummary();
  loadReviews();
});

onMounted(() => {
  if (props.showSummary) {
    loadRatingSummary();
  }
  loadReviews();
});

defineExpose({
  refresh: () => {
    loadRatingSummary();
    loadReviews();
  },
});
</script>

<style scoped>
.reviews-list {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
}

/* Layout variants */
.reviews-list--default .reviews-list__items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reviews-list--compact .reviews-list__items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reviews-list--compact .review-card {
  padding: 1rem;
}

.reviews-list--compact .review-card__comment {
  font-size: 0.875rem;
}

.reviews-list--grid .reviews-list__items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

/* Theme variants */
.reviews-list--light {
  color: var(--reviews-text-color, #333);
  background: var(--reviews-bg-color, transparent);
}

.reviews-list--dark {
  color: var(--reviews-text-color-dark, #fff);
  background: var(--reviews-bg-color-dark, #1a1a1a);
}

.reviews-list--dark .reviews-list__title {
  color: var(--reviews-text-color-dark, #fff);
}

.reviews-list--dark .review-card {
  background: var(--reviews-card-bg-dark, #2a2a2a);
  border-color: var(--reviews-border-color-dark, #444);
}

.reviews-list--dark .review-card__author {
  color: var(--reviews-text-color-dark, #fff);
}

.reviews-list--dark .review-card__comment {
  color: var(--reviews-text-color-dark, #e0e0e0);
}

.reviews-list--dark .reviews-list__summary {
  background: var(--reviews-summary-bg-dark, #2a2a2a);
}

.reviews-list--dark .reviews-list__avg-rating {
  color: var(--reviews-text-color-dark, #fff);
}

/* Card style variants */
.review-card--elevated {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.review-card--elevated:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.review-card--flat {
  box-shadow: none;
  background: transparent;
}

.review-card--bordered {
  box-shadow: none;
  border: 2px solid var(--reviews-border-color, #e0e0e0);
}

.reviews-list__header {
  margin-bottom: 2rem;
}

.reviews-list__title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.reviews-list__summary {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.reviews-list__summary-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.reviews-list__avg-rating {
  font-size: 3rem;
  font-weight: 700;
  color: #333;
}

.reviews-list__stars {
  display: flex;
  gap: 0.125rem;
  color: #ffc107;
  font-size: 1.25rem;
}

.reviews-list__star--full {
  color: #ffc107;
}

.reviews-list__star--empty {
  color: #e0e0e0;
}

.reviews-list__total {
  color: #666;
  font-size: 0.875rem;
}

.reviews-list__distribution {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reviews-list__distribution-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: center;
}

.reviews-list__distribution-label {
  background: none;
  border: none;
  font-size: 0.875rem;
  color: #666;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.reviews-list__distribution-label:hover {
  background-color: #e0e0e0;
}

.reviews-list__distribution-bar {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.reviews-list__distribution-fill {
  height: 100%;
  background-color: #ffc107;
  transition: width 0.3s ease;
}

.reviews-list__distribution-count {
  font-size: 0.875rem;
  color: #666;
  min-width: 2rem;
  text-align: right;
}

.reviews-list__controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.reviews-list__filters {
  display: flex;
  gap: 0.5rem;
}

.reviews-list__filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.reviews-list__filter-btn:hover {
  border-color: #007bff;
}

.reviews-list__filter-btn--active {
  background: #007bff;
  color: #fff;
  border-color: #007bff;
}

.reviews-list__sort {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reviews-list__sort-label {
  font-size: 0.875rem;
  color: #666;
}

.reviews-list__sort-select {
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  font-size: 0.875rem;
  cursor: pointer;
}

.reviews-list__items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-card {
  padding: 1.5rem;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}

.review-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.review-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.review-card__stars {
  display: flex;
  gap: 0.125rem;
  color: #ffc107;
  font-size: 1rem;
}

.review-card__star--filled {
  color: #ffc107;
}

.review-card__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.review-card__author {
  font-weight: 600;
  color: #333;
}

.review-card__verified {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #4caf50;
  font-size: 0.75rem;
}

.review-card__comment {
  margin: 0.75rem 0;
  color: #333;
  line-height: 1.6;
}

.review-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f0f0;
}

.review-card__date {
  font-size: 0.75rem;
  color: #999;
}

.review-card__actions {
  display: flex;
  gap: 0.75rem;
}

.review-card__action-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border: 1px solid #e0e0e0;
  background: #fff;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.review-card__action-btn:hover {
  border-color: #007bff;
  background: #f0f7ff;
}

.review-card__action-btn--active {
  background: #007bff;
  color: #fff;
  border-color: #007bff;
}

.reviews-list__pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
}

.reviews-list__page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.reviews-list__page-btn:hover:not(:disabled) {
  border-color: #007bff;
  background: #f0f7ff;
}

.reviews-list__page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reviews-list__page-info {
  font-size: 0.875rem;
  color: #666;
}

.reviews-list__loading,
.reviews-list__error,
.reviews-list__empty {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.reviews-list__skeleton {
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.reviews-list__skeleton-header,
.reviews-list__skeleton-body {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.reviews-list__skeleton-header {
  height: 20px;
  width: 60%;
}

.reviews-list__skeleton-body {
  height: 60px;
  width: 100%;
}

.reviews-list__retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 768px) {
  .reviews-list__summary {
    grid-template-columns: 1fr;
  }

  .reviews-list__controls {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .reviews-list__sort {
    width: 100%;
    justify-content: space-between;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
