<template>
  <div 
    class="review-form-modal"
    :class="`review-form-modal--${props.position}`"
  >
    <button
      class="review-form-button"
      :class="[
        `review-form-button--${props.size}`,
        `review-form-button--${props.variant}`,
        { 'review-form-button--full-width': props.fullWidth }
      ]"
      :aria-label="buttonLabel"
      @click="openModal"
    >
      <span v-if="props.showIcon" aria-hidden="true">✍️</span>
      {{ buttonText }}
    </button>

    <!-- Modal without Teleport for Web Components compatibility -->
    <div
      v-if="isOpen"
      class="review-modal"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="modalTitleId"
      @click.self="handleBackdropClick"
    >
        <div class="review-modal__content">
          <div class="review-modal__header">
            <h2 :id="modalTitleId" class="review-modal__title">Write a Review</h2>
            <button
              class="review-modal__close"
              aria-label="Close review form"
              @click="closeModal"
            >
              ✕
            </button>
          </div>

          <form class="review-form" @submit.prevent="handleSubmit">
            <!-- Star Rating Input -->
            <div class="review-form__field">
              <label class="review-form__label" :for="`rating-${uid}`">
                Rating <span class="review-form__required" aria-label="required">*</span>
              </label>
              <div class="review-form__stars" role="radiogroup" :aria-labelledby="`rating-label-${uid}`">
                <span :id="`rating-label-${uid}`" class="sr-only">Select rating from 1 to 5 stars</span>
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  class="review-form__star-btn"
                  :class="{ 'review-form__star-btn--active': star <= formData.rating }"
                  :aria-label="`${star} stars`"
                  :aria-checked="formData.rating === star"
                  role="radio"
                  @click="setRating(star)"
                  @mouseenter="hoverRating = star"
                  @mouseleave="hoverRating = 0"
                >
                  {{ star <= (hoverRating || formData.rating) ? '★' : '☆' }}
                </button>
              </div>
              <span v-if="errors.rating" class="review-form__error" role="alert">{{ errors.rating }}</span>
            </div>

            <!-- Comment Textarea -->
            <div class="review-form__field">
              <label class="review-form__label" :for="`comment-${uid}`">
                Your Review <span class="review-form__optional">(optional)</span>
              </label>
              <textarea
                :id="`comment-${uid}`"
                v-model="formData.comment"
                class="review-form__textarea"
                :class="{ 'review-form__textarea--error': errors.comment }"
                rows="5"
                maxlength="1000"
                placeholder="Tell us about your experience with this product..."
                :aria-describedby="`comment-help-${uid}`"
              ></textarea>
              <div class="review-form__help" :id="`comment-help-${uid}`">
                {{ formData.comment?.length || 0 }}/1000 characters
              </div>
              <span v-if="errors.comment" class="review-form__error" role="alert">{{ errors.comment }}</span>
            </div>

            <!-- Author Name -->
            <div class="review-form__field">
              <label class="review-form__label" :for="`author-${uid}`">
                Display Name <span class="review-form__optional">(optional)</span>
              </label>
              <input
                :id="`author-${uid}`"
                v-model="formData.authorName"
                type="text"
                class="review-form__input"
                :class="{ 'review-form__input--error': errors.authorName }"
                maxlength="50"
                placeholder="How should we display your name?"
                :aria-describedby="`author-help-${uid}`"
              />
              <div class="review-form__help" :id="`author-help-${uid}`">
                Leave blank to post anonymously
              </div>
              <span v-if="errors.authorName" class="review-form__error" role="alert">{{ errors.authorName }}</span>
            </div>

            <!-- GDPR Consent -->
            <div class="review-form__field">
              <label class="review-form__checkbox-label">
                <input
                  v-model="formData.gdprConsent"
                  type="checkbox"
                  class="review-form__checkbox"
                  :aria-describedby="`gdpr-help-${uid}`"
                  required
                />
                <span>
                  I agree to the <a href="#" target="_blank" rel="noopener">privacy policy</a> and consent to my review being published
                  <span class="review-form__required" aria-label="required">*</span>
                </span>
              </label>
              <div class="review-form__help review-form__help--small" :id="`gdpr-help-${uid}`">
                Your review will be public. We do not share personal information.
              </div>
              <span v-if="errors.gdprConsent" class="review-form__error" role="alert">{{ errors.gdprConsent }}</span>
            </div>

            <!-- Submit Status -->
            <div v-if="submitStatus" class="review-form__status" :class="`review-form__status--${submitStatus.type}`" role="alert">
              {{ submitStatus.message }}
            </div>

            <!-- Form Actions -->
            <div class="review-form__actions">
              <button
                type="button"
                class="review-form__btn review-form__btn--secondary"
                @click="closeModal"
                :disabled="isSubmitting"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="review-form__btn review-form__btn--primary"
                :disabled="isSubmitting || !isValid"
                :aria-busy="isSubmitting"
              >
                <span v-if="isSubmitting">Submitting...</span>
                <span v-else>Submit Review</span>
              </button>
            </div>
          </form>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useReviewsApi } from '@/composables/useReviewsApi';
