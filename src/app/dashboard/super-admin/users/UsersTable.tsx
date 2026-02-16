"use client";

import { useState, useMemo } from "react";

type User = {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  school_id: number | null;
  is_active: boolean | null;
  last_sign_in_at: string | null;
  created_at?: string | null;
  schools?: { id: number; name: string }[] | null;
};

type Props = {
  users: User[];
};

export default function UsersTable({ users }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      const schoolName = user.schools && user.schools.length > 0 ? user.schools[0].name : null;
      const matchesSearch =
        searchQuery === "" ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        schoolName?.toLowerCase().includes(searchQuery.toLowerCase());

      // Role filter
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.is_active) ||
        (statusFilter === "inactive" && !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Get unique roles for filter
  const roles = useMemo(() => {
    const roleSet = new Set(users.map((u) => u.role).filter(Boolean));
    return Array.from(roleSet);
  }, [users]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.size === 0) {
      alert("Please select users first");
      return;
    }

    const userIds = Array.from(selectedUsers);
    
    try {
      const response = await fetch("/api/super-admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Bulk action failed");
      }

      alert(`${action} applied to ${userIds.length} users`);
      setSelectedUsers(new Set());
      window.location.reload();
    } catch (error: any) {
      alert(error.message || "Failed to perform bulk action");
    }
  };

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800";
      case "ADMIN":
      case "PRINCIPAL":
        return "bg-blue-100 text-blue-800";
      case "TEACHER":
        return "bg-green-100 text-green-800";
      case "PARENT":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 space-y-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="🔍 Search by email, name, or school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[250px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            {roles.map((role) => (
              <option key={role} value={role!}>
                {role}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedUsers.size} selected
            </span>
            <button
              onClick={() => handleBulkAction("deactivate")}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Deactivate
            </button>
            <button
              onClick={() => handleBulkAction("activate")}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Activate
            </button>
            <button
              onClick={() => setSelectedUsers(new Set())}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear
            </button>
          </div>
        )}

        <div className="text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredUsers.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-600">
            No users found matching your filters.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      filteredUsers.length > 0 &&
                      filteredUsers.every((u) => selectedUsers.has(u.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || user.email || "(No email)"}
                    </div>
                    {user.name && user.email && (
                      <div className="text-xs text-gray-500">{user.email}</div>
                    )}
                    <div className="text-xs text-gray-400 font-mono">{user.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role || "UNKNOWN"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.schools && user.schools.length > 0 ? (
                      user.schools[0].name
                    ) : (
                      <span className="text-gray-400">No school</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
