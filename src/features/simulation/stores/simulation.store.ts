import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  ArchitectureEdge,
  EdgeId,
  NodeId,
  SimulationEvent,
} from '@/shared/types';
import { generateId } from '@/shared/utils/id';

/**
 * Simulation Store - Manages data flow simulation state
 * Follows Single Responsibility: Only handles simulation logic
 */

export type SimulationSpeed = 0.5 | 1 | 2 | 4;

export interface DataPacket {
  id: string;
  edgeId: EdgeId;
  sourceNodeId: NodeId;
  targetNodeId: NodeId;
  type: 'props' | 'state' | 'event' | 'api' | 'context';
  payload?: unknown;
  progress: number; // 0 to 1
  createdAt: number;
}

interface SimulationState {
  // Playback
  isRunning: boolean;
  isPaused: boolean;
  speed: SimulationSpeed;

  // Active packets (data flowing through edges)
  activePackets: DataPacket[];

  // Highlighted elements
  highlightedNodeIds: Set<NodeId>;
  highlightedEdgeIds: Set<EdgeId>;

  // Event log
  events: SimulationEvent[];
  maxEvents: number;

  // Simulation mode
  mode: 'automatic' | 'manual' | 'step';
}

interface SimulationActions {
  // Playback controls
  start: () => void;
  pause: () => void;
  stop: () => void;
  setSpeed: (speed: SimulationSpeed) => void;
  togglePlayPause: () => void;

  // Packet management
  createPacket: (edge: ArchitectureEdge, payload?: unknown) => string;
  updatePacketProgress: (packetId: string, progress: number) => void;
  removePacket: (packetId: string) => void;
  clearAllPackets: () => void;

  // Highlighting
  highlightNode: (nodeId: NodeId) => void;
  unhighlightNode: (nodeId: NodeId) => void;
  highlightEdge: (edgeId: EdgeId) => void;
  unhighlightEdge: (edgeId: EdgeId) => void;
  clearHighlights: () => void;

  // Events
  addEvent: (event: Omit<SimulationEvent, 'id' | 'timestamp'>) => void;
  clearEvents: () => void;

  // Mode
  setMode: (mode: SimulationState['mode']) => void;

  // Step simulation
  stepForward: () => void;
}

type SimulationStore = SimulationState & SimulationActions;

const initialState: SimulationState = {
  isRunning: false,
  isPaused: false,
  speed: 1,
  activePackets: [],
  highlightedNodeIds: new Set(),
  highlightedEdgeIds: new Set(),
  events: [],
  maxEvents: 100,
  mode: 'automatic',
};

export const useSimulationStore = create<SimulationStore>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      // ==================== Playback Controls ====================

      start: () =>
        set((state) => {
          state.isRunning = true;
          state.isPaused = false;
        }),

      pause: () =>
        set((state) => {
          state.isPaused = true;
        }),

      stop: () =>
        set((state) => {
          state.isRunning = false;
          state.isPaused = false;
          state.activePackets = [];
          state.highlightedNodeIds = new Set();
          state.highlightedEdgeIds = new Set();
        }),

      setSpeed: (speed) =>
        set((state) => {
          state.speed = speed;
        }),

      togglePlayPause: () =>
        set((state) => {
          if (!state.isRunning) {
            state.isRunning = true;
            state.isPaused = false;
          } else {
            state.isPaused = !state.isPaused;
          }
        }),

      // ==================== Packet Management ====================

      createPacket: (edge, payload) => {
        const id = generateId();
        const packet: DataPacket = {
          id,
          edgeId: edge.id,
          sourceNodeId: edge.source,
          targetNodeId: edge.target,
          type: edge.data.type,
          payload,
          progress: 0,
          createdAt: Date.now(),
        };

        set((state) => {
          state.activePackets.push(packet);
          state.highlightedEdgeIds.add(edge.id);
          state.highlightedNodeIds.add(edge.source);
        });

        return id;
      },

      updatePacketProgress: (packetId, progress) =>
        set((state) => {
          const packet = state.activePackets.find((p) => p.id === packetId);
          if (packet) {
            packet.progress = Math.min(1, Math.max(0, progress));

            // When packet reaches destination, highlight target node
            if (packet.progress >= 1) {
              state.highlightedNodeIds.add(packet.targetNodeId);
            }
          }
        }),

      removePacket: (packetId) =>
        set((state) => {
          const packet = state.activePackets.find((p) => p.id === packetId);
          if (packet) {
            state.highlightedEdgeIds.delete(packet.edgeId);
          }
          state.activePackets = state.activePackets.filter(
            (p) => p.id !== packetId,
          );
        }),

      clearAllPackets: () =>
        set((state) => {
          state.activePackets = [];
          state.highlightedEdgeIds = new Set();
        }),

      // ==================== Highlighting ====================

      highlightNode: (nodeId) =>
        set((state) => {
          state.highlightedNodeIds.add(nodeId);
        }),

      unhighlightNode: (nodeId) =>
        set((state) => {
          state.highlightedNodeIds.delete(nodeId);
        }),

      highlightEdge: (edgeId) =>
        set((state) => {
          state.highlightedEdgeIds.add(edgeId);
        }),

      unhighlightEdge: (edgeId) =>
        set((state) => {
          state.highlightedEdgeIds.delete(edgeId);
        }),

      clearHighlights: () =>
        set((state) => {
          state.highlightedNodeIds = new Set();
          state.highlightedEdgeIds = new Set();
        }),

      // ==================== Events ====================

      addEvent: (eventData) =>
        set((state) => {
          const event: SimulationEvent = {
            ...eventData,
            id: generateId(),
            timestamp: Date.now(),
          };

          state.events.unshift(event);

          // Keep only the last N events
          if (state.events.length > state.maxEvents) {
            state.events = state.events.slice(0, state.maxEvents);
          }
        }),

      clearEvents: () =>
        set((state) => {
          state.events = [];
        }),

      // ==================== Mode ====================

      setMode: (mode) =>
        set((state) => {
          state.mode = mode;
        }),

      stepForward: () => {
        // In step mode, this would advance the simulation by one step
        // Implementation depends on the specific simulation logic
        const { isRunning, isPaused } = get();
        if (isRunning && isPaused) {
          // Trigger one step of the simulation
          // This is handled by the useSimulation hook
        }
      },
    })),
    { name: 'SimulationStore' },
  ),
);

// Selector hooks for optimized re-renders
export const useSimulationRunning = () =>
  useSimulationStore((state) => state.isRunning);

export const useSimulationPaused = () =>
  useSimulationStore((state) => state.isPaused);

export const useSimulationSpeed = () =>
  useSimulationStore((state) => state.speed);

export const useActivePackets = () =>
  useSimulationStore((state) => state.activePackets);

export const useHighlightedNodes = () =>
  useSimulationStore((state) => state.highlightedNodeIds);

export const useHighlightedEdges = () =>
  useSimulationStore((state) => state.highlightedEdgeIds);

export const useSimulationEvents = () =>
  useSimulationStore((state) => state.events);
