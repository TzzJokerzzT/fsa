import { useId, useState } from 'react';
import type { NodeProp } from '@/shared/types';
import { Button, Input, Modal, ModalFooter, Select } from '@/shared/ui';

/**
 * Modal for adding a new prop to a node
 * Follows Single Responsibility: Only handles prop creation
 */

interface AddPropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (prop: NodeProp) => void;
  existingProps?: NodeProp[];
}

const TYPE_OPTIONS = [
  { value: 'string', label: 'string' },
  { value: 'number', label: 'number' },
  { value: 'boolean', label: 'boolean' },
  { value: 'object', label: 'object' },
  { value: 'array', label: 'array' },
  { value: 'function', label: 'function' },
  { value: 'ReactNode', label: 'ReactNode' },
  { value: 'unknown', label: 'unknown' },
];

export function AddPropModal({
  isOpen,
  onClose,
  onAdd,
  existingProps = [],
}: AddPropModalProps) {
  const formId = useId();
  const [name, setName] = useState('');
  const [type, setType] = useState('string');
  const [required, setRequired] = useState(false);
  const [defaultValue, setDefaultValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Prop name is required');
      return;
    }

    // Check for duplicate names
    if (existingProps.some((p) => p.name === trimmedName)) {
      setError('A prop with this name already exists');
      return;
    }

    // Validate name format (valid JS identifier)
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(trimmedName)) {
      setError('Invalid prop name. Use valid JavaScript identifier.');
      return;
    }

    const newProp: NodeProp = {
      name: trimmedName,
      type,
      required,
      defaultValue: defaultValue.trim() || undefined,
    };

    onAdd(newProp);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setType('string');
    setRequired(false);
    setDefaultValue('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Prop"
      description="Define a new prop for this component"
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
          placeholder="e.g., onClick, title, items"
          error={error || undefined}
          autoFocus
        />

        <Select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={TYPE_OPTIONS}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`${formId}-required`}
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
            className="w-4 h-4 rounded border-surface-500 bg-surface-300 text-primary focus:ring-primary focus:ring-offset-0"
          />
          <label
            htmlFor={`${formId}-required`}
            className="text-sm text-text-primary"
          >
            Required prop
          </label>
        </div>

        {!required && (
          <Input
            label="Default Value"
            value={defaultValue}
            onChange={(e) => setDefaultValue(e.target.value)}
            placeholder="e.g., null, '', false"
            helperText="Optional default value for the prop"
          />
        )}

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Add Prop</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
