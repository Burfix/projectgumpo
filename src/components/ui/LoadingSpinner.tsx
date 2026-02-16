type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  text?: string;
};

export default function LoadingSpinner({ 
  size = "md", 
  color = "border-green-600",
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
    xl: "h-16 w-16 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} ${color} border-t-transparent rounded-full animate-spin`}
      />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
}
