# Project Gumpo: Role-Based Access Control (RBAC)

## Overview
Project Gumpo implements a hierarchical role-based access control system with four distinct roles. Each role has clearly defined responsibilities, permissions, and limitations.

---

## Role Hierarchy

```
SUPER_ADMIN (System Administrator)
    ↓
ADMIN (School Principal/Administrator)
    ↓
TEACHER (Educator)
    ↓
PARENT (Guardians/Parents)
```

---

## Detailed Role Definitions

### 1. SUPER_ADMIN (System Administrator)

**Responsibilities:**
- System-wide configuration and maintenance
- User account management (create, modify, delete)
- Role assignment and management
- System monitoring and auditing
- Database integrity verification
- Emergency access control

**Permissions:**
- ✅ View all users in the system
- ✅ Assign and modify user roles
- ✅ Create new user accounts
- ✅ Delete user accounts
- ✅ Access system logs and audit trails
- ✅ Configure system settings
- ✅ View all institutions/schools
- ✅ Override any permission
- ✅ Reset user passwords
- ✅ Enable/disable user accounts

**Limitations:**
- ❌ Cannot directly act as users (impersonation not allowed)
- ❌ Cannot modify their own role (prevents privilege escalation)
- ❌ Limited to administrative functions only
- ❌ Cannot access classroom content or student records directly

**Dashboard Access:** `/dashboard/super-admin`

**Key Features:**
- User management table with role assignment
- System status monitoring
- Audit logs viewer
- Bulk user operations

---

### 2. ADMIN (School Administrator/Principal)

**Responsibilities:**
- School/institution-level management
- Teacher and parent account management within their institution
- Class and curriculum oversight
- Parent-child relationship establishment
- Teacher-class assignments
- Institutional reporting and analytics

**Permissions:**
- ✅ View all teachers in their institution
- ✅ View all parents in their institution
- ✅ View all students in their institution
- ✅ Create new teacher accounts
- ✅ Create new parent accounts
- ✅ Create new student accounts
- ✅ Link parents to children
- ✅ Link teachers to classes
- ✅ View institutional reports and analytics
- ✅ Modify teacher information and assignments
- ✅ Modify parent information
- ✅ View communication logs
- ✅ Deactivate accounts (within institution)

**Limitations:**
- ❌ Cannot assign roles below ADMIN (role assignment restricted)
- ❌ Cannot view Super Admin operations
- ❌ Cannot access other institutions' data
- ❌ Cannot modify student grades or academic records directly
- ❌ Cannot view teacher private messages
- ❌ Cannot delete user accounts (only deactivate)
- ❌ Cannot access system-wide settings

**Dashboard Access:** `/dashboard/admin`

**Key Features:**
- Link parents ↔ children
- Link teachers ↔ classes
- Institutional user management
- Reports and analytics
- Class management interface
- Communication monitoring

---

### 3. TEACHER (Educator)

**Responsibilities:**
- Daily classroom management
- Student attendance and participation tracking
- Educational content delivery
- Student assessment and progress reporting
- Parent-teacher communication
- Class schedule management

**Permissions:**
- ✅ View assigned classes and students
- ✅ Create and manage daily logs
- ✅ Record student attendance
- ✅ Record student grades and assessments
- ✅ Post classroom announcements
- ✅ Communicate with parents of assigned students
- ✅ View student academic progress
- ✅ Upload classroom materials
- ✅ Create class assignments
- ✅ View their own profile and credentials
- ✅ View parent communications with their students

**Limitations:**
- ❌ Cannot view students outside their assigned classes
- ❌ Cannot view other teachers' classes
- ❌ Cannot create new accounts
- ❌ Cannot modify student personal information
- ❌ Cannot view parent contact information directly
- ❌ Cannot delete student records
- ❌ Cannot access other teachers' data
- ❌ Cannot modify their own role
- ❌ Cannot view institutional settings

**Dashboard Access:** `/dashboard/teacher`

