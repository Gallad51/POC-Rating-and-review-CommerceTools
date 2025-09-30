# GitHub Actions Variables and Secrets Configuration

Complete reference for configuring GitHub Actions for automated deployments.

## Table of Contents

- [Required Secrets](#required-secrets)
- [Optional Secrets (Production)](#optional-secrets-production)
- [Repository Variables](#repository-variables)
- [Environment-Specific Configuration](#environment-specific-configuration)
- [Setup Instructions](#setup-instructions)
- [Terraform Integration](#terraform-integration)

## Required Secrets

These secrets are **required** for all deployments (preview and production).

Configure in: **Settings > Secrets and variables > Actions > Secrets**

| Secret Name | Description | Example | Where to Get It |
|-------------|-------------|---------|-----------------|
| `GCP_SA_KEY` | Service account JSON key for GCP authentication | `{"type": "service_account"...}` | [See GCP Setup](#gcp-service-account-setup) |
| `GCP_PROJECT_ID` | Google Cloud Project ID | `ratings-reviews-poc` | GCP Console > Project Info |

### GCP Service Account Setup

1. **Create Service Account:**
   ```bash
   gcloud iam service-accounts create github-actions \
     --display-name="GitHub Actions Deployer" \
     --project=your-project-id
   ```

2. **Grant Required Roles:**
   ```bash
   # Cloud Run admin (deploy services)
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:github-actions@your-project-id.iam.gserviceaccount.com" \
     --role="roles/run.admin"
   
   # Storage admin (push Docker images)
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:github-actions@your-project-id.iam.gserviceaccount.com" \
     --role="roles/storage.admin"
   
   # Service account user (required by Cloud Run)
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:github-actions@your-project-id.iam.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"
   
   # Secret manager admin (for Terraform secrets)
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:github-actions@your-project-id.iam.gserviceaccount.com" \
     --role="roles/secretmanager.admin"
   ```

3. **Create and Download Key:**
   ```bash
   gcloud iam service-accounts keys create github-actions-key.json \
     --iam-account=github-actions@your-project-id.iam.gserviceaccount.com
   ```

4. **Add to GitHub:**
   - Copy entire contents of `github-actions-key.json`
   - Go to GitHub repository > Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Name: `GCP_SA_KEY`
   - Value: Paste JSON contents
   - Click "Add secret"

## Optional Secrets (Production)

These secrets are **optional** for preview environments but **required** for production deployments with real CommerceTools integration.

| Secret Name | Description | Required When | Example |
|-------------|-------------|---------------|---------|
| `TF_VAR_jwt_secret` | JWT signing secret (min 32 chars) | Production | `your-super-secret-jwt-key-min-32-chars` |
| `TF_VAR_ctp_project_key` | CommerceTools project key | Production with CT | `your-commercetools-project` |
| `TF_VAR_ctp_client_id` | CommerceTools OAuth2 client ID | Production with CT | `abc123...` |
| `TF_VAR_ctp_client_secret` | CommerceTools OAuth2 client secret | Production with CT | `xyz789...` |

### Generating JWT Secret

```bash
# Generate a strong random secret (32+ characters)
openssl rand -base64 32
```

### Getting CommerceTools Credentials

1. Go to https://mc.commercetools.com
2. Select your project
3. Settings > Developer settings > API clients
4. Create new API client with scopes:
   - `manage_project`
   - `view_products`
   - `manage_orders`
5. Save the client ID, client secret, and project key

## Repository Variables

These are **optional** variables for customizing deployment behavior.

Configure in: **Settings > Secrets and variables > Actions > Variables**

| Variable Name | Description | Default | Example |
|---------------|-------------|---------|---------|
| `GCP_REGION` | GCP region for deployments | `europe-west1` | `us-central1` |
| `TF_VAR_backend_memory` | Backend memory limit | `512Mi` | `1Gi` |
| `TF_VAR_backend_cpu` | Backend CPU limit | `1000m` | `2000m` |
| `TF_VAR_backend_max_instances` | Max backend instances | `10` | `100` |
| `TF_VAR_rate_limit_max_requests` | Rate limit per minute | `10` | `100` |
| `TF_VAR_log_level` | Logging level | `info` | `debug`, `warn`, `error` |
| `TF_VAR_cors_origin` | Allowed CORS origins | `*` | `https://your-domain.com` |

## Environment-Specific Configuration

### Preview Environments (PR Deployments)

**Automatically configured variables:**
- `environment`: `preview`
- `create_backend_secrets`: `false` (uses defaults)
- `enable_commercetools`: `false` (uses mock service)
- `backend_image`: `gcr.io/$PROJECT_ID/backend:pr-$PR_NUMBER`

**Required Secrets:**
- `GCP_SA_KEY` ✅
- `GCP_PROJECT_ID` ✅

**Optional Production Secrets:**
- Not required ❌

### Production Deployment

**Manually configured variables:**
- `environment`: `prod`
- `create_backend_secrets`: `true`
- `enable_commercetools`: `true`
- `backend_image`: `gcr.io/$PROJECT_ID/backend:$TAG`

**Required Secrets:**
- `GCP_SA_KEY` ✅
- `GCP_PROJECT_ID` ✅
- `TF_VAR_jwt_secret` ✅
- `TF_VAR_ctp_project_key` ✅
- `TF_VAR_ctp_client_id` ✅
- `TF_VAR_ctp_client_secret` ✅

## Setup Instructions

### Step 1: Enable Required GCP APIs

```bash
gcloud services enable run.googleapis.com \
  containerregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  --project=your-project-id
```

### Step 2: Configure GitHub Secrets

#### Required for All Environments

1. **GCP_SA_KEY**
   ```bash
   # Create and download key
   gcloud iam service-accounts keys create github-actions-key.json \
     --iam-account=github-actions@your-project-id.iam.gserviceaccount.com
   
   # Copy contents
   cat github-actions-key.json | pbcopy  # macOS
   cat github-actions-key.json | xclip   # Linux
   ```
   - GitHub: Repository > Settings > Secrets > New secret
   - Name: `GCP_SA_KEY`
   - Paste JSON contents

2. **GCP_PROJECT_ID**
   - GitHub: Repository > Settings > Secrets > New secret
   - Name: `GCP_PROJECT_ID`
   - Value: Your GCP project ID (e.g., `ratings-reviews-poc`)

#### Optional for Production

3. **TF_VAR_jwt_secret**
   ```bash
   # Generate secret
   openssl rand -base64 32
   ```
   - GitHub: Repository > Settings > Secrets > New secret
   - Name: `TF_VAR_jwt_secret`
   - Value: Generated secret

4. **TF_VAR_ctp_project_key**
   - GitHub: Repository > Settings > Secrets > New secret
   - Name: `TF_VAR_ctp_project_key`
   - Value: Your CommerceTools project key

5. **TF_VAR_ctp_client_id**
   - GitHub: Repository > Settings > Secrets > New secret
   - Name: `TF_VAR_ctp_client_id`
   - Value: Your CommerceTools client ID

6. **TF_VAR_ctp_client_secret**
   - GitHub: Repository > Settings > Secrets > New secret
   - Name: `TF_VAR_ctp_client_secret`
   - Value: Your CommerceTools client secret

### Step 3: Configure Repository Variables (Optional)

1. Go to: Repository > Settings > Secrets and variables > Actions > Variables
2. Click "New repository variable"
3. Add desired variables from the table above

### Step 4: Test PR Preview Deployment

1. Create a new branch
2. Make any change
3. Open a Pull Request
4. GitHub Actions will automatically:
   - Build Docker images
   - Deploy to preview environment
   - Comment on PR with URLs

## Terraform Integration

### Using Terraform Variables in CI/CD

The GitHub Actions workflow can pass secrets and variables to Terraform:

```yaml
# In .github/workflows/deploy.yml
- name: Terraform Apply
  env:
    TF_VAR_jwt_secret: ${{ secrets.TF_VAR_jwt_secret }}
    TF_VAR_ctp_project_key: ${{ secrets.TF_VAR_ctp_project_key }}
    TF_VAR_ctp_client_id: ${{ secrets.TF_VAR_ctp_client_id }}
    TF_VAR_ctp_client_secret: ${{ secrets.TF_VAR_ctp_client_secret }}
    TF_VAR_backend_memory: ${{ vars.TF_VAR_backend_memory || '512Mi' }}
    TF_VAR_backend_cpu: ${{ vars.TF_VAR_backend_cpu || '1000m' }}
  run: |
    cd infra
    terraform apply -auto-approve \
      -var="project_id=${{ secrets.GCP_PROJECT_ID }}" \
      -var="region=${{ vars.GCP_REGION || 'europe-west1' }}" \
      -var="environment=preview" \
      -var="backend_image=gcr.io/${{ secrets.GCP_PROJECT_ID }}/backend:${{ github.sha }}"
```

### Terraform Variable Mapping

| GitHub Secret/Variable | Terraform Variable | Description |
|------------------------|-------------------|-------------|
| `GCP_PROJECT_ID` (secret) | `project_id` | GCP project ID |
| `GCP_REGION` (var) | `region` | Deployment region |
| `TF_VAR_jwt_secret` (secret) | `jwt_secret` | JWT signing secret |
| `TF_VAR_ctp_project_key` (secret) | `ctp_project_key` | CT project key |
| `TF_VAR_ctp_client_id` (secret) | `ctp_client_id` | CT client ID |
| `TF_VAR_ctp_client_secret` (secret) | `ctp_client_secret` | CT client secret |
| `TF_VAR_backend_memory` (var) | `backend_memory` | Memory limit |
| `TF_VAR_backend_cpu` (var) | `backend_cpu` | CPU limit |
| `TF_VAR_rate_limit_max_requests` (var) | `rate_limit_max_requests` | Rate limit |
| `TF_VAR_cors_origin` (var) | `cors_origin` | CORS origins |

## Verification

### Check Secrets Are Set

```bash
# Using GitHub CLI
gh secret list

# Expected output:
# GCP_SA_KEY                 Updated YYYY-MM-DD
# GCP_PROJECT_ID             Updated YYYY-MM-DD
# TF_VAR_jwt_secret          Updated YYYY-MM-DD  # Production only
# TF_VAR_ctp_project_key     Updated YYYY-MM-DD  # Production only
# TF_VAR_ctp_client_id       Updated YYYY-MM-DD  # Production only
# TF_VAR_ctp_client_secret   Updated YYYY-MM-DD  # Production only
```

### Check Variables Are Set

```bash
# Using GitHub CLI
gh variable list

# Expected output (optional):
# GCP_REGION                     europe-west1
# TF_VAR_backend_memory          512Mi
# TF_VAR_backend_cpu             1000m
```

### Test Deployment

```bash
# Trigger workflow manually
gh workflow run pr-preview.yml

# Check status
gh run list --workflow=pr-preview.yml
```

## Troubleshooting

### Error: "Permission Denied" During Deployment

**Problem**: Service account lacks required permissions

**Solution**:
```bash
# Re-grant all required roles
gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:github-actions@your-project-id.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:github-actions@your-project-id.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
```

### Error: "Secret Not Found"

**Problem**: Terraform variable not set or incorrectly named

**Solution**:
- Check secret name matches exactly (case-sensitive)
- Verify secret is set: `gh secret list`
- Check environment variables in workflow file

### Error: "Invalid JWT Secret"

**Problem**: JWT secret too short or not set

**Solution**:
```bash
# Generate new secret (min 32 characters)
openssl rand -base64 32

# Set in GitHub
gh secret set TF_VAR_jwt_secret
```

## Security Best Practices

### Secret Management

1. **Never commit secrets** to the repository
2. **Use different secrets** for each environment
3. **Rotate secrets regularly** (every 90 days)
4. **Limit secret access** (only required workflows)
5. **Monitor secret usage** (GitHub audit logs)

### Service Account Security

1. **Follow least privilege principle**
2. **Use separate service accounts** per environment
3. **Regularly audit** service account permissions
4. **Enable Cloud Audit Logs**
5. **Set up alerts** for unusual activity

### Production Secrets

1. **Use Secret Manager** for production secrets
2. **Enable secret versioning**
3. **Set up secret rotation policies**
4. **Restrict access** to production secrets
5. **Monitor secret access** via Cloud Audit Logs

## Additional Resources

- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GCP Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)
- [GCP Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Terraform Cloud Run Module](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_service)

---

**Last Updated**: 2024-01-20  
**Version**: 1.1.0
