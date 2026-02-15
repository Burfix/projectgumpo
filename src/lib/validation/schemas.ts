/**
 * Zod validation schemas for all application inputs
 * Provides type-safe validation for forms, API routes, and server actions
 */

import { z } from 'zod';

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

/**
 * Common field validations
 */
export const CommonSchemas = {
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be less than 72 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  phone: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .or(z.literal('')),

  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),

  uuid: z.string().uuid('Invalid ID format'),

  positiveInt: z.number().int().positive('Must be a positive number'),

  url: z.string().url('Invalid URL format').optional().or(z.literal('')),

  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
};

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

export const AuthSchemas = {
  /**
   * Sign in with email and password
   */
  signIn: z.object({
    email: CommonSchemas.email,
    password: z.string().min(1, 'Password is required'),
  }),

  /**
   * Sign up with email, password, and name
   */
  signUp: z.object({
    email: CommonSchemas.email,
    password: CommonSchemas.password,
    name: CommonSchemas.name,
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }),

  /**
   * Password reset request
   */
  resetPasswordRequest: z.object({
    email: CommonSchemas.email,
  }),

  /**
   * Password reset with new password
   */
  resetPassword: z.object({
    password: CommonSchemas.password,
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }),

  /**
   * Change password (requires old password)
   */
  changePassword: z.object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: CommonSchemas.password,
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }).refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ['newPassword'],
  }),
};

// ============================================================================
// SCHOOL SCHEMAS
// ============================================================================

export const SchoolType = z.enum([
  'Preschool',
  'Daycare',
  'Crèche',
  'Nursery School',
]);

export const SchoolSchemas = {
  /**
   * Create a new school
   */
  create: z.object({
    name: z.string()
      .min(1, 'School name is required')
      .max(200, 'School name must be less than 200 characters')
      .trim(),
    city: z.string()
      .min(1, 'City is required')
      .max(100, 'City must be less than 100 characters')
      .trim(),
    type: SchoolType,
    address: z.string().max(500, 'Address must be less than 500 characters').optional(),
    phone: CommonSchemas.phone,
  }),

  /**
   * Update school details
   */
  update: z.object({
    schoolId: CommonSchemas.positiveInt,
    name: z.string()
      .min(1, 'School name is required')
      .max(200, 'School name must be less than 200 characters')
      .trim()
      .optional(),
    city: z.string()
      .max(100, 'City must be less than 100 characters')
      .trim()
      .optional(),
    type: SchoolType.optional(),
    address: z.string().max(500, 'Address must be less than 500 characters').optional(),
    phone: CommonSchemas.phone,
  }),
};

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const UserRole = z.enum([
  'SUPER_ADMIN',
  'ADMIN',
  'PRINCIPAL',
  'SECONDARY_PRINCIPAL',
  'TEACHER',
  'PARENT',
]);

export const UserSchemas = {
  /**
   * Create a new user
   */
  create: z.object({
    email: CommonSchemas.email,
    name: CommonSchemas.name,
    role: UserRole,
    schoolId: CommonSchemas.positiveInt,
    phone: CommonSchemas.phone,
    sendInvite: z.boolean().optional().default(false),
  }),

  /**
   * Update user details
   */
  update: z.object({
    userId: CommonSchemas.uuid,
    schoolId: CommonSchemas.positiveInt,
    name: CommonSchemas.name.optional(),
    phone: CommonSchemas.phone,
    role: UserRole.optional(),
  }),

  /**
   * Allocate principal to school
   */
  allocatePrincipal: z.object({
    principalId: CommonSchemas.uuid.optional(),
    schoolId: CommonSchemas.positiveInt,
    email: CommonSchemas.email.optional(),
    name: CommonSchemas.name.optional(),
    phone: CommonSchemas.phone,
  }).refine(
    (data) => data.principalId || (data.email && data.name),
    {
      message: 'Either principalId or email and name must be provided',
      path: ['principalId'],
    }
  ),
};

// ============================================================================
// CHILD SCHEMAS
// ============================================================================

