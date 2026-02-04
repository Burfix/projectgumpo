"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface OperationsSummary {
  attendance: {
    total_today: number;
    present: number;
    absent: number;
    late: number;
  };
  incidents: {
    total_today: number;
    pending: number;
    resolved: number;
  };
  meals: {
    total_today: number;
    breakfast: number;
    lunch: number;
    snack: number;
  };
  messages: {
    unread: number;
    total_today: number;
  };
}

export default function OperationsPage() {
  const [operations, setOperations] = useState<OperationsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/secondary-principal/operations");
      if (response.ok) {
        const data = await response.json();
        setOperations(data.operations);
      }
    } catch (error) {
      console.error("Error loading operations data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Operations Overview</h1>
          <LoadingSkeleton rows={8} />
        </div>
      </div>
    );
  }

  if (!operations) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Operations Overview</h1>
          <p className="text-gray-600">Unable to load operations data.</p>
        </div>
      </div>
    );
  }

  const attendanceRate = operations.attendance.total_today > 0
    ? (operations.attendance.present / operations.attendance.total_today) * 100
    : 0;

  const incidentResolutionRate = operations.incidents.total_today > 0
    ? (operations.incidents.resolved / operations.incidents.total_today) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Operations Overview</h1>
          <p className="text-gray-600 mt-2">Monitor daily activities and operations</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Attendance Rate"
            value={`${attendanceRate.toFixed(0)}%`}
            subtitle={`${operations.attendance.present} of ${operations.attendance.total_today} present`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Pending Incidents"
            value={operations.incidents.pending}
            subtitle={`${operations.incidents.total_today} total today`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
          <StatCard
            title="Meals Logged"
            value={operations.meals.total_today}
            subtitle="Today's meal count"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
          />
          <StatCard
            title="Unread Messages"
            value={operations.messages.unread}
            subtitle={`${operations.messages.total_today} sent today`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Breakdown */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Attendance Breakdown</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Present</span>
                <div className="flex items-center gap-2">
                  <Badge variant="success">{operations.attendance.present}</Badge>
                  <span className="text-sm text-gray-500">
                    ({operations.attendance.total_today > 0 
                      ? ((operations.attendance.present / operations.attendance.total_today) * 100).toFixed(0)
                      : 0}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Absent</span>
                <div className="flex items-center gap-2">
                  <Badge variant="danger">{operations.attendance.absent}</Badge>
                  <span className="text-sm text-gray-500">
                    ({operations.attendance.total_today > 0 
                      ? ((operations.attendance.absent / operations.attendance.total_today) * 100).toFixed(0)
                      : 0}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Late</span>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">{operations.attendance.late}</Badge>
                  <span className="text-sm text-gray-500">
                    ({operations.attendance.total_today > 0 
                      ? ((operations.attendance.late / operations.attendance.total_today) * 100).toFixed(0)
                      : 0}%)
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-gray-900">Total</span>
                  <Badge variant="info">{operations.attendance.total_today}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Incidents Overview */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Incidents Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending</span>
                <Badge variant="warning">{operations.incidents.pending}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Resolved</span>
                <Badge variant="success">{operations.incidents.resolved}</Badge>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-gray-900">Total Today</span>
                  <Badge variant="info">{operations.incidents.total_today}</Badge>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <span className="font-medium">Resolution Rate:</span> {incidentResolutionRate.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          {/* Meals Breakdown */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Meals Breakdown</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Breakfast</span>
                <Badge variant="info">{operations.meals.breakfast}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Lunch</span>
                <Badge variant="success">{operations.meals.lunch}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Snack</span>
                <Badge variant="warning">{operations.meals.snack}</Badge>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-gray-900">Total Meals</span>
                  <Badge variant="default">{operations.meals.total_today}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Summary */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Unread Messages</span>
                <Badge variant={operations.messages.unread > 0 ? "warning" : "success"}>
                  {operations.messages.unread}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sent Today</span>
                <Badge variant="info">{operations.messages.total_today}</Badge>
              </div>
              {operations.messages.unread > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-900">
                    You have {operations.messages.unread} unread message
                    {operations.messages.unread !== 1 ? "s" : ""} requiring attention.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
