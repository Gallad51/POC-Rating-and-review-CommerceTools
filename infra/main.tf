# Configure the Google Cloud provider
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

# Configure the Google Cloud provider
provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "cloud_run" {
  service = "run.googleapis.com"
  
  disable_dependent_services = false
  disable_on_destroy         = false
}

resource "google_project_service" "secret_manager" {
  service = "secretmanager.googleapis.com"
  
  disable_dependent_services = false
  disable_on_destroy         = false
}

resource "google_project_service" "container_registry" {
  service = "containerregistry.googleapis.com"
  
  disable_dependent_services = false
  disable_on_destroy         = false
}

resource "google_project_service" "artifact_registry" {
  service = "artifactregistry.googleapis.com"
  
  disable_dependent_services = false
  disable_on_destroy         = false
}

resource "google_project_service" "cloud_build" {
  service = "cloudbuild.googleapis.com"
  
  disable_dependent_services = false
  disable_on_destroy         = false
}

resource "google_project_service" "iam" {
  service = "iam.googleapis.com"
  
  disable_dependent_services = false
  disable_on_destroy         = false
}

resource "google_project_service" "service_usage" {
  service = "serviceusage.googleapis.com"
  
  disable_dependent_services = false
  disable_on_destroy         = false
}

# Create secrets in Secret Manager
# Note: Legacy secrets (api_keys) removed to avoid "sensitive value in for_each" error
# All secrets are now managed in backend.tf for proper secret management

# Backend Cloud Run Service is defined in backend.tf
# (removed from here to avoid duplicate resource)

# Frontend Cloud Run Service  
resource "google_cloud_run_service" "frontend" {
  name     = "${var.service_name}-frontend-${var.environment}"
  location = var.region

  timeouts {
    create = "3m"
    update = "3m"
  }

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "10" 
        "run.googleapis.com/cpu-throttling" = "true"
      }
    }
    
    spec {
      container_concurrency = 80
      timeout_seconds      = 300
      
      containers {
        image = var.frontend_image
        
        env {
          name  = "NODE_ENV" 
          value = var.environment
        }
        
        env {
          name  = "BACKEND_URL"
          value = google_cloud_run_service.backend.status[0].url
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [
    google_project_service.cloud_run,
    google_project_service.container_registry,
    google_project_service.artifact_registry
  ]
}

# Backend IAM is defined in backend.tf
# Make frontend publicly accessible
resource "google_cloud_run_service_iam_member" "frontend_noauth" {
  service  = google_cloud_run_service.frontend.name
  location = google_cloud_run_service.frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}