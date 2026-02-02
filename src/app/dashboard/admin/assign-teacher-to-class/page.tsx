import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";

export default async function AssignTeacherToClassPage() {
  try {
    await protectRoute(["ADMIN", "SUPER_ADMIN"]);
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }

  const teachers = [
    { name: "Ms. Sarah", email: "sarah@school.com", assigned: 1 },
    { name: "Ms. Emily", email: "emily@school.com", assigned: 1 },
    { name: "Mr. David", email: "david@school.com", assigned: 1 },
    { name: "Ms. Lisa", email: "lisa@school.com", assigned: 0 },
  ];

  const classes = [
    { name: "Sunflower Room", teacher: "Ms. Sarah", capacity: 20, enrolled: 18 },
    { name: "Rainbow Room", teacher: "Ms. Emily", capacity: 20, enrolled: 20 },
    { name: "Stars Room", teacher: "Mr. David", capacity: 25, enrolled: 20 },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/dashboard/admin"
          className="text-sm text-purple-600 hover:text-purple-800 mb-6"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assign Teacher to Class</h1>
        <p className="text-gray-600 mb-8">Manage teacher assignments to classrooms</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Teachers List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <p className="text-sm font-semibold text-gray-900">Available Teachers</p>
            </div>
            <div className="divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <div key={teacher.email} className="px-6 py-4 hover:bg-gray-50">
                  <p className="font-medium text-gray-900">{teacher.name}</p>
                  <p className="text-sm text-gray-600">{teacher.email}</p>
                  <span
                    className={`text-xs font-medium mt-1 inline-block px-2 py-1 rounded ${
                      teacher.assigned > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {teacher.assigned > 0 ? `Assigned to ${teacher.assigned} class` : "Not Assigned"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Classes List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <p className="text-sm font-semibold text-gray-900">Classrooms</p>
            </div>
            <div className="divide-y divide-gray-200">
              {classes.map((cls) => (
                <div key={cls.name} className="px-6 py-4 hover:bg-gray-50">
                  <p className="font-medium text-gray-900">{cls.name}</p>
                  <p className="text-sm text-gray-600">Teacher: {cls.teacher}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {cls.enrolled}/{cls.capacity} enrolled
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assignment Section */}
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Create New Assignment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Select Teacher</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900">
                <option>Choose a teacher...</option>
                {teachers.map((t) => (
                  <option key={t.email}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Select Class</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900">
                <option>Choose a classroom...</option>
                {classes.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
              Assign Teacher
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
