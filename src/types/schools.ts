// TypeScript types for Schools Management

export type SchoolStatus = "Active" | "Trial" | "Suspended";
export type SubscriptionTier = "Starter" | "Growth" | "Professional" | "Enterprise";

export interface School {
  id: string;
  name: string;
  location: string | null;
  status: SchoolStatus;
  subscription_tier: SubscriptionTier;
  created_at: string;
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
  subscription_tier?: SubscriptionTier;
  account_status?: SchoolStatus;
}

export interface SchoolsStats {
  children: number;
  parents: number;
  teachers: number;
  admins: number;
}
