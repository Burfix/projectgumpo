"use client";

import { useEffect, useState } from "react";

interface Classroom {
  id: number;
  name: string;
  age_group?: string;
  capacity: number;
  status: string;
  children?: any[];
  teacher_classroom?: Array<{
    users: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age_group: "",
    capacity: 20,
  });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const response = await fetch("/api/admin/classrooms");
      if (!response.ok) throw new Error("Failed to fetch classrooms");
      const data = await response.json();
      setClassrooms(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create classroom");

      await fetchClassrooms();
      setShowAddForm(false);
      setFormData({ name: "", age_group: "", capacity: 20 });
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to create classroom");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this classroom?")) return;

    try {
      const response = await fetch(`/api/admin/classrooms?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete classroom");
      await fetchClassrooms();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to delete classroom");
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Manage Classrooms</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? "Cancel" : "+ Create Classroom"}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Classroom</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classroom Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Toddlers Room A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
              <input
                type="text"
                value={formData.age_group}
                onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2-3 years"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Classroom
            </button>
          </form>
        </div>
      )}

      {/* Classrooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            No classrooms found. Create your first classroom to get started.
          </div>
        ) : (
          classrooms.map((classroom) => (
            <div key={classroom.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{classroom.name}</h3>
                  {classroom.age_group && (
                    <p className="text-sm text-gray-600 mt-1">{classroom.age_group}</p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    classroom.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {classroom.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Children:</span>
                  <span className="font-medium">
                    {classroom.children?.length || 0} / {classroom.capacity}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Teachers:</span>
                  <span className="font-medium">{classroom.teacher_classroom?.length || 0}</span>
                </div>
              </div>

              {classroom.teacher_classroom && classroom.teacher_classroom.length > 0 && (
                <div className="border-t pt-3 mb-3">
                  <p className="text-xs text-gray-600 mb-1">Assigned Teachers:</p>
                  {classroom.teacher_classroom.map((tc: any, idx: number) => (
                    <p key={idx} className="text-xs text-gray-800">
                      • {tc.users?.name}
                    </p>
                  ))}
                </div>
              )}

              <button
                onClick={() => handleDelete(classroom.id)}
                className="w-full mt-4 text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete Classroom
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
