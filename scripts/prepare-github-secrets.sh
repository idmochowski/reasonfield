#!/bin/bash

# GitHub Secrets Preparation Script
# This script helps prepare secrets for GitHub Actions

set -e

echo "🔧 GitHub Secrets Preparation Script"
echo "=================================="

# Check if service account file exists
SERVICE_ACCOUNT_FILE=""
if [ -f "service-account.json" ]; then
    SERVICE_ACCOUNT_FILE="service-account.json"
elif [ -f "backend/service-account.json" ]; then
    SERVICE_ACCOUNT_FILE="backend/service-account.json"
else
    echo "❌ Service account JSON file not found!"
    echo "Please place your service account JSON file in the root directory or backend/ directory"
    echo "File should be named: service-account.json"
    exit 1
fi

echo "✅ Found service account file: $SERVICE_ACCOUNT_FILE"

# Convert service account to base64
echo "🔐 Converting service account to base64..."
BASE64_KEY=$(base64 -i "$SERVICE_ACCOUNT_FILE" | tr -d '\n')

echo ""
echo "📋 GitHub Secrets to Add:"
echo "========================="
echo ""
echo "1. GOOGLE_CLOUD_SA_KEY:"
echo "$BASE64_KEY"
echo ""
echo "2. GOOGLE_CLOUD_PROJECT_ID:"
echo "   (Get this from your service account JSON or Google Cloud Console)"
echo ""
echo "3. GOOGLE_CLIENT_ID:"
echo "   (Your Google OAuth client ID)"
echo ""
echo "4. GOOGLE_CLIENT_SECRET:"
echo "   (Your Google OAuth client secret)"
echo ""
echo "5. CLOUDFLARE_API_TOKEN:"
echo "   (Your Cloudflare API token with Pages access)"
echo ""
echo "6. CLOUDFLARE_ACCOUNT_ID:"
echo "   (Your Cloudflare account ID from dashboard)"
echo ""
echo "7. GEMINI_API:"
echo "   (Your Gemini API key)"
echo ""
echo "8. ALLOWED_EMAILS:"
echo "   (Comma-separated list of allowed emails, e.g., your-email@gmail.com)"
echo ""

# Extract project ID from service account if possible
PROJECT_ID=$(grep -o '"project_id": "[^"]*"' "$SERVICE_ACCOUNT_FILE" | cut -d'"' -f4)
if [ ! -z "$PROJECT_ID" ]; then
    echo "💡 Detected Project ID from service account: $PROJECT_ID"
    echo "   Use this as GOOGLE_CLOUD_PROJECT_ID"
    echo ""
fi

echo "📝 Instructions:"
echo "1. Go to your GitHub repository"
echo "2. Navigate to Settings → Secrets and variables → Actions"
echo "3. Add each secret with the values above"
echo "4. Push your code to trigger the first deployment"
echo ""
echo "🎯 Next Steps:"
echo "- Create GitHub repository"
echo "- Add all secrets"
echo "- Push code to main branch"
echo "- Monitor GitHub Actions" 