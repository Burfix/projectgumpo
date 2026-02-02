'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white border border-stone-200 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Page</h1>
          <p className="text-stone-600 mb-4">{error.message || 'An unexpected error occurred'}</p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    </main>
  );
}
