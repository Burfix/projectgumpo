// TypeScript types for the complete database schema

// ============================================================
// USER & AUTH TYPES
// ============================================================
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'PARENT';

export interface User {
  id: string; // UUID
  email: string;
  full_name: string;
  name?: string;
  role: UserRole;
  school_id: number | null; // BIGINT from schools table
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// SCHOOL TYPES
// ============================================================
export type SchoolStatus = 'Active' | 'Trial' | 'Suspended';
export type SubscriptionTier = 'Starter' | 'Growth' | 'Professional' | 'Enterprise';
export type SchoolType = 'Preschool' | 'Crèche' | 'Primary' | 'Other';

export interface School {
  id: number; // BIGSERIAL from schools table
  name: string;
  location?: string;
  city?: string;
  school_type?: SchoolType;
  principal_name?: string;
  principal_email?: string;
  phone_number?: string;
  subscription_tier: SubscriptionTier;
  account_status: SchoolStatus;
  child_count: number;
  teacher_count: number;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolWithStats extends School {
  children_count: number;
  parents_count: number;
  teachers_count: number;
  admins_count: number;
}

// ============================================================
// CLASSROOM TYPES
// ============================================================
export interface Classroom {
  id: number;
  name: string;
  school_id: number; // BIGINT references schools(id)
  capacity: number;
  age_group?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ClassroomWithStats extends Classroom {
  children_count: number;
  teachers: User[];
}

// ============================================================
// CHILD TYPES
// ============================================================
export type ChildStatus = 'active' | 'inactive' | 'graduated';
export type Gender = 'male' | 'female' | 'other';

export interface Child {
  id: number;
  school_id: number; // BIGINT references schools(id)
  classroom_id: number | null;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: Gender;
  allergies?: string;
  medical_notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  photo_url?: string;
  enrollment_date?: string;
  status: ChildStatus;
  created_at: string;
  updated_at: string;
}

export interface ChildWithDetails extends Child {
  classroom?: Classroom;
  parents?: User[];
}

// ============================================================
// JUNCTION TABLE TYPES
// ============================================================
export interface TeacherClassroom {
  id: number;
  teacher_id: string; // UUID
  classroom_id: number;
  is_primary: boolean;
  created_at: string;
}

export interface ParentChild {
  id: number;
  parent_id: string; // UUID
  child_id: number;
  relationship: 'parent' | 'guardian' | 'grandparent' | 'emergency_contact' | 'other';
  is_primary: boolean;
  can_pickup: boolean;
  created_at: string;
}

// ============================================================
// ATTENDANCE TYPES
// ============================================================
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'sick';

export interface AttendanceLog {
  id: number;
  child_id: number;
  classroom_id: number | null;
  school_id: number; // BIGINT references schools(id)
  logged_by: string; // UUID
  check_in_time?: string;
  check_out_time?: string;
  status: AttendanceStatus;
  notes?: string;
  date: string;
  created_at: string;
}

export interface AttendanceLogWithDetails extends AttendanceLog {
  child?: Child;
  logged_by_user?: User;
}

// ============================================================
// MEAL LOG TYPES
// ============================================================
export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner';
export type AmountEaten = 'all' | 'most' | 'some' | 'none' | 'refused';

export interface MealLog {
  id: number;
  child_id: number;
  classroom_id: number | null;
  school_id: number; // BIGINT references schools(id)
  logged_by: string; // UUID
  meal_type: MealType;
  amount_eaten?: AmountEaten;
  notes?: string;
  date: string;
  created_at: string;
}

export interface MealLogWithDetails extends MealLog {
  child?: Child;
}

// ============================================================
// NAP LOG TYPES
// ============================================================
export type NapQuality = 'good' | 'restless' | 'refused' | 'woke_early';

export interface NapLog {
  id: number;
  child_id: number;
  classroom_id: number | null;
  school_id: number; // BIGINT references schools(id)
  logged_by: string; // UUID
  start_time: string;
  end_time?: string;
  quality?: NapQuality;
  notes?: string;
  date: string;
  created_at: string;
}

export interface NapLogWithDetails extends NapLog {
  child?: Child;
  duration_minutes?: number;
}

// ============================================================
// INCIDENT REPORT TYPES
// ============================================================
export type IncidentType = 'injury' | 'behavior' | 'health' | 'accident' | 'bite' | 'other';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface IncidentReport {
  id: number;
  child_id: number;
  classroom_id: number | null;
  school_id: number; // BIGINT references schools(id)
  reported_by: string; // UUID
  incident_type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  action_taken?: string;
  parent_notified: boolean;
  occurred_at: string;
  date: string;
  created_at: string;
}

export interface IncidentReportWithDetails extends IncidentReport {
  child?: Child;
  reported_by_user?: User;
}

// ============================================================
// DAILY ACTIVITY TYPES
// ============================================================
export type ActivityType = 'art' | 'music' | 'outdoor' | 'learning' | 'play' | 'story' | 'exercise' | 'other';

export interface DailyActivity {
  id: number;
  classroom_id: number;
  school_id: number; // BIGINT references schools(id)
  created_by: string; // UUID
  activity_type: ActivityType;
  title: string;
  description?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  created_at: string;
}

// ============================================================
// MESSAGE TYPES
// ============================================================
export type MessageType = 'direct' | 'announcement' | 'alert' | 'reminder';

export interface Message {
  id: number;
  school_id: number; // BIGINT references schools(id)
  sender_id: string; // UUID
  recipient_id?: string; // UUID
  classroom_id?: number;
  subject?: string;
  body: string;
  message_type: MessageType;
  is_read: boolean;
  created_at: string;
}

export interface MessageWithDetails extends Message {
  sender?: User;
  recipient?: User;
}

// ============================================================
// AUDIT LOG TYPES
// ============================================================
export interface AuditLog {
  id: number;
  user_id?: string; // UUID
  school_id?: number; // BIGINT references schools(id)
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  created_at: string;
}

// ============================================================
// DASHBOARD STAT TYPES
// ============================================================
export interface DashboardStats {
  total_children: number;
  present_today: number;
  absent_today: number;
  incidents_today: number;
  meals_logged_today: number;
  naps_logged_today: number;
}

export interface TeacherDashboardData {
  classroom: Classroom;
  children: ChildWithDetails[];
  attendance_today: AttendanceLog[];
  recent_incidents: IncidentReport[];
  activities_today: DailyActivity[];
}

export interface ParentDashboardData {
  children: ChildWithDetails[];
  attendance_history: AttendanceLog[];
  recent_meals: MealLog[];
  recent_naps: NapLog[];
  incidents: IncidentReport[];
  messages: Message[];
}

// ============================================================
// FORM INPUT TYPES
// ============================================================
export interface CreateChildInput {
  school_id: string;
  classroom_id?: number;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: Gender;
  allergies?: string;
  medical_notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface CreateAttendanceInput {
  child_id: number;
  classroom_id?: number;
  school_id: string;
  status: AttendanceStatus;
  check_in_time?: string;
  notes?: string;
}

export interface CreateMealLogInput {
  child_id: number;
  classroom_id?: number;
  school_id: string;
  meal_type: MealType;
  amount_eaten?: AmountEaten;
  notes?: string;
}

export interface CreateNapLogInput {
  child_id: number;
  classroom_id?: number;
  school_id: string;
  start_time: string;
  notes?: string;
}

export interface CreateIncidentInput {
  child_id: number;
  classroom_id?: number;
  school_id: string;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  action_taken?: string;
  occurred_at?: string;
}

export interface CreateSchoolInput {
  name: string;
  location?: string;
  city?: string;
  school_type?: SchoolType;
  subscription_tier?: SubscriptionTier;
  account_status?: SchoolStatus;
}
