#!/bin/bash

# Development Frontend Deployment Script for GitHub Actions
# This script deploys the development frontend to Cloudflare Pages

set -e  # Exit on any error

echo "🚀 Starting development frontend deployment..."

# Verify required environment variables
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN is not set"
    exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo "❌ Error: CLOUDFLARE_ACCOUNT_ID is not set"
    exit 1
fi

if [ -z "$FRONTEND_PROJECT_NAME" ]; then
    echo "❌ Error: FRONTEND_PROJECT_NAME is not set"
    exit 1
fi

echo "📋 Development Deployment Configuration:"
echo "   Project Name: $FRONTEND_PROJECT_NAME"
echo "   Account ID: $CLOUDFLARE_ACCOUNT_ID"
echo "   App Version: $VITE_APP_VERSION"
echo "   Environment: Development"
echo "   API URL: https://dev-api.reasonfield.com"

# Verify dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found. Make sure to run 'npm run build' first."
    exit 1
fi

# Configure Wrangler using environment variables
echo "🔧 Configuring Wrangler for development..."
export CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN
export CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID

# Create wrangler.toml for development
echo "📝 Creating wrangler.toml configuration for development..."
cat > wrangler.toml << EOF
name = "$FRONTEND_PROJECT_NAME"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[env.development]
name = "$FRONTEND_PROJECT_NAME"
route = "dev.reasonfield.com/*"
zone_name = "reasonfield.com"

[env.development.vars]
VITE_API_URL = "https://dev-api.reasonfield.com"
VITE_GOOGLE_CLIENT_ID = "$VITE_GOOGLE_CLIENT_ID"
VITE_APP_VERSION = "$VITE_APP_VERSION"
EOF

# Deploy to Cloudflare Pages (development branch)
echo "🚀 Deploying to Cloudflare Pages (development)..."
wrangler pages deploy dist \
    --project-name $FRONTEND_PROJECT_NAME \
    --branch dev \
    --commit-dirty=true \
    --env-vars VITE_API_BASE_URL=https://dev-api.reasonfield.com,VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID,VITE_APP_VERSION=$VITE_APP_VERSION

echo "✅ Development frontend deployed successfully!"
echo "🌐 Development Domain: https://dev.reasonfield.com"
echo "🔗 Development URL: https://dev.$FRONTEND_PROJECT_NAME.pages.dev"

# Verify deployment
echo "🔍 Verifying development deployment..."
sleep 10  # Wait for deployment to propagate

# Test the development domain
if curl -f -s https://dev.reasonfield.com > /dev/null; then
    echo "✅ Development domain is accessible!"
else
    echo "⚠️  Development domain may still be propagating..."
    echo "🔗 Try accessing: https://dev.$FRONTEND_PROJECT_NAME.pages.dev"
fi

echo "🎉 Development frontend deployment completed!"
echo "📱 Development Frontend: https://dev.reasonfield.com"
echo "🔧 Development Backend: https://dev-api.reasonfield.com"
echo "⚠️  Remember to update Google OAuth credentials to include dev.reasonfield.com" 