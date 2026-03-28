import { useCallback, useEffect, useRef } from 'react';
import type { ArchitectureEdge } from '@/shared/types';
import { useSimulationStore } from '../stores/simulation.store';

/**
 * useSimulation - Hook for managing data flow simulation
 * Handles automatic packet generation and movement
 */

interface UseSimulationOptions {
  edges: ArchitectureEdge[];
  enabled?: boolean;
  packetDuration?: number; // Base duration in ms for packet to travel
}

export function useSimulation({
  edges,
  enabled = true,
  packetDuration = 2000,
}: UseSimulationOptions) {
  const isRunning = useSimulationStore((state) => state.isRunning);
  const isPaused = useSimulationStore((state) => state.isPaused);
  const speed = useSimulationStore((state) => state.speed);
  const mode = useSimulationStore((state) => state.mode);
  const activePackets = useSimulationStore((state) => state.activePackets);

  // Get stable action references (these don't change between renders)
  const createPacket = useSimulationStore((state) => state.createPacket);
  const updatePacketProgress = useSimulationStore(
    (state) => state.updatePacketProgress,
  );
  const removePacket = useSimulationStore((state) => state.removePacket);
  const clearAllPackets = useSimulationStore((state) => state.clearAllPackets);
  const addEvent = useSimulationStore((state) => state.addEvent);

  // Animation frame reference
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Store refs for values needed in animation loop to avoid stale closures
  const speedRef = useRef(speed);
  const packetsRef = useRef(activePackets);

  // Update refs when values change
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    packetsRef.current = activePackets;
  }, [activePackets]);

  // Animation loop - uses refs to avoid dependency issues
  useEffect(() => {
    if (!enabled || !isRunning || isPaused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimeRef.current = 0;
      return;
    }

    const animate = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }

      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Use refs to get current values without causing re-renders
      const currentPackets = packetsRef.current;
      const currentSpeed = speedRef.current;
      const adjustedDelta = deltaTime * currentSpeed;

      for (const packet of currentPackets) {
        const progressIncrement = adjustedDelta / packetDuration;
        const newProgress = packet.progress + progressIncrement;

        if (newProgress >= 1) {
          // Packet reached destination
          addEvent({
            type:
              packet.type === 'api'
                ? 'api-call'
                : packet.type === 'state'
                  ? 'state-update'
                  : packet.type === 'event'
                    ? 'effect-trigger'
                    : 'prop-change',
            sourceNodeId: packet.sourceNodeId,
            targetNodeId: packet.targetNodeId,
            payload: packet.payload,
          });

          // Remove packet after a short delay
          setTimeout(() => removePacket(packet.id), 200);
        } else {
          updatePacketProgress(packet.id, newProgress);
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [
    enabled,
    isRunning,
    isPaused,
    packetDuration,
    addEvent,
    removePacket,
    updatePacketProgress,
  ]);

  // Automatic packet generation
  useEffect(() => {
    if (!enabled || !isRunning || isPaused || mode !== 'automatic') {
      return;
    }

    if (edges.length === 0) return;

    // Generate packets at random intervals
    const generatePacket = () => {
      const randomEdge = edges[Math.floor(Math.random() * edges.length)];
      createPacket(randomEdge);
    };

    // Initial packet after a short delay
    const initialTimeout = setTimeout(generatePacket, 500);

    // Generate new packets periodically
    const intervalDuration = Math.max(800, packetDuration / (speed * 2));
    const interval = setInterval(generatePacket, intervalDuration);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [
    enabled,
    isRunning,
    isPaused,
    mode,
    edges,
    speed,
    packetDuration,
    createPacket,
  ]);

  // Trigger packet manually
  const triggerPacket = useCallback(
    (edge: ArchitectureEdge, payload?: unknown) => {
      return createPacket(edge, payload);
    },
    [createPacket],
  );

  // Trigger packet from a specific node (sends to all connected edges)
  const triggerFromNode = useCallback(
    (nodeId: string, payload?: unknown) => {
      const connectedEdges = edges.filter((e) => e.source === nodeId);
      return connectedEdges.map((edge) => createPacket(edge, payload));
    },
    [edges, createPacket],
  );

  // Clean up on unmount only (empty dependency array)
  useEffect(() => {
    return () => {
      clearAllPackets();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isRunning,
    isPaused,
    speed,
    activePackets,
    triggerPacket,
    triggerFromNode,
  };
}
