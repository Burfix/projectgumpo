"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface Parent {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  created_at: string;
  linked_children?: number;
}

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  grade?: string;
}

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [parentsRes, childrenRes] = await Promise.all([
        fetch("/api/secondary-principal/parents"),
        fetch("/api/secondary-principal/children"),
      ]);

      if (parentsRes.ok) {
        const data = await parentsRes.json();
        setParents(data.parents || []);
      }

      if (childrenRes.ok) {
        const data = await childrenRes.json();
        setChildren(data.children || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkParent = async () => {
    if (!selectedParent || !selectedChild) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/secondary-principal/link-parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: selectedParent.id,
          childId: selectedChild,
        }),
      });

      if (response.ok) {
        alert("Parent linked to child successfully!");
        setIsLinkModalOpen(false);
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to link parent to child");
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
      render: (parent: Parent) => parent.phone_number || "-",
    },
    {
      key: "linked_children",
      header: "Linked Children",
      render: (parent: Parent) => (
        <Badge variant={parent.linked_children! > 0 ? "success" : "default"}>
          {parent.linked_children || 0} children
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (parent: Parent) => (
        <button
          onClick={() => {
            setSelectedParent(parent);
            setIsLinkModalOpen(true);
          }}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Link to Child
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Parents</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Parents</h1>
          <p className="text-gray-600 mt-2">View and link parents to their children</p>
        </div>

        {/* Parents Table */}
        {parents.length === 0 ? (
          <EmptyState
            title="No parents found"
            description="There are no parents in your school yet."
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
        ) : (
          <DataTable
            data={parents}
            columns={columns}
            searchPlaceholder="Search parents by name or email..."
            emptyMessage="No parents found"
          />
        )}

        {/* Link Parent Modal */}
        <Modal
          isOpen={isLinkModalOpen}
          onClose={() => {
            setIsLinkModalOpen(false);
            setSelectedParent(null);
            setSelectedChild(null);
          }}
          title={`Link ${selectedParent?.full_name || "Parent"} to Child`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Child
              </label>
              <select
                value={selectedChild || ""}
                onChange={(e) => setSelectedChild(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a child...</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.first_name} {child.last_name} {child.grade && `(${child.grade})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleLinkParent}
                disabled={!selectedChild || isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Linking..." : "Link Parent"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
