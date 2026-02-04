"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface Teacher {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  created_at: string;
  assigned_classes?: number;
}

interface Classroom {
  id: number;
  name: string;
  grade_level?: string;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teachersRes, classroomsRes] = await Promise.all([
        fetch("/api/secondary-principal/teachers"),
        fetch("/api/secondary-principal/classrooms"),
      ]);

      if (teachersRes.ok) {
        const data = await teachersRes.json();
        setTeachers(data.teachers || []);
      }

      if (classroomsRes.ok) {
        const data = await classroomsRes.json();
        setClassrooms(data.classrooms || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacher || !selectedClassroom) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/secondary-principal/assign-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: selectedTeacher.id,
          classroomId: selectedClassroom,
        }),
      });

      if (response.ok) {
        alert("Teacher assigned successfully!");
        setIsAssignModalOpen(false);
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to assign teacher");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { key: "full_name", header: "Name" },
    { key: "email", header: "Email" },
    {
      key: "phone_number",
      header: "Phone",
      render: (teacher: Teacher) => teacher.phone_number || "-",
    },
    {
      key: "assigned_classes",
      header: "Assigned Classes",
      render: (teacher: Teacher) => (
        <Badge variant={teacher.assigned_classes! > 0 ? "success" : "default"}>
          {teacher.assigned_classes || 0} classes
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (teacher: Teacher) => (
        <button
          onClick={() => {
            setSelectedTeacher(teacher);
            setIsAssignModalOpen(true);
          }}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Assign to Class
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Teachers</h1>
          <LoadingSkeleton rows={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Teachers</h1>
          <p className="text-gray-600 mt-2">View and assign teachers to classrooms</p>
        </div>

        {/* Teachers Table */}
        {teachers.length === 0 ? (
          <EmptyState
            title="No teachers found"
            description="There are no teachers in your school yet."
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
        ) : (
          <DataTable
            data={teachers}
            columns={columns}
            searchPlaceholder="Search teachers by name or email..."
            emptyMessage="No teachers found"
          />
        )}

        {/* Assign Teacher Modal */}
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedTeacher(null);
            setSelectedClassroom(null);
          }}
          title={`Assign ${selectedTeacher?.full_name || "Teacher"} to Class`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Classroom
              </label>
              <select
                value={selectedClassroom || ""}
                onChange={(e) => setSelectedClassroom(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a classroom...</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name} {classroom.grade_level && `(${classroom.grade_level})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTeacher}
                disabled={!selectedClassroom || isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Assigning..." : "Assign Teacher"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
