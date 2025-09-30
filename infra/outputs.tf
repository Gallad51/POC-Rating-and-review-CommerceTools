output "backend_url" {
  description = "URL of the backend Cloud Run service"
  value       = google_cloud_run_service.backend_api.status[0].url
}

output "backend_api_url" {
  description = "URL of the backend API (alias)"
  value       = google_cloud_run_service.backend_api.status[0].url
}

output "frontend_url" {
  description = "URL of the frontend Cloud Run service"
  value       = google_cloud_run_service.frontend.status[0].url
}

output "backend_service_name" {
  description = "Name of the backend Cloud Run service"
  value       = google_cloud_run_service.backend_api.name
}

output "frontend_service_name" {
  description = "Name of the frontend Cloud Run service"
  value       = google_cloud_run_service.frontend.name
}

output "project_id" {
  description = "The GCP project ID"
  value       = var.project_id
}

output "region" {
  description = "The GCP region"
  value       = var.region
}

output "environment" {
  description = "The deployment environment"
  value       = var.environment
}

output "backend_health_check_url" {
  description = "Backend health check endpoint"
  value       = "${google_cloud_run_service.backend_api.status[0].url}/health"
}

output "backend_api_docs_url" {
  description = "Backend API documentation (Swagger)"
  value       = "${google_cloud_run_service.backend_api.status[0].url}/api-docs"
}