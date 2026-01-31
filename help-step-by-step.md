# Project Gumpo: Dashboard Purpose & 30-Second Actions

## Overview
Each dashboard is purpose-built for a specific role with **5 critical actions** that can be completed in 30 seconds or less, plus **essential information** that must be immediately visible without scrolling.

---

## 1. SUPER_ADMIN DASHBOARD

### Purpose
System oversight, user management accountability, security monitoring, and institutional health verification.

---

### Top 5 Actions (30 Seconds)

#### Action 1: Quick System Health Check
**Goal:** Verify system is operational
**Time:** 5 seconds
**Flow:**
```
Dashboard loads → See status board:
├─ ✅ All systems operational
├─ ✅ Database connection: Good
├─ ✅ Email delivery: Working (last 100 msgs sent)
├─ ⚠️ One user role change pending review
└─ 📊 14,234 users across 47 institutions
```
**Success indicator:** Green checkmarks, no red alerts

#### Action 2: Find & Review Problematic User Account
**Goal:** Locate unauthorized role assignment or suspicious account
**Time:** 15 seconds
**Flow:**
```
Search bar: Type "suspicious_email"
↓
System shows:
├─ Found: 1 user
├─ Name: John Smith
├─ Email: suspicious_email@gmail.com
├─ Role: ADMIN (⚠️ ALERT: Changed from PARENT 2 hours ago)
├─ Institution: Lincoln Preschool
├─ Changed by: Sarah Admin
├─ Reason: [Empty - no reason provided]
└─ Actions: [Review] [Revert] [Deactivate]
```
**Success indicator:** Can see role change history and revert if needed

#### Action 3: Approve/Deny New Institution Onboarding
**Goal:** Quickly approve or reject a new school's admin request
**Time:** 10 seconds
**Flow:**
```
Pending approvals badge: "1 new"
↓
Click: Expand pending list
↓
See:
├─ Institution: "Happy Days Preschool"
├─ Admin email: admin@happydays.edu
├─ Requested: 2 hours ago
├─ Quick actions: [Approve] [Request More Info] [Deny]
└─ Auto-assigns: ADMIN role to approved email
```
**Success indicator:** New institution activated within 1 minute

#### Action 4: View System Audit Log Summary
**Goal:** See recent administrative activities
**Time:** 10 seconds
**Flow:**
```
Click: "Audit Log"
↓
See last 10 actions:
├─ 12:45 PM - Sarah Admin created user: teacher@school.edu
├─ 12:30 PM - ROLE CHANGE: student@gmail.com PARENT → ADMIN (flagged)
├─ 12:15 PM - New institution approved: Garden Sprouts Preschool
├─ 12:00 PM - Mike Super created new admin account
└─ [Show more...]
```
**Success indicator:** Can scan activities in 10 seconds, spot anomalies

#### Action 5: Respond to Support Escalation
**Goal:** Address critical platform issue from institutional admin
**Time:** 20 seconds
**Flow:**
```
Alerts banner: "1 critical support ticket"
↓
Click: View ticket
↓
See:
├─ From: Principal Sarah, Lincoln Preschool
├─ Issue: "Teachers can't create daily logs - permission error"
├─ Submitted: 1 hour ago
├─ Impact: 30 teachers affected
├─ Quick actions: [Investigate] [Message Principal] [Escalate to Dev]
└─ Template responses: [Quick fix guide] [Schedule call]
```
**Success indicator:** Can acknowledge and begin resolution in 20 seconds

---

### Must-Visible Information (No Scrolling)

