"use client";

import { useEffect, useState } from "react";

interface AttendanceReport {
  classroom_name: string;
  total_children: number;
  present_count: number;
  absent_count: number;
  attendance_percentage: number;
}

interface IncidentReport {
  id: number;
  child_name: string;
  classroom_name: string;
  incident_type: string;
  severity: string;
  description: string;
  date: string;
}

interface ParentEngagement {
  total_parents: number;
  active_parents: number;
  engagement_rate: number;
  avg_logins_per_week: number;
}

type ReportType = "attendance" | "incidents" | "engagement";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportType>("attendance");
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("7");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Report data
  const [attendanceData, setAttendanceData] = useState<AttendanceReport[]>([]);
  const [incidentData, setIncidentData] = useState<IncidentReport[]>([]);
  const [engagementData, setEngagementData] = useState<ParentEngagement | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [activeTab, dateRange, startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: activeTab,
        dateRange,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const response = await fetch(`/api/admin/reports?${params}`);
      if (!response.ok) throw new Error("Failed to fetch report data");
      
      const data = await response.json();
      
      if (activeTab === "attendance") {
        setAttendanceData(data);
      } else if (activeTab === "incidents") {
        setIncidentData(data);
      } else if (activeTab === "engagement") {
        setEngagementData(data);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      alert("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = "";
    let filename = "";

    if (activeTab === "attendance") {
      csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Classroom,Total Children,Present,Absent,Attendance %\n";
      attendanceData.forEach((row) => {
        csvContent += `"${row.classroom_name}",${row.total_children},${row.present_count},${row.absent_count},${row.attendance_percentage.toFixed(1)}\n`;
      });
      filename = `attendance_report_${dateRange}days.csv`;
    } else if (activeTab === "incidents") {
      csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Date,Child,Classroom,Type,Severity,Description\n";
      incidentData.forEach((row) => {
        csvContent += `"${row.date}","${row.child_name}","${row.classroom_name}","${row.incident_type}","${row.severity}","${row.description}"\n`;
      });
      filename = `incident_report_${dateRange}days.csv`;
    } else if (activeTab === "engagement" && engagementData) {
      csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Metric,Value\n";
      csvContent += `Total Parents,${engagementData.total_parents}\n`;
      csvContent += `Active Parents,${engagementData.active_parents}\n`;
      csvContent += `Engagement Rate,${engagementData.engagement_rate.toFixed(1)}%\n`;
      csvContent += `Avg Logins/Week,${engagementData.avg_logins_per_week.toFixed(1)}\n`;
      filename = "parent_engagement_report.csv";
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <button
          onClick={handleExportCSV}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
        >
          📥 Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === "attendance"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            📊 Attendance Summary
          </button>
          <button
            onClick={() => setActiveTab("incidents")}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === "incidents"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            ⚠️ Incident Reports
          </button>
          <button
            onClick={() => setActiveTab("engagement")}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === "engagement"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            👥 Parent Engagement
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-4">
          <label className="font-medium text-gray-700">Date Range:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateRange === "custom" && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Attendance Report */}
      {!loading && activeTab === "attendance" && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {attendanceData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No attendance data available for this period.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classroom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Children
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {row.classroom_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.total_children}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {row.present_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {row.absent_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          row.attendance_percentage >= 90
                            ? "bg-green-100 text-green-800"
                            : row.attendance_percentage >= 75
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {row.attendance_percentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Incident Report */}
      {!loading && activeTab === "incidents" && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {incidentData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No incidents reported for this period.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Child
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classroom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incidentData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(row.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {row.child_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.classroom_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.incident_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          row.severity === "minor"
                            ? "bg-yellow-100 text-yellow-800"
                            : row.severity === "moderate"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {row.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                      {row.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Parent Engagement Report */}
      {!loading && activeTab === "engagement" && engagementData && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-sm font-medium text-blue-600 mb-2">
                Total Parents
              </div>
              <div className="text-3xl font-bold text-blue-900">
                {engagementData.total_parents}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <div className="text-sm font-medium text-green-600 mb-2">
                Active Parents
              </div>
              <div className="text-3xl font-bold text-green-900">
                {engagementData.active_parents}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <div className="text-sm font-medium text-purple-600 mb-2">
                Engagement Rate
              </div>
              <div className="text-3xl font-bold text-purple-900">
                {engagementData.engagement_rate.toFixed(1)}%
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-6">
              <div className="text-sm font-medium text-orange-600 mb-2">
                Avg Logins/Week
              </div>
              <div className="text-3xl font-bold text-orange-900">
                {engagementData.avg_logins_per_week.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Engagement Insights
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>
                • {engagementData.active_parents} out of{" "}
                {engagementData.total_parents} parents have logged in within the
                last 30 days
              </li>
              <li>
                • Overall parent engagement rate is{" "}
                {engagementData.engagement_rate >= 70 ? "healthy" : "needs improvement"}
              </li>
              <li>
                • Parents log in an average of{" "}
                {engagementData.avg_logins_per_week.toFixed(1)} times per week
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
