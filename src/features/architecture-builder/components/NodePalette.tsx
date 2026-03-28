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
import { cn } from '@/shared/lib/cn';
import type { NodeType } from '@/shared/types';

/**
 * Node Palette - Draggable node types for the canvas
 */

const nodeItems: {
  type: NodeType;
  label: string;
  icon: typeof Component;
  color: string;
}[] = [
  {
    type: 'component',
    label: 'Component',
    icon: Component,
    color: 'text-node-component',
  },
  { type: 'module', label: 'Module', icon: Boxes, color: 'text-node-module' },
  { type: 'state', label: 'State', icon: Database, color: 'text-node-state' },
  { type: 'effect', label: 'Effect', icon: Zap, color: 'text-node-effect' },
  { type: 'api', label: 'API', icon: Globe, color: 'text-node-api' },
  { type: 'hook', label: 'Hook', icon: Code, color: 'text-purple-400' },
  {
    type: 'context',
    label: 'Context',
    icon: CircleDot,
    color: 'text-cyan-400',
  },
  { type: 'util', label: 'Utility', icon: Wrench, color: 'text-gray-400' },
];

export function NodePalette() {
  const handleDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-52 bg-surface-200 border-r border-surface-400 p-4 flex flex-col gap-2"
    >
      <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
        Drag to Canvas
      </h3>

      <div className="space-y-2">
        {nodeItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.type}
              draggable
              onDragStart={(e) => handleDragStart(e, item.type)}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                'bg-surface-300 border border-surface-400',
                'cursor-grab active:cursor-grabbing',
                'hover:border-surface-500 transition-colors',
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-md',
                  'bg-surface-400',
                  item.color,
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-text-primary">
                {item.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Help text */}
      <div className="mt-auto pt-4 border-t border-surface-400">
        <p className="text-xs text-text-muted">
          Drag nodes to the canvas to create your architecture diagram.
        </p>
        <p className="text-xs text-text-muted mt-2">
          <kbd className="px-1.5 py-0.5 bg-surface-400 rounded text-text-secondary">
            Del
          </kbd>{' '}
          to delete selected nodes
        </p>
      </div>
    </motion.aside>
  );
}
