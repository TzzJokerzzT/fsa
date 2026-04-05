import { MarkerType, type Edge } from '@xyflow/react';
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

// Build arrow marker config
const arrowMarker = (color: string) => ({
  type: MarkerType.ArrowClosed,
  width: 16,
  height: 16,
  color,
});

// Convert our architecture edges to React Flow edges
export function toReactFlowEdges(edges: ArchitectureEdge[]): Edge[] {
  return edges.map((edge) => {
    const color = getEdgeColor(edge.data.type);
    const direction = edge.data.direction || 'source-to-target';

    // Determine markers based on direction
    const markerEnd =
      direction === 'source-to-target' || direction === 'bidirectional'
        ? arrowMarker(color)
        : undefined;
    const markerStart =
      direction === 'target-to-source' || direction === 'bidirectional'
        ? arrowMarker(color)
        : undefined;

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: normalizeSourceHandle(edge.sourceHandle),
      targetHandle: normalizeTargetHandle(edge.targetHandle),
      label: edge.data.label,
      animated: edge.animated || edge.data.type === 'event',
      type: 'animated', // Use our custom animated edge
      data: edge.data as unknown as Record<string, unknown>,
      markerEnd,
      markerStart,
      style: {
        stroke: color,
        strokeWidth: 2,
      },
    };
  });
}
