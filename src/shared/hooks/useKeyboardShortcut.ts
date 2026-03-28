import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for keyboard shortcuts
 * Follows client-event-listeners pattern - deduplicates listeners
 */

type KeyboardModifiers = {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
};

type ShortcutConfig = {
  key: string;
  modifiers?: KeyboardModifiers;
  callback: () => void;
  preventDefault?: boolean;
};

export function useKeyboardShortcut(shortcuts: ShortcutConfig[]) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    for (const shortcut of shortcutsRef.current) {
      const { key, modifiers = {}, callback, preventDefault = true } = shortcut;

      const matchesKey = event.key.toLowerCase() === key.toLowerCase();
      const matchesCtrl = modifiers.ctrl
        ? event.ctrlKey || event.metaKey
        : !event.ctrlKey && !event.metaKey;
      const matchesShift = modifiers.shift ? event.shiftKey : !event.shiftKey;
      const matchesAlt = modifiers.alt ? event.altKey : !event.altKey;

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
        return;
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Simple single shortcut hook
 */
export function useHotkey(
  key: string,
  callback: () => void,
  modifiers?: KeyboardModifiers,
) {
  useKeyboardShortcut([{ key, callback, modifiers }]);
}
