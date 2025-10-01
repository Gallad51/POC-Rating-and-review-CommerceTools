# 🏗️ Infrastructure Documentation

This directory contains the Terraform configuration for deploying the Ratings & Reviews POC on Google Cloud Platform, optimized for free tier usage.

## 📋 Overview

### POC Philosophy

This infrastructure setup is designed with **POC constraints** and **budget optimization** as primary concerns:

- ✅ **Free Tier Only**: Uses only services available in GCP free tier
- ✅ **Minimal Resources**: Configured with lowest possible resource allocations
- ✅ **Auto Scaling**: Scales to zero to avoid idle costs
- ✅ **Ephemeral Environments**: PR previews are disposable

### Architecture Decisions

| Decision | Rationale | Production Alternative |
|----------|-----------|----------------------|
| **Cloud Run only** | No infrastructure management, free tier | Add Cloud SQL, Memorystore |
| **No CDN** | Avoid egress costs | Cloud CDN for static assets |
| **No Load Balancer** | Use Cloud Run URLs directly | HTTPS Load Balancer + custom domains |
| **No Cloud Armor** | Not available in free tier | Add for DDoS protection |
| **Container Registry** | Simple image storage | Artifact Registry (recommended) |

## 🚀 Deployment

### Prerequisites

1. **Google Cloud Project** with billing enabled
2. **Terraform CLI** (v1.0+)
3. **gcloud CLI** authenticated
4. **Required APIs** (automatically enabled by Terraform):
   - Cloud Run API (`run.googleapis.com`) - For running containers
   - Container Registry API (`containerregistry.googleapis.com`) - For storing Docker images (legacy)
   - Artifact Registry API (`artifactregistry.googleapis.com`) - For storing Docker images (recommended)
   - Secret Manager API (`secretmanager.googleapis.com`) - For managing secrets
   - Cloud Build API (`cloudbuild.googleapis.com`) - For building containers
   - IAM API (`iam.googleapis.com`) - For managing permissions
   - Service Usage API (`serviceusage.googleapis.com`) - For enabling other APIs

   > **Note**: All APIs are automatically enabled by the Terraform configuration. No manual enablement required.

### Local Deployment

1. **Initialize Terraform**:
   ```bash
   cd infra
   terraform init
   ```

2. **Configure variables** (optional):
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

3. **Plan deployment**:
   ```bash
   terraform plan -var="project_id=your-project-id"
   ```

4. **Deploy infrastructure**:
   ```bash
   terraform apply -var="project_id=your-project-id"
   ```

### CI/CD Deployment

The infrastructure is **automatically managed** by GitHub Actions. Manual Terraform deployment is typically not needed for PR previews.

## 📁 File Structure

```
infra/
├── 📄 main.tf                           # Main Terraform configuration (base services)
├── 📄 backend.tf                        # Backend-specific configuration with secrets
├── 📄 variables.tf                      # Input variables (extended for backend)
├── 📄 outputs.tf                        # Output values (URLs, service names)
├── 📄 terraform.tfvars.example          # Example variables file (legacy)
├── 📄 terraform.tfvars.preview.example  # Preview environment configuration
├── 📄 terraform.tfvars.production.example  # Production environment configuration
└── 📄 README.md                         # This documentation
```

### Backend Configuration

The **`backend.tf`** file contains backend-specific infrastructure:

- **Secrets Management**: JWT secret, CommerceTools credentials
- **Environment Variables**: Rate limiting, CORS, logging
- **Resource Configuration**: Memory, CPU, scaling limits
- **IAM Permissions**: Secret access for Cloud Run

**Key Features:**
- ✅ Conditional secret creation (disabled for preview, enabled for production)
- ✅ CommerceTools integration toggle
- ✅ Configurable rate limiting and security settings
- ✅ Automatic secret access permissions

## ⚙️ Configuration

### Core Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `project_id` | string | `ratings-reviews-poc` | GCP Project ID |
| `region` | string | `europe-west1` | GCP Region for resources |
| `service_name` | string | `ratings-reviews` | Base name for services |
| `environment` | string | `dev` | Environment identifier (dev/preview/prod) |
| `backend_image` | string | `gcr.io/.../backend:latest` | Backend Docker image |
| `frontend_image` | string | `gcr.io/.../frontend:latest` | Frontend Docker image |

### Backend-Specific Variables

#### Secrets Management

| Variable | Type | Default | Description | Required For |
|----------|------|---------|-------------|--------------|
| `create_backend_secrets` | bool | `false` | Create secrets in Secret Manager | Production |
| `jwt_secret` | string | `default...` | JWT signing secret (min 32 chars) | Production |
| `enable_commercetools` | bool | `false` | Enable real CommerceTools integration | Production |
| `ctp_project_key` | string | `""` | CommerceTools project key | Production w/ CT |
| `ctp_client_id` | string | `""` | CommerceTools client ID | Production w/ CT |
| `ctp_client_secret` | string | `""` | CommerceTools client secret | Production w/ CT |

