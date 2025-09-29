#!/bin/bash

# Troubleshooting script for CI/CD and Cloud Run deployment issues
# Usage: ./scripts/troubleshoot.sh [environment_name] [project_id] [region]

set -e

# Default values
ENV_NAME=${1:-"dev"}
PROJECT_ID=${2:-"ratings-reviews-poc"}
REGION=${3:-"us-central1"}
SERVICE_NAME="ratings-reviews"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Ratings & Reviews POC Troubleshoot Script ===${NC}"
echo "Environment: $ENV_NAME"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Function to print status
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "OK" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    else
        echo -e "${RED}❌ $message${NC}"
    fi
}

# Function to check command availability
check_command() {
    if command -v $1 &> /dev/null; then
        print_status "OK" "$1 is installed"
        return 0
    else
        print_status "ERROR" "$1 is not installed"
        return 1
    fi
}

echo -e "${BLUE}1. Checking prerequisites...${NC}"
check_command "gcloud" || { echo "Install Google Cloud SDK"; exit 1; }
check_command "docker" || { echo "Install Docker"; exit 1; }
check_command "curl" || { echo "Install curl"; exit 1; }

# Check gcloud authentication
echo -e "\n${BLUE}2. Checking Google Cloud authentication...${NC}"
if gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 &> /dev/null; then
    ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1)
    print_status "OK" "Authenticated as: $ACTIVE_ACCOUNT"
else
    print_status "ERROR" "Not authenticated to Google Cloud"
    echo "Run: gcloud auth login"
    exit 1
fi

# Check project configuration
echo -e "\n${BLUE}3. Checking project configuration...${NC}"
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
if [ "$CURRENT_PROJECT" = "$PROJECT_ID" ]; then
    print_status "OK" "Project set to: $PROJECT_ID"
else
    print_status "WARN" "Current project: $CURRENT_PROJECT, Expected: $PROJECT_ID"
    echo "Run: gcloud config set project $PROJECT_ID"
fi

# Check enabled APIs
echo -e "\n${BLUE}4. Checking enabled APIs...${NC}"
REQUIRED_APIS=("run.googleapis.com" "containerregistry.googleapis.com" "secretmanager.googleapis.com")

for api in "${REQUIRED_APIS[@]}"; do
    if gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"; then
        print_status "OK" "$api is enabled"
    else
        print_status "ERROR" "$api is not enabled"
        echo "Run: gcloud services enable $api"
    fi
done

# Check Cloud Run services
echo -e "\n${BLUE}5. Checking Cloud Run services...${NC}"

BACKEND_SERVICE="${SERVICE_NAME}-backend-${ENV_NAME}"
FRONTEND_SERVICE="${SERVICE_NAME}-frontend-${ENV_NAME}"

# Backend service
if gcloud run services describe "$BACKEND_SERVICE" --region="$REGION" &> /dev/null; then
    BACKEND_URL=$(gcloud run services describe "$BACKEND_SERVICE" --region="$REGION" --format='value(status.url)')
    print_status "OK" "Backend service exists: $BACKEND_URL"
    
    # Test backend health
    if curl -s -f "$BACKEND_URL/health" &> /dev/null; then
        print_status "OK" "Backend health check passed"
    else
        print_status "ERROR" "Backend health check failed"
        echo "Backend URL: $BACKEND_URL/health"
    fi
    
    # Test backend API
    if curl -s -f "$BACKEND_URL/api/ratings" &> /dev/null; then
        print_status "OK" "Backend API accessible"
    else
        print_status "ERROR" "Backend API not accessible"
        echo "API URL: $BACKEND_URL/api/ratings"
    fi
else
    print_status "ERROR" "Backend service '$BACKEND_SERVICE' not found"
fi

# Frontend service
if gcloud run services describe "$FRONTEND_SERVICE" --region="$REGION" &> /dev/null; then
    FRONTEND_URL=$(gcloud run services describe "$FRONTEND_SERVICE" --region="$REGION" --format='value(status.url)')
    print_status "OK" "Frontend service exists: $FRONTEND_URL"
    
    # Test frontend health
    if curl -s -f "$FRONTEND_URL/health" &> /dev/null; then
        print_status "OK" "Frontend health check passed"
    else
        print_status "ERROR" "Frontend health check failed"
        echo "Frontend URL: $FRONTEND_URL/health"
    fi
    
    # Test frontend page
    if curl -s -f "$FRONTEND_URL" &> /dev/null; then
        print_status "OK" "Frontend page accessible"
    else
        print_status "ERROR" "Frontend page not accessible"
        echo "Frontend URL: $FRONTEND_URL"
    fi
else
    print_status "ERROR" "Frontend service '$FRONTEND_SERVICE' not found"
fi

# Check container images
echo -e "\n${BLUE}6. Checking container images...${NC}"
if gcloud container images list --repository="gcr.io/$PROJECT_ID" --format="value(name)" | grep -q "backend"; then
    print_status "OK" "Backend images found in registry"
else
    print_status "WARN" "No backend images found in registry"
fi

if gcloud container images list --repository="gcr.io/$PROJECT_ID" --format="value(name)" | grep -q "frontend"; then
    print_status "OK" "Frontend images found in registry"
else
    print_status "WARN" "No frontend images found in registry"
fi

# Check quotas and limits
echo -e "\n${BLUE}7. Checking quotas and usage...${NC}"
echo "Cloud Run services in region $REGION:"
gcloud run services list --region="$REGION" --format="table(metadata.name,status.url,status.conditions[0].type)" 2>/dev/null || print_status "WARN" "Could not list Cloud Run services"

echo -e "\n${BLUE}8. Common troubleshooting steps:${NC}"
echo "• Check GitHub Actions logs for build errors"
echo "• Verify GCP_SA_KEY secret is set in GitHub repository"
echo "• Ensure GCP_PROJECT_ID secret matches your project"
echo "• Check Cloud Run logs: gcloud logs read --service=$BACKEND_SERVICE"
echo "• Verify Dockerfile builds locally: docker build -t test ./backend"
echo "• Check service account permissions for Cloud Run and Container Registry"

echo -e "\n${BLUE}9. Useful commands:${NC}"
echo "• Deploy manually: gcloud run deploy SERVICE --image=IMAGE --region=$REGION"
echo "• View logs: gcloud logs read --service=SERVICE_NAME --region=$REGION"
echo "• Delete service: gcloud run services delete SERVICE_NAME --region=$REGION"
echo "• List images: gcloud container images list --repository=gcr.io/$PROJECT_ID"

echo -e "\n${GREEN}Troubleshooting complete!${NC}"