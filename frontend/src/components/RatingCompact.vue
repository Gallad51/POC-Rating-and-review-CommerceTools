<template>
  <div 
    class="rating-compact"
    :class="[
      `rating-compact--${props.size}`,
      `rating-compact--${props.theme}`,
      `rating-compact--${props.display}`,
      `rating-compact--star-${props.starStyle}`,
      { 'rating-compact--loading': isLoading },
      { 'rating-compact--compact': props.compact }
    ]"
    role="group"
    :aria-label="`Product rating: ${displayRating} out of 5 stars, ${totalReviews} reviews`"
  >
    <!-- Loading state -->
    <div v-if="isLoading" class="rating-compact__skeleton">
      <div class="rating-compact__skeleton-stars"></div>
      <div class="rating-compact__skeleton-text"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="hasError" class="rating-compact__error" role="alert">
      <span aria-hidden="true">⚠️</span>
      <span class="rating-compact__error-text">{{ errorMessage }}</span>
    </div>

    <!-- Empty state (no reviews) -->
    <div v-else-if="totalReviews === 0" class="rating-compact__empty">
      <span class="rating-compact__stars" aria-hidden="true">
        <span v-for="i in 5" :key="i" class="rating-compact__star rating-compact__star--empty">☆</span>
      </span>
      <span class="rating-compact__text">{{ emptyText }}</span>
    </div>

    <!-- Success state with data -->
    <div v-else class="rating-compact__content">
      <!-- Star rating display -->
      <div 
        class="rating-compact__stars"
        :aria-label="`${displayRating} stars`"
        role="img"
      >
        <span
          v-for="star in 5"
          :key="star"
          class="rating-compact__star"
          :class="{
            'rating-compact__star--full': star <= Math.floor(averageRating),
            'rating-compact__star--half': star === Math.ceil(averageRating) && averageRating % 1 !== 0,
            'rating-compact__star--empty': star > Math.ceil(averageRating)
          }"
          aria-hidden="true"
        >
          <span v-if="star <= Math.floor(averageRating)">★</span>
          <span v-else-if="star === Math.ceil(averageRating) && averageRating % 1 !== 0">★</span>
          <span v-else>☆</span>
        </span>
      </div>

      <!-- Rating number and review count -->
      <div class="rating-compact__info" v-if="props.display !== 'minimal'">
        <span v-if="props.showRating" class="rating-compact__rating" aria-hidden="true">{{ displayRating }}</span>
        <span v-if="props.showCount" class="rating-compact__count">({{ formattedReviewCount }})</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useReviewsApi } from '@/composables/useReviewsApi';

interface Props {
  /** Product ID to fetch rating for */
  productId?: string;
  /** Average rating (0-5) - if provided, won't fetch from API */
  averageRating?: number;
  /** Total number of reviews - if provided, won't fetch from API */
  totalReviews?: number;
  /** Custom text for empty state */
  emptyText?: string;
  /** Whether to show compact view (minimal info) */
  compact?: boolean;
  /** Whether to fetch data automatically on mount */
  autoFetch?: boolean;
  /** Size variant: small, medium, large */
  size?: 'small' | 'medium' | 'large';
  /** Theme variant: light, dark, primary, secondary */
  theme?: 'light' | 'dark' | 'primary' | 'secondary';
  /** Display style: inline, block, minimal */
  display?: 'inline' | 'block' | 'minimal';
  /** Show/hide rating number */
  showRating?: boolean;
  /** Show/hide review count */
  showCount?: boolean;
  /** Star style: filled, outlined */
  starStyle?: 'filled' | 'outlined';
}

const props = withDefaults(defineProps<Props>(), {
  emptyText: 'No reviews yet',
  compact: false,
  autoFetch: true,
  size: 'medium',
  theme: 'light',
  display: 'inline',
  showRating: true,
  showCount: true,
  starStyle: 'filled',
});

const emit = defineEmits<{
  /** Emitted when rating data is loaded */
  loaded: [rating: number, count: number];
  /** Emitted when an error occurs */
  error: [message: string];
}>();

const { loading, error, getProductRating } = useReviewsApi();

const fetchedRating = ref<number>(0);
const fetchedCount = ref<number>(0);

const isLoading = computed(() => loading.value === 'loading');
const hasError = computed(() => loading.value === 'error' && error.value !== null);
const errorMessage = computed(() => error.value || 'Failed to load rating');

// Use prop values if provided, otherwise use fetched values
const averageRating = computed(() => props.averageRating ?? fetchedRating.value);
const totalReviews = computed(() => props.totalReviews ?? fetchedCount.value);

