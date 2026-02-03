"use client";

import * as React from "react";
import Link from "next/link";

export default function BookDemoPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [audience, setAudience] = React.useState<"school" | "parent">("school");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [school, setSchool] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/book-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audience,
          name,
          email,
          phone,
          school: audience === "school" ? school : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-green-700 hover:text-green-800">
          ← Back to home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-4">Book a demo</h1>
        <p className="text-gray-600 mb-8">
          {audience === "school"
            ? "Tell us about your school and we’ll schedule a tailored walkthrough."
            : "Share your details and we’ll show you how Project Goose keeps parents informed."}
        </p>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {submitted ? (
            <div className="text-green-700 font-semibold">
              Thanks! We’ll be in touch shortly to confirm your demo.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : null}
              <div>
                <label className="block text-sm text-gray-700 mb-2">I am a</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAudience("school")}
                    className={`px-4 py-2 rounded-lg border text-sm font-semibold ${
                      audience === "school"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    Pre-School / Daycare
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudience("parent")}
                    className={`px-4 py-2 rounded-lg border text-sm font-semibold ${
                      audience === "parent"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    Parent / Caregiver
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Full name</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Phone</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              {audience === "school" ? (
                <>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">School / Center</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      required
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                    />
                  </div>
                </>
              ) : null}
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Sending..."
                  : audience === "school"
                    ? "Request demo"
                    : "Request parent walkthrough"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
