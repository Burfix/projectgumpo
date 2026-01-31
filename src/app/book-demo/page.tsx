"use client";

import * as React from "react";
import Link from "next/link";

export default function BookDemoPage() {
  const [submitted, setSubmitted] = React.useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-green-700 hover:text-green-800">
          ← Back to home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-4">Book a demo</h1>
        <p className="text-gray-600 mb-8">
          Tell us about your school and we’ll schedule a tailored walkthrough.
        </p>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {submitted ? (
            <div className="text-green-700 font-semibold">
              Thanks! We’ll be in touch shortly to confirm your demo.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Full name</label>
                <input className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Work email</label>
                <input className="w-full border rounded px-3 py-2" type="email" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">School / Center</label>
                <input className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Number of classrooms</label>
                <select className="w-full border rounded px-3 py-2" defaultValue="1-3">
                  <option value="1-3">1-3</option>
                  <option value="4-7">4-7</option>
                  <option value="8-12">8-12</option>
                  <option value="13+">13+</option>
                </select>
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Request demo
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
