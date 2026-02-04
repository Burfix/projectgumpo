import { StatCardSkeleton } from "./_components/StatCard";

export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="divide-y divide-gray-200">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="px-6 py-4">
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-56 bg-gray-100 rounded animate-pulse mt-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-5 w-28 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-9 w-full bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="divide-y divide-gray-200">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="px-6 py-4">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-56 bg-gray-100 rounded animate-pulse mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
