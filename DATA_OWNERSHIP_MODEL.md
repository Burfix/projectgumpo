# Project Gumpo: Data Ownership & Responsibility Model

## Overview
This document defines **who owns, creates, views, edits, and deletes** each data type in Project Gumpo. The model prioritizes **accountability** and **auditability** - every action is tracked, and clear ownership prevents confusion and protects sensitive information.

---

## Core Principle: Role-Based Data Ownership

```
SUPER_ADMIN: Owns all system metadata (users, institutions, audit logs)
   ↓ Delegates to
ADMIN: Owns institutional data (within their school)
   ↓ Delegates to
TEACHER: Owns classroom data (their assigned class)
   ├─ Creates: Daily logs, grades, attendance
   └─ Shares with
PARENT: Views data specific to their child only
   └─ Owns: Their own profile, messages they send
```

---

## Data Types & Ownership Rules

### 1. USER ACCOUNTS (Email, Password, Role)

**Owner:** SUPER_ADMIN (system-wide), ADMIN (within institution)

**CRUD Permissions:**

| Action | Super Admin | Admin | Teacher | Parent |
|--------|:-----------:|:-----:|:--------:|:------:|
| **CREATE** User (other ADMIN) | ✅ | ❌ | ❌ | ❌ |
| **CREATE** User (TEACHER) | ✅ | ✅ | ❌ | ❌ |
| **CREATE** User (PARENT) | ✅ | ✅ | ❌ | ❌ |
| **CREATE** User (SUPER_ADMIN) | ✅ | ❌ | ❌ | ❌ |
| **READ** All users | ✅ | ✅ (own institution only) | ❌ | ❌ |
| **READ** Own profile | ✅ | ✅ | ✅ | ✅ |
| **UPDATE** User role | ✅ (not self) | ❌ | ❌ | ❌ |
| **UPDATE** User info (email, name) | ✅ | ✅ (own institution) | Limited* | ✅ (own profile) |
| **DELETE** User (soft) | ✅ | ✅ | ❌ | ❌ |
| **DELETE** User (hard) | ✅ | ❌ | ❌ | ❌ |

*Teacher can only update their own profile information

**Audit Trail:**
- ✅ When account created (timestamp, creator email, role assigned)
- ✅ When role changed (old role → new role, who changed it, reason)
- ✅ When account deactivated (who did it, reason, timestamp)
- ✅ When last logged in
- ✅ Failed login attempts (security)

**Special Rules:**
- SUPER_ADMIN cannot delete their own account (must have backup admin)
- ADMIN cannot modify their own role (prevents privilege escalation)
- Deactivated accounts still visible in history (not deleted)
- Account reactivation requires ADMIN/SUPER_ADMIN approval

---

### 2. STUDENT RECORDS (Child Profile, Age, Class Assignment)

**Owner:** ADMIN (institutional level), Shared with TEACHER & PARENT (child-specific views)

**CRUD Permissions:**

| Action | Super Admin | Admin | Teacher | Parent |
|--------|:-----------:|:-----:|:--------:|:------:|
| **CREATE** Student | ✅ | ✅ | ❌ | ❌ |
| **READ** All students | ✅ | ✅ (own institution) | ✅ (own class only) | ✅ (own child only) |
| **READ** Student full profile | ✅ | ✅ | ✅ (own class) | ✅ (own child) |
| **UPDATE** Name/Age/Class | ✅ | ✅ | ❌ | ❌ |
| **UPDATE** Emergency contacts | ✅ | ✅ | ❌ | ❌ |
| **UPDATE** Medical info | ✅ | ✅ | Read-only | ❌ |
| **UPDATE** Custom fields | ✅ | ✅ | ❌ | ❌ |
| **DELETE** Student (soft) | ✅ | ✅ | ❌ | ❌ |
| **DELETE** Student (hard) | ✅ | ❌ | ❌ | ❌ |

**Audit Trail:**
- ✅ When student created (who, timestamp, institution)
- ✅ When class assignment changed (old class → new class, why)
- ✅ When profile edited (what changed, by whom, timestamp)
- ✅ When student deactivated (who, reason, timestamp)
- ✅ When parent linked to student (timestamp, who performed action)
- ✅ When parent unlinked from student (timestamp, who, reason)

**Special Rules:**
- Parents can ONLY see their own child
- Teachers can ONLY see students in their assigned classes
- ADMIN can see all students but cannot edit emergency/medical without SUPER_ADMIN approval
- Student deactivation (not deletion) - retains all historical data
- Cannot unlink last parent from student (at least 1 parent must always be assigned)

---

### 3. PARENT/GUARDIAN RECORDS (Contact Info, Relationship Type)

**Owner:** ADMIN (institutional level), Parent owns their own info

