"use client";

import { useEffect, useState } from "react";

interface Parent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  parent_child?: Array<{
    children: {
      id: number;
      first_name: string;
      last_name: string;
    };
  }>;
}

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  photo_url?: string;
}

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [filteredParents, setFilteredParents] = useState<Parent[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [assignData, setAssignData] = useState({
    child_id: "",
    relationship: "parent" as const,
    is_primary: true,
    can_pickup: true,
  });

  useEffect(() => {
    fetchParents();
    fetchChildren();
  }, []);

  useEffect(() => {
    // Filter parents based on search query
    if (searchQuery.trim() === "") {
      setFilteredParents(parents);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredParents(
        parents.filter(
          (parent) =>
            parent.name.toLowerCase().includes(query) ||
            parent.email.toLowerCase().includes(query) ||
            parent.phone?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, parents]);

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const response = await fetch("/api/admin/parents");
      if (!response.ok) throw new Error("Failed to fetch parents");
      const data = await response.json();
      setParents(data);
      setFilteredParents(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildren = async () => {
    try {
      const response = await fetch("/api/admin/children");
      if (!response.ok) throw new Error("Failed to fetch children");
      const data = await response.json();
      setChildren(data);
    } catch (error) {
      console.error("Error fetching children:", error);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to invite parent");
      }

      alert("Parent invitation sent successfully!");
      setShowInviteForm(false);
      setFormData({ name: "", email: "" });
      await fetchParents();
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Failed to invite parent");
    }
  };

  const handleAssignChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParent) return;

    try {
      const response = await fetch("/api/admin/parents/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_id: selectedParent.id,
          child_id: parseInt(assignData.child_id),
          relationship: assignData.relationship,
          is_primary: assignData.is_primary,
          can_pickup: assignData.can_pickup,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign child");
      }

      alert("Child assigned successfully!");
      setShowAssignModal(false);
      setSelectedParent(null);
      setAssignData({
        child_id: "",
        relationship: "parent",
        is_primary: true,
        can_pickup: true,
      });
      await fetchParents();
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Failed to assign child");
    }
  };

  const openAssignModal = (parent: Parent) => {
    setSelectedParent(parent);
    setShowAssignModal(true);
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
        <h1 className="text-3xl font-bold text-gray-900">Manage Parents</h1>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showInviteForm ? "Cancel" : "✉️ Invite Parent"}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search parents by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
        />
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Invite New Parent</h2>
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

      {/* Parents List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredParents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? "No parents found matching your search." : "No parents found. Invite your first parent to get started."}
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
                    Children
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{parent.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{parent.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{parent.phone || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {parent.parent_child && parent.parent_child.length > 0 ? (
                        <div>
                          {parent.parent_child.map((pc: any, idx: number) => (
                            <div key={idx} className="text-xs">
                              {pc.children?.first_name} {pc.children?.last_name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No children linked</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openAssignModal(parent)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        + Assign Child
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedParent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">
              Assign Child to {selectedParent.name}
            </h2>
            <form onSubmit={handleAssignChild} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Child *
                </label>
                <select
                  required
                  value={assignData.child_id}
                  onChange={(e) =>
                    setAssignData({ ...assignData, child_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select a child --</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.first_name} {child.last_name}
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
                    setAssignData({
                      ...assignData,
                      relationship: e.target.value as any,
                    })
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
                    setShowAssignModal(false);
                    setSelectedParent(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Assign Child
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
