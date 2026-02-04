interface StatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  valueClassName?: string;
  tooltip?: string;
}

export default function StatCard({
  label,
  value,
  subLabel,
  valueClassName = "text-gray-900",
  tooltip,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="text-gray-600 text-sm font-medium">{label}</div>
      <div className={`text-3xl font-bold mt-2 ${valueClassName}`} title={tooltip}>
        {value}
      </div>
      {subLabel ? <p className="text-xs text-gray-600 mt-2">{subLabel}</p> : null}
      {!subLabel && tooltip ? (
        <p className="text-xs text-gray-500 mt-2" title={tooltip}>
          {tooltip}
        </p>
      ) : null}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded" />
      <div className="h-8 w-16 bg-gray-200 rounded mt-4" />
      <div className="h-3 w-24 bg-gray-100 rounded mt-3" />
    </div>
  );
}
