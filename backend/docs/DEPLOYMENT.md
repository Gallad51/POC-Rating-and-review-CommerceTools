# Deployment Guide

Complete guide for deploying the backend API to production and preview environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [CI/CD Deployment](#cicd-deployment)
- [Environment Variables](#environment-variables)
- [Manual Deployment](#manual-deployment)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### 1. Google Cloud Platform Setup

Before deploying, you need:

1. **Google Cloud Project**
   ```bash
   # Create a new project or use existing
   gcloud projects create your-project-id --name="Ratings & Reviews"
   gcloud config set project your-project-id
   ```

2. **Enable Required APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```

3. **Service Account for CI/CD**
   ```bash
   # Create service account
   gcloud iam service-accounts create github-actions \
     --display-name="GitHub Actions Deployer"
   
   # Grant necessary roles
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:github-actions@your-project-id.iam.gserviceaccount.com" \
     --role="roles/run.admin"
   
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:github-actions@your-project-id.iam.gserviceaccount.com" \
     --role="roles/storage.admin"
   
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:github-actions@your-project-id.iam.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"
   
   # Create and download key
   gcloud iam service-accounts keys create key.json \
     --iam-account=github-actions@your-project-id.iam.gserviceaccount.com
   ```

### 2. CommerceTools Setup (Production)

For production deployment, you need CommerceTools credentials:

1. **Create CommerceTools Project**
   - Go to https://commercetools.com
   - Create a new project or use existing
   - Note your project key

2. **Create API Client**
   - In CommerceTools Merchant Center, go to Settings > Developer settings
   - Create a new API client with these scopes:
     - `manage_project`
     - `view_products`
     - `manage_orders`
   - Save the credentials (Client ID, Client Secret)

### 3. GitHub Repository Setup

Configure secrets and variables in your repository:

**Settings > Secrets and variables > Actions**

#### Required Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `GCP_SA_KEY` | Service account JSON key | From step 1.3 above (contents of key.json) |
| `GCP_PROJECT_ID` | Google Cloud Project ID | Your project ID (e.g., `ratings-reviews-poc`) |

#### Optional Secrets (Production)

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `CTP_PROJECT_KEY` | CommerceTools project key | Production only |
| `CTP_CLIENT_ID` | CommerceTools client ID | Production only |
| `CTP_CLIENT_SECRET` | CommerceTools client secret | Production only |
| `JWT_SECRET` | JWT signing secret | Production only |

#### Repository Variables

| Variable Name | Description | Default | Required |
|---------------|-------------|---------|----------|
| `GCP_REGION` | GCP region for deployment | `europe-west1` | No |

## CI/CD Deployment

### Automatic PR Preview Deployments

The repository is configured with GitHub Actions for automatic deployments:

#### How It Works

1. **Open a Pull Request** → Triggers preview deployment
2. **Push to PR** → Updates preview deployment
3. **Close/Merge PR** → Automatically cleans up preview environment

#### What Gets Deployed

Each PR creates isolated preview environments:
- Backend API service: `ratings-reviews-backend-pr-{number}-{branch}`
- Frontend service: `ratings-reviews-frontend-pr-{number}-{branch}`

#### Preview Deployment Process

```yaml
# .github/workflows/pr-preview.yml
on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches: [main]
```

**Steps:**
1. ✅ Checkout code
2. ✅ Install dependencies
3. ✅ Run tests
4. ✅ Build Docker images
5. ✅ Push to Google Container Registry
6. ✅ Deploy to Cloud Run
7. ✅ Run health checks
8. ✅ Comment PR with URLs

#### Environment Variables (Preview)

Preview deployments automatically set:
- `NODE_ENV=preview`
- `PORT=8080`
- JWT_SECRET uses default (not secure - preview only)
- CommerceTools uses mock service

### Production Deployment

Production deployment requires manual trigger or merge to main:

#### Option 1: GitHub Actions (Recommended)

Create `.github/workflows/production-deploy.yml`:

```yaml
name: Production Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  REGION: ${{ vars.GCP_REGION || 'europe-west1' }}

jobs:
  deploy-production:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Authenticate to GCP
      uses: google-github-actions/auth@v2
      with:
        credentials_json: ${{ secrets.GCP_SA_KEY }}
        project_id: ${{ env.PROJECT_ID }}
    
    - name: Set up Cloud SDK
      uses: google-github-actions/setup-gcloud@v2
    
    - name: Build and Deploy Backend
      run: |
        cd backend
        
        # Build image
        gcloud builds submit \
          --tag gcr.io/$PROJECT_ID/backend:${{ github.sha }}
        
        # Deploy to Cloud Run
        gcloud run deploy ratings-reviews-backend-prod \
          --image gcr.io/$PROJECT_ID/backend:${{ github.sha }} \
          --platform managed \
          --region $REGION \
          --allow-unauthenticated \
          --memory 1Gi \
          --cpu 2 \
          --min-instances 1 \
          --max-instances 100 \
          --set-env-vars "NODE_ENV=production" \
          --set-secrets "CTP_PROJECT_KEY=CTP_PROJECT_KEY:latest,CTP_CLIENT_ID=CTP_CLIENT_ID:latest,CTP_CLIENT_SECRET=CTP_CLIENT_SECRET:latest,JWT_SECRET=JWT_SECRET:latest" \
          --timeout 300
```

#### Option 2: Manual Deployment

```bash
# Set variables
export PROJECT_ID=your-project-id
export REGION=europe-west1
export IMAGE_TAG=prod-$(date +%Y%m%d-%H%M%S)

# Build and push
cd backend
docker build -t gcr.io/$PROJECT_ID/backend:$IMAGE_TAG .
docker push gcr.io/$PROJECT_ID/backend:$IMAGE_TAG

# Deploy
gcloud run deploy ratings-reviews-backend-prod \
  --image gcr.io/$PROJECT_ID/backend:$IMAGE_TAG \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 100 \
  --set-env-vars "NODE_ENV=production,PORT=8080" \
  --set-secrets "CTP_PROJECT_KEY=CTP_PROJECT_KEY:latest,CTP_CLIENT_ID=CTP_CLIENT_ID:latest,CTP_CLIENT_SECRET=CTP_CLIENT_SECRET:latest,JWT_SECRET=JWT_SECRET:latest" \
  --timeout 300
```

## Environment Variables

### Required for All Environments

| Variable | Description | Example | Set Via |
|----------|-------------|---------|---------|
| `PORT` | Server port | `8080` | Cloud Run (automatic) |
| `NODE_ENV` | Environment | `production` | Cloud Run deploy flag |

### Required for Production

| Variable | Description | Example | Set Via |
|----------|-------------|---------|---------|
| `CTP_PROJECT_KEY` | CommerceTools project | `your-project` | Secret Manager |
| `CTP_CLIENT_ID` | CommerceTools client ID | `abc123...` | Secret Manager |
| `CTP_CLIENT_SECRET` | CommerceTools secret | `xyz789...` | Secret Manager |
| `JWT_SECRET` | JWT signing secret | Random 32+ chars | Secret Manager |

### Optional

| Variable | Description | Default | Set Via |
|----------|-------------|---------|---------|
| `CTP_API_URL` | CommerceTools API URL | `https://api.europe-west1.gcp.commercetools.com` | Cloud Run deploy |
| `CTP_AUTH_URL` | CommerceTools Auth URL | `https://auth.europe-west1.gcp.commercetools.com` | Cloud Run deploy |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `60000` | Cloud Run deploy |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `10` | Cloud Run deploy |
| `CORS_ORIGIN` | Allowed CORS origins | `*` | Cloud Run deploy |
| `LOG_LEVEL` | Logging level | `info` | Cloud Run deploy |

### Setting Secrets in Google Secret Manager

For production, store sensitive values in Secret Manager:

```bash
# Create secrets
echo -n "your-commercetools-project-key" | \
  gcloud secrets create CTP_PROJECT_KEY --data-file=-

echo -n "your-client-id" | \
  gcloud secrets create CTP_CLIENT_ID --data-file=-

echo -n "your-client-secret" | \
  gcloud secrets create CTP_CLIENT_SECRET --data-file=-

# Generate strong JWT secret
openssl rand -base64 32 | \
  gcloud secrets create JWT_SECRET --data-file=-

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding CTP_PROJECT_KEY \
  --member="serviceAccount:$(gcloud run services describe ratings-reviews-backend-prod --region=$REGION --format='value(spec.template.spec.serviceAccountName)')" \
  --role="roles/secretmanager.secretAccessor"

# Repeat for all secrets...
```

### Setting Environment Variables via gcloud

```bash
# Update service with new environment variables
gcloud run services update ratings-reviews-backend-prod \
  --region $REGION \
  --set-env-vars "RATE_LIMIT_MAX_REQUESTS=100,LOG_LEVEL=warn" \
  --update-secrets "JWT_SECRET=JWT_SECRET:latest"
```

## Manual Deployment

### Local Testing Before Deployment

```bash
# 1. Create local .env file
cp .env.example .env
# Edit .env with your values

# 2. Install dependencies
npm install

# 3. Run tests
npm test
npm test -- --coverage

# 4. Build
npm run build

# 5. Test locally
npm start

# 6. Test with Docker
docker build -t backend-test .
docker run -p 8080:8080 --env-file .env backend-test
```

### Direct Docker Deployment

```bash
# Build
docker build -t gcr.io/$PROJECT_ID/backend:latest .

# Test locally
docker run -p 8080:8080 \
  -e NODE_ENV=production \
  -e CTP_PROJECT_KEY=your-key \
  -e CTP_CLIENT_ID=your-id \
  -e CTP_CLIENT_SECRET=your-secret \
  -e JWT_SECRET=your-jwt-secret \
  gcr.io/$PROJECT_ID/backend:latest

# Push
docker push gcr.io/$PROJECT_ID/backend:latest

# Deploy
gcloud run deploy ratings-reviews-backend \
  --image gcr.io/$PROJECT_ID/backend:latest \
  --platform managed \
  --region $REGION
```

## Post-Deployment

### Verification Steps

1. **Health Check**
   ```bash
   curl https://your-service-url/health
   ```

2. **API Test**
   ```bash
   # Test public endpoint
   curl https://your-service-url/api/products/test-product-1/rating
   
   # Test authenticated endpoint
   TOKEN=$(curl -X POST https://your-service-url/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"userId":"test"}' | jq -r '.data.token')
   
   curl -X POST https://your-service-url/api/products/test-product-1/reviews \
     -H "Authorization: ******" \
     -H "Content-Type: application/json" \
     -d '{"rating":5,"comment":"Test"}'
   ```

3. **Documentation**
   ```bash
   # Check Swagger UI
   open https://your-service-url/api-docs
   ```

### Monitoring

1. **View Logs**
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=ratings-reviews-backend-prod" \
     --limit 50 \
     --format json
   ```

2. **View Metrics**
   ```bash
   # Request count
   gcloud monitoring time-series list \
     --filter='metric.type="run.googleapis.com/request_count"' \
     --format=json
   ```

3. **Set Up Alerts**
   ```bash
   # Create uptime check
   gcloud monitoring uptime create https-uptime-check \
     --resource-type=uptime-url \
     --host=your-service-url \
     --path=/health
   ```

### Rollback

If issues occur after deployment:

```bash
# List revisions
gcloud run revisions list \
  --service=ratings-reviews-backend-prod \
  --region=$REGION

# Rollback to previous revision
gcloud run services update-traffic ratings-reviews-backend-prod \
  --region=$REGION \
  --to-revisions=ratings-reviews-backend-prod-00042-abc=100
```

## Troubleshooting

### Common Issues

#### 1. "Permission Denied" Errors

**Problem**: Service account lacks permissions

**Solution**:
```bash
# Grant required roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:your-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"
```

#### 2. "Container Failed to Start"

**Problem**: Environment variables missing or invalid

**Solution**:
```bash
# Check logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# Verify environment variables
gcloud run services describe ratings-reviews-backend-prod \
  --region=$REGION \
  --format=yaml
```

#### 3. "502 Bad Gateway"

**Problem**: Application crash or timeout

**Solution**:
```bash
# Increase timeout
gcloud run services update ratings-reviews-backend-prod \
  --region=$REGION \
  --timeout=300

# Increase memory
gcloud run services update ratings-reviews-backend-prod \
  --region=$REGION \
  --memory=1Gi
```

#### 4. "Image Not Found"

**Problem**: Docker image not pushed to GCR

**Solution**:
```bash
# Verify image exists
gcloud container images list --repository=gcr.io/$PROJECT_ID

# Push image
docker push gcr.io/$PROJECT_ID/backend:tag
```

#### 5. GitHub Actions Fails

**Problem**: Missing secrets or invalid configuration

**Solution**:
1. Verify secrets in GitHub Settings > Secrets
2. Check workflow logs in Actions tab
3. Verify service account has correct permissions

### Debug Checklist

- [ ] Service account has all required roles
- [ ] All required secrets are set in GitHub
- [ ] GCP APIs are enabled
- [ ] Docker image builds successfully locally
- [ ] Tests pass before deployment
- [ ] Environment variables are correctly set
- [ ] CommerceTools credentials are valid (production)
- [ ] JWT_SECRET is set and strong (production)
- [ ] CORS origins are configured correctly
- [ ] Region matches between all configurations

## Security Best Practices

### Production Deployment

1. **Use Secret Manager** for all sensitive data
2. **Change JWT_SECRET** from default value
3. **Restrict CORS** to specific domains
4. **Enable Cloud Armor** for DDoS protection (optional)
5. **Set up monitoring** and alerting
6. **Regular security updates** of dependencies
7. **Implement log aggregation** (Cloud Logging)
8. **Set up error tracking** (Sentry, Cloud Error Reporting)

### Environment Separation

Keep environments isolated:
- **Preview**: Uses mock data, default secrets
- **Staging**: Uses staging CommerceTools project
- **Production**: Uses production CommerceTools project, strong secrets

## Cost Management

### Preview Environments

- Automatically cleaned up when PR closes
- Scale to zero when not in use
- Use minimum resources (512Mi RAM, 1 CPU)

### Production

Monitor costs:
```bash
# View current month costs
gcloud billing accounts list
gcloud beta billing accounts describe ACCOUNT_ID

# Set budget alerts
gcloud billing budgets create \
  --billing-account=ACCOUNT_ID \
  --display-name="Monthly Budget" \
  --budget-amount=100USD
```

### Cost Optimization

1. Use Cloud Run's scale-to-zero feature
2. Set appropriate min/max instances
3. Enable CPU throttling
4. Use caching where possible
5. Implement request batching
6. Monitor and optimize cold starts

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [GitHub Actions for GCP](https://github.com/google-github-actions)
- [Secret Manager Best Practices](https://cloud.google.com/secret-manager/docs/best-practices)
- [Backend README](../README.md)
- [Security Checklist](./SECURITY_GDPR_CHECKLIST.md)

## Support

For deployment issues:
1. Check logs in Cloud Console
2. Review workflow logs in GitHub Actions
3. Verify all prerequisites are met
4. Check troubleshooting section above
5. Contact DevOps team

---

**Last Updated**: 2024-01-20  
**Version**: 1.0.0
