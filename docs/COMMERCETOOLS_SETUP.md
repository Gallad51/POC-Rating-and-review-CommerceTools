# 🛠️ CommerceTools Integration Setup Guide

This guide explains how to integrate this POC with CommerceTools for managing product ratings and reviews.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Getting CommerceTools Trial Account](#getting-commercetools-trial-account)
- [Creating API Client](#creating-api-client)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [Testing the Integration](#testing-the-integration)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This project can work in two modes:

1. **Mock Mode** (Default for POC): Uses in-memory mock data for testing and development
2. **Production Mode**: Integrates with actual CommerceTools API

The configuration is already set up in the codebase. You just need to provide your CommerceTools credentials.

## ✅ Prerequisites

Before starting, ensure you have:

- A valid email address for CommerceTools registration
- Access to this repository
- Basic understanding of environment variables
- (Optional) Node.js installed for local testing

## 🚀 Getting CommerceTools Trial Account

### Step 1: Sign Up for CommerceTools Free Trial

1. Navigate to [CommerceTools Website](https://commercetools.com/)
2. Click on **"Start Free Trial"** or **"Get Started"**
3. Fill in the registration form:
   - Business email address
   - Company name
   - First and last name
   - Country and region
4. Agree to Terms of Service
5. Click **"Create Account"**
6. Verify your email address by clicking the link in the confirmation email

### Step 2: Access the Merchant Center

1. Log in to [Merchant Center](https://mc.commercetools.com/)
2. You should see your trial project dashboard
3. Note your **Project Key** (visible in the top navigation or project settings)

### Step 3: Access Composable Commerce Platform

1. From Merchant Center, navigate to **Settings** → **Developer Settings**
2. You should see the API Client management interface

## 🔑 Creating API Client

To connect your application to CommerceTools, you need to create an API Client with the appropriate scopes.

### Step-by-Step Instructions

1. **Navigate to API Clients**
   - In Merchant Center, go to **Settings** → **Developer settings** → **API clients**

2. **Create New API Client**
   - Click **"Create API client"** button
   - Give it a meaningful name: `ratings-reviews-poc` or similar

3. **Select Scopes**
   
   For this POC, you need the following scopes:
   
   - ✅ `view_products:{projectKey}` - Read product information
   - ✅ `manage_project:{projectKey}` - Manage reviews and ratings (recommended for full functionality)
   
   Alternatively, for more restricted access:
   - ✅ `view_products:{projectKey}` - Read product information
   - ✅ `manage_orders:{projectKey}` - If using order-related features
   
   **Note**: Replace `{projectKey}` with your actual project key (e.g., `view_products:my-trial-project`)

4. **Generate Credentials**
   - Click **"Create API client"**
   - **IMPORTANT**: Copy the credentials immediately. They will only be shown once!
   - Save the following information:
     - **Project Key**
     - **Client ID**
     - **Client Secret**
     - **API URL** (usually `https://api.europe-west1.gcp.commercetools.com` for EU region)
     - **Auth URL** (usually `https://auth.europe-west1.gcp.commercetools.com` for EU region)
     - **Scopes** (the ones you selected)

### Example Credentials (DO NOT USE THESE - They're just examples)

```
Project Key: my-trial-project-abc
Client ID: B9xT3kL7mN4pQ2wR5yH8jK1sD6fG0aZ
Client Secret: X4yU7vC2bN9mQ5wE8rT1yP3oI6uA0sD
API URL: https://api.europe-west1.gcp.commercetools.com
Auth URL: https://auth.europe-west1.gcp.commercetools.com
Scopes: manage_project:my-trial-project-abc view_products:my-trial-project-abc
```

## ⚙️ Configuration

### Option 1: Local Development (Using .env file)

1. **Create .env file in the backend directory**

   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit the .env file with your credentials**

   ```bash
   # Server Configuration
   PORT=8080
   NODE_ENV=development

   # CommerceTools Configuration
   CTP_PROJECT_KEY=your-actual-project-key
   CTP_CLIENT_ID=your-actual-client-id
   CTP_CLIENT_SECRET=your-actual-client-secret
   CTP_API_URL=https://api.europe-west1.gcp.commercetools.com
   CTP_AUTH_URL=https://auth.europe-west1.gcp.commercetools.com
   CTP_SCOPES=manage_project:your-project-key,view_products:your-project-key

   # JWT Configuration
   JWT_SECRET=change-this-secret-in-production-min-32-chars
   JWT_EXPIRES_IN=24h

   # Rate Limiting Configuration
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=10

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000,http://localhost:8080

   # Logging Configuration
   LOG_LEVEL=info
   ```

3. **Important Security Notes**
   - ❌ **NEVER commit the .env file to git**
   - ✅ The `.env` file is already in `.gitignore`
   - ✅ Only commit `.env.example` with placeholder values

### Option 2: GitHub Repository Secrets (For CI/CD)

If you're deploying via GitHub Actions, configure secrets in your repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add the following secrets:

   | Secret Name | Description | Example |
   |-------------|-------------|---------|
   | `COMMERCETOOLS_PROJECT_KEY` | Your project key | `my-trial-project` |
   | `COMMERCETOOLS_CLIENT_ID` | OAuth client ID | `B9xT3kL7...` |
   | `COMMERCETOOLS_CLIENT_SECRET` | OAuth client secret | `X4yU7vC2...` |
   | `COMMERCETOOLS_SCOPES` | API scopes | `manage_project:my-project view_products:my-project` |

**Note**: According to the issue, these secrets are already configured in the repository for testing purposes.

### Option 3: Google Cloud Secret Manager (For Production)

For production deployments on Google Cloud Run, secrets are managed via Secret Manager and configured in Terraform:

```hcl
# In infra/terraform.tfvars
enable_commercetools = true
ctp_project_key      = "your-project-key"
ctp_client_id        = "your-client-id"
ctp_client_secret    = "your-client-secret"
```

See [backend/docs/DEPLOYMENT.md](../backend/docs/DEPLOYMENT.md) for complete deployment instructions.

## 🌍 Environment Variables Reference

### Required Variables

| Variable | Description | Example Value | Notes |
|----------|-------------|---------------|-------|
| `CTP_PROJECT_KEY` | Your CommerceTools project identifier | `my-trial-project` | From Merchant Center |
| `CTP_CLIENT_ID` | OAuth 2.0 Client ID | `B9xT3kL...` | From API Client creation |
| `CTP_CLIENT_SECRET` | OAuth 2.0 Client Secret | `X4yU7vC...` | Keep this secret! |

### Optional Variables (with defaults)

| Variable | Description | Default Value | Notes |
|----------|-------------|---------------|-------|
| `CTP_API_URL` | CommerceTools API endpoint | `https://api.europe-west1.gcp.commercetools.com` | EU region default |
| `CTP_AUTH_URL` | CommerceTools Auth endpoint | `https://auth.europe-west1.gcp.commercetools.com` | EU region default |
| `CTP_SCOPES` | API scopes (comma-separated) | `manage_project,view_products,manage_orders` | Adjust based on your needs |

### Region-Specific URLs

CommerceTools is available in multiple regions. Use the appropriate URLs for your region:

| Region | API URL | Auth URL |
|--------|---------|----------|
| **Europe (GCP)** | `https://api.europe-west1.gcp.commercetools.com` | `https://auth.europe-west1.gcp.commercetools.com` |
| **US East (GCP)** | `https://api.us-central1.gcp.commercetools.com` | `https://auth.us-central1.gcp.commercetools.com` |
| **US East (AWS)** | `https://api.us-east-2.aws.commercetools.com` | `https://auth.us-east-2.aws.commercetools.com` |
| **Europe (AWS)** | `https://api.eu-central-1.aws.commercetools.com` | `https://auth.eu-central-1.aws.commercetools.com` |

## 🧪 Testing the Integration

### 1. Test Configuration

```bash
cd backend

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev
```

### 2. Verify Health Check

```bash
# Check general health
curl http://localhost:8080/health

# Check CommerceTools connection (when configured)
curl http://localhost:8080/api/reviews/health
```

Expected response when working:
```json
{
  "success": true,
  "message": "Reviews system is healthy"
}
```

### 3. Test API Endpoints

```bash
# Get product rating (mock data by default)
curl http://localhost:8080/api/products/test-product-1/rating

# Get product reviews
curl http://localhost:8080/api/products/test-product-1/reviews
```

## 🔍 Troubleshooting

### Issue: "Missing required environment variables"

**Symptom**: Application fails to start with environment variable errors

**Solution**:
1. Verify `.env` file exists in `backend/` directory
2. Check all required variables are set:
   ```bash
   cat backend/.env | grep CTP_
   ```
3. Ensure no extra spaces or quotes around values
4. Restart the development server

### Issue: "Authentication failed" or 401 errors

**Symptom**: API calls to CommerceTools fail with authentication errors

**Solution**:
1. Verify your Client ID and Client Secret are correct
2. Check that scopes include at least `view_products:{projectKey}`
3. Ensure the Project Key matches your CommerceTools project
4. Verify the Auth URL is correct for your region
5. Check if your trial has expired (CommerceTools trials last 60 days)

### Issue: "Project not found" or 404 errors

**Symptom**: Valid credentials but API returns 404

**Solution**:
1. Double-check your Project Key in Merchant Center
2. Verify the API URL matches your region
3. Ensure your trial account is active
4. Check that your project wasn't deleted or suspended

### Issue: "Insufficient permissions" or 403 errors

**Symptom**: Authentication works but operations fail

**Solution**:
1. Review the scopes assigned to your API client
2. Ensure you have at least `view_products:{projectKey}` scope
3. For write operations, you need `manage_project:{projectKey}`
4. Recreate API client with correct scopes if needed

### Issue: Mock data still showing after configuration

**Symptom**: Application still uses mock data instead of CommerceTools

**Solution**:
The current implementation (`backend/src/services/commercetools.service.ts`) is a mock service for POC purposes. To use actual CommerceTools API:

1. The service needs to be updated to use CommerceTools SDK (already installed)
2. Set `enable_commercetools=true` in infrastructure configuration
3. This is intentional for the POC phase to avoid costs and complexity

See the note in `commercetools.service.ts`:
```typescript
/**
 * Note: This is a mock implementation for POC
 * In production, integrate with actual CommerceTools SDK
 */
```

### Getting Help

If you encounter issues not covered here:

1. Check the [CommerceTools Documentation](https://docs.commercetools.com/)
2. Review [backend/docs/DEPLOYMENT.md](../backend/docs/DEPLOYMENT.md)
3. Check application logs: `npm run dev` shows real-time logs
4. Create an issue in this repository with error details

## 📚 Additional Resources

### CommerceTools Documentation

- [CommerceTools Getting Started](https://docs.commercetools.com/getting-started)
- [API Reference](https://docs.commercetools.com/api)
- [Authentication Guide](https://docs.commercetools.com/api/authorization)
- [SDK Documentation](https://docs.commercetools.com/sdk)
- [Reviews API](https://docs.commercetools.com/api/projects/reviews)

### Related Project Documentation

- [Backend API Documentation](../backend/README.md)
- [Deployment Guide](../backend/docs/DEPLOYMENT.md)
- [API Examples](../backend/docs/API_EXAMPLES.md)
- [Infrastructure Setup](../infra/README.md)

## 🔐 Security Best Practices

### DO ✅

- Store credentials in `.env` files (never commit them)
- Use GitHub Secrets for CI/CD pipelines
- Use Google Secret Manager for production deployments
- Rotate credentials periodically (every 90 days recommended)
- Use minimum required scopes for API clients
- Monitor API usage and set up alerts

### DON'T ❌

- Never commit `.env` files to git
- Don't share credentials in chat, email, or screenshots
- Don't use production credentials in development
- Don't give excessive scopes to API clients
- Don't embed credentials in code or documentation
- Don't reuse credentials across environments

## 📞 Support

For CommerceTools-specific questions:
- Visit [CommerceTools Support](https://support.commercetools.com/)
- Check [CommerceTools Community](https://commercetools.com/community)

For project-specific questions:
- Create an issue in this repository
- Review existing documentation in `/docs`
- Check the troubleshooting sections in other docs

---

**Ready to integrate?** Follow the steps above and start building with CommerceTools! 🚀
