"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: string;
  allergies?: string;
  medical_notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export default function ChildrenListPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await fetch("/api/teacher/children");
      if (!response.ok) throw new Error("Failed to fetch children");
      const data = await response.json();
      setChildren(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
        <Link
          href="/dashboard/teacher"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {children.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          No children assigned to your classroom yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <div
              key={child.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedChild(child)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {child.first_name} {child.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Age: {getAge(child.date_of_birth)} years
                  </p>
                  {child.gender && (
                    <p className="text-sm text-gray-600 capitalize">{child.gender}</p>
                  )}
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {child.first_name[0]}{child.last_name[0]}
                </div>
              </div>

              {child.allergies && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-semibold text-red-800">⚠️ Allergies:</p>
                  <p className="text-sm text-red-700">{child.allergies}</p>
                </div>
              )}

              {child.medical_notes && (
                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-semibold text-yellow-800">📋 Medical Notes:</p>
                  <p className="text-sm text-yellow-700">{child.medical_notes}</p>
                </div>
              )}

              {child.emergency_contact_name && (
                <div className="text-sm text-gray-600 mt-3">
                  <p className="font-medium">Emergency Contact:</p>
                  <p>{child.emergency_contact_name}</p>
                  {child.emergency_contact_phone && (
                    <p className="text-blue-600">{child.emergency_contact_phone}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Child Details Modal */}
      {selectedChild && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedChild(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedChild.first_name} {selectedChild.last_name}
                </h2>
                <p className="text-gray-600">Age: {getAge(selectedChild.date_of_birth)} years</p>
              </div>
              <button
                onClick={() => setSelectedChild(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                <p className="text-gray-900">{new Date(selectedChild.date_of_birth).toLocaleDateString()}</p>
              </div>

              {selectedChild.gender && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Gender</p>
                  <p className="text-gray-900 capitalize">{selectedChild.gender}</p>
                </div>
              )}

              {selectedChild.allergies && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-semibold text-red-800 mb-1">⚠️ Allergies</p>
                  <p className="text-red-700">{selectedChild.allergies}</p>
                </div>
              )}

              {selectedChild.medical_notes && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">📋 Medical Notes</p>
                  <p className="text-yellow-700">{selectedChild.medical_notes}</p>
                </div>
              )}

              {selectedChild.emergency_contact_name && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-800 mb-2">Emergency Contact</p>
                  <p className="text-blue-900">{selectedChild.emergency_contact_name}</p>
                  {selectedChild.emergency_contact_phone && (
                    <p className="text-blue-600 font-medium">{selectedChild.emergency_contact_phone}</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                href={`/dashboard/teacher/attendance?child=${selectedChild.id}`}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center"
              >
                Mark Attendance
              </Link>
              <Link
                href={`/dashboard/teacher/log-meal?child=${selectedChild.id}`}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
              >
                Log Meal
              </Link>
              <Link
                href={`/dashboard/teacher/report-incident?child=${selectedChild.id}`}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-center"
              >
                Report Incident
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
