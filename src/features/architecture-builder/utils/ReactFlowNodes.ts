import type { ArchitectureNode } from '@/shared/types';

// Convert our architecture nodes to React Flow nodes
export function toReactFlowNodes(nodes: ArchitectureNode[]): Node[] {
  return nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
    selected: node.selected,
    dragging: node.dragging,
  }));
}
