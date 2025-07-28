#!/bin/bash

# Build script for Cloudflare Pages
# This script installs dependencies and builds the frontend

set -e  # Exit on any error

echo "🚀 Starting Cloudflare Pages build..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Build output: frontend/dist" 