export const ChildSchemas = {
  /**
   * Create a new child
   */
  create: z.object({
    first_name: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters')
      .trim(),
    last_name: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters')
      .trim(),
    date_of_birth: CommonSchemas.date,
    medical_info: z.string()
      .max(1000, 'Medical info must be less than 1000 characters')
      .optional()
      .or(z.literal('')),
    allergies: z.string()
      .max(500, 'Allergies must be less than 500 characters')
      .optional()
      .or(z.literal('')),
    emergency_contact_name: z.string()
      .max(100, 'Emergency contact name must be less than 100 characters')
      .optional()
      .or(z.literal('')),
    emergency_contact_phone: CommonSchemas.phone,
    classroom_id: CommonSchemas.positiveInt.optional(),
    schoolId: CommonSchemas.positiveInt,
  }),

  /**
   * Update child details
   */
  update: z.object({
    childId: CommonSchemas.positiveInt,
    schoolId: CommonSchemas.positiveInt,
    first_name: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters')
      .trim()
      .optional(),
    last_name: z.string()
      .max(50, 'Last name must be less than 50 characters')
      .trim()
      .optional(),
    date_of_birth: CommonSchemas.date.optional(),
    medical_info: z.string()
      .max(1000, 'Medical info must be less than 1000 characters')
      .optional(),
    allergies: z.string()
      .max(500, 'Allergies must be less than 500 characters')
      .optional(),
    emergency_contact_name: z.string()
      .max(100, 'Emergency contact name must be less than 100 characters')
      .optional(),
    emergency_contact_phone: CommonSchemas.phone,
    classroom_id: CommonSchemas.positiveInt.optional().nullable(),
  }),

  /**
   * Assign child to classroom
   */
  assignClassroom: z.object({
    childId: CommonSchemas.positiveInt,
    classroomId: CommonSchemas.positiveInt,
    schoolId: CommonSchemas.positiveInt,
  }),

  /**
   * Assign parent to child
   */
  assignParent: z.object({
    childId: CommonSchemas.positiveInt,
    parentId: CommonSchemas.uuid,
    schoolId: CommonSchemas.positiveInt,
  }),
};

// ============================================================================
// CLASSROOM SCHEMAS
// ============================================================================

export const ClassroomSchemas = {
  /**
   * Create a new classroom
   */
  create: z.object({
    name: z.string()
      .min(1, 'Classroom name is required')
      .max(100, 'Classroom name must be less than 100 characters')
      .trim(),
    capacity: z.number()
      .int('Capacity must be a whole number')
      .min(1, 'Capacity must be at least 1')
      .max(100, 'Capacity must be less than 100'),
    schoolId: CommonSchemas.positiveInt,
  }),

  /**
   * Update classroom details
   */
  update: z.object({
    classroomId: CommonSchemas.positiveInt,
    schoolId: CommonSchemas.positiveInt,
    name: z.string()
      .min(1, 'Classroom name is required')
      .max(100, 'Classroom name must be less than 100 characters')
      .trim()
      .optional(),
    capacity: z.number()
      .int('Capacity must be a whole number')
      .min(1, 'Capacity must be at least 1')
      .max(100, 'Capacity must be less than 100')
      .optional(),
  }),

  /**
   * Assign teacher to classroom
   */
  assignTeacher: z.object({
    classroomId: CommonSchemas.positiveInt,
    teacherId: CommonSchemas.uuid,
    schoolId: CommonSchemas.positiveInt,
    isPrimary: z.boolean().optional().default(false),
  }),

  /**
   * Remove teacher from classroom
   */
  removeTeacher: z.object({
    classroomId: CommonSchemas.positiveInt,
    teacherId: CommonSchemas.uuid,
    schoolId: CommonSchemas.positiveInt,
  }),
};

// ============================================================================
// ACTIVITY SCHEMAS (Meals, Naps, Attendance, Incidents)
// ============================================================================