```
┌─────────────────────────────────────────────────────────────┐
│ SUPER_ADMIN DASHBOARD                    [Settings] [Help]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ⚠️  ALERTS & CRITICAL ACTIONS                                │
│ ├─ 1 Role change requiring review (John Smith → ADMIN)      │
│ ├─ 1 Support ticket (Teachers unable to log activities)     │
│ └─ 1 Institution pending approval (Happy Days Preschool)    │
│                                                               │
│ SYSTEM HEALTH (Live)                                        │
│ ├─ Database: ✅ Connected (567 ms latency)                  │
│ ├─ Email service: ✅ Working (143/150 msgs delivered)       │
│ ├─ File storage: ✅ OK (1.2TB used)                         │
│ └─ API: ✅ Operational (99.97% uptime)                      │
│                                                               │
│ QUICK STATS                                                  │
│ ├─ Total users: 14,234 | Active today: 6,847              │
│ ├─ Institutions: 47 | New this month: 3                    │
│ └─ Support tickets: 23 open | Avg response: 1.2 hours      │
│                                                               │
│ RECENT ACTIVITIES (Last 5)                                  │
│ ├─ 12:45 - New user: teacher@school.edu (TEACHER)         │
│ ├─ 12:30 - ALERT: Role escalation detected (Reviewed)      │
│ ├─ 12:15 - Institution approved: Garden Sprouts            │
│ ├─ 12:00 - System backup completed (Success)               │
│ └─ 11:45 - Email delivery resumed after error              │
│                                                               │
│ QUICK ACTIONS                                                │
│ [Search Users] [View Audit Log] [Approve Pending] [Support]│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. ADMIN DASHBOARD

### Purpose
Daily operations, relationship management, institutional oversight, communication monitoring.

---

### Top 5 Actions (30 Seconds)

#### Action 1: Verify Today's Attendance Status
**Goal:** Confirm class attendance was recorded
**Time:** 5 seconds
**Flow:**
```
Dashboard loads → Attendance widget shows:
├─ 📊 Today's attendance
├─ Class A: 12/13 present (1 absent - pre-reported)
├─ Class B: 10/10 present
├─ Class C: 9/11 present (2 late by parents at 8:55 AM)
└─ ✅ All recorded by 9:10 AM
```
**Success indicator:** Know exact status immediately

#### Action 2: See Today's Communication Count
**Goal:** Monitor teacher-parent engagement for the day
**Time:** 5 seconds
**Flow:**
```
Widget: "Today's Communications"
├─ Messages sent: 7 (from teachers)
├─ Messages received: 12 (from parents)
├─ Unanswered messages: 1 (flagged ⚠️)
└─ Avg response time: 23 minutes
```
**Success indicator:** Gauge engagement health quickly

#### Action 3: Link a Parent to Their Child (New Enrollment)
**Goal:** Complete critical setup task for new student
**Time:** 20 seconds
**Flow:**
```
Quick action button: "Link Parent to Child"
↓
Form pre-fills:
├─ New student selector (dropdown): "Emma Wilson"
├─ Class automatically selected: "Class A"
├─ Parent search: Start typing "emma.parent@..."
├─ System suggests: "Sarah Wilson (mother)"
├─ Confirm: [Link These Two]
↓
Success: "Emma now visible to Sarah Wilson's dashboard"
```
**Success indicator:** Parent can log in and see their child

#### Action 4: Check Unread Teacher/Parent Messages
**Goal:** Be aware of any issues requiring immediate attention
**Time:** 10 seconds
**Flow:**
```
Click: Messages badge (shows "3 new")
↓
See summary:
├─ Ms. Johnson to Mrs. Kim: "Emma seemed upset, all okay?"
├─ Mr. Patel to Admin: "Need clarification on grade submission"
├─ Parents to Ms. Johnson: 2 unanswered (for 30+ min)
└─ Actions: [View all] [Respond] [Escalate]
```
**Success indicator:** Can spot issues needing intervention

#### Action 5: Approve/Flag a Teacher's Daily Log (Quality Check)
**Goal:** Ensure documentation quality and consistency
**Time:** 15 seconds
**Flow:**
```
Widget: "Pending Log Reviews"
├─ Ms. Johnson - Class A (submitted 12:45 PM)
├─ Preview: "Circle time, 20 photos, good detail"
├─ Quick actions: [Approve] [Request revision] [Flag for attention]
└─ Approval grants: Parents see it in their feed
```
**Success indicator:** Quality assurance is built into workflow

---

### Must-Visible Information (No Scrolling)

```
┌──────────────────────────────────────────────────────────────┐
│ ADMIN DASHBOARD - Lincoln Preschool      [Settings] [Help]   │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ ⚠️  TODAY'S ALERTS & ACTIONS                                  │
│ ├─ ✅ Attendance recorded: 31/33 students (Class C: 2 late)  │
│ ├─ ⚠️  1 parent hasn't responded in 45 min (escalate?)       │
│ ├─ 📋 3 new students awaiting parent-child link              │
│ └─ 👥 Teacher absence: Ms. Chen (personal day - covered)     │
│                                                                │
│ THIS MORNING'S ENGAGEMENT                                    │
│ ├─ Messages exchanged: 19 (7 teachers → parents)             │
│ ├─ Unanswered: 1 message (from parent, 45 min old)          │
│ ├─ Attendance photos shared: 12 (from Ms. Johnson)           │
│ └─ Daily logs submitted: 2/3 classes                         │
│                                                                │
│ CURRENT INSTITUTIONAL STATUS                                 │
│ ├─ Active students: 33 | Active parents: 28 | Teachers: 4   │
│ ├─ Classes: 3 (A: 12 students, B: 10, C: 11)               │
│ ├─ Enrollment: 97% capacity (target: 100%)                  │
│ └─ Parent login rate this month: 94%                        │
│                                                                │
│ RELATIONSHIP COMPLETENESS                                    │
│ ├─ Parent-child links: 30/33 (91%) — 3 new awaiting link   │
│ ├─ Teacher-class assignments: 4/4 (100%) ✅                │
│ └─ Students with at least 1 parent: 33/33 (100%) ✅        │
│                                                                │
│ QUICK ACTIONS                                                │
│ [Link Parent to Child] [View Messages] [Review Logs]        │
│ [Check Engagement] [Generate Report]                        │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. TEACHER DASHBOARD

