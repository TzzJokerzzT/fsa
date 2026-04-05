import type { EdgeProps } from '@xyflow/react';
import { BaseEdge, getSmoothStepPath } from '@xyflow/react';
import { motion } from 'framer-motion';
import { memo } from 'react';
import type { EdgeDirection, EdgeType } from '@/shared/types';
import {
  useActivePackets,
  useHighlightedEdges,
} from '../stores/simulation.store';

/**
 * AnimatedEdge - Custom React Flow edge with data flow animation
 * Shows flowing particles when data is being transmitted
 * Supports directional arrows and reversed animation
 */

interface AnimatedEdgeData {
  type: EdgeType;
  label?: string;
  direction?: EdgeDirection;
}

const edgeColors: Record<EdgeType, string> = {
  props: '#3b82f6',
  state: '#22c55e',
  event: '#f59e0b',
  import: '#8b5cf6',
  context: '#06b6d4',
};

function AnimatedEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<AnimatedEdgeData>) {
  const highlightedEdgeIds = useHighlightedEdges();
  const activePackets = useActivePackets();

  const isHighlighted = highlightedEdgeIds.has(id);
  const packetsOnEdge = activePackets.filter((p) => p.edgeId === id);

  const edgeType = data?.type || 'props';
  const color = edgeColors[edgeType];
  const direction = data?.direction || 'source-to-target';

  // Dash animation offset based on direction
  // Negative = source-to-target, Positive = target-to-source
  const dashTarget = direction === 'target-to-source' ? 16 : -16;

  // Calculate edge path
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  return (
    <>
      {/* Background edge (wider, for highlighting) */}
      {isHighlighted && (
        <BaseEdge
          id={`${id}-glow`}
          path={edgePath}
          style={{
            stroke: color,
            strokeWidth: 8,
            strokeOpacity: 0.2,
          }}
        />
      )}

      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke:
            isHighlighted || selected ? color : 'var(--color-surface-500)',
          strokeWidth: isHighlighted || selected ? 3 : 2,
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
      />

      {/* Animated flow indicator (dashed line moving) */}
      {isHighlighted && (
        <>
          <motion.path
            d={edgePath}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeDasharray="8 8"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: dashTarget }}
            transition={{
              duration: 0.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
            style={{ opacity: 0.6 }}
          />
          {direction === 'bidirectional' && (
            <motion.path
              d={edgePath}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeDasharray="8 8"
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: 16 }}
              transition={{
                duration: 0.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              }}
              style={{ opacity: 0.35 }}
            />
          )}
        </>
      )}

      {/* Data packets (circles moving along the path) */}
      {packetsOnEdge.map((packet) => {
        // Reverse packet progress for target-to-source edges
        const progress =
          direction === 'target-to-source'
            ? (1 - packet.progress) * 100
            : packet.progress * 100;

        return (
          <motion.g key={packet.id}>
            {/* Packet glow */}
            <motion.circle
              r={8}
              fill={color}
              opacity={0.3}
              initial={{ offsetDistance: '0%' }}
              animate={{ offsetDistance: `${progress}%` }}
              style={{
                offsetPath: `path("${edgePath}")`,
              }}
            />
            {/* Packet core */}
            <motion.circle
              r={5}
              fill={color}
              initial={{ offsetDistance: '0%' }}
              animate={{ offsetDistance: `${progress}%` }}
              style={{
                offsetPath: `path("${edgePath}")`,
                filter: 'drop-shadow(0 0 4px currentColor)',
              }}
            />
            {/* Inner highlight */}
            <motion.circle
              r={2}
              fill="white"
              opacity={0.8}
              initial={{ offsetDistance: '0%' }}
              animate={{ offsetDistance: `${progress}%` }}
              style={{
                offsetPath: `path("${edgePath}")`,
              }}
            />
          </motion.g>
        );
      })}

      {/* Edge label */}
      {data?.label && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x={-20}
            y={-10}
            width={40}
            height={20}
            rx={4}
            fill="var(--color-surface-200)"
            stroke="var(--color-surface-400)"
          />
          <text
            className="text-[10px] fill-text-secondary"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {data.label}
          </text>
        </g>
      )}

      {/* Edge type indicator (small badge) */}
      <g transform={`translate(${labelX}, ${labelY + (data?.label ? 18 : 0)})`}>
        <rect
          x={-16}
          y={-8}
          width={32}
          height={16}
          rx={8}
          fill={color}
          opacity={0.15}
        />
        <text
          className="text-[8px] font-medium"
          fill={color}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {edgeType}
        </text>
      </g>
    </>
  );
}

export const AnimatedEdge = memo(AnimatedEdgeComponent);
