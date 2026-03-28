import { useCallback, useState } from 'react';

/**
 * Custom hook for managing boolean state
 * Common pattern for modals, drawers, etc.
 */
export function useBoolean(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((v) => !v), []);

  return {
    value,
    setValue,
    setTrue,
    setFalse,
    toggle,
  };
}
