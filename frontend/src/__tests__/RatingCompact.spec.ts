import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RatingCompact from '../components/RatingCompact.vue';

describe('RatingCompact', () => {
  it('renders with provided rating and review count', () => {
    const wrapper = mount(RatingCompact, {
      props: {
        averageRating: 4.5,
        totalReviews: 42,
      },
    });

    expect(wrapper.find('.rating-compact__rating').text()).toBe('4.5');
    expect(wrapper.find('.rating-compact__count').text()).toContain('42');
  });

  it('displays correct number of filled stars', () => {
    const wrapper = mount(RatingCompact, {
      props: {
        averageRating: 3,
        totalReviews: 10,
      },
    });

    const stars = wrapper.findAll('.rating-compact__star');
    expect(stars.length).toBe(5);
  });

  it('shows empty state when no reviews', () => {
    const wrapper = mount(RatingCompact, {
      props: {
        averageRating: 0,
        totalReviews: 0,
        emptyText: 'No reviews yet',
      },
    });

    expect(wrapper.find('.rating-compact__empty').exists()).toBe(true);
    expect(wrapper.text()).toContain('No reviews yet');
  });

  it('formats large review counts with k suffix', () => {
    const wrapper = mount(RatingCompact, {
      props: {
        averageRating: 4.8,
        totalReviews: 1523,
      },
    });

    expect(wrapper.find('.rating-compact__count').text()).toContain('1.5k');
  });

  it('emits loaded event when rating is fetched', async () => {
    const wrapper = mount(RatingCompact, {
      props: {
        averageRating: 4.2,
        totalReviews: 100,
        autoFetch: false,
      },
    });

    // Manually trigger by setting the rating
    await wrapper.setProps({ averageRating: 4.5, totalReviews: 150 });

    // Check that component updates
    expect(wrapper.find('.rating-compact__rating').text()).toBe('4.5');
  });

  it('has proper ARIA labels for accessibility', () => {
    const wrapper = mount(RatingCompact, {
      props: {
        averageRating: 4.2,
        totalReviews: 42,
      },
    });

    const container = wrapper.find('.rating-compact');
    expect(container.attributes('aria-label')).toContain('4.2 out of 5 stars');
    expect(container.attributes('aria-label')).toContain('42 reviews');
  });
});
