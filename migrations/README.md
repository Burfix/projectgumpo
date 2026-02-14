# Database Migrations

This folder contains all database schema migrations for Project Gumpo.

## ⚠️ IMPORTANT: Migration Order

Migrations must be run in the following order:

### Core Schema (Run First)
1. `000_cleanup_policies.sql` - Clean up existing policies
2. `001_create_invites_table.sql` - Invites table
3. `002_create_schools_billing_tables.sql` - Schools and billing setup
4. `003_add_school_type.sql` - School type field
5. `004_school_city_type.sql` - City and school type constraints
6. `005_add_principal_role_and_audit.sql` - Principal role and audit logs
7. `005_fix_users_rls_recursion.sql` - Fix RLS recursion issues
8. `006_principal_read_policies.sql` - Principal read permissions
9. `008_complete_schema.sql` - Complete database schema (MAIN SCHEMA)
10. `009_rls_policies.sql` - Row Level Security policies (RUN AFTER 008)
11. `010_add_notifications.sql` - Notifications table
12. `011_fix_school_type_constraint.sql` - Fix school type constraint
13. `012_schools_with_stats_rpc.sql` - RPC for school statistics
14. `013_create_children_table.sql` - Children table enhancements

### ⚠️ DO NOT RUN - Debug/Fix Files (Archive Only)
These files were used during development for hotfixes and should NOT be run:
- `AUTO_FIX_ALL_USERS.sql`
- `COMPLETE_RESET.sql`
- `CREATE_PROPER_USERS.sql`
- `CREATE_SECONDARY_PRINCIPAL_USER.sql`
- `DEBUG_*.sql`
- `FIX_*.sql`
- `NUCLEAR_RESET.sql`
- `QUICK_FIX_USER.sql`
- `SEED_DATA.sql`
- `STEP*.sql`
- `007_create_core_tables.sql` (superseded by 008)
- `007_create_core_tables_FIXED.sql` (superseded by 008)
- `007a_add_user_columns.sql` (superseded by 008)
- `007b_create_tables.sql` (superseded by 008)
- `007c_create_policies.sql` (superseded by 009)

## Migration Strategy

### For New Deployments
1. Run migrations 000-013 in order
2. Verify RLS policies are active
3. Create initial super admin user manually

### For Existing Deployments
- DO NOT re-run migrations that have already been applied
- Use Supabase migration history to track applied migrations
- Always test migrations in staging first

## Safety Checklist
- [ ] Backup database before running migrations
- [ ] Test in staging environment first
- [ ] Verify RLS policies after migration
- [ ] Check foreign key constraints
- [ ] Test multi-school data isolation

## Rollback Procedure
If a migration fails:
1. Restore from backup
2. Review migration SQL for errors
3. Fix issues in staging
4. Re-test before applying to production

## Moving to Production Migration System

### Recommended: Use Supabase CLI
```bash
# Initialize Supabase in project
supabase init

# Link to remote project
supabase link --project-ref your-project-ref

# Pull current schema
supabase db pull

# Create new migration
supabase migration new your_migration_name

# Apply migrations
supabase db push
```

### Alternative: Prisma Migrate
```bash
# Initialize Prisma
npx prisma init

# Pull current schema
npx prisma db pull

# Generate migration
npx prisma migrate dev --name your_migration_name

# Apply to production
npx prisma migrate deploy
```

## Notes
- All times are UTC
- All IDs are UUIDs except `schools.id` (BIGSERIAL for legacy reasons)
- RLS is enabled on all tables
- Soft deletes used for children and schools (status field)
