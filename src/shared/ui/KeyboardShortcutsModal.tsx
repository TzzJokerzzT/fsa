import { motion } from 'framer-motion';
import { Keyboard } from 'lucide-react';
import { Modal } from '@/shared/ui';

/**
 * KeyboardShortcutsModal - Displays all available keyboard shortcuts
 */

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Shortcut[];
}

interface Shortcut {
  keys: string[];
  description: string;
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'General',
    shortcuts: [
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Ctrl', 'N'], description: 'Create new architecture' },
      { keys: ['Ctrl', 'T'], description: 'Open template selector' },
      { keys: ['Ctrl', 'E'], description: 'Export architecture' },
      { keys: ['Ctrl', 'O'], description: 'Import architecture' },
      { keys: ['Ctrl', 'I'], description: 'Toggle inspector panel' },
    ],
  },
  {
    title: 'Selection',
    shortcuts: [
      { keys: ['Ctrl', 'A'], description: 'Select all nodes' },
      { keys: ['Escape'], description: 'Clear selection' },
      { keys: ['Shift', 'Click'], description: 'Add to selection' },
    ],
  },
  {
    title: 'Editing',
    shortcuts: [
      { keys: ['Delete'], description: 'Delete selected nodes/edges' },
      { keys: ['Backspace'], description: 'Delete selected nodes/edges' },
      { keys: ['Click node'], description: 'Select node to edit properties' },
      { keys: ['Click edge'], description: 'Select edge to edit connection' },
      {
        keys: ['Drag edge end'],
        description: 'Reconnect edge to another node',
      },
    ],
  },
  {
    title: 'Canvas Navigation',
    shortcuts: [
      { keys: ['Scroll'], description: 'Zoom in/out' },
      { keys: ['Click', 'Drag'], description: 'Pan canvas' },
      { keys: ['F'], description: 'Fit view to canvas' },
    ],
  },
  {
    title: 'Simulation',
    shortcuts: [
      { keys: ['Space'], description: 'Play/Pause simulation' },
      { keys: ['S'], description: 'Stop simulation' },
    ],
  },
];

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      size="lg"
    >
      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        {shortcutGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.05 }}
          >
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-primary" />
              {group.title}
            </h3>
            <div className="space-y-2">
              {group.shortcuts.map((shortcut) => (
                <div
                  key={shortcut.description}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-300/50 hover:bg-surface-300 transition-colors"
                >
                  <span className="text-sm text-text-secondary">
                    {shortcut.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={key}>
                        {keyIndex > 0 && (
                          <span className="text-text-muted mx-1">+</span>
                        )}
                        <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-medium text-text-primary bg-surface-200 border border-surface-500 rounded-md shadow-sm">
                          {key}
                        </kbd>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-surface-400 text-center">
        <p className="text-xs text-text-muted">
          Press{' '}
          <kbd className="px-1.5 py-0.5 text-xs bg-surface-300 border border-surface-500 rounded">
            ?
          </kbd>{' '}
          anytime to show this help
        </p>
      </div>
    </Modal>
  );
}
