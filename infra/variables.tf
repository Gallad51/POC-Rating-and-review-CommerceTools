variable "project_id" {
  description = "The GCP project ID"
  type        = string
  default     = "ratings-reviews-poc"
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
  default     = "europe-west1"
}

variable "service_name" {
  description = "The base name for services"
  type        = string
  default     = "ratings-reviews"
}

variable "environment" {
  description = "The deployment environment (dev, staging, prod, preview)"
  type        = string
  default     = "dev"
}

variable "backend_image" {
  description = "The Docker image for the backend service"
  type        = string
  default     = "gcr.io/ratings-reviews-poc/backend:latest"
}

variable "frontend_image" {
  description = "The Docker image for the frontend service"
  type        = string
  default     = "gcr.io/ratings-reviews-poc/frontend:latest"
}

variable "secrets" {
  description = "Map of secrets to create in Secret Manager"
  type        = map(string)
  default = {
    "api-key"     = "mock-api-key-for-poc"
    "db-password" = "mock-db-password-for-poc"
  }
  sensitive = true
}

variable "backend_secrets" {
  description = "List of secret environment variables for the backend"
  type = list(object({
    name        = string
    secret_name = string
    secret_key  = string
  }))
  default = [
    {
      name        = "API_KEY"
      secret_name = "api-key"
      secret_key  = "latest"
    }
  ]
}

# Backend-specific variables

variable "create_backend_secrets" {
  description = "Whether to create backend secrets (JWT, CommerceTools). Set to false for preview environments."
  type        = bool
  default     = false
}

variable "jwt_secret" {
  description = "JWT secret for token signing (required for production)"
  type        = string
  default     = "default-jwt-secret-change-in-production"
  sensitive   = true
}

variable "enable_commercetools" {
  description = "Enable CommerceTools integration (false for mock/POC mode)"
  type        = bool
  default     = false
}

variable "ctp_project_key" {
  description = "CommerceTools project key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "ctp_client_id" {
  description = "CommerceTools client ID"
  type        = string
  default     = ""
  sensitive   = true
}

variable "ctp_client_secret" {
  description = "CommerceTools client secret"
  type        = string
  default     = ""
  sensitive   = true
}

variable "ctp_api_url" {
  description = "CommerceTools API URL"
  type        = string
  default     = "https://api.europe-west1.gcp.commercetools.com"
}

variable "ctp_auth_url" {
  description = "CommerceTools Auth URL"
  type        = string
  default     = "https://auth.europe-west1.gcp.commercetools.com"
}

variable "ctp_scopes" {
  description = "CommerceTools API scopes"
  type        = string
  default     = "manage_project:ratings-reviews-poc view_products:ratings-reviews-poc"
}

variable "rate_limit_window_ms" {
  description = "Rate limit window in milliseconds"
  type        = string
  default     = "60000"
}

variable "rate_limit_max_requests" {
  description = "Maximum requests per rate limit window"
  type        = string
  default     = "10"
}

variable "cors_origin" {
  description = "Allowed CORS origins (comma-separated)"
  type        = string
  default     = "*"
}

variable "log_level" {
  description = "Logging level (error, warn, info, debug)"
  type        = string
  default     = "info"
}

# Backend resource configuration

variable "backend_min_instances" {
  description = "Minimum number of backend instances"
  type        = string
  default     = "0"
}

variable "backend_max_instances" {
  description = "Maximum number of backend instances"
  type        = string
  default     = "10"
}

variable "backend_concurrency" {
  description = "Maximum concurrent requests per backend instance"
  type        = number
  default     = 80
}

variable "backend_timeout" {
  description = "Request timeout for backend in seconds"
  type        = number
  default     = 300
}

variable "backend_cpu" {
  description = "CPU allocation for backend"
  type        = string
  default     = "1000m"
}

variable "backend_memory" {
  description = "Memory allocation for backend"
  type        = string
  default     = "512Mi"
}