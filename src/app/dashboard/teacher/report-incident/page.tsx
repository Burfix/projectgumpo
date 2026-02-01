"use client";

import Link from "next/link";
import { useState } from "react";

export default function ReportIncident() {
  const [selectedChild, setSelectedChild] = useState("");
  const [incidentType, setIncidentType] = useState("");
  const [description, setDescription] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [severity, setSeverity] = useState<"minor" | "moderate" | "serious">("minor");

  const children = [
    "Ben Smith",
    "Clara Williams",
    "Ava Johnson",
    "Liam Brown",
    "Emma Davis",
    "Oliver Wilson",
    "Sophia Martinez",
    "Noah Garcia",
  ];

  const incidentTypes = [
    "Minor injury (scratch, small bump)",
    "Fall or tumble",
    "Conflict with another child",
    "Illness symptoms",
    "Behavioral concern",
    "Allergy reaction",
    "Other",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({ selectedChild, incidentType, description, actionTaken, severity });
  };

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Link
            href="/dashboard/teacher"
            className="inline-flex items-center text-sm text-stone-600 hover:text-stone-900"
          >
            <span className="mr-2">←</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-stone-900">Report Incident</h1>
          <p className="text-sm text-stone-500 mt-1">Document and notify parents immediately</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Severity Level */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <label className="block text-sm font-semibold text-stone-900 mb-3">Severity Level</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSeverity("minor")}
                className={`px-4 py-3 rounded-xl text-sm font-medium ${
                  severity === "minor"
                    ? "bg-yellow-100 text-yellow-900 border-2 border-yellow-600"
                    : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                Minor
              </button>
              <button
                type="button"
                onClick={() => setSeverity("moderate")}
                className={`px-4 py-3 rounded-xl text-sm font-medium ${
                  severity === "moderate"
                    ? "bg-orange-100 text-orange-900 border-2 border-orange-600"
                    : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                Moderate
              </button>
              <button
                type="button"
                onClick={() => setSeverity("serious")}
                className={`px-4 py-3 rounded-xl text-sm font-medium ${
                  severity === "serious"
                    ? "bg-red-100 text-red-900 border-2 border-red-600"
                    : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                Serious
              </button>
            </div>
          </div>

          {/* Child Selection */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <label htmlFor="child" className="block text-sm font-semibold text-stone-900 mb-3">
              Child Name *
            </label>
            <select
              id="child"
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Select a child</option>
              {children.map((child) => (
                <option key={child} value={child}>
                  {child}
                </option>
              ))}
            </select>
          </div>

          {/* Incident Type */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <label htmlFor="incidentType" className="block text-sm font-semibold text-stone-900 mb-3">
              Incident Type *
            </label>
            <select
              id="incidentType"
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Select incident type</option>
              {incidentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <label htmlFor="description" className="block text-sm font-semibold text-stone-900 mb-3">
              What Happened? *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident in detail..."
              rows={4}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              required
            />
          </div>

          {/* Action Taken */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <label htmlFor="actionTaken" className="block text-sm font-semibold text-stone-900 mb-3">
              Action Taken *
            </label>
            <textarea
              id="actionTaken"
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="What steps were taken? (e.g., applied ice, comforted child, contacted parent)"
              rows={3}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pb-6">
            <button
              type="submit"
              className="w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-medium"
            >
              Submit Incident Report & Notify Parent
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
