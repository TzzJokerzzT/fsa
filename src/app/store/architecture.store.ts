import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';
import type { ArchitectureTemplate } from '@/features/templates';
import type {
  Architecture,
  ArchitectureEdge,
  ArchitectureId,
  ArchitectureNode,
  ArchitectureType,
  EdgeData,
  EdgeId,
  NodeData,
  NodeId,
  Position,
} from '@/shared/types';
import { generateId } from '@/shared/utils/id';

/**
 * Architecture Store - Manages architecture diagrams
 * Follows Single Responsibility: Only handles architecture data
 */

interface ArchitectureState {
  // Data
  architectures: Record<ArchitectureId, Architecture>;
  currentArchitectureId: ArchitectureId | null;

  // Selection
  selectedNodeIds: Set<NodeId>;
  selectedEdgeIds: Set<EdgeId>;

  // Computed
  currentArchitecture: Architecture | null;
}

interface ArchitectureActions {
  // Architecture CRUD
  createArchitecture: (
    name: string,
    type: ArchitectureType,
    description?: string,
  ) => ArchitectureId;
  deleteArchitecture: (id: ArchitectureId) => void;
  setCurrentArchitecture: (id: ArchitectureId | null) => void;
  updateArchitectureName: (id: ArchitectureId, name: string) => void;

  // Node Operations
  addNode: (node: Omit<ArchitectureNode, 'id'>) => NodeId;
  updateNode: (id: NodeId, data: Partial<NodeData>) => void;
  updateNodePosition: (id: NodeId, position: Position) => void;
  deleteNode: (id: NodeId) => void;
  deleteSelectedNodes: () => void;

  // Edge Operations
  addEdge: (edge: Omit<ArchitectureEdge, 'id'>) => EdgeId;
  updateEdge: (id: EdgeId, data: Partial<EdgeData>) => void;
  deleteEdge: (id: EdgeId) => void;
  deleteSelectedEdges: () => void;

  // Selection
  selectNode: (id: NodeId, addToSelection?: boolean) => void;
  selectEdge: (id: EdgeId, addToSelection?: boolean) => void;
  clearSelection: () => void;
  selectAll: () => void;

  // Bulk Operations
  setNodes: (nodes: ArchitectureNode[]) => void;
  setEdges: (edges: ArchitectureEdge[]) => void;

  // Import/Export
  importArchitecture: (architecture: Architecture) => void;
  exportCurrentArchitecture: () => Architecture | null;

  // Templates
  loadFromTemplate: (template: ArchitectureTemplate) => ArchitectureId;

  // API Sync
  importFromApi: (architectures: Architecture[]) => void;
  replaceArchitectureId: (oldId: ArchitectureId, newId: ArchitectureId) => void;
  clearAllArchitectures: () => void;
}

type ArchitectureStore = ArchitectureState & ArchitectureActions;

const initialState: ArchitectureState = {
  architectures: {},
  currentArchitectureId: null,
  selectedNodeIds: new Set(),
  selectedEdgeIds: new Set(),
  currentArchitecture: null,
};

