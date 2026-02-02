import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";

export default async function SchoolSettingsImpersonated({
  params,
}: {
  params: { schoolId: string };
}) {
  try {
    await protectRoute(["SUPER_ADMIN"]);
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Impersonation Banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-amber-900">
              Viewing as Super Admin — School #{params.schoolId}
            </p>
          </div>
          <Link
            href={`/dashboard/super-admin/impersonate/${params.schoolId}`}
            className="px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded hover:bg-amber-700"
          >
            Back to School Overview
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link
          href={`/dashboard/super-admin/impersonate/${params.schoolId}`}
          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mb-4 inline-block"
        >
          ← Back
        </Link>
        <h1 className="text-4xl font-bold text-stone-900 mb-2">
          School Settings
        </h1>
        <p className="text-stone-600 mb-8">
          Configure school information and policies
        </p>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-stone-600 mb-4">
            TODO: Implement school settings form
          </p>
          <p className="text-sm text-stone-500">
            This view reuses the admin dashboard logic but within the super admin
            impersonation context.
          </p>
        </div>
      </div>
    </div>
  );
}
