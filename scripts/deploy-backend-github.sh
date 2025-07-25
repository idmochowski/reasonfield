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
CORS_ORIGINS: "https://app.reasonfield.com,https://main.reasonfield-frontend.pages.dev"
EOF

# Build container image first
echo "🔨 Building container image..."
gcloud builds submit --tag gcr.io/$GOOGLE_CLOUD_PROJECT_ID/$BACKEND_SERVICE_NAME:latest . --quiet || {
    echo "⚠️  Build log streaming failed, but build may still be successful. Checking status..."
    sleep 10
    LATEST_BUILD=$(gcloud builds list --limit=1 --format="value(id)")
    BUILD_STATUS=$(gcloud builds describe $LATEST_BUILD --format="value(status)")
    if [ "$BUILD_STATUS" != "SUCCESS" ]; then
        echo "❌ Build failed with status: $BUILD_STATUS"
        exit 1
    fi
    echo "✅ Build completed successfully!"
}

echo "✅ Build completed successfully!"

# Deploy to Cloud Run using the built image
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $BACKEND_SERVICE_NAME \
    --image gcr.io/$GOOGLE_CLOUD_PROJECT_ID/$BACKEND_SERVICE_NAME:latest \
    --region $BACKEND_REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
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

# Update DNS record automatically
echo "🔧 Updating DNS record..."
if [ -n "$CLOUDFLARE_API_TOKEN" ] && [ -n "$CLOUDFLARE_ZONE_ID" ]; then
    echo "📋 DNS Update Configuration:"
    echo "   Zone ID: $CLOUDFLARE_ZONE_ID"
    echo "   Target URL: $(echo $SERVICE_URL | sed 's|https://||')"
    
    # Get the current DNS record
    echo "🔍 Checking existing DNS record..."
    DNS_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?name=api.reasonfield.com" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json")
    
    echo "📡 Cloudflare API Response: $DNS_RESPONSE"
    
    CURRENT_RECORD=$(echo "$DNS_RESPONSE" | jq -r '.result[0].id // empty')
    
    if [ -n "$CURRENT_RECORD" ]; then
        echo "📝 Updating existing DNS record: $CURRENT_RECORD"
        # Update existing record
        UPDATE_RESPONSE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$CURRENT_RECORD" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{
                \"type\": \"CNAME\",
                \"name\": \"api.reasonfield.com\",
                \"content\": \"$(echo $SERVICE_URL | sed 's|https://||')\",
                \"ttl\": 1,
                \"proxied\": false
            }")
        
        echo "📡 Update Response: $UPDATE_RESPONSE"
        
        if echo "$UPDATE_RESPONSE" | jq -e '.success' > /dev/null; then
            echo "✅ DNS record updated successfully!"
        else
            echo "❌ DNS record update failed!"
            echo "📝 Please manually update DNS record for api.reasonfield.com to point to: $(echo $SERVICE_URL | sed 's|https://||')"
        fi
    else
        echo "📝 Creating new DNS record..."
        # Create new record
        CREATE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{
                \"type\": \"CNAME\",
                \"name\": \"api.reasonfield.com\",
                \"content\": \"$(echo $SERVICE_URL | sed 's|https://||')\",
                \"ttl\": 1,
                \"proxied\": false
            }")
        
        echo "📡 Create Response: $CREATE_RESPONSE"
        
        if echo "$CREATE_RESPONSE" | jq -e '.success' > /dev/null; then
            echo "✅ DNS record created successfully!"
        else
            echo "❌ DNS record creation failed!"
            echo "📝 Please manually update DNS record for api.reasonfield.com to point to: $(echo $SERVICE_URL | sed 's|https://||')"
        fi
    fi
else
    echo "⚠️  CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID not set - DNS update skipped"
    echo "📝 Please manually update DNS record for api.reasonfield.com to point to: $(echo $SERVICE_URL | sed 's|https://||')"
fi

# Clean up
rm -f env.yaml

echo "🎉 Backend deployment completed!" 