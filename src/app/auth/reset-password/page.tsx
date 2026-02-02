"use client";

import * as React from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [ready, setReady] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    async function checkSession() {
      // Check if user has an active session
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      
      if (!session) {
        setError("Authentication session is missing. Please click the reset link from your email again.");
      }
      
      setReady(true);
    }

    checkSession();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabaseBrowser.auth.updateUser({
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Password reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-6 py-16">
        <Link href="/auth/login" className="text-sm text-green-700 hover:text-green-800">
          ← Back to login
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Set a new password</h1>
        <p className="text-sm text-gray-600 mb-6">
          Enter a new password for your account.
        </p>

        {!ready ? (
          <div className="text-gray-600">Loading...</div>
        ) : success ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-green-700 font-semibold">
            Password updated. You can now sign in.
            <div className="mt-4">
              <Link
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                Go to login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">New password</label>
              <input
                className="w-full border rounded px-3 py-2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Confirm new password</label>
              <input
                className="w-full border rounded px-3 py-2"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded p-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-green-600 text-white py-2 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Update password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
