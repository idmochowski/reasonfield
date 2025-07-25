#!/bin/bash

# Backend Deployment Script for GitHub Actions
# This script deploys the backend to Google Cloud Run

set -e  # Exit on any error

echo "🚀 Starting backend deployment..."

# Verify required environment variables
if [ -z "$GOOGLE_CLOUD_PROJECT_ID" ]; then
    echo "❌ Error: GOOGLE_CLOUD_PROJECT_ID is not set"
    exit 1
fi

if [ -z "$BACKEND_SERVICE_NAME" ]; then
    echo "❌ Error: BACKEND_SERVICE_NAME is not set"
    exit 1
fi

if [ -z "$BACKEND_REGION" ]; then
    echo "❌ Error: BACKEND_REGION is not set"
    exit 1
fi

echo "📋 Deployment Configuration:"
echo "   Project ID: $GOOGLE_CLOUD_PROJECT_ID"
echo "   Service Name: $BACKEND_SERVICE_NAME"
echo "   Region: $BACKEND_REGION"

# Set the project
echo "🔧 Setting Google Cloud project..."
gcloud config set project $GOOGLE_CLOUD_PROJECT_ID

# Enable required APIs if not already enabled
echo "🔧 Checking required APIs..."
# APIs are already enabled manually to avoid permission issues
echo "✅ Required APIs are already enabled"

# Create environment variables file for deployment
echo "📝 Creating environment variables file..."
cat > env.yaml << EOF
GOOGLE_CLIENT_ID: "$GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET: "$GOOGLE_CLIENT_SECRET"
GEMINI_API: "$GEMINI_API"
ALLOWED_EMAILS: "$ALLOWED_EMAILS"
GOOGLE_CLOUD_PROJECT_ID: "$GOOGLE_CLOUD_PROJECT_ID"
CORS_ORIGINS: "https://app.reasonfield.com,https://reasonfield-frontend.pages.dev"
EOF

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $BACKEND_SERVICE_NAME \
    --source . \
    --region $BACKEND_REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8000 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 300 \
    --env-vars-file env.yaml

# Get the service URL
SERVICE_URL=$(gcloud run services describe $BACKEND_SERVICE_NAME --region=$BACKEND_REGION --format='value(status.url)')

echo "✅ Backend deployed successfully!"
echo "🌐 Service URL: $SERVICE_URL"
echo "🔗 Custom Domain: https://api.reasonfield.com"

# Clean up
rm -f env.yaml

echo "🎉 Backend deployment completed!" 