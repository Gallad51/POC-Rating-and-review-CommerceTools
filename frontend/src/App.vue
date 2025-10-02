<template>
  <div id="app" class="app">
    <header class="app__header">
      <h1>🌟 Ratings & Reviews - Vue.js Components Demo</h1>
      <p>Interactive demonstration of the microfrontend components</p>
    </header>

    <main class="app__main">
      <!-- Component 1: Compact Rating Display -->
      <section class="demo-section">
        <h2 class="demo-section__title">Component 1: Compact Rating Display</h2>
        <p class="demo-section__description">
          Compact rating component suitable for product tiles in PLP (Product List Page).
        </p>

        <div class="demo-grid">
          <div class="demo-card">
            <h3>With API Data</h3>
            <RatingCompact
              product-id="test-product-1"
              :auto-fetch="false"
              :average-rating="mockProductRating.averageRating"
              :total-reviews="mockProductRating.totalReviews"
              @loaded="handleRatingLoaded"
              @error="handleError"
            />
          </div>

          <div class="demo-card">
            <h3>Loading State</h3>
            <RatingCompact
              product-id="loading-product"
              :auto-fetch="false"
            />
          </div>

          <div class="demo-card">
            <h3>No Reviews</h3>
            <RatingCompact
              :average-rating="0"
              :total-reviews="0"
            />
          </div>

          <div class="demo-card">
            <h3>High Rating</h3>
            <RatingCompact
              :average-rating="4.8"
              :total-reviews="1523"
            />
          </div>
        </div>

        <details class="demo-code">
          <summary>View Code Example</summary>
          <pre><code>&lt;RatingCompact
  product-id="test-product-1"
  :average-rating="4.2"
  :total-reviews="42"
  @loaded="handleRatingLoaded"
/&gt;</code></pre>
        </details>
      </section>

      <!-- Component 2: Full Reviews List -->
      <section class="demo-section">
        <h2 class="demo-section__title">Component 2: Reviews List (PDP)</h2>
        <p class="demo-section__description">
          Complete reviews display with rating summary, filters, sorting, and pagination.
        </p>

        <div class="demo-card demo-card--full">
          <ReviewsList
            product-id="test-product-1"
            :page-size="5"
            :show-summary="true"
            @reviews-loaded="handleReviewsLoaded"
            @vote-helpful="handleVoteHelpful"
            @report-review="handleReportReview"
          />
        </div>

        <details class="demo-code">
          <summary>View Code Example</summary>
          <pre><code>&lt;ReviewsList
  product-id="test-product-1"
  :page-size="10"
  :show-summary="true"
  @reviews-loaded="handleReviewsLoaded"
/&gt;</code></pre>
        </details>
      </section>

      <!-- Component 3: Review Form Button -->
      <section class="demo-section">
        <h2 class="demo-section__title">Component 3: Review Form Button & Modal</h2>
        <p class="demo-section__description">
          Button that opens a modal form for submitting new reviews with GDPR compliance.
        </p>

        <div class="demo-card">
          <ReviewFormButton
            product-id="test-product-1"
            button-text="Write Your Review"
            @submitted="handleReviewSubmitted"
            @opened="handleModalOpened"
            @closed="handleModalClosed"
            @error="handleError"
          />
        </div>

        <details class="demo-code">
          <summary>View Code Example</summary>
          <pre><code>&lt;ReviewFormButton
  product-id="test-product-1"
  button-text="Write a Review"
  :require-auth="false"
  @submitted="handleReviewSubmitted"
