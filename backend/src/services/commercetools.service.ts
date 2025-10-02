/**
 * CommerceTools Service
 * Handles all interactions with CommerceTools API
 * Manages OAuth2 authentication and token refresh
 * 
 * Supports both real CommerceTools API and mock mode for testing
 */

import { 
  ClientBuilder, 
  type AuthMiddlewareOptions, 
  type HttpMiddlewareOptions 
} from '@commercetools/sdk-client-v2';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import type { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
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
  private apiRoot: ByProjectKeyRequestBuilder | null = null;
  private useMockMode: boolean;

  constructor() {
    this.useMockMode = this.shouldUseMockMode();
    
    if (this.useMockMode) {
      logger.info('CommerceTools service initialized in MOCK mode');
      this.initializeMockData();
    } else {
      logger.info('CommerceTools service initialized in REAL API mode');
      this.initializeCommerceToolsClient();
    }
  }

  /**
   * Determine if we should use mock mode based on configuration
   */
  private shouldUseMockMode(): boolean {
    const { projectKey, clientId, clientSecret } = config.commerceTools;
    
    // Use mock mode if any required credential is missing
    if (!projectKey || !clientId || !clientSecret) {
      logger.warn('CommerceTools credentials not fully configured, using mock mode');
      return true;
    }
    
    // Use mock mode in test environment
    if (config.nodeEnv === 'test') {
      return true;
    }
    
    return false;
  }

  /**
   * Initialize CommerceTools API client
   */
  private initializeCommerceToolsClient(): void {
    try {
      const { projectKey, clientId, clientSecret, apiUrl, authUrl, scopes } = config.commerceTools;

      const authMiddlewareOptions: AuthMiddlewareOptions = {
        host: authUrl,
        projectKey,
        credentials: {
          clientId,
          clientSecret,
        },
        scopes,
        fetch,
      };

      const httpMiddlewareOptions: HttpMiddlewareOptions = {
        host: apiUrl,
        fetch,
      };

      const client = new ClientBuilder()
        .withProjectKey(projectKey)
        .withClientCredentialsFlow(authMiddlewareOptions)
        .withHttpMiddleware(httpMiddlewareOptions)
        .withLoggerMiddleware()
        .build();

      this.apiRoot = createApiBuilderFromCtpClient(client).withProjectKey({
        projectKey,
      });

      logger.info('CommerceTools API client initialized successfully', {
        projectKey,
        apiUrl,
        authUrl,
      });
    } catch (error) {
      logger.error('Failed to initialize CommerceTools API client', { error });
      // Fall back to mock mode if initialization fails
      this.useMockMode = true;
      this.initializeMockData();
    }
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
      logger.info('Fetching product rating', { productId, useMockMode: this.useMockMode });

      if (this.useMockMode) {
        return this.getProductRatingFromMock(productId);
      }

      return this.getProductRatingFromApi(productId);
    } catch (error) {
      logger.error('Error fetching product rating', { productId, error });
      throw new Error('Failed to fetch product rating');
    }
  }

  /**
   * Get product rating from mock storage
   */
  private getProductRatingFromMock(productId: string): ProductRating {
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
  }

  /**
   * Get product rating from CommerceTools API
   */
  private async getProductRatingFromApi(productId: string): Promise<ProductRating> {
    if (!this.apiRoot) {
      throw new Error('CommerceTools API client not initialized');
    }

    try {
      // Build where clause - handle both UUID and key formats
      // CommerceTools Reviews API uses target references with typeId and id (UUID) or key
      const whereClause = this.isUUID(productId)
        ? `target(typeId="product" and id="${productId}")`
        : `key="${productId}"`; // Query by review key if productId is not UUID
      
      // Fetch reviews from CommerceTools API
      const response = await this.apiRoot
        .reviews()
        .get({
          queryArgs: {
            where: whereClause,
            limit: 500, // Get all reviews for rating calculation
          },
        })
        .execute();

      const reviews = response.body.results || [];
      const ratings = reviews
        .filter((r) => r.rating !== undefined && r.rating !== null)
        .map((r) => r.rating as number);

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
      logger.error('Error fetching product rating from API', { productId, error });
      throw error;
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
      logger.info('Fetching product reviews', { productId, page, limit, filters, useMockMode: this.useMockMode });

      if (this.useMockMode) {
        return this.getProductReviewsFromMockStorage(productId, page, limit, filters);
      }

      return this.getProductReviewsFromApi(productId, page, limit, filters);
    } catch (error) {
      logger.error('Error fetching product reviews', { productId, error });
      throw new Error('Failed to fetch product reviews');
    }
  }

  /**
   * Get paginated reviews from mock storage
   */
  private getProductReviewsFromMockStorage(
    productId: string,
    page: number = 1,
    limit: number = 10,
    filters?: ReviewFilters
  ): PaginatedReviews {
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
  }

  /**
   * Check if a string is a valid UUID
   */
  private isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Get paginated reviews from CommerceTools API
   */
  private async getProductReviewsFromApi(
    productId: string,
    page: number = 1,
    limit: number = 10,
    filters?: ReviewFilters
  ): Promise<PaginatedReviews> {
    if (!this.apiRoot) {
      throw new Error('CommerceTools API client not initialized');
    }

    try {
      const offset = (page - 1) * limit;
      // Build where clause - handle both UUID and key formats
      const targetClause = this.isUUID(productId)
        ? `target(typeId="product" and id="${productId}")`
        : `key="${productId}"`; // Query by review key if productId is not UUID
      const whereConditions: string[] = [targetClause];

      // Apply rating filter
      if (filters?.rating) {
        whereConditions.push(`rating=${filters.rating}`);
      }

      // Build sort string
      let sort = 'createdAt desc'; // Default sort
      if (filters?.sortBy === 'rating') {
        sort = `rating ${filters.sortOrder === 'asc' ? 'asc' : 'desc'}`;
      } else if (filters?.sortBy === 'date') {
        sort = `createdAt ${filters.sortOrder === 'asc' ? 'asc' : 'desc'}`;
      }

      const response = await this.apiRoot
        .reviews()
        .get({
          queryArgs: {
            where: whereConditions.join(' and '),
            limit,
            offset,
            sort,
          },
        })
        .execute();

      const ctReviews = response.body.results || [];
      const total = response.body.total || 0;

      // Convert CommerceTools reviews to our Review type
      const reviews: Review[] = ctReviews.map((ctReview) => ({
        id: ctReview.id,
        productId,
        rating: ctReview.rating || 0,
        comment: ctReview.text || '',
        authorName: ctReview.authorName || 'Anonymous',
        createdAt: new Date(ctReview.createdAt),
        isVerifiedPurchase: ctReview.includedInStatistics || false,
      }));

      // Apply verified filter (not directly supported by API query)
      let filteredReviews = reviews;
      if (filters?.verified !== undefined) {
        filteredReviews = reviews.filter((r) => r.isVerifiedPurchase === filters.verified);
      }

      return {
        reviews: filteredReviews,
        total,
        page,
        limit,
        hasMore: offset + filteredReviews.length < total,
      };
    } catch (error) {
      logger.error('Error fetching product reviews from API', { productId, error });
      throw error;
    }
  }

  /**
   * Create a new review
   * Includes anti-abuse checks
   */
  async createReview(reviewInput: ReviewInput, userId: string): Promise<Review> {
    try {
      logger.info('Creating new review', { productId: reviewInput.productId, userId, useMockMode: this.useMockMode });

      // Validate rating range
      if (reviewInput.rating < config.review.minRating || reviewInput.rating > config.review.maxRating) {
        throw new Error(`Rating must be between ${config.review.minRating} and ${config.review.maxRating}`);
      }

      // Validate comment length
      if (reviewInput.comment && reviewInput.comment.length > config.review.maxCommentLength) {
        throw new Error(`Comment must not exceed ${config.review.maxCommentLength} characters`);
      }

      if (this.useMockMode) {
        return this.createReviewInMock(reviewInput, userId);
      }

      return this.createReviewInApi(reviewInput, userId);
    } catch (error: any) {
      logger.error('Error creating review', { error, userId });
      throw error;
    }
  }

  /**
   * Create review in mock storage
   */
  private createReviewInMock(reviewInput: ReviewInput, userId: string): Review {
    // Check for duplicate reviews (anti-abuse)
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

    logger.info('Review created successfully in mock storage', { reviewId: newReview.id, userId });

    // Return without internal fields
    const { version, userId: internalUserId, ...review } = newReview;
    return review;
  }

  /**
   * Create review in CommerceTools API
   */
  private async createReviewInApi(reviewInput: ReviewInput, userId: string): Promise<Review> {
    if (!this.apiRoot) {
      throw new Error('CommerceTools API client not initialized');
    }

    try {
      // Create review draft
      // Build target reference based on productId format (UUID vs key)
      const target = this.isUUID(reviewInput.productId)
        ? {
            typeId: 'product' as const,
            id: reviewInput.productId,
          }
        : {
            typeId: 'product' as const,
            key: reviewInput.productId,
          };

      const reviewDraft = {
        authorName: reviewInput.authorName || 'Anonymous',
        text: reviewInput.comment,
        rating: reviewInput.rating,
        target,
        key: `review-${userId}-${reviewInput.productId}-${Date.now()}`,
        uniquenessValue: userId, // Use userId to prevent duplicates
      };

      const response = await this.apiRoot
        .reviews()
        .post({
          body: reviewDraft,
        })
        .execute();

      const ctReview = response.body;

      logger.info('Review created successfully in CommerceTools API', {
        reviewId: ctReview.id,
        userId,
      });

      // Convert to our Review type
      return {
        id: ctReview.id,
        productId: reviewInput.productId,
        rating: ctReview.rating || 0,
        comment: ctReview.text || '',
        authorName: ctReview.authorName || 'Anonymous',
        createdAt: new Date(ctReview.createdAt),
        isVerifiedPurchase: ctReview.includedInStatistics || false,
      };
    } catch (error: any) {
      // Check for duplicate review error
      if (error.statusCode === 400 && error.message?.includes('DuplicateField')) {
        throw new Error('You have already reviewed this product');
      }
      logger.error('Error creating review in API', { error, userId });
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
      if (this.useMockMode) {
        // In mock mode, just check if service is initialized
        return this.mockReviews !== null && this.mockReviews !== undefined;
      }

      // In API mode, make an actual API call to verify connection
      if (!this.apiRoot) {
        return false;
      }

      // Try to fetch project info as a lightweight health check
      await this.apiRoot
        .get()
        .execute();

      logger.info('CommerceTools API health check passed');
      return true;
    } catch (error) {
      logger.error('CommerceTools health check failed', { error });
      return false;
    }
  }
}

export const commerceToolsService = new CommerceToolsService();
