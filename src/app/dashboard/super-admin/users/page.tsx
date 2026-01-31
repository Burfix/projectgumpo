import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";
import { createAdminClient } from "@/lib/supabase/admin";
import InviteUserForm from "./InviteUserForm";

export default async function SuperAdminUsersPage() {
  const user = await protectRoute(["SUPER_ADMIN"]);

  let users:
    | { id: string; email: string | null; role: string | null; created_at?: string | null }[]
    | null = null;
  let usersError: string | null = null;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("users")
      .select("id,email,role,created_at")
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
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invite a user</h2>
          <InviteUserForm />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">All users</h2>
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
            <div className="divide-y divide-gray-200">
              {(users ?? []).length === 0 ? (
                <div className="px-6 py-6 text-sm text-gray-600">No users found.</div>
              ) : (
                (users ?? []).map((u) => (
                  <div key={u.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{u.email ?? "(no email)"}</div>
                      <div className="text-xs text-gray-500">{u.id}</div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {u.role ?? "UNKNOWN"}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
