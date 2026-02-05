"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface School {
  id: number;
  name: string;
  location: string;
  subscription_tier: "Starter" | "Growth" | "Professional" | "Enterprise";
  account_status: "Active" | "Trial" | "Suspended";
  child_count: number;
  teacher_count: number;
}

export default function SchoolsManagement() {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    type: "",
    subscription_tier: "Starter" as const,
    account_status: "Trial" as const,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/schools");
      const data = await response.json();
      setSchools(data);
      setFilteredSchools(data);
    } catch (error) {
      console.error("Error loading schools:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let results = schools;

    if (searchTerm) {
      results = results.filter((school) =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (tierFilter) {
      results = results.filter((school) => school.subscription_tier === tierFilter);
    }

    if (statusFilter) {
      results = results.filter((school) => school.account_status === statusFilter);
    }

    setFilteredSchools(results);
  }, [searchTerm, tierFilter, statusFilter, schools]);

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    console.log("🔵 [FRONTEND] Starting school creation...");
    console.log("🔵 [FRONTEND] Form data:", formData);

    try {
      console.log("🔵 [FRONTEND] Sending POST request to /api/schools...");
      
      // Only send the fields that the API expects
      const requestBody = {
        name: formData.name,
        city: formData.city,
        type: formData.type,
      };
      console.log("🔵 [FRONTEND] Request body:", requestBody);
      
      const response = await fetch("/api/schools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log("🔵 [FRONTEND] Response status:", response.status);
      console.log("🔵 [FRONTEND] Response ok:", response.ok);

      if (!response.ok) {
        const data = await response.json();
        console.error("🔴 [FRONTEND] Error response data:", data);
        console.error("🔴 [FRONTEND] Full error details:", JSON.stringify(data, null, 2));
        throw new Error(data.error || data.message || "Failed to create school");
      }

      const successData = await response.json();
      console.log("✅ [FRONTEND] School created successfully:", successData);

      // Reload schools list
      await loadSchools();
      setShowAddModal(false);
      setFormData({
        name: "",
        city: "",
        type: "",
        subscription_tier: "Starter",
        account_status: "Trial",
      });
    } catch (err: any) {
      console.error("🔴 [FRONTEND] Caught error:", err);
      console.error("🔴 [FRONTEND] Error message:", err.message);
      console.error("🔴 [FRONTEND] Error stack:", err.stack);
      setError(err.message || "Failed to create school");
      console.error("Error creating school:", err);
    } finally {
      console.log("🔵 [FRONTEND] Finished submission, isSubmitting = false");
      setIsSubmitting(false);
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "Starter":
        return "bg-stone-200 text-stone-800";
      case "Growth":
        return "bg-emerald-200 text-emerald-800";
      case "Professional":
        return "bg-blue-200 text-blue-800";
      case "Enterprise":
        return "bg-purple-200 text-purple-800";
      default:
        return "bg-stone-200 text-stone-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-200 text-green-800";
      case "Trial":
        return "bg-amber-200 text-amber-800";
      case "Suspended":
        return "bg-red-200 text-red-800";
      default:
        return "bg-stone-200 text-stone-800";
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/super-admin"
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-stone-900 mb-2">Schools Management</h1>
              <p className="text-stone-600">View and manage all registered schools</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm transition-colors"
            >
              + Add School
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Search by School Name
              </label>
              <input
                type="text"
                placeholder="Type school name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Tier Filter */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Filter by Tier
              </label>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Tiers</option>
                <option value="Starter">Starter</option>
                <option value="Growth">Growth</option>
                <option value="Professional">Professional</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Trial">Trial</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-stone-600">
          Showing {filteredSchools.length} of {schools.length} schools
        </div>

        {/* Schools Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-stone-600">Loading schools...</div>
          ) : filteredSchools.length === 0 ? (
            <div className="p-12 text-center text-stone-600">No schools found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-100 border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-900">
                      School Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-900">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-900">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-stone-900">
                      Children
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-stone-900">
                      Teachers
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-stone-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredSchools.map((school) => (
                    <tr
                      key={school.id}
                      className="hover:bg-stone-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-stone-900">
                        {school.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600">
                        {school.location || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getTierBadgeColor(
                            school.subscription_tier
                          )}`}
                        >
                          {school.subscription_tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            school.account_status
                          )}`}
                        >
                          {school.account_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600 text-center">
                        {school.child_count}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600 text-center">
                        {school.teacher_count}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <Link
                          href={`/dashboard/super-admin/impersonate/${school.id}`}
                          className="inline-block px-3 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 transition-colors"
                        >
                          View School
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add School Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-stone-900">Add New School</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setError("");
                  }}
                  className="text-stone-500 hover:text-stone-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleAddSchool} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    School Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., Happy Kids Academy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., Cape Town"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    School Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    <option value="Crèche">Crèche</option>
                    <option value="Primary">Primary</option>
                    <option value="High School">High School</option>
                    <option value="Combined">Combined</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Subscription Tier
                  </label>
                  <select
                    value={formData.subscription_tier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subscription_tier: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Growth">Growth</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={formData.account_status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        account_status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="Trial">Trial</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setError("");
                    }}
                    className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-60"
                  >
                    {isSubmitting ? "Creating..." : "Add School"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
