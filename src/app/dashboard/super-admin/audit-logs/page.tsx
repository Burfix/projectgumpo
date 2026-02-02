import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";

const sampleLogs = [
  {
    time: "2026-01-31 09:24",
    actor: "superadmin@projectgoose.com",
    action: "Invited user: parent@family.com",
  },
  {
    time: "2026-01-30 17:10",
    actor: "admin@sunshine.co.za",
    action: "Updated attendance policy",
  },
  {
    time: "2026-01-30 15:42",
    actor: "teacher@rainbow.co.za",
    action: "Uploaded 5 photos",
  },
];

export default async function AuditLogsPage() {
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

        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-6">Audit logs</h1>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 text-sm text-gray-600">
            Recent activity across the platform
          </div>
          <div className="divide-y divide-gray-200">
            {sampleLogs.map((log, idx) => (
              <div key={idx} className="px-6 py-4">
                <div className="text-sm text-gray-500">{log.time}</div>
                <div className="text-gray-900 font-medium">{log.action}</div>
                <div className="text-xs text-gray-500">{log.actor}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
