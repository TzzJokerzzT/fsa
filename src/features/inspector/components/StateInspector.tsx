import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  Layers,
  X,
} from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useArchitectureStore, useCurrentArchitecture } from '@/app/store';
import { useSimulationStore } from '@/features/simulation';
import { cn } from '@/shared/lib/cn';
import { Button, Divider, Tooltip } from '@/shared/ui';

/**
 * StateInspector - Real-time visualization of application state
 * Shows current architecture data, simulation events, and store state
 */

interface InspectorSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const sections: InspectorSection[] = [
  {
    id: 'architecture',
    label: 'Architecture',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: 'simulation',
    label: 'Simulation',
    icon: <Activity className="w-4 h-4" />,
  },
  { id: 'events', label: 'Event Log', icon: <Clock className="w-4 h-4" /> },
  { id: 'store', label: 'Store', icon: <Database className="w-4 h-4" /> },
];

interface StateInspectorProps {
  isOpen: boolean;
  onClose: () => void;
}

// JSON tree viewer component
function JsonTree({
  data,
  name,
  depth = 0,
}: {
  data: unknown;
  name?: string;
  depth?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  if (data === null) {
    return (
      <div className="flex items-center gap-2 py-0.5">
        {name && <span className="text-purple-400">{name}:</span>}
        <span className="text-text-muted italic">null</span>
      </div>
    );
  }

  if (data === undefined) {
    return (
      <div className="flex items-center gap-2 py-0.5">
        {name && <span className="text-purple-400">{name}:</span>}
        <span className="text-text-muted italic">undefined</span>
      </div>
    );
  }

  if (typeof data === 'boolean') {
    return (
      <div className="flex items-center gap-2 py-0.5">
        {name && <span className="text-purple-400">{name}:</span>}
        <span className="text-amber-400">{data.toString()}</span>
      </div>
    );
  }

  if (typeof data === 'number') {
    return (
      <div className="flex items-center gap-2 py-0.5">
        {name && <span className="text-purple-400">{name}:</span>}
        <span className="text-cyan-400">{data}</span>
      </div>
    );
  }

  if (typeof data === 'string') {
    return (
      <div className="flex items-center gap-2 py-0.5">
        {name && <span className="text-purple-400">{name}:</span>}
        <span className="text-green-400">
          "{data.length > 50 ? `${data.slice(0, 50)}...` : data}"
        </span>
      </div>
    );
  }

  if (Array.isArray(data)) {
    return (
      <div className="py-0.5">
        <button
          type="button"
          onClick={toggleExpand}
          className="flex items-center gap-1 hover:bg-surface-300 rounded px-1 -ml-1"
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-text-muted" />
          ) : (
            <ChevronRight className="w-3 h-3 text-text-muted" />
          )}
          {name && <span className="text-purple-400">{name}:</span>}
          <span className="text-text-muted">Array[{data.length}]</span>
        </button>
        {isExpanded && (
          <div className="ml-4 border-l border-surface-400 pl-2">
            {data.slice(0, 10).map((item, index) => (
              <JsonTree
                key={index}
                data={item}
                name={String(index)}
                depth={depth + 1}
              />
            ))}
            {data.length > 10 && (
              <span className="text-text-muted text-xs">
                ... {data.length - 10} more items
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>);
    return (
      <div className="py-0.5">
        <button
          type="button"
          onClick={toggleExpand}
          className="flex items-center gap-1 hover:bg-surface-300 rounded px-1 -ml-1"
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-text-muted" />
          ) : (
            <ChevronRight className="w-3 h-3 text-text-muted" />
          )}
          {name && <span className="text-purple-400">{name}:</span>}
          <span className="text-text-muted">Object{`{${entries.length}}`}</span>
        </button>
        {isExpanded && (
          <div className="ml-4 border-l border-surface-400 pl-2">
            {entries.slice(0, 20).map(([key, value]) => (
              <JsonTree key={key} data={value} name={key} depth={depth + 1} />
            ))}
            {entries.length > 20 && (
              <span className="text-text-muted text-xs">
                ... {entries.length - 20} more properties
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-0.5">
      {name && <span className="text-purple-400">{name}:</span>}
      <span className="text-text-muted">{String(data)}</span>
    </div>
  );
}

function StateInspectorComponent({ isOpen, onClose }: StateInspectorProps) {
  const [activeSection, setActiveSection] = useState('architecture');
  const architecture = useCurrentArchitecture();

  // Use individual selectors to avoid unnecessary re-renders
  const isRunning = useSimulationStore((s) => s.isRunning);
  const isPaused = useSimulationStore((s) => s.isPaused);
  const speed = useSimulationStore((s) => s.speed);
  const mode = useSimulationStore((s) => s.mode);
  const activePackets = useSimulationStore((s) => s.activePackets);
  const highlightedNodeIds = useSimulationStore((s) => s.highlightedNodeIds);
  const highlightedEdgeIds = useSimulationStore((s) => s.highlightedEdgeIds);
  const events = useSimulationStore((s) => s.events);

  // Get architecture store state (excluding functions)
  const architectures = useArchitectureStore((s) => s.architectures);
  const currentArchitectureId = useArchitectureStore(
    (s) => s.currentArchitectureId,
  );
  const selectedNodeIds = useArchitectureStore((s) => s.selectedNodeIds);
  const selectedEdgeIds = useArchitectureStore((s) => s.selectedEdgeIds);

  // Memoize computed values for store display
  const simulationStateDisplay = useMemo(
    () => ({
      isRunning,
      isPaused,
      speed,
      mode,
      activePackets: activePackets.length,
      highlightedNodes: Array.from(highlightedNodeIds),
      highlightedEdges: Array.from(highlightedEdgeIds),
    }),
    [
      isRunning,
      isPaused,
      speed,
      mode,
      activePackets.length,
      highlightedNodeIds,
      highlightedEdgeIds,
    ],
  );

  const architectureStoreDisplay = useMemo(
    () => ({
      currentArchitectureId,
      architecturesCount: Object.keys(architectures).length,
      selectedNodeIds: Array.from(selectedNodeIds),
      selectedEdgeIds: Array.from(selectedEdgeIds),
    }),
    [architectures, currentArchitectureId, selectedNodeIds, selectedEdgeIds],
  );

  const simulationStoreDisplay = useMemo(
    () => ({
      isRunning,
      isPaused,
      speed,
      mode,
      activePacketsCount: activePackets.length,
      eventsCount: events.length,
    }),
    [isRunning, isPaused, speed, mode, activePackets.length, events.length],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            'fixed right-0 top-0 bottom-0 w-96 z-50',
            'bg-surface-100 border-l border-surface-400',
            'flex flex-col shadow-2xl',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-surface-400">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-text-primary">
                State Inspector
              </h2>
            </div>
            <Tooltip content="Close">
              <Button variant="ghost" size="icon-sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>

          {/* Section tabs */}
          <div className="flex border-b border-surface-400">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5',
                  'text-xs font-medium transition-colors',
                  activeSection === section.id
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-text-muted hover:text-text-secondary hover:bg-surface-200',
                )}
              >
                {section.icon}
                <span className="hidden sm:inline">{section.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeSection === 'architecture' && (
              <div className="space-y-4">
                {architecture ? (
                  <>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-text-primary">
                        Current Architecture
                      </h3>
                      <div className="bg-surface-200 rounded-lg p-3">
                        <p className="text-sm text-text-primary font-medium">
                          {architecture.name}
                        </p>
                        <p className="text-xs text-text-muted capitalize">
                          {architecture.type}
                        </p>
                      </div>
                    </div>

                    <Divider />

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-text-primary">
                        Nodes ({architecture.nodes.length})
                      </h3>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {architecture.nodes.map((node) => (
                          <div
                            key={node.id}
                            className="flex items-center justify-between bg-surface-200 rounded px-2 py-1.5"
                          >
                            <span className="text-sm text-text-primary truncate">
                              {node.data.label}
                            </span>
                            <span className="text-xs text-text-muted capitalize bg-surface-300 px-1.5 py-0.5 rounded">
                              {node.type}
                            </span>
                          </div>
                        ))}
                        {architecture.nodes.length === 0 && (
                          <p className="text-sm text-text-muted">
                            No nodes yet
                          </p>
                        )}
                      </div>
                    </div>

                    <Divider />

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-text-primary">
                        Edges ({architecture.edges.length})
                      </h3>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {architecture.edges.map((edge) => (
                          <div
                            key={edge.id}
                            className="flex items-center gap-2 bg-surface-200 rounded px-2 py-1.5 text-xs"
                          >
                            <span className="text-text-muted truncate">
                              {edge.source.slice(0, 8)}
                            </span>
                            <span className="text-text-muted">→</span>
                            <span className="text-text-muted truncate">
                              {edge.target.slice(0, 8)}
                            </span>
                            <span className="ml-auto text-text-muted capitalize bg-surface-300 px-1.5 py-0.5 rounded">
                              {edge.data.type}
                            </span>
                          </div>
                        ))}
                        {architecture.edges.length === 0 && (
                          <p className="text-sm text-text-muted">
                            No edges yet
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Layers className="w-12 h-12 text-text-muted mx-auto mb-3" />
                    <p className="text-text-muted">No architecture selected</p>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'simulation' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-text-primary">
                    Simulation State
                  </h3>
                  <div className="font-mono text-xs bg-surface-200 rounded-lg p-3">
                    <JsonTree data={simulationStateDisplay} />
                  </div>
                </div>

                <Divider />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-text-primary">
                    Active Packets ({activePackets.length})
                  </h3>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {activePackets.map((packet) => (
                      <motion.div
                        key={packet.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-surface-200 rounded px-2 py-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-text-primary capitalize">
                            {packet.type}
                          </span>
                          <span className="text-text-muted">
                            {Math.round(packet.progress * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-surface-400 rounded-full h-1 mt-1">
                          <div
                            className="bg-primary h-1 rounded-full transition-all"
                            style={{ width: `${packet.progress * 100}%` }}
                          />
                        </div>
                      </motion.div>
                    ))}
                    {activePackets.length === 0 && (
                      <p className="text-sm text-text-muted">
                        No active packets
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'events' && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-text-primary">
                  Recent Events ({events.length})
                </h3>
                <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {events.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-surface-200 rounded px-2 py-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'font-medium',
                            event.type === 'prop-change' && 'text-blue-400',
                            event.type === 'state-update' && 'text-green-400',
                            event.type === 'effect-trigger' && 'text-amber-400',
                            event.type === 'api-call' && 'text-purple-400',
                          )}
                        >
                          {event.type}
                        </span>
                        <span className="text-text-muted">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-text-muted truncate mt-0.5">
                        {event.sourceNodeId.slice(0, 8)} →{' '}
                        {event.targetNodeId?.slice(0, 8) || '?'}
                      </p>
                    </motion.div>
                  ))}
                  {events.length === 0 && (
                    <p className="text-sm text-text-muted">
                      No events yet. Start the simulation!
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'store' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-text-primary">
                    Architecture Store
                  </h3>
                  <div className="font-mono text-xs bg-surface-200 rounded-lg p-3 overflow-x-auto">
                    <JsonTree data={architectureStoreDisplay} />
                  </div>
                </div>

                <Divider />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-text-primary">
                    Simulation Store
                  </h3>
                  <div className="font-mono text-xs bg-surface-200 rounded-lg p-3 overflow-x-auto">
                    <JsonTree data={simulationStoreDisplay} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-surface-400 bg-surface-200">
            <p className="text-xs text-text-muted text-center">
              Real-time state visualization
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const StateInspector = memo(StateInspectorComponent);
