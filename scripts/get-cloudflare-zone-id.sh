#!/bin/bash

# Script to get Cloudflare Zone ID for a domain
# Usage: ./scripts/get-cloudflare-zone-id.sh

set -e

echo "🔍 Getting Cloudflare Zone ID for reasonfield.com..."

# Check if API token is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN is not set"
    echo "📝 Please set your Cloudflare API token:"
    echo "   export CLOUDFLARE_API_TOKEN='your-api-token-here'"
    exit 1
fi

# Get zone ID for reasonfield.com
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=reasonfield.com" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" | jq -r '.result[0].id // empty')

if [ -n "$ZONE_ID" ]; then
    echo "✅ Zone ID found: $ZONE_ID"
    echo ""
    echo "📋 Add this to your GitHub Secrets:"
    echo "   CLOUDFLARE_ZONE_ID: $ZONE_ID"
    echo ""
    echo "🔗 You can also find this in Cloudflare Dashboard:"
    echo "   https://dash.cloudflare.com/ -> reasonfield.com -> Overview -> Zone ID"
else
    echo "❌ Error: Could not find zone ID for reasonfield.com"
    echo "📝 Make sure:"
    echo "   1. The domain is added to your Cloudflare account"
    echo "   2. Your API token has the correct permissions"
    echo "   3. You're using the correct API token"
fi 