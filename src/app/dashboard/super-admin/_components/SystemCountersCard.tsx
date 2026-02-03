"use client";

import { useState, useEffect } from "react";
import { SystemCounters } from "@/types/schools";

interface SystemHealth {
  uptime_percentage: number;
  active_users_today: number;
  database_status: 'healthy' | 'degraded' | 'unhealthy';
  api_response_time_ms: number;
  last_check: string;
}

export default function SystemCountersCard() {
  const [counters, setCounters] = useState<SystemCounters>({
    total_schools: 0,
    active_users: 0,
  });
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch counters
      const countersRes = await fetch("/api/system/counters");
      if (countersRes.ok) {
        const countersData = await countersRes.json();
        setCounters(countersData);
      }

      // Fetch health
      const healthRes = await fetch("/api/system/health");
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Expose reload function for parent components
  useEffect(() => {
    (window as any).__reloadSystemCounters = loadData;
  }, []);

  const getHealthColor = () => {
    if (!health) return 'text-gray-600';
    if (health.database_status === 'unhealthy') return 'text-red-600';
    if (health.database_status === 'degraded') return 'text-amber-600';
    return 'text-green-600';
  };

  const getHealthStatusBadge = () => {
    if (!health) return 'bg-gray-100 text-gray-800';
    if (health.database_status === 'unhealthy') return 'bg-red-100 text-red-800';
    if (health.database_status === 'degraded') return 'bg-amber-100 text-amber-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-sm text-gray-600">Total Schools</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {loading ? "..." : counters.total_schools.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {counters.total_schools === 0 ? "No schools yet" : "Active in system"}
        </p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-sm text-gray-600">Active Users</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {loading ? "..." : counters.active_users.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-2">Across all schools</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-sm text-gray-600">Daily Logs</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {loading ? "..." : (health?.active_users_today ?? 0)}
        </p>
        <p className="text-xs text-gray-500 mt-2">Last 24 hours</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-sm text-gray-600">System Health</p>
        <p className={`text-3xl font-bold mt-2 ${getHealthColor()}`}>
          {loading ? "..." : `${health?.uptime_percentage.toFixed(2)}%`}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getHealthStatusBadge()}`}>
            {health?.database_status.charAt(0).toUpperCase()}{health?.database_status.slice(1)}
          </span>
          <span className="text-xs text-gray-500">Uptime</span>
        </div>
      </div>
    </div>
  );
}
