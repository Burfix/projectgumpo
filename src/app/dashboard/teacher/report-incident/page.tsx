"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import FileUpload from "@/components/ui/FileUpload";
import { notifyParentOfIncident } from "@/lib/notifications";

interface Child {
  id: number;
  first_name: string;
  last_name: string;
}

export default function ReportIncident() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [selectedChild, setSelectedChild] = useState("");
  const [incidentType, setIncidentType] = useState("");
  const [description, setDescription] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [severity, setSeverity] = useState<"minor" | "moderate" | "serious">("minor");
  const [notifyParent, setNotifyParent] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

  async function loadChildren() {
    try {
      setLoading(false);
      setError(null);
      
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      setChildren([
        { id: 1, first_name: "Ben", last_name: "Smith" },
        { id: 2, first_name: "Clara", last_name: "Williams" },
        { id: 3, first_name: "Ava", last_name: "Johnson" },
        { id: 4, first_name: "Liam", last_name: "Brown" },
        { id: 5, first_name: "Emma", last_name: "Davis" },
      ]);
    } catch (err) {
      setError("Failed to load children");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const incidentTypes = [
    "Minor injury (scratch, small bump)",
    "Fall or tumble",
    "Conflict with another child",
    "Illness symptoms",
    "Behavioral concern",
    "Allergy reaction",
    "Other",
  ];

  async function handlePhotoUpload(file: File) {
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'incidents');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setPhotoUrl(data.url);
    } catch (err) {
      setError('Failed to upload photo');
      console.error(err);
    } finally {
      setUploadingPhoto(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChild || !incidentType || !description) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const incidentData = {
        child_id: parseInt(selectedChild),
        incident_type: incidentType,
        description,
        action_taken: actionTaken,
        severity,
        notify_parent: notifyParent,
        photo_url: photoUrl,
        date: new Date().toISOString()
      };

      // TODO: API call to save incident
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Send notification to parent if requested
      if (notifyParent) {
        const child = children.find(c => c.id === parseInt(selectedChild));
        if (child) {
          // TODO: Get parent user ID from child record
          const parentUserId = 'parent-user-id'; // This should come from the database
          await notifyParentOfIncident(
            parentUserId,
            `${child.first_name} ${child.last_name}`,
            incidentType,
            severity,
            description
          );
        }
      }
      
      setSuccess(true);
      // Reset form
      setSelectedChild("");
      setIncidentType("");
      setDescription("");
      setActionTaken("");
      setSeverity("minor");
      setNotifyParent(true);
      setPhotoUrl(null);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to submit incident report");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/dashboard/teacher"
            className="inline-flex items-center text-sm text-stone-600 hover:text-stone-900"
          >
            <span className="mr-2">←</span>
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-lg font-semibold text-stone-900">Report Incident</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 text-sm">✓ Incident reported successfully. Parent has been notified.</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-stone-500">Document and notify parents immediately</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Severity Level */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <label className="block text-sm font-semibold text-stone-900 mb-3">
              Severity Level <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSeverity("minor")}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
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
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
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
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  severity === "serious"
                    ? "bg-red-100 text-red-900 border-2 border-red-600"
                    : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                Serious
              </button>
            </div>
          </div>

          {/* Select Child */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <label className="block text-sm font-semibold text-stone-900 mb-3">
              Select Child <span className="text-red-500">*</span>
            </label>
            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-green-600"></div>
              </div>
            ) : (
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Choose a child...</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.first_name} {child.last_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Incident Type */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <label className="block text-sm font-semibold text-stone-900 mb-3">
              Incident Type <span className="text-red-500">*</span>
            </label>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Choose incident type...</option>
              {incidentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <label className="block text-sm font-semibold text-stone-900 mb-3">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened? Include details like time, location, and any witnesses..."
              rows={4}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              required
            />
          </div>

          {/* Action Taken */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <label className="block text-sm font-semibold text-stone-900 mb-3">
              Action Taken
            </label>
            <textarea
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="What did you do to address the situation? (ice pack, first aid, etc.)"
              rows={3}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <label className="block text-sm font-semibold text-stone-900 mb-3">
              Attach Photo (Optional)
            </label>
            <FileUpload
              onFileSelect={handlePhotoUpload}
              disabled={uploadingPhoto}
              accept="image/*"
            />
            {uploadingPhoto && (
              <p className="text-sm text-stone-500 mt-2">Uploading photo...</p>
            )}
            {photoUrl && (
              <p className="text-sm text-green-600 mt-2">✓ Photo uploaded successfully</p>
            )}
          </div>

          {/* Notify Parent */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyParent}
                onChange={(e) => setNotifyParent(e.target.checked)}
                className="w-5 h-5 text-green-600 border-stone-300 rounded focus:ring-green-500"
              />
              <div>
                <div className="text-sm font-semibold text-stone-900">Notify parent immediately</div>
                <div className="text-xs text-stone-500">Parent will receive an instant notification</div>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              severity === "serious"
                ? "bg-red-600 hover:bg-red-700"
                : severity === "moderate"
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-yellow-600 hover:bg-yellow-700"
            } text-white disabled:bg-stone-300 disabled:cursor-not-allowed`}
          >
            {submitting ? "Submitting..." : "Submit Incident Report"}
          </button>
        </form>
      </div>
    </main>
  );
}
