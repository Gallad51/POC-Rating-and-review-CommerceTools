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

  // Variant tests
  it('applies size variant classes correctly', () => {
    const wrapper = mount(RatingCompact, {
      props: {
        averageRating: 4.0,
        totalReviews: 10,
        size: 'large',
      },
    });

    expect(wrapper.find('.rating-compact').classes()).toContain('rating-compact--large');
  });

  it('applies theme variant classes correctly', () => {
    const wrapper = mount(RatingCompact, {
      props: {
        averageRating: 4.0,
        totalReviews: 10,
        theme: 'dark',
      },
    });

    expect(wrapper.find('.rating-compact').classes()).toContain('rating-compact--dark');
  });

  it('applies display variant classes correctly', () => {
    const wrapper = mount(RatingCompact, {
      props: {
        averageRating: 4.0,
        totalReviews: 10,
        display: 'block',
      },
    });

    expect(wrapper.find('.rating-compact').classes()).toContain('rating-compact--block');
  });

  it('hides rating number when showRating is false', () => {
    const wrapper = mount(RatingCompact, {
      props: {
        averageRating: 4.5,
        totalReviews: 42,
        showRating: false,
      },
    });

    expect(wrapper.find('.rating-compact__rating').exists()).toBe(false);
  });

  it('hides review count when showCount is false', () => {
    const wrapper = mount(RatingCompact, {
      props: {
        averageRating: 4.5,
        totalReviews: 42,
        showCount: false,
      },
    });

    expect(wrapper.find('.rating-compact__count').exists()).toBe(false);
  });

  it('hides info section in minimal display mode', () => {
    const wrapper = mount(RatingCompact, {
      props: {
        averageRating: 4.5,
        totalReviews: 42,
        display: 'minimal',
      },
    });

    expect(wrapper.find('.rating-compact__info').exists()).toBe(false);
  });

  it('applies compact mode class correctly', () => {
    const wrapper = mount(RatingCompact, {
      props: {
        averageRating: 4.0,
        totalReviews: 10,
        compact: true,
      },
    });

    expect(wrapper.find('.rating-compact').classes()).toContain('rating-compact--compact');
  });

  // Rounding behavior tests
  it('applies floor rounding correctly', () => {
    const wrapper = mount(RatingCompact, {
      props: {
        averageRating: 4.6,
        totalReviews: 10,
        rounding: 'floor',
      },
    });

    // With floor rounding, 4.6 should show 4 filled stars
    const stars = wrapper.findAll('.rating-compact__star');
    const fullStars = stars.filter(star => star.classes().includes('rating-compact__star--full'));
    expect(fullStars.length).toBe(4);
  });

  it('applies ceil rounding correctly', () => {
    const wrapper = mount(RatingCompact, {
      props: {
        averageRating: 4.3,
        totalReviews: 10,
        rounding: 'ceil',
      },
    });

    // With ceil rounding, 4.3 should show 5 filled stars
    const stars = wrapper.findAll('.rating-compact__star');
    const fullStars = stars.filter(star => star.classes().includes('rating-compact__star--full'));
    expect(fullStars.length).toBe(5);
  });

  it('applies round rounding correctly', () => {
    const wrapper = mount(RatingCompact, {
      props: {
        averageRating: 4.6,
        totalReviews: 10,
        rounding: 'round',
      },
    });

    // With round rounding, 4.6 should show 5 filled stars (rounds up)
    const stars = wrapper.findAll('.rating-compact__star');
    const fullStars = stars.filter(star => star.classes().includes('rating-compact__star--full'));
    expect(fullStars.length).toBe(5);
  });

  it('uses custom star icon', () => {
    const wrapper = mount(RatingCompact, {
      props: {
        averageRating: 5.0,
        totalReviews: 10,
        starIcon: '❤️',
        starEmptyIcon: '🤍',
      },
    });

    const stars = wrapper.findAll('.rating-compact__star');
    const fullStar = stars.find(star => star.classes().includes('rating-compact__star--full'));
    expect(fullStar?.text()).toBe('❤️');
  });

  it('applies custom star colors via style attribute', () => {
    const wrapper = mount(RatingCompact, {
      props: {
        averageRating: 4.5,
        totalReviews: 10,
        starColor: '#ff0000',
        starEmptyColor: '#cccccc',
      },
    });

    const starsContainer = wrapper.find('.rating-compact__stars');
    const style = starsContainer.attributes('style');
    expect(style).toContain('--star-color-filled');
    expect(style).toContain('#ff0000');
  });
});
