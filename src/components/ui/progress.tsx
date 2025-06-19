interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
}

export function Progress({
  value = 0,
  max = 100,
  className = '',
}: ProgressProps) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
      <div
        className="h-full bg-blue-600 transition-all"
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  );
} 