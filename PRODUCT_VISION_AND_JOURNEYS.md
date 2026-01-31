# Project Gumpo: Product Vision & User Journeys

## 1. PRODUCT VISION

**The WHY - One Paragraph:**

Project Gumpo is a unified communication and management platform designed for preschools and early learning centers that solves the critical pain point of fragmented information flow between teachers, administrators, and parents. Unlike generic childcare apps that treat all institutions the same, Gumpo provides role-based workflows specifically architected for the preschool ecosystem—enabling teachers to share daily progress reports and attendance in seconds, administrators to efficiently manage parent-child-teacher relationships, and parents to gain real-time visibility into their child's development without overwhelming them with unnecessary data. By consolidating attendance tracking, daily logs, progress reports, messaging, and grade management into a single, role-specific interface, Gumpo eliminates the need for multiple apps, manual paper-based systems, and email chains, while keeping data secure and compliant with institutional boundaries.

---

## 2. ROLE-BASED USER JOURNEYS

### JOURNEY 1: SUPER ADMIN (System Administrator)

**WHO:** System administrator responsible for platform integrity, multi-institution support, and user lifecycle management.

**KEY GOALS:**
- Ensure platform stability and security across all institutions
- Manage user accounts and role assignments
- Monitor system health and access patterns
- Support institutional admins and troubleshoot issues

---

#### PHASE 1: INITIAL LOGIN & ONBOARDING
```
Step 1: Access Login Page
├─ Navigate to: http://localhost:3000/auth/login
├─ Emotion: Cautious (responsible for entire system)
└─ Pain Point: Needs strongest security verification

Step 2: Authentication
├─ Enter credentials with high security consciousness
├─ Expected: MFA prompt (future: two-factor auth)
└─ Decision: "Is my role still SUPER_ADMIN or has it been changed?"

Step 3: Redirect to Dashboard
├─ System identifies role → SUPER_ADMIN
├─ Auto-routes to: /dashboard/super-admin
└─ Emotion: Relief - Correct dashboard loaded
```

#### PHASE 2: FIRST LOGIN ACTIONS
```
Step 4: Dashboard Overview
├─ View: System statistics
│  ├─ Total users count
│  ├─ Institutions registered
│  ├─ Recent admin activities
│  └─ System health indicators
├─ Emotion: Reassured by system status
└─ Pain Point: Wants quick system health summary

Step 5: User Management
├─ Navigate to: User Management Section
├─ View: All users across all institutions
├─ Initial task: Verify data integrity
├─ Decision: "Are there any rogue accounts or unauthorized role assignments?"
└─ Action: Review recent user modifications
```

#### PHASE 3: DAILY OPERATIONS
```
Step 6: Role Assignment (Admin Onboarding)
├─ Receive notification: New institution needs admin user
├─ Task: Create new ADMIN account
├─ Actions:
│  ├─ Click: "Create New User"
│  ├─ Fill: Email, temporary password
│  ├─ Assign: ADMIN role (not SUPER_ADMIN)
│  └─ Send: Onboarding email with role description
├─ Decision: "Does this person understand their responsibilities?"
└─ Pain Point: Needs to verify they won't escalate privileges

Step 7: Monitor System Activities
├─ Review: Audit logs
├─ Track: Role changes, user deletions, data access patterns
├─ Emotion: Vigilant about security
└─ Decision: "Are there any suspicious patterns?"

Step 8: Institutional Support
├─ Receive: Support request from ADMIN about role issues
├─ Action: Review and modify user roles as needed
├─ Pain Point: Needs audit trail of why role was changed
└─ Resolution: Complete support ticket
```

#### PHASE 4: ADMIN MANAGEMENT LIFECYCLE
```
Step 9: Prevent Privilege Escalation
├─ Scenario: ADMIN tries to assign SUPER_ADMIN role
├─ System check: "Can ADMIN assign SUPER_ADMIN?" → NO
├─ System prevents action: Permission denied
├─ Pain Point: SUPER_ADMIN wants this explicitly logged
└─ Action: Automated alert sent

Step 10: Regular Audits
├─ Task: Monthly audit of all active users
├─ Check:
│  ├─ Users still employed at their institutions?
│  ├─ Roles still appropriate?
│  ├─ Access patterns normal?
│  └─ Any dormant accounts?
├─ Decision: "Who should we deactivate?"
└─ Action: Bulk deactivation or role changes
```

#### PHASE 5: TROUBLESHOOTING & ESCALATION
```
Step 11: System Issue Reports
├─ Receive: Report of ADMIN can't see users dashboard
├─ Actions:
│  ├─ Verify: ADMIN role has canViewAllData = true
│  ├─ Check: Institution data isolation is correct
│  ├─ Test: User authentication token
│  └─ Fix: Reset user session or modify permissions
├─ Pain Point: Needs debug information quickly
└─ Resolution: Issue resolved, user notified

Step 12: End of Day
├─ Review: System logs and alerts
├─ Verify: No critical issues pending
├─ Decision: "Can I safely end my shift?"
└─ Emotion: Confident system is secure
```

---

### JOURNEY 2: ADMIN (School Administrator/Principal)

**WHO:** School principal or educational director managing a single institution, its teachers, parents, and students.

**KEY GOALS:**
- Establish parent-child-teacher relationships within their school
- Oversee daily operations and teacher-parent communications
- Generate institutional reports and monitor engagement
- Ensure proper staff assignments and classroom coverage