**Key Features:**
- Daily logs and classroom view
- Attendance tracking
- Grade management
- Student progress reports
- Parent messaging
- Assignment creation

---

### 4. PARENT (Guardian/Parent)

**Responsibilities:**
- Monitor child's academic progress
- Communicate with teachers
- Receive school notifications
- Track attendance and behavior
- Participate in school communications

**Permissions:**
- ✅ View their child's academic progress
- ✅ View their child's attendance records
- ✅ View their child's grades and assessments
- ✅ View their child's daily reports
- ✅ Communicate with child's teachers
- ✅ View classroom announcements
- ✅ View their own profile information
- ✅ Receive school notifications
- ✅ View child's class schedule

**Limitations:**
- ❌ Cannot view other students' information
- ❌ Cannot create new accounts
- ❌ Cannot modify student information
- ❌ Cannot view other parents' data
- ❌ Cannot modify grades or records
- ❌ Cannot create announcements
- ❌ Cannot access institutional settings
- ❌ Cannot view teacher-only content
- ❌ Cannot modify their own child's assignments

**Dashboard Access:** `/dashboard/parent`

**Key Features:**
- Child's academic feed
- Progress tracking
- Teacher messages
- Attendance view
- Notifications center

---

## Permission Matrix

| Feature | SUPER_ADMIN | ADMIN | TEACHER | PARENT |
|---------|:---:|:---:|:---:|:---:|
| Manage All Users | ✅ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ❌ | ❌ | ❌ |
| View All Data | ✅ | ✅ | ⚠️* | ❌ |
| Create Accounts | ✅ | ✅ | ❌ | ❌ |
| Link Parents ↔ Children | ✅ | ✅ | ❌ | ❌ |
| Link Teachers ↔ Classes | ✅ | ✅ | ❌ | ❌ |
| Manage Classes | ✅ | ✅ | ⚠️** | ❌ |
| View Grades | ✅ | ✅ | ✅ | ⚠️*** |
| Modify Grades | ✅ | ❌ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ⚠️**** | ⚠️*** |
| System Settings | ✅ | ❌ | ❌ | ❌ |

**Legend:**
- * Teachers view data for their assigned classes/students only
- ** Teachers manage only their assigned classes
- *** Parents view only their own child's data
- **** Teachers view reports for their assigned students

---

## Access Control Rules

### Authentication
- All users must be logged in to access any dashboard
- Session timeout after 30 minutes of inactivity
- Two-factor authentication available for Admin and Super Admin roles

### Data Isolation
- Users can only access data relevant to their role and institutional boundaries
- Cross-institutional data access is strictly prohibited (except Super Admin)
- Parents can only see their own children's data

### Route Protection
- `/dashboard/super-admin` → Only SUPER_ADMIN
- `/dashboard/admin` → Only ADMIN and above
- `/dashboard/teacher` → Only TEACHER and above
- `/dashboard/parent` → All authenticated users (limited to their data)

---

## Implementation Guidelines

### Backend (Supabase)
1. Use Row-Level Security (RLS) policies on database tables
2. Implement role checks before data queries
3. Log all administrative actions
4. Validate permissions on every API endpoint

### Frontend (Next.js)
1. Check user role on component mount
2. Redirect unauthorized users to their appropriate dashboard
3. Conditionally render UI based on permissions
4. Display permission denied messages clearly

### Security Best Practices
1. Never store sensitive data in browser localStorage for roles
2. Always validate permissions server-side
3. Implement audit logging for all role changes
4. Use environment variables for sensitive configurations
5. Implement rate limiting on critical endpoints

---

## Future Enhancements

- [ ] Implement granular permissions (currently role-based only)
- [ ] Add custom role creation for institutions
- [ ] Implement permission override approval workflow
- [ ] Add time-limited role elevations
- [ ] Create activity audit dashboard
- [ ] Implement SSO (Single Sign-On) for institutions
- [ ] Add role-based API key management
