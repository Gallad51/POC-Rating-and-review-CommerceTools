variable "project_id" {
  description = "The GCP project ID"
  type        = string
  default     = "ratings-reviews-poc"
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "service_name" {
  description = "The base name for services"
  type        = string
  default     = "ratings-reviews"
}

variable "environment" {
  description = "The deployment environment (dev, staging, prod)"
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