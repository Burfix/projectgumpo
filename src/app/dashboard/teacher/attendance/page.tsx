"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  status: "present" | "absent" | "late" | "not-marked";
  time?: string;
  notes?: string;
}

export default function RecordAttendance() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

  async function loadChildren() {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/teacher/classroom/children');
      // const data = await response.json();
      
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      setChildren([
        { id: 1, first_name: "Ben", last_name: "Smith", status: "not-marked" },
        { id: 2, first_name: "Clara", last_name: "Williams", status: "not-marked" },
        { id: 3, first_name: "Ava", last_name: "Johnson", status: "not-marked" },
        { id: 4, first_name: "Liam", last_name: "Brown", status: "not-marked" },
        { id: 5, first_name: "Emma", last_name: "Davis", status: "not-marked" },
      ]);
    } catch (err) {
      setError("Failed to load children");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const markAttendance = (id: number, status: "present" | "absent" | "late") => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    
    setChildren(children.map(child => 
      child.id === id 
        ? { ...child, status, time: status !== "absent" ? timeStr : undefined }
        : child
    ));
  };

  const addNotes = (id: number, notes: string) => {
    setChildren(children.map(child => 
      child.id === id ? { ...child, notes } : child
    ));
  };

  async function saveAttendance() {
    try {
      setSaving(true);
      setError(null);
      
      const attendanceRecords = children
        .filter(c => c.status !== "not-marked")
        .map(c => ({
          child_id: c.id,
          status: c.status,
          time: c.time,
          notes: c.notes,
          date: new Date().toISOString().split('T')[0]
        }));

      // TODO: Replace with actual API call
      // await fetch('/api/teacher/attendance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ records: attendanceRecords })
      // });

      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save attendance");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const presentCount = children.filter(c => c.status === "present").length;
  const absentCount = children.filter(c => c.status === "absent").length;
  const lateCount = children.filter(c => c.status === "late").length;
  const notMarkedCount = children.filter(c => c.status === "not-marked").length;

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link 
            href="/dashboard/teacher"
            className="inline-flex items-center text-sm text-stone-600 hover:text-stone-900"
          >
            <span className="mr-2">←</span>
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-lg font-semibold text-stone-900">Record Attendance</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 text-sm">✓ Attendance saved successfully</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg p-4 border border-stone-200 text-center">
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <div className="text-xs text-stone-600 mt-1">Present</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-stone-200 text-center">
            <div className="text-2xl font-bold text-orange-600">{lateCount}</div>
            <div className="text-xs text-stone-600 mt-1">Late</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-stone-200 text-center">
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
            <div className="text-xs text-stone-600 mt-1">Absent</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-stone-200 text-center">
            <div className="text-2xl font-bold text-gray-400">{notMarkedCount}</div>
            <div className="text-xs text-stone-600 mt-1">Pending</div>
          </div>
        </div>

        {/* Date Display */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-stone-200">
          <p className="text-sm text-stone-600">
            Recording attendance for <strong>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong>
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-green-600"></div>
            <p className="text-stone-600 mt-2">Loading children...</p>
          </div>
        )}

        {/* Children List */}
        {!loading && (
          <>
            <div className="space-y-3 mb-6">
              {children.map((child) => (
                <div 
                  key={child.id}
                  className="bg-white rounded-lg p-4 border border-stone-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-stone-700">
                          {child.first_name[0]}{child.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-stone-900">
                          {child.first_name} {child.last_name}
                        </div>
                        {child.time && (
                          <div className="text-xs text-stone-500">{child.time}</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    {child.status !== "not-marked" && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        child.status === "present" ? "bg-green-100 text-green-700" :
                        child.status === "late" ? "bg-orange-100 text-orange-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {child.status.charAt(0).toUpperCase() + child.status.slice(1)}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => markAttendance(child.id, "present")}
                      className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                        child.status === "present"
                          ? "bg-green-600 text-white"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => markAttendance(child.id, "late")}
                      className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                        child.status === "late"
                          ? "bg-orange-600 text-white"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      Late
                    </button>
                    <button
                      onClick={() => markAttendance(child.id, "absent")}
                      className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
                        child.status === "absent"
                          ? "bg-red-600 text-white"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      Absent
                    </button>
                  </div>

                  {/* Notes Field */}
                  {child.status !== "not-marked" && (
                    <input
                      type="text"
                      placeholder="Add notes (optional)"
                      value={child.notes || ""}
                      onChange={(e) => addNotes(child.id, e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Save Button */}
            <button
              onClick={saveAttendance}
              disabled={saving || notMarkedCount === children.length}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
