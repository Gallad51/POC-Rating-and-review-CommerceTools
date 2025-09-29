output "backend_url" {
  description = "URL of the backend Cloud Run service"
  value       = google_cloud_run_service.backend.status[0].url
}

output "frontend_url" {
  description = "URL of the frontend Cloud Run service"
  value       = google_cloud_run_service.frontend.status[0].url
}

output "backend_service_name" {
  description = "Name of the backend Cloud Run service"
  value       = google_cloud_run_service.backend.name
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