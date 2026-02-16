export default function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="animate-pulse space-y-4">
        {/* Header skeleton */}
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        
        {/* Rows skeleton */}
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Dashboard skeleton specific to parent dashboard
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Main content skeleton */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 border-b border-gray-100 pb-4">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