---

#### PHASE 1: INITIAL LOGIN & INSTITUTION DISCOVERY
```
Step 1: Access Login Page
├─ Navigate to: http://localhost:3000/auth/login
├─ Emotion: Eager to explore new system
├─ Context: Just learned about Gumpo platform
└─ Mindset: "How will this help my school?"

Step 2: Authentication
├─ Enter email and password
├─ System verifies: User role = ADMIN
└─ Emotion: Anticipation - wondering what features await

Step 3: Redirect to Dashboard
├─ System identifies role → ADMIN
├─ Auto-routes to: /dashboard/admin
├─ First view: "Admin Dashboard" with welcome message
└─ Emotion: Relief - "This is designed for me"
```

#### PHASE 2: FIRST LOGIN ONBOARDING
```
Step 4: Dashboard Overview
├─ View: Institution snapshot
│  ├─ Number of teachers
│  ├─ Number of parents
│  ├─ Total students
│  └─ Recent activity timeline
├─ Tasks highlighted:
│  ├─ ✅ Link parents to children (NOT DONE YET)
│  ├─ ✅ Assign teachers to classes (NOT DONE YET)
│  ├─ ⚠️ Verify all users are set up
│  └─ ⚠️ Complete institutional configuration
├─ Emotion: Slightly overwhelmed by setup tasks
└─ Decision: "What's the right starting order?"

Step 5: Create First Teacher Account
├─ Task: "I need to add Ms. Johnson, my Head Teacher"
├─ Navigation: Click "Manage Users"
├─ Form filled:
│  ├─ Email: ms.johnson@school.edu
│  ├─ Name: Ms. Sarah Johnson
│  ├─ Role: TEACHER (cannot assign ADMIN - permission denied)
│  └─ Temporary password: auto-generated
├─ Pain Point: Can only create TEACHER, PARENT roles (cannot manage other ADMINs)
├─ Action: Send invite email to Ms. Johnson
└─ Emotion: "That was easy!"

Step 6: Create Classroom Structure
├─ Task: "I need to set up my 3 classrooms"
├─ Actions for each classroom:
│  ├─ Create: Class name (e.g., "Nursery A")
│  ├─ Assign: Lead teacher from dropdown
│  ├─ Assign: Assistant teachers (supports many-to-many)
│  └─ Save: System confirms "Ms. Johnson assigned to Nursery A"
├─ Pain Point: Wants to see which teachers are already assigned to prevent conflicts
└─ Emotion: Gaining confidence
```

#### PHASE 3: CORE OPERATION - PARENT-CHILD LINKING
```
Step 7: Add Parents & Students
├─ Task: "Parents are starting to register"
├─ Actions:
│  ├─ Create: Parent account (Email: parent@email.com)
│  ├─ Create: Student accounts
│  └─ View: List of unlinked students
├─ Pain Point: Multiple children per parent - needs clear UI
└─ Status: 5 parents added, 7 students created

Step 8: CRITICAL TASK - Link Parent to Children
├─ Goal: Establish parent-child relationships for communication
├─ Navigate to: "Link Parent to Child" interface
├─ Process:
│  ├─ Step 1: Select parent from list (John's Mom)
│  ├─ Step 2: Select children to link
│  │  ├─ ☑ John (Nursery A)
│  │  ├─ ☑ Emma (Nursery B)
│  │  └─ ☑ Future: Siblings of John
│  ├─ Step 3: Confirm relationship
│  ├─ Step 4: System creates data connection
│  └─ Step 5: Success notification
├─ Emotion: "NOW parents can see their child's progress!"
├─ Pain Point: Wants bulk parent-child linking (CSV import)
├─ Outcome: 12 parent-child relationships established

Step 9: Verify Relationships
├─ Task: Check that all linkages are correct
├─ Actions:
│  ├─ View: Parent "John's Mom" → sees "John" and "Emma"
│  ├─ Verify: All 7 students have at least one parent linked
│  └─ Verify: No orphaned students
├─ Decision: "Can I safely activate parent access?"
└─ Emotion: Confident
```

#### PHASE 4: CORE OPERATION - TEACHER ASSIGNMENTS
```
Step 10: Assign Teachers to Classes
├─ Task: Ensure every class has a lead teacher
├─ Navigate to: "Assign Teachers to Classes"
├─ Process:
│  ├─ View: 3 classrooms listed
│  │  ├─ Nursery A (Unassigned)
│  │  ├─ Nursery B (Assigned to Ms. Johnson)
│  │  └─ Pre-K (Unassigned)
│  ├─ Drag-and-drop: Mr. Patel → Nursery A
│  ├─ Drag-and-drop: Mrs. Garcia → Pre-K
│  └─ Add: Ms. Chen as assistant to Nursery A
├─ Pain Point: Wants to see teacher availability/conflicts
├─ System prevents: Assigning same teacher to overlapping time slots
└─ Outcome: All 3 classes now have assigned teachers

Step 11: Assign Students to Classes
├─ Task: Place students in appropriate classroom groups
├─ Process:
│  ├─ View: 7 students unassigned
│  ├─ Assign: John → Nursery A
│  ├─ Assign: Emma → Nursery B
│  ├─ Assign: Remaining 5 students
│  └─ Verify: Age-appropriate groupings
├─ System validation: "Can't assign 6-year-old to Nursery classroom"
└─ Emotion: "Now the data structure makes sense"
```

