# 🗄️ Database Migration Guide

## Required Action: Apply Migration to Supabase

The `school_type` column needs to be added to the `schools` table for the new feature to work properly.

### SQL to Execute in Supabase

Copy and paste this SQL into your Supabase SQL Editor (Dashboard > SQL):

```sql
-- Add school_type column to schools table
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS school_type TEXT CHECK (school_type IN ('Preschool', 'Crèche', 'Primary', 'Other'));

-- Add an index on school_type for faster queries
CREATE INDEX IF NOT EXISTS schools_school_type_idx ON public.schools(school_type);

-- Update the comment
COMMENT ON COLUMN public.schools.school_type IS 'Type of school: Preschool, Crèche, Primary, or Other';
```

### Steps:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Paste the SQL above
6. Click **Run**
7. Confirm success message

### What This Does:

✅ Adds `school_type` column to `schools` table
✅ Sets up CHECK constraint (only valid values allowed)
✅ Creates index for faster lookups
✅ Adds documentation comment

### Verification:

After running, verify in Supabase:
1. Go to **Table Editor**
2. Click on **schools** table
3. Scroll right to see `school_type` column exists
4. Value should be NULL for existing schools

### If Already Exists:

If you get an error "column already exists", that's OK - the `IF NOT EXISTS` will skip it. This means the migration was already applied.

---

## Testing the Feature

### 1. Login to System Admin Dashboard
```
URL: https://www.projectgumpo.space/dashboard/super-admin
Email: Use your SUPER_ADMIN account
```

### 2. Create a Test School
- Click **+ Add School** button
- Fill in:
  - School Name: "Test Academy"
  - City: "Cape Town"
  - School Type: Select "Preschool"
- Click **Add School**

### 3. Verify Results
- ✅ School appears in list
- ✅ "Preschool" label shows below school name
- ✅ Total Schools counter increments to 1
- ✅ No page refresh needed

---

## Current System State

| Counter | Current Value | Source |
|---------|---------------|--------|
| Total Schools | 0 | COUNT(schools) |
| Active Users | 0 | COUNT(users WHERE school_id NOT NULL) |
| Children | 0 | SUM(children per school) |
| Parents | 0 | COUNT(users WHERE role='PARENT') |
| Teachers | 0 | COUNT(users WHERE role='TEACHER') |
| Admins | 0 | COUNT(users WHERE role='ADMIN') |

---

## Troubleshooting

### Issue: "school_type field not showing in Add School form"
**Solution**: Clear browser cache and refresh

### Issue: "School created but school_type not saved"
**Solution**: Run the SQL migration above - the column might not exist yet

### Issue: "API returns null for school_type"
**Solution**: Ensure migration is applied AND re-add schools after migration

---

## Rollback (if needed)

To remove the feature, run:

```sql
-- Remove the column (WARNING: This deletes all school_type data)
ALTER TABLE public.schools DROP COLUMN IF EXISTS school_type;

-- Remove the index
DROP INDEX IF EXISTS schools_school_type_idx;
```

⚠️ **Do not run this unless necessary** - it removes all school type data.

---

**Last Updated**: February 3, 2026
**Status**: Ready for Production
