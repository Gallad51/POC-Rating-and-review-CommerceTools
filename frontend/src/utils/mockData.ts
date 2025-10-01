/**
 * Mock data utilities for development and testing
 */

import type { Review, ProductRating, PaginatedReviews } from '@/types/review.types';

export const mockReviews: Review[] = [
  {
    id: 'review-1',
    productId: 'test-product-1',
    rating: 5,
    comment: 'Excellent product! Highly recommended. Great quality and fast delivery.',
    authorName: 'John D.',
    createdAt: '2024-01-15T10:00:00Z',
    isVerifiedPurchase: true,
    helpfulCount: 15,
    reportCount: 0,
  },
  {
    id: 'review-2',
    productId: 'test-product-1',
    rating: 4,
    comment: 'Good quality, fast delivery. Minor issues with packaging.',
    authorName: 'Sarah M.',
    createdAt: '2024-01-20T14:30:00Z',
    isVerifiedPurchase: true,
    helpfulCount: 8,
    reportCount: 0,
  },
  {
    id: 'review-3',
    productId: 'test-product-1',
    rating: 5,
    comment: 'Perfect! Exactly what I was looking for.',
    authorName: 'Mike R.',
    createdAt: '2024-01-22T09:15:00Z',
    isVerifiedPurchase: false,
    helpfulCount: 5,
    reportCount: 0,
  },
  {
    id: 'review-4',
    productId: 'test-product-1',
    rating: 3,
    comment: 'Decent product but could be better. Price is a bit high.',
    authorName: 'Emma L.',
    createdAt: '2024-01-25T16:45:00Z',
    isVerifiedPurchase: true,
    helpfulCount: 3,
    reportCount: 0,
  },
  {
    id: 'review-5',
    productId: 'test-product-1',
    rating: 4,
    comment: 'Very satisfied with my purchase. Would buy again.',
    authorName: 'Alex T.',
    createdAt: '2024-01-28T11:20:00Z',
    isVerifiedPurchase: true,
    helpfulCount: 12,
    reportCount: 0,
  },
];

export const mockProductRating: ProductRating = {
  productId: 'test-product-1',
  averageRating: 4.2,
  totalReviews: 42,
  ratingDistribution: {
    1: 2,
    2: 3,
    3: 8,
    4: 15,
    5: 14,
  },
};

export const mockPaginatedReviews: PaginatedReviews = {
  reviews: mockReviews,
  total: 42,
  page: 1,
  limit: 10,
  hasMore: true,
};

export function generateMockReview(overrides?: Partial<Review>): Review {
  return {
    id: `review-${Math.random().toString(36).substr(2, 9)}`,
    productId: 'test-product-1',
    rating: Math.floor(Math.random() * 5) + 1,
    comment: 'This is a generated review comment.',
    authorName: 'Test User',
    createdAt: new Date().toISOString(),
    isVerifiedPurchase: Math.random() > 0.5,
    helpfulCount: Math.floor(Math.random() * 20),
    reportCount: 0,
    ...overrides,
  };
}
