/**
 * Main entry point for the Ratings & Reviews Vue.js components
 * Exports components for use as a microfrontend
 */

import RatingCompact from './components/RatingCompact.vue';
import ReviewsList from './components/ReviewsList.vue';
import ReviewFormButton from './components/ReviewFormButton.vue';

// Export components
export { RatingCompact, ReviewsList, ReviewFormButton };

// Export composables
export { useReviewsApi } from './composables/useReviewsApi';

// Export types
export type * from './types/review.types';

// Export mock data utilities
export * from './utils/mockData';

// Default export for convenience
export default {
  RatingCompact,
  ReviewsList,
  ReviewFormButton,
};
