# 🔧 Scripts Directory

Utility scripts for deployment, troubleshooting, and development.

## Available Scripts

### `setup-terraform-state-bucket.sh`

Interactive script to create and configure a GCS bucket for Terraform state storage.

**Usage:**
```bash
./scripts/setup-terraform-state-bucket.sh [project_id]
```

**Parameters:**
- `project_id` - (Optional) GCP Project ID. If not provided, will prompt for input.

**What it does:**
- ✅ Creates a GCS bucket for Terraform state
- ✅ Enables versioning for state recovery
- ✅ Sets uniform bucket-level access
- ✅ Grants Storage Object Admin role to GitHub Actions service account
- ✅ Provides instructions for GitHub configuration

**Example:**
```bash
# Interactive mode
./scripts/setup-terraform-state-bucket.sh

# With project ID
./scripts/setup-terraform-state-bucket.sh my-project-id
```

**After running:**
1. Add the bucket name to GitHub as `TF_STATE_BUCKET` secret/variable
2. Your workflows will automatically use this bucket for state storage
3. Each PR gets isolated state: `gs://bucket/terraform/state/pr-{NUMBER}/`

### `troubleshoot.sh`

Comprehensive troubleshooting script for CI/CD and Cloud Run deployment issues.

**Usage:**
```bash
./scripts/troubleshoot.sh [environment_name] [project_id] [region]
```

**Parameters:**
- `environment_name` - Environment to check (default: "dev")
- `project_id` - GCP Project ID (default: "ratings-reviews-poc")
- `region` - GCP Region (default: "europe-west1")

**What it checks:**
- ✅ Prerequisites (gcloud, docker, curl)
- ✅ Google Cloud authentication
- ✅ Project configuration
- ✅ Enabled APIs
- ✅ Cloud Run services
- ✅ Container images
- ✅ Health checks and endpoints
- ✅ Quotas and usage

**Example:**
```bash
# Check default development environment
./scripts/troubleshoot.sh

# Check specific PR environment
./scripts/troubleshoot.sh pr-123-feature-branch my-project-id europe-west1
```

## Development Helpers

### Quick Local Testing

```bash
# Start backend (from root directory)
cd backend && npm install && npm run build && npm start

# Start frontend (from root directory)  
cd frontend && npm install && npm run build && npm start

# Test both services
curl http://localhost:8080/health
```

### Docker Testing

```bash
# Build and test backend
cd backend && docker build -t test-backend . && docker run -p 8080:8080 test-backend

# Build and test frontend
cd frontend && docker build -t test-frontend . && docker run -p 8080:8080 test-frontend
```

### CI/CD Debugging

```bash
# Check GitHub Actions workflow
# View logs at: https://github.com/YOUR_ORG/YOUR_REPO/actions

# Manual deployment (requires gcloud auth)
gcloud run deploy ratings-reviews-backend-test \
  --image=gcr.io/PROJECT_ID/backend:TAG \
  --region=europe-west1 \
  --allow-unauthenticated
```