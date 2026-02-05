"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  logged: boolean;
  mealType: "breakfast" | "lunch" | "snack" | "";
  amount: "all" | "most" | "some" | "none" | "";
  notes: string;
}

export default function LogMeal() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<"breakfast" | "lunch" | "snack">("lunch");

  useEffect(() => {
    loadChildren();
  }, []);

  async function loadChildren() {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      setChildren([
        { id: 1, first_name: "Ben", last_name: "Smith", logged: false, mealType: "", amount: "", notes: "" },
        { id: 2, first_name: "Clara", last_name: "Williams", logged: false, mealType: "", amount: "", notes: "" },
        { id: 3, first_name: "Ava", last_name: "Johnson", logged: false, mealType: "", amount: "", notes: "" },
        { id: 4, first_name: "Liam", last_name: "Brown", logged: false, mealType: "", amount: "", notes: "" },
        { id: 5, first_name: "Emma", last_name: "Davis", logged: false, mealType: "", amount: "", notes: "" },
      ]);
    } catch (err) {
      setError("Failed to load children");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const quickLog = (id: number, amount: "all" | "most" | "some" | "none") => {
    setChildren(children.map(child =>
      child.id === id
        ? { ...child, logged: true, mealType: selectedMealType, amount, notes: "" }
        : child
    ));
  };

  const updateNotes = (id: number, notes: string) => {
    setChildren(children.map(child =>
      child.id === id ? { ...child, notes } : child
    ));
  };

  async function saveMeals() {
    try {
      setSaving(true);
      setError(null);
      
      const mealRecords = children
        .filter(c => c.logged)
        .map(c => ({
          child_id: c.id,
          meal_type: c.mealType,
          amount_eaten: c.amount,
          notes: c.notes,
          date: new Date().toISOString().split('T')[0]
        }));

      // TODO: API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save meal logs");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const loggedCount = children.filter(c => c.logged).length;

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
          <h1 className="text-lg font-semibold text-stone-900">Log Meal</h1>
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
            <p className="text-green-800 text-sm">✓ Meals saved successfully</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-stone-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-xs text-stone-400 mt-1">{loggedCount} of {children.length} logged</p>
        </div>

        {/* Meal Type Selector */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-stone-200">
          <label className="block text-sm font-medium text-stone-700 mb-3">Select Meal Type</label>
          <div className="grid grid-cols-3 gap-3">
            {(["breakfast", "lunch", "snack"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedMealType(type)}
                className={`py-3 rounded-lg font-medium text-sm transition-colors ${
                  selectedMealType === type
                    ? "bg-green-600 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
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
                      <div className="font-semibold text-stone-900">
                        {child.first_name} {child.last_name}
                      </div>
                    </div>
                    
                    {child.logged && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Logged
                      </span>
                    )}
                  </div>

                  {/* Quick Log Buttons */}
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <button
                      onClick={() => quickLog(child.id, "all")}
                      className={`py-2 rounded text-xs font-medium transition-colors ${
                        child.amount === "all"
                          ? "bg-green-600 text-white"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => quickLog(child.id, "most")}
                      className={`py-2 rounded text-xs font-medium transition-colors ${
                        child.amount === "most"
                          ? "bg-green-600 text-white"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      Most
                    </button>
                    <button
                      onClick={() => quickLog(child.id, "some")}
                      className={`py-2 rounded text-xs font-medium transition-colors ${
                        child.amount === "some"
                          ? "bg-orange-600 text-white"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      Some
                    </button>
                    <button
                      onClick={() => quickLog(child.id, "none")}
                      className={`py-2 rounded text-xs font-medium transition-colors ${
                        child.amount === "none"
                          ? "bg-red-600 text-white"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      None
                    </button>
                  </div>

                  {/* Notes Field */}
                  {child.logged && (
                    <input
                      type="text"
                      placeholder="Add notes (optional)"
                      value={child.notes}
                      onChange={(e) => updateNotes(child.id, e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Save Button */}
            <button
              onClick={saveMeals}
              disabled={saving || loggedCount === 0}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving..." : `Save Meal Logs (${loggedCount})`}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