#### PHASE 5: ENABLE TEACHER ACCESS
```
Step 12: Activate Teacher Accounts
├─ Task: Teachers should now be able to log in
├─ Actions:
│  ├─ Ms. Johnson logs in → sees /dashboard/teacher
│  ├─ Views: "Nursery A with 4 students"
│  ├─ Sees: Quick action: "Record Attendance"
│  └─ Feels: "I can immediately start using this"
├─ Admin notification: "Ms. Johnson has logged in"
└─ Emotion: Relief - system working end-to-end
```

#### PHASE 6: DAILY MANAGEMENT
```
Step 13: Monitor Teacher-Parent Communications
├─ Task: Oversee platform usage and engagement
├─ Access: Communications Dashboard
├─ View:
│  ├─ Today's messages: 23
│  ├─ Unanswered messages: 2 (⚠️ flag)
│  ├─ Teacher engagement: Ms. Johnson (95%), Mr. Patel (42%)
│  ├─ Parent engagement: 11/12 (92%)
│  └─ Issue: "Mrs. Kim hasn't logged in for 3 days"
├─ Pain Point: Wants to see communication patterns
├─ Action: Send reminder email to Mrs. Kim
└─ Emotion: Proactive management

Step 14: Review Institutional Reports
├─ Task: "Superintendent asked for enrollment report"
├─ Navigate to: Reports & Analytics
├─ Generate:
│  ├─ Enrollment by classroom
│  ├─ Teacher coverage (who has most students)
│  ├─ Communication engagement rates
│  ├─ Attendance trends
│  └─ Student progress by classroom
├─ Export: Report as PDF
├─ Send: To superintendent
└─ Emotion: "Reporting is now fast and data-driven"

Step 15: Address Classroom Issues
├─ Scenario: Ms. Johnson reports "Emma is struggling"
├─ Actions:
│  ├─ View: Emma's progress data
│  ├─ See: Recent teacher notes and assessments
│  ├─ Message: Emma's parent directly
│  ├─ Arrange: In-person meeting with teacher and parent
│  └─ Document: Action plan
├─ Pain Point: Needs secure record of concerns
└─ Outcome: Collaborative support plan created
```

#### PHASE 7: END OF WEEK/MONTH
```
Step 16: Check Communication Bottlenecks
├─ View: Which parent-teacher pairs haven't communicated
├─ Action: Send reminders to increase engagement
├─ Decision: "Does Ms. Johnson need professional development in parent communication?"
└─ Outcome: Professional development scheduled

Step 17: Review Attendance Patterns
├─ Task: "Are we meeting enrollment targets?"
├─ View:
│  ├─ Average daily attendance per classroom
│  ├─ Students with chronic absences
│  ├─ Seasonal trends
│  └─ Comparison to previous months
├─ Action: Contact parents of chronically absent students
├─ Pain Point: Wants predictive analytics
└─ Outcome: 2 families contacted, 1 withdrawal processed

Step 18: User Access Review
├─ Task: "Is everyone who should have access still active?"
├─ Review:
│  ├─ Teacher list: All current + identify departing staff
│  ├─ Parent list: Confirm all still enrolled
│  └─ Identify: Unused accounts to deactivate
├─ Action: Deactivate Mrs. Chen's account (moved schools)
└─ Outcome: Access cleaned up, security maintained
```

#### PHASE 8: PAIN POINTS & DECISION MOMENTS
```
Decision Points Summary:
✓ "How do I link parents to the right children?" → Clear UI flow
✗ "Can I bulk-import parent data?" → Currently manual (future feature)
✓ "How do I know if teachers are using the system?" → Engagement dashboard
✗ "Can I see which teacher is struggling?" → Needs student performance dashboard
✓ "How do I secure sensitive parent information?" → Role-based data isolation
✓ "Can I generate reports for my supervisor?" → PDF export available

Emotional Arc:
Start: Excited but uncertain
Mid-first-use: Confident and capable
Daily operations: Empowered and data-driven
End-of-month: Strategic and confident
```

---

### JOURNEY 3: TEACHER (Educator)

**WHO:** Classroom teacher responsible for daily student management, progress tracking, and parent communication for their assigned class(es).

**KEY GOALS:**
- Record daily attendance and participation quickly
- Document student progress and share with parents
- Communicate with parents about their child's development
- Maintain organized classroom records
- Minimize administrative burden so they can focus on teaching

---

#### PHASE 1: FIRST LOGIN & ROLE DISCOVERY
```
Step 1: Receive Onboarding Email
├─ From: Admin (Ms. Principal)
├─ Content:
│  ├─ "You've been added to Gumpo classroom management system"
│  ├─ Temporary password provided
│  ├─ Quick start guide link
│  └─ Class assignment: "Nursery A - 4 students"
├─ Emotion: Cautious about learning new system
├─ Pain Point: Already have too many logins
└─ Motivation: "Will this actually make my job easier?"

Step 2: Login to Platform
├─ Navigate to: http://localhost:3000/auth/login
├─ Enter: Admin-provided email and temporary password
├─ System recognizes: Teacher role → TEACHER
├─ Auto-routes to: /dashboard/teacher
└─ First impression: "This is for me!"

Step 3: Teacher Dashboard Overview
├─ View: "Welcome, Ms. Johnson!"
├─ Sections:
│  ├─ My Classes: "Nursery A (4 students)"
│  ├─ Quick Actions (highlighted):
│  │  ├─ 📋 Record Attendance (top priority)
│  │  ├─ 📊 Update Grades
│  │  ├─ 💬 Message Parents
│  │  └─ 📁 Upload Materials
│  ├─ Today's view:
│  │  ├─ "3 students marked present"
│  │  ├─ "1 student absent (marked by parent)"
│  │  └─ "No new parent messages"
│  └─ This week's focus: "You haven't logged daily reports yet"
├─ Emotion: "I can do this quickly during my prep period"
└─ Pain Point: Wants to minimize time in admin tool
```

