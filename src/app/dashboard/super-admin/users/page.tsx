import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";
import { createAdminClient } from "@/lib/supabase/admin";
import InviteUserForm from "./InviteUserForm";
import BulkInviteForm from "./BulkInviteForm";
import UsersTable from "./UsersTable";

export default async function SuperAdminUsersPage() {
  let user;
  try {
    user = await protectRoute(["SUPER_ADMIN"]);
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }

  let users:
    | { 
        id: string; 
        email: string | null; 
        name: string | null;
        role: string | null; 
        school_id: number | null;
        is_active: boolean | null;
        last_sign_in_at: string | null;
        created_at?: string | null;
        schools?: { id: number; name: string }[] | null;
      }[]
    | null = null;
  let usersError: string | null = null;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("users")
      .select(`
        id,
        email,
        name,
        role,
        school_id,
        is_active,
        last_sign_in_at,
        created_at,
        schools(id, name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      usersError = error.message;
    } else {
      users = data ?? [];
    }
  } catch (err: any) {
    usersError = err?.message ?? "Failed to load users";
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-600">Manage invites and access</p>
          </div>
          <div className="text-sm text-gray-600">
            {user.email}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              className="flex-1 px-6 py-4 text-left font-medium text-gray-900 bg-blue-50 border-b-2 border-blue-600"
            >
              📝 Single Invite
            </button>
            <button
              className="flex-1 px-6 py-4 text-left font-medium text-gray-600 hover:bg-gray-50"
            >
              📤 Bulk Invite
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            <InviteUserForm />
          </div>
        </div>

        {/* Bulk Invite Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Bulk Invite Users</h2>
            <p className="text-sm text-gray-600">
              Efficiently invite multiple users at once. Upload a CSV file or paste data directly.
            </p>
          </div>
          <BulkInviteForm />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
            <Link
              href="/dashboard/super-admin"
              className="text-sm text-green-700 hover:text-green-800"
            >
              Back to dashboard
            </Link>
          </div>

          {usersError ? (
            <div className="px-6 py-4 text-sm text-red-700 bg-red-50">
              {usersError}
            </div>
          ) : (
            <UsersTable users={users ?? []} />
          )}
        </div>
      </div>
    </main>
  );
}
