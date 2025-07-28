# 🚀 Development Environment Setup Guide

## 📋 Overview

This guide sets up a complete development environment that runs parallel to production, allowing safe testing and development without affecting the live application.

## 🏗️ Architecture

### **Production Environment:**
- **Branch**: `main`
- **Frontend**: `app.reasonfield.com`
- **Backend**: `api.reasonfield.com`
- **Cloud Run**: `reasonfield-backend`
- **Cloudflare Pages**: `reasonfield-frontend`

### **Development Environment:**
- **Branch**: `dev`
- **Frontend**: `dev.reasonfield.com`
- **Backend**: `dev-api.reasonfield.com`
- **Cloud Run**: `reasonfield-backend-dev`
- **Cloudflare Pages**: `reasonfield-frontend-dev`

## 🔧 Setup Steps

### **1. Create Development Branch**

```bash
# Create and push dev branch
git checkout -b dev
git push origin dev
```

### **2. Google Cloud Run Setup**

#### **A. Create Development Backend Service**
```bash
# The deployment script will automatically create:
# - Service: reasonfield-backend-dev
# - Region: us-central1
# - Memory: 1Gi
# - CPU: 1
# - Max instances: 5 (lower than production)
```

#### **B. Domain Mapping**
```bash
# Map custom domain to development service
gcloud run domain-mappings create \
  --service=reasonfield-backend-dev \
  --domain=dev-api.reasonfield.com \
  --region=us-central1
```

### **3. Cloudflare Pages Setup**

#### **A. Create Development Project**
1. Go to Cloudflare Dashboard → Pages
2. Create new project: `reasonfield-frontend-dev`
3. Connect to GitHub repository
4. Set build settings:
   - **Framework preset**: None
   - **Build command**: `cd frontend && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory**: `/`

#### **B. Custom Domain Setup**
1. In Pages project settings → Custom domains
2. Add custom domain: `dev.reasonfield.com`
3. Configure DNS (will be handled by deployment script)

### **4. DNS Records Setup**

#### **A. Backend DNS Record**
```bash
# CNAME Record
Name: dev-api.reasonfield.com
Target: [Cloud Run service URL]
Proxy: Enabled (orange cloud)
```

#### **B. Frontend DNS Record**
```bash
# CNAME Record  
Name: dev.reasonfield.com
Target: [Cloudflare Pages URL]
Proxy: Enabled (orange cloud)
```

### **5. Google OAuth Configuration**

#### **A. Update Authorized Origins**
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins**:
   ```
   https://dev.reasonfield.com
   https://dev.reasonfield-frontend.pages.dev
   ```

#### **B. Update Authorized Redirect URIs**
1. Add to **Authorized redirect URIs**:
   ```
   https://dev.reasonfield.com
   https://dev.reasonfield-frontend.pages.dev
   ```

### **6. CORS Configuration**

#### **A. Backend CORS Origins**
The development deployment script automatically configures:
```python
CORS_ORIGINS: "https://dev.reasonfield.com,https://dev.reasonfield-frontend.pages.dev"
```

#### **B. Frontend API Configuration**
The development build automatically uses:
```javascript
VITE_API_BASE_URL: https://dev-api.reasonfield.com
```

## 🚀 Deployment Workflow

### **Development Workflow:**
1. **Work on dev branch**: Make changes and commit
2. **Push to dev**: `git push origin dev`
3. **Auto-deploy**: GitHub Actions deploys to development URLs
4. **Test**: Visit `https://dev.reasonfield.com`
5. **Iterate**: Make more changes and repeat

### **Production Promotion:**
1. **Merge to main**: `git checkout main && git merge dev`
2. **Push to main**: `git push origin main`
3. **Auto-deploy**: GitHub Actions deploys to production URLs
4. **Production**: `https://app.reasonfield.com` is updated

## 📁 Files Created/Modified

### **New Files:**
- `.github/workflows/deploy-dev.yml` - Development deployment workflow
- `scripts/deploy-backend-dev.sh` - Development backend deployment
- `scripts/deploy-frontend-dev.sh` - Development frontend deployment
- `DEV_SETUP.md` - This setup guide

### **Modified Files:**
- `.github/workflows/deploy.yml` - Added environment variable

## 🔍 Verification Steps

### **After Setup, Verify:**

#### **1. Backend Health Check**
```bash
curl https://dev-api.reasonfield.com/health
# Should return: {"status": "healthy"}
```

#### **2. Frontend Accessibility**
```bash
curl https://dev.reasonfield.com
# Should return HTML content
```

#### **3. Google Authentication**
1. Visit `https://dev.reasonfield.com`
2. Click "Sign in with Google"
3. Should redirect and authenticate successfully

#### **4. API Communication**
1. Sign in to development environment
2. Upload a test file
3. Generate a report
4. Verify PDF download works

## ⚠️ Important Notes

### **1. Separate Resources**
- Development uses separate Cloud Run service
- Separate Cloudflare Pages project
- Independent scaling and monitoring
- No impact on production data

### **2. Cost Considerations**
- Development environment incurs additional costs
- Cloud Run service: ~$5-10/month when active
- Cloudflare Pages: Free tier should be sufficient

### **3. Data Isolation**
- Development and production use same Google Cloud Storage bucket
- Files are separated by user email
- Consider separate storage bucket for development if needed

### **4. Environment Variables**
- Same secrets used for both environments
- CORS and API URLs are environment-specific
- Google OAuth credentials work for both domains

## 🛠️ Troubleshooting

### **Common Issues:**

#### **1. CORS Errors**
- Verify CORS origins in backend deployment
- Check that frontend is using correct API URL
- Ensure DNS propagation is complete

#### **2. Authentication Failures**
- Verify Google OAuth credentials include dev domain
- Check browser console for redirect URI errors
- Ensure HTTPS is working correctly

#### **3. DNS Issues**
- Wait for DNS propagation (can take up to 24 hours)
- Verify Cloudflare proxy is enabled (orange cloud)
- Check DNS records in Cloudflare dashboard

#### **4. Deployment Failures**
- Check GitHub Actions logs
- Verify all required secrets are set
- Ensure Cloudflare API token has correct permissions

## 🎯 Benefits

### **1. Safe Development**
- Test changes without affecting production
- Experiment with new features safely
- Debug issues in isolated environment

### **2. Easy Promotion**
- Simple merge process to promote to production
- Automated deployment pipeline
- Consistent environment configuration

### **3. Parallel Development**
- Multiple developers can work simultaneously
- Feature branches can be tested independently
- Staging environment for client demos

### **4. Production Stability**
- Production remains stable during development
- No risk of breaking changes affecting users
- Easy rollback if issues arise 