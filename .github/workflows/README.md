# GitHub Actions Workflows

This directory contains CI/CD workflows for the POC Rating and Review project.

## Workflows

### 1. PR Preview Deploy (`pr-preview.yml`)

**Trigger**: Pull requests to `main` branch (opened, synchronize, reopened)

**Purpose**: Automatically builds and deploys preview environments for each pull request.

**What it does**:
- Builds backend and frontend Docker images
- Runs unit tests
- Deploys to Google Cloud Run with unique environment names
- Posts deployment URLs as PR comments
- Automatically scales to zero when idle

**Environment Variables**:
- Uses preview-specific configuration (mock mode for CommerceTools by default)
- Sets `enable_commercetools=false` for preview environments
- Uses `create_backend_secrets=false` (no real secrets in preview)
- Can optionally use real CommerceTools credentials if configured

**CommerceTools Integration**:
- Preview environments run in mock mode by default (`enable_commercetools=false`)
- If you want to test with real CommerceTools API in preview:
  - Ensure `COMMERCETOOLS_PROJECT_KEY`, `COMMERCETOOLS_CLIENT_ID`, and `COMMERCETOOLS_CLIENT_SECRET` secrets are configured
  - The workflow will pass them to Terraform as environment variables
  - Set `enable_commercetools=true` in the Terraform plan command to activate
- Perfect for testing UI/UX changes without API costs (mock mode)
- Or test with real API integration when needed (real mode)

### 2. PR Preview Cleanup (`pr-cleanup.yml`)

**Trigger**: Pull request closed

**Purpose**: Automatically cleans up preview environments when PRs are closed or merged.

**What it does**:
- Deletes Cloud Run services
- Removes Docker images from GCR
- Destroys Terraform state
- Posts cleanup confirmation as PR comment

### 3. E2E Tests with CommerceTools (`e2e-tests.yml`) ⭐ NEW

**Trigger**: 
- Pull requests to `main` branch (opened, synchronize, reopened)
- Push to `main` branch
- Manual workflow dispatch

**Purpose**: Runs comprehensive E2E tests with real CommerceTools API integration.

**What it does**:
- Checks if CommerceTools secrets are configured
- Runs unit tests
- Runs E2E tests with real API if secrets available
- Posts test results as PR comments
- Uploads test artifacts

**Required Secrets**:
- `COMMERCETOOLS_PROJECT_KEY` - Your CommerceTools project key
- `COMMERCETOOLS_CLIENT_ID` - OAuth2 client ID
- `COMMERCETOOLS_CLIENT_SECRET` - OAuth2 client secret

**Optional Secrets**:
- `COMMERCETOOLS_API_URL` - API endpoint (defaults to EU region)
- `COMMERCETOOLS_AUTH_URL` - Auth endpoint (defaults to EU region)
- `COMMERCETOOLS_SCOPES` - API scopes (defaults to manage_project,view_products)
- `TEST_PRODUCT_ID` - Product ID for testing (defaults to test-product-id)

**Behavior**:
- ✅ If secrets configured: Runs E2E tests with real API
- ⚠️  If secrets missing: Skips E2E tests gracefully, shows warning

## Repository Secrets Setup

To enable E2E testing with CommerceTools:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:

### Required Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `COMMERCETOOLS_PROJECT_KEY` | Your CommerceTools project identifier | `my-trial-project` |
| `COMMERCETOOLS_CLIENT_ID` | OAuth 2.0 Client ID from API client | `B9xT3kL7mN...` |
| `COMMERCETOOLS_CLIENT_SECRET` | OAuth 2.0 Client Secret | `X4yU7vC2bN...` |

**Note**: The workflows map these to Terraform variables:
- `COMMERCETOOLS_PROJECT_KEY` → `TF_VAR_ctp_project_key`
- `COMMERCETOOLS_CLIENT_ID` → `TF_VAR_ctp_client_id`
- `COMMERCETOOLS_CLIENT_SECRET` → `TF_VAR_ctp_client_secret`