**CRUD Permissions:**

| Action | Super Admin | Admin | Teacher | Parent |
|--------|:-----------:|:-----:|:--------:|:------:|
| **CREATE** Parent | ✅ | ✅ | ❌ | ❌ |
| **READ** All parents | ✅ | ✅ (own institution) | ❌ | ❌ |
| **READ** Linked parents only | ❌ | ❌ | ✅ (their students' parents) | ✅ (own profile) |
| **UPDATE** Contact info | ✅ | ✅ | ❌ | ✅ (own only) |
| **UPDATE** Relationship type (mother, father, guardian, etc.) | ✅ | ✅ | ❌ | ❌ |
| **UPDATE** Emergency contact status | ✅ | ✅ | ❌ | ❌ |
| **DELETE** Parent (soft) | ✅ | ✅ | ❌ | ❌ |
| **DELETE** Parent (hard) | ✅ | ❌ | ❌ | ❌ |

**Audit Trail:**
- ✅ When parent account created (who, timestamp)
- ✅ When relationship type changed (old → new, by whom)
- ✅ When contact info changed (what changed, when)
- ✅ When parent linked to student (timestamp, who did it)
- ✅ When parent unlinked (timestamp, reason, who)
- ✅ When account deactivated (who, when)
- ✅ Parent login/last activity

**Special Rules:**
- Parents can only view/edit their own profile and contact information
- Teachers cannot see parent contact details (privacy)
- At least one parent must always be linked to a student
- Parent relationship type (mother, father, guardian) is set by ADMIN
- Parent cannot change their assigned students (only ADMIN can do this)

---

### 4. DAILY ACTIVITY LOGS & OBSERVATIONS

**Owner:** TEACHER (creator/author), ADMIN can review, PARENT can view (read-only)

**CRUD Permissions:**

| Action | Super Admin | Admin | Teacher | Parent |
|--------|:-----------:|:-----:|:--------:|:------:|
| **CREATE** Daily log | ✅ | ❌ | ✅ (own class) | ❌ |
| **READ** All logs | ✅ | ✅ (own institution) | ✅ (own class) | ✅ (own child only) |
| **EDIT** Own log (within 24h) | ✅ | ❌ | ✅ (within 4 hours) | ❌ |
| **EDIT** Other teacher's log | ❌ | ✅ (with reason) | ❌ | ❌ |
| **DELETE** Own log (within 24h) | ✅ | ❌ | ✅ (within 2 hours) | ❌ |
| **DELETE** Other's log | ✅ | ✅ (with reason) | ❌ | ❌ |
| **PUBLISH** Log (make visible to parents) | ✅ | ✅ | ✅ (auto) | ❌ |
| **UNPUBLISH** Log (hide from parents) | ✅ | ✅ (admin only) | ✅ (within 4h) | ❌ |

**Audit Trail:**
- ✅ Created by (teacher name, timestamp)
- ✅ When published (made visible to parents)
- ✅ Edited when/by whom (timestamp, editor)
- ✅ Changed content (before/after for important edits)
- ✅ Deleted when/by whom/reason
- ✅ View history (who viewed it, when)

**Special Rules:**
- Teacher can edit/delete within 4 hours (correcting mistakes)
- After 4 hours, only ADMIN can edit (with reason)
- After 24 hours, only SUPER_ADMIN can delete (audit trail required)
- Parents see published logs only; drafts are teacher-only
- Photos attached to logs cannot be deleted by teacher (preserved in history)
- Each log must have at least one photo or detailed note
- ADMIN approval NOT required to publish (teacher trusts)
- Comments from parents on logs are tracked separately

---

### 5. ATTENDANCE RECORDS

**Owner:** TEACHER (records attendance), ADMIN & PARENT view (read-only)

**CRUD Permissions:**

| Action | Super Admin | Admin | Teacher | Parent |
|--------|:-----------:|:-----:|:--------:|:------:|
| **CREATE** Attendance record | ✅ | ✅ | ✅ (own class) | ❌ |
| **READ** All attendance | ✅ | ✅ (own institution) | ✅ (own class) | ✅ (own child) |
| **UPDATE** Attendance entry | ✅ | ✅ | ✅ (within school day) | ❌ |
| **UPDATE** After day ends | ✅ | ✅ (with reason) | ❌ | ❌ |
| **DELETE** Attendance entry | ✅ | ✅ (with reason) | ❌ | ❌ |
| **REPORT** Absence | ✅ | ✅ | ✅ (record) | ✅ (parent-reported absences) |

**Audit Trail:**
- ✅ Marked by (teacher name, timestamp)
- ✅ Status: Present/Absent/Late/Excused
- ✅ If absent: Reason (if provided by parent)
- ✅ If edited: What changed, by whom, timestamp, reason
- ✅ If parent-reported: Parent email, timestamp, absence note
- ✅ Monthly reports generated (for compliance)

**Special Rules:**
- Teacher marks attendance same-day (real-time or within morning)
- Parents can pre-report absences (vacation, sick day)
- Parents can report absences same-day before 9:00 AM
- After school day ends, only ADMIN can modify (prevents tampering)
- Attendance data used for enrollment reporting (compliance)
- Chronic absences trigger admin notification
- 3+ unreported absences require ADMIN follow-up
- Attendance export available to ADMIN (monthly, by student, by class)

---

### 6. GRADES & ASSESSMENTS

**Owner:** TEACHER (records grades), ADMIN reviews (read-only), PARENT views (read-only)

**CRUD Permissions:**

| Action | Super Admin | Admin | Teacher | Parent |
|--------|:-----------:|:-----:|:--------:|:------:|
| **CREATE** Grade/Assessment | ✅ | ❌ | ✅ (own students) | ❌ |
| **READ** All grades | ✅ | ✅ (own institution) | ✅ (own students) | ✅ (own child) |
| **UPDATE** Grade (same day) | ✅ | ❌ | ✅ (within 24h) | ❌ |
| **UPDATE** Grade (after 24h) | ✅ | ✅ (with reason) | ❌ | ❌ |
| **DELETE** Grade entry | ✅ | ✅ (with reason) | ❌ | ❌ |
| **COMMENT** On grade | ✅ | ✅ | ✅ | ❌ |

**Audit Trail:**
- ✅ Recorded by (teacher, timestamp)
- ✅ Assessment type (academic, behavioral, developmental)
- ✅ Updated when (timestamp, by whom)
- ✅ Previous grade value (for changes)
- ✅ Comment/note (teacher's reasoning)
- ✅ Deleted when/by whom/reason
- ✅ Parent notification sent (when grade recorded)

**Special Rules:**
- Grades marked within 24 hours can be edited by teacher
- After 24 hours, ADMIN review required for changes (audit trail)
- Each grade must have teacher comment (why this grade)
- Parents notified when grade recorded (automatic email)
- Grades NOT visible to parents until marked "published" by teacher
- Teacher can embargo grades (not show to parents until report card date)
- Grade scale (A/B/C or numeric) set by ADMIN at institution level
- Cannot delete grade (only mark as "retracted" with reason)

---

### 7. MESSAGES & COMMUNICATION

**Owner:** Sender owns message, receiver can delete, ADMIN can view (monitoring)

**CRUD Permissions:**

| Action | Super Admin | Admin | Teacher | Parent |
|--------|:-----------:|:-----:|:--------:|:------:|
| **SEND** Message | ✅ (no use) | ❌ (no direct) | ✅ (to parents) | ✅ (to teachers) |
| **READ** Own messages | ✅ | ✅ | ✅ | ✅ |
| **READ** All messages (monitoring) | ✅ | ✅ (own institution) | ❌ | ❌ |
| **EDIT** Own message (within 5 min) | ✅ | ❌ | ✅ | ✅ |
| **DELETE** Own message | ✅ | ❌ | ✅ (from own inbox) | ✅ (from own inbox) |
| **DELETE** Other's message | ❌ | ✅ (with reason) | ❌ | ❌ |
| **ARCHIVE** Message | ✅ | ❌ | ✅ | ✅ |

**Audit Trail:**
- ✅ Sent by (sender email, timestamp)
- ✅ To (recipient email)
- ✅ Message content (for compliance/incident review)
- ✅ Read status (delivered, read, seen)
- ✅ Edited when/by whom/what changed
- ✅ Deleted when/by whom (only ADMIN can delete others' messages)
- ✅ Flagged inappropriate content (if flagged)

**Special Rules:**
- Teacher can only message parents of their assigned students
- Parent can only message teachers of their child
- Messages archived (not deleted) - preserved for compliance
- ADMIN can read any message in their institution (for monitoring)
- Messages kept for minimum 1 year (for compliance)
- Profanity filter (optional flag, not delete)
- Cannot unsend after 5 minutes (for safety)
- Message notifications sent via email (real-time)
- Response time tracked (for engagement metrics)
- Teachers must respond to parent messages within 24 hours (policy, not enforced)

---

### 8. INCIDENT & BEHAVIORAL REPORTS

**Owner:** TEACHER (reports), ADMIN reviews & acts

**Note:** NOT in MVP. Reserved for Phase 2.

**CRUD Permissions (Phase 2):**

| Action | Super Admin | Admin | Teacher | Parent |
|--------|:-----------:|:-----:|:--------:|:------:|
| **CREATE** Incident report | ✅ | ✅ | ✅ | ❌ |
| **READ** Own reports | ✅ | ✅ | ✅ | Limited* |
| **READ** All reports | ✅ | ✅ | ❌ | ❌ |
| **UPDATE** Report | ✅ | ✅ | ❌ | ❌ |
| **DELETE** Report | ✅ | ❌ | ❌ | ❌ |

*Parent can only see behavioral summaries for their own child, not detailed incidents

---

### 9. INSTITUTIONAL DATA (School Profile, Contact, Settings)

**Owner:** ADMIN (with SUPER_ADMIN oversight)

**CRUD Permissions:**

| Action | Super Admin | Admin | Teacher | Parent |
|--------|:-----------:|:-----:|:--------:|:------:|
| **CREATE** Institution | ✅ | ❌ | ❌ | ❌ |
| **READ** Own institution | ✅ | ✅ | ✅ (name only) | ❌ |
| **READ** All institutions | ✅ | ❌ | ❌ | ❌ |
| **UPDATE** Institution profile | ✅ | ✅ | ❌ | ❌ |
| **UPDATE** Settings (time zone, grade scale, etc.) | ✅ | ✅ | ❌ | ❌ |
| **DELETE** Institution | ✅ (archive) | ❌ | ❌ | ❌ |

**Audit Trail:**
- ✅ Created by (SUPER_ADMIN email, timestamp)
- ✅ Updated when/by whom/what changed
- ✅ Settings changes logged (who changed, old → new value)
- ✅ User added to institution (who, when)
- ✅ Institution deactivated when/by whom

---

## Data Access Patterns by Role

### SUPER_ADMIN Access Pattern
```
Can see: Everything (across all institutions)
Cannot edit: User passwords, institutional data (only archive)
Must audit: Every action they take
Can delegate to: Create ADMIN accounts
```

### ADMIN Access Pattern
```
Can see: All data within their institution only
Cannot see: Other institutions' data
Must audit: Teacher creation, parent-child linking
Can override: Grade edits, message reviews, incident responses
```

### TEACHER Access Pattern
```
Can see: Only their own class & assigned students
Can create: Daily logs, attendance, grades, messages
Cannot see: Other teachers' classes or students
Must document: All activities logged with dates/times
```

### PARENT Access Pattern
```
Can see: Only their own child's data
Cannot see: Other children, other parents, finances
Can communicate: Only with their child's teachers
Can report: Absences and upload home photos
```

---

## Compliance & Accountability

### Every Action Has Metadata
```json
{
  "action": "update_grade",
  "actor": "teacher@school.edu",
  "actor_role": "TEACHER",
  "target_resource": "grade_123",
  "target_student": "John_Doe",
  "timestamp": "2026-01-30T14:23:45Z",
  "old_value": "B",
  "new_value": "A",
  "reason": "Rechecked math assessment, higher score",
  "ip_address": "192.168.1.1",
  "institution": "Lincoln_Preschool"
}
```

### Data Retention Policy
- **Active data:** Kept indefinitely while institution is active
- **Inactive institution:** Archived for 3 years, then deleted
- **Deactivated user:** Kept for 2 years for audit, then anonymized
- **Messages:** Kept for 2+ years for compliance
- **Deleted data:** Soft delete only (marked inactive, not erased)
- **Hard delete:** Only SUPER_ADMIN, requires GDPR/legal request

### Accountability Rules
1. **No one can modify their own sensitive actions** (role change, account creation)
2. **All edits logged** (who, when, what changed)
3. **Deletion is tracking, not erasure** (marked deleted, but traceable)
4. **ADMIN approval gates** certain modifications (grades after 24h, user deletion)
5. **Audit logs accessible only to SUPER_ADMIN** (no hiding actions)
6. **Immutable records** (timestamps, deletions cannot remove history)

---

## Data Ownership Diagram

```
Institution
├─ Students (owned by ADMIN)
│  ├─ Attendance (recorded by TEACHER)
│  ├─ Daily Logs (created by TEACHER)
│  ├─ Grades (created by TEACHER)
│  └─ Parent Links (created by ADMIN)
├─ Teachers (owned by ADMIN)
│  ├─ Class Assignments (created by ADMIN)
│  └─ Messages (sent by TEACHER, received by PARENT)
├─ Parents (owned by ADMIN)
│  ├─ Profile (owned by PARENT)
│  ├─ Child Links (created by ADMIN)
│  └─ Messages (sent by PARENT, received by TEACHER)
└─ Classes (owned by ADMIN)
   └─ Student Assignments (created by ADMIN)

System Level (owned by SUPER_ADMIN)
├─ Institutions
├─ User Accounts (all)
├─ Audit Logs
├─ System Settings
└─ Compliance Records
```
