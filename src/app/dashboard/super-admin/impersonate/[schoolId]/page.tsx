"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface School {
  id: number;
  name: string;
  location: string;
  subscription_tier: string;
  account_status: string;
  child_count: number;
  teacher_count: number;
}

export default function ImpersonateSchool({
  params,
}: {
  params: { schoolId: string };
}) {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchool = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/schools/${params.schoolId}`);
        const data = await response.json();
        setSchool(data);
      } catch (error) {
        console.error("Error loading school:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSchool();
  }, [params.schoolId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600">Loading school details...</div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-stone-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/dashboard/super-admin/schools"
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Schools
          </Link>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-stone-600">School not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Impersonation Banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-amber-900">
                Viewing as Super Admin — <span className="font-bold">{school.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/super-admin/schools"
                className="px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded hover:bg-amber-700 transition-colors"
              >
                Exit Impersonation
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-stone-900 mb-2">{school.name}</h1>
          <div className="flex items-center gap-4 text-stone-600">
            <span>{school.location}</span>
            <span>•</span>
            <span>{school.child_count} Children</span>
            <span>•</span>
            <span>{school.teacher_count} Teachers</span>
            <span>•</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                school.account_status === "Active"
                  ? "bg-green-200 text-green-800"
                  : "bg-amber-200 text-amber-800"
              }`}
            >
              {school.account_status}
            </span>
          </div>
        </div>

        {/* Management Dashboard Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Link Parent to Child */}
          <Link
            href={`/dashboard/super-admin/impersonate/${params.schoolId}/link-parent-to-child`}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-blue-600"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">👨‍👩‍👧</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 mb-1">
                  Link Parent to Child
                </h3>
                <p className="text-sm text-stone-600">
                  Create parent-child relationships
                </p>
              </div>
            </div>
          </Link>

          {/* Assign Teacher to Class */}
          <Link
            href={`/dashboard/super-admin/impersonate/${params.schoolId}/assign-teacher-to-class`}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-purple-600"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg">👨‍🏫</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 mb-1">
                  Assign Teacher to Class
                </h3>
                <p className="text-sm text-stone-600">
                  Manage teacher-classroom assignments
                </p>
              </div>
            </div>
          </Link>

          {/* Manage Users */}
          <Link
            href={`/dashboard/super-admin/impersonate/${params.schoolId}/manage-users`}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-indigo-600"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 text-lg">👥</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 mb-1">
                  Manage Users
                </h3>
                <p className="text-sm text-stone-600">
                  View and manage school users
                </p>
              </div>
            </div>
          </Link>

          {/* View Reports */}
          <Link
            href={`/dashboard/super-admin/impersonate/${params.schoolId}/view-reports`}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-orange-600"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-lg">📊</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 mb-1">
                  View Reports
                </h3>
                <p className="text-sm text-stone-600">
                  Access daily, weekly, and monthly reports
                </p>
              </div>
            </div>
          </Link>

          {/* School Settings */}
          <Link
            href={`/dashboard/super-admin/impersonate/${params.schoolId}/school-settings`}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-pink-600"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <span className="text-pink-600 text-lg">⚙️</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 mb-1">
                  School Settings
                </h3>
                <p className="text-sm text-stone-600">
                  Configure school information and policies
                </p>
              </div>
            </div>
          </Link>

          {/* Billing Info */}
          <Link
            href={`/dashboard/super-admin/impersonate/${params.schoolId}/billing`}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-emerald-600"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-emerald-600 text-lg">💰</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 mb-1">
                  Billing & Add-ons
                </h3>
                <p className="text-sm text-stone-600">
                  View subscription and billing details
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-stone-100 rounded-lg p-4">
          <p className="text-sm text-stone-700">
            <strong>Note:</strong> You are viewing this school as a Super Admin. You
            cannot modify passwords, access private parent/teacher data outside normal
            admin visibility, or make permanent changes without authorization. All
            actions are logged for audit purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
