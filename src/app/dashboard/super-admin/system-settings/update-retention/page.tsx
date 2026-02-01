"use client";

import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";
import { useState } from "react";

export default function UpdateRetentionPage() {
  const [retention, setRetention] = useState({
    reports: 90,
    media: 30,
    logs: 180,
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/dashboard/super-admin/system-settings"
          className="text-sm text-green-700 hover:text-green-800 mb-6"
        >
          ← Back to System Settings
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Retention</h1>
        <p className="text-gray-600 mb-8">Define how long reports, media, and logs are stored</p>

        <div className="space-y-6">
          {/* Retention Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Retention Policy</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Reports (days)
                </label>
                <input
                  type="number"
                  value={retention.reports}
                  onChange={(e) =>
                    setRetention({ ...retention, reports: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
                <p className="text-xs text-gray-600 mt-2">How long to keep incident reports</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Photos/Media (days)
                </label>
                <input
                  type="number"
                  value={retention.media}
                  onChange={(e) =>
                    setRetention({ ...retention, media: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
                <p className="text-xs text-gray-600 mt-2">How long to keep photos and media files</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Audit Logs (days)
                </label>
                <input
                  type="number"
                  value={retention.logs}
                  onChange={(e) =>
                    setRetention({ ...retention, logs: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
                <p className="text-xs text-gray-600 mt-2">How long to keep system audit logs</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>Warning:</strong> Once data is deleted after the retention period, it cannot be recovered.
            </p>
          </div>

          {/* Save Button */}
          <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
            Save Retention Policy
          </button>
        </div>
      </div>
    </main>
  );
}
