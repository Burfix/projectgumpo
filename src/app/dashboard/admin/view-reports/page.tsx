import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";

export default async function ViewReportsPage() {
  try {
    await protectRoute(["ADMIN", "SUPER_ADMIN"]);
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }

  const reports = [
    { type: "Daily Summary", class: "Sunflower Room", date: "Today", status: "Complete" },
    { type: "Weekly Report", class: "Rainbow Room", date: "Jan 29", status: "Pending" },
    { type: "Attendance", class: "Stars Room", date: "This Week", status: "Complete" },
    { type: "Incident Log", class: "All Classes", date: "This Month", status: "In Progress" },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/dashboard/admin"
          className="text-sm text-orange-600 hover:text-orange-800 mb-6"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">View Reports</h1>
        <p className="text-gray-600 mb-8">Access school and classroom reports</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Reports</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">24</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Pending Reviews</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">3</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900">Available Reports</p>
          </div>
          <div className="divide-y divide-gray-200">
            {reports.map((report, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{report.type}</p>
                  <p className="text-sm text-gray-600">{report.class} • {report.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.status === "Complete"
                        ? "bg-green-100 text-green-800"
                        : report.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {report.status}
                  </span>
                  <Link
                    href="#"
                    className="px-4 py-2 text-orange-600 hover:text-orange-800 text-sm font-medium"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Generate New Report</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Report Type</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900">
                <option>Select report type...</option>
                <option>Daily Summary</option>
                <option>Weekly Report</option>
                <option>Monthly Report</option>
                <option>Attendance Report</option>
              </select>
            </div>
            <button className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
