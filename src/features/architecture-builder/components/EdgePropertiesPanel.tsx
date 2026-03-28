import { motion } from 'framer-motion';
import {
  ArrowRight,
  Box,
  Database,
  FileInput,
  MessageSquare,
  Share2,
  Trash2,
  X,
} from 'lucide-react';
import { useMemo } from 'react';
import { useArchitectureStore, useCurrentArchitecture } from '@/app/store';
import { cn } from '@/shared/lib/cn';
import type { EdgeType } from '@/shared/types';
import { Badge, Button, Divider, Input } from '@/shared/ui';

/**
 * Edge Properties Panel - Edit selected edge properties
 * Allows changing edge type, label, and deletion
 */

const edgeTypeOptions: {
  type: EdgeType;
  label: string;
  icon: typeof ArrowRight;
  color: string;
}[] = [
  {
    type: 'props',
    label: 'Props',
    icon: Box,
    color: 'text-blue-400 bg-blue-500/20 border-blue-500/50',
  },
  {
    type: 'state',
    label: 'State',
    icon: Database,
    color: 'text-green-400 bg-green-500/20 border-green-500/50',
  },
  {
    type: 'event',
    label: 'Event',
    icon: MessageSquare,
    color: 'text-amber-400 bg-amber-500/20 border-amber-500/50',
  },
  {
    type: 'context',
    label: 'Context',
    icon: Share2,
    color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/50',
  },
  {
    type: 'import',
    label: 'Import',
    icon: FileInput,
    color: 'text-purple-400 bg-purple-500/20 border-purple-500/50',
  },
];

export function EdgePropertiesPanel() {
  const architecture = useCurrentArchitecture();
  const selectedEdgeIds = useArchitectureStore((s) => s.selectedEdgeIds);
  const { updateEdge, deleteEdge, clearSelection } = useArchitectureStore();

  // Get selected edges
  const selectedEdges = useMemo(() => {
    if (!architecture) return [];
    return architecture.edges.filter((e) => selectedEdgeIds.has(e.id));
  }, [architecture, selectedEdgeIds]);

  // Single edge editing
  const singleEdge = selectedEdges.length === 1 ? selectedEdges[0] : null;

  // Get source and target node labels
  const sourceNode = useMemo(() => {
    if (!singleEdge || !architecture) return null;
    return architecture.nodes.find((n) => n.id === singleEdge.source);
  }, [singleEdge, architecture]);

  const targetNode = useMemo(() => {
    if (!singleEdge || !architecture) return null;
    return architecture.nodes.find((n) => n.id === singleEdge.target);
  }, [singleEdge, architecture]);

  const handleTypeChange = (type: EdgeType) => {
    if (singleEdge) {
      updateEdge(singleEdge.id, { type });
    }
  };

  const handleLabelChange = (label: string) => {
    if (singleEdge) {
      updateEdge(singleEdge.id, { label: label || undefined });
    }
  };

  const handleDelete = () => {
    for (const edge of selectedEdges) {
      deleteEdge(edge.id);
    }
  };

  if (selectedEdges.length === 0) return null;

  return (
    <motion.aside
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="w-80 bg-surface-200 border-l border-surface-400 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-400">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-text-primary">Connection</h3>
          {selectedEdges.length > 1 && (
            <Badge variant="outline" size="sm">
              {selectedEdges.length} selected
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearSelection}
          aria-label="Close panel"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {singleEdge ? (
          <>
            {/* Connection Info */}
            <div className="p-3 bg-surface-300 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-text-primary font-medium truncate">
                  {sourceNode?.data.label || 'Unknown'}
                </span>
                <ArrowRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                <span className="text-text-primary font-medium truncate">
                  {targetNode?.data.label || 'Unknown'}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Drag the edge endpoints to reconnect
              </p>
            </div>

            <Divider />

            {/* Edge Type */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-text-primary">
                Connection Type
              </span>
              <div className="grid grid-cols-2 gap-2">
                {edgeTypeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = singleEdge.data.type === option.type;

                  return (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => handleTypeChange(option.type)}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg border-2 text-left',
                        'transition-all duration-150',
                        isSelected
                          ? option.color
                          : 'border-transparent bg-surface-300 hover:bg-surface-400',
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-4 h-4',
                          isSelected
                            ? option.color.split(' ')[0]
                            : 'text-text-secondary',
                        )}
                      />
                      <span
                        className={cn(
                          'text-sm',
                          isSelected
                            ? 'text-text-primary'
                            : 'text-text-secondary',
                        )}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Divider />

            {/* Label */}
            <Input
              label="Label (optional)"
              value={singleEdge.data.label || ''}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="e.g., userData, onClick, isLoading"
              helperText="A label to describe this connection"
            />

            {/* Edge ID (read-only info) */}
            <div className="space-y-1">
              <span className="text-sm font-medium text-text-muted">
                Edge ID
              </span>
              <p className="text-xs text-text-muted font-mono bg-surface-300 p-2 rounded truncate">
                {singleEdge.id}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-text-secondary">
              {selectedEdges.length} connections selected
            </p>
            <p className="text-sm text-text-muted mt-1">
              Select a single connection to edit properties
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-surface-400">
        <Button
          variant="danger"
          className="w-full"
          leftIcon={<Trash2 className="w-4 h-4" />}
          onClick={handleDelete}
        >
          Delete{' '}
          {selectedEdges.length > 1
            ? `${selectedEdges.length} Connections`
            : 'Connection'}
        </Button>
      </div>
    </motion.aside>
  );
}
