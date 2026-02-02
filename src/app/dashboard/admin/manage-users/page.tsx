import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";

export default async function ManageUsersPage() {
  try {
    await protectRoute(["ADMIN", "SUPER_ADMIN"]);
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }

  const users = [
    { name: "Ms. Sarah", email: "sarah@school.com", role: "TEACHER", status: "Active" },
    { name: "Ms. Emily", email: "emily@school.com", role: "TEACHER", status: "Active" },
    { name: "Mr. David", email: "david@school.com", role: "TEACHER", status: "Active" },
    { name: "John Principal", email: "john@school.com", role: "ADMIN", status: "Active" },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/dashboard/admin"
          className="text-sm text-indigo-600 hover:text-indigo-800 mb-6"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Users</h1>
        <p className="text-gray-600 mb-8">View and manage all school users</p>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Users ({users.length})</p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
              + Invite User
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.email} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    {user.status}
                  </span>
                  <button className="px-3 py-2 text-gray-600 hover:text-gray-900 text-sm">
                    ⋮
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium text-left">
              + Invite New User
            </button>
            <button className="w-full px-4 py-2 border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 text-sm font-medium text-left">
              Export User List
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
