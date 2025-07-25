#!/bin/bash

# Test script to diagnose Cloudflare API issues
# This will help us understand why the DNS update is failing

set -e

echo "🔍 Testing Cloudflare API connectivity..."
echo "=========================================="

# Check if environment variables are set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN is not set"
    echo "📝 Please set it: export CLOUDFLARE_API_TOKEN='your-token'"
    exit 1
fi

if [ -z "$CLOUDFLARE_ZONE_ID" ]; then
    echo "❌ Error: CLOUDFLARE_ZONE_ID is not set"
    echo "📝 Please set it: export CLOUDFLARE_ZONE_ID='your-zone-id'"
    exit 1
fi

echo "✅ Environment variables are set"
echo "   Zone ID: $CLOUDFLARE_ZONE_ID"
echo "   API Token: ${CLOUDFLARE_API_TOKEN:0:10}..."

# Test 1: Check if we can access the zone
echo ""
echo "🔍 Test 1: Checking zone access..."
ZONE_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json")

echo "📡 Zone Response: $ZONE_RESPONSE"

if echo "$ZONE_RESPONSE" | jq -e '.success' > /dev/null; then
    echo "✅ Zone access successful!"
    ZONE_NAME=$(echo "$ZONE_RESPONSE" | jq -r '.result.name')
    echo "   Zone Name: $ZONE_NAME"
else
    echo "❌ Zone access failed!"
    ERROR_MSG=$(echo "$ZONE_RESPONSE" | jq -r '.errors[0].message // "Unknown error"')
    echo "   Error: $ERROR_MSG"
    exit 1
fi

# Test 2: Check DNS records
echo ""
echo "🔍 Test 2: Checking DNS records..."
DNS_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?name=api.reasonfield.com" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json")

echo "📡 DNS Response: $DNS_RESPONSE"

if echo "$DNS_RESPONSE" | jq -e '.success' > /dev/null; then
    echo "✅ DNS records access successful!"
    RECORD_COUNT=$(echo "$DNS_RESPONSE" | jq '.result | length')
    echo "   Found $RECORD_COUNT DNS record(s)"
    
    if [ "$RECORD_COUNT" -gt 0 ]; then
        CURRENT_RECORD=$(echo "$DNS_RESPONSE" | jq -r '.result[0].id')
        CURRENT_CONTENT=$(echo "$DNS_RESPONSE" | jq -r '.result[0].content')
        echo "   Current Record ID: $CURRENT_RECORD"
        echo "   Current Content: $CURRENT_CONTENT"
    fi
else
    echo "❌ DNS records access failed!"
    ERROR_MSG=$(echo "$DNS_RESPONSE" | jq -r '.errors[0].message // "Unknown error"')
    echo "   Error: $ERROR_MSG"
fi

echo ""
echo "🎯 Summary:"
echo "   If both tests passed, the API should work in deployment"
echo "   If tests failed, check your API token permissions"
echo ""
echo "📋 Required API Token Permissions:"
echo "   - Zone:Zone:Read"
echo "   - Zone:DNS:Edit" 