/&gt;</code></pre>
        </details>
      </section>

      <!-- Event Log -->
      <section class="demo-section">
        <h2 class="demo-section__title">Event Log</h2>
        <p class="demo-section__description">
          Real-time log of events emitted by components.
        </p>

        <div class="event-log">
          <div
            v-for="(event, index) in eventLog"
            :key="index"
            class="event-log__item"
          >
            <span class="event-log__time">{{ event.time }}</span>
            <span class="event-log__name">{{ event.name }}</span>
            <span class="event-log__data">{{ event.data }}</span>
          </div>
          <p v-if="eventLog.length === 0" class="event-log__empty">
            No events yet. Interact with components to see events.
          </p>
        </div>
      </section>
    </main>

    <footer class="app__footer">
      <p>
        Built with Vue 3 + TypeScript | 
        <a href="https://github.com/Gallad51/POC-Rating-and-review-CommerceTools" target="_blank">
          View on GitHub
        </a>
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import RatingCompact from './components/RatingCompact.vue';
import ReviewsList from './components/ReviewsList.vue';
import ReviewFormButton from './components/ReviewFormButton.vue';
import { mockProductRating } from './utils/mockData';
import type { Review } from './types/review.types';

interface EventLogItem {
  time: string;
  name: string;
  data: string;
}

const eventLog = ref<EventLogItem[]>([]);

const logEvent = (name: string, data: any = '') => {
  const time = new Date().toLocaleTimeString();
  eventLog.value.unshift({
    time,
    name,
    data: typeof data === 'object' ? JSON.stringify(data) : String(data),
  });
  
  // Keep only last 20 events
  if (eventLog.value.length > 20) {
    eventLog.value = eventLog.value.slice(0, 20);
  }
};

const handleRatingLoaded = (rating: number, count: number) => {
  logEvent('rating-loaded', `Rating: ${rating}, Count: ${count}`);
};

const handleReviewsLoaded = (reviews: Review[]) => {
  logEvent('reviews-loaded', `Loaded ${reviews.length} reviews`);
};

const handleReviewSubmitted = (reviewId: string) => {
  logEvent('review-submitted', `Review ID: ${reviewId}`);
};

const handleModalOpened = () => {
  logEvent('modal-opened', 'Review form modal opened');
};

const handleModalClosed = () => {
  logEvent('modal-closed', 'Review form modal closed');
};

const handleVoteHelpful = (reviewId: string) => {
  logEvent('vote-helpful', `Review ID: ${reviewId}`);
};

const handleReportReview = (reviewId: string) => {
  logEvent('report-review', `Review ID: ${reviewId}`);
};

const handleError = (message: string) => {
  logEvent('error', message);
};
</script>

<style>
/* Global Styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f5;
  color: #333;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app__header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.app__header p {
  margin: 0;
  opacity: 0.9;
}

.app__main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

.demo-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.demo-section__title {
  margin: 0 0 0.5rem 0;
  color: #667eea;
  font-size: 1.5rem;
}

.demo-section__description {
  margin: 0 0 1.5rem 0;
  color: #666;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.demo-card {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
}

.demo-card--full {
  grid-column: 1 / -1;
}

.demo-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #666;
}

.demo-code {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.demo-code summary {
  cursor: pointer;
  font-weight: 600;
  color: #667eea;
}

.demo-code pre {
  margin: 1rem 0 0 0;
  padding: 1rem;
  background: #2d2d2d;
  color: #f8f8f2;
  border-radius: 4px;
  overflow-x: auto;
}

.demo-code code {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
}

.event-log {
  background: #2d2d2d;
  color: #f8f8f2;
  border-radius: 8px;
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
}

.event-log__item {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid #444;
}

.event-log__item:last-child {
  border-bottom: none;
}

.event-log__time {
  color: #888;
}

.event-log__name {
  color: #4caf50;
  font-weight: 600;
}

.event-log__data {
  color: #fff;
  word-break: break-all;
}

.event-log__empty {
  text-align: center;
  color: #888;
  padding: 2rem;
}

.app__footer {
  background: #333;
  color: white;
  text-align: center;
  padding: 1.5rem;
  margin-top: 2rem;
}

.app__footer a {
  color: #667eea;
  text-decoration: none;
}

.app__footer a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .app__header h1 {
    font-size: 1.5rem;
  }

  .app__main {
    padding: 1rem;
  }

  .demo-section {
    padding: 1rem;
  }

  .demo-grid {
    grid-template-columns: 1fr;
  }

  .event-log__item {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}
</style>
