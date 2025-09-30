# Use official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy compiled JavaScript files
COPY dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app
USER nodejs

# Expose the port that the app runs on
EXPOSE 8080

# Health check (required for Cloud Run)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.request({hostname: 'localhost', port: 8080, path: '/health', timeout: 2000}, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); req.on('error', () => process.exit(1)); req.end();"

# Start the application
CMD ["npm", "start"]