"use client";

import { useEffect, useState } from "react";

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: string;
  classroom_id?: number;
  allergies?: string;
  medical_notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  status: string;
  classrooms?: {
    id: number;
    name: string;
    age_group?: string;
  };
  parent_child?: Array<{
    users: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
  }>;
}

interface Parent {
  id: string;
  name: string;
  email: string;
}

interface Classroom {
  id: number;
  name: string;
}

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [filteredChildren, setFilteredChildren] = useState<Child[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAssignParentModal, setShowAssignParentModal] = useState(false);
  const [showAssignClassModal, setShowAssignClassModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    allergies: "",
    medical_notes: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });
  const [assignData, setAssignData] = useState({
    parent_id: "",
    classroom_id: "",
    relationship: "parent" as const,
    is_primary: true,
    can_pickup: true,
  });

  useEffect(() => {
    fetchChildren();
    fetchParents();
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredChildren(children);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredChildren(
        children.filter(
          (child) =>
            child.first_name.toLowerCase().includes(query) ||
            child.last_name.toLowerCase().includes(query) ||
            child.classrooms?.name.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, children]);

  const fetchChildren = async () => {
    try {
      const response = await fetch("/api/admin/children");
      if (!response.ok) throw new Error("Failed to fetch children");
      const data = await response.json();
      setChildren(data);
      setFilteredChildren(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParents = async () => {
    try {
      const response = await fetch("/api/admin/parents");
      if (!response.ok) throw new Error("Failed to fetch parents");
      const data = await response.json();
      setParents(data);
    } catch (error) {
      console.error("Error fetching parents:", error);
    }
  };

  const fetchClassrooms = async () => {
    try {
      const response = await fetch("/api/admin/classrooms");
      if (!response.ok) throw new Error("Failed to fetch classrooms");
      const data = await response.json();
      setClassrooms(data);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to add child");

      await fetchChildren();
      setShowAddForm(false);
      setFormData({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        allergies: "",
        medical_notes: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add child");
    }
  };

  const handleAssignParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;

    try {
      const response = await fetch("/api/admin/parents/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_id: assignData.parent_id,
          child_id: selectedChild.id,
          relationship: assignData.relationship,
          is_primary: assignData.is_primary,
          can_pickup: assignData.can_pickup,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign parent");
      }

      alert("Parent assigned successfully!");
      setShowAssignParentModal(false);
      setSelectedChild(null);
      await fetchChildren();
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Failed to assign parent");
    }
  };

  const handleAssignClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;

    try {
      const response = await fetch("/api/admin/children/assign-classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_id: selectedChild.id,
          classroom_id: parseInt(assignData.classroom_id),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign classroom");
      }

      alert("Classroom assigned successfully!");
      setShowAssignClassModal(false);
      setSelectedChild(null);
      await fetchChildren();
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Failed to assign classroom");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this child?")) return;

    try {
      const response = await fetch(`/api/admin/children?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete child");
      await fetchChildren();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to delete child");
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
        <h1 className="text-3xl font-bold text-gray-900">Manage Children</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? "Cancel" : "+ Add Child"}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search children by name or classroom..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
        />
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Child</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Child
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Children List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredChildren.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? "No children found matching your search." : "No children found. Add your first child to get started."}
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
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classroom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChildren.map((child) => {
                  const age = child.date_of_birth
                    ? Math.floor(
                        (new Date().getTime() - new Date(child.date_of_birth).getTime()) /
                          (365.25 * 24 * 60 * 60 * 1000)
                      )
                    : null;

                  return (
                    <tr key={child.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {child.first_name} {child.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {age !== null ? `${age} years` : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {child.classrooms?.name || (
                          <button
                            onClick={() => {
                              setSelectedChild(child);
                              setShowAssignClassModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Assign Classroom
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {child.parent_child && child.parent_child.length > 0 ? (
                          <div>
                            {child.parent_child.map((pc: any, idx: number) => (
                              <div key={idx} className="text-xs">
                                {pc.users?.name}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">No parents</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedChild(child);
                            setShowAssignParentModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          + Parent
                        </button>
                        <button
                          onClick={() => handleDelete(child.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Parent Modal */}
      {showAssignParentModal && selectedChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">
              Assign Parent to {selectedChild.first_name} {selectedChild.last_name}
            </h2>
            <form onSubmit={handleAssignParent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Parent *
                </label>
                <select
                  required
                  value={assignData.parent_id}
                  onChange={(e) => setAssignData({ ...assignData, parent_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select a parent --</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name} ({parent.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship *
                </label>
                <select
                  required
                  value={assignData.relationship}
                  onChange={(e) =>
                    setAssignData({ ...assignData, relationship: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="parent">Parent</option>
                  <option value="guardian">Guardian</option>
                  <option value="grandparent">Grandparent</option>
                  <option value="emergency_contact">Emergency Contact</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={assignData.is_primary}
                    onChange={(e) =>
                      setAssignData({ ...assignData, is_primary: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Primary Contact</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={assignData.can_pickup}
                    onChange={(e) =>
                      setAssignData({ ...assignData, can_pickup: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Can Pickup</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignParentModal(false);
                    setSelectedChild(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Assign Parent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Classroom Modal */}
      {showAssignClassModal && selectedChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">
              Assign Classroom to {selectedChild.first_name} {selectedChild.last_name}
            </h2>
            <form onSubmit={handleAssignClassroom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Classroom *
                </label>
                <select
                  required
                  value={assignData.classroom_id}
                  onChange={(e) =>
                    setAssignData({ ...assignData, classroom_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select a classroom --</option>
                  {classrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignClassModal(false);
                    setSelectedChild(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Assign Classroom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
