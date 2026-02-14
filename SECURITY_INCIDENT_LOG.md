# Security Incident Log

## Incident #1 - Production Secrets Exposed in Git
**Date Discovered:** February 15, 2026  
**Severity:** CRITICAL  
**Status:** IN PROGRESS

### Description
Production Supabase service role key and Vercel OIDC token were committed to git repository in `.env.local` file.

### Affected Assets
- Supabase Service Role Key (full database access)
- Vercel OIDC Token (deployment access)
- Production database credentials

### Immediate Actions Taken
- [ ] Created .env.example template
- [ ] Documented incident in this log

### Required Actions
1. **IMMEDIATELY** rotate Supabase service role key:
   - Go to Supabase Dashboard → Settings → API
   - Generate new service role key
   - Update Vercel environment variables
   
2. **IMMEDIATELY** revoke Vercel OIDC token:
   - Token will auto-expire, but monitor for unauthorized access
   
3. Remove secrets from git history:
   ```bash
   # Option 1: BFG Repo Cleaner (recommended)
   brew install bfg  # macOS
   bfg --replace-text <(echo 'SUPABASE_SERVICE_ROLE_KEY=***REMOVED***') --no-blob-protection .
   bfg --replace-text <(echo 'VERCEL_OIDC_TOKEN=***REMOVED***') --no-blob-protection .
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   
   # Option 2: git filter-repo
   git filter-repo --path .env.local --invert-paths --force
   ```

4. Force push cleaned history:
   ```bash
   git push origin --force --all
   ```

5. Notify team members to re-clone repository

6. Audit Supabase logs for unauthorized access since exposure date

### Prevention Measures
- [x] Add .env.example with no secrets
- [ ] Set up pre-commit hooks to block .env files
- [ ] Add secret scanning to CI/CD
- [ ] Security training for team on secret management
- [ ] Regular security audits

### Timeline
- **Exposure Date:** Unknown (needs git log review)
- **Discovery Date:** February 15, 2026
- **Resolution Target:** February 16, 2026 EOD