### Purpose
Daily classroom management, quick attendance/documentation, efficient parent communication, zero administrative friction.

---

### Top 5 Actions (30 Seconds)

#### Action 1: Record Morning Attendance (Most Time-Sensitive)
**Goal:** Mark students present/absent in <30 seconds
**Time:** 30 seconds max
**Flow:**
```
Dashboard loads → Big "Today's Attendance" button
↓
Click → Show my students:
├─ ☐ John (expected 8:45 AM) — Current time 8:42 AM
├─ ☐ Emma (expected 8:45 AM)
├─ ☐ Michael (expected 8:45 AM)
├─ ☐ Sarah (expected 8:45 AM)
└─ [Fast-tap mode: tap each student]
↓
After tapping:
├─ All marked as "Pending" (waiting for parent update too)
├─ System auto-notifies: "3 present, 1 awaiting parent check-in"
└─ Done: Can close and start teaching
```
**Success indicator:** Attendance done before 8:50 AM

#### Action 2: Start Quick Activity Log Entry
**Goal:** Begin documenting today's activities
**Time:** 10 seconds
**Flow:**
```
Button: "Start Today's Log"
↓
Form appears:
├─ Today: [Auto-filled date]
├─ My class: "Class A - 4 students" [Auto-filled]
├─ Theme: [Dropdown] Select "Circle time"
├─ Quick note: "Autumn leaves discussion"
├─ Add photos: [Camera icon - tap to add]
└─ Save & continue: Logs continue in background
```
**Success indicator:** Logged without leaving classroom

#### Action 3: Send Quick Message to a Parent (Concern or Celebration)
**Goal:** Communicate about a student in <20 seconds
**Time:** 20 seconds
**Flow:**
```
Click: "Quick Message"
↓
Show: My class students (4 names)
├─ Pick: "Emma Lee"
↓
Quick templates appear:
├─ [📸 Share photo] - Photo with caption
├─ [✅ Celebration] - "Great job today!"
├─ [⚠️ Concern] - "Noticed she seemed..."
├─ [❓ Question] - "Does Emma... at home?"
├─ [Custom message]
↓
Tap template → Send (pre-filled with common text)
```
**Success indicator:** Message sent in 15 seconds

#### Action 4: Check Assigned Students List & Today's Notes
**Goal:** Know who's in your class and any special information
**Time:** 5 seconds
**Flow:**
```
Widget: "My Class Today"
├─ Class A - Nursery
├─ Students (4):
│  ├─ John - ✅ Present (arrived 8:47)
│  ├─ Emma - ❌ Absent (doctor apt, parent notified)
│  ├─ Michael - ✅ Present
│  └─ Sarah - ⚠️  Late (7 min)
├─ Special notes for today:
│  ├─ 📌 John's parent asked about lunch preferences
│  └─ 📌 Emma's absence pre-reported (OK)
└─ Status: Ready to start
```
**Success indicator:** All relevant info in 5 seconds

