import { motion } from 'framer-motion';
import {
  type ArrowRight,
  ArrowRightLeft,
  Box,
  Database,
  FileInput,
  MessageSquare,
  MoveLeft,
  MoveRight,
  Share2,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import type { EdgeDirection, EdgeType } from '@/shared/types';
import { Button, Input, Modal, ModalFooter } from '@/shared/ui';

/**
 * Modal for selecting the type of connection when creating an edge
 */

interface ConnectionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: EdgeType, label?: string, direction?: EdgeDirection) => void;
  sourceLabel?: string;
  targetLabel?: string;
}

interface ConnectionOption {
  type: EdgeType;
  label: string;
  description: string;
  icon: typeof ArrowRight;
  color: string;
}

const connectionOptions: ConnectionOption[] = [
  {
    type: 'props',
    label: 'Props',
    description: 'Pass data down via component props',
    icon: Box,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  {
    type: 'state',
    label: 'State',
    description: 'Share state between components',
    icon: Database,
    color: 'text-green-400 bg-green-500/10 border-green-500/30',
  },
  {
    type: 'event',
    label: 'Event',
    description: 'Emit events or callbacks',
    icon: MessageSquare,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    type: 'context',
    label: 'Context',
    description: 'React Context provider/consumer',
    icon: Share2,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  {
    type: 'import',
    label: 'Import',
    description: 'Module import/dependency',
    icon: FileInput,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
];

export function ConnectionTypeModal({
  isOpen,
  onClose,
  onSelect,
  sourceLabel,
  targetLabel,
}: ConnectionTypeModalProps) {
  const [selectedType, setSelectedType] = useState<EdgeType | null>(null);
  const [edgeLabel, setEdgeLabel] = useState('');
  const [direction, setDirection] = useState<EdgeDirection>('source-to-target');

  const handleSelect = (type: EdgeType) => {
    setSelectedType(type);
  };

  const handleConfirm = () => {
    if (selectedType) {
      onSelect(selectedType, edgeLabel.trim() || undefined, direction);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedType(null);
    setEdgeLabel('');
    setDirection('source-to-target');
    onClose();
  };

  const handleDoubleClick = (type: EdgeType) => {
    onSelect(type, undefined, direction);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Connection Type"
      description={
        sourceLabel && targetLabel
          ? `${sourceLabel} → ${targetLabel}`
          : 'Choose how these components are connected'
      }
      size="md"
    >
      <div className="space-y-4">
        {/* Connection Type Options */}
        <div className="grid gap-2">
          {connectionOptions.map((option, index) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.type;

            return (
              <motion.button
                key={option.type}
                type="button"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(option.type)}
                onDoubleClick={() => handleDoubleClick(option.type)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border-2 text-left',
                  'transition-all duration-150',
                  'hover:bg-surface-300',
                  isSelected
                    ? option.color
                    : 'border-transparent bg-surface-300/50',
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-lg',
                    isSelected ? 'bg-white/10' : 'bg-surface-400',
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5',
                      isSelected
                        ? option.color.split(' ')[0]
                        : 'text-text-secondary',
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'font-medium',
                      isSelected ? 'text-text-primary' : 'text-text-secondary',
                    )}
                  >
                    {option.label}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {option.description}
                  </p>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-current"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Optional Label */}
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            {/* Direction Selector */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-text-primary">
                Direction
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    {
                      value: 'source-to-target',
                      label: sourceLabel || 'Source',
                      sublabel: targetLabel || 'Target',
                      icon: MoveRight,
                    },
                    {
                      value: 'target-to-source',
                      label: targetLabel || 'Target',
                      sublabel: sourceLabel || 'Source',
                      icon: MoveLeft,
                    },
                    {
                      value: 'bidirectional',
                      label: 'Both',
                      sublabel: 'directions',
                      icon: ArrowRightLeft,
                    },
                  ] as const
                ).map((opt) => {
                  const Icon = opt.icon;
                  const isActive = direction === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDirection(opt.value)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all duration-150',
                        isActive
                          ? 'border-accent-500 bg-accent-500/10 text-accent-400'
                          : 'border-transparent bg-surface-300/50 hover:bg-surface-300 text-text-secondary',
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] leading-tight truncate w-full text-center">
                        {opt.label}
                      </span>
                      <span className="text-[10px] leading-tight text-text-muted truncate w-full text-center">
                        → {opt.sublabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Input
              label="Label (optional)"
              value={edgeLabel}
              onChange={(e) => setEdgeLabel(e.target.value)}
              placeholder={`e.g., ${selectedType === 'props' ? 'userData' : selectedType === 'event' ? 'onClick' : selectedType === 'state' ? 'isLoading' : ''}`}
              helperText="Add a label to describe this connection"
            />
          </motion.div>
        )}

        <p className="text-xs text-text-muted text-center">
          Double-click an option to select it quickly
        </p>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={!selectedType}>
          Connect
        </Button>
      </ModalFooter>
    </Modal>
  );
}
