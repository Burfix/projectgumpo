#!/bin/bash

# Production Deployment Script
# This script helps deploy to Vercel with all necessary checks

set -e  # Exit on error

echo "🚀 Project Goose - Production Deployment"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Pre-deployment checks
echo "📋 Running pre-deployment checks..."
echo ""

# 1. Check Node version
echo -n "Checking Node.js version... "
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${GREEN}✓${NC} Node.js $(node -v)"
else
    echo -e "${RED}✗${NC} Node.js version must be 18 or higher"
    exit 1
fi

# 2. Check for .env.local
echo -n "Checking environment variables... "
if [ -f .env.local ]; then
    echo -e "${GREEN}✓${NC} .env.local exists"
else
    echo -e "${YELLOW}⚠${NC} .env.local not found (okay if using Vercel env vars)"
fi

# 3. Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# 4. Run linter
echo ""
echo "🔍 Running linter..."
npm run lint || echo -e "${YELLOW}⚠${NC} Linting issues found (continuing anyway)"

# 5. Run tests
echo ""
echo "🧪 Running tests..."
npm test run || echo -e "${YELLOW}⚠${NC} Some tests failed (continuing anyway)"

# 6. Build check
echo ""
echo "🔨 Testing production build..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Build successful!"
else
    echo -e "${RED}✗${NC} Build failed. Fix errors before deploying."
    exit 1
fi

# 7. Check Vercel CLI
echo ""
echo -n "Checking Vercel CLI... "
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Vercel CLI not found"
    echo "Install with: npm i -g vercel"
    echo "Then run: vercel login"
    exit 1
else
    echo -e "${GREEN}✓${NC} Vercel CLI installed"
fi

# 8. Deployment confirmation
echo ""
echo "=========================================="
echo "🎯 Ready to deploy to production!"
echo "=========================================="
echo ""
echo "Before deploying, make sure you've:"
echo "  ✓ Set environment variables in Vercel Dashboard"
echo "  ✓ Run database migrations"
echo "  ✓ Created Supabase Storage bucket: 'photos'"
echo "  ✓ Tested PWA installation"
echo ""
read -p "Continue with deployment? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Deploying to production..."
    vercel --prod
    
    echo ""
    echo -e "${GREEN}✓${NC} Deployment complete!"
    echo ""
    echo "📊 Next steps:"
    echo "  1. Visit: https://projectgumpo.space"
    echo "  2. Test PWA installation"
    echo "  3. Check Vercel logs: vercel logs projectgumpo.space --follow"
    echo "  4. Monitor Sentry for errors"
    echo "  5. Check Vercel Analytics dashboard"
    echo ""
else
    echo ""
    echo "Deployment cancelled."
    exit 0
fi
