"use client";

import { protectRoute } from "@/lib/auth/middleware";
import Link from "next/link";
import { useState } from "react";

export default function RecordAttendance() {
  const [children, setChildren] = useState([
    { id: 1, name: "Ben Smith", status: "present", time: "7:45 AM" },
    { id: 2, name: "Clara Williams", status: "present", time: "8:05 AM" },
    { id: 3, name: "Ava Johnson", status: "absent", time: "" },
    { id: 4, name: "Liam Brown", status: "not-marked", time: "" },
    { id: 5, name: "Emma Davis", status: "not-marked", time: "" },
    { id: 6, name: "Oliver Wilson", status: "not-marked", time: "" },
    { id: 7, name: "Sophia Martinez", status: "not-marked", time: "" },
    { id: 8, name: "Noah Garcia", status: "not-marked", time: "" },
  ]);

  const markAttendance = (id: number, status: "present" | "absent") => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    
    setChildren(children.map(child => 
      child.id === id 
        ? { ...child, status, time: status === "present" ? timeStr : "" }
        : child
    ));
  };

  const presentCount = children.filter(c => c.status === "present").length;
  const absentCount = children.filter(c => c.status === "absent").length;
  const notMarkedCount = children.filter(c => c.status === "not-marked").length;

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Link 
            href="/dashboard/teacher"
            className="inline-flex items-center text-sm text-stone-600 hover:text-stone-900"
          >
            <span className="mr-2">←</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-stone-900">Record Attendance</h1>
          <p className="text-sm text-stone-500 mt-1">Sunflower Room • Today</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
            <p className="text-xs text-stone-500 mt-1">Present</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{absentCount}</p>
            <p className="text-xs text-stone-500 mt-1">Absent</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <p className="text-2xl font-bold text-stone-400">{notMarkedCount}</p>
            <p className="text-xs text-stone-500 mt-1">Not Marked</p>
          </div>
        </div>

        {/* Children List */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="divide-y divide-stone-100">
            {children.map((child) => (
              <div key={child.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-stone-900">{child.name}</p>
                    {child.time && (
                      <p className="text-xs text-stone-500 mt-0.5">Arrived at {child.time}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      child.status === "present"
                        ? "bg-emerald-50 text-emerald-700"
                        : child.status === "absent"
                        ? "bg-red-50 text-red-700"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {child.status === "present" ? "Present" : child.status === "absent" ? "Absent" : "Not Marked"}
                  </span>
                </div>
                
                {/* Quick Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => markAttendance(child.id, "present")}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                      child.status === "present"
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-50 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => markAttendance(child.id, "absent")}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                      child.status === "absent"
                        ? "bg-red-600 text-white"
                        : "bg-stone-50 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 pb-6">
          <Link
            href="/dashboard/teacher"
            className="block w-full px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-medium text-center"
          >
            Save Attendance
          </Link>
        </div>
      </div>
    </main>
  );
}
