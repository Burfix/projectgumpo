import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";

const reportCards = [
  {
    title: "Attendance summary",
    description: "Daily attendance trends across all schools.",
  },
  {
    title: "Parent engagement",
    description: "Message response times and app usage insights.",
  },
  {
    title: "Incident logs",
    description: "Weekly incident totals and resolution status.",
  },
];

export default async function ReportsPage() {
  try {
    await protectRoute(["SUPER_ADMIN"]);
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link
          href="/dashboard/super-admin"
          className="text-sm text-green-700 hover:text-green-800"
        >
          ← Back to dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-6">Reports</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {reportCards.map((report) => (
            <div key={report.title} className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h2>
              <p className="text-sm text-gray-600 mb-4">{report.description}</p>
              <button className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium">
                Generate
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
