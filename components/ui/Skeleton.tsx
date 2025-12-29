interface SkeletonProps {
  className?: string;
}

/**
 * Loading skeleton component
 * Shows animated placeholder while content loads
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-label="Loading..."
    />
  );
}