#### Application Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `rate_limit_window_ms` | string | `"60000"` | Rate limit window (milliseconds) |
| `rate_limit_max_requests` | string | `"10"` | Max requests per window |
| `cors_origin` | string | `"*"` | Allowed CORS origins |
| `log_level` | string | `"info"` | Logging level |
| `ctp_api_url` | string | `https://api...` | CommerceTools API endpoint |
| `ctp_auth_url` | string | `https://auth...` | CommerceTools Auth endpoint |

#### Resource Limits

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `backend_min_instances` | string | `"0"` | Minimum instances (0 = scale to zero) |
| `backend_max_instances` | string | `"10"` | Maximum instances |
| `backend_concurrency` | number | `80` | Concurrent requests per instance |
| `backend_timeout` | number | `300` | Request timeout (seconds) |
| `backend_cpu` | string | `"1000m"` | CPU allocation (m = milli-cores) |
| `backend_memory` | string | `"512Mi"` | Memory allocation |

### Example Configurations

#### Preview Environment

```hcl
# terraform.tfvars.preview
environment            = "preview"
create_backend_secrets = false  # Use defaults
enable_commercetools   = false  # Use mock service
rate_limit_max_requests = "100" # More permissive
cors_origin            = "*"    # Allow all origins
log_level              = "debug"
backend_min_instances  = "0"    # Scale to zero
backend_max_instances  = "5"
```

#### Production Environment

```hcl
# terraform.tfvars.production
environment             = "prod"
create_backend_secrets  = true  # Create real secrets
enable_commercetools    = true  # Use real API
jwt_secret              = "..."  # Strong random secret
ctp_project_key         = "..."  # From CommerceTools
ctp_client_id           = "..."  # From CommerceTools
ctp_client_secret       = "..."  # From CommerceTools
rate_limit_max_requests = "10"   # Stricter limits
cors_origin             = "https://your-domain.com"
log_level               = "warn"
backend_min_instances   = "1"    # Keep warm
backend_max_instances   = "100"
backend_cpu             = "2000m"
backend_memory          = "1Gi"
```

### Resource Configuration

#### Cloud Run Services

```hcl
# Backend Service
resource "google_cloud_run_service" "backend" {
  # Optimized for free tier
  template {
    spec {
      container_concurrency = 80        # Balance performance/cost
      timeout_seconds      = 300       # Max free tier timeout
      
      containers {
        resources {
          limits = {
            cpu    = "1000m"          # 1 vCPU (free tier limit)
            memory = "512Mi"          # Minimal memory usage
          }
        }
      }
    }
  }
}
```

#### Auto Scaling

```hcl
metadata {
  annotations = {
    "autoscaling.knative.dev/minScale" = "0"    # Scale to zero
    "autoscaling.knative.dev/maxScale" = "10"   # Prevent runaway costs
    "run.googleapis.com/cpu-throttling" = "true" # CPU throttling enabled
  }
}
```

### Outputs

The Terraform configuration outputs key information:

```bash
# Get service URLs after deployment
terraform output backend_url
terraform output frontend_url

# Get all outputs
terraform output
```

## 🔒 Security

### Service Account Permissions

The deployment requires a service account with minimal permissions:

```json
{
  "roles": [
    "roles/run.admin",           # Deploy Cloud Run services
    "roles/storage.admin",       # Push to Container Registry  
    "roles/secretmanager.admin", # Manage secrets
    "roles/serviceusage.serviceUsageAdmin" # Enable APIs
  ]
}
```

### Secret Management

Secrets are managed through **Google Secret Manager**:

```hcl
resource "google_secret_manager_secret" "api_keys" {
  for_each = var.secrets
  
  secret_id = each.key
  replication {
    automatic = true  # Replicate to all regions
  }
}
```

### Network Security

- **Public Access**: Services are publicly accessible (required for POC)
- **No VPC**: Uses default network to avoid NAT Gateway costs
- **HTTPS Only**: Cloud Run enforces HTTPS by default

## 💰 Budget & Quotas

### Free Tier Limits

| Resource | Free Tier Allocation | Usage Strategy |
|----------|---------------------|----------------|
| **Cloud Run Requests** | 2M requests/month | Auto-scale to zero |
| **Cloud Run CPU-seconds** | 400,000 GB-seconds/month | 1 vCPU max per service |
| **Container Registry** | 0.5GB storage | Multi-stage Docker builds |
| **Secret Manager** | 6 active secrets | Minimal secret usage |

### Cost Monitoring

```bash
# Monitor Cloud Run usage
gcloud run services list --region=europe-west1

# Check container registry usage  
gcloud container images list --repository=gcr.io/PROJECT_ID

# Monitor Secret Manager usage
gcloud secrets list
```

### Cost Optimization

1. **Scale to Zero**: Services automatically scale down when not in use
2. **CPU Throttling**: Enabled to reduce CPU-seconds usage
3. **Minimal Resources**: 512Mi memory, 1 vCPU per service
4. **Ephemeral Previews**: PR environments are automatically cleaned up

