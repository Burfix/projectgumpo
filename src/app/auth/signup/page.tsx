"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

function parseHashParams(hash: string): Record<string, string> {
  if (!hash) return {};
  const cleaned = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(cleaned);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export default function SignupPage() {
  const searchParams = useSearchParams();
  const [ready, setReady] = React.useState(false);
  const [email, setEmail] = React.useState<string>("");
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    async function initSession() {
      const hashParams = parseHashParams(window.location.hash);
      const accessToken =
        searchParams.get("access_token") ?? hashParams.access_token ?? "";
      const refreshToken =
        searchParams.get("refresh_token") ?? hashParams.refresh_token ?? "";

      if (accessToken && refreshToken) {
        await supabaseBrowser.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }

      const { data } = await supabaseBrowser.auth.getUser();
      if (data.user?.email) {
        setEmail(data.user.email);
      }
      setReady(true);
    }

    initSession();
  }, [searchParams]);

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
      const { data, error: updateError } = await supabaseBrowser.auth.updateUser({
        password,
        data: {
          full_name: fullName,
          phone,
        },
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      const user = data.user ?? (await supabaseBrowser.auth.getUser()).data.user;
      const role =
        (user?.user_metadata?.role as string | undefined) ??
        (user?.app_metadata?.role as string | undefined) ??
        "PARENT";

      if (user?.id) {
        await supabaseBrowser
          .from("users")
          .upsert({ id: user.id, email: user.email, role }, { onConflict: "id" });
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-green-700 hover:text-green-800">
          ← Back to home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Complete your signup</h1>
        <p className="text-sm text-gray-600 mb-6">
          Finish your account to access Project Goose.
        </p>

        {!ready ? (
          <div className="text-gray-600">Loading...</div>
        ) : success ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-green-700 font-semibold">
            Signup complete. You can now sign in.
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
              <label className="block text-sm text-gray-700 mb-1">Full name</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                className="w-full border rounded px-3 py-2 bg-gray-50"
                value={email}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Phone</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Create password</label>
              <input
                className="w-full border rounded px-3 py-2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Confirm password</label>
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
              {loading ? "Saving..." : "Complete signup"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
