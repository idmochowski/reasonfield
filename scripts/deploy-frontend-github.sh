#!/bin/bash

# Frontend Deployment Script for GitHub Actions
# This script deploys the frontend to Cloudflare Pages

set -e  # Exit on any error

echo "🚀 Starting frontend deployment..."

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

echo "📋 Deployment Configuration:"
echo "   Project Name: $FRONTEND_PROJECT_NAME"
echo "   Account ID: $CLOUDFLARE_ACCOUNT_ID"
echo "   App Version: $VITE_APP_VERSION"

# Verify dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found. Make sure to run 'npm run build' first."
    exit 1
fi

# Configure Wrangler using environment variables
echo "🔧 Configuring Wrangler..."
export CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN
export CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID

# Create wrangler.toml if it doesn't exist
if [ ! -f "wrangler.toml" ]; then
    echo "📝 Creating wrangler.toml configuration..."
    cat > wrangler.toml << EOF
name = "$FRONTEND_PROJECT_NAME"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[env.production]
name = "$FRONTEND_PROJECT_NAME"
route = "app.reasonfield.com/*"
zone_name = "reasonfield.com"

[env.production.vars]
VITE_API_URL = "https://api.reasonfield.com"
VITE_GOOGLE_CLIENT_ID = "$VITE_GOOGLE_CLIENT_ID"
VITE_APP_VERSION = "$VITE_APP_VERSION"
EOF
fi

# Deploy to Cloudflare Pages
echo "🚀 Deploying to Cloudflare Pages..."
wrangler pages deploy dist \
    --project-name $FRONTEND_PROJECT_NAME \
    --branch main \
    --commit-dirty=true

echo "✅ Frontend deployed successfully!"
echo "🌐 Custom Domain: https://app.reasonfield.com"
echo "🔗 Production URL: https://main.$FRONTEND_PROJECT_NAME.pages.dev"

# Verify deployment
echo "🔍 Verifying deployment..."
sleep 10  # Wait for deployment to propagate

# Test the custom domain
if curl -f -s https://app.reasonfield.com > /dev/null; then
    echo "✅ Custom domain is accessible!"
else
    echo "⚠️  Custom domain may still be propagating..."
fi

echo "🎉 Frontend deployment completed!" 