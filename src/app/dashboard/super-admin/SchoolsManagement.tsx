"use client";

import { useState, useEffect } from "react";
import SchoolsActions from "./SchoolsActions";

interface School {
  id: number;
  name: string;
  location: string;
  subscription_tier: "Starter" | "Growth" | "Professional" | "Enterprise";
  account_status: "Active" | "Trial" | "Suspended";
}

interface UserStats {
  children: number;
  parents: number;
  teachers: number;
  admins: number;
}

export default function SchoolsManagement() {
  const [schools, setSchools] = useState<School[]>([]);
  const [stats, setStats] = useState<UserStats>({
    children: 0,
    parents: 0,
    teachers: 0,
    admins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch schools
      const schoolsResponse = await fetch("/api/schools");
      const schoolsData = await schoolsResponse.json();
      setSchools(schoolsData);

      // Fetch user statistics
      const statsResponse = await fetch("/api/schools/stats");
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolAdded = () => {
    loadData();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Schools Management</h2>
        <SchoolsActions onSchoolAdded={handleSchoolAdded} />
      </div>

      {/* School Statistics Summary */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-900">
              {loading ? "..." : stats.children}
            </div>
            <div className="text-xs text-blue-700 mt-1">Children</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-900">
              {loading ? "..." : stats.parents}
            </div>
            <div className="text-xs text-emerald-700 mt-1">Parents</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-900">
              {loading ? "..." : stats.teachers}
            </div>
            <div className="text-xs text-purple-700 mt-1">Teachers</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-900">
              {loading ? "..." : stats.admins}
            </div>
            <div className="text-xs text-orange-700 mt-1">Admins</div>
          </div>
        </div>

        {/* Schools List */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-pulse">Loading schools...</div>
          </div>
        ) : schools.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <p className="text-sm font-medium">No schools added yet</p>
            <p className="text-xs mt-1">Click "+ Add School" to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schools.map((school) => (
              <div
                key={school.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {school.name}
                    </h3>
                    {school.location && (
                      <p className="text-sm text-gray-600 mt-1">
                        📍 {school.location}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        school.account_status === "Active"
                          ? "bg-green-100 text-green-800"
                          : school.account_status === "Trial"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {school.account_status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {school.subscription_tier}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