#### PHASE 2: FIRST DAILY TASK - ATTENDANCE
```
Step 4: Record Morning Attendance
├─ Time: 8:45 AM (right when class starts)
├─ Task: Mark attendance for 4 students
├─ Navigate to: "Record Attendance"
├─ Process:
│  ├─ View: List of my 4 students
│  │  ├─ John Doe
│  │  ├─ Emma Lee
│  │  ├─ Michael Brown
│  │  └─ Sarah Kim
│  ├─ Quick-tick: Mark each as Present/Absent/Late
│  ├─ Note: Emma's parent pre-filled "Absent - Doctor appointment"
│  ├─ Sarah is Late (still driving)
│  ├─ Confirm: All 4 students marked
│  └─ Save: System confirms "Attendance recorded at 8:47 AM"
├─ Time spent: 30 seconds
├─ Emotion: "That was fast!"
└─ Pain Point: Could be even faster with a single-tap mobile interface

Step 5: Auto-Notification System
├─ Background: System sends parent updates
│  ├─ John's parent: "John marked present"
│  ├─ Sarah's parent: "Sarah marked late, ETA 8:55 AM"
│  └─ Emma's parent: "Absence confirmed"
├─ Teacher doesn't do this: System handles it
└─ Emotion: "I didn't have to call or text anyone!"
```

#### PHASE 3: DAILY DOCUMENTATION - LOGS & NOTES
```
Step 6: Create Daily Log Entry
├─ Time: 12:30 PM (lunch break)
├─ Task: Document morning's activities
├─ Navigate to: "Daily Logs"
├─ Process:
│  ├─ View: Template for today
│  ├─ Fill:
│  │  ├─ Topic: "Circle time discussion about seasons"
│  │  ├─ Activity: "Sorting autumn leaves by color"
│  │  ├─ Duration: 45 minutes
│  │  ├─ Participation notes:
│  │  │  ├─ John: Very engaged, asked questions
│  │  │  ├─ Emma: Quiet today, seemed tired
│  │  │  ├─ Michael: Helped peers with sorting
│  │  │  └─ Sarah: Didn't participate, upset mood
│  │  ├─ Highlights: "Great peer cooperation"
│  │  ├─ Concerns: "Sarah's mood concerning - follow up?"
│  │  ├─ Photos: Upload 2 photos (leaf sorting activity)
│  │  └─ Submit: Save log entry
├─ Time spent: 8 minutes
├─ Pain Point: Wants voice-to-text for faster entry
└─ Emotion: "This log captures what I actually do"

Step 7: Update Individual Student Progress
├─ Task: Record today's observations
├─ Navigate to: "Student Progress" → "Emma"
├─ Fill:
│  ├─ Behavior: "Quiet today, less engaged than usual"
│  ├─ Social skills: "Played with John during free time"
│  ├─ Academic: "Participated in letter recognition"
│  ├─ Physical: "Balance activity was challenging"
│  └─ Notes: "Check in with parents - might have had bad night?"
├─ System suggests: "Would you like to message Emma's parent?"
├─ Emotion: "System is anticipating what I need"
└─ Action: Not now, will monitor tomorrow
```

#### PHASE 4: PARENT COMMUNICATION
```
Step 8: Message Parent About Concern
├─ Time: 3:15 PM (after school)
├─ Scenario: Sarah's mood seemed off
├─ Navigate to: "Messages" → "Sarah Kim's Parents"
├─ Compose:
│  ├─ "Hi Mrs. Kim,
│  ├─ I wanted to check in about Sarah today.
│  ├─ She seemed a bit upset during our leaf-sorting activity
│  ├─ and was less engaged than usual.
│  ├─ Is everything okay at home? 
│  ├─ Please let me know if there's anything
│  ├─ I should be aware of. Best, Ms. Johnson"
│  └─ Send: Attached link to today's daily log (with photos)
├─ Parent receives: Message + photo preview
├─ Response: Parent replies in 20 minutes
│  ├─ "Sarah was worried about her grandma,
│  ├─ who is in the hospital. We talked to her
│  ├─ about it this morning. She might be
│  ├─ quieter than usual. Thank you for noticing!"
├─ Pain Point: Teacher can't see prior messages easily
└─ Emotion: "I'm creating real partnership with parents"

Step 9: Share Positive Feedback
├─ Task: Celebrate Michael's helpfulness
├─ Navigate to: "Messages" → "Michael's Parents"
├─ Compose:
│  ├─ "Great news! Michael was very helpful
│  ├─ during leaf-sorting today, helping his friends
│  ├─ and showing leadership. I'm proud of him!"
│  └─ Attach: Photo of Michael helping peers
├─ System feature: Mark as "Positive feedback"
├─ Parent emotion: "My child had a good day!"
└─ Teacher emotion: "Parents feel connected to what happens here"
```

