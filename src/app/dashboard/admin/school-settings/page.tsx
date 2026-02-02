import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";

export default async function SchoolSettingsPage() {
  try {
    await protectRoute(["ADMIN", "SUPER_ADMIN"]);
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/dashboard/admin"
          className="text-sm text-pink-600 hover:text-pink-800 mb-6"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">School Settings</h1>
        <p className="text-gray-600 mb-8">Configure school information and policies</p>

        <div className="space-y-6">
          {/* School Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">School Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">School Name</label>
                <input
                  type="text"
                  defaultValue="Happy Kids Preschool"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue="info@happykids.co.za"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Phone</label>
                <input
                  type="tel"
                  defaultValue="+27 21 123 4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Operating Hours</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Opening Time</label>
                <input type="time" defaultValue="07:00" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Closing Time</label>
                <input type="time" defaultValue="18:00" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Policies */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Policies</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm text-gray-700">Require parent confirmation for attendance</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm text-gray-700">Send daily activity summaries to parents</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm text-gray-700">Allow parents to upload photos</span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <button className="w-full px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium">
            Save Settings
          </button>
        </div>
      </div>
    </main>
  );
}
