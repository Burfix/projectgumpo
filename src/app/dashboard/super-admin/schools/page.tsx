"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getSchools } from "@/lib/schools";

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

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    setLoading(true);
    const data = await getSchools();
    setSchools(data);
    setFilteredSchools(data);
    setLoading(false);
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
          <h1 className="text-4xl font-bold text-stone-900 mb-2">Schools Management</h1>
          <p className="text-stone-600">View and manage all registered schools</p>
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
      </div>
    </div>
  );
}
