import { Handle, type NodeProps, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import {
  Boxes,
  CircleDot,
  Code,
  Component,
  Database,
  Globe,
  Wrench,
  Zap,
} from 'lucide-react';
import { memo } from 'react';
import { cn } from '@/shared/lib/cn';
import type { NodeData, NodeType } from '@/shared/types';
import { Badge } from '@/shared/ui';

/**
 * Custom React Flow node component
 * Represents different types of architecture nodes
 * Has 4 connection handles - one on each side (top, right, bottom, left)
 */

const nodeIcons: Record<NodeType, typeof Component> = {
  component: Component,
  module: Boxes,
  state: Database,
  effect: Zap,
  api: Globe,
  hook: Code,
  context: CircleDot,
  util: Wrench,
};

const nodeColors: Record<NodeType, string> = {
  component: 'border-node-component bg-node-component/10',
  module: 'border-node-module bg-node-module/10',
  state: 'border-node-state bg-node-state/10',
  effect: 'border-node-effect bg-node-effect/10',
  api: 'border-node-api bg-node-api/10',
  hook: 'border-purple-500 bg-purple-500/10',
  context: 'border-cyan-500 bg-cyan-500/10',
  util: 'border-gray-500 bg-gray-500/10',
};

// Common handle styles
const handleBaseClass =
  '!w-3 !h-3 !bg-surface-500 !border-2 !border-surface-300 hover:!bg-primary transition-colors';

function ComponentNodeComponent({ data, selected }: NodeProps<NodeData>) {
  const Icon = nodeIcons[data.type] || Component;
  const colorClass = nodeColors[data.type] || nodeColors.component;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'px-4 py-3 min-w-[150px] max-w-[250px]',
        'rounded-xl border-2',
        'bg-surface-200 backdrop-blur-sm',
        'transition-shadow duration-200',
        colorClass,
        selected &&
          'shadow-glow ring-2 ring-primary ring-offset-2 ring-offset-surface-100',
      )}
    >
      {/* Top Handle (both source and target) */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className={handleBaseClass}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className={cn(handleBaseClass, '!opacity-0')}
      />

      {/* Right Handle (both source and target) */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className={handleBaseClass}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className={cn(handleBaseClass, '!opacity-0')}
      />

      {/* Bottom Handle (both source and target) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className={handleBaseClass}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className={cn(handleBaseClass, '!opacity-0')}
      />

      {/* Left Handle (both source and target) */}
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className={handleBaseClass}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className={cn(handleBaseClass, '!opacity-0')}
      />

      {/* Content */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-lg',
            'bg-surface-300',
          )}
        >
          <Icon className="w-4 h-4 text-text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-text-primary truncate">
            {data.label}
          </p>
          <Badge variant={data.type} size="sm" className="mt-1">
            {data.type}
          </Badge>
        </div>
      </div>

      {/* Description */}
      {data.description && (
        <p className="mt-2 text-xs text-text-muted line-clamp-2">
          {data.description}
        </p>
      )}

      {/* Props/State indicators */}
      {!!(data.props?.length || data.state?.length) && (
        <div className="mt-2 pt-2 border-t border-surface-400 flex gap-2">
          {data.props && data.props.length > 0 && (
            <span className="text-xs text-text-muted">
              {data.props.length} props
            </span>
          )}
          {data.state && data.state.length > 0 && (
            <span className="text-xs text-text-muted">
              {data.state.length} state
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Memo for performance
export const ComponentNode = memo(ComponentNodeComponent);
