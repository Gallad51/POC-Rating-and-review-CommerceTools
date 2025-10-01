/**
 * CommerceTools Service
 * Handles all interactions with CommerceTools API
 * Manages OAuth2 authentication and token refresh
 * 
 * Note: This is a mock implementation for POC
 * In production, integrate with actual CommerceTools SDK
 */

import { config } from '../config';
import { logger } from '../config/logger';
import type { Review, ReviewInput, ProductRating, PaginatedReviews, ReviewFilters } from '../types/review.types';

// Mock review storage for POC
interface MockReview extends Review {
  version: number;
}

class CommerceToolsService {
  private mockReviews: Map<string, MockReview[]> = new Map();
  private reviewIdCounter = 1;

  constructor() {
    this.initializeMockData();
  }

  /**
   * Initialize with some mock data for POC
   */
  private initializeMockData() {
    const mockReview1: MockReview = {
      id: 'review-1',
      productId: 'test-product-1',
      rating: 5,
      comment: 'Excellent product! Highly recommended.',
      authorName: 'John D.',
      createdAt: new Date('2024-01-15'),
      isVerifiedPurchase: true,
      version: 1,
    };

    const mockReview2: MockReview = {
      id: 'review-2',
      productId: 'test-product-1',
      rating: 4,
      comment: 'Good quality, fast delivery.',
      authorName: 'Sarah M.',
      createdAt: new Date('2024-01-20'),
      isVerifiedPurchase: true,
      version: 1,
    };

    this.mockReviews.set('test-product-1', [mockReview1, mockReview2]);
  }

  /**
   * Get reviews for a product from mock storage
   */
  private getProductReviewsFromMock(productId: string): MockReview[] {
    return this.mockReviews.get(productId) || [];
  }

  /**
   * Get product rating summary
   */
  async getProductRating(productId: string): Promise<ProductRating> {
    try {
      logger.info('Fetching product rating', { productId });

      const reviews = this.getProductReviewsFromMock(productId);
      const ratings = reviews.map((r) => r.rating);

      const ratingDistribution = {
        1: ratings.filter((r) => r === 1).length,
        2: ratings.filter((r) => r === 2).length,
        3: ratings.filter((r) => r === 3).length,
        4: ratings.filter((r) => r === 4).length,
        5: ratings.filter((r) => r === 5).length,
      };

      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;

      return {
        productId,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
        ratingDistribution,
      };
    } catch (error) {
      logger.error('Error fetching product rating', { productId, error });
      throw new Error('Failed to fetch product rating');
    }
  }

  /**
   * Get paginated reviews for a product
   */
  async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10,
    filters?: ReviewFilters
  ): Promise<PaginatedReviews> {
    try {
      logger.info('Fetching product reviews', { productId, page, limit, filters });

      let reviews = this.getProductReviewsFromMock(productId);

      // Apply filters
      if (filters?.rating) {
        reviews = reviews.filter((r) => r.rating === filters.rating);
      }

      if (filters?.verified !== undefined) {
        reviews = reviews.filter((r) => r.isVerifiedPurchase === filters.verified);
      }

      // Apply sorting
      if (filters?.sortBy === 'rating') {
        reviews.sort((a, b) => {
          const order = filters.sortOrder === 'asc' ? 1 : -1;
          return (a.rating - b.rating) * order;
        });
      } else {
        // Default sort by date
        reviews.sort((a, b) => {
          const order = filters?.sortOrder === 'asc' ? 1 : -1;
          return (b.createdAt.getTime() - a.createdAt.getTime()) * order;
        });
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      const paginatedReviews = reviews.slice(offset, offset + limit);
      const total = reviews.length;

      return {
        reviews: paginatedReviews,
        total,
        page,
        limit,
        hasMore: offset + paginatedReviews.length < total,
      };
    } catch (error) {
      logger.error('Error fetching product reviews', { productId, error });
      throw new Error('Failed to fetch product reviews');
    }
  }

  /**
   * Create a new review
   * Includes anti-abuse checks
   */
  async createReview(reviewInput: ReviewInput, userId: string): Promise<Review> {
    try {
      logger.info('Creating new review', { productId: reviewInput.productId, userId });

      // Validate rating range
      if (reviewInput.rating < config.review.minRating || reviewInput.rating > config.review.maxRating) {
        throw new Error(`Rating must be between ${config.review.minRating} and ${config.review.maxRating}`);
      }

      // Validate comment length
      if (reviewInput.comment && reviewInput.comment.length > config.review.maxCommentLength) {
        throw new Error(`Comment must not exceed ${config.review.maxCommentLength} characters`);
      }

      // Check for duplicate reviews (anti-abuse)
      const existingReviews = this.getProductReviewsFromMock(reviewInput.productId);
      // Find reviews with a userId property (we need to track this in the mock review)
      const existingProductReviews = this.mockReviews.get(reviewInput.productId) || [];
      const duplicateReview = existingProductReviews.find((r: any) => r.userId === userId);
      
      if (duplicateReview) {
        throw new Error('You have already reviewed this product');
      }

      // Create new review
      const newReview: any = {
        id: `review-${this.reviewIdCounter++}`,
        productId: reviewInput.productId,
        rating: reviewInput.rating,
        comment: reviewInput.comment,
        authorName: reviewInput.authorName,
        createdAt: new Date(),
        isVerifiedPurchase: false,
        version: 1,
        userId, // Track userId internally for duplicate detection
      };

      // Store in mock storage
      const productReviews = this.mockReviews.get(reviewInput.productId) || [];
      productReviews.push(newReview);
      this.mockReviews.set(reviewInput.productId, productReviews);

      logger.info('Review created successfully', { reviewId: newReview.id, userId });

      // Return without internal fields
      const { version, userId: internalUserId, ...review } = newReview;
      return review;
    } catch (error: any) {
      logger.error('Error creating review', { error, userId });
      throw error;
    }
  }

  /**
   * Delete a review (admin only)
   * Mock implementation for POC
   */
  async deleteReview(reviewId: string, version: number): Promise<void> {
    try {
      logger.info('Deleting review', { reviewId });

      // Find and remove the review from mock storage
      for (const [productId, reviews] of this.mockReviews.entries()) {
        const index = reviews.findIndex((r) => r.id === reviewId);
        if (index !== -1) {
          reviews.splice(index, 1);
          logger.info('Review deleted successfully', { reviewId });
          return;
        }
      }

      throw new Error('Review not found');
    } catch (error) {
      logger.error('Error deleting review', { reviewId, error });
      throw new Error('Failed to delete review');
    }
  }

  /**
   * Health check - verify connection to CommerceTools
   */
  async healthCheck(): Promise<boolean> {
    try {
      // For POC, we'll just check if the service is initialized
      // In production, make an actual API call to verify connection
      return this.mockReviews !== null && this.mockReviews !== undefined;
    } catch (error) {
      logger.error('CommerceTools health check failed', { error });
      return false;
    }
  }
}

export const commerceToolsService = new CommerceToolsService();
