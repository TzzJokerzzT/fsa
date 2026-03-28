import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  type NodeChange,
  ReactFlow,
} from '@xyflow/react';
import { motion } from 'framer-motion';
import { GitCompare, Layers, Network, Scale } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import '@xyflow/react/dist/style.css';
import {
  useArchitectureList,
  useArchitectureStore,
} from '@/app/store/architecture.store';
import { ComponentNode } from '@/features/architecture-builder/components/ComponentNode';
import { AnimatedEdge } from '@/features/simulation';
import {
  type ArchitectureTemplate,
  architectureTemplates,
} from '@/features/templates';
import type {
  Architecture,
  ArchitectureEdge,
  ArchitectureNode,
} from '@/shared/types';
import { Badge, Card, CardContent, Select } from '@/shared/ui';

/**
 * Compare Page - Side-by-side architecture comparison
 * Allows comparing saved architectures or templates
 * Nodes are draggable for better visualization
 */

// Node and edge type mappings (same as Builder)
const nodeTypes = {
  component: ComponentNode,
  module: ComponentNode,
  state: ComponentNode,
  effect: ComponentNode,
  api: ComponentNode,
  hook: ComponentNode,
  context: ComponentNode,
  util: ComponentNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

/**
 * Determines the best handles to use based on relative node positions
 * This creates more natural-looking connections
 * Uses the new handle IDs: {position}-source and {position}-target
 */
function getSmartHandles(
  sourcePos: { x: number; y: number },
  targetPos: { x: number; y: number },
): { sourceHandle: string; targetHandle: string } {
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;

  // Determine primary direction
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection
    if (dx > 0) {
      return { sourceHandle: 'right-source', targetHandle: 'left-target' };
    }
    return { sourceHandle: 'left-source', targetHandle: 'right-target' };
  }
  // Vertical connection
  if (dy > 0) {
    return { sourceHandle: 'bottom-source', targetHandle: 'top-target' };
  }
  return { sourceHandle: 'top-source', targetHandle: 'bottom-target' };
}

// Convert architecture nodes to React Flow nodes
function toReactFlowNodes(nodes: ArchitectureNode[]): Node[] {
  return nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
    draggable: true,
  }));
}

// Convert architecture edges to React Flow edges with smart handles
function toReactFlowEdges(edges: ArchitectureEdge[], nodes: Node[]): Edge[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n.position]));

  // Helper to normalize handle IDs (convert old format to new format)
  const normalizeSourceHandle = (
    handle: string | undefined,
  ): string | undefined => {
    if (!handle) return undefined;
    if (handle.includes('-')) return handle; // Already new format
    return `${handle}-source`; // Convert old format
  };

  const normalizeTargetHandle = (
    handle: string | undefined,
  ): string | undefined => {
    if (!handle) return undefined;
    if (handle.includes('-')) return handle; // Already new format
    return `${handle}-target`; // Convert old format
  };

  return edges.map((edge) => {
    const sourcePos = nodeMap.get(edge.source);
    const targetPos = nodeMap.get(edge.target);

    // Use explicit handles if provided, otherwise compute smart handles
    let sourceHandle = normalizeSourceHandle(edge.sourceHandle);
    let targetHandle = normalizeTargetHandle(edge.targetHandle);

    if ((!sourceHandle || !targetHandle) && sourcePos && targetPos) {
      const smartHandles = getSmartHandles(sourcePos, targetPos);
      sourceHandle = sourceHandle || smartHandles.sourceHandle;
      targetHandle = targetHandle || smartHandles.targetHandle;
    }

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle,
      targetHandle,
      label: edge.data.label,
      type: 'animated',
      data: edge.data,
      style: {
        stroke: getEdgeColor(edge.data.type),
        strokeWidth: 2,
      },
    };
  });
}

