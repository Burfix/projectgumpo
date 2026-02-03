# System Onboarding Team Guide

## Overview

The **System Onboarding Team** (SUPER_ADMIN users) handles all user invitations across all schools. This reduces the workload on individual schools and ensures consistent onboarding processes.

## Responsibilities

The System Onboarding Team is responsible for:

1. ✅ **Inviting all users** - Teachers, Parents, Admins
2. ✅ **Allocating Principals** - Promote admins to principal roles
3. ✅ **Bulk uploading** - Handle CSV imports for multiple users
4. ✅ **Managing access** - Reset access, revoke invites
5. ✅ **Audit logging** - All actions are tracked automatically

## Onboarding Workflow

### Step 1: Invite All School Users

**Location:** `/dashboard/super-admin/users`

#### Option A: Single Invite
- Email address
- Select role (ADMIN, TEACHER, PARENT)
- Click "Send Invite"

#### Option B: Bulk Invite (Recommended)
- Prepare CSV file with columns: `email,role,name,school`
- Upload file or paste CSV data
- Review preview
- Click "Send X Invites"

**CSV Example:**
```csv
email,role,name,school
john.doe@sunshine.co.za,ADMIN,John Doe,Sunshine Preschool
jane.smith@sunshine.co.za,TEACHER,Jane Smith,Sunshine Preschool
parent1@gmail.com,PARENT,Sarah Johnson,Sunshine Preschool
parent2@gmail.com,PARENT,Michael Brown,Sunshine Preschool
```

**What happens:**
- Each user receives an email invitation
- They create their own password
- They're automatically routed to their dashboard (ADMIN → admin dashboard, TEACHER → teacher dashboard, PARENT → parent dashboard)

### Step 2: Link Parents to Children

**Location:** `/dashboard/super-admin/impersonate/[schoolId]/link-parent-to-child`

1. Select a school to impersonate
2. Click "Link Parent to Child"
3. Choose parent & child
4. Select relationship type (Parent, Guardian, Emergency Contact)
5. Click "Create Link"

**Result:** Parent can now see their child's updates

### Step 3: Assign Teachers to Classrooms

**Location:** `/dashboard/super-admin/impersonate/[schoolId]/assign-teacher-to-class`

1. Select a school to impersonate
2. Click "Assign Teacher to Class"
3. Choose teacher
4. Select classroom
5. Click "Assign"

**Result:** Teacher can now log activities for that classroom

### Step 4: Allocate Principal Role

**Location:** `/dashboard/super-admin/impersonate/[schoolId]/manage-users`

1. Select school to impersonate
2. Find ADMIN user in the list
3. Click "Make Principal"
4. Confirm

**Result:** User role changes from ADMIN → PRINCIPAL, gets principal dashboard access

## Key Features

### Bulk Invite Benefits
- ⚡ Invite 50+ users in seconds
- 📊 CSV upload or paste directly
- 👀 Preview before sending
- ✅ Success/failure tracking
- 📝 Name and school tracking

### Audit Logging
Every action is automatically tracked:
- ✓ Principal allocations
- ✓ Parent-child links
- ✓ Teacher-classroom assignments
- ✓ User invitations
- ✓ Timestamp & actor (who did it)

View audit logs: `/dashboard/super-admin` → Recent Activity (auto-refreshes every 10 seconds)

## Role Hierarchy

```
SUPER_ADMIN (System Team)
    ↓
    Can invite & manage: ADMIN, TEACHER, PARENT, PRINCIPAL
    ↓
ADMIN (School Administrator)
    ↓
    Can manage: TEACHER, PARENT within their school
    ↓
PRINCIPAL (School Principal)
    ↓
    Can manage: TEACHER, PARENT within their school
    ↓
TEACHER (Classroom Teacher)
    ↓
    Can manage: Activity logs for their classroom
    ↓
PARENT (Guardian)
    ↓
    Can view: Child's updates only
```

## Common Workflows

### Onboarding a New School

**Time: ~5 minutes**

1. **Invite ADMIN user(s)**
   ```
   Example: principal@newschool.co.za → Role: ADMIN
   ```
   Admin receives email → Creates password → Lands on admin dashboard

2. **Invite all TEACHERS & PARENTS**
   - Use bulk invite with CSV
   - Include all teachers & parents in one upload
   - Teachers get teacher dashboard
   - Parents get parent dashboard

3. **Link parents to children**
   - Go to school impersonate page
   - Click "Link Parent to Child"
   - Select each parent-child pair
   - Parents can now see updates

4. **Assign teachers to classrooms**
   - Click "Assign Teacher to Class"
   - Assign each teacher to their classroom
   - Teachers can now log activities

5. **Optional: Allocate Principal**
   - If ADMIN should be PRINCIPAL
   - Click "Make Principal" on admin user
   - Principal gains admin dashboard access

### Adding New Teacher Mid-Year

**Time: ~2 minutes**

1. Go to `/dashboard/super-admin/users`
2. Paste teacher email, select role "TEACHER"
3. Send invite
4. Go to school impersonate → Assign Teacher to Class
5. Done!

### Promoting Admin to Principal

**Time: ~30 seconds**

1. Go to `/dashboard/super-admin/impersonate/[schoolId]/manage-users`
2. Find admin user
3. Click "Make Principal"
4. User now has principal access

## Best Practices

✅ **DO:**
- Use bulk invite for onboarding (50+ users at once)
- Include school name in CSV for tracking
- Send a welcome message alongside invites
- Check audit logs regularly
- Use consistent email formats

❌ **DON'T:**
- Manually create users in database (use invites instead)
- Share SUPER_ADMIN passwords
- Create duplicate accounts
- Skip the parent-child linking step

## Support Resources

- **Invite Help:** `/invite-team` - Public guide explaining invites to schools
- **Audit Logs:** `/dashboard/super-admin` - Live recent activity
- **Documentation:** This guide

## API Endpoints

For custom integrations:

**Single Invite:**
```bash
POST /api/admin/invite
{
  "email": "user@school.com",
  "role": "TEACHER",
  "name": "John Smith"
}
```

**Audit Logs:**
```bash
GET /api/super-admin/audit-logs?limit=20
```

## Troubleshooting

**"Maximum 3 invites allowed for this email"**
- User has already been invited 3 times
- They should accept one of the previous invites
- Or reset their password instead

**Parent not seeing child**
- Check parent-child link exists
- Go to `/dashboard/super-admin/impersonate/[schoolId]/link-parent-to-child`
- Verify relationship is created

**Teacher can't log activities**
- Check teacher-classroom assignment
- Go to `/dashboard/super-admin/impersonate/[schoolId]/assign-teacher-to-class`
- Verify assignment exists

**"User role not found"**
- Valid roles: ADMIN, TEACHER, PARENT, PRINCIPAL, SUPER_ADMIN
- Check CSV role spelling (case-sensitive)
