"use client";

import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";
import { useState } from "react";

export default function ConfigureEmailsPage() {
  const [emailTemplates, setEmailTemplates] = useState({
    newInvite: true,
    dailySummary: true,
    alertThreshold: 5,
  });

  const handleToggle = (key: string) => {
    setEmailTemplates({
      ...emailTemplates,
      [key]: !emailTemplates[key],
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/dashboard/super-admin/system-settings"
          className="text-sm text-green-700 hover:text-green-800 mb-6"
        >
          ← Back to System Settings
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configure Emails</h1>
        <p className="text-gray-600 mb-8">Manage email notifications and alert thresholds</p>

        <div className="space-y-6">
          {/* Email Templates */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Templates</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">New Invite Email</p>
                  <p className="text-sm text-gray-600">Sent when users are invited to join</p>
                </div>
                <button
                  onClick={() => handleToggle("newInvite")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    emailTemplates.newInvite
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {emailTemplates.newInvite ? "Enabled" : "Disabled"}
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Daily Summary Email</p>
                  <p className="text-sm text-gray-600">Daily activity summary for parents</p>
                </div>
                <button
                  onClick={() => handleToggle("dailySummary")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    emailTemplates.dailySummary
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {emailTemplates.dailySummary ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>
          </div>

          {/* Alert Thresholds */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alert Thresholds</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Missing Attendance Threshold (minutes)
                </label>
                <input
                  type="number"
                  value={emailTemplates.alertThreshold}
                  onChange={(e) =>
                    setEmailTemplates({
                      ...emailTemplates,
                      alertThreshold: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Alert if attendance not recorded after this many minutes
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
            Save Email Settings
          </button>
        </div>
      </div>
    </main>
  );
}
