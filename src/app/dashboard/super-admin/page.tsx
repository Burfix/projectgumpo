import { protectRoute } from "@/lib/auth/middleware";

export default async function SuperAdminDashboard() {
  const user = await protectRoute(["SUPER_ADMIN"]);

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
                <button className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700">
                  + Add School
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {[
                  { name: "Sunshine Preschool", city: "Cape Town", users: 45, status: "Active", children: 120 },
                  { name: "Happy Kids Daycare", city: "Johannesburg", users: 32, status: "Active", children: 85 },
                  { name: "Little Learners Academy", city: "Durban", users: 28, status: "Active", children: 72 },
                  { name: "Rainbow Education Center", city: "Pretoria", users: 24, status: "Paused", children: 60 },
                ].map((school, i) => (
                  <div key={i} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{school.name}</p>
                        <p className="text-sm text-gray-600">{school.city}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        school.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {school.status}
                      </span>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <span className="text-gray-600">{school.users} users</span>
                      <span className="text-gray-600">{school.children} children</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                  View All Users
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  Audit Logs
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  System Settings
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  Generate Reports
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  Backups
                </button>
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