export const ActivitySchemas = {
  /**
   * Log a meal
   */
  meal: z.object({
    childId: CommonSchemas.positiveInt,
    classroomId: CommonSchemas.positiveInt,
    meal_type: z.enum(['breakfast', 'lunch', 'snack', 'dinner']),
    food_items: z.string()
      .min(1, 'Food items are required')
      .max(500, 'Food items must be less than 500 characters'),
    amount_eaten: z.enum(['none', 'some', 'most', 'all']),
    notes: z.string()
      .max(500, 'Notes must be less than 500 characters')
      .optional()
      .or(z.literal('')),
    schoolId: CommonSchemas.positiveInt,
  }),

  /**
   * Log a nap
   */
  nap: z.object({
    childId: CommonSchemas.positiveInt,
    classroomId: CommonSchemas.positiveInt,
    start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
    notes: z.string()
      .max(500, 'Notes must be less than 500 characters')
      .optional()
      .or(z.literal('')),
    schoolId: CommonSchemas.positiveInt,
  }).refine((data) => data.end_time > data.start_time, {
    message: 'End time must be after start time',
    path: ['end_time'],
  }),

  /**
   * Log attendance
   */
  attendance: z.object({
    childId: CommonSchemas.positiveInt,
    classroomId: CommonSchemas.positiveInt,
    status: z.enum(['present', 'absent', 'late', 'sick']),
    check_in_time: z.string()
      .regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)')
      .optional(),
    check_out_time: z.string()
      .regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)')
      .optional(),
    notes: z.string()
      .max(500, 'Notes must be less than 500 characters')
      .optional()
      .or(z.literal('')),
    schoolId: CommonSchemas.positiveInt,
  }),

  /**
   * Report an incident
   */
  incident: z.object({
    childId: CommonSchemas.positiveInt,
    classroomId: CommonSchemas.positiveInt,
    incident_type: z.enum(['injury', 'illness', 'behavior', 'other']),
    description: z.string()
      .min(10, 'Description must be at least 10 characters')
      .max(2000, 'Description must be less than 2000 characters'),
    action_taken: z.string()
      .max(1000, 'Action taken must be less than 1000 characters')
      .optional()
      .or(z.literal('')),
    photo_url: CommonSchemas.url,
    notify_parent: z.boolean().default(true),
    schoolId: CommonSchemas.positiveInt,
  }),
};

// ============================================================================
// NOTIFICATION SCHEMAS
// ============================================================================

export const NotificationSchemas = {
  /**
   * Send a notification
   */
  send: z.object({
    userId: CommonSchemas.uuid,
    title: z.string()
      .min(1, 'Title is required')
      .max(100, 'Title must be less than 100 characters'),
    message: z.string()
      .min(1, 'Message is required')
      .max(500, 'Message must be less than 500 characters'),
    type: z.enum(['info', 'warning', 'success', 'error']).default('info'),
    schoolId: CommonSchemas.positiveInt,
  }),

  /**
   * Update notification preferences
   */
  preferences: z.object({
    email_enabled: z.boolean().default(true),
    push_enabled: z.boolean().default(true),
    sms_enabled: z.boolean().default(false),
    attendance_alerts: z.boolean().default(true),
    incident_alerts: z.boolean().default(true),
    meal_alerts: z.boolean().default(false),
    nap_alerts: z.boolean().default(false),
  }),
};

// ============================================================================
// FILE UPLOAD SCHEMAS
// ============================================================================

export const FileSchemas = {
  /**
   * Upload file metadata
   */
  upload: z.object({
    fileName: z.string()
      .min(1, 'File name is required')
      .max(255, 'File name must be less than 255 characters')
      .regex(/^[a-zA-Z0-9_\-\.]+$/, 'Invalid file name format'),
    fileType: z.string()
      .regex(/^image\/(jpeg|jpg|png|gif|webp)$/, 'Only image files are allowed'),
    fileSize: z.number()
      .int()
      .positive()
      .max(5 * 1024 * 1024, 'File size must be less than 5MB'),
  }),
};

// ============================================================================
// SEARCH & PAGINATION SCHEMAS
// ============================================================================

export const SearchSchemas = {
  /**
   * General search query
   */
  search: z.object({
    query: z.string()
      .max(200, 'Search query must be less than 200 characters')
      .optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  }),
};

// ============================================================================
// SUPER ADMIN SCHEMAS
// ============================================================================

export const SuperAdminSchemas = {
  /**
   * Update user role
   */
  updateUserRole: z.object({
    userId: CommonSchemas.uuid,
    action: z.literal('update_role'),
    value: UserRole,
  }),

  /**
   * Update user status
   */
  updateUserStatus: z.object({
    userId: CommonSchemas.uuid,
    action: z.literal('update_status'),
    value: z.enum(['active', 'inactive', 'suspended']),
  }),

  /**
   * Assign user to school
   */
  assignUserToSchool: z.object({
    userId: CommonSchemas.uuid,
    action: z.literal('assign_school'),
    value: CommonSchemas.positiveInt,
  }),
};