export const useArchitectureStore = create<ArchitectureStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // ==================== Architecture CRUD ====================

        createArchitecture: (name, type, description = '') => {
          const id = generateId();
          const now = new Date();

          set((state) => {
            state.architectures[id] = {
              id,
              name,
              type,
              description,
              nodes: [],
              edges: [],
              createdAt: now,
              updatedAt: now,
            };
            state.currentArchitectureId = id;
            state.currentArchitecture = state.architectures[id];
          });

          return id;
        },

        deleteArchitecture: (id) =>
          set((state) => {
            delete state.architectures[id];
            if (state.currentArchitectureId === id) {
              const remaining = Object.keys(state.architectures);
              state.currentArchitectureId = remaining[0] || null;
              state.currentArchitecture = remaining[0]
                ? state.architectures[remaining[0]]
                : null;
            }
          }),

        setCurrentArchitecture: (id) =>
          set((state) => {
            state.currentArchitectureId = id;
            state.currentArchitecture = id ? state.architectures[id] : null;
            state.selectedNodeIds = new Set();
            state.selectedEdgeIds = new Set();
          }),

        updateArchitectureName: (id, name) =>
          set((state) => {
            if (state.architectures[id]) {
              state.architectures[id].name = name;
              state.architectures[id].updatedAt = new Date();
            }
          }),

        // ==================== Node Operations ====================

        addNode: (nodeData) => {
          const id = generateId();

          set((state) => {
            const archId = state.currentArchitectureId;
            if (!archId || !state.architectures[archId]) return;

            const node: ArchitectureNode = {
              ...nodeData,
              id,
            };

            state.architectures[archId].nodes.push(node);
            state.architectures[archId].updatedAt = new Date();
            state.currentArchitecture = state.architectures[archId];
          });

          return id;
        },

        updateNode: (id, data) =>
          set((state) => {
            const archId = state.currentArchitectureId;
            if (!archId || !state.architectures[archId]) return;

            const node = state.architectures[archId].nodes.find(
              (n) => n.id === id,
            );
            if (node) {
              node.data = { ...node.data, ...data };
              state.architectures[archId].updatedAt = new Date();
              state.currentArchitecture = state.architectures[archId];
            }
          }),

        updateNodePosition: (id, position) =>
          set((state) => {
            const archId = state.currentArchitectureId;
            if (!archId || !state.architectures[archId]) return;

            const node = state.architectures[archId].nodes.find(
              (n) => n.id === id,
            );
            if (node) {
              node.position = position;
              state.currentArchitecture = state.architectures[archId];
            }
          }),

        deleteNode: (id) =>
          set((state) => {
            const archId = state.currentArchitectureId;
            if (!archId || !state.architectures[archId]) return;

            // Remove node
            state.architectures[archId].nodes = state.architectures[
              archId
            ].nodes.filter((n) => n.id !== id);

            // Remove connected edges
            state.architectures[archId].edges = state.architectures[
              archId
            ].edges.filter((e) => e.source !== id && e.target !== id);

            state.architectures[archId].updatedAt = new Date();
            state.currentArchitecture = state.architectures[archId];
            state.selectedNodeIds.delete(id);
          }),

        deleteSelectedNodes: () => {
          const { selectedNodeIds } = get();
          set((state) => {
            const archId = state.currentArchitectureId;
            if (!archId || !state.architectures[archId]) return;

            const nodesToDelete = selectedNodeIds;

            // Remove nodes
            state.architectures[archId].nodes = state.architectures[
              archId
            ].nodes.filter((n) => !nodesToDelete.has(n.id));

            // Remove connected edges
            state.architectures[archId].edges = state.architectures[
              archId
            ].edges.filter(
              (e) =>
                !nodesToDelete.has(e.source) && !nodesToDelete.has(e.target),
            );

            state.architectures[archId].updatedAt = new Date();
            state.currentArchitecture = state.architectures[archId];
            state.selectedNodeIds = new Set();
          });
        },

        // ==================== Edge Operations ====================

        addEdge: (edgeData) => {
          const id = generateId();

          set((state) => {
            const archId = state.currentArchitectureId;
            if (!archId || !state.architectures[archId]) return;

            // Check if edge already exists
            const exists = state.architectures[archId].edges.some(
              (e) =>
                e.source === edgeData.source && e.target === edgeData.target,
            );

            if (!exists) {
              const edge: ArchitectureEdge = {
                ...edgeData,
                id,
              };

              state.architectures[archId].edges.push(edge);
              state.architectures[archId].updatedAt = new Date();
              state.currentArchitecture = state.architectures[archId];
            }
          });

          return id;
        },

        updateEdge: (id, data) =>
          set((state) => {
            const archId = state.currentArchitectureId;
            if (!archId || !state.architectures[archId]) return;

            const edge = state.architectures[archId].edges.find(
              (e) => e.id === id,
            );
            if (edge) {
              edge.data = { ...edge.data, ...data };
              state.architectures[archId].updatedAt = new Date();
              state.currentArchitecture = state.architectures[archId];
            }
          }),

        deleteEdge: (id) =>
          set((state) => {
            const archId = state.currentArchitectureId;
            if (!archId || !state.architectures[archId]) return;

            state.architectures[archId].edges = state.architectures[
              archId
            ].edges.filter((e) => e.id !== id);
            state.architectures[archId].updatedAt = new Date();
            state.currentArchitecture = state.architectures[archId];
            state.selectedEdgeIds.delete(id);
          }),

        deleteSelectedEdges: () => {
          const { selectedEdgeIds } = get();
          set((state) => {
            const archId = state.currentArchitectureId;
            if (!archId || !state.architectures[archId]) return;

            state.architectures[archId].edges = state.architectures[
              archId
            ].edges.filter((e) => !selectedEdgeIds.has(e.id));

            state.architectures[archId].updatedAt = new Date();
            state.currentArchitecture = state.architectures[archId];
            state.selectedEdgeIds = new Set();
          });
        },

        // ==================== Selection ====================

        selectNode: (id, addToSelection = false) =>
          set((state) => {
            if (addToSelection) {
              if (state.selectedNodeIds.has(id)) {
                state.selectedNodeIds.delete(id);
              } else {
                state.selectedNodeIds.add(id);
              }
            } else {
              state.selectedNodeIds = new Set([id]);
              state.selectedEdgeIds = new Set();
            }
          }),

        selectEdge: (id, addToSelection = false) =>
          set((state) => {
            if (addToSelection) {
              if (state.selectedEdgeIds.has(id)) {
                state.selectedEdgeIds.delete(id);
              } else {
                state.selectedEdgeIds.add(id);
              }
            } else {
              state.selectedEdgeIds = new Set([id]);
              state.selectedNodeIds = new Set();
            }
          }),

        clearSelection: () =>
          set((state) => {
            state.selectedNodeIds = new Set();
            state.selectedEdgeIds = new Set();
          }),

        selectAll: () =>
          set((state) => {
            const archId = state.currentArchitectureId;
            if (!archId || !state.architectures[archId]) return;

            state.selectedNodeIds = new Set(
              state.architectures[archId].nodes.map((n) => n.id),
            );
          }),

        // ==================== Bulk Operations ====================

        setNodes: (nodes) =>
          set((state) => {
            const archId = state.currentArchitectureId;
            if (!archId || !state.architectures[archId]) return;

            state.architectures[archId].nodes = nodes;
            state.currentArchitecture = state.architectures[archId];
          }),

        setEdges: (edges) =>
          set((state) => {
            const archId = state.currentArchitectureId;
            if (!archId || !state.architectures[archId]) return;

            state.architectures[archId].edges = edges;
            state.currentArchitecture = state.architectures[archId];
          }),

        // ==================== Import/Export ====================

        importArchitecture: (architecture) =>
          set((state) => {
            const id = generateId();
            state.architectures[id] = {
              ...architecture,
              id,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            state.currentArchitectureId = id;
            state.currentArchitecture = state.architectures[id];
          }),

        exportCurrentArchitecture: () => {
          const { currentArchitecture } = get();
          return currentArchitecture;
        },

        // ==================== Templates ====================

        loadFromTemplate: (template) => {
          const archId = generateId();
          const now = new Date();

          // Create ID mapping for nodes (template uses placeholder IDs)
          const nodeIdMap = new Map<string, string>();

          // Generate real IDs for nodes
          const nodes: ArchitectureNode[] = template.nodes.map(
            (node, index) => {
              const realId = generateId();
              // Map placeholder ID to real ID
              nodeIdMap.set(`node-${index}`, realId);
              return {
                ...node,
                id: realId,
              } as ArchitectureNode;
            },
          );

          // Map edges with real node IDs
          const edges: ArchitectureEdge[] = template.edges.map((edge) => ({
            id: generateId(),
            source: nodeIdMap.get(edge.source) || edge.source,
            target: nodeIdMap.get(edge.target) || edge.target,
            data: edge.data,
          }));

          set((state) => {
            state.architectures[archId] = {
              id: archId,
              name: template.name,
              type: template.type,
              description: template.description,
              nodes,
              edges,
              createdAt: now,
              updatedAt: now,
            };
            state.currentArchitectureId = archId;
            state.currentArchitecture = state.architectures[archId];
            state.selectedNodeIds = new Set();
            state.selectedEdgeIds = new Set();
          });

          return archId;
        },

        // ==================== API Sync ====================

        importFromApi: (architectures) =>
          set((state) => {
            // Merge API architectures with local ones (API takes precedence)
            for (const arch of architectures) {
              state.architectures[arch.id] = arch;
            }

            // If no current architecture is set, set the first one
            if (
              !state.currentArchitectureId ||
              !state.architectures[state.currentArchitectureId]
            ) {
              const firstId = Object.keys(state.architectures)[0] || null;
              state.currentArchitectureId = firstId;
              state.currentArchitecture = firstId
                ? state.architectures[firstId]
                : null;
            } else {
              // Update current architecture reference
              state.currentArchitecture =
                state.architectures[state.currentArchitectureId];
            }
          }),

        replaceArchitectureId: (oldId, newId) =>
          set((state) => {
            const architecture = state.architectures[oldId];
            if (!architecture) return;

            // Create new entry with new ID
            state.architectures[newId] = {
              ...architecture,
              id: newId,
            };

            // Remove old entry
            delete state.architectures[oldId];

            // Update current architecture reference if needed
            if (state.currentArchitectureId === oldId) {
              state.currentArchitectureId = newId;
              state.currentArchitecture = state.architectures[newId];
            }
          }),

        clearAllArchitectures: () =>
          set((state) => {
            state.architectures = {};
            state.currentArchitectureId = null;
            state.currentArchitecture = null;
            state.selectedNodeIds = new Set();
            state.selectedEdgeIds = new Set();
          }),
      })),
      {
        name: 'fas-architecture-store',
        version: 1,
        partialize: (state) => ({
          // Only persist data, not UI state like selection
          architectures: state.architectures,
          currentArchitectureId: state.currentArchitectureId,
        }),
        onRehydrateStorage: () => (state) => {
          // Restore computed state after rehydration
          if (state?.currentArchitectureId && state.architectures) {
            state.currentArchitecture =
              state.architectures[state.currentArchitectureId] || null;
          }
        },
      },
    ),
    { name: 'ArchitectureStore' },
  ),
);

// Selector hooks for optimized re-renders
export const useCurrentArchitecture = () =>
  useArchitectureStore((state) => state.currentArchitecture);

export const useSelectedNodeIds = () =>
  useArchitectureStore((state) => state.selectedNodeIds);

export const useSelectedEdgeIds = () =>
  useArchitectureStore((state) => state.selectedEdgeIds);

export const useArchitectureList = () =>
  useArchitectureStore(
    useShallow((state) => Object.values(state.architectures)),
  );
