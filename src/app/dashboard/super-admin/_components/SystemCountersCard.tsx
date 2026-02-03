"use client";

import { useState, useEffect } from "react";
import { SystemCounters } from "@/types/schools";

export default function SystemCountersCard() {
  const [counters, setCounters] = useState<SystemCounters>({
    total_schools: 0,
    active_users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounters();
  }, []);

  const loadCounters = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/system/counters");
      if (!response.ok) throw new Error("Failed to fetch counters");
      const data = await response.json();
      setCounters(data);
    } catch (error) {
      console.error("Error loading counters:", error);
    } finally {
      setLoading(false);
    }
  };

  // Expose reload function for parent components
  useEffect(() => {
    (window as any).__reloadSystemCounters = loadCounters;
  }, []);

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
        <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        <p className="text-xs text-gray-500 mt-2">Last 24 hours</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-sm text-gray-600">System Health</p>
        <p className="text-3xl font-bold text-green-600 mt-2">99.8%</p>
        <p className="text-xs text-gray-500 mt-2">Uptime</p>
      </div>
    </div>
  );
}
