/**
 * Composable for API interactions with the ratings & reviews backend
 * Uses middleware backend - no direct CommerceTools calls
 */

import { ref } from 'vue';
import type {
  ProductRating,
  PaginatedReviews,
  ReviewInput,
  Review,
  ReviewFilters,
  ApiResponse,
  LoadingState,
} from '@/types/review.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export function useReviewsApi() {
  const loading = ref<LoadingState>('idle');
  const error = ref<string | null>(null);

  const handleApiError = (err: unknown): void => {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'An unexpected error occurred';
    }
    loading.value = 'error';
  };

  /**
   * Get product rating summary
   */
  const getProductRating = async (productId: string): Promise<ProductRating | null> => {
    loading.value = 'loading';
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/rating`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch rating: ${response.statusText}`);
      }

      const data: ApiResponse<ProductRating> = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch rating');
      }

      loading.value = 'success';
      return data.data;
    } catch (err) {
      handleApiError(err);
      return null;
    }
  };

  /**
   * Get paginated product reviews
   */
  const getProductReviews = async (
    productId: string,
    page: number = 1,
    limit: number = 10,
    filters?: ReviewFilters
  ): Promise<PaginatedReviews | null> => {
    loading.value = 'loading';
    error.value = null;

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters?.rating) params.append('rating', filters.rating.toString());
      if (filters?.verified !== undefined) params.append('verified', filters.verified.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(
        `${API_BASE_URL}/api/products/${productId}/reviews?${params}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.statusText}`);
      }

      const data: ApiResponse<PaginatedReviews> = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch reviews');
      }

      loading.value = 'success';
      return data.data;
    } catch (err) {
      handleApiError(err);
      return null;
    }
  };

  /**
   * Submit a new review
   */
  const submitReview = async (
    reviewInput: ReviewInput,
    token?: string
  ): Promise<Review | null> => {
    loading.value = 'loading';
    error.value = null;

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/products/${reviewInput.productId}/reviews`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(reviewInput),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to submit review: ${response.statusText}`);
      }

      const data: ApiResponse<Review> = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to submit review');
      }

      loading.value = 'success';
      return data.data;
    } catch (err) {
      handleApiError(err);
      return null;
    }
  };

  return {
    loading,
    error,
    getProductRating,
    getProductReviews,
    submitReview,
  };
}