#### Action 5: Upload Today's Photos/Activities
**Goal:** Share visual documentation of learning
**Time:** 15 seconds
**Flow:**
```
Button: "Add to Today's Log"
↓
Interface:
├─ Take/select photos: [Camera] or [Choose files]
├─ Batch upload: 1, 3, or 6+ photos at once
├─ Auto-tag students: AI suggests who's in photos
├─ Caption: "Leaf sorting - great teamwork!" (suggested)
├─ Category: [Dropdown] "Learning activity"
└─ Share: [Visible to parents immediately]
↓
Upload happens in background
```
**Success indicator:** Photos visible to parents within 1 minute

---

### Must-Visible Information (No Scrolling)

```
┌──────────────────────────────────────────────────────────────┐
│ TEACHER DASHBOARD - Ms. Johnson (Class A)  [Settings] [Help] │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ ⚠️  THIS MORNING - ACTION REQUIRED                            │
│ ├─ ✅ Attendance: 3/4 present (1 absence pre-reported)       │
│ ├─ 🕐 Time: 8:52 AM (attendance still open for Sarah)       │
│ ├─ 📬 New message from Mrs. Kim: "Great pics yesterday!"    │
│ └─ 💬 Unanswered: 0 parent messages                          │
│                                                                │
│ MY CLASS TODAY (4 students)                                  │
│ ├─ John ✅ (arrived 8:47) - Mom messaged: "Thanks for...
│ ├─ Emma ❌ (absent) - Doctor appointment (pre-reported)     │
│ ├─ Michael ✅ (on time)                                      │
│ └─ Sarah ⚠️  (late 7 min, arrived 8:52)                      │
│                                                                │
│ SPECIAL NOTES FOR TODAY                                      │
│ ├─ 📌 John's parent asked: Lunch preferences?              │
│ ├─ 📌 Emma's absence: Doctor appointment (OK)              │
│ └─ 📌 Michael's parent: Checking on behavior               │
│                                                                │
│ QUICK ACTIONS (For fast access)                             │
│ [Record Attendance] [Add Activity] [Message Parent]         │
│ [Upload Photos] [View Messages] [Daily Log]                │
│                                                                │
│ STATS AT A GLANCE                                            │
│ ├─ Messages sent this week: 12                              │
│ ├─ Parent response rate: 100%                               │
│ ├─ Activity logs submitted: 4/5 days                        │
│ └─ Average time in app/day: 8 minutes                       │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. PARENT DASHBOARD

### Purpose
Child's daily progress, quick teacher communication, peace of mind, connection without overwhelm.

---

### Top 5 Actions (30 Seconds)

#### Action 1: Confirm Child Arrived Safely
**Goal:** Know child is at school (most important to parents)
**Time:** 5 seconds
**Flow:**
```
Dashboard loads → Big status widget:
├─ ✅ John checked in at 8:47 AM
├─ 📍 In: "Class A"
├─ 👩‍🏫 With: "Ms. Johnson"
├─ Status: "All good - ready for his day"
└─ Last activity: "Attendance marked 2 min ago"
```
**Success indicator:** Green checkmark = peace of mind

#### Action 2: View Today's Activities/Photos
**Goal:** See what child did (real-time or near-real-time)
**Time:** 15 seconds
**Flow:**
```
Click: "Today's Activities"
↓
See:
├─ 📸 Gallery: 4 photos from circle time
├─ Title: "Autumn leaves - sorting & discussion"
├─ Teacher note: "John was very engaged, asked lots of questions"
├─ Duration: 45 minutes
└─ Scroll: More activities from today
↓
Tap any photo for bigger view or send to family
```
**Success indicator:** Can see what's happening in real-time

#### Action 3: Send Quick Message to Teacher
**Goal:** Ask question or share information about child
**Time:** 20 seconds
**Flow:**
```
Click: "Message Ms. Johnson"
↓
Compose appears:
├─ Pre-filled context: "About John Lee"
├─ Quick templates:
│  ├─ [📸 Share photo] - Photo from home
│  ├─ [✅ Good news] - "Had great night"
│  ├─ [❓ Question] - "How is John doing..."
│  ├─ [ℹ️ Info] - "You should know..."
│  └─ [Custom message]
├─ Send button (large, easy tap)
└─ Expectation: Reply within 1-2 hours
```
**Success indicator:** Message sent, teacher notified

#### Action 4: Check Attendance/Health Status
**Goal:** Confirm child's status for the day
**Time:** 5 seconds
**Flow:**
```
Widget: "Status"
├─ 🕐 Arrival: 8:47 AM (on time)
├─ ❤️ Health: No concerns flagged
├─ 📋 Behavior: Good
├─ 🎯 Mood: Happy (from teacher observation)
└─ Expected pickup: 3:15 PM
```
**Success indicator:** Know if anything needs attention

#### Action 5: View Weekly/Monthly Progress
**Goal:** Understand child's development trajectory
**Time:** 20 seconds
**Flow:**
```
Click: "Progress Report"
↓
See auto-generated summary:
├─ This week's highlights: "Learned ABC, great social skills"
├─ Photos: 20+ from the week
├─ Progress chart: Shows growth in areas (academic, social, physical)
├─ Teacher's note: "John had an amazing week!"
└─ Next week: "Learning about animals"
↓
Share: Send to partner/family
```
**Success indicator:** Understand growth and development

---

### Must-Visible Information (No Scrolling)

```
┌──────────────────────────────────────────────────────────────┐
│ PARENT DASHBOARD - John Lee (Class A) [Settings] [Logout]    │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ ✅ JOHN IS HERE - ALL GOOD                                    │
│ ├─ Arrived: 8:47 AM (on time)                                │
│ ├─ In class: "Class A - Autumn Leaf Activity"                │
│ ├─ With: "Ms. Johnson"                                        │
│ └─ Status: Happy & engaged                                    │
│                                                                │
│ TODAY'S ACTIVITIES (Just Added)                              │
│ ├─ 📸 4 new photos: Leaf sorting circle time (15 min ago)   │
│ ├─ 📝 Activity: "Autumn leaves discussion - very engaged"    │
│ ├─ ⭐ Teacher note: "John asked great questions!"            │
│ └─ [View more photos & activities]                          │
│                                                                │
│ QUICK COMMUNICATION                                          │
│ ├─ Last message from Ms. Johnson: "Great morning!"           │
│ │  (Sent 23 min ago)                                         │
│ ├─ Your last message: "How's he doing?" (Replied)           │
│ └─ [Send message to teacher]                                │
│                                                                │
│ TODAY'S STATUS                                               │
│ ├─ Attendance: ✅ Present                                     │
│ ├─ Mood: Happy (from teacher)                               │
│ ├─ Health: No concerns                                       │
│ └─ Behavior: Good                                            │
│                                                                │
│ QUICK ACTIONS                                                │
│ [View Today's Photos] [Check Attendance] [Message Teacher]  │
│ [View Weekly Progress] [Upload Home Photo]                  │
│                                                                │
│ THIS WEEK AT A GLANCE                                        │
│ ├─ Days attended: 4/5 (1 day at home)                       │
│ ├─ Photos shared: 18                                         │
│ ├─ Teacher messages: 8 (all positive!)                       │
│ └─ Your messages: 5                                          │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Summary Table: 30-Second Actions by Role

| Role | Action 1 | Action 2 | Action 3 | Action 4 | Action 5 |
|------|----------|----------|----------|----------|----------|
| **SUPER_ADMIN** | System health (5s) | Find user account (15s) | Approve institution (10s) | View audit log (10s) | Support escalation (20s) |
| **ADMIN** | Check attendance (5s) | See messages count (5s) | Link parent-child (20s) | Check messages (10s) | Review teacher log (15s) |
| **TEACHER** | Record attendance (30s) | Start log entry (10s) | Quick message (20s) | View class roster (5s) | Upload photos (15s) |
| **PARENT** | Confirm arrival (5s) | View activities (15s) | Message teacher (20s) | Check status (5s) | View progress (20s) |

---

## Design Principles for Dashboard UX

1. **Role-Specific First:** No generic interface - each dashboard is purpose-built
2. **Critical Info First:** Most important action/info at top, no scrolling
3. **Time-Conscious:** Respect that all users are busy
4. **Actionable:** Every element should enable user to accomplish a task
5. **Status-Aware:** Show real-time status indicators (✅ ❌ ⚠️)
6. **Mobile-First:** Design for phone-first, scale to desktop
7. **Notification-Free:** Alerts only for actionable items, never "nice-to-know"
8. **Visual Hierarchy:** Size and color guide users' attention
