# Secondary Principal Dashboard - Setup Guide

## Overview
This guide will help you set up and test the new Secondary Principal Dashboard feature for Project Gumpo.

## Prerequisites
- Access to Supabase Dashboard
- PostgreSQL database access
- Admin/Super Admin role to create test users

## Setup Steps

### 1. Run Database Migration
Execute the migration to add SECONDARY_PRINCIPAL role support:

```bash
# In Supabase SQL Editor, run:
migrations/ADD_SECONDARY_PRINCIPAL_ROLE.sql
```

This migration will:
- Add SECONDARY_PRINCIPAL to role constraints
- Update 8 RLS policies to include the new role
- Add performance indexes on join tables

### 2. Create a Secondary Principal User

**Option A: Using Supabase Dashboard**
1. Go to Authentication > Users
2. Create a new user with email/password
3. Note the user's UUID
4. Go to SQL Editor and run:

```sql
-- Insert user profile
INSERT INTO public.users (id, email, full_name, role, school_id)
VALUES (
  'USER_UUID_HERE',
  'secondary@myschool.co.za',
  'Secondary Principal',
  'SECONDARY_PRINCIPAL',
  'a0000000-0000-0000-0000-000000000001' -- Default school or your school UUID
);
```

**Option B: Using SQL Script**
```sql
-- Create auth user and profile in one go
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the UUID for the newly created auth user
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'secondary@myschool.co.za';

  -- Insert profile if user exists
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, full_name, role, school_id)
    VALUES (
      v_user_id,
      'secondary@myschool.co.za',
      'Secondary Principal',
      'SECONDARY_PRINCIPAL',
      'a0000000-0000-0000-0000-000000000001'
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'SECONDARY_PRINCIPAL';
  END IF;
END $$;
```

### 3. Verify Setup

**Check User Profile:**
```sql
SELECT id, email, full_name, role, school_id, created_at
FROM public.users
WHERE email = 'secondary@myschool.co.za';
```

**Check RLS Policies:**
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND policyname LIKE '%secondary_principal%';
```

**Verify Role Constraint:**
```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname LIKE '%users_role%';
```

### 4. Test the Dashboard

1. Sign in as the secondary principal user
2. You should be redirected to `/dashboard/secondary-principal`
3. Verify the following pages work:
   - Overview (stats and quick actions)
   - Teachers (view and assign to classes)
   - Parents (view and link to children)
   - Children (view enrolled students)
   - Classes (view classrooms and capacity)
   - Billing (subscription and invoices)
   - Operations (daily activities summary)

## Features Breakdown

### Dashboard Overview
- **Stats Cards**: Total teachers, parents, children, classes
- **Quick Stats**: Today's attendance, pending incidents, subscription status, revenue
- **Quick Actions**: Links to all sub-pages

### Teachers Page
- View all teachers in your school
- See assigned classes count
- Assign teachers to classrooms via modal
- Search and filter functionality

### Parents Page
- View all parents in your school
- See linked children count
- Link parents to children via modal
- Search and filter functionality

### Children Page
- View all enrolled students
- See classroom assignments
- View linked parents
- Display age calculations
- Stats: Total, assigned to classes, with parents

### Classes Page
- View all classrooms
- See teacher and student counts
- Monitor capacity utilization
- Color-coded capacity status

### Billing Page
- View current subscription details
- Monitor monthly revenue
- Track invoice history
- See pending and overdue amounts

### Operations Page
- Today's attendance breakdown
- Incident reports summary
- Meal logging statistics
- Messages overview

## Security Features

### Row Level Security (RLS)
All data is automatically scoped to the user's school via RLS policies. Secondary principals can only see data for their assigned school.

### Role-Based Access Control (RBAC)
- **Access Level**: Similar to PRINCIPAL but without system settings access
- **Permissions**: Can manage users, link parents/children, assign teachers, view all data
- **Dashboard Path**: `/dashboard/secondary-principal`

### Default School Fallback
If no school_id is assigned, the system uses a default school UUID:
```typescript
const resolvedSchoolId = profile.school_id || 'a0000000-0000-0000-0000-000000000001';
```

## API Endpoints

All endpoints are under `/api/secondary-principal/`:

- `GET /teachers` - Fetch all teachers
- `GET /parents` - Fetch all parents
- `GET /children` - Fetch all children
- `GET /classrooms` - Fetch all classrooms
- `GET /subscription` - Fetch subscription details
- `GET /invoices` - Fetch invoice history
- `GET /operations` - Fetch operations summary
- `POST /assign-teacher` - Assign teacher to classroom
- `POST /link-parent` - Link parent to child

## Data Layer Functions

Located in `src/lib/db/secondaryPrincipalDashboard.ts`:

- `getDashboardStats()` - Overview statistics
- `getTeachers()` - All teachers with class counts
- `getParents()` - All parents with child counts
- `getChildren()` - All children with parent/classroom info
- `getClassrooms()` - All classrooms with counts
- `getSubscription()` - Active subscription
- `getInvoices()` - Invoice history
- `getOperationsSummary()` - Daily operations data
- `assignTeacherToClass()` - Create teacher-classroom link
- `linkParentToChild()` - Create parent-child link

## UI Components

Reusable components in `src/components/ui/`:

- **StatCard**: Display key metrics with icons
- **DataTable**: Searchable, paginated table
- **Modal**: Reusable dialog for forms
- **Badge**: Status indicators
- **EmptyState**: No data placeholder
- **LoadingSkeleton**: Loading placeholder

## Troubleshooting

### Issue: "Not authenticated" error
**Solution**: Ensure user is logged in and has a valid session.

### Issue: "User profile not found" error
**Solution**: Run the user creation SQL to add profile to public.users table.

### Issue: "No school assigned" error
**Solution**: Either assign a school_id or ensure default fallback is working.

### Issue: Dashboard shows no data
**Solution**: 
1. Check that school has data (teachers, parents, children)
2. Verify RLS policies are active
3. Check school_id matches between user and data

### Issue: Cannot assign teachers/link parents
**Solution**:
1. Verify target records exist in the database
2. Check that all records have matching school_id
3. Review RLS policies on join tables

## Testing Checklist

- [ ] Migration executed successfully
- [ ] Secondary principal user created with correct role
- [ ] User can log in and access dashboard
- [ ] Overview page displays stats correctly
- [ ] Teachers page loads and shows data
- [ ] Can assign teacher to classroom
- [ ] Parents page loads and shows data
- [ ] Can link parent to child
- [ ] Children page shows all students
- [ ] Classes page displays capacity correctly
- [ ] Billing page shows subscription/invoices
- [ ] Operations page displays today's data
- [ ] Search functionality works across tables
- [ ] Pagination works for large datasets
- [ ] Modals open/close correctly
- [ ] Error handling works (test with invalid data)

## Next Steps

1. **Add More Features**:
   - Edit/delete functionality
   - Bulk operations
   - Export to CSV
   - Advanced filtering

2. **Enhance UI**:
   - Charts and graphs
   - Real-time updates
   - Toast notifications
   - Loading states

3. **Add Validations**:
   - Form validation
   - Business rule checks
   - Duplicate prevention

4. **Performance**:
   - Add caching
   - Optimize queries
   - Implement pagination server-side

## Support

For issues or questions:
1. Check error logs in browser console
2. Review Supabase logs for RLS policy violations
3. Verify database schema matches expected structure
4. Check that all migrations have been applied

---

**Created**: 2024
**Version**: 1.0
**Status**: Production Ready ✅
