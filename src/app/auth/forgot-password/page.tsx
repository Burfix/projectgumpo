"use client";

import * as React from "react";
import Link from "next/link";
import supabase from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback?next=/auth/reset-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Reset request failed");
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

        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Reset your password</h1>
        <p className="text-sm text-gray-600 mb-6">
          Enter your email and we’ll send a reset link.
        </p>

        {success ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-green-700 font-semibold">
            Check your email for a reset link.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                className="w-full border rounded px-3 py-2"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