import type { ReviewInput } from '@/types/review.types';

interface Props {
  /** Product ID for the review */
  productId: string;
  /** Button text */
  buttonText?: string;
  /** Button aria-label */
  buttonLabel?: string;
  /** Auth token (optional, depends on backend config) */
  authToken?: string;
  /** Require user to be authenticated */
  requireAuth?: boolean;
  /** Check if user has purchased product */
  checkPurchase?: boolean;
  /** Button size: small, medium, large */
  size?: 'small' | 'medium' | 'large';
  /** Button variant: primary, secondary, outline, ghost */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Button position: left, center, right */
  position?: 'left' | 'center' | 'right';
  /** Full width button */
  fullWidth?: boolean;
  /** Show icon */
  showIcon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  buttonText: 'Write a Review',
  buttonLabel: 'Write a review for this product',
  requireAuth: false,
  checkPurchase: false,
  size: 'medium',
  variant: 'primary',
  position: 'left',
  fullWidth: false,
  showIcon: true,
});

const emit = defineEmits<{
  /** Emitted when review is successfully submitted */
  submitted: [reviewId: string];
  /** Emitted when modal is opened */
  opened: [];
  /** Emitted when modal is closed */
  closed: [];
  /** Emitted when submission fails */
  error: [message: string];
}>();

const { submitReview } = useReviewsApi();

// Generate unique ID for form fields
const uid = Math.random().toString(36).substr(2, 9);
const modalTitleId = `modal-title-${uid}`;

const isOpen = ref(false);
const isSubmitting = ref(false);
const hoverRating = ref(0);

interface FormData {
  rating: number;
  comment: string;
  authorName: string;
  gdprConsent: boolean;
}

const formData = reactive<FormData>({
  rating: 0,
  comment: '',
  authorName: '',
  gdprConsent: false,
});

const errors = reactive<Partial<Record<keyof FormData, string>>>({});

const submitStatus = ref<{ type: 'success' | 'error'; message: string } | null>(null);

const isValid = computed(() => {
  return formData.rating > 0 && formData.gdprConsent && Object.keys(errors).length === 0;
});

const openModal = () => {
  if (props.requireAuth && !props.authToken) {
    emit('error', 'You must be logged in to write a review');
    return;
  }

  if (props.checkPurchase) {
    // In a real implementation, check if user has purchased the product
    // For now, just emit a warning
    console.warn('Purchase verification not implemented');
  }

  isOpen.value = true;
  emit('opened');
  
  // Focus trap: focus the first focusable element
  setTimeout(() => {
    const firstInput = document.querySelector('.review-form__star-btn') as HTMLElement;
    firstInput?.focus();
  }, 100);
};

const closeModal = () => {
  isOpen.value = false;
  emit('closed');
  resetForm();
};

const handleBackdropClick = () => {
  if (!isSubmitting.value) {
    closeModal();
  }
};

const setRating = (rating: number) => {
  formData.rating = rating;
  validateField('rating');
};

const validateField = (field: keyof FormData) => {
  switch (field) {
    case 'rating':
      if (formData.rating < 1 || formData.rating > 5) {
        errors.rating = 'Please select a rating';
      } else {
        delete errors.rating;
      }
      break;
    case 'comment':
      if (formData.comment && formData.comment.length > 1000) {
        errors.comment = 'Comment must be less than 1000 characters';
      } else {
        delete errors.comment;
      }
      break;
    case 'authorName':
      if (formData.authorName && formData.authorName.length > 50) {
        errors.authorName = 'Name must be less than 50 characters';
      } else {
        delete errors.authorName;
      }
      break;
    case 'gdprConsent':
      if (!formData.gdprConsent) {
        errors.gdprConsent = 'You must agree to the privacy policy';
      } else {
        delete errors.gdprConsent;
      }
      break;
  }
};

const validateForm = (): boolean => {
  validateField('rating');
  validateField('comment');
  validateField('authorName');
  validateField('gdprConsent');
  return Object.keys(errors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    submitStatus.value = {
      type: 'error',
      message: 'Please fix the errors above',
    };
    return;
  }

  isSubmitting.value = true;
  submitStatus.value = null;

  const reviewInput: ReviewInput = {
    productId: props.productId,
    rating: formData.rating,
    comment: formData.comment || undefined,
    authorName: formData.authorName || undefined,
  };

  const result = await submitReview(reviewInput, props.authToken);

  if (result) {
    submitStatus.value = {
      type: 'success',
      message: 'Thank you! Your review has been submitted.',
    };
    emit('submitted', result.id);
    
    // Close modal after a short delay
    setTimeout(() => {
      closeModal();
    }, 2000);
  } else {
    submitStatus.value = {
      type: 'error',
      message: 'Failed to submit review. Please try again.',
    };
    emit('error', 'Failed to submit review');
  }

  isSubmitting.value = false;
};

