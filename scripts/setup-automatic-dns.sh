#!/bin/bash

# Setup script for automatic DNS management
# This script helps you set up the required GitHub secrets for automatic DNS updates

set -e

echo "🚀 Setting up automatic DNS management for Reasonfield"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -f ".github/workflows/deploy.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 This script will help you set up automatic DNS updates."
echo "   After setup, your backend deployments will automatically update"
echo "   the DNS record for api.reasonfield.com to point to the new service URL."
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq is not installed. Please install it first:"
    echo "   macOS: brew install jq"
    echo "   Ubuntu: sudo apt-get install jq"
    echo "   Windows: Download from https://stedolan.github.io/jq/download/"
    exit 1
fi

echo "✅ jq is installed"
echo ""

# Get Cloudflare API Token
echo "🔑 Step 1: Cloudflare API Token"
echo "   You need a Cloudflare API token with DNS management permissions."
echo "   If you don't have one, create it at: https://dash.cloudflare.com/profile/api-tokens"
echo ""

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "📝 Please enter your Cloudflare API Token:"
    read -s CLOUDFLARE_API_TOKEN
    echo ""
fi

# Get Zone ID
echo "🔍 Step 2: Getting Cloudflare Zone ID..."
export CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN"
ZONE_ID=$(./scripts/get-cloudflare-zone-id.sh | grep "Zone ID found:" | cut -d' ' -f4)

if [ -z "$ZONE_ID" ]; then
    echo "❌ Could not get Zone ID. Please check your API token and try again."
    exit 1
fi

echo "✅ Zone ID: $ZONE_ID"
echo ""

# Summary
echo "🎉 Setup Complete!"
echo "=================================================="
echo ""
echo "📋 Add these secrets to your GitHub repository:"
echo ""
echo "   CLOUDFLARE_ZONE_ID: $ZONE_ID"
echo "   CLOUDFLARE_API_TOKEN: [your-api-token] (you already have this)"
echo ""
echo "🔗 To add secrets:"
echo "   1. Go to: https://github.com/idmochowski/reasonfield/settings/secrets/actions"
echo "   2. Click 'New repository secret'"
echo "   3. Add each secret above"
echo ""
echo "🚀 After adding the secrets:"
echo "   1. Push any change to trigger a deployment"
echo "   2. The backend deployment will automatically update the DNS record"
echo "   3. No more manual DNS adjustments needed!"
echo ""
echo "✅ Your setup is complete!" 