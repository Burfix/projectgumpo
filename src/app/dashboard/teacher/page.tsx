import { protectRoute } from "@/lib/auth/middleware";

export default async function TeacherDashboard() {
  const user = await protectRoute(["TEACHER", "ADMIN", "SUPER_ADMIN"]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
          <div className="text-sm text-gray-600">
            Welcome, <span className="font-semibold">{user.email}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-gray-600 text-sm font-medium">Children in Class</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">18</div>
            <p className="text-xs text-gray-600 mt-2">Sunflower Room</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-gray-600 text-sm font-medium">Today's Attendance</div>
            <div className="text-3xl font-bold text-green-600 mt-2">17</div>
            <p className="text-xs text-gray-600 mt-2">1 absent</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-gray-600 text-sm font-medium">Unread Messages</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">4</div>
            <p className="text-xs text-gray-600 mt-2">From parents</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daily Tasks */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Daily Tasks</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {[
                  { task: "Record Attendance", time: "8:00 AM - 8:30 AM", status: "Completed", icon: "✓" },
                  { task: "Breakfast Logging", time: "8:00 AM - 8:30 AM", status: "Completed", icon: "✓" },
                  { task: "Morning Activities", time: "9:00 AM - 10:00 AM", status: "In Progress", icon: "→" },
                  { task: "Nap Time Logging", time: "12:30 PM - 2:30 PM", status: "Pending", icon: "◐" },
                  { task: "Daily Summary", time: "4:30 PM - 5:00 PM", status: "Pending", icon: "◐" },
                ].map((task, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl text-gray-400">{task.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{task.task}</p>
                        <p className="text-sm text-gray-600">{task.time}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : task.status === "In Progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/dashboard/teacher/attendance"
                  className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium text-center"
                >
                  Record Attendance
                </Link>
                <Link
                  href="/dashboard/teacher/log-meal"
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium text-center"
                >
                  Log Meal
                </Link>
                <Link
                  href="/dashboard/teacher/nap-timer"
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium text-center"
                >
                  Start Nap Timer
                </Link>
                <Link
                  href="/dashboard/teacher/report-incident"
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium text-center"
                >
                  Report Incident
                </Link>
                <Link
                  href="/dashboard/teacher/messages"
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium text-center"
                >
                  Message Parents
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Children List */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Sunflower Room - Children</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {[
              { name: "Ben Smith", status: "Present", notes: "✓ Arrived 7:45 AM" },
              { name: "Clara Williams", status: "Present", notes: "✓ Arrived 8:05 AM" },
              { name: "Ava Johnson", status: "Absent", notes: "Called in sick" },
            ].map((child, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{child.name}</p>
                  <p className="text-sm text-gray-600">{child.notes}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    child.status === "Present"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {child.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
