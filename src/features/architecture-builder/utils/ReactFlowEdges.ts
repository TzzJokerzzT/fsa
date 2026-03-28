import type { Edge } from '@xyflow/react';
import type { ArchitectureEdge } from '@/shared/types';
import { getEdgeColor } from '@/shared/utils/getEdgeColor';

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

// Convert our architecture edges to React Flow edges
export function toReactFlowEdges(edges: ArchitectureEdge[]): Edge[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: normalizeSourceHandle(edge.sourceHandle),
    targetHandle: normalizeTargetHandle(edge.targetHandle),
    label: edge.data.label,
    animated: edge.animated || edge.data.type === 'event',
    type: 'animated', // Use our custom animated edge
    data: edge.data,
    style: {
      stroke: getEdgeColor(edge.data.type),
      strokeWidth: 2,
    },
  }));
}
