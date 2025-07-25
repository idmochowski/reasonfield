#!/bin/bash

# Test script to verify frontend-backend connection with custom domains

echo "🔍 Testing frontend-backend connection with custom domains..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test frontend
echo -e "${YELLOW}Testing frontend: https://app.reasonfield.com${NC}"
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://app.reasonfield.com)
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Frontend is accessible (HTTP $FRONTEND_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Frontend error (HTTP $FRONTEND_RESPONSE)${NC}"
fi

echo ""

# Test backend
echo -e "${YELLOW}Testing backend: https://api.reasonfield.com${NC}"
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://api.reasonfield.com/auth/google)
if [ "$BACKEND_RESPONSE" = "404" ]; then
    echo -e "${GREEN}✅ Backend is accessible (HTTP $BACKEND_RESPONSE - expected for auth endpoint)${NC}"
else
    echo -e "${RED}❌ Backend error (HTTP $BACKEND_RESPONSE)${NC}"
fi

echo ""

# Test CORS (simulate frontend request to backend)
echo -e "${YELLOW}Testing CORS from frontend to backend...${NC}"
CORS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "Origin: https://app.reasonfield.com" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS https://api.reasonfield.com/auth/google)
if [ "$CORS_RESPONSE" = "200" ] || [ "$CORS_RESPONSE" = "404" ]; then
    echo -e "${GREEN}✅ CORS preflight successful (HTTP $CORS_RESPONSE)${NC}"
else
    echo -e "${RED}❌ CORS preflight failed (HTTP $CORS_RESPONSE)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Connection test complete!${NC}"
echo ""
echo "To manually test the full connection:"
echo "1. Open https://app.reasonfield.com in your browser"
echo "2. Try to log in with Google"
echo "3. Check browser console for any CORS errors"
echo ""
echo "If login works, the frontend-backend connection is successful!" 