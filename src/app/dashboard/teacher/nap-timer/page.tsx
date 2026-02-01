"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function NapTimer() {
  const [children, setChildren] = useState([
    { id: 1, name: "Ben Smith", napStatus: "awake", startTime: null as Date | null, endTime: null as Date | null },
    { id: 2, name: "Clara Williams", napStatus: "awake", startTime: null as Date | null, endTime: null as Date | null },
    { id: 3, name: "Ava Johnson", napStatus: "awake", startTime: null as Date | null, endTime: null as Date | null },
    { id: 4, name: "Liam Brown", napStatus: "awake", startTime: null as Date | null, endTime: null as Date | null },
    { id: 5, name: "Emma Davis", napStatus: "awake", startTime: null as Date | null, endTime: null as Date | null },
    { id: 6, name: "Oliver Wilson", napStatus: "awake", startTime: null as Date | null, endTime: null as Date | null },
    { id: 7, name: "Sophia Martinez", napStatus: "awake", startTime: null as Date | null, endTime: null as Date | null },
    { id: 8, name: "Noah Garcia", napStatus: "awake", startTime: null as Date | null, endTime: null as Date | null },
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const startNap = (id: number) => {
    setChildren(children.map(child =>
      child.id === id
        ? { ...child, napStatus: "napping", startTime: new Date(), endTime: null }
        : child
    ));
  };

  const endNap = (id: number) => {
    setChildren(children.map(child =>
      child.id === id
        ? { ...child, napStatus: "awake", endTime: new Date() }
        : child
    ));
  };

  const calculateDuration = (startTime: Date | null) => {
    if (!startTime) return "0m";
    const diff = currentTime.getTime() - startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const calculateFinalDuration = (startTime: Date | null, endTime: Date | null) => {
    if (!startTime || !endTime) return "—";
    const diff = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const nappingCount = children.filter(c => c.napStatus === "napping").length;
  const completedCount = children.filter(c => c.endTime !== null).length;

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
          <h1 className="text-2xl font-semibold text-stone-900">Nap Timer</h1>
          <p className="text-sm text-stone-500 mt-1">Sunflower Room • Today</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{nappingCount}</p>
            <p className="text-xs text-stone-500 mt-1">Currently Napping</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
            <p className="text-xs text-stone-500 mt-1">Completed</p>
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
                    {child.napStatus === "napping" && child.startTime && (
                      <p className="text-xs text-indigo-600 mt-0.5 font-medium">
                        Napping for {calculateDuration(child.startTime)}
                      </p>
                    )}
                    {child.endTime && (
                      <p className="text-xs text-stone-500 mt-0.5">
                        Slept {calculateFinalDuration(child.startTime, child.endTime)}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      child.napStatus === "napping"
                        ? "bg-indigo-50 text-indigo-700"
                        : child.endTime
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {child.napStatus === "napping" ? "Napping" : child.endTime ? "Completed" : "Awake"}
                  </span>
                </div>

                {/* Action Button */}
                {child.napStatus === "awake" && !child.endTime && (
                  <button
                    onClick={() => startNap(child.id)}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                  >
                    Start Nap
                  </button>
                )}
                {child.napStatus === "napping" && (
                  <button
                    onClick={() => endNap(child.id)}
                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                  >
                    End Nap
                  </button>
                )}
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
            Save Nap Log
          </Link>
        </div>
      </div>
    </main>
  );
}
