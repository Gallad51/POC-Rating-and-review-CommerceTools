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

# Create secrets in Secret Manager
resource "google_secret_manager_secret" "api_keys" {
  for_each = var.secrets
  
  secret_id = each.key
  
  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_version" "api_keys" {
  for_each = var.secrets
  
  secret      = google_secret_manager_secret.api_keys[each.key].id
  secret_data = each.value
}

# Backend Cloud Run Service
resource "google_cloud_run_service" "backend" {
  name     = "${var.service_name}-backend-${var.environment}"
  location = var.region

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
        image = var.backend_image
        
        ports {
          container_port = 8080
        }
        
        env {
          name  = "PORT"
          value = "8080"
        }
        
        env {
          name  = "NODE_ENV"
          value = var.environment
        }
        
        # Add secret environment variables
        dynamic "env" {
          for_each = var.backend_secrets
          content {
            name = env.value.name
            value_from {
              secret_key_ref {
                name = env.value.secret_name
                key  = env.value.secret_key
              }
            }
          }
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

  depends_on = [google_project_service.cloud_run]
}

# Frontend Cloud Run Service  
resource "google_cloud_run_service" "frontend" {
  name     = "${var.service_name}-frontend-${var.environment}"
  location = var.region

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
        
        ports {
          container_port = 8080
        }
        
        env {
          name  = "PORT"
          value = "8080"
        }
        
        env {
          name  = "NODE_ENV" 
          value = var.environment
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

  depends_on = [google_project_service.cloud_run]
}

# Make services publicly accessible
resource "google_cloud_run_service_iam_member" "backend_noauth" {
  service  = google_cloud_run_service.backend.name
  location = google_cloud_run_service.backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "frontend_noauth" {
  service  = google_cloud_run_service.frontend.name
  location = google_cloud_run_service.frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}