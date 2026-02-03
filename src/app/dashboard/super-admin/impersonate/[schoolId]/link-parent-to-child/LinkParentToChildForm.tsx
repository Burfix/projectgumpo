"use client";

import { useState, useEffect } from "react";
import { linkParentToChild, unlinkParentFromChild, getParentChildLinks } from "@/lib/actions";

interface Parent {
  id: string;
  name: string;
  email: string;
}

interface Child {
  id: number;
  first_name: string;
  last_name: string;
}

interface ParentChildLink {
  id: number;
  relationship_type: string;
  created_at: string;
  parent: Parent;
  child: Child;
}

interface LinkParentToChildFormProps {
  schoolId: number;
  initialLinks?: ParentChildLink[];
}

export default function LinkParentToChildForm({ schoolId, initialLinks = [] }: LinkParentToChildFormProps) {
  const [parents, setParents] = useState<Parent[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [links, setLinks] = useState<ParentChildLink[]>(initialLinks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [selectedParent, setSelectedParent] = useState("");
  const [selectedChild, setSelectedChild] = useState("");
  const [relationshipType, setRelationshipType] = useState<"Parent" | "Guardian" | "Emergency Contact">("Parent");

  useEffect(() => {
    loadData();
  }, [schoolId]);

  async function loadData() {
    try {
      // Load parents, children, and existing links
      const [parentsRes, childrenRes, linksRes] = await Promise.all([
        fetch(`/api/schools/${schoolId}/users?role=PARENT`),
        fetch(`/api/schools/${schoolId}/children`),
        getParentChildLinks(schoolId),
      ]);

      if (parentsRes.ok) {
        const parentsData = await parentsRes.json();
        setParents(parentsData);
      }

      if (childrenRes.ok) {
        const childrenData = await childrenRes.json();
        setChildren(childrenData);
      }

      if (linksRes.success && linksRes.data) {
        setLinks(linksRes.data as unknown as ParentChildLink[]);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await linkParentToChild({
        parentId: selectedParent,
        childId: parseInt(selectedChild),
        schoolId,
        relationshipType,
      });

      if (result.success) {
        setSuccess("Parent linked to child successfully!");
        setSelectedParent("");
        setSelectedChild("");
        setRelationshipType("Parent");
        // Reload links
        const linksRes = await getParentChildLinks(schoolId);
        if (linksRes.success && linksRes.data) {
          setLinks(linksRes.data as unknown as ParentChildLink[]);
        }
      } else {
        setError(result.error || "Failed to create link");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlink(linkId: number) {
    if (!confirm("Are you sure you want to remove this parent-child link?")) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const result = await unlinkParentFromChild(linkId, schoolId);

      if (result.success) {
        setSuccess("Link removed successfully!");
        // Reload links
        const linksRes = await getParentChildLinks(schoolId);
        if (linksRes.success && linksRes.data) {
          setLinks(linksRes.data as unknown as ParentChildLink[]);
        }
      } else {
        setError(result.error || "Failed to remove link");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  }

  return (
    <div className="space-y-8">
      {/* Create Link Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Link</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Parent
            </label>
            <select
              value={selectedParent}
              onChange={(e) => setSelectedParent(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose a parent --</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name} ({parent.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Child
            </label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose a child --</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.first_name} {child.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship Type
            </label>
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value as "Parent" | "Guardian" | "Emergency Contact")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Parent">Parent</option>
              <option value="Guardian">Guardian</option>
              <option value="Emergency Contact">Emergency Contact</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Creating Link..." : "Link Parent to Child"}
          </button>
        </form>
      </div>

      {/* Existing Links */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Existing Links</h2>
        </div>

        {links.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No parent-child links found. Create one above.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {links.map((link) => (
              <div key={link.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {link.parent?.name || "Unknown Parent"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {link.parent?.email}
                      </p>
                    </div>
                    <span className="text-gray-400">→</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {link.child?.first_name} {link.child?.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {link.relationship_type}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleUnlink(link.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
