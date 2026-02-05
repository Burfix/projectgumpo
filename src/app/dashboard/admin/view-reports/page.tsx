"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

type ReportType = "attendance" | "incidents" | "meals" | "naps" | "overview";
type DateRange = "today" | "week" | "month" | "custom";

interface AttendanceData {
  date: string;
  present: number;
  absent: number;
  late: number;
  total: number;
}

interface IncidentData {
  date: string;
  child_name: string;
  incident_type: string;
  severity: string;
  teacher_name: string;
}

interface ReportData {
  attendance?: AttendanceData[];
  incidents?: IncidentData[];
  meals?: any[];
  naps?: any[];
  summary?: {
    total_children: number;
    avg_attendance_rate: number;
    total_incidents: number;
    total_meals_logged: number;
  };
}

export default function ViewReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("overview");
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [classroomFilter, setClassroomFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [exporting, setExporting] = useState(false);

  const classrooms = [
    { id: "all", name: "All Classrooms" },
    { id: "1", name: "Sunflower Room" },
    { id: "2", name: "Rainbow Room" },
    { id: "3", name: "Stars Room" },
    { id: "4", name: "Ocean Room" },
  ];

  useEffect(() => {
    if (reportType && dateRange) {
      fetchReportData();
    }
  }, [reportType, dateRange, classroomFilter]);

  async function fetchReportData() {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data based on report type
      const mockData: ReportData = {
        summary: {
          total_children: 85,
          avg_attendance_rate: 94.5,
          total_incidents: 12,
          total_meals_logged: 456,
        },
        attendance: [
          { date: "2026-02-05", present: 78, absent: 4, late: 3, total: 85 },
          { date: "2026-02-04", present: 80, absent: 3, late: 2, total: 85 },
          { date: "2026-02-03", present: 79, absent: 5, late: 1, total: 85 },
        ],
        incidents: [
          { date: "2026-02-05", child_name: "Emma Johnson", incident_type: "Minor injury", severity: "minor", teacher_name: "Sarah Johnson" },
          { date: "2026-02-04", child_name: "Oliver Smith", incident_type: "Conflict with another child", severity: "moderate", teacher_name: "Emily Chen" },
          { date: "2026-02-03", child_name: "Sophia Williams", incident_type: "Fall or tumble", severity: "minor", teacher_name: "David Williams" },
        ],
      };

      setReportData(mockData);
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function exportReport(format: "csv" | "pdf") {
    setExporting(true);
    try {
      // TODO: Implement actual export logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (format === "csv") {
        // Generate CSV content
        let csvContent = "";
        
        if (reportType === "attendance" && reportData?.attendance) {
          csvContent = "Date,Present,Absent,Late,Total,Attendance Rate\n";
          reportData.attendance.forEach(row => {
            const rate = ((row.present / row.total) * 100).toFixed(1);
            csvContent += `${row.date},${row.present},${row.absent},${row.late},${row.total},${rate}%\n`;
          });
        } else if (reportType === "incidents" && reportData?.incidents) {
          csvContent = "Date,Child Name,Incident Type,Severity,Teacher\n";
          reportData.incidents.forEach(row => {
            csvContent += `${row.date},${row.child_name},${row.incident_type},${row.severity},${row.teacher_name}\n`;
          });
        }

        // Create download link
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${reportType}_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // PDF export would require a library like jsPDF
        alert("PDF export will be available soon. Please use CSV for now.");
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export report");
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link
          href="/dashboard/admin"
          className="text-sm text-orange-600 hover:text-orange-800 mb-6 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">Generate and export comprehensive school reports</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => exportReport("csv")}
              disabled={exporting || !reportData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm"
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
            <button
              onClick={() => exportReport("pdf")}
              disabled={exporting || !reportData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm"
            >
              {exporting ? "Exporting..." : "Export PDF"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="overview">Overview</option>
                <option value="attendance">Attendance</option>
                <option value="incidents">Incidents</option>
                <option value="meals">Meals</option>
                <option value="naps">Naps</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classroom
              </label>
              <select
                value={classroomFilter}
                onChange={(e) => setClassroomFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                &nbsp;
              </label>
              <button
                onClick={fetchReportData}
                disabled={loading}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 font-medium"
              >
                {loading ? "Loading..." : "Generate Report"}
              </button>
            </div>
          </div>

          {dateRange === "custom" && (
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Report Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-600"></div>
            <p className="mt-4 text-gray-600">Generating report...</p>
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            {/* Summary Stats */}
            {reportData.summary && reportType === "overview" && (
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Total Children</p>
                  <p className="text-3xl font-bold text-gray-900">{reportData.summary.total_children}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Avg Attendance</p>
                  <p className="text-3xl font-bold text-green-600">{reportData.summary.avg_attendance_rate}%</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Incidents</p>
                  <p className="text-3xl font-bold text-orange-600">{reportData.summary.total_incidents}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Meals Logged</p>
                  <p className="text-3xl font-bold text-blue-600">{reportData.summary.total_meals_logged}</p>
                </div>
              </div>
            )}

            {/* Attendance Table */}
            {reportData.attendance && (reportType === "attendance" || reportType === "overview") && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">Attendance Report</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportData.attendance.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{new Date(row.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm text-green-600 font-semibold">{row.present}</td>
                          <td className="px-6 py-4 text-sm text-red-600 font-semibold">{row.absent}</td>
                          <td className="px-6 py-4 text-sm text-orange-600 font-semibold">{row.late}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{row.total}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {((row.present / row.total) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Incidents Table */}
            {reportData.incidents && (reportType === "incidents" || reportType === "overview") && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">Incident Report</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Child</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Incident Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportData.incidents.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{new Date(row.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{row.child_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{row.incident_type}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row.severity === "serious" ? "bg-red-100 text-red-800" :
                              row.severity === "moderate" ? "bg-orange-100 text-orange-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {row.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{row.teacher_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Select filters and click "Generate Report" to view data</p>
          </div>
        )}
      </div>
    </main>
  );
}
