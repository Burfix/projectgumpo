import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

interface School {
  id: number;
  name: string;
  location: string;
  principal_name: string;
  principal_email: string;
  subscription_tier: "Starter" | "Growth" | "Professional" | "Enterprise";
  account_status: "Active" | "Trial" | "Suspended";
  child_count: number;
  teacher_count: number;
  created_at: string;
}

interface Subscription {
  id: number;
  school_id: number;
  tier: string;
  monthly_price_zar: number;
  trial_start_date: string | null;
  trial_end_date: string | null;
  billing_status: "Trial" | "Active" | "Past Due";
  auto_renew: boolean;
}

interface AddOn {
  id: number;
  subscription_id: number;
  add_on_name: "photo_packs" | "sms_alerts" | "analytics" | "api_access";
  monthly_price_zar: number;
  enabled: boolean;
}

interface BillingReport {
  school_id: number;
  school_name: string;
  subscription_tier: string;
  monthly_price_zar: number;
  add_on_revenue: number;
  total_monthly_revenue: number;
  billing_status: string;
  trial_end_date: string | null;
}

/**
 * Create a server-side Supabase client
 */
async function createServerClient() {
  const cookieStore = await cookies();
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      auth: {
        storage: {
          getItem: (key) => {
            return cookieStore.get(key)?.value ?? null;
          },
          setItem: (key, value) => {
            cookieStore.set(key, value);
          },
          removeItem: (key) => {
            cookieStore.delete(key);
          },
        },
      },
    }
  );
}

/**
 * Get all schools with their stats
 */
export async function getSchools(): Promise<School[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching schools:", error);
    return [];
  }

  return data || [];
}

/**
 * Get a single school by ID
 */
export async function getSchoolById(schoolId: number): Promise<School | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .eq("id", schoolId)
    .single();

  if (error) {
    console.error("Error fetching school:", error);
    return null;
  }

  return data;
}

/**
 * Get subscription details for a school
 */
export async function getSubscriptionBySchoolId(
  schoolId: number
): Promise<Subscription | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found
    console.error("Error fetching subscription:", error);
  }

  return data || null;
}

/**
 * Get add-ons for a subscription
 */
export async function getAddOnsBySubscriptionId(
  subscriptionId: number
): Promise<AddOn[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("add_ons")
    .select("*")
    .eq("subscription_id", subscriptionId)
    .eq("enabled", true);

  if (error) {
    console.error("Error fetching add-ons:", error);
    return [];
  }

  return data || [];
}

/**
 * Generate comprehensive billing report
 */
export async function generateBillingReport(
  month?: string
): Promise<BillingReport[]> {
  const supabase = await createServerClient();

  // Fetch all schools with their current subscriptions
  const { data: schoolsData, error: schoolsError } = await supabase
    .from("schools")
    .select(
      `
      id,
      name,
      subscription_tier,
      subscriptions (
        id,
        tier,
        monthly_price_zar,
        billing_status,
        trial_end_date,
        add_ons (
          monthly_price_zar,
          enabled
        )
      )
    `
    );

  if (schoolsError) {
    console.error("Error generating billing report:", schoolsError);
    return [];
  }

  // Transform data into billing report
  const report: BillingReport[] = (schoolsData || []).map((school: any) => {
    const subscription = school.subscriptions?.[0];
    const addOns = subscription?.add_ons || [];
    const addOnRevenue = addOns
      .filter((addon: any) => addon.enabled)
      .reduce((sum: number, addon: any) => sum + (addon.monthly_price_zar || 0), 0);

    return {
      school_id: school.id,
      school_name: school.name,
      subscription_tier: subscription?.tier || "N/A",
      monthly_price_zar: subscription?.monthly_price_zar || 0,
      add_on_revenue: addOnRevenue,
      total_monthly_revenue: (subscription?.monthly_price_zar || 0) + addOnRevenue,
      billing_status: subscription?.billing_status || "N/A",
      trial_end_date: subscription?.trial_end_date || null,
    };
  });

  return report;
}

/**
 * Log impersonation session
 */
export async function logImpersonationStart(
  superAdminUserId: string,
  schoolId: number
): Promise<number | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("impersonation_logs")
    .insert([
      {
        super_admin_user_id: superAdminUserId,
        school_id: schoolId,
        session_start: new Date().toISOString(),
      },
    ])
    .select("id")
    .single();

  if (error) {
    console.error("Error logging impersonation start:", error);
    return null;
  }

  return data?.id || null;
}

/**
 * End impersonation session
 */
export async function logImpersonationEnd(
  logId: number,
  actionsTaken?: string
): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("impersonation_logs")
    .update({
      session_end: new Date().toISOString(),
      actions_taken: actionsTaken || null,
    })
    .eq("id", logId);

  if (error) {
    console.error("Error logging impersonation end:", error);
  }
}