function getEdgeColor(type: string): string {
  switch (type) {
    case 'props':
      return '#3b82f6';
    case 'state':
      return '#22c55e';
    case 'event':
      return '#f59e0b';
    case 'import':
      return '#8b5cf6';
    case 'context':
      return '#06b6d4';
    default:
      return '#64748b';
  }
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

// Selectable item type
type SelectableItem =
  | { type: 'architecture'; data: Architecture }
  | { type: 'template'; data: ArchitectureTemplate };

export default function ComparePage() {
  const savedArchitectures = useArchitectureList();
  const { loadFromTemplate } = useArchitectureStore();

  // Selected items for comparison
  const [leftSelection, setLeftSelection] = useState<string>('');
  const [rightSelection, setRightSelection] = useState<string>('');

  // Local node state for draggable nodes (separate from store)
  const [leftNodes, setLeftNodes] = useState<Node[]>([]);
  const [rightNodes, setRightNodes] = useState<Node[]>([]);

  // Set page title
  useEffect(() => {
    document.title = 'FSA | Compare Architectures';
  }, []);

  // Build options for selects
  const selectOptions = useMemo(() => {
    const options: { value: string; label: string; group: string }[] = [];

    // Add saved architectures
    if (savedArchitectures.length > 0) {
      savedArchitectures.forEach((arch) => {
        options.push({
          value: `arch:${arch.id}`,
          label: arch.name,
          group: 'Saved Architectures',
        });
      });
    }

    // Add templates
    architectureTemplates.forEach((template) => {
      options.push({
        value: `template:${template.id}`,
        label: template.name,
        group: 'Templates',
      });
    });

    return options;
  }, [savedArchitectures]);

  // Get selected items data
  const getItemData = (selection: string): SelectableItem | null => {
    if (!selection) return null;

    const [type, id] = selection.split(':');

    if (type === 'arch') {
      const arch = savedArchitectures.find((a) => a.id === id);
      return arch ? { type: 'architecture', data: arch } : null;
    }

    if (type === 'template') {
      const template = architectureTemplates.find((t) => t.id === id);
      return template ? { type: 'template', data: template } : null;
    }

    return null;
  };

  const leftItem = getItemData(leftSelection);
  const rightItem = getItemData(rightSelection);

  // Calculate metrics for an item
  const getMetrics = (item: SelectableItem | null) => {
    if (!item) return null;

    const nodes =
      item.type === 'architecture' ? item.data.nodes : item.data.nodes;
    const edges =
      item.type === 'architecture' ? item.data.edges : item.data.edges;

    // Count node types
    const nodeTypeCounts: Record<string, number> = {};
    nodes.forEach((n) => {
      const type = n.data?.type || n.type;
      nodeTypeCounts[type] = (nodeTypeCounts[type] || 0) + 1;
    });

    // Count edge types
    const edgeTypeCounts: Record<string, number> = {};
    edges.forEach((e) => {
      const type = e.data?.type || 'unknown';
      edgeTypeCounts[type] = (edgeTypeCounts[type] || 0) + 1;
    });

    // Complexity score (simple heuristic)
    const complexity =
      nodes.length * 2 +
      edges.length * 3 +
      Object.keys(nodeTypeCounts).length * 5;

    return {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodeTypes: nodeTypeCounts,
      edgeTypes: edgeTypeCounts,
      complexity,
    };
  };

  const leftMetrics = getMetrics(leftItem);
  const rightMetrics = getMetrics(rightItem);

  // Get nodes and edges for React Flow
  const getFlowData = useCallback(
    (
      item: SelectableItem | null,
      side: 'left' | 'right',
    ): { nodes: Node[]; edges: ArchitectureEdge[] } => {
      if (!item) return { nodes: [], edges: [] };

      if (item.type === 'architecture') {
        return {
          nodes: toReactFlowNodes(item.data.nodes),
          edges: item.data.edges,
        };
      }

      // For templates, we need to generate proper IDs
      const nodeIdMap = new Map<string, string>();
      const nodes = item.data.nodes.map((node, index) => {
        const id = `compare-${side}-${item.data.id}-node-${index}`;
        nodeIdMap.set(`node-${index}`, id);
        return {
          id,
          type: node.type,
          position: node.position,
          data: node.data,
          draggable: true,
        };
      });

      const edges: ArchitectureEdge[] = item.data.edges.map((edge, index) => ({
        id: `compare-${side}-${item.data.id}-edge-${index}`,
        source: nodeIdMap.get(edge.source) || edge.source,
        target: nodeIdMap.get(edge.target) || edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        data: edge.data,
      }));

      return { nodes, edges };
    },
    [],
  );

  // Initialize nodes when selection changes
  const handleLeftSelectionChange = useCallback(
    (value: string) => {
      setLeftSelection(value);
      const item = getItemData(value);
      if (item) {
        const { nodes } = getFlowData(item, 'left');
        setLeftNodes(nodes);
      } else {
        setLeftNodes([]);
      }
    },
    [getFlowData, savedArchitectures],
  );

  const handleRightSelectionChange = useCallback(
    (value: string) => {
      setRightSelection(value);
      const item = getItemData(value);
      if (item) {
        const { nodes } = getFlowData(item, 'right');
        setRightNodes(nodes);
      } else {
        setRightNodes([]);
      }
    },
    [getFlowData, savedArchitectures],
  );

  // Handle node changes (dragging)
  const onLeftNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setLeftNodes((nds) => applyNodeChanges(changes, nds));

      // Log position changes for debugging
      for (const change of changes) {
        if (change.type === 'position' && change.position) {
          const node = leftNodes.find((n) => n.id === change.id);
          console.log(
            `[Left] Node: "${node?.data?.label || change.id}" | Position: { x: ${Math.round(change.position.x)}, y: ${Math.round(change.position.y)} }`,
          );
        }
      }
    },
    [leftNodes],
  );

  const onRightNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setRightNodes((nds) => applyNodeChanges(changes, nds));

      // Log position changes for debugging
      for (const change of changes) {
        if (change.type === 'position' && change.position) {
          const node = rightNodes.find((n) => n.id === change.id);
          console.log(
            `[Right] Node: "${node?.data?.label || change.id}" | Position: { x: ${Math.round(change.position.x)}, y: ${Math.round(change.position.y)} }`,
          );
        }
      }
    },
    [rightNodes],
  );

  // Get edges with smart handles based on current node positions
  const leftEdges = useMemo(() => {
    if (!leftItem) return [];
    const { edges } = getFlowData(leftItem, 'left');
    return toReactFlowEdges(edges, leftNodes);
  }, [leftItem, leftNodes, getFlowData]);

  const rightEdges = useMemo(() => {
    if (!rightItem) return [];
    const { edges } = getFlowData(rightItem, 'right');
    return toReactFlowEdges(edges, rightNodes);
  }, [rightItem, rightNodes, getFlowData]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-4 border-b border-surface-400 bg-surface-200/50"
      >
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3 mb-4"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              Compare Architectures
            </h1>
            <p className="text-sm text-text-secondary">
              Select two architectures or templates to compare side by side.
              Drag nodes to rearrange.
            </p>
          </div>
        </motion.div>

        {/* Selection Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          <Select
            value={leftSelection}
            onChange={(e) => handleLeftSelectionChange(e.target.value)}
            options={[
              { value: '', label: 'Select architecture...' },
              ...selectOptions.map((opt) => ({
                value: opt.value,
                label: `${opt.label} (${opt.group})`,
              })),
            ]}
          />
          <Select
            value={rightSelection}
            onChange={(e) => handleRightSelectionChange(e.target.value)}
            options={[
              { value: '', label: 'Select architecture...' },
              ...selectOptions.map((opt) => ({
                value: opt.value,
                label: `${opt.label} (${opt.group})`,
              })),
            ]}
          />
        </motion.div>
      </motion.div>

      {/* Comparison Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="flex-1 flex flex-col border-r border-surface-400">
          {leftItem ? (
            <>
              {/* Info Header */}
              <div className="p-3 border-b border-surface-400 bg-surface-300/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {leftItem.data.name}
                    </h3>
                    <p className="text-xs text-text-muted capitalize">
                      {leftItem.data.type}
                    </p>
                  </div>
                  {leftItem.type === 'template' && (
                    <Badge
                      variant={
                        leftItem.data.complexity === 'simple'
                          ? 'success'
                          : leftItem.data.complexity === 'medium'
                            ? 'warning'
                            : 'error'
                      }
                      size="sm"
                    >
                      {leftItem.data.complexity}
                    </Badge>
                  )}
                </div>
              </div>

              {/* React Flow View */}
              <div className="flex-1">
                <ReactFlow
                  nodes={leftNodes}
                  edges={leftEdges}
                  onNodesChange={onLeftNodesChange}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  nodesDraggable={true}
                  nodesConnectable={false}
                  elementsSelectable={true}
                  panOnScroll
                  zoomOnScroll
                  minZoom={0.1}
                  maxZoom={1.5}
                >
                  <Background
                    variant={BackgroundVariant.Dots}
                    gap={16}
                    size={1}
                    color="var(--color-surface-400)"
                  />
                  <Controls position="top-left" showInteractive={false} />
                  <MiniMap
                    nodeStrokeWidth={3}
                    position="bottom-left"
                    pannable
                    style={{ width: 100, height: 70 }}
                  />
                </ReactFlow>
              </div>
            </>
          ) : (
            <EmptyPanel side="left" />
          )}
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col">
          {rightItem ? (
            <>
              {/* Info Header */}
              <div className="p-3 border-b border-surface-400 bg-surface-300/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {rightItem.data.name}
                    </h3>
                    <p className="text-xs text-text-muted capitalize">
                      {rightItem.data.type}
                    </p>
                  </div>
                  {rightItem.type === 'template' && (
                    <Badge
                      variant={
                        rightItem.data.complexity === 'simple'
                          ? 'success'
                          : rightItem.data.complexity === 'medium'
                            ? 'warning'
                            : 'error'
                      }
                      size="sm"
                    >
                      {rightItem.data.complexity}
                    </Badge>
                  )}
                </div>
              </div>

              {/* React Flow View */}
              <div className="flex-1">
                <ReactFlow
                  nodes={rightNodes}
                  edges={rightEdges}
                  onNodesChange={onRightNodesChange}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  nodesDraggable={true}
                  nodesConnectable={false}
                  elementsSelectable={true}
                  panOnScroll
                  zoomOnScroll
                  minZoom={0.1}
                  maxZoom={1.5}
                >
                  <Background
                    variant={BackgroundVariant.Dots}
                    gap={16}
                    size={1}
                    color="var(--color-surface-400)"
                  />
                  <Controls position="top-right" showInteractive={false} />
                  <MiniMap
                    nodeStrokeWidth={3}
                    position="bottom-right"
                    pannable
                    style={{ width: 100, height: 70 }}
                  />
                </ReactFlow>
              </div>
            </>
          ) : (
            <EmptyPanel side="right" />
          )}
        </div>
      </div>

      {/* Metrics Comparison Bar */}
      {leftMetrics && rightMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-surface-400 bg-surface-200"
        >
          <div className="grid grid-cols-3 gap-4">
            {/* Nodes */}
            <MetricCard
              icon={Layers}
              label="Components"
              leftValue={leftMetrics.nodeCount}
              rightValue={rightMetrics.nodeCount}
            />

            {/* Edges */}
            <MetricCard
              icon={Network}
              label="Connections"
              leftValue={leftMetrics.edgeCount}
              rightValue={rightMetrics.edgeCount}
            />

            {/* Complexity */}
            <MetricCard
              icon={Scale}
              label="Complexity Score"
              leftValue={leftMetrics.complexity}
              rightValue={rightMetrics.complexity}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Empty panel placeholder
function EmptyPanel({ side }: { side: 'left' | 'right' }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-surface-100/50">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-surface-300 flex items-center justify-center mb-3">
          <GitCompare className="w-6 h-6 text-text-muted" />
        </div>
        <p className="text-text-secondary">
          Select an architecture for the {side} side
        </p>
      </div>
    </div>
  );
}

// Metric comparison card
function MetricCard({
  icon: Icon,
  label,
  leftValue,
  rightValue,
}: {
  icon: React.ElementType;
  label: string;
  leftValue: number;
  rightValue: number;
}) {
  const diff = leftValue - rightValue;
  const diffPercent =
    rightValue > 0 ? Math.round((diff / rightValue) * 100) : 0;

  return (
    <Card variant="bordered">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4 text-text-muted" />
          <span className="text-sm font-medium text-text-secondary">
            {label}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">{leftValue}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              diff === 0
                ? 'bg-surface-400 text-text-muted'
                : diff > 0
                  ? 'bg-warning/10 text-warning'
                  : 'bg-success/10 text-success'
            }`}
          >
            {diff === 0 ? '=' : diff > 0 ? `+${diff}` : diff}
            {diffPercent !== 0 &&
              ` (${diffPercent > 0 ? '+' : ''}${diffPercent}%)`}
          </span>
          <span className="text-lg font-bold text-accent">{rightValue}</span>
        </div>
      </CardContent>
    </Card>
  );
}
