import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";
import SystemSettingsForm from "./SystemSettingsForm";

export default async function SystemSettingsPage() {
  try {
    await protectRoute(["SUPER_ADMIN"]);
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link
          href="/dashboard/super-admin"
          className="text-sm text-green-700 hover:text-green-800"
        >
          ← Back to dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-6">System Settings</h1>
        
        <SystemSettingsForm />
      </div>
    </main>
  );
}
