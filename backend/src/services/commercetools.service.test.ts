/**
 * CommerceTools Service Tests
 */

import { commerceToolsService } from './commercetools.service';

describe('CommerceTools Service', () => {
  describe('getProductRating', () => {
    it('should return product rating for existing product', async () => {
      const rating = await commerceToolsService.getProductRating('test-product-1');

      expect(rating).toHaveProperty('productId', 'test-product-1');
      expect(rating).toHaveProperty('averageRating');
      expect(rating).toHaveProperty('totalReviews');
      expect(rating).toHaveProperty('ratingDistribution');
      expect(rating.averageRating).toBeGreaterThanOrEqual(0);
      expect(rating.averageRating).toBeLessThanOrEqual(5);
    });

    it('should return zero reviews for non-existing product', async () => {
      const rating = await commerceToolsService.getProductRating('non-existing-product');

      expect(rating.totalReviews).toBe(0);
      expect(rating.averageRating).toBe(0);
    });

    it('should correctly calculate rating distribution', async () => {
      const rating = await commerceToolsService.getProductRating('test-product-1');

      const distribution = rating.ratingDistribution;
      expect(distribution).toHaveProperty('1');
      expect(distribution).toHaveProperty('2');
      expect(distribution).toHaveProperty('3');
      expect(distribution).toHaveProperty('4');
      expect(distribution).toHaveProperty('5');

      const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
      expect(total).toBe(rating.totalReviews);
    });
  });

  describe('getProductReviews', () => {
    it('should return paginated reviews', async () => {
      const result = await commerceToolsService.getProductReviews('test-product-1', 1, 10);

      expect(result).toHaveProperty('reviews');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.reviews)).toBe(true);
    });

    it('should filter reviews by rating', async () => {
      const result = await commerceToolsService.getProductReviews('test-product-1', 1, 10, {
        rating: 5,
      });

      result.reviews.forEach((review) => {
        expect(review.rating).toBe(5);
      });
    });

    it('should filter reviews by verified status', async () => {
      const result = await commerceToolsService.getProductReviews('test-product-1', 1, 10, {
        verified: true,
      });

      result.reviews.forEach((review) => {
        expect(review.isVerifiedPurchase).toBe(true);
      });
    });

    it('should sort reviews by rating ascending', async () => {
      const result = await commerceToolsService.getProductReviews('test-product-1', 1, 10, {
        sortBy: 'rating',
        sortOrder: 'asc',
      });

      for (let i = 1; i < result.reviews.length; i++) {
        expect(result.reviews[i].rating).toBeGreaterThanOrEqual(result.reviews[i - 1].rating);
      }
    });

    it('should sort reviews by rating descending', async () => {
      const result = await commerceToolsService.getProductReviews('test-product-1', 1, 10, {
        sortBy: 'rating',
        sortOrder: 'desc',
      });

      for (let i = 1; i < result.reviews.length; i++) {
        expect(result.reviews[i].rating).toBeLessThanOrEqual(result.reviews[i - 1].rating);
      }
    });

    it('should return empty array for non-existing product', async () => {
      const result = await commerceToolsService.getProductReviews('non-existing-product', 1, 10);

      expect(result.reviews).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('createReview', () => {
    it('should create a new review', async () => {
      const reviewInput = {
        productId: 'new-product',
        rating: 5,
        comment: 'Great product!',
        authorName: 'Test User',
      };

      const review = await commerceToolsService.createReview(reviewInput, 'test-user-1');

      expect(review).toHaveProperty('id');
      expect(review.productId).toBe(reviewInput.productId);
      expect(review.rating).toBe(reviewInput.rating);
      expect(review.comment).toBe(reviewInput.comment);
      expect(review.authorName).toBe(reviewInput.authorName);
      expect(review).toHaveProperty('createdAt');
    });

    it('should validate rating range - too low', async () => {
      const reviewInput = {
        productId: 'test-product',
        rating: 0,
        comment: 'Invalid rating',
      };

      await expect(
        commerceToolsService.createReview(reviewInput, 'test-user-1')
      ).rejects.toThrow('Rating must be between');
    });

    it('should validate rating range - too high', async () => {
      const reviewInput = {
        productId: 'test-product',
        rating: 6,
        comment: 'Invalid rating',
      };

      await expect(
        commerceToolsService.createReview(reviewInput, 'test-user-1')
      ).rejects.toThrow('Rating must be between');
    });

    it('should validate comment length', async () => {
      const longComment = 'a'.repeat(1001);
      const reviewInput = {
        productId: 'test-product',
        rating: 5,
        comment: longComment,
      };

      await expect(
        commerceToolsService.createReview(reviewInput, 'test-user-1')
      ).rejects.toThrow('Comment must not exceed');
    });

    it('should prevent duplicate reviews from same user', async () => {
      const reviewInput = {
        productId: 'duplicate-test-product',
        rating: 5,
        comment: 'First review',
      };

      // Create first review
      await commerceToolsService.createReview(reviewInput, 'duplicate-user');

      // Try to create duplicate
      await expect(
        commerceToolsService.createReview(reviewInput, 'duplicate-user')
      ).rejects.toThrow('You have already reviewed this product');
    });

    it('should allow review without comment', async () => {
      const reviewInput = {
        productId: 'comment-optional-product',
        rating: 4,
      };

      const review = await commerceToolsService.createReview(reviewInput, 'test-user-2');

      expect(review).toHaveProperty('id');
      expect(review.rating).toBe(4);
      expect(review.comment).toBeUndefined();
    });

    it('should allow review without author name', async () => {
      const reviewInput = {
        productId: 'author-optional-product',
        rating: 3,
        comment: 'Anonymous review',
      };

      const review = await commerceToolsService.createReview(reviewInput, 'test-user-3');

      expect(review).toHaveProperty('id');
      expect(review.authorName).toBeUndefined();
    });
  });

  describe('deleteReview', () => {
    it('should delete an existing review', async () => {
      // First create a review
      const reviewInput = {
        productId: 'delete-test-product',
        rating: 5,
        comment: 'To be deleted',
      };

      const review = await commerceToolsService.createReview(reviewInput, 'delete-user');

      // Delete it
      await expect(
        commerceToolsService.deleteReview(review.id, 1)
      ).resolves.not.toThrow();

      // Verify it's deleted
      const reviews = await commerceToolsService.getProductReviews('delete-test-product', 1, 10);
      expect(reviews.reviews.find((r) => r.id === review.id)).toBeUndefined();
    });

    it('should throw error for non-existing review', async () => {
      await expect(
        commerceToolsService.deleteReview('non-existing-review-id', 1)
      ).rejects.toThrow('Failed to delete review');
    });
  });

  describe('healthCheck', () => {
    it('should return true when service is healthy', async () => {
      const isHealthy = await commerceToolsService.healthCheck();

      expect(isHealthy).toBe(true);
    });
  });
});
