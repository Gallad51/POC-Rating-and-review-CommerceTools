# 🎨 Frontend Service

Static frontend application for the Ratings & Reviews POC.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build static assets
npm run build

# Start development server
npm run dev

# Start production server
npm start
```

## 📁 Structure

```
frontend/
├── 📄 server.js           # Node.js static file server
├── 📄 package.json        # Dependencies
├── 📁 public/             # Source files
│   └── 📄 index.html      # Main application
└── 📁 dist/               # Built assets (generated)
```

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment (dev/preview/prod)
- `BACKEND_URL` - Backend API URL (auto-configured in CI/CD)

## 🐳 Docker

```bash
# Build image
docker build -t ratings-frontend .

# Run container
docker run -p 8080:8080 ratings-frontend
```

## 🌐 Features

- Responsive design
- Real-time API integration
- Health check endpoint
- Static asset caching