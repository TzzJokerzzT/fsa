import { cn } from '@/shared/lib/cn';

/**
 * Skeleton loader component for loading states
 */

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'bg-surface-400 animate-pulse',
        variantStyles[variant],
        className,
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

/**
 * Pre-built skeleton compositions
 */

export function SkeletonCard() {
  return (
    <div className="p-4 space-y-3 bg-surface-200 rounded-xl">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" variant="rectangular" />
    </div>
  );
}

export function SkeletonNode() {
  return (
    <div className="p-3 space-y-2 bg-surface-300 rounded-lg border border-surface-400">
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" className="w-6 h-6" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  );
}
