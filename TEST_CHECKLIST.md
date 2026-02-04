# Admin Dashboard Test Checklist

## ⚠️ CRITICAL: You must run AUTO_FIX_ALL_USERS.sql first!

**The dashboard WILL NOT work until you create your user profile.**

---

## Step 1: Create Your User Profile (REQUIRED)

1. **Go to Supabase SQL Editor:**
   https://supabase.com/dashboard/project/mjlkzvfdsafafkmwfbbj/sql/new

2. **Copy the entire content of:**
   `migrations/AUTO_FIX_ALL_USERS.sql`

3. **Paste and Run in SQL Editor**

4. **Verify:** You should see output showing your email and role

---

## Step 2: Test Admin Dashboard

**URL:** https://www.projectgumpo.space/dashboard/admin

### Expected Behaviors:

✅ **IF AUTO_FIX_ALL_USERS.sql was run:**
- Dashboard loads successfully
- Shows "Principal Dashboard" header
- Displays stats: 0 children, 0 teachers, etc. (empty state)
- Shows "No classrooms found" message

❌ **IF AUTO_FIX_ALL_USERS.sql was NOT run:**
- Error page appears
- Shows helpful message: "User profile not found. Please ensure your account is properly set up in the users table."
- Shows setup instructions

---

## Step 3: Load Sample Data (Optional)

To see the dashboard with actual data:

1. **Go to Supabase SQL Editor**

2. **Copy and paste:** `migrations/SEED_DATA.sql`

3. **Edit the UUIDs** (lines 17, 28, 39) with your actual auth user IDs

4. **Run the script**

5. **Refresh dashboard** - should now show:
   - 5 children
   - 1 teacher
   - 3 classrooms
   - Attendance stats
   - Recent incidents

---

## Current Status:

- ✅ Code deployed to Vercel
- ✅ Error handling improved
- ✅ Database schema complete
- ⏳ **WAITING:** User profile needs to be created
- ⏳ **WAITING:** User to test dashboard

---

## Troubleshooting:

**If you see "No school assigned to your account":**
- Run AUTO_FIX_ALL_USERS.sql again
- It creates both school AND user profile

**If you see "Database tables not found":**
- Run COMPLETE_RESET.sql first
- Then run AUTO_FIX_ALL_USERS.sql

**If dashboard is still loading/blank:**
- Clear browser cache
- Try incognito window
- Check browser console for errors (F12)
