import { Suspense } from "react";
import SchoolsManagementClient from "./SchoolsManagementClient";

export default function SchoolsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 p-6"><div className="max-w-7xl mx-auto"><div className="text-center">Loading...</div></div></div>}>
      <SchoolsManagementClient />
    </Suspense>
  );
}
