"use client";

import { useState, useEffect } from "react";

type Backup = {
  id: string;
  type: string;
  description: string;
  status: string;
  size_mb: number;
  records_count: number;
  tables_included: string[];
  metadata: Record<string, number>;
  created_at: string;
};

export default function BackupsManager() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [backupType, setBackupType] = useState<"full" | "incremental">("full");
  const [description, setDescription] = useState("");
  const [expandedBackup, setExpandedBackup] = useState<string | null>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await fetch("/api/super-admin/backups");
      if (!response.ok) throw new Error("Failed to fetch backups");
      const data = await response.json();
      setBackups(data);
    } catch (error) {
      console.error("Error fetching backups:", error);
      setMessage({ type: "error", text: "Failed to load backups" });
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setCreating(true);
    setMessage(null);
    try {
      const response = await fetch("/api/super-admin/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: backupType, description }),
      });

      if (!response.ok) throw new Error("Failed to create backup");

      setMessage({ type: "success", text: "Backup created successfully" });
      setShowCreateModal(false);
      setDescription("");
      setBackupType("full");
      await fetchBackups();
    } catch (error) {
      console.error("Error creating backup:", error);
      setMessage({ type: "error", text: "Failed to create backup" });
    } finally {
      setCreating(false);
    }
  };

  const deleteBackup = async (id: string) => {
    if (!confirm("Are you sure you want to delete this backup?")) return;

    try {
      const response = await fetch(`/api/super-admin/backups?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete backup");

      setMessage({ type: "success", text: "Backup deleted successfully" });
      await fetchBackups();
    } catch (error) {
      console.error("Error deleting backup:", error);
      setMessage({ type: "error", text: "Failed to delete backup" });
    }
  };

  const formatSize = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading backups...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Backups</h3>
          <p className="text-3xl font-bold text-gray-900">{backups.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Size</h3>
          <p className="text-3xl font-bold text-gray-900">
            {formatSize(backups.reduce((sum, b) => sum + b.size_mb, 0))}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Latest Backup</h3>
          <p className="text-sm font-medium text-gray-900">
            {backups.length > 0
              ? new Date(backups[0].created_at).toLocaleDateString()
              : "No backups"}
          </p>
        </div>
      </div>

      {/* Create Backup Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Backup History</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
        >
          Create Backup
        </button>
      </div>

      {/* Backups List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {backups.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No backups found. Create your first backup to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {backups.map((backup) => (
              <div key={backup.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {backup.description}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          backup.type === "full"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {backup.type}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          backup.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : backup.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {backup.status}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Created:</span>{" "}
                        {formatDate(backup.created_at)}
                      </div>
                      <div>
                        <span className="font-medium">Size:</span> {formatSize(backup.size_mb)}
                      </div>
                      <div>
                        <span className="font-medium">Records:</span>{" "}
                        {backup.records_count.toLocaleString()}
                      </div>
                    </div>
                    {expandedBackup === backup.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Tables Included ({backup.tables_included.length})
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          {backup.tables_included.map((table) => (
                            <div
                              key={table}
                              className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200"
                            >
                              <span className="font-medium text-gray-700">{table}</span>
                              <span className="text-gray-500">
                                {backup.metadata[table]?.toLocaleString() || 0}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() =>
                        setExpandedBackup(expandedBackup === backup.id ? null : backup.id)
                      }
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    >
                      {expandedBackup === backup.id ? "Hide" : "Details"}
                    </button>
                    <button
                      onClick={() => deleteBackup(backup.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Backup</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Type
                </label>
                <select
                  value={backupType}
                  onChange={(e) => setBackupType(e.target.value as "full" | "incremental")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="full">Full Backup</option>
                  <option value="incremental">Incremental Backup</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Before major update"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <strong>Note:</strong> This will create a snapshot of all database tables including
                users, schools, classrooms, children, attendance, incidents, meals, naps, and
                messages.
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setDescription("");
                  setBackupType("full");
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createBackup}
                disabled={creating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create Backup"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
