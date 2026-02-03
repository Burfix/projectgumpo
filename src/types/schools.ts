// TypeScript types for Schools Management

export type SchoolStatus = "Active" | "Trial" | "Suspended";
export type SubscriptionTier = "Starter" | "Growth" | "Professional" | "Enterprise";
export type SchoolType = "Preschool" | "Crèche" | "Primary" | "Other";

export interface School {
  id: number;
  name: string;
  city: string;
  type: string;
}

export interface SchoolWithStats extends School {
  children_count: number;
  parents_count: number;
  teachers_count: number;
  admins_count: number;
}

export interface CreateSchoolInput {
  name: string;
  location?: string;
  school_type: SchoolType;
  subscription_tier?: SubscriptionTier;
  account_status?: SchoolStatus;
}

export interface SchoolsStats {
  children: number;
  parents: number;
  teachers: number;
  admins: number;
}

export interface SystemCounters {
  total_schools: number;
  active_users: number;
}
