#!/bin/bash

# Custom Domain Setup Script
# Sets up custom domains for both frontend and backend

set -e

echo "🌐 Setting up custom domains..."

# Load environment variables
source .env

# Check if Cloudflare credentials are available
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN not set in .env"
    exit 1
fi

if [ -z "$CLOUDFLARE_ZONE_ID" ]; then
    echo "❌ Error: CLOUDFLARE_ZONE_ID not set in .env"
    exit 1
fi

echo "✅ Cloudflare credentials loaded"

# Get the current backend URL
BACKEND_URL=$(gcloud run services describe reasonfield-backend --region=europe-west3 --format='value(status.url)')
echo "🔧 Backend URL: $BACKEND_URL"

# Set up DNS records for backend
echo "📝 Setting up DNS records for api.reasonfield.com..."

# Create CNAME record for backend
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data "{
    \"type\": \"CNAME\",
    \"name\": \"api\",
    \"content\": \"$(echo $BACKEND_URL | sed 's|https://||')\",
    \"ttl\": 1,
    \"proxied\": false
  }" | jq -r '.success'

echo "✅ DNS record created for api.reasonfield.com"

# Wait for DNS propagation
echo "⏳ Waiting for DNS propagation..."
sleep 30

# Verify DNS record
echo "🔍 Verifying DNS record..."
nslookup api.reasonfield.com

echo ""
echo "🎉 Custom domain setup completed!"
echo "📱 Frontend: https://app.reasonfield.com"
echo "🔧 Backend: https://api.reasonfield.com"
echo ""
echo "⚠️  Note: It may take a few minutes for DNS changes to propagate globally." 