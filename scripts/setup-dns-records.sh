#!/bin/bash

# Script to set up DNS records for custom domains
# Requires CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN environment variables

echo "🌐 Setting up DNS records for custom domains..."

# Load environment variables from cloudflare.env if it exists
if [ -f "cloudflare.env" ]; then
    echo "📁 Loading credentials from cloudflare.env..."
    export $(cat cloudflare.env | grep -v '^#' | xargs)
fi

# Check if environment variables are set
if [ -z "$CLOUDFLARE_ZONE_ID" ]; then
    echo "❌ Error: CLOUDFLARE_ZONE_ID environment variable is not set"
    echo "Please either:"
    echo "1. Edit cloudflare.env and add your Zone ID"
    echo "2. Or run: export CLOUDFLARE_ZONE_ID='your-zone-id-here'"
    exit 1
fi

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN environment variable is not set"
    echo "Please either:"
    echo "1. Edit cloudflare.env and add your API Token"
    echo "2. Or run: export CLOUDFLARE_API_TOKEN='your-api-token-here'"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}✅ Environment variables are set${NC}"
echo "Zone ID: $CLOUDFLARE_ZONE_ID"
echo ""

# Frontend DNS Record (app.reasonfield.com)
echo -e "${YELLOW}Setting up app.reasonfield.com...${NC}"

FRONTEND_RECORD=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CNAME",
    "name": "app",
    "content": "reasonfield-frontend.pages.dev",
    "ttl": 1,
    "proxied": true
  }')

if echo "$FRONTEND_RECORD" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Frontend DNS record created successfully${NC}"
else
    echo -e "${RED}❌ Failed to create frontend DNS record${NC}"
    echo "$FRONTEND_RECORD"
fi

echo ""

# Backend DNS Record (api.reasonfield.com)
echo -e "${YELLOW}Setting up api.reasonfield.com...${NC}"

BACKEND_RECORD=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CNAME",
    "name": "api",
    "content": "reasonfield-backend-635296697411.europe-west3.run.app",
    "ttl": 1,
    "proxied": false
  }')

if echo "$BACKEND_RECORD" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Backend DNS record created successfully${NC}"
else
    echo -e "${RED}❌ Failed to create backend DNS record${NC}"
    echo "$BACKEND_RECORD"
fi

echo ""
echo -e "${GREEN}🎉 DNS records setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Wait a few minutes for DNS propagation"
echo "2. Set up custom domain in Cloudflare Pages dashboard"
echo "3. Configure Google Cloud Run domain mapping"
echo "4. Update Google OAuth origins"
echo "5. Update environment variables" 