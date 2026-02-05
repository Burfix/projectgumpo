"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  assigned_classes: number;
}

interface Classroom {
  id: number;
  name: string;
  capacity: number;
  age_group: string;
  teacher_id: string | null;
  teacher_name: string | null;
}

export default function AssignTeacherToClassPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls
      const mockTeachers: Teacher[] = [
        { id: "1", first_name: "Sarah", last_name: "Johnson", email: "sarah@school.com", assigned_classes: 1 },
        { id: "2", first_name: "Emily", last_name: "Chen", email: "emily@school.com", assigned_classes: 1 },
        { id: "3", first_name: "David", last_name: "Williams", email: "david@school.com", assigned_classes: 1 },
        { id: "4", first_name: "Lisa", last_name: "Anderson", email: "lisa@school.com", assigned_classes: 0 },
      ];

      const mockClassrooms: Classroom[] = [
        { id: 1, name: "Sunflower Room", capacity: 20, age_group: "Toddlers", teacher_id: "1", teacher_name: "Sarah Johnson" },
        { id: 2, name: "Rainbow Room", capacity: 20, age_group: "Preschool", teacher_id: "2", teacher_name: "Emily Chen" },
        { id: 3, name: "Stars Room", capacity: 25, age_group: "Pre-K", teacher_id: "3", teacher_name: "David Williams" },
        { id: 4, name: "Ocean Room", capacity: 18, age_group: "Infants", teacher_id: null, teacher_name: null },
      ];

      setTeachers(mockTeachers);
      setClassrooms(mockClassrooms);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign() {
    if (!selectedTeacher || !selectedClass) {
      setError("Please select both a teacher and a classroom");
      return;
    }

    try {
      setAssigning(true);
      setError(null);

      // TODO: API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const teacher = teachers.find(t => t.id === selectedTeacher);
      setClassrooms(prev => prev.map(c =>
        c.id === selectedClass ? { ...c, teacher_id: selectedTeacher, teacher_name: `${teacher?.first_name} ${teacher?.last_name}` } : c
      ));

      setSuccess("Teacher assigned successfully!");
      setSelectedTeacher("");
      setSelectedClass(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to assign teacher");
    } finally {
      setAssigning(false);
    }
  }

  async function handleUnassign(classId: number) {
    if (!confirm("Are you sure you want to unassign this teacher?")) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setClassrooms(prev => prev.map(c => c.id === classId ? { ...c, teacher_id: null, teacher_name: null } : c));
      setSuccess("Teacher unassigned!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to unassign teacher");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/dashboard/admin" className="text-sm text-purple-600 hover:text-purple-800 mb-6 inline-block">
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assign Teacher to Class</h1>
        <p className="text-gray-600 mb-8">Manage teacher assignments to classrooms</p>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">{success}</div>}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Assignment</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Teacher</label>
                  <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option value="">Choose a teacher...</option>
                    {teachers.map((t) => <option key={t.id} value={t.id}>{t.first_name} {t.last_name} ({t.assigned_classes} assigned)</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Classroom</label>
                  <select value={selectedClass || ""} onChange={(e) => setSelectedClass(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option value="">Choose a classroom...</option>
                    {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.age_group} {c.teacher_name ? `(${c.teacher_name})` : "(Unassigned)"}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleAssign} disabled={assigning || !selectedTeacher || !selectedClass} className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                {assigning ? "Assigning..." : "Assign Teacher"}
              </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50"><h2 className="text-xl font-semibold">Current Assignments</h2></div>
              <div className="divide-y">
                {classrooms.map((c) => (
                  <div key={c.id} className="px-6 py-4 flex justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-gray-600">{c.age_group} • Capacity: {c.capacity}</p>
                      <p className={`text-sm mt-1 ${c.teacher_name ? "text-green-600" : "text-orange-600"}`}>
                        {c.teacher_name ? `Assigned to: ${c.teacher_name}` : "No teacher assigned"}
                      </p>
                    </div>
                    {c.teacher_id && (
                      <button onClick={() => handleUnassign(c.id)} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                        Unassign
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50"><h2 className="text-xl font-semibold">Teachers Overview</h2></div>
              <div className="divide-y">
                {teachers.map((t) => (
                  <div key={t.id} className="px-6 py-4 flex justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-semibold">{t.first_name} {t.last_name}</p>
                      <p className="text-sm text-gray-600">{t.email}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${t.assigned_classes > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {t.assigned_classes} {t.assigned_classes === 1 ? "class" : "classes"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
