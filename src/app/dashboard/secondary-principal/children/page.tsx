"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  grade?: string;
  classroom_name?: string;
  parent_names?: string[];
}

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/secondary-principal/children");
      if (response.ok) {
        const data = await response.json();
        setChildren(data.children || []);
      }
    } catch (error) {
      console.error("Error loading children:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (child: Child) => `${child.first_name} ${child.last_name}`,
    },
    {
      key: "age",
      header: "Age",
      render: (child: Child) => `${calculateAge(child.date_of_birth)} years`,
    },
    {
      key: "grade",
      header: "Grade",
      render: (child: Child) => child.grade || "-",
    },
    {
      key: "classroom_name",
      header: "Classroom",
      render: (child: Child) => (
        <Badge variant={child.classroom_name ? "info" : "default"}>
          {child.classroom_name || "Not assigned"}
        </Badge>
      ),
    },
    {
      key: "parent_names",
      header: "Parents",
      render: (child: Child) => {
        if (!child.parent_names || child.parent_names.length === 0) {
          return <Badge variant="warning">No parents linked</Badge>;
        }
        return (
          <div className="flex flex-col gap-1">
            {child.parent_names.map((name, idx) => (
              <Badge key={idx} variant="success" size="sm">
                {name}
              </Badge>
            ))}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Children</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Children</h1>
          <p className="text-gray-600 mt-2">View all enrolled students in your school</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Children</h3>
            <p className="text-3xl font-bold text-gray-900">{children.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Assigned to Classes</h3>
            <p className="text-3xl font-bold text-gray-900">
              {children.filter((c) => c.classroom_name).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">With Linked Parents</h3>
            <p className="text-3xl font-bold text-gray-900">
              {children.filter((c) => c.parent_names && c.parent_names.length > 0).length}
            </p>
          </div>
        </div>

        {/* Children Table */}
        {children.length === 0 ? (
          <EmptyState
            title="No children found"
            description="There are no children enrolled in your school yet."
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
        ) : (
          <DataTable
            data={children}
            columns={columns}
            searchPlaceholder="Search children by name..."
            emptyMessage="No children found"
          />
        )}
      </div>
    </div>
  );
}
