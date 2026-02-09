"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardData {
  hasClassroom: boolean;
  classroom?: {
    id: number;
    name: string;
    age_group?: string;
    capacity: number;
  };
  stats?: {
    total_children: number;
    present_today: number;
    absent_today: number;
    incidents_today: number;
    meals_logged_today: number;
    naps_logged_today: number;
  };
}

export default function TeacherDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch("/api/teacher/stats");
      if (!response.ok) throw new Error("Failed to fetch dashboard");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data?.hasClassroom) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800">No Classroom Assigned</h2>
          <p className="text-yellow-700 mt-2">
            You haven't been assigned to a classroom yet. Please contact your school administrator.
          </p>
        </div>
      </div>
    );
  }

  const stats = data.stats!;
  const classroom = data.classroom!;

  const statCards = [
    {
      title: "Total Children",
      value: stats.total_children,
      icon: "👶",
      color: "bg-blue-500",
    },
    {
      title: "Present Today",
      value: stats.present_today,
      icon: "✅",
      color: "bg-green-500",
    },
    {
      title: "Absent Today",
      value: stats.absent_today,
      icon: "❌",
      color: "bg-red-500",
    },
    {
      title: "Incidents Today",
      value: stats.incidents_today,
      icon: "⚠️",
      color: "bg-orange-500",
    },
  ];

  const quickActions = [
    {
      title: "Mark Attendance",
      href: "/dashboard/teacher/attendance",
      icon: "✅",
      color: "bg-green-500",
      description: "Check in/out children",
    },
    {
      title: "Log Meal",
      href: "/dashboard/teacher/log-meal",
      icon: "🍽️",
      color: "bg-blue-500",
      description: "Record meals and eating",
    },
    {
      title: "Nap Timer",
      href: "/dashboard/teacher/nap-timer",
      icon: "😴",
      color: "bg-purple-500",
      description: "Start/stop nap times",
    },
    {
      title: "Report Incident",
      href: "/dashboard/teacher/report-incident",
      icon: "⚠️",
      color: "bg-red-500",
      description: "Report any incidents",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600 mt-2">
          {classroom.name} {classroom.age_group && `• ${classroom.age_group}`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} text-white p-4 rounded-full text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <div className={`${action.color} text-white rounded-lg shadow-md p-6 hover:opacity-90 transition-opacity cursor-pointer`}>
                <div className="text-4xl mb-3">{action.icon}</div>
                <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Meals Logged</span>
              <span className="text-2xl font-bold text-gray-900">{stats.meals_logged_today}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Naps Logged</span>
              <span className="text-2xl font-bold text-gray-900">{stats.naps_logged_today}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Incidents Reported</span>
              <span className="text-2xl font-bold text-gray-900">{stats.incidents_today}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Classroom Info</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Capacity</span>
              <span className="text-lg font-semibold text-gray-900">{classroom.capacity}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Enrollment</span>
              <span className="text-lg font-semibold text-gray-900">{stats.total_children}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Attendance Rate</span>
              <span className="text-lg font-semibold text-green-600">
                {stats.total_children > 0
                  ? Math.round((stats.present_today / stats.total_children) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/teacher/children">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">👶 View All Children</h3>
            <p className="text-gray-600 text-sm">See student profiles and information</p>
          </div>
        </Link>

        <Link href="/dashboard/teacher/attendance">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 Attendance History</h3>
            <p className="text-gray-600 text-sm">View past attendance records</p>
          </div>
        </Link>

        <Link href="/dashboard/teacher/report-incident">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">⚠️ Incident Reports</h3>
            <p className="text-gray-600 text-sm">View and create incident reports</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
