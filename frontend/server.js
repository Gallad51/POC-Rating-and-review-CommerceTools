import express from 'express';
import serveStatic from 'serve-static';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

// Parse JSON bodies for POST requests
app.use(express.json());

// Health check endpoint (required for Cloud Run)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'ratings-reviews-frontend',
    version: '1.0.0'
  });
});

// Proxy API requests to backend
app.use('/api', async (req, res) => {
  try {
    // Build the backend URL with the full API path
    const backendUrl = `${BACKEND_URL}/api${req.url}`;
    console.log(`Proxying request: ${req.method} ${req.originalUrl} -> ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // Copy response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.status(response.status);
    const data = await response.text();
    res.send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Failed to reach backend service',
      details: error.message,
    });
  }
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
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});