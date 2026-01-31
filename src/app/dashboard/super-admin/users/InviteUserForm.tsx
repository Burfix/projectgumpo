"use client";

import * as React from "react";

const ROLES = ["SUPER_ADMIN", "ADMIN", "TEACHER", "PARENT"] as const;

export default function InviteUserForm() {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<(typeof ROLES)[number]>("PARENT");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Invite failed");
        return;
      }

      setSuccess("Invite sent successfully");
      setEmail("");
      setRole("PARENT");
    } catch (err: any) {
      setError(err?.message ?? "Invite failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input
            className="w-full border rounded px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Role</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded p-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-700 border border-green-200 bg-green-50 rounded p-2">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send Invite"}
      </button>
    </form>
  );
}
