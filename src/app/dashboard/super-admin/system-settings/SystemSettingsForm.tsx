"use client";

import { useState, useEffect } from "react";

type SystemSettings = {
  maintenance_mode: boolean;
  maintenance_message?: string;
  session_timeout_minutes: number;
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_lowercase: boolean;
  password_require_numbers: boolean;
  password_require_special: boolean;
  max_login_attempts: number;
  login_lockout_minutes: number;
  email_notifications_enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_from_email: string;
  feature_flags: {
    messaging: boolean;
    photos: boolean;
    reports: boolean;
    audit_logs: boolean;
  };
};

export default function SystemSettingsForm() {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenance_mode: false,
    session_timeout_minutes: 60,
    password_min_length: 8,
    password_require_uppercase: true,
    password_require_lowercase: true,
    password_require_numbers: true,
    password_require_special: false,
    max_login_attempts: 5,
    login_lockout_minutes: 15,
    email_notifications_enabled: true,
    smtp_host: "",
    smtp_port: 587,
    smtp_from_email: "",
    feature_flags: {
      messaging: true,
      photos: true,
      reports: true,
      audit_logs: true,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/super-admin/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage({ type: "error", text: "Failed to load settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/super-admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      setMessage({ type: "success", text: "Settings saved successfully" });
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Maintenance Mode */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Mode</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.maintenance_mode}
              onChange={(e) =>
                setSettings({ ...settings, maintenance_mode: e.target.checked })
              }
              className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">Enable maintenance mode</span>
          </label>
          {settings.maintenance_mode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Message
              </label>
              <textarea
                value={settings.maintenance_message || ""}
                onChange={(e) =>
                  setSettings({ ...settings, maintenance_message: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="System is under maintenance. Please check back later."
              />
            </div>
          )}
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Flags</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.feature_flags.messaging}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  feature_flags: { ...settings.feature_flags, messaging: e.target.checked },
                })
              }
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Messaging System</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.feature_flags.photos}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  feature_flags: { ...settings.feature_flags, photos: e.target.checked },
                })
              }
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Photo Upload</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.feature_flags.reports}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  feature_flags: { ...settings.feature_flags, reports: e.target.checked },
                })
              }
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Reports</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.feature_flags.audit_logs}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  feature_flags: { ...settings.feature_flags, audit_logs: e.target.checked },
                })
              }
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Audit Logs</span>
          </label>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={settings.session_timeout_minutes}
              onChange={(e) =>
                setSettings({ ...settings, session_timeout_minutes: parseInt(e.target.value) })
              }
              min={15}
              max={480}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Min Length
            </label>
            <input
              type="number"
              value={settings.password_min_length}
              onChange={(e) =>
                setSettings({ ...settings, password_min_length: parseInt(e.target.value) })
              }
              min={6}
              max={32}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Login Attempts
            </label>
            <input
              type="number"
              value={settings.max_login_attempts}
              onChange={(e) =>
                setSettings({ ...settings, max_login_attempts: parseInt(e.target.value) })
              }
              min={3}
              max={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Login Lockout (minutes)
            </label>
            <input
              type="number"
              value={settings.login_lockout_minutes}
              onChange={(e) =>
                setSettings({ ...settings, login_lockout_minutes: parseInt(e.target.value) })
              }
              min={5}
              max={60}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Password Requirements</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.password_require_uppercase}
                onChange={(e) =>
                  setSettings({ ...settings, password_require_uppercase: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Require uppercase letters</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.password_require_lowercase}
                onChange={(e) =>
                  setSettings({ ...settings, password_require_lowercase: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Require lowercase letters</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.password_require_numbers}
                onChange={(e) =>
                  setSettings({ ...settings, password_require_numbers: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Require numbers</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.password_require_special}
                onChange={(e) =>
                  setSettings({ ...settings, password_require_special: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Require special characters</span>
            </label>
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Settings</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.email_notifications_enabled}
              onChange={(e) =>
                setSettings({ ...settings, email_notifications_enabled: e.target.checked })
              }
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enable email notifications</span>
          </label>
          {settings.email_notifications_enabled && (
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={settings.smtp_host}
                  onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={settings.smtp_port}
                  onChange={(e) =>
                    setSettings({ ...settings, smtp_port: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="587"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email Address
                </label>
                <input
                  type="email"
                  value={settings.smtp_from_email}
                  onChange={(e) => setSettings({ ...settings, smtp_from_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="noreply@yourschool.com"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