const displayRating = computed(() => {
  return averageRating.value.toFixed(1);
});

const formattedReviewCount = computed(() => {
  const count = totalReviews.value;
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
});

const fetchRating = async () => {
  if (!props.productId) {
    return;
  }

  const rating = await getProductRating(props.productId);
  if (rating) {
    fetchedRating.value = rating.averageRating;
    fetchedCount.value = rating.totalReviews;
    emit('loaded', rating.averageRating, rating.totalReviews);
  } else if (error.value) {
    emit('error', error.value);
  }
};

// Watch for productId changes
watch(() => props.productId, () => {
  if (props.autoFetch && props.productId && props.averageRating === undefined) {
    fetchRating();
  }
});

onMounted(() => {
  if (props.autoFetch && props.productId && props.averageRating === undefined) {
    fetchRating();
  }
});

// Expose methods for parent component
defineExpose({
  refresh: fetchRating,
});
</script>

<style scoped>
.rating-compact {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Size variants */
.rating-compact--small {
  font-size: 0.875rem;
}

.rating-compact--small .rating-compact__star {
  font-size: 0.875rem;
}

.rating-compact--medium {
  font-size: 1rem;
}

.rating-compact--medium .rating-compact__star {
  font-size: 1rem;
}

.rating-compact--large {
  font-size: 1.25rem;
}

.rating-compact--large .rating-compact__star {
  font-size: 1.5rem;
}

/* Theme variants */
.rating-compact--light {
  color: var(--rating-text-color, #333);
}

.rating-compact--dark {
  color: var(--rating-text-color-dark, #fff);
}

.rating-compact--dark .rating-compact__star--full {
  color: var(--rating-star-color-dark, #ffd700);
}

.rating-compact--dark .rating-compact__star--empty {
  color: var(--rating-star-empty-color-dark, #666);
}

.rating-compact--primary {
  color: var(--rating-primary-color, #007bff);
}

.rating-compact--primary .rating-compact__star--full {
  color: var(--rating-primary-color, #007bff);
}

.rating-compact--secondary {
  color: var(--rating-secondary-color, #6c757d);
}

.rating-compact--secondary .rating-compact__star--full {
  color: var(--rating-secondary-color, #6c757d);
}

/* Display variants */
.rating-compact--inline {
  display: inline-flex;
}

.rating-compact--block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.rating-compact--block .rating-compact__info {
  margin-left: 0;
}

.rating-compact--minimal .rating-compact__info {
  display: none;
}

/* Star style variants */
.rating-compact--star-outlined .rating-compact__star--full {
  text-shadow: 0 0 0 var(--rating-star-color, #ffc107);
}

/* Compact mode */
.rating-compact--compact {
  gap: 0.25rem;
}

.rating-compact--compact .rating-compact__info {
  font-size: 0.75em;
}

.rating-compact__content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-compact__stars {
  display: flex;
  gap: 0.125rem;
  line-height: 1;
}

.rating-compact__star {
  color: #ffc107;
  font-size: 1rem;
}

.rating-compact__star--full {
  color: #ffc107;
}

.rating-compact__star--half {
  color: #ffc107;
  position: relative;
  overflow: hidden;
}

.rating-compact__star--half::after {
  content: '☆';
  position: absolute;
  left: 50%;
  color: #e0e0e0;
}

.rating-compact__star--empty {
  color: #e0e0e0;
}

.rating-compact__info {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.rating-compact__rating {
  font-weight: 600;
  color: #333;
}

.rating-compact__count {
  color: #666;
}

.rating-compact__empty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #999;
  font-size: 0.875rem;
}

.rating-compact__empty .rating-compact__stars {
  opacity: 0.5;
}

.rating-compact__error {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #d32f2f;
  font-size: 0.875rem;
}

/* Loading skeleton */
.rating-compact__skeleton {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-compact__skeleton-stars,
.rating-compact__skeleton-text {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

.rating-compact__skeleton-stars {
  width: 100px;
  height: 16px;
}

.rating-compact__skeleton-text {
  width: 50px;
  height: 14px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Accessibility: high contrast mode support */
@media (prefers-contrast: high) {
  .rating-compact__star--full {
    color: #f90;
  }
  
  .rating-compact__star--empty {
    color: #666;
  }
}

/* Accessibility: reduced motion */
@media (prefers-reduced-motion: reduce) {
  .rating-compact__skeleton-stars,
  .rating-compact__skeleton-text {
    animation: none;
  }
}
</style>
