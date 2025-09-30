const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Health check endpoint (required for Cloud Run)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'ratings-reviews-frontend',
    version: '1.0.0'
  });
});

// Serve static files
app.use(serveStatic(path.join(__dirname, 'dist'), {
  index: ['index.html'],
  setHeaders: (res, path) => {
    // Set cache headers for static assets
    if (path.endsWith('.js') || path.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));

// SPA fallback - serve index.html for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});