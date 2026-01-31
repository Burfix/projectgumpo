import { protectRoute } from "@/lib/auth/middleware";

export default async function ParentDashboard() {
  const user = await protectRoute(["PARENT", "TEACHER", "ADMIN", "SUPER_ADMIN"]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
          <div className="text-sm text-gray-600">
            Welcome, <span className="font-semibold">{user.email}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Child Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Ben Smith - Sunflower Room</h2>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Present Today</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Arrived</p>
                <p className="text-lg font-semibold text-gray-900">7:45 AM</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mood</p>
                <p className="text-lg font-semibold text-gray-900">😊 Happy</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Nap</p>
                <p className="text-lg font-semibold text-gray-900">1h 45m</p>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Meals</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">🍞 Breakfast</span>
                  <span className="text-green-600 font-medium">Ate well</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">🥗 Lunch</span>
                  <span className="text-green-600 font-medium">Ate well</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">🍎 Snack</span>
                  <span className="text-gray-600">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Today's Activities</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {[
                  { time: "7:45 AM", activity: "Arrived at school", icon: "👋" },
                  { time: "8:00 AM", activity: "Breakfast - Porridge & fruit", icon: "🍽️" },
                  { time: "9:30 AM", activity: "Creative time - Painted rainbow", icon: "🎨", image: true },
                  { time: "12:00 PM", activity: "Lunch - Pasta & vegetables", icon: "🍽️" },
                  { time: "12:30 PM", activity: "Nap time (1h 45m)", icon: "😴" },
                ].map((item, i) => (
                  <div key={i} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex gap-4">
                      <div className="text-2xl flex-shrink-0">{item.icon}</div>
                      <div className="flex-grow">
                        <p className="text-sm text-gray-600">{item.time}</p>
                        <p className="font-medium text-gray-900 mt-1">{item.activity}</p>
                        {item.image && (
                          <div className="mt-2 bg-gray-100 rounded w-full h-32 flex items-center justify-center text-gray-400">
                            Photo
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                  Message Teacher
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  View Progress
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  View Grades
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  View Reports
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-gray-900 font-medium">Ms. Sarah</p>
                  <p className="text-gray-600 text-xs mt-1">Ben had a great day! 😊</p>
                  <p className="text-gray-500 text-xs mt-2">Today 4:45 PM</p>
                </div>
                <button className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xs font-medium">
                  View All Messages
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
