import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";

const backups = [
  { date: "2026-01-31", size: "2.3 GB", status: "Completed" },
  { date: "2026-01-30", size: "2.2 GB", status: "Completed" },
  { date: "2026-01-29", size: "2.2 GB", status: "Completed" },
];

export default async function BackupsPage() {
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

        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-6">Backups</h1>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">Latest backups</span>
            <button className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium">
              Run backup
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {backups.map((backup) => (
              <div key={backup.date} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="text-gray-900 font-medium">{backup.date}</div>
                  <div className="text-xs text-gray-500">{backup.size}</div>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {backup.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
