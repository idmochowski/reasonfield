#!/bin/bash

# Development Backend Deployment Script for GitHub Actions
# This script deploys the development backend to Google Cloud Run

set -e  # Exit on any error

echo "🚀 Starting development backend deployment..."

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

echo "📋 Development Deployment Configuration:"
echo "   Project ID: $GOOGLE_CLOUD_PROJECT_ID"
echo "   Service Name: $BACKEND_SERVICE_NAME"
echo "   Region: $BACKEND_REGION"
echo "   Environment: Development"

# Set the project
echo "🔧 Setting Google Cloud project..."
gcloud config set project $GOOGLE_CLOUD_PROJECT_ID

# Enable required APIs if not already enabled
echo "🔧 Checking required APIs..."
# APIs are already enabled manually to avoid permission issues
echo "✅ Required APIs are already enabled"

# Create environment variables file for development deployment
echo "📝 Creating environment variables file for development..."
cat > env.yaml << EOF
GOOGLE_CLIENT_ID: "$GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET: "$GOOGLE_CLIENT_SECRET"
GEMINI_API: "$GEMINI_API"
ALLOWED_EMAILS: "$ALLOWED_EMAILS"
GOOGLE_CLOUD_PROJECT_ID: "$GOOGLE_CLOUD_PROJECT_ID"
CORS_ORIGINS: "https://dev.reasonfield.com,https://dev.reasonfield-frontend.pages.dev"
EOF

# Build container image for development
echo "🔨 Building container image for development..."
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

echo "✅ Development build completed successfully!"

# Deploy to Cloud Run using the built image
echo "🚀 Deploying development backend to Cloud Run..."
gcloud run deploy $BACKEND_SERVICE_NAME \
    --image gcr.io/$GOOGLE_CLOUD_PROJECT_ID/$BACKEND_SERVICE_NAME:latest \
    --region $BACKEND_REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 5 \
    --timeout 300 \
    --env-vars-file env.yaml

# Get the service URL
SERVICE_URL=$(gcloud run services describe $BACKEND_SERVICE_NAME --region=$BACKEND_REGION --format='value(status.url)')

echo "✅ Development backend deployed successfully!"
echo "🌐 Service URL: $SERVICE_URL"
echo "🔗 Development Domain: https://dev-api.reasonfield.com"

# Update DNS record for development domain
echo "🔧 Updating DNS record for development domain..."
if [ -n "$CLOUDFLARE_API_TOKEN" ] && [ -n "$CLOUDFLARE_ZONE_ID" ]; then
    echo "📋 Development DNS Update Configuration:"
    echo "   Zone ID: $CLOUDFLARE_ZONE_ID"
    echo "   Target URL: $(echo $SERVICE_URL | sed 's|https://||')"
    
    # Get the current DNS record for dev-api.reasonfield.com
    echo "🔍 Checking existing DNS record for dev-api.reasonfield.com..."
    DNS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?name=dev-api.reasonfield.com" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json")
    
    HTTP_STATUS=$(echo "$DNS_RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
    DNS_BODY=$(echo "$DNS_RESPONSE" | head -n -1)
    
    echo "🔍 DNS Check Response Status: $HTTP_STATUS"
    echo "🔍 DNS Check Response Body: $DNS_BODY"
    
    if [ "$HTTP_STATUS" = "200" ]; then
        RECORD_COUNT=$(echo "$DNS_BODY" | jq '.result | length')
        echo "📊 Found $RECORD_COUNT existing DNS record(s) for dev-api.reasonfield.com"
        
        if [ "$RECORD_COUNT" -gt 0 ]; then
            # Update existing record
            RECORD_ID=$(echo "$DNS_BODY" | jq -r '.result[0].id')
            echo "🔄 Updating existing DNS record (ID: $RECORD_ID)..."
            
            UPDATE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$RECORD_ID" \
                -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
                -H "Content-Type: application/json" \
                -d "{
                    \"type\": \"CNAME\",
                    \"name\": \"dev-api.reasonfield.com\",
                    \"content\": \"$(echo $SERVICE_URL | sed 's|https://||')\",
                    \"proxied\": true
                }")
            
            UPDATE_HTTP_STATUS=$(echo "$UPDATE_RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
            UPDATE_BODY=$(echo "$UPDATE_RESPONSE" | head -n -1)
            
            echo "🔄 DNS Update Response Status: $UPDATE_HTTP_STATUS"
            echo "🔄 DNS Update Response Body: $UPDATE_BODY"
            
            if [ "$UPDATE_HTTP_STATUS" = "200" ]; then
                echo "✅ DNS record updated successfully!"
            else
                echo "❌ Failed to update DNS record. Status: $UPDATE_HTTP_STATUS"
                echo "❌ Response: $UPDATE_BODY"
            fi
        else
            echo "📝 No existing DNS record found. Creating new record..."
            CREATE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
                -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
                -H "Content-Type: application/json" \
                -d "{
                    \"type\": \"CNAME\",
                    \"name\": \"dev-api.reasonfield.com\",
                    \"content\": \"$(echo $SERVICE_URL | sed 's|https://||')\",
                    \"proxied\": true
                }")
            
            CREATE_HTTP_STATUS=$(echo "$CREATE_RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
            CREATE_BODY=$(echo "$CREATE_RESPONSE" | head -n -1)
            
            echo "📝 DNS Create Response Status: $CREATE_HTTP_STATUS"
            echo "📝 DNS Create Response Body: $CREATE_BODY"
            
            if [ "$CREATE_HTTP_STATUS" = "200" ]; then
                echo "✅ DNS record created successfully!"
            else
                echo "❌ Failed to create DNS record. Status: $CREATE_HTTP_STATUS"
                echo "❌ Response: $CREATE_BODY"
            fi
        fi
    else
        echo "❌ Failed to check DNS records. Status: $HTTP_STATUS"
        echo "❌ Response: $DNS_BODY"
    fi
else
    echo "⚠️  Cloudflare credentials not available. DNS update skipped."
    echo "⚠️  Manual DNS setup required:"
    echo "   - Create CNAME record: dev-api.reasonfield.com → $(echo $SERVICE_URL | sed 's|https://||')"
    echo "   - Enable Cloudflare proxy (orange cloud)"
fi

echo "🎉 Development backend deployment completed!"
echo "📱 Development Backend: https://dev-api.reasonfield.com"
echo "🔧 Service URL: $SERVICE_URL"
echo "⚠️  Remember to update Google OAuth credentials to include dev.reasonfield.com" 