import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";

export default async function LinkParentToChildPage() {
  try {
    await protectRoute(["ADMIN", "SUPER_ADMIN"]);
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }

  const parents = [
    { name: "John Smith", email: "john@example.com", children: 1 },
    { name: "Sarah Johnson", email: "sarah@example.com", children: 2 },
    { name: "Michael Brown", email: "michael@example.com", children: 1 },
  ];

  const children = [
    { name: "Ben Smith", class: "Sunflower Room", linked: true },
    { name: "Clara Williams", class: "Rainbow Room", linked: false },
    { name: "Ava Johnson", class: "Stars Room", linked: false },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/dashboard/admin"
          className="text-sm text-blue-600 hover:text-blue-800 mb-6"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Link Parent to Child</h1>
        <p className="text-gray-600 mb-8">Create relationships between parent accounts and children</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Parents List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <p className="text-sm font-semibold text-gray-900">Parents</p>
            </div>
            <div className="divide-y divide-gray-200">
              {parents.map((parent) => (
                <div key={parent.email} className="px-6 py-4 hover:bg-gray-50">
                  <p className="font-medium text-gray-900">{parent.name}</p>
                  <p className="text-sm text-gray-600">{parent.email}</p>
                  <p className="text-xs text-gray-500 mt-1">{parent.children} child(ren)</p>
                </div>
              ))}
            </div>
          </div>

          {/* Children List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <p className="text-sm font-semibold text-gray-900">Children</p>
            </div>
            <div className="divide-y divide-gray-200">
              {children.map((child) => (
                <div key={child.name} className="px-6 py-4 hover:bg-gray-50">
                  <p className="font-medium text-gray-900">{child.name}</p>
                  <p className="text-sm text-gray-600">{child.class}</p>
                  <span
                    className={`text-xs font-medium mt-1 inline-block px-2 py-1 rounded ${
                      child.linked
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {child.linked ? "Linked" : "Not Linked"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Create New Link</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Select Parent</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900">
                <option>Choose a parent...</option>
                {parents.map((p) => (
                  <option key={p.email}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Select Child</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900">
                <option>Choose a child...</option>
                {children.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Create Link
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
