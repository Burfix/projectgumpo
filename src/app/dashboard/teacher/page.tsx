import { protectRoute } from "@/lib/auth/middleware";
import Link from "next/link";
import { 
  getTeacherClassrooms, 
  getClassroomChildren, 
  getClassroomAttendanceToday,
  getTeacherDashboardStats 
} from "@/lib/db/teacherDashboard";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherDashboard() {
  let user;
  try {
    user = await protectRoute(["TEACHER", "ADMIN", "PRINCIPAL", "SUPER_ADMIN"]);
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }

  // Get user's profile to get their ID
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('users')
    .select('id, name, school_id')
    .eq('email', user.email)
    .single();

  // Get teacher's classrooms
  const classrooms = profile?.id ? await getTeacherClassrooms(profile.id) : [];
  const currentClassroom = classrooms[0] || null;

  // Get classroom data if teacher has a classroom
  let children: Awaited<ReturnType<typeof getClassroomChildren>> = [];
  let attendanceToday: Awaited<ReturnType<typeof getClassroomAttendanceToday>> = [];
  let stats = {
    total_children: 0,
    present_today: 0,
    absent_today: 0,
    incidents_today: 0,
    meals_logged_today: 0,
    naps_logged_today: 0,
  };

  if (currentClassroom) {
    [children, attendanceToday, stats] = await Promise.all([
      getClassroomChildren(currentClassroom.id),
      getClassroomAttendanceToday(currentClassroom.id),
      getTeacherDashboardStats(currentClassroom.id),
    ]);
  }

  // Map attendance by child_id for quick lookup
  const attendanceMap = new Map(attendanceToday.map(a => [a.child_id, a]));

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
            {currentClassroom && (
              <p className="text-sm text-gray-500">{currentClassroom.name}</p>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Welcome, <span className="font-semibold">{profile?.name || user.email}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* No Classroom Assigned */}
        {!currentClassroom && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-yellow-800">No Classroom Assigned</h2>
            <p className="text-yellow-700 mt-1">
              You haven&apos;t been assigned to a classroom yet. Please contact your school administrator.
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-gray-600 text-sm font-medium">Children in Class</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total_children}</div>
            {currentClassroom && (
              <p className="text-xs text-gray-600 mt-2">{currentClassroom.name}</p>
            )}
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-gray-600 text-sm font-medium">Present Today</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{stats.present_today}</div>
            <p className="text-xs text-gray-600 mt-2">{stats.absent_today} absent</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-gray-600 text-sm font-medium">Meals Logged</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{stats.meals_logged_today}</div>
            <p className="text-xs text-gray-600 mt-2">Today</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-gray-600 text-sm font-medium">Incidents</div>
            <div className={`text-3xl font-bold mt-2 ${stats.incidents_today > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
              {stats.incidents_today}
            </div>
            <p className="text-xs text-gray-600 mt-2">Today</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Summary</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.present_today}</div>
                    <div className="text-sm text-green-700">Present</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{stats.absent_today}</div>
                    <div className="text-sm text-red-700">Absent</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.meals_logged_today}</div>
                    <div className="text-sm text-blue-700">Meals</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.naps_logged_today}</div>
                    <div className="text-sm text-purple-700">Naps</div>
                  </div>
                </div>
                {stats.incidents_today > 0 && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-800 font-medium">
                      ⚠️ {stats.incidents_today} incident{stats.incidents_today > 1 ? 's' : ''} reported today
                    </p>
                  </div>
                )}
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
              </div>
            </div>
          </div>
        </div>

        {/* Children List */}
        {currentClassroom && children.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{currentClassroom.name} - Children</h2>
              <span className="text-sm text-gray-500">{children.length} children</span>
            </div>
            <div className="divide-y divide-gray-200">
              {children.map((child) => {
                const attendance = attendanceMap.get(child.id);
                const isPresent = attendance?.status === 'present';
                const isAbsent = attendance?.status === 'absent' || attendance?.status === 'sick';
                const checkInTime = attendance?.check_in_time 
                  ? new Date(attendance.check_in_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                  : null;

                return (
                  <div key={child.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                        {child.first_name[0]}{child.last_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{child.first_name} {child.last_name}</p>
                        <p className="text-sm text-gray-600">
                          {isPresent && checkInTime && `✓ Arrived ${checkInTime}`}
                          {isAbsent && attendance?.notes ? attendance.notes : isAbsent && 'Absent'}
                          {!attendance && 'Not checked in'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isPresent
                          ? "bg-green-100 text-green-800"
                          : isAbsent
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {isPresent ? 'Present' : isAbsent ? 'Absent' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Children */}
        {currentClassroom && children.length === 0 && (
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">No children enrolled in this classroom yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}
