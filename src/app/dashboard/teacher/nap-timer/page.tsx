"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  napStatus: "awake" | "napping";
  startTime: Date | null;
  endTime: Date | null;
}

export default function NapTimer() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadChildren();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadChildren() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/teacher/children');
      if (!response.ok) throw new Error('Failed to fetch children');
      const data = await response.json();
      
      // Get today's naps
      const today = new Date().toISOString().split('T')[0];
      const napsResponse = await fetch(`/api/teacher/naps?date=${today}`);
      const napsData = napsResponse.ok ? await napsResponse.json() : [];
      
      // Merge nap data with children
      const napsMap = new Map(
        napsData.map((n: any) => [n.child_id, n])
      );
      
      setChildren(data.map((child: any) => {
        const nap: any = napsMap.get(child.id);
        return {
          id: child.id,
          first_name: child.first_name,
          last_name: child.last_name,
          napStatus: nap && !nap.end_time ? "napping" : "awake",
          startTime: nap?.start_time ? new Date(nap.start_time) : null,
          endTime: nap?.end_time ? new Date(nap.end_time) : null,
        };
      }));
    } catch (err) {
      setError("Failed to load children");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const startNap = async (id: number) => {
    try {
      const now = new Date();
      setChildren(children.map(child =>
        child.id === id
          ? { ...child, napStatus: "napping", startTime: now, endTime: null }
          : child
      ));

      // Save start time to database
      await fetch('/api/teacher/naps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: id,
          start_time: now.toISOString(),
        })
      });
    } catch (err) {
      console.error('Failed to start nap:', err);
      setError("Failed to start nap timer");
    }
  };

  const endNap = async (id: number) => {
    try {
      const now = new Date();
      const child = children.find(c => c.id === id);
      if (!child || !child.startTime) return;

      const duration = Math.floor((now.getTime() - child.startTime.getTime()) / 60000);

      setChildren(children.map(c =>
        c.id === id
          ? { ...c, napStatus: "awake", endTime: now }
          : c
      ));

      // Update end time in database
      await fetch('/api/teacher/naps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: id,
          end_time: now.toISOString(),
          duration_minutes: duration
        })
      });
    } catch (err) {
      console.error('Failed to end nap:', err);
      setError("Failed to end nap timer");
    }
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

  async function saveNapLogs() {
    try {
      setSaving(true);
      setError(null);
      
      // Naps are already saved in real-time via startNap/endNap
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save nap logs");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const nappingCount = children.filter(c => c.napStatus === "napping").length;
  const completedCount = children.filter(c => c.endTime !== null).length;

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
          <h1 className="text-lg font-semibold text-stone-900">Nap Timer</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 text-sm">✓ Nap logs saved successfully</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-lg p-4 border border-stone-200 text-center">
            <div className="text-2xl font-bold text-blue-600">{nappingCount}</div>
            <div className="text-xs text-stone-600 mt-1">Currently Napping</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-stone-200 text-center">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <div className="text-xs text-stone-600 mt-1">Completed Today</div>
          </div>
        </div>

        {/* Current Time */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-stone-200 text-center">
          <p className="text-3xl font-mono font-bold text-stone-900">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-xs text-stone-500 mt-1">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
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
                  className={`bg-white rounded-lg p-4 border-2 transition-all ${
                    child.napStatus === "napping"
                      ? "border-blue-400 bg-blue-50"
                      : "border-stone-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        child.napStatus === "napping" ? "bg-blue-200" : "bg-stone-200"
                      }`}>
                        <span className={`text-sm font-semibold ${
                          child.napStatus === "napping" ? "text-blue-700" : "text-stone-700"
                        }`}>
                          {child.first_name[0]}{child.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-stone-900">
                          {child.first_name} {child.last_name}
                        </div>
                        {child.napStatus === "napping" && child.startTime && (
                          <div className="text-xs text-blue-600 font-mono">
                            Duration: {calculateDuration(child.startTime)}
                          </div>
                        )}
                        {child.endTime && (
                          <div className="text-xs text-green-600">
                            Slept: {calculateFinalDuration(child.startTime, child.endTime)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      child.napStatus === "napping"
                        ? "bg-blue-100 text-blue-700"
                        : child.endTime
                        ? "bg-green-100 text-green-700"
                        : "bg-stone-100 text-stone-600"
                    }`}>
                      {child.napStatus === "napping" ? "Napping" : child.endTime ? "Complete" : "Awake"}
                    </span>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex gap-2">
                    {child.napStatus === "awake" && !child.endTime && (
                      <button
                        onClick={() => startNap(child.id)}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                      >
                        Start Nap
                      </button>
                    )}
                    {child.napStatus === "napping" && (
                      <button
                        onClick={() => endNap(child.id)}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
                      >
                        End Nap
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            {completedCount > 0 && (
              <button
                onClick={saveNapLogs}
                disabled={saving}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving..." : `Save Nap Logs (${completedCount})`}
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}
