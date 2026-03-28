/**
 * Architecture Types - Architecture related API types
 * Mirrors backend DTOs for type safety
 */

import type { PaginatedResponse } from './api.types';

// Architecture types (matching backend enum)
export type ArchitectureType =
  | 'monolithic'
  | 'modular'
  | 'feature-based'
  | 'atomic-design'
  | 'microfrontends'
  | 'clean-architecture'
  | 'hexagonal'
  | 'vertical-slice';

// Node types
export type NodeType =
  | 'component'
  | 'module'
  | 'state'
  | 'effect'
  | 'api'
  | 'hook'
  | 'context'
  | 'util';

// Edge types
export type EdgeType = 'props' | 'state' | 'event' | 'import' | 'context';

// Position
export interface Position {
  x: number;
  y: number;
}

// Node prop
export interface NodeProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

// Node state
export interface NodeState {
  name: string;
  type: string;
  initialValue?: string;
}

// Node effect
export interface NodeEffect {
  name: string;
  dependencies: string[];
  cleanup: boolean;
}

// Node data
export interface NodeData {
  label: string;
  type: NodeType;
  description?: string;
  props?: NodeProp[];
  state?: NodeState[];
  effects?: NodeEffect[];
}

// Architecture node
export interface ArchitectureNode {
  id: string;
  type: NodeType;
  position: Position;
  data: NodeData;
  parentId?: string;
}

// Edge data
export interface EdgeData {
  type: EdgeType;
  label?: string;
  animated?: boolean;
}

// Architecture edge
export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  data: EdgeData;
  animated?: boolean;
}

// Full architecture entity
export interface Architecture {
  id: string;
  userId: string;
  name: string;
  type: ArchitectureType;
  description: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create architecture request
export interface CreateArchitectureRequest {
  name: string;
  type: ArchitectureType;
  description: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

// Update architecture request (partial)
export interface UpdateArchitectureRequest {
  name?: string;
  type?: ArchitectureType;
  description?: string;
  nodes?: ArchitectureNode[];
  edges?: ArchitectureEdge[];
}

// Architecture list response
export type ArchitectureListResponse = PaginatedResponse<Architecture>;
