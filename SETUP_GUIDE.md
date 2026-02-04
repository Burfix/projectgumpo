# 🚀 Complete Database Setup Guide

## Step 1: Reset Database (REQUIRED)

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/mjlkzvfdsafafkmwfbbj/sql/new

2. **Run COMPLETE_RESET.sql:**
   - Open `migrations/COMPLETE_RESET.sql` in your code editor
   - Copy ALL content (Cmd+A, Cmd+C)
   - Paste into Supabase SQL Editor
   - Click **"Run"** (or Cmd+Enter)
   - Wait for: "Database reset complete!" message

   ✅ **Result:** All 16 tables created with proper schema and RLS policies

---

## Step 2: Create Test Users (REQUIRED)

Create these users in **Supabase Authentication** dashboard:

### A. Principal User
1. Go to: https://supabase.com/dashboard/project/mjlkzvfdsafafkmwfbbj/auth/users
2. Click "Add User" → "Create new user"
3. Email: `principal@sunrisedaycare.co.za`
4. Password: (choose a password)
5. **Copy the User ID** that appears after creation

### B. Teacher User
- Email: `teacher@sunrisedaycare.co.za`
- Password: (choose a password)
- **Copy the User ID**

### C. Parent User
- Email: `parent@example.com`
- Password: (choose a password)
- **Copy the User ID**

---

## Step 3: Update Seed Data with Real User IDs

1. **Open:** `migrations/SEED_DATA.sql`

2. **Replace the placeholder UUIDs** with your actual auth user IDs:
   ```sql
   -- Line 17: Replace with Principal's UUID
   '00000000-0000-0000-0000-000000000001'::uuid  → 'your-actual-principal-uuid'
   
   -- Line 28: Replace with Teacher's UUID
   '00000000-0000-0000-0000-000000000002'::uuid  → 'your-actual-teacher-uuid'
   
   -- Line 39: Replace with Parent's UUID
   '00000000-0000-0000-0000-000000000003'::uuid  → 'your-actual-parent-uuid'
   ```

3. **Save the file**

---

## Step 4: Load Seed Data

1. **Open Supabase SQL Editor** (same as Step 1)
2. **Copy** all content from `migrations/SEED_DATA.sql`
3. **Paste** into SQL Editor
4. Click **"Run"**
5. Wait for success message with counts

   ✅ **Result:** Test school, users, classrooms, and children created

---

## Step 5: Test the Dashboards

Login with the test accounts:

### 👨‍💼 Principal Dashboard
- URL: https://www.projectgumpo.space/dashboard/admin
- Login: `principal@sunrisedaycare.co.za`
- Should see: 5 children, 1 teacher, attendance stats, classrooms

### 👩‍🏫 Teacher Dashboard
- URL: https://www.projectgumpo.space/dashboard/teacher
- Login: `teacher@sunrisedaycare.co.za`
- Should see: Sunflower Room, 3 children with attendance

### 👨‍👩‍👧 Parent Dashboard
- URL: https://www.projectgumpo.space/dashboard/parent
- Login: `parent@example.com`
- Should see: Emma Smith, today's attendance, meals, nap

---

## 🎯 What You Get

After completing these steps:

✅ **Complete Database Schema**
- 16 tables with proper relationships
- UUID foreign keys throughout
- Performance indexes
- RLS policies for security

✅ **Sample Data**
- 1 test school (Sunrise Daycare)
- 3 users (Principal, Teacher, Parent)
- 3 classrooms
- 5 children
- Today's attendance, meals, naps, incidents

✅ **Working Dashboards**
- All three role-based dashboards functional
- Live data from database
- Proper role-based access control

---

## 🐛 Troubleshooting

**If dashboards show "No data":**
1. Check you ran SEED_DATA.sql with correct user IDs
2. Verify users exist in Supabase Auth
3. Check RLS policies are enabled (they are in COMPLETE_RESET.sql)

**If you get authentication errors:**
1. Make sure you created the auth users first
2. Verify the UUIDs in SEED_DATA.sql match auth user IDs
3. Try logging out and back in

**Need to start over?**
Just re-run COMPLETE_RESET.sql - it will drop everything and recreate from scratch.

---

## 📝 Next Steps After Setup

1. **Create your real school** via Super Admin dashboard
2. **Invite real teachers** using invite system
3. **Add real children** via Admin dashboard
4. **Link parents to children** via Admin dashboard
5. **Start using the system!**
