/**
 * Core types for the Frontend Architecture Simulator
 * Following Interface Segregation Principle (ISP) - small, specific interfaces
 */

// ==================== Base Types ====================

export type NodeId = string;
export type EdgeId = string;
export type ArchitectureId = string;

// ==================== Architecture Types ====================

export type ArchitectureType =
  | 'monolithic'
  | 'modular'
  | 'feature-based'
  | 'atomic-design'
  | 'microfrontends'
  | 'clean-architecture'
  | 'hexagonal'
  | 'vertical-slice';

export interface Architecture {
  id: ArchitectureId;
  name: string;
  type: ArchitectureType;
  description: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Node Types ====================

export type NodeType =
  | 'component'
  | 'module'
  | 'state'
  | 'effect'
  | 'api'
  | 'hook'
  | 'context'
  | 'util';

export interface Position {
  x: number;
  y: number;
}

export interface NodeData {
  label: string;
  type: NodeType;
  description?: string;
  props?: NodeProp[];
  state?: NodeState[];
  effects?: NodeEffect[];
}

export interface ArchitectureNode {
  id: NodeId;
  type: NodeType;
  position: Position;
  data: NodeData;
  parentId?: NodeId;
  selected?: boolean;
  dragging?: boolean;
}

// ==================== Edge Types ====================

export type EdgeType = 'props' | 'state' | 'event' | 'import' | 'context';

export type EdgeDirection =
  | 'source-to-target'
  | 'target-to-source'
  | 'bidirectional';

export interface EdgeData {
  type: EdgeType;
  label?: string;
  animated?: boolean;
  direction?: EdgeDirection;
}

export type HandlePosition = 'top' | 'right' | 'bottom' | 'left';
export type HandleId =
  | 'top-source'
  | 'top-target'
  | 'right-source'
  | 'right-target'
  | 'bottom-source'
  | 'bottom-target'
  | 'left-source'
  | 'left-target';

export interface ArchitectureEdge {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  sourceHandle?: HandleId | HandlePosition;
  targetHandle?: HandleId | HandlePosition;
  data: EdgeData;
  animated?: boolean;
}

// ==================== Node Properties ====================

export interface NodeProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

export interface NodeState {
  name: string;
  type: string;
  initialValue?: string;
}

export interface NodeEffect {
  name: string;
  dependencies: string[];
  cleanup: boolean;
}

// ==================== Simulation Types ====================

export interface SimulationEvent {
  id: string;
  type: 'prop-change' | 'state-update' | 'effect-trigger' | 'api-call';
  sourceNodeId: NodeId;
  targetNodeId?: NodeId;
  payload: unknown;
  timestamp: number;
}

export interface SimulationState {
  isRunning: boolean;
  speed: number; // 0.5x, 1x, 2x
  events: SimulationEvent[];
  currentEventIndex: number;
}

// ==================== UI Types ====================

export type Theme = 'dark' | 'light' | 'system';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// ==================== Store Types ====================

export interface AppState {
  theme: Theme;
  sidebarOpen: boolean;
  currentArchitectureId: ArchitectureId | null;
}

export interface ArchitectureState {
  architectures: Map<ArchitectureId, Architecture>;
  selectedNodeId: NodeId | null;
  selectedEdgeId: EdgeId | null;
}
