import { AnimatePresence, motion } from 'framer-motion';
import { Pencil, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  useArchitectureStore,
  useCurrentArchitecture,
  useSelectedNodeIds,
} from '@/app/store';
import { cn } from '@/shared/lib/cn';
import type { NodeProp, NodeState } from '@/shared/types';
import { Badge, Button, Divider, Input, Tooltip } from '@/shared/ui';
import { AddPropModal } from './AddPropModal';
import { AddStateModal } from './AddStateModal';

/**
 * Properties Panel - Edit selected node properties
 * Supports adding, editing, and deleting props and state
 */

export function PropertiesPanel() {
  const architecture = useCurrentArchitecture();
  const selectedNodeIds = useSelectedNodeIds();
  const { updateNode, deleteNode, clearSelection } = useArchitectureStore();

  // Modal state
  const [isPropModalOpen, setIsPropModalOpen] = useState(false);
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);

  // Get selected nodes
  const selectedNodes = useMemo(() => {
    if (!architecture) return [];
    return architecture.nodes.filter((n) => selectedNodeIds.has(n.id));
  }, [architecture, selectedNodeIds]);

  // Single node editing
  const singleNode = selectedNodes.length === 1 ? selectedNodes[0] : null;

  const handleLabelChange = (value: string) => {
    if (singleNode) {
      updateNode(singleNode.id, { label: value });
    }
  };

  const handleDescriptionChange = (value: string) => {
    if (singleNode) {
      updateNode(singleNode.id, { description: value });
    }
  };

  const handleDelete = () => {
    for (const node of selectedNodes) {
      deleteNode(node.id);
    }
  };

  // Props handlers
  const handleAddProp = (prop: NodeProp) => {
    if (!singleNode) return;
    const currentProps = singleNode.data.props || [];
    updateNode(singleNode.id, { props: [...currentProps, prop] });
  };

  const handleDeleteProp = (propName: string) => {
    if (!singleNode) return;
    const currentProps = singleNode.data.props || [];
    updateNode(singleNode.id, {
      props: currentProps.filter((p) => p.name !== propName),
    });
  };

  const handleTogglePropRequired = (propName: string) => {
    if (!singleNode) return;
    const currentProps = singleNode.data.props || [];
    updateNode(singleNode.id, {
      props: currentProps.map((p) =>
        p.name === propName ? { ...p, required: !p.required } : p,
      ),
    });
  };

  // State handlers
  const handleAddState = (state: NodeState) => {
    if (!singleNode) return;
    const currentState = singleNode.data.state || [];
    updateNode(singleNode.id, { state: [...currentState, state] });
  };

  const handleDeleteState = (stateName: string) => {
    if (!singleNode) return;
    const currentState = singleNode.data.state || [];
    updateNode(singleNode.id, {
      state: currentState.filter((s) => s.name !== stateName),
    });
  };

  if (selectedNodes.length === 0) return null;

  return (
    <>
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
            <h3 className="font-semibold text-text-primary">Properties</h3>
            {selectedNodes.length > 1 && (
              <Badge variant="outline" size="sm">
                {selectedNodes.length} selected
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
          {singleNode ? (
            <>
              {/* Node Type */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-text-primary">
                  Type
                </span>
                <Badge variant={singleNode.type} size="md">
                  {singleNode.type}
                </Badge>
              </div>

              {/* Label */}
              <Input
                label="Label"
                value={singleNode.data.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="Node label"
              />

              {/* Description */}
              <div className="space-y-1.5">
                <label
                  htmlFor="node-description"
                  className="text-sm font-medium text-text-primary"
                >
                  Description
                </label>
                <textarea
                  id="node-description"
                  value={singleNode.data.description || ''}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="Optional description..."
                  className={cn(
                    'w-full px-3 py-2 min-h-[80px] resize-y',
                    'bg-surface-300 text-text-primary',
                    'border border-surface-500 rounded-lg',
                    'placeholder:text-text-muted',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  )}
                />
              </div>

              <Divider />

              {/* Props Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">
                    Props
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPropModalOpen(true)}
                  >
                    Add
                  </Button>
                </div>
                <AnimatePresence mode="popLayout">
                  {singleNode.data.props && singleNode.data.props.length > 0 ? (
                    <div className="space-y-2">
                      {singleNode.data.props.map((prop) => (
                        <PropItem
                          key={prop.name}
                          prop={prop}
                          onDelete={() => handleDeleteProp(prop.name)}
                          onToggleRequired={() =>
                            handleTogglePropRequired(prop.name)
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-text-muted"
                    >
                      No props defined
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <Divider />

              {/* State Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">
                    State
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsStateModalOpen(true)}
                  >
                    Add
                  </Button>
                </div>
                <AnimatePresence mode="popLayout">
                  {singleNode.data.state && singleNode.data.state.length > 0 ? (
                    <div className="space-y-2">
                      {singleNode.data.state.map((state) => (
                        <StateItem
                          key={state.name}
                          state={state}
                          onDelete={() => handleDeleteState(state.name)}
                        />
                      ))}
                    </div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-text-muted"
                    >
                      No state defined
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Position Info */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-text-muted">
                  Position
                </span>
                <div className="flex gap-4 text-sm text-text-secondary">
                  <span>X: {Math.round(singleNode.position.x)}</span>
                  <span>Y: {Math.round(singleNode.position.y)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-text-secondary">
                {selectedNodes.length} nodes selected
              </p>
              <p className="text-sm text-text-muted mt-1">
                Select a single node to edit properties
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
            {selectedNodes.length > 1
              ? `${selectedNodes.length} Nodes`
              : 'Node'}
          </Button>
        </div>
      </motion.aside>

      {/* Modals */}
      <AddPropModal
        isOpen={isPropModalOpen}
        onClose={() => setIsPropModalOpen(false)}
        onAdd={handleAddProp}
        existingProps={singleNode?.data.props}
      />
      <AddStateModal
        isOpen={isStateModalOpen}
        onClose={() => setIsStateModalOpen(false)}
        onAdd={handleAddState}
        existingState={singleNode?.data.state}
      />
    </>
  );
}

/**
 * Individual prop item with actions
 */
interface PropItemProps {
  prop: NodeProp;
  onDelete: () => void;
  onToggleRequired: () => void;
}

function PropItem({ prop, onDelete, onToggleRequired }: PropItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group flex items-center gap-2 p-2 bg-surface-300 rounded-lg text-sm"
    >
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="text-text-primary font-medium truncate">
          {prop.name}
        </span>
        <span className="text-text-muted">:</span>
        <span className="text-text-secondary truncate">{prop.type}</span>
        {prop.required && (
          <Badge variant="outline" size="sm">
            required
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip content={prop.required ? 'Make optional' : 'Make required'}>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={onToggleRequired}
          >
            <Pencil className="w-3 h-3" />
          </Button>
        </Tooltip>
        <Tooltip content="Delete prop">
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 hover:text-error"
            onClick={onDelete}
          >
            <X className="w-3 h-3" />
          </Button>
        </Tooltip>
      </div>
    </motion.div>
  );
}

/**
 * Individual state item with actions
 */
interface StateItemProps {
  state: NodeState;
  onDelete: () => void;
}

function StateItem({ state, onDelete }: StateItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group flex items-center gap-2 p-2 bg-surface-300 rounded-lg text-sm"
    >
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="text-text-primary font-medium truncate">
          {state.name}
        </span>
        <span className="text-text-muted">:</span>
        <span className="text-text-secondary truncate">{state.type}</span>
        {state.initialValue && (
          <span className="text-text-muted truncate text-xs">
            = {state.initialValue}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip content="Delete state">
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 hover:text-error"
            onClick={onDelete}
          >
            <X className="w-3 h-3" />
          </Button>
        </Tooltip>
      </div>
    </motion.div>
  );
}
