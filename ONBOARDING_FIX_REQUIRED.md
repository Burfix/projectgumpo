# 🔧 Pilot School Onboarding - Fix Required

## ❌ Problem Identified

The pilot school onboarding is failing because the **SUPABASE_SERVICE_ROLE_KEY** in your `.env.local` file is incorrect.

### Current Value (WRONG):
```
SUPABASE_SERVICE_ROLE_KEY="sb_publishable_QyTDqNrReiRUBAOV0-72SQ_sp8Jus_F"
```

This value appears to be a publishable key, not a service role key.

### Expected Format:
Service role keys should look like this (starting with `eyJ`):
```
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## ✅ How to Fix

### Step 1: Get Your Service Role Key from Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **mjlkzvfdsafafkmwfbbj**
3. Click on **Settings** (gear icon on left sidebar)
4. Click on **API** in the settings menu
5. Scroll down to **Project API keys**
6. Find the **service_role** key (it will be hidden with dots)
7. Click **Reveal** and copy the entire key
8. It should be a long JWT token starting with `eyJ`

### Step 2: Update Your .env.local File

1. Open `/Users/Thami/Desktop/projectgumpo/.env.local`
2. Find the line:
   ```
   SUPABASE_SERVICE_ROLE_KEY="sb_publishable_QyTDqNrReiRUBAOV0-72SQ_sp8Jus_F"
   ```
3. Replace it with:
   ```
   SUPABASE_SERVICE_ROLE_KEY="eyJ... [paste your actual service role key here]"
   ```
4. Save the file

### Step 3: Restart the Dev Server

```bash
# Stop the current server (Ctrl+C in the terminal)
# Then restart:
npm run dev
```

### Step 4: Test the Onboarding

Once the server is running, test the onboarding either through:

**Option A: UI (Recommended)**
- Navigate to http://localhost:3000/onboarding/pilot-school
- Fill in the form and submit

**Option B: API Direct**
```bash
curl http://localhost:3000/api/onboarding/pilot-school \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "schoolName": "Test Academy",
    "schoolType": "daycare",
    "city": "Cape Town",
    "principalEmail": "admin@testacademy.com",
    "principalName": "Test Principal",
    "principalPhone": "+27123456789",
    "classrooms": [
      {
        "name": "Infant Room",
        "capacity": 10,
        "age_group": "1-2 years"
      }
    ],
    "teachers": [
      {
        "email": "teacher@testacademy.com",
        "name": "Test Teacher",
        "classroom_name": "Infant Room"
      }
    ],
    "skipSampleData": false
  }'
```

---

## 🔍 Why This Happens

The service role key is a **server-side only** credential that has full admin access to your Supabase database. It's used for:

- Creating user accounts via `auth.admin.createUser()`
- Bypassing Row Level Security (RLS) policies
- Performing admin operations

The onboarding API needs this key to:
1. Create the school
2. Create user accounts (principal, teachers, parents)
3. Link users to the school
4. Create classrooms, children, and all relationships

Without the correct service role key, the `auth.admin` methods will fail.

---

## ⚠️ Security Note

**NEVER** commit or expose your service role key:
- ✅ Keep it in `.env.local` (already in `.gitignore`)
- ✅ Use only in server-side code
- ❌ Never use in client-side code
- ❌ Never commit to Git
- ❌ Never share publicly

The service role key bypasses all security rules and should be treated like a database root password.

---

## 📝 Changes Made to Fix This

I've updated the codebase to properly use the service role key:

### File: `/src/lib/supabase/server.ts`
- Added `createAdminClient()` function that uses `SUPABASE_SERVICE_ROLE_KEY`
- This client bypasses RLS and has admin privileges

### File: `/src/app/api/onboarding/pilot-school/route.ts`
- Changed from `createClient()` to `createAdminClient()`
- This allows `auth.admin.createUser()` to work
- Added debug logging to help troubleshoot

---

## 🧪 Expected Success Response

When working correctly, you'll see a response like:

```json
{
  "success": true,
  "message": "Pilot school onboarding completed",
  "data": {
    "school": {
      "id": "uuid-here",
      "name": "Test Academy",
      "type": "daycare",
      "status": "active"
    },
    "principal": {
      "id": "uuid-here",
      "email": "admin@testacademy.com",
      "name": "Test Principal",
      "role": "PRINCIPAL",
      "temporaryPassword": "PilotSchool2026!"
    },
    "classrooms": [...],
    "teachers": [...],
    "sampleChildren": [...],
    "sampleParents": [...],
    "errors": []
  }
}
```

---

## 🆘 Still Having Issues?

If you continue to have problems after setting the correct service role key:

1. **Check the console logs** in the terminal where `npm run dev` is running
2. **Check the browser console** if using the UI
3. **Verify environment variables are loaded**:
   ```bash
   node -e "console.log(process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20))"
   ```
   Should output: `eyJhbGciOiJIUzI1NiIsI`

4. **Test Supabase connection**:
   ```bash
   curl https://mjlkzvfdsafafkmwfbbj.supabase.co/rest/v1/ \
     -H "apikey: YOUR_SERVICE_ROLE_KEY_HERE"
   ```

---

## 📚 Related Documentation

- [Supabase Service Role Key Docs](https://supabase.com/docs/guides/api/api-keys)
- [Supabase Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-createuser)
- [Performance & Onboarding Guide](PERFORMANCE_AND_ONBOARDING_COMPLETE.md)

---

**Once you've updated the service role key and restarted the server, the onboarding should work perfectly!** 🚀
