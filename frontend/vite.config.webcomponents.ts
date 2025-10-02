import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Configuration for building Web Components bundle
export default defineConfig({
  plugins: [
    vue({
      customElement: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/custom-elements.ts'),
      name: 'RatingsReviewsComponents',
      fileName: (format) => `ratings-reviews-components.${format}.js`,
      formats: ['es', 'umd', 'iife'],
    },
    rollupOptions: {
      // Don't externalize Vue for web components - it needs to be bundled
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'ratings-reviews-components.css';
          }
          return assetInfo.name || '';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
  },
})
