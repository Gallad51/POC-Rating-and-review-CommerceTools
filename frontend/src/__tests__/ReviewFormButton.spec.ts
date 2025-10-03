import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ReviewFormButton from '../components/ReviewFormButton.vue';

describe('ReviewFormButton', () => {
  beforeEach(() => {
    // Clear body for Teleport
    document.body.innerHTML = '<div id="app"></div>';
  });

  it('renders button with correct text', () => {
    const wrapper = mount(ReviewFormButton, {
      props: {
        productId: 'test-product-1',
        buttonText: 'Write a Review',
      },
    });

    expect(wrapper.find('.review-form-button').text()).toContain('Write a Review');
  });

  it('opens modal when button is clicked', async () => {
    const wrapper = mount(ReviewFormButton, {
      props: {
        productId: 'test-product-1',
      },
      attachTo: document.getElementById('app')!,
    });

    await wrapper.find('.review-form-button').trigger('click');
    await flushPromises();

    expect(wrapper.emitted('opened')).toBeTruthy();
    
    wrapper.unmount();
  });

  it('validates required rating field', async () => {
    const wrapper = mount(ReviewFormButton, {
      props: {
        productId: 'test-product-1',
      },
      attachTo: document.getElementById('app')!,
    });

    await wrapper.find('.review-form-button').trigger('click');
    await flushPromises();

    // The modal is teleported to body, so we need to query the document
    const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn?.disabled).toBe(true);
    
    wrapper.unmount();
  });

  it('has proper ARIA attributes for accessibility', async () => {
    const wrapper = mount(ReviewFormButton, {
      props: {
        productId: 'test-product-1',
        buttonLabel: 'Write a review for this product',
      },
      attachTo: document.getElementById('app')!,
    });

    const button = wrapper.find('.review-form-button');
    expect(button.attributes('aria-label')).toBe('Write a review for this product');

    await button.trigger('click');
    await flushPromises();

    const modal = document.querySelector('.review-modal');
    expect(modal?.getAttribute('role')).toBe('dialog');
    expect(modal?.getAttribute('aria-modal')).toBe('true');
    
    wrapper.unmount();
  });

  it('exposes open and close methods', () => {
    const wrapper = mount(ReviewFormButton, {
      props: {
        productId: 'test-product-1',
      },
    });

    expect(wrapper.vm.open).toBeDefined();
    expect(wrapper.vm.close).toBeDefined();
  });

  // Variant tests
  it('applies size variant classes correctly', () => {
    const wrapper = mount(ReviewFormButton, {
      props: {
        productId: 'test-product-1',
        size: 'large',
      },
    });

    expect(wrapper.find('.review-form-button').classes()).toContain('review-form-button--large');
  });

  it('applies variant style classes correctly', () => {
    const wrapper = mount(ReviewFormButton, {
      props: {
        productId: 'test-product-1',
        variant: 'outline',
      },
    });

    expect(wrapper.find('.review-form-button').classes()).toContain('review-form-button--outline');
  });

  it('applies position class to modal wrapper correctly', () => {
    const wrapper = mount(ReviewFormButton, {
      props: {
        productId: 'test-product-1',
        position: 'center',
      },
    });

    expect(wrapper.find('.review-form-modal').classes()).toContain('review-form-modal--center');
  });

  it('applies full-width class when fullWidth is true', () => {
    const wrapper = mount(ReviewFormButton, {
      props: {
        productId: 'test-product-1',
        fullWidth: true,
      },
    });

    expect(wrapper.find('.review-form-button').classes()).toContain('review-form-button--full-width');
  });

  it('hides icon when showIcon is false', () => {
    const wrapper = mount(ReviewFormButton, {
      props: {
        productId: 'test-product-1',
        showIcon: false,
      },
    });

    const icon = wrapper.find('.review-form-button span[aria-hidden="true"]');
    expect(icon.exists()).toBe(false);
  });

  it('shows icon when showIcon is true', () => {
    const wrapper = mount(ReviewFormButton, {
      props: {
        productId: 'test-product-1',
        showIcon: true,
      },
    });

    const icon = wrapper.find('.review-form-button span[aria-hidden="true"]');
    expect(icon.exists()).toBe(true);
  });
});

