/**
 * SaveIndicator - Visual feedback for auto-save status
 * Single Responsibility: Display save state to user
 */

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Cloud, CloudOff, Loader2 } from 'lucide-react';
import type { AutoSaveStatus } from '@/shared/api/hooks';
import { cn } from '@/shared/lib/cn';
import { Tooltip } from './Tooltip';

interface SaveIndicatorProps {
  /** Current auto-save status */
  status: AutoSaveStatus;
  /** Last saved timestamp */
  lastSavedAt: Date | null;
  /** Additional class names */
  className?: string;
  /** Whether to show the timestamp */
  showTimestamp?: boolean;
}

const statusConfig: Record<
  AutoSaveStatus,
  {
    icon: React.ElementType;
    label: string;
    color: string;
    animate?: boolean;
  }
> = {
  idle: {
    icon: Cloud,
    label: 'All changes saved',
    color: 'text-text-muted',
  },
  pending: {
    icon: Cloud,
    label: 'Changes pending...',
    color: 'text-warning',
  },
  saving: {
    icon: Loader2,
    label: 'Saving...',
    color: 'text-primary',
    animate: true,
  },
  saved: {
    icon: Check,
    label: 'Saved',
    color: 'text-success',
  },
  error: {
    icon: AlertCircle,
    label: 'Save failed',
    color: 'text-error',
  },
  offline: {
    icon: CloudOff,
    label: 'Offline',
    color: 'text-warning',
  },
};

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Less than a minute ago
  if (diff < 60000) {
    return 'Just now';
  }

  // Less than an hour ago
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Today
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Yesterday or earlier
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function SaveIndicator({
  status,
  lastSavedAt,
  className,
  showTimestamp = true,
}: SaveIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const tooltipContent =
    status === 'error'
      ? 'Failed to save. Will retry automatically.'
      : status === 'offline'
        ? 'You are offline. Changes will sync when connected.'
        : lastSavedAt && status === 'idle'
          ? `Last saved ${formatTimestamp(lastSavedAt)}`
          : config.label;

  return (
    <Tooltip content={tooltipContent} position="bottom">
      <div
        className={cn(
          'flex items-center gap-1.5 text-xs font-medium transition-colors duration-200',
          config.color,
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={status}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <Icon
              className={cn('w-4 h-4', config.animate && 'animate-spin')}
              aria-hidden="true"
            />
          </motion.span>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.span
            key={`${status}-${lastSavedAt?.getTime()}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="whitespace-nowrap"
          >
            {status === 'idle' && showTimestamp && lastSavedAt
              ? formatTimestamp(lastSavedAt)
              : config.label}
          </motion.span>
        </AnimatePresence>
      </div>
    </Tooltip>
  );
}
