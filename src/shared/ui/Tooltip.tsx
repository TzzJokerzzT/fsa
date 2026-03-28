import { cn } from '@/shared/lib/cn';

/**
 * Tooltip component with hover trigger
 * Supports multiple positions
 */

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowStyles = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-surface-600 border-x-transparent border-b-transparent',
  bottom:
    'bottom-full left-1/2 -translate-x-1/2 border-b-surface-600 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-surface-600 border-y-transparent border-r-transparent',
  right:
    'right-full top-1/2 -translate-y-1/2 border-r-surface-600 border-y-transparent border-l-transparent',
};

export function Tooltip({
  content,
  children,
  position = 'top',
  className,
}: TooltipProps) {
  return (
    <div className="relative group inline-block">
      {children}
      <div
        role="tooltip"
        className={cn(
          'absolute z-tooltip',
          'px-2.5 py-1.5',
          'bg-surface-600 text-text-primary text-sm',
          'rounded-lg shadow-lg',
          'opacity-0 invisible',
          'group-hover:opacity-100 group-hover:visible',
          'transition-all duration-150',
          'whitespace-nowrap',
          'pointer-events-none',
          positionStyles[position],
          className,
        )}
      >
        {content}
        <div
          className={cn('absolute w-0 h-0', 'border-4', arrowStyles[position])}
        />
      </div>
    </div>
  );
}
