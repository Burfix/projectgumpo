"use client";

import { useEffect, useState } from "react";

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  teacher_classroom?: Array<{
    classrooms: {
      id: number;
      name: string;
    };
  }>;
}

interface Classroom {
  id: number;
  name: string;
  age_group?: string;
  capacity?: number;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [assignData, setAssignData] = useState({
    classroomId: "",
    isPrimary: false,
  });

  useEffect(() => {
    fetchTeachers();
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
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/admin/teachers");
      if (!response.ok) throw new Error("Failed to fetch teachers");
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to invite teacher");
      }

      alert("Teacher invitation sent successfully!");
      setShowInviteForm(false);
      setFormData({ name: "", email: "" });
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Failed to invite teacher");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this teacher?")) return;

    try {
      const response = await fetch(`/api/admin/teachers?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete teacher");
      await fetchTeachers();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to delete teacher");
    }
  };

  const openAssignModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowAssignModal(true);
  };

  const handleAssignClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    try {
      const response = await fetch("/api/admin/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign-teacher",
          teacherId: selectedTeacher.id,
          classroomId: parseInt(assignData.classroomId),
          isPrimary: assignData.isPrimary,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign teacher");
      }

      alert("Teacher assigned to classroom successfully!");
      setShowAssignModal(false);
      setSelectedTeacher(null);
      setAssignData({ classroomId: "", isPrimary: false });
      await fetchTeachers();
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Failed to assign teacher");
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
        <h1 className="text-3xl font-bold text-gray-900">Manage Teachers</h1>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showInviteForm ? "Cancel" : "✉️ Invite Teacher"}
        </button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Invite New Teacher</h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Invitation
            </button>
          </form>
        </div>
      )}

      {/* Teachers List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {teachers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No teachers found. Invite your first teacher to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classrooms
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{teacher.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{teacher.phone || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {teacher.teacher_classroom && teacher.teacher_classroom.length > 0 ? (
                        <div>
                          {teacher.teacher_classroom.map((tc: any, idx: number) => (
                            <div key={idx} className="text-xs">
                              {tc.classrooms?.name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No classrooms</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openAssignModal(teacher)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        + Assign Class
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Classroom Modal */}
      {showAssignModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">
              Assign Classroom to {selectedTeacher.name}
            </h2>
            <form onSubmit={handleAssignClassroom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Classroom *
                </label>
                <select
                  required
                  value={assignData.classroomId}
                  onChange={(e) =>
                    setAssignData({ ...assignData, classroomId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select a classroom --</option>
                  {classrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name} {classroom.age_group && `(${classroom.age_group})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={assignData.isPrimary}
                  onChange={(e) =>
                    setAssignData({ ...assignData, isPrimary: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-700">
                  Primary teacher for this classroom
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedTeacher(null);
                    setAssignData({ classroomId: "", isPrimary: false });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
