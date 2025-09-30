# Backend-specific Terraform configuration for Ratings & Reviews API

# Backend environment-specific secrets for production
locals {
  backend_env_vars = concat(
    [
      {
        name  = "PORT"
        value = "8080"
      },
      {
        name  = "NODE_ENV"
        value = var.environment
      },
      {
        name  = "RATE_LIMIT_WINDOW_MS"
        value = var.rate_limit_window_ms
      },
      {
        name  = "RATE_LIMIT_MAX_REQUESTS"
        value = var.rate_limit_max_requests
      },
      {
        name  = "CORS_ORIGIN"
        value = var.cors_origin
      },
      {
        name  = "LOG_LEVEL"
        value = var.log_level
      }
    ],
    var.enable_commercetools ? [
      {
        name  = "CTP_API_URL"
        value = var.ctp_api_url
      },
      {
        name  = "CTP_AUTH_URL"
        value = var.ctp_auth_url
      },
      {
        name  = "CTP_SCOPES"
        value = var.ctp_scopes
      }
    ] : []
  )
}

# Secret for JWT
resource "google_secret_manager_secret" "jwt_secret" {
  count     = var.create_backend_secrets ? 1 : 0
  secret_id = "${var.service_name}-jwt-secret-${var.environment}"

  replication {
    auto {}
  }

  depends_on = [google_project_service.secret_manager]
}

resource "google_secret_manager_secret_version" "jwt_secret" {
  count       = var.create_backend_secrets ? 1 : 0
  secret      = google_secret_manager_secret.jwt_secret[0].id
  secret_data = var.jwt_secret

  depends_on = [google_project_service.secret_manager]
}

# CommerceTools Project Key
resource "google_secret_manager_secret" "ctp_project_key" {
  count     = var.create_backend_secrets && var.enable_commercetools ? 1 : 0
  secret_id = "${var.service_name}-ctp-project-key-${var.environment}"

  replication {
    auto {}
  }

  depends_on = [google_project_service.secret_manager]
}

resource "google_secret_manager_secret_version" "ctp_project_key" {
  count       = var.create_backend_secrets && var.enable_commercetools ? 1 : 0
  secret      = google_secret_manager_secret.ctp_project_key[0].id
  secret_data = var.ctp_project_key

  depends_on = [google_project_service.secret_manager]
}

# CommerceTools Client ID
resource "google_secret_manager_secret" "ctp_client_id" {
  count     = var.create_backend_secrets && var.enable_commercetools ? 1 : 0
  secret_id = "${var.service_name}-ctp-client-id-${var.environment}"

  replication {
    auto {}
  }

  depends_on = [google_project_service.secret_manager]
}

resource "google_secret_manager_secret_version" "ctp_client_id" {
  count       = var.create_backend_secrets && var.enable_commercetools ? 1 : 0
  secret      = google_secret_manager_secret.ctp_client_id[0].id
  secret_data = var.ctp_client_id

  depends_on = [google_project_service.secret_manager]
}

# CommerceTools Client Secret
resource "google_secret_manager_secret" "ctp_client_secret" {
  count     = var.create_backend_secrets && var.enable_commercetools ? 1 : 0
  secret_id = "${var.service_name}-ctp-client-secret-${var.environment}"

  replication {
    auto {}
  }

  depends_on = [google_project_service.secret_manager]
}

resource "google_secret_manager_secret_version" "ctp_client_secret" {
  count       = var.create_backend_secrets && var.enable_commercetools ? 1 : 0
  secret      = google_secret_manager_secret.ctp_client_secret[0].id
  secret_data = var.ctp_client_secret

  depends_on = [google_project_service.secret_manager]
}

# Update Backend Cloud Run Service with backend-specific configuration
resource "google_cloud_run_service" "backend_api" {
  name     = "${var.service_name}-backend-${var.environment}"
  location = var.region

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale"    = var.backend_min_instances
        "autoscaling.knative.dev/maxScale"    = var.backend_max_instances
        "run.googleapis.com/cpu-throttling"   = "true"
      }
    }

    spec {
      container_concurrency = var.backend_concurrency
      timeout_seconds       = var.backend_timeout

      containers {
        image = var.backend_image

        ports {
          container_port = 8080
        }

        # Regular environment variables
        dynamic "env" {
          for_each = local.backend_env_vars
          content {
            name  = env.value.name
            value = env.value.value
          }
        }

        # JWT Secret
        dynamic "env" {
          for_each = var.create_backend_secrets ? [1] : []
          content {
            name = "JWT_SECRET"
            value_from {
              secret_key_ref {
                name = google_secret_manager_secret.jwt_secret[0].secret_id
                key  = "latest"
              }
            }
          }
        }

        # CommerceTools secrets (only if enabled)
        dynamic "env" {
          for_each = var.create_backend_secrets && var.enable_commercetools ? [1] : []
          content {
            name = "CTP_PROJECT_KEY"
            value_from {
              secret_key_ref {
                name = google_secret_manager_secret.ctp_project_key[0].secret_id
                key  = "latest"
              }
            }
          }
        }

        dynamic "env" {
          for_each = var.create_backend_secrets && var.enable_commercetools ? [1] : []
          content {
            name = "CTP_CLIENT_ID"
            value_from {
              secret_key_ref {
                name = google_secret_manager_secret.ctp_client_id[0].secret_id
                key  = "latest"
              }
            }
          }
        }

        dynamic "env" {
          for_each = var.create_backend_secrets && var.enable_commercetools ? [1] : []
          content {
            name = "CTP_CLIENT_SECRET"
            value_from {
              secret_key_ref {
                name = google_secret_manager_secret.ctp_client_secret[0].secret_id
                key  = "latest"
              }
            }
          }
        }

        resources {
          limits = {
            cpu    = var.backend_cpu
            memory = var.backend_memory
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
    google_project_service.artifact_registry,
    google_secret_manager_secret_version.jwt_secret,
    google_secret_manager_secret_version.ctp_project_key,
    google_secret_manager_secret_version.ctp_client_id,
    google_secret_manager_secret_version.ctp_client_secret
  ]
}

# IAM for backend service
resource "google_cloud_run_service_iam_member" "backend_api_noauth" {
  service  = google_cloud_run_service.backend_api.name
  location = google_cloud_run_service.backend_api.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Grant Cloud Run service account access to secrets
data "google_project" "project" {
}

resource "google_secret_manager_secret_iam_member" "backend_jwt_secret_access" {
  count     = var.create_backend_secrets ? 1 : 0
  secret_id = google_secret_manager_secret.jwt_secret[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"

  depends_on = [google_secret_manager_secret.jwt_secret]
}

resource "google_secret_manager_secret_iam_member" "backend_ctp_project_key_access" {
  count     = var.create_backend_secrets && var.enable_commercetools ? 1 : 0
  secret_id = google_secret_manager_secret.ctp_project_key[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"

  depends_on = [google_secret_manager_secret.ctp_project_key]
}

resource "google_secret_manager_secret_iam_member" "backend_ctp_client_id_access" {
  count     = var.create_backend_secrets && var.enable_commercetools ? 1 : 0
  secret_id = google_secret_manager_secret.ctp_client_id[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"

  depends_on = [google_secret_manager_secret.ctp_client_id]
}

resource "google_secret_manager_secret_iam_member" "backend_ctp_client_secret_access" {
  count     = var.create_backend_secrets && var.enable_commercetools ? 1 : 0
  secret_id = google_secret_manager_secret.ctp_client_secret[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"

  depends_on = [google_secret_manager_secret.ctp_client_secret]
}
