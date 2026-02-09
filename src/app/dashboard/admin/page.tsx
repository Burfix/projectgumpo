"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardStats {
  school: any;
  stats: {
    children: number;
    teachers: number;
    parents: number;
    classrooms: number;
  };
  recentActivities: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch dashboard data");
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error("Dashboard error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Access Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="text-sm text-red-600 space-y-2">
            <p><strong>Common fixes:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Make sure you are logged in</li>
              <li>Verify your account has ADMIN or PRINCIPAL role</li>
              <li>Check that your account is associated with a school</li>
            </ul>
          </div>
          <div className="mt-4">
            <a
              href="/auth/login"
              className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      title: "Total Children",
      value: data.stats.children,
      icon: "👶",
      href: "/dashboard/admin/children",
      color: "bg-blue-500",
    },
    {
      title: "Teachers",
      value: data.stats.teachers,
      icon: "👨‍🏫",
      href: "/dashboard/admin/teachers",
      color: "bg-green-500",
    },
    {
      title: "Parents",
      value: data.stats.parents,
      icon: "👨‍👩‍👧",
      href: "/dashboard/admin/parents",
      color: "bg-purple-500",
    },
    {
      title: "Classrooms",
      value: data.stats.classrooms,
      icon: "🏫",
      href: "/dashboard/admin/classrooms",
      color: "bg-orange-500",
    },
  ];

  const quickActions = [
    { title: "Add Child", href: "/dashboard/admin/children", icon: "➕", color: "bg-blue-100 text-blue-700" },
    { title: "Invite Teacher", href: "/dashboard/admin/teachers", icon: "✉️", color: "bg-green-100 text-green-700" },
    { title: "Create Classroom", href: "/dashboard/admin/classrooms", icon: "🏗️", color: "bg-orange-100 text-orange-700" },
    { title: "School Settings", href: "/dashboard/admin/settings", icon: "⚙️", color: "bg-gray-100 text-gray-700" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        {data.school && (
          <p className="text-gray-600 mt-2">
            {data.school.name} • {data.school.school_type || "School"}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
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
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <div className={`${action.color} rounded-lg p-4 hover:opacity-80 transition-opacity cursor-pointer`}>
                <div className="text-2xl mb-2">{action.icon}</div>
                <p className="font-medium">{action.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/admin/children">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">👶 Manage Children</h3>
            <p className="text-gray-600 text-sm">Add, edit, and manage student records</p>
          </div>
        </Link>
        
        <Link href="/dashboard/admin/teachers">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">👨‍🏫 Manage Teachers</h3>
            <p className="text-gray-600 text-sm">Invite and manage teaching staff</p>
          </div>
        </Link>
        
        <Link href="/dashboard/admin/parents">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">👨‍👩‍👧 Manage Parents</h3>
            <p className="text-gray-600 text-sm">Invite parents and link to children</p>
          </div>
        </Link>
        
        <Link href="/dashboard/admin/classrooms">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🏫 Manage Classrooms</h3>
            <p className="text-gray-600 text-sm">Create and organize classrooms</p>
          </div>
        </Link>
        
        <Link href="/dashboard/admin/settings">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">⚙️ School Settings</h3>
            <p className="text-gray-600 text-sm">Configure school information</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
