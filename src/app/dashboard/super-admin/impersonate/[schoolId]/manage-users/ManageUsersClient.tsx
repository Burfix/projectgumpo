"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  allocatePrincipalToSchool,
  removePrincipalFromSchool,
} from "@/lib/auth/super-admin-actions";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  school_id: string;
  created_at: string;
}

export default function ManageUsersClient({
  schoolId,
}: {
  schoolId: string;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [schoolId]);

  const loadUsers = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/schools/${schoolId}/users`);
      if (!response.ok) {
        throw new Error("Failed to load users");
      }
      const data = await response.json();
      setUsers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleMakePrincipal = async (userId: string, userName: string) => {
    setActionLoading(userId);
    try {
      const result = await allocatePrincipalToSchool({
        userId,
        schoolId,
      });

      if (!result.success) {
        setError(result.error || "Failed to allocate principal");
        return;
      }

      setSuccessMessage(`${userName} is now a Principal`);
      loadUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemovePrincipal = async (userId: string, userName: string) => {
    if (
      !confirm(`Remove principal designation from ${userName}? They will be demoted to ADMIN.`)
    ) {
      return;
    }

    setActionLoading(userId);
    try {
      const result = await removePrincipalFromSchool({
        userId,
        schoolId,
        newRole: "ADMIN",
      });

      if (!result.success) {
        setError(result.error || "Failed to remove principal");
        return;
      }

      setSuccessMessage(`${userName} is no longer a Principal`);
      loadUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      SUPER_ADMIN: "bg-red-100 text-red-800",
      PRINCIPAL: "bg-purple-100 text-purple-800",
      ADMIN: "bg-blue-100 text-blue-800",
      TEACHER: "bg-green-100 text-green-800",
      PARENT: "bg-amber-100 text-amber-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
          <p className="text-sm text-gray-600 mt-1">
            {users.length} users in this school
          </p>
        </div>

        {users.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-600">
            No users found for this school
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      {user.role === "ADMIN" && (
                        <button
                          onClick={() =>
                            handleMakePrincipal(user.id, user.name)
                          }
                          disabled={actionLoading === user.id}
                          className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === user.id
                            ? "..."
                            : "Make Principal"}
                        </button>
                      )}

                      {user.role === "PRINCIPAL" && (
                        <button
                          onClick={() =>
                            handleRemovePrincipal(user.id, user.name)
                          }
                          disabled={actionLoading === user.id}
                          className="px-3 py-1 bg-amber-600 text-white rounded text-xs font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === user.id
                            ? "..."
                            : "Remove Principal"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
