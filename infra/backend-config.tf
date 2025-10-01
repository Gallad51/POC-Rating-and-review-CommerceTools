# Backend configuration for Terraform state storage in GCS
# This configuration stores Terraform state in a GCS bucket to persist state across workflow runs
# Each PR gets its own state file folder to avoid conflicts

terraform {
  backend "gcs" {
    # These values should be provided via backend config options during init
    # Example: terraform init -backend-config="bucket=my-bucket" -backend-config="prefix=pr-123"
    # bucket = "terraform-state-bucket-name"  # Set via -backend-config
    # prefix = "terraform/state/pr-{PR_NUMBER}"  # Set via -backend-config
  }
}
