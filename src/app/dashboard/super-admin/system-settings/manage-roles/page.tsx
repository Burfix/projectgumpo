import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";

export default async function ManageRolesPage() {
  try {
    await protectRoute(["SUPER_ADMIN"]);
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }

  const roles = [
    { name: "PARENT", description: "Parent/Guardian access", permissions: "View child daily updates, message teachers" },
    { name: "TEACHER", description: "Teacher/Staff access", permissions: "Log attendance, meals, nap time, incidents" },
    { name: "ADMIN", description: "School Administrator", permissions: "Manage staff, settings, reports" },
    { name: "SUPER_ADMIN", description: "Platform Administrator", permissions: "Full system access, user management" },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/dashboard/super-admin/system-settings"
          className="text-sm text-green-700 hover:text-green-800 mb-6"
        >
          ← Back to System Settings
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Roles</h1>
        <p className="text-gray-600 mb-8">Review access controls and user roles in the system</p>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900">System Roles</p>
          </div>
          <div className="divide-y divide-gray-200">
            {roles.map((role) => (
              <div key={role.name} className="px-6 py-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{role.name}</p>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Permissions: {role.permissions}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Roles are managed at the system level. To change a user's role, visit the Users management page.
          </p>
        </div>
      </div>
    </main>
  );
}
