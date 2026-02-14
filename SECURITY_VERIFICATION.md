# Security Actions Verification Guide

## ✅ Verification Checklist

Run these tests to confirm all security actions were completed correctly.

---

## 1. ✅ Git History Cleaned - PASSED

**Test Commands:**
```bash
# Test 1: Search for .env.local in commit history
git log --all --pretty=format: --name-only | grep -E "^\.env\.local$"

# Expected: No output (file not found in history)
# Status: ✅ PASSED - No .env.local found in git history

# Test 2: Search for sensitive strings in all commits
git log --all -p | grep -i "SUPABASE_SERVICE_ROLE_KEY" | head -5

# Expected: No output or only references in .env.example
# Status: ⚠️  REQUIRES MANUAL CHECK

# Test 3: Verify force push completed
git log --oneline -5

# Expected: Recent commits should not contain .env.local changes
# Status: ✅ PASSED - Clean commit history confirmed
```

**✅ Result:** Git history has been cleaned - `.env.local` successfully removed from all commits.

---

## 2. 🔐 Rotate Supabase Keys

### Test: Verify Old Key is Invalidated

**Step 1: Check if old key works (should FAIL)**
```bash
# Test with old service role key from .env.local
curl --request GET \
  --url 'https://YOUR_PROJECT.supabase.co/rest/v1/schools?select=*&limit=1' \
  --header 'apikey: OLD_SERVICE_ROLE_KEY_HERE' \
  --header 'Authorization: Bearer OLD_SERVICE_ROLE_KEY_HERE'

# Expected: 401 Unauthorized or Invalid API key error
# If you get data back, the key is STILL VALID and needs rotation!
```

**Step 2: Test new key works (should SUCCEED)**
```bash
# Get new key from Supabase Dashboard → Settings → API
# Test in .env.local:

# Run this in your terminal:
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
supabase.from('schools').select('count').then(({ data, error }) => {
  if (error) console.error('❌ Key invalid:', error.message);
  else console.log('✅ New key working!');
});
"
```

**Step 3: Update Vercel Environment Variables**
```bash
# Go to: https://vercel.com/YOUR_PROJECT/settings/environment-variables
# Update: SUPABASE_SERVICE_ROLE_KEY with new value
# Redeploy: vercel --prod
```

**Manual Steps:**
1. Go to [Supabase Dashboard](https://app.supabase.com) → Your Project
2. Settings → API → Service Role Key
3. Click "Generate new key" or "Rotate key"
4. Copy new key
5. Update `.env.local` locally
6. Update Vercel environment variables
7. Redeploy application

---

## 3. 🧪 Test Application Functionality

### Local Environment Test
```bash
# 1. Ensure .env.local has new keys
cat .env.local | grep -E "SUPABASE_(URL|ANON_KEY|SERVICE_ROLE_KEY)" | sed 's/=.*/=***HIDDEN***/'

# 2. Build application
npm run build

# Expected: Build succeeds with no errors
# Status: ⚠️  RUN THIS TEST

# 3. Run tests
npm run test

# Expected: All tests pass
# Status: ⚠️  RUN THIS TEST

# 4. Start development server
npm run dev

# Expected: App starts on http://localhost:3000
# Test login functionality
```

### Production Environment Test
```bash
# After deploying with new keys:

# 1. Test authentication
curl https://projectgumpo.space/api/auth/session \
  -H "Cookie: your-session-cookie"

# 2. Test database connection
# Try logging into your production site
# Create/view/edit a record

# Expected: All operations work normally
```

---

## 4. 📦 Commit Week 1 Changes

**Commands:**
```bash
# 1. Review staged changes
git status

# 2. Commit all Week 1 work
git commit -m "Week 1: Security hardening, migration consolidation, error handling

- Security: Removed .env.local from git, created .env.example template
- Migrations: Consolidated 37 files to 000-013, archived debug files
- Client: Fixed Supabase singleton pattern to SSR-compatible
- Errors: Created comprehensive error handling system with Sentry
- Tests: Added school isolation and error handling test suites

BREAKING: Requires manual key rotation and Sentry DSN configuration
See: SECURITY_INCIDENT_LOG.md, WEEK1_COMPLETE.md"

# 3. Push to remote
git push origin master

# 4. Verify push succeeded
git log origin/master --oneline -1
```

---

## 5. 🔍 Post-Deployment Verification

### Critical Checks (Run After Deployment)

```bash
# 1. Test Production Authentication
# Visit: https://projectgumpo.space
# Try to login with your credentials
# Expected: Login succeeds

# 2. Test Database Queries
# Create a test record (e.g., new classroom)
# Expected: Record saves successfully

# 3. Check Sentry Error Tracking
# Visit: https://sentry.io/YOUR_PROJECT
# Trigger a test error in your app
# Expected: Error appears in Sentry dashboard

# 4. Verify School Isolation
# Login as different school users
# Try to access other school's data
# Expected: Access denied (403/404 errors)

# 5. Check Migration Status
# Go to Supabase Dashboard → Database → Migrations
# Run: SELECT * FROM supabase_migrations.schema_migrations;
# Expected: Migrations 000-013 applied successfully
```

---

## 6. 🚨 Rollback Plan (If Something Breaks)

### Emergency Rollback Steps:

```bash
# 1. Restore old Supabase key temporarily
# Update Vercel env vars with old key (if you saved it)

# 2. Revert git commits
git revert HEAD

# 3. Force push
git push origin master --force

# 4. Redeploy
vercel --prod

# 5. Investigate issue
# Check logs: vercel logs YOUR_PROJECT --prod
# Check Sentry: https://sentry.io/YOUR_PROJECT
```

---

## 📋 Final Verification Checklist

- [ ] `.env.local` removed from git history (test command returned empty)
- [ ] Old Supabase key invalidated (API test returns 401)
- [ ] New Supabase key works locally (`npm run dev` succeeds)
- [ ] Vercel environment variables updated with new key
- [ ] Application builds successfully (`npm run build`)
- [ ] Tests pass (`npm run test`)
- [ ] Production site loads and authentication works
- [ ] Database queries work in production
- [ ] Sentry DSN configured and receiving errors
- [ ] Week 1 changes committed and pushed
- [ ] Documentation updated (this file completed)

---

## 🎯 Success Criteria

**You can consider security hardening complete when:**

1. ✅ Old secrets are completely inaccessible (keys rotated, history cleaned)
2. ✅ Application works normally with new secrets (local + production)
3. ✅ Git repository contains no sensitive data in history
4. ✅ All Week 1 code changes are committed and deployed
5. ✅ Error monitoring is active (Sentry receiving events)
6. ✅ Tests pass (especially school isolation tests)

---

## 📞 If Issues Arise

**Problem:** Old key still appears in git history
- **Solution:** Run BFG Repo Cleaner again: `bfg --delete-files .env.local --no-blob-protection .git`

**Problem:** Application breaks after key rotation
- **Solution:** Double-check Vercel environment variables match `.env.local`

**Problem:** Tests fail
- **Solution:** Ensure test database has correct schema (run migrations 000-013)

**Problem:** Sentry not receiving errors
- **Solution:** Verify SENTRY_DSN in Vercel environment variables

**Problem:** Production deployment fails
- **Solution:** Check Vercel logs: `vercel logs --prod | tail -50`

---

**Last Updated:** February 15, 2026  
**Status:** Git history cleaned ✅ | Keys need rotation ⚠️ | Commit pending ⚠️
