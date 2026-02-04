'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('Admin dashboard error:', error);
  
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-4">{error.message || 'An unexpected error occurred'}</p>
          
          {error.message?.includes('not found') && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-semibold text-yellow-800 mb-2">Setup Required</h3>
              <p className="text-sm text-yellow-700 mb-2">
                It looks like the database needs to be set up. Please:
              </p>
              <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
                <li>Run the COMPLETE_RESET.sql migration in Supabase</li>
                <li>Create your user account in Supabase Auth</li>
                <li>Run the SEED_DATA.sql with your user ID</li>
              </ol>
              <p className="text-sm text-yellow-700 mt-2">
                See <strong>SETUP_GUIDE.md</strong> for detailed instructions.
              </p>
            </div>
          )}
          
          <button
            onClick={reset}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    </main>
  );
}
