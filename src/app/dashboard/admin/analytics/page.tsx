"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface DashboardStats {
  totalChildren: number;
  totalTeachers: number;
  avgAttendanceRate: number;
  activeIncidents: number;
  attendanceTrend: { date: string; rate: number }[];
  incidentsByType: { type: string; count: number }[];
  mealParticipation: { meal: string; percentage: number }[];
  classroomUtilization: { classroom: string; enrolled: number; capacity: number }[];
}

export default function AnalyticsDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockStats: DashboardStats = {
        totalChildren: 85,
        totalTeachers: 12,
        avgAttendanceRate: 94.5,
        activeIncidents: 3,
        attendanceTrend: [
          { date: "Mon", rate: 95 },
          { date: "Tue", rate: 93 },
          { date: "Wed", rate: 96 },
          { date: "Thu", rate: 94 },
          { date: "Fri", rate: 92 },
        ],
        incidentsByType: [
          { type: "Minor injury", count: 8 },
          { type: "Conflict", count: 3 },
          { type: "Fall", count: 5 },
          { type: "Illness", count: 2 },
        ],
        mealParticipation: [
          { meal: "Breakfast", percentage: 87 },
          { meal: "Lunch", percentage: 98 },
          { meal: "Snack", percentage: 92 },
        ],
        classroomUtilization: [
          { classroom: "Sunflower Room", enrolled: 18, capacity: 20 },
          { classroom: "Rainbow Room", enrolled: 20, capacity: 20 },
          { classroom: "Stars Room", enrolled: 22, capacity: 25 },
          { classroom: "Ocean Room", enrolled: 15, capacity: 18 },
        ],
      };

      setStats(mockStats);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  function getUtilizationColor(percentage: number) {
    if (percentage >= 95) return "text-red-600";
    if (percentage >= 80) return "text-orange-600";
    return "text-green-600";
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link
          href="/dashboard/admin"
          className="text-sm text-purple-600 hover:text-purple-800 mb-6 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Real-time insights and performance metrics</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Children</p>
                  <span className="text-2xl">👶</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalChildren}</p>
                <p className="text-xs text-green-600 mt-1">↑ 5% from last {timeRange}</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Teachers</p>
                  <span className="text-2xl">👩‍🏫</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTeachers}</p>
                <p className="text-xs text-gray-500 mt-1">Fully staffed</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Avg Attendance</p>
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{stats.avgAttendanceRate}%</p>
                <p className="text-xs text-green-600 mt-1">↑ 2% from last {timeRange}</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Active Incidents</p>
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-3xl font-bold text-orange-600">{stats.activeIncidents}</p>
                <p className="text-xs text-green-600 mt-1">↓ 1 from last {timeRange}</p>
              </div>
            </div>

            {/* Attendance Trend Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend</h2>
              <div className="space-y-3">
                {stats.attendanceTrend.map((day, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600 w-12">{day.date}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full flex items-center justify-end pr-3"
                        style={{ width: `${day.rate}%` }}
                      >
                        <span className="text-xs font-semibold text-white">{day.rate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Incidents and Meals Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Incidents by Type */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Incidents by Type</h2>
                <div className="space-y-3">
                  {stats.incidentsByType.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{item.type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${(item.count / 20) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-6">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meal Participation */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Meal Participation</h2>
                <div className="space-y-4">
                  {stats.mealParticipation.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700">{item.meal}</span>
                        <span className="text-sm font-semibold text-gray-900">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Classroom Utilization */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Classroom Utilization</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classroom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.classroomUtilization.map((room, idx) => {
                      const utilization = (room.enrolled / room.capacity) * 100;
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{room.classroom}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{room.enrolled}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{room.capacity}</td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-100 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    utilization >= 95 ? "bg-red-500" :
                                    utilization >= 80 ? "bg-orange-500" :
                                    "bg-green-500"
                                  }`}
                                  style={{ width: `${utilization}%` }}
                                />
                              </div>
                              <span className={`text-sm font-semibold ${getUtilizationColor(utilization)}`}>
                                {utilization.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              utilization >= 100 ? "bg-red-100 text-red-800" :
                              utilization >= 90 ? "bg-orange-100 text-orange-800" :
                              "bg-green-100 text-green-800"
                            }`}>
                              {utilization >= 100 ? "Full" : utilization >= 90 ? "Near Full" : "Available"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Failed to load analytics data</p>
          </div>
        )}
      </div>
    </main>
  );
}
