import { motion } from 'framer-motion';
import { Pause, Play, SkipForward, Square, Zap } from 'lucide-react';
import { memo, useCallback } from 'react';
import { cn } from '@/shared/lib/cn';
import { Button, Tooltip } from '@/shared/ui';
import {
  type SimulationSpeed,
  useSimulationStore,
} from '../stores/simulation.store';

/**
 * SimulationControls - Control panel for data flow simulation
 * Includes play/pause, stop, speed controls, and step mode
 */

const speedOptions: { value: SimulationSpeed; label: string }[] = [
  { value: 0.5, label: '0.5x' },
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 4, label: '4x' },
];

interface SimulationControlsProps {
  className?: string;
  compact?: boolean;
}

function SimulationControlsComponent({
  className,
  compact = false,
}: SimulationControlsProps) {
  const {
    isRunning,
    isPaused,
    speed,
    mode,
    activePackets,
    stop,
    setSpeed,
    togglePlayPause,
    setMode,
    stepForward,
  } = useSimulationStore();

  const handleSpeedChange = useCallback(
    (newSpeed: SimulationSpeed) => {
      setSpeed(newSpeed);
    },
    [setSpeed],
  );

  const cycleSpeed = useCallback(() => {
    const currentIndex = speedOptions.findIndex((opt) => opt.value === speed);
    const nextIndex = (currentIndex + 1) % speedOptions.length;
    setSpeed(speedOptions[nextIndex].value);
  }, [speed, setSpeed]);

  // Compact view (for toolbar)
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-lg',
          'bg-surface-200/90 backdrop-blur-sm border border-surface-400',
          className,
        )}
      >
        <Tooltip content={isRunning && !isPaused ? 'Pause' : 'Play'}>
          <Button
            variant={isRunning && !isPaused ? 'primary' : 'ghost'}
            size="icon-sm"
            onClick={togglePlayPause}
          >
            {isRunning && !isPaused ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </Button>
        </Tooltip>

        {isRunning && (
          <>
            <Tooltip content="Stop">
              <Button variant="ghost" size="icon-sm" onClick={stop}>
                <Square className="w-3.5 h-3.5" />
              </Button>
            </Tooltip>

            <Tooltip content={`Speed: ${speed}x`}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={cycleSpeed}
                className="text-xs font-mono min-w-[32px]"
              >
                {speed}x
              </Button>
            </Tooltip>
          </>
        )}

        {/* Active packets indicator */}
        {activePackets.length > 0 && (
          <div className="flex items-center gap-1 ml-1">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
              className="w-2 h-2 rounded-full bg-accent"
            />
            <span className="text-xs text-text-muted">
              {activePackets.length}
            </span>
          </div>
        )}
      </motion.div>
    );
  }

  // Full control panel
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-xl',
        'bg-surface-200 border border-surface-400',
        'shadow-lg',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-text-primary">Simulation</h3>
        </div>
        <div
          className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium',
            isRunning && !isPaused
              ? 'bg-success/20 text-success'
              : isPaused
                ? 'bg-warning/20 text-warning'
                : 'bg-surface-400 text-text-muted',
          )}
        >
          {isRunning ? (isPaused ? 'Paused' : 'Running') : 'Stopped'}
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Tooltip content="Stop">
          <Button
            variant="ghost"
            size="icon"
            onClick={stop}
            disabled={!isRunning}
          >
            <Square className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Tooltip content={isRunning && !isPaused ? 'Pause' : 'Play'}>
          <Button
            variant="primary"
            size="icon"
            onClick={togglePlayPause}
            className="w-12 h-12"
          >
            {isRunning && !isPaused ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>
        </Tooltip>

        <Tooltip content="Step Forward">
          <Button
            variant="ghost"
            size="icon"
            onClick={stepForward}
            disabled={!isRunning || !isPaused}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>

      {/* Speed Control */}
      <div className="mb-4">
        <span className="block text-xs text-text-muted mb-2">Speed</span>
        <div className="flex gap-1">
          {speedOptions.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => handleSpeedChange(opt.value)}
              className={cn(
                'flex-1 py-1.5 text-xs font-medium rounded-lg',
                'transition-colors duration-150',
                speed === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-surface-300 text-text-secondary hover:bg-surface-400',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Selector */}
      <div className="mb-4">
        <span className="block text-xs text-text-muted mb-2">Mode</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode('automatic')}
            className={cn(
              'flex-1 py-1.5 text-xs font-medium rounded-lg',
              'transition-colors duration-150',
              mode === 'automatic'
                ? 'bg-primary text-white'
                : 'bg-surface-300 text-text-secondary hover:bg-surface-400',
            )}
          >
            Auto
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={cn(
              'flex-1 py-1.5 text-xs font-medium rounded-lg',
              'transition-colors duration-150',
              mode === 'manual'
                ? 'bg-primary text-white'
                : 'bg-surface-300 text-text-secondary hover:bg-surface-400',
            )}
          >
            Manual
          </button>
          <button
            type="button"
            onClick={() => setMode('step')}
            className={cn(
              'flex-1 py-1.5 text-xs font-medium rounded-lg',
              'transition-colors duration-150',
              mode === 'step'
                ? 'bg-primary text-white'
                : 'bg-surface-300 text-text-secondary hover:bg-surface-400',
            )}
          >
            Step
          </button>
        </div>
      </div>

      {/* Active Packets */}
      {activePackets.length > 0 && (
        <div className="pt-3 border-t border-surface-400">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Active Data Packets</span>
            <span className="font-medium text-accent">
              {activePackets.length}
            </span>
          </div>
          <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
            {activePackets.slice(0, 5).map((packet) => (
              <motion.div
                key={packet.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 text-xs"
              >
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    packet.type === 'props' && 'bg-blue-500',
                    packet.type === 'state' && 'bg-green-500',
                    packet.type === 'event' && 'bg-amber-500',
                    packet.type === 'api' && 'bg-purple-500',
                    packet.type === 'context' && 'bg-cyan-500',
                  )}
                />
                <span className="text-text-secondary truncate flex-1">
                  {packet.type}
                </span>
                <span className="text-text-muted">
                  {Math.round(packet.progress * 100)}%
                </span>
              </motion.div>
            ))}
            {activePackets.length > 5 && (
              <span className="text-xs text-text-muted">
                +{activePackets.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export const SimulationControls = memo(SimulationControlsComponent);
