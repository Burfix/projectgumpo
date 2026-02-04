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
