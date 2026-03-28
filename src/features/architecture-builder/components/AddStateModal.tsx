import { useId, useState } from 'react';
import type { NodeState } from '@/shared/types';
import { Button, Input, Modal, ModalFooter, Select } from '@/shared/ui';

/**
 * Modal for adding a new state to a node
 * Follows Single Responsibility: Only handles state creation
 */

interface AddStateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (state: NodeState) => void;
  existingState?: NodeState[];
}

const TYPE_OPTIONS = [
  { value: 'string', label: 'string' },
  { value: 'number', label: 'number' },
  { value: 'boolean', label: 'boolean' },
  { value: 'object', label: 'object' },
  { value: 'array', label: 'array' },
  { value: 'null', label: 'null' },
  { value: 'unknown', label: 'unknown' },
];

export function AddStateModal({
  isOpen,
  onClose,
  onAdd,
  existingState = [],
}: AddStateModalProps) {
  const formId = useId();
  const [name, setName] = useState('');
  const [type, setType] = useState('string');
  const [initialValue, setInitialValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('State name is required');
      return;
    }

    // Check for duplicate names
    if (existingState.some((s) => s.name === trimmedName)) {
      setError('A state with this name already exists');
      return;
    }

    // Validate name format (valid JS identifier)
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(trimmedName)) {
      setError('Invalid state name. Use valid JavaScript identifier.');
      return;
    }

    const newState: NodeState = {
      name: trimmedName,
      type,
      initialValue: initialValue.trim() || undefined,
    };

    onAdd(newState);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setType('string');
    setInitialValue('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add State"
      description="Define a new state variable for this component"
      size="sm"
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder="e.g., isOpen, count, items"
          error={error || undefined}
          autoFocus
        />

        <Select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={TYPE_OPTIONS}
        />

        <Input
          label="Initial Value"
          value={initialValue}
          onChange={(e) => setInitialValue(e.target.value)}
          placeholder="e.g., false, 0, []"
          helperText="Optional initial value for the state"
        />

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Add State</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
