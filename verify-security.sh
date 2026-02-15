#!/bin/bash
# Security Actions Verification Script
# Run this to verify Week 1 security implementations

set -e

echo "🔐 Security Verification Tests"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check git history is clean
echo "Test 1: Checking git history for .env.local..."
if git log --all --pretty=format: --name-only | grep -q "^\.env\.local$"; then
    echo -e "${RED}❌ FAILED: .env.local still found in git history${NC}"
    echo "   Run: bfg --delete-files .env.local --no-blob-protection .git"
    exit 1
else
    echo -e "${GREEN}✅ PASSED: .env.local removed from git history${NC}"
fi
echo ""

# Test 2: Check .env.local exists locally
echo "Test 2: Checking .env.local exists locally..."
if [ -f .env.local ]; then
    echo -e "${GREEN}✅ PASSED: .env.local exists in working directory${NC}"
else
    echo -e "${RED}❌ FAILED: .env.local not found. Copy from .env.example${NC}"
    exit 1
fi
echo ""

# Test 3: Check .env.example exists
echo "Test 3: Checking .env.example template..."
if [ -f .env.example ]; then
    echo -e "${GREEN}✅ PASSED: .env.example template exists${NC}"
else
    echo -e "${RED}❌ FAILED: .env.example not found${NC}"
    exit 1
fi
echo ""

# Test 4: Check .gitignore includes .env.local
echo "Test 4: Checking .gitignore configuration..."
if grep -q "^\.env\.local$" .gitignore; then
    echo -e "${GREEN}✅ PASSED: .env.local in .gitignore${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: .env.local not explicitly in .gitignore${NC}"
fi
echo ""

# Test 5: Check Week 1 documentation exists
echo "Test 5: Checking Week 1 documentation..."
docs_ok=true
for doc in SECURITY_INCIDENT_LOG.md WEEK1_COMPLETE.md SECURITY_VERIFICATION.md; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✅ $doc exists${NC}"
    else
        echo -e "${RED}❌ $doc missing${NC}"
        docs_ok=false
    fi
done
[ "$docs_ok" = true ] || exit 1
echo ""

# Test 6: Check migration files organized
echo "Test 6: Checking migration organization..."
if [ -d migrations/archive ] && [ -f migrations/README.md ]; then
    echo -e "${GREEN}✅ PASSED: Migrations organized with archive folder${NC}"
    echo "   Production migrations: $(ls migrations/*.sql 2>/dev/null | wc -l | xargs)"
    echo "   Archived migrations: $(ls migrations/archive/*.sql 2>/dev/null | wc -l | xargs)"
else
    echo -e "${RED}❌ FAILED: Migration structure incomplete${NC}"
    exit 1
fi
echo ""

# Test 7: Check new code files exist
echo "Test 7: Checking Week 1 code implementations..."
files_ok=true
for file in src/lib/errors.ts src/lib/supabase/index.ts src/tests/integration/school-isolation.test.ts src/tests/lib/errors.test.ts; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $(basename $file) exists${NC}"
    else
        echo -e "${RED}❌ $(basename $file) missing${NC}"
        files_ok=false
    fi
done
[ "$files_ok" = true ] || exit 1
echo ""

# Test 8: Check build succeeds
echo "Test 8: Testing application build..."
if npm run build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✅ PASSED: Build succeeds${NC}"
else
    echo -e "${RED}❌ FAILED: Build failed. Check /tmp/build.log${NC}"
    tail -20 /tmp/build.log
    exit 1
fi
echo ""

# Test 9: Check if tests exist and can be found
echo "Test 9: Checking test configuration..."
if npm run test -- --help > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSED: Test runner configured${NC}"
    echo -e "${YELLOW}ℹ️  To run tests: npm run test${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: Test runner may not be configured${NC}"
fi
echo ""

# Summary
echo "=============================="
echo -e "${GREEN}✅ All automated checks passed!${NC}"
echo ""
echo "📋 Manual Steps Remaining:"
echo ""
echo "1. Rotate Supabase Keys:"
echo "   → Go to: https://app.supabase.com/project/_/settings/api"
echo "   → Generate new Service Role key"
echo "   → Update .env.local and Vercel environment variables"
echo ""
echo "2. Test Production Deployment:"
echo "   → Push code: git push origin master"
echo "   → Visit: https://projectgumpo.space"
echo "   → Test login and database operations"
echo ""
echo "3. Configure Sentry:"
echo "   → Add SENTRY_DSN to Vercel environment variables"
echo "   → Test error tracking"
echo ""
echo "4. Run Tests:"
echo "   → npm run test"
echo ""
echo "📖 See SECURITY_VERIFICATION.md for detailed testing guide"
echo ""
