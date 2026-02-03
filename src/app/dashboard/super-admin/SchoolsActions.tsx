"use client";

import { useState } from "react";
import { SchoolType } from "@/types/schools";

interface SchoolsActionsProps {
  onSchoolAdded?: () => void;
}

export default function SchoolsActions({ onSchoolAdded }: SchoolsActionsProps = {}) {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
    const [formData, setFormData] = useState({
      name: "",
      city: "",
      type: "" as SchoolType | "",
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validation
    if (!formData.name.trim()) {
      setError("School name is required");
      setIsSubmitting(false);
      return;
    }

    if (!formData.city.trim()) {
      setError("City is required");
      setIsSubmitting(false);
      return;
    }


    try {
      // Use the API endpoint instead of direct Supabase client
      const response = await fetch("/api/schools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          city: formData.city,
          type: formData.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create school");
      }

      const data = await response.json();
      console.log("School created successfully:", data);

      // Close modal and reset form
      setShowModal(false);
      setFormData({
        name: "",
        city: "",
        type: "",
      });

      // Show success message
      alert(`School "${data[0]?.name || 'New school'}" added successfully!`);

      // Trigger parent refresh
      if (onSchoolAdded) {
        onSchoolAdded();
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to create school");
      console.error("Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("Add School button clicked - setting showModal to true");
          setShowModal(true);
        }}
        className="relative z-20 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 active:bg-green-800 transition-colors cursor-pointer"
      >
        <span>+</span>
        <span>Add School</span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add New School</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none font-bold"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  School Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black placeholder-gray-500"
                  placeholder="e.g., Happy Kids Academy"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black placeholder-gray-500"
                  placeholder="e.g., Cape Town"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  School Type *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as SchoolType })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black bg-white"
                >
                  <option value="">Select a school type</option>
                  <option value="Preschool">Preschool</option>
                  <option value="Crèche">Crèche</option>
                  <option value="Primary">Primary</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-60"
                >
                  {isSubmitting ? "Creating..." : "Add School"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
