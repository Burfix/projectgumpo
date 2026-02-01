import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";

export default async function ViewIntegrationsPage() {
  await protectRoute(["SUPER_ADMIN"]);

  const integrations = [
    {
      name: "Supabase",
      status: "Connected",
      description: "Database and authentication provider",
      icon: "🗄️",
    },
    {
      name: "Vercel",
      status: "Connected",
      description: "Hosting and deployment platform",
      icon: "▲",
    },
    {
      name: "Sendgrid",
      status: "Not Connected",
      description: "Email delivery service",
      icon: "📧",
    },
    {
      name: "Twilio",
      status: "Not Connected",
      description: "SMS notifications",
      icon: "📱",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/dashboard/super-admin/system-settings"
          className="text-sm text-green-700 hover:text-green-800 mb-6"
        >
          ← Back to System Settings
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
        <p className="text-gray-600 mb-8">Manage third-party services and API credentials</p>

        <div className="grid gap-6">
          {integrations.map((integration) => (
            <div key={integration.name} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{integration.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{integration.name}</p>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    integration.status === "Connected"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {integration.status}
                </span>
              </div>
              <button
                className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium ${
                  integration.status === "Connected"
                    ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {integration.status === "Connected" ? "Manage" : "Connect"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Need help?</strong> Contact support to set up additional integrations or API connections.
          </p>
        </div>
      </div>
    </main>
  );
}
