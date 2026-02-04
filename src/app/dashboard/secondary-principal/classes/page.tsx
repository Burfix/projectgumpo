"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface Classroom {
  id: number;
  name: string;
  grade_level?: string;
  capacity?: number;
  teacher_count: number;
  student_count: number;
  created_at: string;
}

export default function ClassesPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/secondary-principal/classrooms");
      if (response.ok) {
        const data = await response.json();
        setClassrooms(data.classrooms || []);
      }
    } catch (error) {
      console.error("Error loading classrooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCapacityStatus = (studentCount: number, capacity?: number) => {
    if (!capacity) return "default";
    const percentage = (studentCount / capacity) * 100;
    if (percentage >= 90) return "danger";
    if (percentage >= 70) return "warning";
    return "success";
  };

  const columns = [
    { key: "name", header: "Classroom Name" },
    {
      key: "grade_level",
      header: "Grade Level",
      render: (classroom: Classroom) => classroom.grade_level || "-",
    },
    {
      key: "teacher_count",
      header: "Teachers",
      render: (classroom: Classroom) => (
        <Badge variant={classroom.teacher_count > 0 ? "success" : "warning"}>
          {classroom.teacher_count} {classroom.teacher_count === 1 ? "teacher" : "teachers"}
        </Badge>
      ),
    },
    {
      key: "student_count",
      header: "Students",
      render: (classroom: Classroom) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{classroom.student_count}</span>
          {classroom.capacity && (
            <span className="text-sm text-gray-500">/ {classroom.capacity}</span>
          )}
        </div>
      ),
    },
    {
      key: "capacity",
      header: "Capacity Status",
      render: (classroom: Classroom) => {
        if (!classroom.capacity) return <Badge variant="default">No limit</Badge>;
        const percentage = (classroom.student_count / classroom.capacity) * 100;
        const variant = getCapacityStatus(classroom.student_count, classroom.capacity);
        return <Badge variant={variant}>{Math.round(percentage)}% full</Badge>;
      },
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Classes</h1>
          <LoadingSkeleton rows={8} />
        </div>
      </div>
    );
  }

  const totalStudents = classrooms.reduce((sum, c) => sum + c.student_count, 0);
  const totalTeachers = classrooms.reduce((sum, c) => sum + c.teacher_count, 0);
  const avgStudentsPerClass = classrooms.length > 0 ? totalStudents / classrooms.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Classes</h1>
          <p className="text-gray-600 mt-2">View all classrooms and their capacity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Classes</h3>
            <p className="text-3xl font-bold text-gray-900">{classrooms.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Students</h3>
            <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Teachers</h3>
            <p className="text-3xl font-bold text-gray-900">{totalTeachers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Avg. Class Size</h3>
            <p className="text-3xl font-bold text-gray-900">{avgStudentsPerClass.toFixed(1)}</p>
          </div>
        </div>

        {/* Classrooms Table */}
        {classrooms.length === 0 ? (
          <EmptyState
            title="No classrooms found"
            description="There are no classrooms in your school yet."
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
        ) : (
          <DataTable
            data={classrooms}
            columns={columns}
            searchPlaceholder="Search classrooms..."
            emptyMessage="No classrooms found"
          />
        )}
      </div>
    </div>
  );
}