#### PHASE 5: GRADES & ASSESSMENTS
```
Step 10: Update Student Grades
├─ Task: Record today's learning assessment
├─ Navigate to: "Grades" → "Emma Lee"
├─ Assessments recorded:
│  ├─ Letter Recognition: B+ (4/5 letters correct)
│  ├─ Color Sorting: A (sorted correctly)
│  ├─ Participation: C+ (quiet, didn't volunteer)
│  ├─ Social Interaction: A (cooperative)
│  └─ Fine Motor: B (needed help with small pieces)
├─ Notes: "Good progress in color work. Need to encourage more verbal participation."
├─ System feature: Parent can now see grades
├─ Pain Point: Want feedback from specialists (speech, occupational therapy)
└─ Emotion: "This captures the whole child, not just academics"

Step 11: Review Week's Progress
├─ Time: 3:45 PM Friday
├─ Task: Create weekly summary for parents
├─ Navigate to: "Weekly Reports"
├─ Auto-compiled data:
│  ├─ Attendance: 5/5 days (100%)
│  ├─ Academic progress: Grades by subject
│  ├─ Social development: Notable moments
│  ├─ Participation trend: Graph shows ups and downs
│  ├─ Highlights: Photo gallery from the week
│  └─ Next week preview: "We're learning about animals"
├─ System feature: Auto-generates report
├─ Teacher's role: Review and add personal notes
├─ Pain Point: Could suggest individualized comments
└─ Send: Report to all 4 families
```

#### PHASE 6: CLASS MATERIALS & PLANNING
```
Step 12: Upload Classroom Materials
├─ Task: Share coloring sheet for homework
├─ Navigate to: "Materials" → "This Week"
├─ Upload:
│  ├─ File: "Autumn_Leaves_Coloring.pdf"
│  ├─ Description: "Color in the different autumn leaves"
│  ├─ For: "Take-home activity"
│  ├─ Linked to: "Leaf sorting lesson from Monday"
│  └─ Share with: "All families in Nursery A"
├─ Parents receive: PDF download link
├─ Pain Point: Parents often lose papers - digital is much better
└─ Emotion: "Resources are organized and accessible"

Step 13: Plan Next Week
├─ Task: Set up structure for animal unit
├─ Navigate to: "Lesson Planning" (future feature)
├─ Preview: "Next week topics"
│  ├─ Mon: Introduce farm animals
│  ├─ Tue: Animal sounds and movements
│  ├─ Wed: Field trip to farm
│  ├─ Thu: Animal crafts
│  └─ Fri: Animal stories and wrap-up
├─ System provides: Pre-made lesson plan template
└─ Teacher customizes: Based on class needs
```

#### PHASE 7: END OF DAY/WEEK REFLECTIONS
```
Step 14: Quick End-of-Day Reflection
├─ Time: 4:00 PM
├─ Navigate to: "Today's Summary"
├─ System shows:
│  ├─ ✓ Attendance recorded
│  ├─ ✓ Daily log created with photos
│  ├─ ✓ 3 parent messages sent
│  ├─ ✓ Grades updated for Emma
│  ├─ ✓ Weekly report submitted
│  └─ ✓ Materials uploaded
├─ Time in system today: 22 minutes
├─ Emotion: "Didn't feel like admin work"
└─ Pain Point: Wants voice-note option for future days

Step 15: Review Week's Engagement
├─ Time: Friday 3:30 PM (prep period)
├─ View: "Class Engagement Dashboard"
├─ Data shown:
│  ├─ Parent response rate: 92% (4/4 families messaged)
│  ├─ Parent message response time: Avg 45 min
│  ├─ Most engaged parent: Emma's mom (5 messages)
│  ├─ Concern: Michael's parents haven't messaged
│  └─ Trend: Increasing parent engagement this week
├─ System nudge: "Michael's parents haven't responded - send check-in?"
├─ Action: Send friendly message
└─ Emotion: "I know exactly what's happening with each family"
```

#### PHASE 8: EMOTIONAL JOURNEY MAP
```
Morning (8:45 AM):
- Emotion: Rushed, getting class started
- System need: Fast attendance (30 seconds)
- Outcome: ✓ Attendance done, parents notified

Mid-day (12:30 PM):
- Emotion: Reflective, thinking about students
- System need: Easy documentation
- Outcome: ✓ Logs created with rich detail

Afternoon (3:15 PM):
- Emotion: Concerned about one student, proud of another
- System need: Easy parent communication
- Outcome: ✓ 2 messages sent, parent concerns addressed

End of day (4:00 PM):
- Emotion: Satisfied about connection with families
- System need: Quick summary of what's done
- Outcome: ✓ All daily tasks complete, time spent on teaching not admin

Friday:
- Emotion: Reflective, wanting to celebrate and plan
- System need: Weekly summary and insights
- Outcome: ✓ Reports sent, next week planned
```

---

### JOURNEY 4: PARENT (Guardian/Caregiver)

**WHO:** Working parent or guardian seeking quick, regular updates about their child's development, behavior, and learning without having to call the school or wait for paper reports.

