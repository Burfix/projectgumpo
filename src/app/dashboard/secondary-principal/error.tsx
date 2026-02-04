"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Secondary Principal Dashboard Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Error</h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            An error occurred while loading the Secondary Principal Dashboard. This could be due to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Missing user profile in the database</li>
            <li>No school assignment for your account</li>
            <li>Database migration not yet executed</li>
            <li>Authentication issues</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Setup Required:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 ml-2">
            <li>Run the <code className="bg-blue-100 px-2 py-0.5 rounded">ADD_SECONDARY_PRINCIPAL_ROLE.sql</code> migration in Supabase</li>
            <li>Ensure your user profile exists in the public.users table</li>
            <li>Verify your role is set to SECONDARY_PRINCIPAL</li>
            <li>Check that you have a school_id assigned (or default fallback is working)</li>
          </ol>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Error Details:</h4>
          <pre className="text-sm text-gray-600 overflow-x-auto">
            {error.message || "Unknown error"}
          </pre>
        </div>

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