const resetForm = () => {
  formData.rating = 0;
  formData.comment = '';
  formData.authorName = '';
  formData.gdprConsent = false;
  Object.keys(errors).forEach(key => delete errors[key as keyof FormData]);
  submitStatus.value = null;
};

// Watch for comment changes to validate
watch(() => formData.comment, () => validateField('comment'));
watch(() => formData.authorName, () => validateField('authorName'));
watch(() => formData.gdprConsent, () => validateField('gdprConsent'));

// Handle Escape key to close modal
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value && !isSubmitting.value) {
    closeModal();
  }
};

// Add/remove event listener for Escape key
watch(isOpen, (value) => {
  if (value) {
    document.addEventListener('keydown', handleKeydown);
    // Note: Cannot control document.body.style.overflow from within Shadow DOM
    // The modal's overflow-y: auto handles scrolling within the modal
  } else {
    document.removeEventListener('keydown', handleKeydown);
  }
});

defineExpose({
  open: openModal,
  close: closeModal,
});
</script>

<style scoped>
.review-form-modal {
  position: relative;
  display: inline-block;
}

.review-form-modal--left {
  text-align: left;
}

.review-form-modal--center {
  text-align: center;
}

.review-form-modal--right {
  text-align: right;
}

.review-form-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--button-bg-color, #007bff);
  color: var(--button-text-color, #fff);
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

/* Size variants */
.review-form-button--small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.review-form-button--medium {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.review-form-button--large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Variant styles */
.review-form-button--primary {
  background: var(--button-bg-color, #007bff);
  color: var(--button-text-color, #fff);
}

.review-form-button--primary:hover {
  background: var(--button-hover-bg, #0056b3);
}

.review-form-button--secondary {
  background: var(--button-secondary-bg, #6c757d);
  color: var(--button-secondary-text, #fff);
}

.review-form-button--secondary:hover {
  background: var(--button-secondary-hover-bg, #5a6268);
}

.review-form-button--outline {
  background: transparent;
  color: var(--button-outline-color, #007bff);
  border: 2px solid var(--button-outline-border, #007bff);
}

.review-form-button--outline:hover {
  background: var(--button-outline-hover-bg, #007bff);
  color: var(--button-outline-hover-text, #fff);
}

.review-form-button--ghost {
  background: transparent;
  color: var(--button-ghost-color, #007bff);
  border: none;
}

.review-form-button--ghost:hover {
  background: var(--button-ghost-hover-bg, rgba(0, 123, 255, 0.1));
}

/* Full width */
.review-form-button--full-width {
  width: 100%;
  justify-content: center;
}

.review-form-button:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.review-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  overflow-y: auto;
}

.review-modal__content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.review-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.review-modal__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.review-modal__close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  line-height: 1;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.review-modal__close:hover {
  background: #f0f0f0;
}

.review-modal__close:focus {
  outline: 2px solid #007bff;
}

.review-form {
  padding: 1.5rem;
}

.review-form__field {
  margin-bottom: 1.5rem;
}

.review-form__label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.review-form__required {
  color: #d32f2f;
}

.review-form__optional {
  font-weight: 400;
  color: #666;
  font-size: 0.875rem;
}

.review-form__stars {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.review-form__star-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #e0e0e0;
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.2s;
}

.review-form__star-btn:hover {
  transform: scale(1.1);
}

.review-form__star-btn--active {
  color: #ffc107;
}

.review-form__textarea,
.review-form__input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.review-form__textarea:focus,
.review-form__input:focus {
  outline: none;
  border-color: #007bff;
}

.review-form__textarea--error,
.review-form__input--error {
  border-color: #d32f2f;
}

.review-form__textarea {
  resize: vertical;
  min-height: 100px;
}

.review-form__help {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #666;
}

.review-form__help--small {
  font-size: 0.7rem;
}

.review-form__checkbox-label {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  cursor: pointer;
}

.review-form__checkbox {
  margin-top: 0.25rem;
  cursor: pointer;
}

.review-form__checkbox-label a {
  color: #007bff;
  text-decoration: none;
}

.review-form__checkbox-label a:hover {
  text-decoration: underline;
}

.review-form__error {
  display: block;
  margin-top: 0.25rem;
  color: #d32f2f;
  font-size: 0.875rem;
}

.review-form__status {
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.review-form__status--success {
  background: #d4edda;
  color: #155724;
}

.review-form__status--error {
  background: #f8d7da;
  color: #721c24;
}

.review-form__actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.review-form__btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.review-form__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.review-form__btn--secondary {
  background: #e0e0e0;
  color: #333;
}

.review-form__btn--secondary:hover:not(:disabled) {
  background: #d0d0d0;
}

.review-form__btn--primary {
  background: #007bff;
  color: #fff;
}

.review-form__btn--primary:hover:not(:disabled) {
  background: #0056b3;
}

.review-form__btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

@media (max-width: 640px) {
  .review-modal__content {
    max-height: 100vh;
    border-radius: 0;
  }

  .review-form__actions {
    flex-direction: column-reverse;
  }

  .review-form__btn {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}
</style>