**KEY GOALS:**
- See their child's daily progress and activities
- Communicate with teachers about concerns or celebrations
- Stay informed without being overwhelmed
- Know attendance and any behavioral issues immediately
- Feel connected to their child's learning journey

---

#### PHASE 1: INVITATION & FIRST LOGIN
```
Step 1: Receive Onboarding Email
├─ From: Nursery Admin (Ms. Principal)
├─ Trigger: Child enrolled in Nursery A
├─ Content:
│  ├─ "Welcome! Your child is now in our system"
│  ├─ "You can access daily progress updates in Gumpo"
│  ├─ "Temporary password: [temp123]"
│  ├─ "Quick tutorial video (2 minutes)"
│  └─ "Your child: John Doe, Age 3, Nursery A"
├─ Emotion: Excited and slightly nervous
├─ Pain Point: Yet another login to remember
└─ Motivation: "Will help me stay connected"

Step 2: First Login
├─ Navigate to: http://localhost:3000/auth/login
├─ Enter: Admin-provided credentials
├─ System recognizes: Parent role → PARENT
├─ Data isolation: "I can only see John's information"
├─ Auto-routes to: /dashboard/parent
├─ First impression: "This is customized for me"
└─ Emotion: "I don't see other children's data - good security"

Step 3: Parent Dashboard Overview
├─ View: "Welcome, John's Mom!"
├─ Main sections:
│  ├─ Child Profile:
│  │  ├─ Name: John Doe
│  │  ├─ Age: 3 years old
│  │  ├─ Class: Nursery A
│  │  ├─ Teacher: Ms. Johnson
│  │  └─ Status: ✓ Checked in today
│  ├─ Quick Stats (Today):
│  │  ├─ ✓ Present (arrived 8:50 AM)
│  │  ├─ No new messages
│  │  ├─ Latest activity: "Circle time - leaf sorting"
│  │  └─ Last update: 30 minutes ago
│  ├─ Navigation options:
│  │  ├─ View Progress
│  │  ├─ Check Attendance
│  │  ├─ View Grades
│  │  ├─ Message Teacher
│  │  └─ View Photos
│  └─ Design note: "Everything I need is here - nothing extra"
├─ Emotion: Relief - "I can check in on my child anytime"
└─ Pain Point: Want instant notification of updates
```

#### PHASE 2: DAILY UPDATES & PROGRESS VIEWING
```
Step 4: Check Daily Progress (Morning)
├─ Time: 9:15 AM (at work, during coffee break)
├─ Trigger: Want to confirm John arrived safely
├─ Quick check: Dashboard shows
│  ├─ ✓ "John checked in at 8:50 AM"
│  ├─ "Currently in circle time"
│  └─ "Everything going great"
├─ Emotion: Reassured
└─ Time spent: 15 seconds

Step 5: Check Daily Progress (Afternoon)
├─ Time: 12:30 PM (lunch break)
├─ Action: Click "View Today's Activities"
├─ Sees:
│  ├─ Photos: 3 photos from leaf-sorting activity
│  ├─ Daily Log: "Circle time - autumn leaves, great engagement"
│  ├─ Teacher note: "John asked lots of questions today!"
│  ├─ Mood indicator: Happy 😊 (from teacher observation)
│  └─ What's next: "Afternoon snack, quiet time"
├─ Emotion: "I'm present in his day even though I can't be there"
├─ Share: Mom forwards photos to Dad and Grandma
└─ Time spent: 2 minutes

Step 6: Check Weekly Progress Summary
├─ Time: Friday evening
├─ View: Week recap automatically sent
├─ Contains:
│  ├─ Attendance: 5/5 days (100%)
│  ├─ Highlights: "Excellent participation in all activities"
│  ├─ Photos: Gallery from the entire week
│  ├─ Progress report:
│  │  ├─ Letter recognition: Knows A, B, C now
│  │  ├─ Social skills: "Shared toys, helped others"
│  │  ├─ Physical: "Great climbing skills"
│  │  └─ Next week: "Learning about farm animals"
│  ├─ Trend note: "Growing more confident each day"
│  └─ Teacher closing: "Love working with John!"
├─ Emotion: Proud and connected
└─ Pain Point: Wish could see video snippets, not just photos
```

