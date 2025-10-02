/**
 * CommerceTools E2E Integration Tests
 * Tests actual CommerceTools API integration
 * 
 * Note: These tests require valid CommerceTools credentials
 * Set environment variables or they will be skipped
 */

import { commerceToolsService } from './commercetools.service';
import { config } from '../config';
import { logger } from '../config/logger';

// Skip tests if credentials are not configured
const hasCredentials = !!(
  config.commerceTools.projectKey && 
  config.commerceTools.clientId && 
  config.commerceTools.clientSecret
);

const describeIf = (condition: boolean) => condition ? describe : describe.skip;

describeIf(hasCredentials)('CommerceTools E2E Integration', () => {
  // Test product ID - should exist in your CommerceTools project
  const testProductId = process.env.TEST_PRODUCT_ID || 'test-product-id';
  const testUserId = `e2e-test-${Date.now()}`;

  beforeAll(() => {
    logger.info('Starting E2E tests with CommerceTools API', {
      projectKey: config.commerceTools.projectKey,
      apiUrl: config.commerceTools.apiUrl,
      testProductId,
    });
  });

  describe('Health Check', () => {
    it('should successfully connect to CommerceTools API', async () => {
      const isHealthy = await commerceToolsService.healthCheck();
      expect(isHealthy).toBe(true);
    });
  });

  describe('Product Rating', () => {
    it('should fetch product rating from CommerceTools', async () => {
      const rating = await commerceToolsService.getProductRating(testProductId);
      
      expect(rating).toBeDefined();
      expect(rating.productId).toBe(testProductId);
      expect(rating.averageRating).toBeGreaterThanOrEqual(0);
      expect(rating.averageRating).toBeLessThanOrEqual(5);
      expect(rating.totalReviews).toBeGreaterThanOrEqual(0);
      expect(rating.ratingDistribution).toBeDefined();
      expect(Object.keys(rating.ratingDistribution)).toHaveLength(5);
    });

    it('should return valid rating distribution', async () => {
      const rating = await commerceToolsService.getProductRating(testProductId);
      
      const distribution = rating.ratingDistribution;
      const sum = distribution[1] + distribution[2] + distribution[3] + distribution[4] + distribution[5];
      
      expect(sum).toBe(rating.totalReviews);
    });
  });

  describe('Product Reviews', () => {
    it('should fetch product reviews from CommerceTools', async () => {
      const reviews = await commerceToolsService.getProductReviews(testProductId);
      
      expect(reviews).toBeDefined();
      expect(reviews.reviews).toBeInstanceOf(Array);
      expect(reviews.total).toBeGreaterThanOrEqual(0);
      expect(reviews.page).toBe(1);
      expect(reviews.limit).toBeGreaterThan(0);
      expect(typeof reviews.hasMore).toBe('boolean');
    });

    it('should support pagination', async () => {
      const page1 = await commerceToolsService.getProductReviews(testProductId, 1, 5);
      const page2 = await commerceToolsService.getProductReviews(testProductId, 2, 5);
      
      expect(page1.page).toBe(1);
      expect(page2.page).toBe(2);
      
      if (page1.reviews.length > 0 && page2.reviews.length > 0) {
        expect(page1.reviews[0].id).not.toBe(page2.reviews[0].id);
      }
    });

    it('should support filtering by rating', async () => {
      const fiveStarReviews = await commerceToolsService.getProductReviews(
        testProductId,
        1,
        10,
        { rating: 5 }
      );
      
      expect(fiveStarReviews.reviews.every(r => r.rating === 5)).toBe(true);
    });

    it('should support sorting by rating', async () => {
      const sortedAsc = await commerceToolsService.getProductReviews(
        testProductId,
        1,
        10,
        { sortBy: 'rating', sortOrder: 'asc' }
      );
      
      if (sortedAsc.reviews.length > 1) {
        for (let i = 1; i < sortedAsc.reviews.length; i++) {
          expect(sortedAsc.reviews[i].rating).toBeGreaterThanOrEqual(
            sortedAsc.reviews[i - 1].rating
          );
        }
      }
    });
  });

  describe('Create Review', () => {
    it('should create a new review in CommerceTools', async () => {
      const reviewInput = {
        productId: testProductId,
        rating: 5,
        comment: 'E2E Test Review - Excellent product!',
        authorName: 'E2E Test User',
      };

      const review = await commerceToolsService.createReview(reviewInput, testUserId);
      
      expect(review).toBeDefined();
      expect(review.id).toBeDefined();
      expect(review.productId).toBe(testProductId);
      expect(review.rating).toBe(5);
      expect(review.comment).toContain('E2E Test Review');
      expect(review.authorName).toBe('E2E Test User');
      expect(review.createdAt).toBeInstanceOf(Date);
    });

    it('should validate rating range', async () => {
      const invalidReview = {
        productId: testProductId,
        rating: 6, // Invalid
        comment: 'Test',
        authorName: 'Test User',
      };

      await expect(
        commerceToolsService.createReview(invalidReview, `${testUserId}-invalid`)
      ).rejects.toThrow('Rating must be between');
    });

    it('should validate comment length', async () => {
      const invalidReview = {
        productId: testProductId,
        rating: 5,
        comment: 'x'.repeat(1001), // Too long
        authorName: 'Test User',
      };

      await expect(
        commerceToolsService.createReview(invalidReview, `${testUserId}-long`)
      ).rejects.toThrow('Comment must not exceed');
    });

    it('should prevent duplicate reviews from same user', async () => {
      const reviewInput = {
        productId: testProductId,
        rating: 4,
        comment: 'Duplicate test',
        authorName: 'Test User',
      };

      const duplicateUserId = `e2e-duplicate-${Date.now()}`;

      // Create first review
      await commerceToolsService.createReview(reviewInput, duplicateUserId);

      // Attempt to create duplicate
      await expect(
        commerceToolsService.createReview(reviewInput, duplicateUserId)
      ).rejects.toThrow('already reviewed');
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent product gracefully', async () => {
      const nonExistentProductId = 'non-existent-product-12345';
      
      const rating = await commerceToolsService.getProductRating(nonExistentProductId);
      
      // Should return empty rating, not throw error
      expect(rating.totalReviews).toBe(0);
      expect(rating.averageRating).toBe(0);
    });

    it('should handle API errors gracefully', async () => {
      // Test with invalid product ID format
      const result = await commerceToolsService.createReview(
        {
          productId: '', // Invalid
          rating: 5,
          comment: 'Test',
          authorName: 'Test',
        },
        testUserId
      );
      
      // In mock mode, this might succeed but productId should be empty
      // In real API mode, this would fail
      expect(result.productId).toBe('');
    });
  });
});

// Add information about skipped tests
if (!hasCredentials) {
  console.log('\n⚠️  CommerceTools E2E tests SKIPPED');
  console.log('   To run these tests, set the following environment variables:');
  console.log('   - CTP_PROJECT_KEY');
  console.log('   - CTP_CLIENT_ID');
  console.log('   - CTP_CLIENT_SECRET');
  console.log('   - TEST_PRODUCT_ID (optional, defaults to "test-product-id")\n');
}
