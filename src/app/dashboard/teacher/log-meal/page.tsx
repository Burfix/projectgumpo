"use client";

import Link from "next/link";
import { useState } from "react";

export default function LogMeal() {
  const [children, setChildren] = useState([
    { id: 1, name: "Ben Smith", logged: false, mealType: "", amount: "", notes: "" },
    { id: 2, name: "Clara Williams", logged: false, mealType: "", amount: "", notes: "" },
    { id: 3, name: "Ava Johnson", logged: false, mealType: "", amount: "", notes: "" },
    { id: 4, name: "Liam Brown", logged: false, mealType: "", amount: "", notes: "" },
    { id: 5, name: "Emma Davis", logged: false, mealType: "", amount: "", notes: "" },
    { id: 6, name: "Oliver Wilson", logged: false, mealType: "", amount: "", notes: "" },
    { id: 7, name: "Sophia Martinez", logged: false, mealType: "", amount: "", notes: "" },
    { id: 8, name: "Noah Garcia", logged: false, mealType: "", amount: "", notes: "" },
  ]);

  const [selectedMealType, setSelectedMealType] = useState<"breakfast" | "lunch" | "snack">("lunch");

  const quickLog = (id: number, amount: "all" | "most" | "some" | "none") => {
    setChildren(children.map(child =>
      child.id === id
        ? { ...child, logged: true, mealType: selectedMealType, amount, notes: "" }
        : child
    ));
  };

  const loggedCount = children.filter(c => c.logged).length;

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
          <h1 className="text-2xl font-semibold text-stone-900">Log Meal</h1>
          <p className="text-sm text-stone-500 mt-1">Sunflower Room • Today</p>
        </div>

        {/* Meal Type Selector */}
        <div className="mb-6">
          <p className="text-sm font-medium text-stone-700 mb-3">Select Meal Type:</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedMealType("breakfast")}
              className={`px-4 py-3 rounded-xl text-sm font-medium ${
                selectedMealType === "breakfast"
                  ? "bg-amber-600 text-white"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              Breakfast
            </button>
            <button
              onClick={() => setSelectedMealType("lunch")}
              className={`px-4 py-3 rounded-xl text-sm font-medium ${
                selectedMealType === "lunch"
                  ? "bg-amber-600 text-white"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              Lunch
            </button>
            <button
              onClick={() => setSelectedMealType("snack")}
              className={`px-4 py-3 rounded-xl text-sm font-medium ${
                selectedMealType === "snack"
                  ? "bg-amber-600 text-white"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              Snack
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6 bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-600">Logged</p>
            <p className="text-2xl font-bold text-stone-900">{loggedCount} / {children.length}</p>
          </div>
        </div>

        {/* Children List */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="divide-y divide-stone-100">
            {children.map((child) => (
              <div key={child.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-stone-900">{child.name}</p>
                  {child.logged && (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                      Logged
                    </span>
                  )}
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => quickLog(child.id, "all")}
                    className={`px-3 py-2 rounded-lg text-xs font-medium ${
                      child.amount === "all"
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-50 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => quickLog(child.id, "most")}
                    className={`px-3 py-2 rounded-lg text-xs font-medium ${
                      child.amount === "most"
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-50 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    Most
                  </button>
                  <button
                    onClick={() => quickLog(child.id, "some")}
                    className={`px-3 py-2 rounded-lg text-xs font-medium ${
                      child.amount === "some"
                        ? "bg-amber-600 text-white"
                        : "bg-stone-50 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    Some
                  </button>
                  <button
                    onClick={() => quickLog(child.id, "none")}
                    className={`px-3 py-2 rounded-lg text-xs font-medium ${
                      child.amount === "none"
                        ? "bg-red-600 text-white"
                        : "bg-stone-50 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    None
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
            Save Meal Log
          </Link>
        </div>
      </div>
    </main>
  );
}