#### PHASE 3: COMMUNICATING WITH TEACHER
```
Step 7: Send Good Morning Message
├─ Time: 8:30 AM (before dropping off)
├─ Situation: John had a bad night (wouldn't sleep)
├─ Navigate to: "Messages" → "Ms. Johnson"
├─ Compose:
│  ├─ "Good morning! Just wanted to let you know
│  ├─ John had a rough night and is a bit tired today.
│  ├─ He might be emotional or need extra patience.
│  ├─ Thank you for understanding!"
│  └─ Send
├─ System feature: Message appears in teacher's dashboard
├─ Teacher response: Arrives by 9:15 AM
│  ├─ "Thanks for the heads up!
│  ├─ I'll keep an extra eye on him.
│  ├─ We'll have a great day. 💙"
├─ Emotion: "Teacher is on my team"
└─ Pain Point: None - this was perfect

Step 8: Ask Teacher a Question
├─ Time: 2:00 PM (afternoon, at work)
├─ Situation: Wondering about eating habits
├─ Navigate to: "Messages" → "Ms. Johnson"
├─ Compose:
│  ├─ "Quick question - how is John eating?
│  ├─ He's been picky with vegetables at home.
│  ├─ Does he eat well at school?"
│  └─ Send
├─ Teacher response: Arrives by 3:00 PM
│  ├─ "He eats really well here!
│  ├─ Had all his snack today.
│  ├─ Especially likes the fruit.
│  ├─ Maybe try making veggies fun at home too?"
├─ Emotion: "I learned something useful"
├─ Action: Will try fun veggie presentation at home
└─ Pain Point: Response time is great (1 hour)

Step 9: Receive Concern from Teacher
├─ Time: 2:45 PM (received alert)
├─ Scenario: Teacher noticed something
├─ Notification: "Ms. Johnson sent you a message"
├─ Message:
│  ├─ "Hi! I wanted to check in about John.
│  ├─ He seemed upset during play time
│  ├─ and didn't want to join in.
│  ├─ This isn't like him. Is everything okay?
│  ├─ Saw the note about rough night.
│  ├─ Please let me know if I can help."
├─ Parent emotion: Grateful for teacher's awareness
├─ Response:
│  ├─ "Thanks for noticing. Yes, rough night.
│  ├─ We talked about missing Grandpa today.
│  ├─ He'll probably need some extra love.
│  ├─ Let me know if he brightens up."
│  └─ Send
├─ System captures: Reason for mood (in John's record)
└─ Emotion: "Teacher really cares"
```

#### PHASE 4: MONITORING ATTENDANCE & HEALTH
```
Step 10: Plan Absence (Holiday)
├─ Time: Monday morning, before school
├─ Scenario: Family vacation planned
├─ Navigate to: "Attendance" → "Report Absence"
├─ Fill:
│  ├─ Date: March 15-19
│  ├─ Reason: "Family vacation - beach trip"
│  ├─ Expected return: "March 20"
│  └─ Notes: "Will miss you!"
├─ Action: Submit absence notification
├─ System notifies: Teacher automatically sees planned absence
├─ Teacher can plan: "No John March 15-19"
└─ Emotion: "Teacher knows we'll be gone"

Step 11: Report Sick Day
├─ Time: 7:45 AM (urgent)
├─ Situation: John has fever, can't attend
├─ Navigate to: "Quick Absence Report"
├─ Fill:
│  ├─ Status: "Sick"
│  ├─ Likely duration: "1-2 days"
│  └─ Details: "Low fever, sleeping now"
├─ Send: Immediately
├─ System notifies:
│  ├─ Teacher gets alert: "John won't be in today"
│  ├─ Admin gets notification (attendance tracking)
│  └─ Parent confirmation: "Absence received"
├─ Follow-up: Teacher messages
│  ├─ "Hope John feels better soon!
│  ├─ Missing him already. 💙"
└─ Emotion: "Absence reported efficiently"

Step 12: View Attendance Record
├─ Time: End of month
├─ Navigate to: "Attendance" → "This Month"
├─ See:
│  ├─ Days attended: 18/20
│  ├─ Absences: 1 (vacation) + 1 (sick day)
│  ├─ Tardiness: 0 (always on time!)
│  └─ Trend: Consistent attendance
├─ Note: Month note shows "Perfect attendance except planned events"
└─ Pain Point: Want notification if John is late pickup
```

#### PHASE 5: GRADES & PROGRESS TRACKING
```
Step 13: Review Student Progress Report
├─ Time: Mid-week
├─ Navigate to: "Progress" → "Development Areas"
├─ See by category:
│  ├─ Academic:
│  │  ├─ Letter Recognition: B (knows 3/26 letters)
│  │  ├─ Number Counting: A (counts to 10)
│  │  ├─ Color Knowledge: A (knows all primary colors)
│  │  └─ Trend: "Making strong progress"
│  ├─ Social-Emotional:
│  │  ├─ Sharing: B (sometimes shares, sometimes struggles)
│  │  ├─ Following directions: A (excellent listener)
│  │  ├─ Emotional control: B (can get frustrated)
│  │  └─ Peer interaction: A (makes friends easily)
│  ├─ Physical:
│  │  ├─ Fine motor: B (pencil grip developing)
│  │  ├─ Gross motor: A (runs, climbs with confidence)
│  │  └─ Trend: "Very coordinated for age"
│  └─ Self-care:
│  │  ├─ Bathroom independence: A (dry all day!)
│  │  ├─ Eating skills: B (fork use developing)
│  │  └─ Personal hygiene: B (needs reminders)
├─ Parent insight: "Comprehensive view of whole child"
├─ Comparison: "None - no pressure to compete"
└─ Emotion: "Knowing specific areas to work on at home"

Step 14: Ask for Developmental Guidance
├─ Time: After reviewing progress
├─ Situation: Concerned about emotional control
├─ Message to teacher:
│  ├─ "I see John sometimes struggles with frustration.
│  ├─ What can I do at home to help?
│  ├─ Any specific strategies you're using?"
├─ Teacher response:
│  ├─ "Great question! We use a 'calm corner'
│  ├─ where he can take a break when frustrated.
│  ├─ Try this at home too. Also, naming
│  ├─ emotions helps. 'I see you're frustrated.'
│  ├─ Here are 3 resources... [links]"
├─ Parent gains: Actionable strategies
└─ Emotion: "I'm his teacher, too"
```

