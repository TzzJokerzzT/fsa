const STORAGE_PREFIX = 'fas_'; // Frontend Architecture Simulator
const STORAGE_VERSION = 1;

interface StorageSchema<T> {
  version: number;
  data: T;
  updatedAt: number;
}

/**
 * Type-safe localStorage wrapper with versioning
 * Follows client-localstorage-schema best practice
 */
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!item) return defaultValue;

      const parsed: StorageSchema<T> = JSON.parse(item);

      // Check version compatibility
      if (parsed.version !== STORAGE_VERSION) {
        // Migration could be handled here
        return defaultValue;
      }

      return parsed.data;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      const schema: StorageSchema<T> = {
        version: STORAGE_VERSION,
        data: value,
        updatedAt: Date.now(),
      };
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(schema));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  },

  clear(): void {
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith(STORAGE_PREFIX),
    );
    for (const key of keys) {
      localStorage.removeItem(key);
    }
  },
};