// ============================================================================
// MESSAGE SCHEMAS
// ============================================================================

export const MessageSchemas = {
  /**
   * Mark message as read
   */
  markRead: z.object({
    messageId: CommonSchemas.positiveInt,
  }),

  /**
   * Send a message
   */
  send: z.object({
    recipientId: CommonSchemas.uuid,
    subject: z.string()
      .min(1, 'Subject is required')
      .max(200, 'Subject must be less than 200 characters')
      .trim(),
    body: z.string()
      .min(1, 'Message body is required')
      .max(5000, 'Message body must be less than 5000 characters')
      .trim(),
  }),
};

// ============================================================================
// INVITE SCHEMAS
// ============================================================================

export const InviteSchemas = {
  /**
   * Invite teacher to school
   */
  teacher: z.object({
    email: CommonSchemas.email,
    name: CommonSchemas.name,
  }),

  /**
   * Invite parent to school
   */
  parent: z.object({
    email: CommonSchemas.email,
    name: CommonSchemas.name,
    phone: CommonSchemas.phone,
  }),
};

// ============================================================================
// PARENT SCHEMAS (Admin Operations)
// ============================================================================

export const ParentSchemas = {
  /**
   * Link parent to child
   */
  linkChild: z.object({
    parentId: CommonSchemas.uuid,
    childId: CommonSchemas.positiveInt,
    schoolId: CommonSchemas.positiveInt,
    relationship: z.enum(['mother', 'father', 'guardian', 'other']).optional(),
  }),

  /**
   * Unlink parent from child
   */
  unlinkChild: z.object({
    parentId: CommonSchemas.uuid,
    childId: CommonSchemas.positiveInt,
    schoolId: CommonSchemas.positiveInt,
  }),
};

// ============================================================================
// SETTINGS SCHEMAS
// ============================================================================

export const SettingsSchemas = {
  /**
   * Update school settings
   */
  update: z.object({
    schoolId: CommonSchemas.positiveInt,
    school_name: z.string().min(1).max(200).optional(),
    contact_email: CommonSchemas.email.optional(),
    contact_phone: CommonSchemas.phone,
    address: z.string().max(500).optional(),
    operating_hours: z.string().max(100).optional(),
    notification_preferences: z.object({
      attendance_alerts: z.boolean().optional(),
      incident_alerts: z.boolean().optional(),
      daily_summary_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    }).optional(),
  }),
};

// ============================================================================
// BILLING SCHEMAS
// ============================================================================

export const BillingSchemas = {
  /**
   * Generate billing report
   */
  report: z.object({
    startDate: CommonSchemas.date.optional(),
    endDate: CommonSchemas.date.optional(),
    schoolId: CommonSchemas.positiveInt.optional(),
  }),
};

// ============================================================================
// EXPORT ALL SCHEMAS
// ============================================================================

export const ValidationSchemas = {
  common: CommonSchemas,
  auth: AuthSchemas,
  school: SchoolSchemas,
  user: UserSchemas,
  child: ChildSchemas,
  classroom: ClassroomSchemas,
  activity: ActivitySchemas,
  notification: NotificationSchemas,
  file: FileSchemas,
  search: SearchSchemas,
};

// Type exports for TypeScript inference
export type SignInInput = z.infer<typeof AuthSchemas.signIn>;
export type SignUpInput = z.infer<typeof AuthSchemas.signUp>;
export type CreateSchoolInput = z.infer<typeof SchoolSchemas.create>;
export type UpdateSchoolInput = z.infer<typeof SchoolSchemas.update>;
export type CreateUserInput = z.infer<typeof UserSchemas.create>;
export type UpdateUserInput = z.infer<typeof UserSchemas.update>;
export type CreateChildInput = z.infer<typeof ChildSchemas.create>;
export type UpdateChildInput = z.infer<typeof ChildSchemas.update>;
export type CreateClassroomInput = z.infer<typeof ClassroomSchemas.create>;
export type MealInput = z.infer<typeof ActivitySchemas.meal>;
export type NapInput = z.infer<typeof ActivitySchemas.nap>;
export type AttendanceInput = z.infer<typeof ActivitySchemas.attendance>;
export type IncidentInput = z.infer<typeof ActivitySchemas.incident>;
