/**
 * Web Components entry point
 * Converts Vue components to Custom Elements for use in any HTML website
 */

import { defineCustomElement } from 'vue';
import RatingCompactVue from './components/RatingCompact.vue';
import ReviewsListVue from './components/ReviewsList.vue';
import ReviewFormButtonVue from './components/ReviewFormButton.vue';

// Convert Vue components to Custom Elements
const RatingCompact = defineCustomElement(RatingCompactVue);
const ReviewsList = defineCustomElement(ReviewsListVue);
const ReviewFormButton = defineCustomElement(ReviewFormButtonVue);

// Register Custom Elements with browser
customElements.define('rating-compact', RatingCompact);
customElements.define('reviews-list', ReviewsList);
customElements.define('review-form-button', ReviewFormButton);

// Export for potential programmatic use
export { RatingCompact, ReviewsList, ReviewFormButton };
