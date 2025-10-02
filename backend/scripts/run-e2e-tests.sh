#!/bin/bash

# CommerceTools E2E Test Runner
# Runs integration tests with CommerceTools API using repository secrets

set -e

echo "🧪 Running CommerceTools E2E Integration Tests"
echo "================================================"
echo ""

# Check if environment variables are set
if [ -z "$CTP_PROJECT_KEY" ] || [ -z "$CTP_CLIENT_ID" ] || [ -z "$CTP_CLIENT_SECRET" ]; then
  echo "❌ Error: Required CommerceTools environment variables are not set"
  echo ""
  echo "Please set the following environment variables:"
  echo "  - CTP_PROJECT_KEY"
  echo "  - CTP_CLIENT_ID"
  echo "  - CTP_CLIENT_SECRET"
  echo ""
  echo "Optional:"
  echo "  - TEST_PRODUCT_ID (defaults to 'test-product-id')"
  echo ""
  exit 1
fi

echo "✅ CommerceTools credentials detected"
echo "   Project Key: ${CTP_PROJECT_KEY}"
echo "   API URL: ${CTP_API_URL:-https://api.europe-west1.gcp.commercetools.com}"
echo "   Test Product: ${TEST_PRODUCT_ID:-test-product-id}"
echo ""

# Set NODE_ENV to development to use real API (not test mode)
export NODE_ENV=development

# Run E2E tests
echo "🚀 Running E2E tests..."
echo ""

npm test -- commercetools.e2e.test.ts

echo ""
echo "✅ E2E tests completed successfully!"
