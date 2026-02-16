"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AuditLog = {
  id: number;
  user_id: string;
  school_id: number | null;
  action: string;
  details: string | null;
  ip_address: string | null;
  created_at: string;
  users?: { name: string | null; email: string | null };
  schools?: { name: string };
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7");

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter, dateRange]);

  async function fetchAuditLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (actionFilter !== "all") {
        params.append("action", actionFilter);
      }

      if (dateRange !== "all") {
        const days = parseInt(dateRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        params.append("startDate", startDate.toISOString());
      }

      params.append("limit", "200");

      const response = await fetch(`/api/super-admin/audit-logs?${params}`);
      if (!response.ok) throw new Error("Failed to fetch audit logs");
      
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      alert("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = logs.filter((log) => {
    if (searchQuery === "") return true;
    
    const search = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(search) ||
      log.users?.email?.toLowerCase().includes(search) ||
      log.users?.name?.toLowerCase().includes(search) ||
      log.schools?.name?.toLowerCase().includes(search) ||
      log.details?.toLowerCase().includes(search)
    );
  });

  const getActionColor = (action: string) => {
    if (action.includes("create") || action.includes("invite")) {
      return "text-green-700 bg-green-50";
    }
    if (action.includes("delete") || action.includes("remove")) {
      return "text-red-700 bg-red-50";
    }
    if (action.includes("update") || action.includes("change")) {
      return "text-blue-700 bg-blue-50";
    }
    return "text-gray-700 bg-gray-50";
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
              <p className="text-sm text-gray-600">System activity and user actions</p>
            </div>
            <Link
              href="/dashboard/super-admin"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="🔍 Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="invite">Invite</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading audit logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-600">
              No audit logs found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      School
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {log.users?.name || log.users?.email || "Unknown"}
                        </div>
                        {log.users?.name && log.users?.email && (
                          <div className="text-xs text-gray-500">{log.users.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded ${getActionColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.schools?.name || (
                          <span className="text-gray-400">System</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                        {log.details || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {log.ip_address || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
