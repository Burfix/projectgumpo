import { protectRoute } from "@/lib/auth/middleware";
import Link from "next/link";

export default async function AdminDashboard() {
  let user;
  try {
    user = await protectRoute(["ADMIN", "SUPER_ADMIN"]);
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Principal Dashboard</h1>
          <div className="text-sm text-gray-600">
            Welcome, <span className="font-semibold">{user.email}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-gray-600 text-sm font-medium">Total Children</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">58</div>
            <p className="text-xs text-gray-600 mt-2">Across all classes</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-gray-600 text-sm font-medium">Teachers</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">6</div>
            <p className="text-xs text-green-600 mt-2">All active</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-gray-600 text-sm font-medium">Parent Engagement</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">94%</div>
            <p className="text-xs text-gray-600 mt-2">App opens today</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-gray-600 text-sm font-medium">Attendance</div>
            <div className="text-3xl font-bold text-green-600 mt-2">96%</div>
            <p className="text-xs text-gray-600 mt-2">Today</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Classrooms */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Classrooms</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {[
                  { name: "Sunflower Room", teacher: "Ms. Sarah", children: 18, status: "In Session" },
                  { name: "Rainbow Room", teacher: "Ms. Emily", children: 20, status: "In Session" },
                  { name: "Stars Room", teacher: "Mr. David", children: 20, status: "Nap Time" },
                ].map((room, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{room.name}</p>
                      <p className="text-sm text-gray-600">{room.teacher} • {room.children} children</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        room.status === "In Session"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Management</h3>
              <div className="space-y-3">
                <Link
                  href="/dashboard/admin/link-parent-to-child"
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium text-center"
                >
                  Link Parent to Child
                </Link>
                <Link
                  href="/dashboard/admin/assign-teacher-to-class"
                  className="block w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium text-center"
                >
                  Assign Teacher to Class
                </Link>
                <Link
                  href="/dashboard/admin/manage-users"
                  className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium text-center"
                >
                  Manage Users
                </Link>
                <Link
                  href="/dashboard/admin/view-reports"
                  className="block w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium text-center"
                >
                  View Reports
                </Link>
                <Link
                  href="/dashboard/admin/school-settings"
                  className="block w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm font-medium text-center"
                >
                  School Settings
                </Link>
                <Link
                  href="/dashboard/admin/billing"
                  className="block w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium text-center"
                >
                  Billing & Subscription
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Incident Reports (This Week)</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {[
              { child: "Ben Smith", type: "Minor Bump", time: "Today 10:23 AM", status: "Reviewed" },
              { child: "Clara Williams", type: "Behavioral", time: "Yesterday 2:45 PM", status: "Reviewed" },
              { child: "Ava Johnson", type: "Scratch", time: "2 days ago", status: "Pending" },
            ].map((incident, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{incident.child}</p>
                  <p className="text-sm text-gray-600">{incident.type} • {incident.time}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    incident.status === "Reviewed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {incident.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
