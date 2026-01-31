import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";

export default async function SystemSettingsPage() {
  await protectRoute(["SUPER_ADMIN"]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link
          href="/dashboard/super-admin"
          className="text-sm text-green-700 hover:text-green-800"
        >
          ← Back to dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-6">System settings</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Security</h2>
            <p className="text-gray-600 text-sm mb-4">
              Review access controls, roles, and security policies.
            </p>
            <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
              Manage roles
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Notifications</h2>
            <p className="text-gray-600 text-sm mb-4">
              Configure email templates and alert thresholds.
            </p>
            <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
              Configure emails
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Data retention</h2>
            <p className="text-gray-600 text-sm mb-4">
              Define how long reports and media are stored.
            </p>
            <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
              Update retention
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Integrations</h2>
            <p className="text-gray-600 text-sm mb-4">
              Manage third-party services and API credentials.
            </p>
            <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
              View integrations
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
