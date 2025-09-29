# 🔧 Backend Service

Node.js/TypeScript API service for the Ratings & Reviews POC.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📋 API Endpoints

### Health Check
- `GET /health` - Service health status

### Ratings API
- `GET /api/ratings` - List all ratings
- `POST /api/ratings` - Create new rating

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment (dev/preview/prod)
- `API_KEY` - External API key (from Secret Manager)

## 🐳 Docker

```bash
# Build image
docker build -t ratings-backend .

# Run container
docker run -p 8080:8080 ratings-backend
```

## 📊 Monitoring

- Health check: `http://localhost:8080/health`
- API test: `http://localhost:8080/api/ratings`