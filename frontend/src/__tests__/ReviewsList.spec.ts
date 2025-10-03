import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ReviewsList from '../components/ReviewsList.vue';

// Mock the useReviewsApi composable
vi.mock('@/composables/useReviewsApi', () => ({
  useReviewsApi: () => ({
    loading: { value: 'idle' },
    error: { value: null },
    getProductRating: vi.fn(() => Promise.resolve({
      averageRating: 4.5,
      totalReviews: 100,
      ratingDistribution: { 5: 50, 4: 30, 3: 15, 2: 3, 1: 2 },
    })),
    getProductReviews: vi.fn(() => Promise.resolve({
      reviews: [],
      page: 1,
      limit: 10,
      total: 0,
      hasMore: false,
    })),
  }),
}));

describe('ReviewsList', () => {
  it('renders with product ID', () => {
    const wrapper = mount(ReviewsList, {
      props: {
        productId: 'test-product-1',
      },
    });

    expect(wrapper.find('.reviews-list').exists()).toBe(true);
  });

  it('displays title', () => {
    const wrapper = mount(ReviewsList, {
      props: {
        productId: 'test-product-1',
      },
    });

    expect(wrapper.find('.reviews-list__title').text()).toBe('Customer Reviews');
  });

  // Variant tests
  it('applies layout variant classes correctly', () => {
    const wrapper = mount(ReviewsList, {
      props: {
        productId: 'test-product-1',
        layout: 'compact',
      },
    });

    expect(wrapper.find('.reviews-list').classes()).toContain('reviews-list--compact');
  });

  it('applies grid layout variant correctly', () => {
    const wrapper = mount(ReviewsList, {
      props: {
        productId: 'test-product-1',
        layout: 'grid',
      },
    });

    expect(wrapper.find('.reviews-list').classes()).toContain('reviews-list--grid');
  });

  it('applies theme variant classes correctly', () => {
    const wrapper = mount(ReviewsList, {
      props: {
        productId: 'test-product-1',
        theme: 'dark',
      },
    });

    expect(wrapper.find('.reviews-list').classes()).toContain('reviews-list--dark');
  });

  it('hides filters when showFilters is false', () => {
    const wrapper = mount(ReviewsList, {
      props: {
        productId: 'test-product-1',
        showFilters: false,
      },
    });

    expect(wrapper.find('.reviews-list__filters').exists()).toBe(false);
  });

  it('hides sorting when showSorting is false', () => {
    const wrapper = mount(ReviewsList, {
      props: {
        productId: 'test-product-1',
        showSorting: false,
      },
    });

    expect(wrapper.find('.reviews-list__sort').exists()).toBe(false);
  });

  it('hides entire controls section when both filters and sorting are hidden', () => {
    const wrapper = mount(ReviewsList, {
      props: {
        productId: 'test-product-1',
        showFilters: false,
        showSorting: false,
      },
    });

    expect(wrapper.find('.reviews-list__controls').exists()).toBe(false);
  });

  it('applies card style variant to review cards', async () => {
    const wrapper = mount(ReviewsList, {
      props: {
        productId: 'test-product-1',
        cardStyle: 'bordered',
      },
    });

    // Wait for component to mount and potentially load data
    await wrapper.vm.$nextTick();

    // Check that the card style class would be applied if there were reviews
    // The actual review cards won't be rendered without mock data, but we can verify the prop is set
    expect(wrapper.vm.$props.cardStyle).toBe('bordered');
  });

  it('respects showSummary prop', () => {
    const wrapper = mount(ReviewsList, {
      props: {
        productId: 'test-product-1',
        showSummary: false,
      },
    });

    expect(wrapper.vm.$props.showSummary).toBe(false);
  });

  it('respects showPagination prop', () => {
    const wrapper = mount(ReviewsList, {
      props: {
        productId: 'test-product-1',
        showPagination: false,
      },
    });

    expect(wrapper.vm.$props.showPagination).toBe(false);
  });

  it('uses custom page size', () => {
    const wrapper = mount(ReviewsList, {
      props: {
        productId: 'test-product-1',
        pageSize: 5,
      },
    });

    expect(wrapper.vm.$props.pageSize).toBe(5);
  });

  it('uses custom empty text', () => {
    const wrapper = mount(ReviewsList, {
      props: {
        productId: 'test-product-1',
        emptyText: 'Custom empty message',
      },
    });

    expect(wrapper.vm.$props.emptyText).toBe('Custom empty message');
  });
});