## 🚦 Limitations & Production Considerations

### POC Limitations

⚠️ **Current limitations for cost optimization:**

1. **No Custom Domains**: Uses Cloud Run URLs (`*.run.app`)
2. **No CDN**: Static files served directly from Cloud Run
3. **No Database Persistence**: Mock data only
4. **No VPC**: Uses default network
5. **No Monitoring**: Basic health checks only
6. **No Backup Strategy**: Stateless services

### Production Migration Requirements

For production deployment, add:

1. **Custom Domain & SSL**:
   ```hcl
   # Add Cloud DNS zone
   resource "google_dns_managed_zone" "main" {
     name     = "ratings-reviews-zone"
     dns_name = "ratings-reviews.example.com."
   }
   
   # Add SSL certificate
   resource "google_compute_managed_ssl_certificate" "main" {
     name = "ssl-cert"
     managed {
       domains = ["ratings-reviews.example.com"]
     }
   }
   ```

2. **Load Balancer + CDN**:
   ```hcl
   # HTTPS Load Balancer
   resource "google_compute_global_forwarding_rule" "https" {
     name       = "https-forwarding-rule"
     target     = google_compute_target_https_proxy.main.id
     port_range = "443"
   }
   
   # Cloud CDN
   resource "google_compute_backend_service" "frontend" {
     enable_cdn = true
     cdn_policy {
       cache_key_policy {
         include_host = true
         include_protocol = true
       }
     }
   }
   ```

3. **Database Layer**:
   ```hcl
   # Cloud Firestore
   resource "google_firestore_database" "main" {
     name     = "(default)"
     type     = "FIRESTORE_NATIVE"
     location_id = var.region
   }
   ```

4. **VPC & Security**:
   ```hcl
   # Custom VPC
   resource "google_compute_network" "main" {
     name                    = "ratings-reviews-vpc"
     auto_create_subnetworks = false
   }
   
   # Cloud Armor policy
   resource "google_compute_security_policy" "main" {
     name = "security-policy"
     
     rule {
       action   = "allow"
       priority = "1000"
       match {
         versioned_expr = "SRC_IPS_V1"
         config {
           src_ip_ranges = ["*"]
         }
       }
     }
   }
   ```

## 🔧 Troubleshooting

### Common Issues

1. **API Not Enabled**:
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```

2. **Insufficient Permissions**:
   ```bash
   # Check current permissions
   gcloud projects get-iam-policy PROJECT_ID
   
   # Add required roles
   gcloud projects add-iam-policy-binding PROJECT_ID \
     --member="serviceAccount:SA_EMAIL" \
     --role="roles/run.admin"
   ```

3. **Terraform State Issues**:
   ```bash
   # Initialize backend
   terraform init
   
   # Import existing resource
   terraform import google_cloud_run_service.backend_api projects/PROJECT_ID/locations/REGION/services/SERVICE_NAME
   ```

4. **Resource Quota Exceeded**:
   ```bash
   # Check quotas
   gcloud compute project-info describe --project=PROJECT_ID
   
   # Request quota increase (if needed for production)
   # Via GCP Console → IAM & Admin → Quotas
   ```

5. **Terraform Apply Hangs on Cloud Run Creation**:
   
   **Symptom**: `terraform apply` hangs indefinitely during Cloud Run service creation, even though the services are successfully created in GCP.
   
   **Cause**: This was caused by conditional resource dependencies in the `depends_on` clause. When `create_backend_secrets=false`, Terraform would wait for secret resources that would never be created.
   
   **Solution**: The issue has been fixed. The Cloud Run services now only depend on API services that are always created:
   ```hcl
   depends_on = [
     google_project_service.cloud_run,
     google_project_service.container_registry,
     google_project_service.artifact_registry
   ]
   ```
   
   If you still experience issues, ensure you're using the latest version of the Terraform configuration.

### Useful Commands

```bash
# Terraform operations
terraform init                    # Initialize
terraform plan                    # Preview changes
terraform apply                   # Apply changes
terraform destroy                 # Destroy infrastructure
terraform output                  # Show outputs

# GCP resource management
gcloud run services list --region=europe-west1
gcloud container images list --repository=gcr.io/PROJECT_ID
gcloud secrets list

# Service debugging
gcloud run services describe SERVICE_NAME --region=REGION
gcloud logs read --service=SERVICE_NAME --region=REGION
```

## 📊 Monitoring

### Health Checks

Services include built-in health checks:
- **Endpoint**: `/health`
- **Interval**: 30 seconds
- **Timeout**: 3 seconds
- **Retries**: 3

### Performance Metrics

Available through Cloud Run console:
- Request count and latency
- Instance count and utilization  
- Error rates and status codes
- Cold start metrics

### Alerting (Production)

For production, set up alerting:
```bash
# Example: Alert on high error rate
gcloud alpha monitoring policies create \
  --policy-from-file=alerting-policy.json
```

---

**💡 Remember**: This infrastructure is optimized for POC/demo purposes and should be enhanced for production workloads.