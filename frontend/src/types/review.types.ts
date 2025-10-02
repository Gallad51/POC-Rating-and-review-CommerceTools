/**
 * Type definitions for Review domain models
 * Synced with backend types for consistency
 */

export interface Review {
  id: string;
  productId: string;
  rating: number; // 1-5
  comment?: string;
  authorName?: string; // Anonymized display name only
  createdAt: Date | string;
  updatedAt?: Date | string;
  isVerifiedPurchase?: boolean;
  helpfulCount?: number;
  reportCount?: number;
}

export interface ReviewInput {
  productId: string;
  rating: number;
  comment?: string;
  authorName?: string;
}

export interface ProductRating {
  productId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface PaginatedReviews {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ReviewFilters {
  rating?: number;
  verified?: boolean;
  sortBy?: 'date' | 'rating' | 'helpful';
  sortOrder?: 'asc' | 'desc';
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
