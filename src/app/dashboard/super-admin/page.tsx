import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";
import SchoolsManagement from "./SchoolsManagement";
import SystemCountersCard from "./_components/SystemCountersCard";
import RecentActivityLive from "./_components/RecentActivityLive";

export default async function SuperAdminDashboard() {
  let user;
  try {
    user = await protectRoute(["SUPER_ADMIN"]);
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">System Administrator</h1>
          <div className="text-sm text-gray-600">
            Platform Control - <span className="font-semibold">{user.email}</span>
          </div>
        </div>
      </nav>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <SystemCountersCard />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Schools Management */}
          <div className="lg:col-span-2">
            <SchoolsManagement />
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">View Role Dashboards</h3>
              <div className="space-y-3">
                <Link
                  href="/dashboard/parent"
                  className="flex w-full items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
                >
                  Parent Dashboard
                </Link>
                <Link
                  href="/dashboard/teacher"
                  className="flex w-full items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Teacher Dashboard
                </Link>
                <Link
                  href="/dashboard/admin"
                  className="flex w-full items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                >
                  Admin Dashboard
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/dashboard/super-admin/schools"
                  className="flex w-full items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
                >
                  Schools Management
                </Link>
                <Link
                  href="/dashboard/super-admin/billing"
                  className="flex w-full items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  Billing & Revenue
                </Link>
                <Link
                  href="/dashboard/super-admin/users"
                  className="flex w-full items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  View All Users
                </Link>
                <Link
                  href="/dashboard/super-admin/audit-logs"
                  className="flex w-full items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Audit Logs
                </Link>
                <Link
                  href="/dashboard/super-admin/system-settings"
                  className="flex w-full items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  System Settings
                </Link>
                <Link
                  href="/dashboard/super-admin/reports"
                  className="flex w-full items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Generate Reports
                </Link>
                <Link
                  href="/dashboard/super-admin/backups"
                  className="flex w-full items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Backups
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database</span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    <span className="text-gray-900 font-medium">Healthy</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">API Server</span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    <span className="text-gray-900 font-medium">Healthy</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Email Service</span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    <span className="text-gray-900 font-medium">Healthy</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Storage</span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    <span className="text-gray-900 font-medium">Healthy</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity - Live Data */}
        <RecentActivityLive />
      </div>
    </main>
  );
}
