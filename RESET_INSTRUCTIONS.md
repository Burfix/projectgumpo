# Database Reset Instructions

## 🚀 Complete Database Reset

The migration file `COMPLETE_RESET.sql` is ready to reset your entire database with the correct schema.

### Run the Migration:

1. **Go to Supabase SQL Editor:**
   - Visit: https://mjlkzvfdsafafkmwfbbj.supabase.co/project/mjlkzvfdsafafkmwfbbj/sql/new

2. **Copy the SQL:**
   - Open: `migrations/COMPLETE_RESET.sql`
   - Copy the entire contents (Cmd+A, Cmd+C)

3. **Paste and Run:**
   - Paste into the SQL Editor
   - Click "Run" or press Cmd+Enter
   - Wait for completion (should take 5-10 seconds)

4. **Verify:**
   - Check the response shows: "Database reset complete!"
   - Go to Table Editor to see all tables recreated

### What This Migration Does:

✅ Drops all existing custom tables (keeps auth tables)
✅ Recreates 16 tables with complete schema:
   - schools, users, invites, subscriptions, invoices
   - classrooms, children, teacher_classroom, parent_child
   - attendance_logs, meal_logs, nap_logs
   - incident_reports (with reviewed_at, reviewed_by fields)
   - daily_activities, messages, audit_logs

✅ All foreign keys use correct UUID types
✅ All indexes created for performance
✅ All RLS policies applied
✅ All tables secured with row-level security

### After Migration:

The site should work seamlessly with all dashboards functioning properly:
- Teacher Dashboard ✓
- Parent Dashboard ✓
- Admin/Principal Dashboard ✓

Note: All existing data will be deleted. Make sure you have backups if needed.
