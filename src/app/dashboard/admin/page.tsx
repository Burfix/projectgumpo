import { protectRoute } from "@/lib/auth/middleware";
import Link from "next/link";
import { getPrincipalDashboardData } from "@/lib/db/principalDashboard";
import StatCard from "./_components/StatCard";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams?: { schoolId?: string };
}) {
  let user;
  try {
    user = await protectRoute(["ADMIN", "SUPER_ADMIN", "PRINCIPAL"]);
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }

  const dashboardData = await getPrincipalDashboardData({
    schoolIdParam: searchParams?.schoolId,
  });

  const { stats, classrooms, incidents } = dashboardData;
  const parentEngagementValue =
    stats.parentEngagementPercent === null ? "—" : `${stats.parentEngagementPercent}%`;
  const attendanceValue =
    stats.attendancePercent === null ? "—" : `${stats.attendancePercent}%`;
  const attendanceClass =
    stats.attendancePercent === null ? "text-gray-900" : "text-green-600";
  const formatIncidentTime = (date: string) =>
    new Date(date).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

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
          <StatCard
            label="Total Children"
            value={stats.totalChildren}
            subLabel="Across all classes"
          />
          <StatCard label="Teachers" value={stats.teachers} />
          <StatCard
            label="Parent Engagement"
            value={parentEngagementValue}
            subLabel={stats.parentEngagementPercent === null ? undefined : "App opens today"}
            tooltip={stats.parentEngagementPercent === null ? stats.engagementNote : undefined}
          />
          <StatCard
            label="Attendance"
            value={attendanceValue}
            valueClassName={attendanceClass}
            subLabel={stats.attendancePercent === null ? undefined : "Today"}
            tooltip={stats.attendancePercent === null ? stats.attendanceNote : undefined}
          />
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
                {classrooms.length === 0 ? (
                  <div className="px-6 py-4 text-sm text-gray-500">No classrooms found.</div>
                ) : (
                  classrooms.map((room) => {
                    const badgeClass =
                      room.status.toLowerCase() === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800";
                    const teacherLabel =
                      room.teacherNames.length > 0
                        ? room.teacherNames.join(", ")
                        : "Unassigned";
                    return (
                      <div
                        key={room.id}
                        className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{room.name}</p>
                          <p className="text-sm text-gray-600">
                            {teacherLabel} • {room.childrenCount} children
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
                          {room.status}
                        </span>
                      </div>
                    );
                  })
                )}
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
            {incidents.length === 0 ? (
              <div className="px-6 py-4 text-sm text-gray-500">No incidents reported this week.</div>
            ) : (
              incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{incident.childName}</p>
                    <p className="text-sm text-gray-600">
                      {incident.title} • {formatIncidentTime(incident.createdAt)}
                    </p>
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
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