#### PHASE 6: RECEIVING & SHARING CELEBRATIONS
```
Step 15: Get Positive Milestone Notification
├─ Time: Friday afternoon
├─ Notification: "Ms. Johnson has great news!"
├─ Message:
│  ├─ "Guess what? John finally rode
│  ├─ the bike without training wheels today!
│  ├─ So proud of his persistence!
│  ├─ He's a big kid now! 🚲"
│  └─ Photo: John on bike, big smile
├─ Parent reaction: Excited and emotional
├─ Share: Photo sent to Dad and Grandparents
├─ Respond to teacher:
│  ├─ "That's amazing!!!
│  ├─ He mentioned trying but I didn't know
│  ├─ he'd succeeded! This is huge!
│  ├─ Thank you for pushing him!
│  ├─ See you Monday with big news to celebrate!"
└─ Emotion: Connected to his growth journey

Step 16: Send Teacher Appreciation
├─ Time: End of month
├─ Situation: Feeling grateful for all teacher does
├─ Navigate to: "Messages"
├─ Compose appreciation:
│  ├─ "I just wanted to say thank you.
│  ├─ The way you document John's day
│  ├─ and share it with me makes me feel
│  ├─ like I'm part of his journey.
│  ├─ The communication means so much.
│  ├─ He talks about you constantly!
│  ├─ Grateful for you. 💙"
│  └─ Send
├─ Teacher response: Emotional and warm
└─ Emotion: Strengthened relationship
```

#### PHASE 7: END OF MONTH REFLECTIONS
```
Step 17: Review Monthly Summary
├─ Time: Last day of month
├─ System auto-generates:
│  ├─ All-month photos gallery (30 images)
│  ├─ Progress in each development area
│  ├─ Attendance: 18/20 (90%)
│  ├─ Messages exchanged with teacher: 12
│  ├─ Milestones achieved: Bike riding, letter B recognition
│  ├─ Teacher's monthly note: "John had an amazing month..."
│  └─ Next month preview: "Farm animals unit coming!"
├─ Parent action: Save/print for keepsake
└─ Emotion: Amazed at how much grew in 30 days

Step 18: Look Ahead to Next Month
├─ Notification: "Farm animals unit starts Monday!"
├─ Preview:
│  ├─ Mon: Farm introduction
│  ├─ Tue: Animal sounds
│  ├─ Wed: Field trip to actual farm
│  ├─ Thu: Craft day
│  ├─ Fri: Wrap-up stories
│  └─ Might want to: Read farm books at home
├─ Parent planning: "We'll visit the zoo this weekend"
└─ Emotion: Excited for what's coming
```

#### PHASE 8: EMOTIONAL JOURNEY MAP
```
Day 1 (Enrollment):
- Emotion: Nervous and eager
- System need: Easy login, clear dashboard
- Outcome: ✓ Comfort that I can check anytime

During week:
- Morning emotion: Peace of mind (he arrived safely)
- Afternoon emotion: Connected (seeing photos and updates)
- Evening emotion: Informed (knowing his day)

Problem moment:
- Emotion: Concerned (rough night, needs understanding)
- System need: Easy communication with teacher
- Outcome: ✓ Problem addressed as partnership

Progress review:
- Emotion: Proud and engaged
- System need: Clear, understandable progress data
- Outcome: ✓ Knowing specific areas to help with

Milestone moment:
- Emotion: Celebratory and grateful
- System need: Photo and message from teacher
- Outcome: ✓ Feeling part of his growth journey

End of month:
- Emotion: Amazed and connected
- System need: Summary and keepsake
- Outcome: ✓ Precious record of development
```

---

## 3. CROSS-JOURNEY INSIGHTS

### **Key Moments Where Journeys Intersect:**

```
SUPER_ADMIN action → ADMIN role enabled → TEACHER logs in → 
PARENT sees their child's progress

Admin links parent to child → Parent gains access to dashboard → 
Teacher's content automatically appears for parent

Teacher records attendance → Admin sees engagement metrics → 
Parent gets automated notification

Teacher sends message → Parent responds → Admin monitors 
communication quality → SUPER_ADMIN audits interaction
```

### **Pain Points by Role:**

| Role | Primary Pain Points |
|------|-------------------|
| **SUPER_ADMIN** | Scalability across institutions, audit logging, preventing privilege escalation |
| **ADMIN** | Bulk data import, teacher engagement tracking, institutional reporting |
| **TEACHER** | Time in system, mobile interface, quick documentation methods |
| **PARENT** | Real-time notifications, video content, quick access on mobile |

### **Success Metrics by Role:**

```
SUPER_ADMIN success:
- System uptime >99.9%
- Zero unauthorized access attempts
- Role assignment accuracy 100%

ADMIN success:
- All parent-child links established within 1 week
- 100% teacher class assignments
- 95%+ parent-teacher communication rate

TEACHER success:
- Attendance recorded in <1 minute daily
- 100% of students have daily updates
- Parent response rate >80%

PARENT success:
- Daily access to child's progress
- Response to teacher message within 2 hours
- Feels informed and connected
```

---

## 4. IMPLEMENTATION PRIORITIES

**Phase 1 (MVP):** Parent-teacher messaging, daily logs, attendance
**Phase 2:** Grades/progress reporting, institutional analytics
**Phase 3:** Mobile app, video content, bulk data import
**Phase 4:** Advanced analytics, AI insights, integration with other systems
