import { cn } from '@/shared/lib/cn';
import type { NodeType } from '@/shared/types';

/**
 * Badge component for displaying node types and status
 */

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | NodeType;
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-surface-400 text-text-primary',
  outline: 'bg-transparent border border-surface-500 text-text-secondary',
  // Node type colors
  component:
    'bg-node-component/20 text-node-component border border-node-component/30',
  module: 'bg-node-module/20 text-node-module border border-node-module/30',
  state: 'bg-node-state/20 text-node-state border border-node-state/30',
  effect: 'bg-node-effect/20 text-node-effect border border-node-effect/30',
  api: 'bg-node-api/20 text-node-api border border-node-api/30',
  hook: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  context: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  util: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
};

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-sm',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
