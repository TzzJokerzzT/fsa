import {
  Background,
  BackgroundVariant,
  type Connection,
  ConnectionMode,
  Controls,
  type Edge,
  type EdgeChange,
  MiniMap,
  type Node,
  type NodeChange,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { useArchitectureStore, useCurrentArchitecture } from '@/app/store';
import { ConnectionTypeModal } from '@/features/architecture-builder/components/ConnectionTypeModal';
import { EdgePropertiesPanel } from '@/features/architecture-builder/components/EdgePropertiesPanel';
import { NodePalette } from '@/features/architecture-builder/components/NodePalette';
import { PropertiesPanel } from '@/features/architecture-builder/components/PropertiesPanel';
import { StateInspector } from '@/features/inspector';
import {
  AnimatedEdge,
  SimulationControls,
  useSimulation,
} from '@/features/simulation';
import {
  type ArchitectureTemplate,
  TemplateSelector,
} from '@/features/templates';
import { useAutoSave } from '@/shared/api/hooks';
import { useBoolean, useHotkey } from '@/shared/hooks';
import type { ArchitectureType, EdgeType, NodeType } from '@/shared/types';
import {
  Button,
  Input,
  KeyboardShortcutsModal,
  Modal,
  ModalFooter,
  SaveIndicator,
  Select,
  Tooltip,
  useToast,
} from '@/shared/ui';
import '@xyflow/react/dist/style.css';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Database,
  Download,
  FileStack,
  HelpCircle,
  Plus,
  Upload,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { nodeTypes } from './utils/NodeTypes';
import { toReactFlowEdges } from './utils/ReactFlowEdges';
import { toReactFlowNodes } from './utils/ReactFlowNodes';

/**
 * Builder Page - Main architecture editor with React Flow
 */
// Custom edge types mapping
const edgeTypes = {
  animated: AnimatedEdge,
};

function BuilderContent() {
  const { architectureId } = useParams();
  const navigate = useNavigate();
  const { screenToFlowPosition } = useReactFlow();

  // Store
  const architecture = useCurrentArchitecture();
  const {
    createArchitecture,
    setCurrentArchitecture,
    addNode,
    addEdge: storeAddEdge,
    updateNodePosition,
    deleteSelectedNodes,
    deleteSelectedEdges,
    selectedNodeIds,
    selectedEdgeIds,
    selectNode,
    selectEdge,
    clearSelection,
    exportCurrentArchitecture,
    importArchitecture,
    loadFromTemplate,
  } = useArchitectureStore();
  const toast = useToast();

  // Auto-save hook - saves architecture changes automatically
  const autoSave = useAutoSave({
    debounceMs: 2000,
    enabled: !!architecture,
    onSaveError: (error) => {
      toast.error('Auto-save failed', error.message);
    },
  });

  // Local state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const createModal = useBoolean(false);
  const templateSelector = useBoolean(false);
  const inspectorOpen = useBoolean(false);
  const helpModal = useBoolean(false);
  const connectionTypeModal = useBoolean(false);
  const [newArchName, setNewArchName] = useState('');
  const [newArchType, setNewArchType] = useState<ArchitectureType>('modular');
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(
    null,
  );

  // Simulation
  useSimulation({
    edges: architecture?.edges || [],
    enabled: !!architecture,
  });

  // Sync architecture to React Flow
  useEffect(() => {
    if (architecture) {
      setNodes(toReactFlowNodes(architecture.nodes));
      setEdges(toReactFlowEdges(architecture.edges));
    }
  }, [architecture, setNodes, setEdges]);

  // Load architecture by ID
  useEffect(() => {
    if (architectureId) {
      setCurrentArchitecture(architectureId);
    }
  }, [architectureId, setCurrentArchitecture]);

  useEffect(() => {
    document.title = 'FSA | Builder';
  }, []);

  // Handle node changes
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      // Sync position changes back to store
      for (const change of changes) {
        if (change.type === 'position' && change.position && !change.dragging) {
          updateNodePosition(change.id, change.position);
        }
      }
    },
    [onNodesChange, updateNodePosition],
  );

  // Handle edge changes
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
    },
    [onEdgesChange],
  );

  // Handle new connections - opens modal to select connection type
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        setPendingConnection(connection);
        connectionTypeModal.setTrue();
      }
    },
    [connectionTypeModal],
  );

  // Create the edge after user selects connection type
  const handleConnectionTypeSelect = useCallback(
    (type: EdgeType, label?: string) => {
      if (pendingConnection?.source && pendingConnection?.target) {
        storeAddEdge({
          source: pendingConnection.source,
          target: pendingConnection.target,
          sourceHandle: pendingConnection.sourceHandle || undefined,
          targetHandle: pendingConnection.targetHandle || undefined,
          data: { type, label },
        });
      }
      setPendingConnection(null);
    },
    [pendingConnection, storeAddEdge],
  );

  // Cancel connection
  const handleConnectionTypeCancel = useCallback(() => {
    setPendingConnection(null);
    connectionTypeModal.setFalse();
  }, [connectionTypeModal]);

  // Get node labels for the modal
  const getNodeLabel = useCallback(
    (nodeId: string | null) => {
      if (!nodeId || !architecture) return undefined;
      const node = architecture.nodes.find((n) => n.id === nodeId);
      return node?.data.label;
    },
    [architecture],
  );

  // Handle node click
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode],
  );

  // Handle edge click - select edge for editing
  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      selectEdge(edge.id);
    },
    [selectEdge],
  );

  // Handle edge reconnection - when user drags edge endpoint to new node
  const handleReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      if (newConnection.source && newConnection.target) {
        // First, get the existing edge data
        const existingEdge = architecture?.edges.find(
          (e) => e.id === oldEdge.id,
        );
        if (!existingEdge) return;

        // Delete old edge and create new one with same data but new connections
        const { deleteEdge, addEdge } = useArchitectureStore.getState();
        deleteEdge(oldEdge.id);
        addEdge({
          source: newConnection.source,
          target: newConnection.target,
          sourceHandle: newConnection.sourceHandle || undefined,
          targetHandle: newConnection.targetHandle || undefined,
          data: existingEdge.data,
        });
      }
    },
    [architecture],
  );

  // Handle pane click
  const handlePaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // Handle drop from palette - places node at mouse position
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!architecture) return;

      const type = event.dataTransfer.getData(
        'application/reactflow',
      ) as NodeType;
      if (!type) return;

      // Convert screen coordinates to flow coordinates (handles zoom and pan)
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Offset to center the node on the cursor
      const centeredPosition = {
        x: position.x - 75, // Half of node width (~150px)
        y: position.y - 25, // Half of node height (~50px)
      };

      addNode({
        type,
        position: centeredPosition,
        data: {
          label: `New ${type}`,
          type,
        },
      });
    },
    [architecture, addNode, screenToFlowPosition],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Create new architecture
  const handleCreateArchitecture = useCallback(() => {
    if (!newArchName.trim()) return;
    const id = createArchitecture(newArchName, newArchType);
    setNewArchName('');
    createModal.setFalse();
    navigate(`/builder/${id}`);
  }, [newArchName, newArchType, createArchitecture, navigate, createModal]);

  // Export architecture as JSON
  const handleExport = useCallback(() => {
    const data = exportCurrentArchitecture();
    if (!data) {
      toast.warning('No architecture to export');
      return;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.name.replace(/\s+/g, '-').toLowerCase()}-architecture.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Architecture exported', `Saved as ${a.download}`);
  }, [exportCurrentArchitecture, toast]);

  // Import architecture from JSON file
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Basic validation
        if (
          !data.name ||
          !data.type ||
          !Array.isArray(data.nodes) ||
          !Array.isArray(data.edges)
        ) {
          throw new Error('Invalid architecture file format');
        }

        importArchitecture(data);
        toast.success(
          'Architecture imported',
          `Loaded "${data.name}" with ${data.nodes.length} nodes`,
        );
      } catch (error) {
        console.error('Failed to import architecture:', error);
        toast.error(
          'Import failed',
          error instanceof Error ? error.message : 'Invalid file format',
        );
      }
    };
    input.click();
  }, [importArchitecture, toast]);

  // Handle template selection
  const handleTemplateSelect = useCallback(
    (template: ArchitectureTemplate) => {
      const id = loadFromTemplate(template);
      navigate(`/builder/${id}`);
      toast.success(
        'Template loaded',
        `Created "${template.name}" with ${template.nodes.length} nodes`,
      );
    },
    [loadFromTemplate, navigate, toast],
  );

  // Handle delete key - delete selected nodes or edges
  const handleDelete = useCallback(() => {
    if (selectedNodeIds.size > 0) {
      deleteSelectedNodes();
    } else if (selectedEdgeIds.size > 0) {
      deleteSelectedEdges();
    }
  }, [
    selectedNodeIds,
    selectedEdgeIds,
    deleteSelectedNodes,
    deleteSelectedEdges,
  ]);

  // Keyboard shortcuts
  useHotkey('Delete', handleDelete);
  useHotkey('Backspace', handleDelete);
  useHotkey('i', inspectorOpen.toggle, { ctrl: true }); // Ctrl+I to toggle inspector
  useHotkey('e', handleExport, { ctrl: true }); // Ctrl+E to export
  useHotkey('o', handleImport, { ctrl: true }); // Ctrl+O to import
  useHotkey('t', templateSelector.toggle, { ctrl: true }); // Ctrl+T to open templates
  useHotkey('?', helpModal.setTrue); // ? to show help

  // Architecture type options
  const archTypeOptions = useMemo(
    () => [
      { value: 'monolithic', label: 'Monolithic SPA' },
      { value: 'modular', label: 'Modular' },
      { value: 'feature-based', label: 'Feature-Based' },
      { value: 'atomic-design', label: 'Atomic Design' },
      { value: 'microfrontends', label: 'Microfrontends' },
      { value: 'clean-architecture', label: 'Clean Architecture' },
    ],
    [],
  );

  // Empty state
  if (!architecture) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-300 flex items-center justify-center">
            <Plus className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">
            No Architecture Selected
          </h2>
          <p className="text-text-secondary max-w-sm">
            Create a new architecture, start from a template, or select an
            existing one from the sidebar.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={templateSelector.setTrue}>
              <FileStack className="w-4 h-4 mr-2" />
              From Template
            </Button>
            <Button onClick={createModal.setTrue}>
              <Plus className="w-4 h-4 mr-2" />
              Create Blank
            </Button>
          </div>
        </motion.div>

        {/* Create Modal */}
        <Modal
          isOpen={createModal.value}
          onClose={createModal.setFalse}
          title="Create New Architecture"
        >
          <div className="space-y-4">
            <Input
              label="Name"
              value={newArchName}
              onChange={(e) => setNewArchName(e.target.value)}
              placeholder="My Architecture"
              autoFocus
            />
            <Select
              label="Type"
              value={newArchType}
              onChange={(e) =>
                setNewArchType(e.target.value as ArchitectureType)
              }
              options={archTypeOptions}
            />
          </div>
          <ModalFooter>
            <Button variant="ghost" onClick={createModal.setFalse}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateArchitecture}
              disabled={!newArchName.trim()}
            >
              Create
            </Button>
          </ModalFooter>
        </Modal>

        {/* Template Selector */}
        <TemplateSelector
          isOpen={templateSelector.value}
          onClose={templateSelector.setFalse}
          onSelect={handleTemplateSelect}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Node Palette */}
      <NodePalette />

      {/* Canvas - drop zone for draggable nodes */}
      <div
        role="application"
        aria-label="Architecture builder canvas"
        className="flex-1 relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onPaneClick={handlePaneClick}
          onReconnect={handleReconnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          edgesReconnectable
          fitView
          snapToGrid
          snapGrid={[16, 16]}
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'animated',
            animated: false,
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={16}
            size={1}
            color="var(--color-surface-400)"
          />
          <Controls
            showZoom
            showFitView
            showInteractive={false}
            position="bottom-right"
          />
          <MiniMap
            nodeStrokeWidth={3}
            position="bottom-left"
            pannable
            zoomable
          />

          {/* Toolbar Panel */}
          <Panel position="top-right" className="flex gap-2">
            {/* Simulation Controls */}
            <SimulationControls compact />

            <div className="w-px h-8 bg-surface-400" />

            <Tooltip content="Templates (Ctrl+T)" position="bottom">
              <Button
                variant="secondary"
                size="icon"
                onClick={templateSelector.setTrue}
              >
                <FileStack className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Export (Ctrl+E)" position="bottom">
              <Button variant="secondary" size="icon" onClick={handleExport}>
                <Download className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Import (Ctrl+O)" position="bottom">
              <Button variant="secondary" size="icon" onClick={handleImport}>
                <Upload className="w-4 h-4" />
              </Button>
            </Tooltip>

            <div className="w-px h-8 bg-surface-400" />

            <Tooltip content="Inspector (Ctrl+I)" position="bottom">
              <Button
                variant={inspectorOpen.value ? 'primary' : 'secondary'}
                size="icon"
                onClick={inspectorOpen.toggle}
              >
                <Database className="w-4 h-4" />
              </Button>
            </Tooltip>

            <Tooltip content="Help (?)" position="bottom">
              <Button
                variant="secondary"
                size="icon"
                onClick={helpModal.setTrue}
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </Tooltip>
          </Panel>

          {/* Architecture Name & Save Status */}
          <Panel
            position="top-left"
            className="bg-surface-200/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-surface-400"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-text-primary">
                  {architecture.name}
                </h2>
                <p className="text-xs text-text-muted capitalize">
                  {architecture.type}
                </p>
              </div>
              <SaveIndicator
                status={autoSave.status}
                lastSavedAt={autoSave.lastSavedAt}
              />
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Properties Panel - Show node or edge panel based on selection */}
      <AnimatePresence>
        {selectedNodeIds.size > 0 && <PropertiesPanel />}
        {selectedEdgeIds.size > 0 && selectedNodeIds.size === 0 && (
          <EdgePropertiesPanel />
        )}
      </AnimatePresence>

      {/* State Inspector */}
      <StateInspector
        isOpen={inspectorOpen.value}
        onClose={inspectorOpen.setFalse}
      />

      {/* Template Selector */}
      <TemplateSelector
        isOpen={templateSelector.value}
        onClose={templateSelector.setFalse}
        onSelect={handleTemplateSelect}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsModal
        isOpen={helpModal.value}
        onClose={helpModal.setFalse}
      />

      {/* Connection Type Selector */}
      <ConnectionTypeModal
        isOpen={connectionTypeModal.value}
        onClose={handleConnectionTypeCancel}
        onSelect={handleConnectionTypeSelect}
        sourceLabel={getNodeLabel(pendingConnection?.source ?? null)}
        targetLabel={getNodeLabel(pendingConnection?.target ?? null)}
      />
    </div>
  );
}

// Wrapper component that provides ReactFlowProvider
export default function Builder() {
  return (
    <ReactFlowProvider>
      <BuilderContent />
    </ReactFlowProvider>
  );
}
