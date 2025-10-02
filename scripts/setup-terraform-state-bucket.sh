#!/bin/bash
# Setup script for Terraform state bucket
# This script creates and configures the GCS bucket for storing Terraform state

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed. Please install it first."
    print_info "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Prompt for project ID if not provided
if [ -z "$1" ]; then
    read -p "Enter your GCP Project ID: " PROJECT_ID
else
    PROJECT_ID=$1
fi

# Validate project ID
if [ -z "$PROJECT_ID" ]; then
    print_error "Project ID cannot be empty"
    exit 1
fi

print_info "Using project: $PROJECT_ID"

# Set the project
gcloud config set project "$PROJECT_ID"

# Prompt for bucket name
BUCKET_NAME_DEFAULT="${PROJECT_ID}-terraform-state"
read -p "Enter GCS bucket name (default: $BUCKET_NAME_DEFAULT): " BUCKET_NAME
BUCKET_NAME=${BUCKET_NAME:-$BUCKET_NAME_DEFAULT}

print_info "Bucket name: $BUCKET_NAME"

# Prompt for region
REGION_DEFAULT="europe-west1"
read -p "Enter GCS region (default: $REGION_DEFAULT): " REGION
REGION=${REGION:-$REGION_DEFAULT}

print_info "Region: $REGION"

# Check if bucket already exists
if gsutil ls -b "gs://$BUCKET_NAME" &> /dev/null; then
    print_warning "Bucket gs://$BUCKET_NAME already exists"
    read -p "Do you want to continue with the existing bucket? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        print_info "Exiting..."
        exit 0
    fi
else
    # Create the bucket
    print_info "Creating bucket gs://$BUCKET_NAME..."
    gsutil mb -p "$PROJECT_ID" -l "$REGION" "gs://$BUCKET_NAME"
    print_info "✓ Bucket created successfully"
fi

# Enable versioning
print_info "Enabling versioning on bucket..."
gsutil versioning set on "gs://$BUCKET_NAME"
print_info "✓ Versioning enabled"

# Set bucket to private (uniform bucket-level access)
print_info "Setting bucket access to uniform bucket-level access..."
gsutil uniformbucketlevelaccess set on "gs://$BUCKET_NAME"
print_info "✓ Uniform access enabled"

# Get the service account email
SERVICE_ACCOUNT_NAME="github-actions"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Check if service account exists
if gcloud iam service-accounts describe "$SERVICE_ACCOUNT_EMAIL" &> /dev/null; then
    print_info "Service account $SERVICE_ACCOUNT_EMAIL already exists"
    
    # Grant bucket access to the service account
    print_info "Granting Storage Object Admin role to service account..."
    gsutil iam ch "serviceAccount:${SERVICE_ACCOUNT_EMAIL}:objectAdmin" "gs://$BUCKET_NAME"
    print_info "✓ Permissions granted"
else
    print_warning "Service account $SERVICE_ACCOUNT_EMAIL does not exist"
    print_info "Please create it first and grant it Storage Object Admin role:"
    echo ""
    echo "  gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \\"
    echo "    --display-name=\"GitHub Actions Deployer\" \\"
    echo "    --project=$PROJECT_ID"
    echo ""
    echo "  gsutil iam ch \"serviceAccount:${SERVICE_ACCOUNT_EMAIL}:objectAdmin\" \\"
    echo "    \"gs://$BUCKET_NAME\""
fi

echo ""
print_info "=========================================="
print_info "Setup Complete!"
print_info "=========================================="
echo ""
print_info "Next steps:"
echo ""
echo "1. Add the bucket name to GitHub repository secrets/variables:"
echo "   - Go to: Settings > Secrets and variables > Actions"
echo "   - Add Secret or Variable: TF_STATE_BUCKET"
echo "   - Value: $BUCKET_NAME"
echo ""
echo "2. Your workflows will now use this bucket for Terraform state storage"
echo "   - Preview deployments: gs://$BUCKET_NAME/terraform/state/pr-{NUMBER}/"
echo "   - Production: gs://$BUCKET_NAME/terraform/state/prod/"
echo ""
echo "3. For local development, initialize Terraform with:"
echo "   cd infra"
echo "   terraform init \\"
echo "     -backend-config=\"bucket=$BUCKET_NAME\" \\"
echo "     -backend-config=\"prefix=terraform/state/local\""
echo ""
print_info "For more information, see: backend/docs/GITHUB_ACTIONS_VARIABLES.md"
