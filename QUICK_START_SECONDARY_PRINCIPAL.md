# 🚀 Quick Start: Secondary Principal Dashboard

## One-Minute Setup

### Step 1: Run Migration (30 seconds)
1. Open Supabase Dashboard → SQL Editor
2. Paste and run:
```sql
-- From migrations/ADD_SECONDARY_PRINCIPAL_ROLE.sql
-- (Run entire file contents)
```

### Step 2: Create Test User (30 seconds)
1. Supabase Dashboard → Authentication → Users
2. Click "Add User" → Manual
3. Email: `secondary@test.com`
4. Password: `Test@123456`
5. Click "Create User"

### Step 3: Add User Profile (30 seconds)
1. Copy the UUID from the created user
2. In SQL Editor, run:
```sql
INSERT INTO public.users (id, email, full_name, role, school_id)
VALUES (
  'PASTE_UUID_HERE',
  'secondary@test.com',
  'Test Secondary Principal',
  'SECONDARY_PRINCIPAL',
  'a0000000-0000-0000-0000-000000000001'
);
```

### Step 4: Test Dashboard
1. Go to your app: `http://localhost:3000`
2. Sign in with: `secondary@test.com` / `Test@123456`
3. Should redirect to `/dashboard/secondary-principal`
4. Explore all 7 pages!

## 📋 Pages to Test

1. **Overview** - See stats and quick actions
2. **Teachers** - View and assign teachers
3. **Parents** - View and link parents
4. **Children** - View all students
5. **Classes** - Monitor classroom capacity
6. **Billing** - Check subscription/invoices
7. **Operations** - Daily activities summary

## ⚠️ Troubleshooting

### "User profile not found"
Run Step 3 again with correct UUID

### "No data showing"
Run `migrations/SEED_DATA.sql` to populate test data

### "Permission denied"
Check that role is exactly `SECONDARY_PRINCIPAL` (case-sensitive)

### "Not authenticated"
Clear browser cache and sign in again

## 🎯 Quick Test Checklist

- [ ] Migration ran successfully
- [ ] User created in auth.users
- [ ] Profile added to public.users
- [ ] Can sign in
- [ ] Redirects to correct dashboard
- [ ] All 7 pages load
- [ ] Can assign teacher (if test data exists)
- [ ] Can link parent (if test data exists)

## 📱 Expected Behavior

**Sign In** → **Auto Redirect** → **Dashboard Overview**
↓
7 Pages Available:
- Overview (stats cards + quick actions)
- Teachers (table + assign modal)
- Parents (table + link modal)
- Children (table with relationships)
- Classes (capacity monitoring)
- Billing (subscription + invoices)
- Operations (daily activities)

## 🔗 Next Steps

Once basic testing works:

1. **Add Real Data**
   - Create actual teachers, parents, children
   - Set up classrooms
   - Add subscription details

2. **Test Features**
   - Assign teachers to classes
   - Link parents to children
   - Monitor operations data

3. **Customize**
   - Update school details
   - Configure billing
   - Set capacity limits

## 💡 Pro Tips

- Use browser dev tools to check for errors
- Check Supabase logs for RLS issues
- Test with multiple schools to verify isolation
- Try search and pagination with large datasets

---

**Need Help?** See `SECONDARY_PRINCIPAL_SETUP.md` for detailed troubleshooting