### Optional Secrets

| Secret Name | Description | Default |
|-------------|-------------|---------|
| `COMMERCETOOLS_API_URL` | API endpoint URL | `https://api.europe-west1.gcp.commercetools.com` |
| `COMMERCETOOLS_AUTH_URL` | Auth endpoint URL | `https://auth.europe-west1.gcp.commercetools.com` |
| `COMMERCETOOLS_SCOPES` | API scopes (comma-separated) | `manage_project,view_products` |
| `TEST_PRODUCT_ID` | Product ID to use in E2E tests | `test-product-id` |

### GCP Secrets (Already Configured)

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `GCP_SA_KEY` | Service Account JSON key | ✅ Yes |
| `GCP_PROJECT_ID` | Google Cloud Project ID | ✅ Yes |
| `TF_STATE_BUCKET` | GCS bucket for Terraform state | ✅ Yes |

## Workflow Behavior

### Preview Deployments
```
PR Created/Updated → Build → Test → Deploy → Comment with URLs
                                  ↓
                    CommerceTools secrets passed to Terraform
                    (defaults to empty for mock mode)
PR Closed → Cleanup → Delete Resources → Comment Confirmation
```

### E2E Testing
```
PR Created/Updated → Check Secrets
                   ↓
           Secrets Available? 
           ↓              ↓
          Yes            No
           ↓              ↓
    Run E2E Tests   Skip (warning)
           ↓              ↓
    Comment Results  Comment Skip Reason
```

## Manual Triggers

You can manually trigger the E2E tests workflow:

1. Go to **Actions** tab
2. Select "E2E Tests with CommerceTools"
3. Click "Run workflow"
4. Select branch
5. Click "Run workflow"

This is useful for:
- Testing after secret updates
- Validating CommerceTools integration
- Running tests on demand

## Workflow Files Structure

```
.github/workflows/
├── pr-preview.yml       # Preview deployment
├── pr-cleanup.yml       # Cleanup on PR close
└── e2e-tests.yml        # E2E tests with CommerceTools
```

## Environment Strategy

| Environment | CommerceTools Mode | Secrets Used | Use Case |
|-------------|-------------------|--------------|----------|
| **Preview (PR)** | Mock | None (defaults) | UI/UX testing |
| **E2E Tests** | Real API | Repository secrets | Integration testing |
| **Production** | Real API | Secret Manager | Live deployment |

## Monitoring

View workflow runs:
- **Actions** tab shows all workflow runs
- Click on a workflow run to see detailed logs
- Check PR comments for deployment URLs and test results

## Troubleshooting

### E2E Tests Not Running

**Problem**: E2E tests show "skipped" in workflow logs

**Solution**: 
1. Verify secrets are configured in repository settings
2. Check secret names match exactly (case-sensitive)
3. Ensure secrets are not empty strings

### Preview Deployment Fails

**Problem**: Preview deployment fails during build or deploy

**Solution**:
1. Check workflow logs for specific error
2. Verify GCP credentials are valid
3. Ensure Terraform state bucket exists
4. Check if GCP quotas are exceeded

### E2E Tests Fail with Authentication Error

**Problem**: Tests fail with 401 or authentication errors

**Solution**:
1. Verify CommerceTools credentials are correct
2. Check if API client has required scopes
3. Ensure project key matches your CommerceTools project
4. Verify trial hasn't expired (60 days)

## Related Documentation

- [CommerceTools Setup Guide](../../docs/COMMERCETOOLS_SETUP.md)
- [Integration Documentation](../../backend/docs/COMMERCETOOLS_INTEGRATION.md)
- [Backend Deployment Guide](../../backend/docs/DEPLOYMENT.md)

## Security Notes

- Secrets are never exposed in logs
- Preview environments use mock mode (no real credentials)
- E2E tests run in isolated environment
- Artifacts are retained for 30 days only
- All secrets are encrypted at rest
