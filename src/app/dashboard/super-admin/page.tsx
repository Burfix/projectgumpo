import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";
import SchoolsActions from "./SchoolsActions";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600">Total Schools</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">24</p>
            <p className="text-xs text-gray-500 mt-2">↑ 3 this month</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">1,248</p>
            <p className="text-xs text-gray-500 mt-2">Across all schools</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600">Daily Logs</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">15.2K</p>
            <p className="text-xs text-gray-500 mt-2">Last 24 hours</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600">System Health</p>
            <p className="text-3xl font-bold text-green-600 mt-2">99.8%</p>
            <p className="text-xs text-gray-500 mt-2">Uptime</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Schools Management */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Schools Management</h2>
                <SchoolsActions />
              </div>
              
              {/* School Statistics Summary */}
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-900">0</div>
                    <div className="text-xs text-blue-700 mt-1">Children</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-900">0</div>
                    <div className="text-xs text-emerald-700 mt-1">Parents</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-900">0</div>
                    <div className="text-xs text-purple-700 mt-1">Teachers</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-900">0</div>
                    <div className="text-xs text-orange-700 mt-1">Admins</div>
                  </div>
                </div>

                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-sm font-medium">No schools added yet</p>
                  <p className="text-xs mt-1">Click "+ Add School" to get started</p>
                </div>
              </div>
            </div>
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

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {[
              { time: "2024-01-30 14:23", event: "New school registered: Happy Kids Daycare", type: "School" },
              { time: "2024-01-30 12:15", event: "User password reset requested: john@sunshine.co.za", type: "User" },
              { time: "2024-01-30 10:45", event: "Database backup completed successfully", type: "System" },
              { time: "2024-01-29 16:30", event: "14 new users invited to Sunshine Preschool", type: "User" },
              { time: "2024-01-29 13:20", event: "Bulk data import: 245 children records", type: "Data" },
            ].map((item, i) => (
              <div key={i} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-grow">
                    <p className="text-sm text-gray-900">{item.event}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.type === 'System' ? 'bg-blue-100 text-blue-800' :
                    item.type === 'School' ? 'bg-green-100 text-green-800' :
                    item.type === 'User' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
